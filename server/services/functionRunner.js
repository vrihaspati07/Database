/**
 * Hind DB - Edge Function Runner & Compiler
 * Product: Hind DB
 * Parent Company: Hind India Private Limited
 * Copyright: © 2026 Hind. A Hind India Private Limited Company.
 *
 * SECURITY NOTICE & ARCHITECTURAL CAVEAT:
 * Known caveat to keep documented: The function sandbox does not restrict
 * network egress; before opening functions to untrusted public users it
 * must run in a container with an egress policy.
 */

import ts from 'typescript';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

let esbuildModule = null;

// Attempt dynamic loading of esbuild if present
async function getEsbuild() {
  if (esbuildModule !== null) return esbuildModule;
  try {
    esbuildModule = await import('esbuild');
  } catch (e) {
    esbuildModule = false;
  }
  return esbuildModule;
}

export const functionRunner = {
  /**
   * 1. Compile TypeScript function code into ES JavaScript
   * Throws CompileError with line numbers and diagnostics if invalid
   */
  async compile(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Function code must be a non-empty string.');
    }

    const esbuild = await getEsbuild();

    // Strategy A: esbuild (if installed)
    if (esbuild && esbuild.transform) {
      try {
        const result = await esbuild.transform(code, {
          loader: 'ts',
          target: 'es2022',
          format: 'esm',
        });
        return result.code;
      } catch (err) {
        const errorMsg = err.errors?.map((e) => `${e.text} (line ${e.location?.line || '?'})`).join('; ') || err.message;
        const compileErr = new Error(`Compilation Error: ${errorMsg}`);
        compileErr.name = 'CompileError';
        compileErr.details = errorMsg;
        throw compileErr;
      }
    }

    // Strategy B: TypeScript Transpiler with diagnostics validation
    const result = ts.transpileModule(code, {
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        removeComments: false,
        strict: false,
      },
    });

    if (result.diagnostics && result.diagnostics.length > 0) {
      const errorMessages = result.diagnostics.map((diag) => {
        const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        if (diag.file && diag.start !== undefined) {
          const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
          return `Line ${line + 1}, Col ${character + 1}: ${message}`;
        }
        return message;
      });

      const compileErr = new Error(`Compilation Error: ${errorMessages.join('; ')}`);
      compileErr.name = 'CompileError';
      compileErr.details = errorMessages.join('\n');
      throw compileErr;
    }

    return result.outputText;
  },

  /**
   * 2. Run compiled function in an isolated child process
   * Enforces 5s timeout, empty env, node permission model, and captures console logs
   */
  async run({ code, method = 'POST', body = {}, headers = {} }) {
    const startTime = performance.now();

    // 1. Compile code first to catch any syntax or compilation errors
    const compiledJs = await this.compile(code);

    // 2. Prepare temporary harness script
    const tmpDir = fs.realpathSync(os.tmpdir());
    const scriptId = `hind_fn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mjs`;
    const scriptPath = path.join(tmpDir, scriptId);

    // Harness wrapper providing standard Serverless environment:
    // - serve(req => ...) support
    // - Response, Request, Headers, URL
    // - console log collector
    const harnessCode = `
import { fileURLToPath } from 'url';

const logs = [];
const logCapture = (level, ...args) => {
  const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  logs.push(\`[\${level}] \${formatted}\`);
};

console.log = (...args) => logCapture('LOG', ...args);
console.error = (...args) => logCapture('ERROR', ...args);
console.warn = (...args) => logCapture('WARN', ...args);
console.info = (...args) => logCapture('INFO', ...args);

let userHandler = null;

export function serve(handler) {
  userHandler = handler;
}

globalThis.serve = serve;

// User Code Execution
try {
${compiledJs.replace(/import\s+.*?\s+from\s+['"]@hind\/functions['"];?/g, '')}
} catch (err) {
  console.error("Evaluation Error:", err.message);
}

// Invoke Handler
async function execute() {
  const inputMethod = ${JSON.stringify(method)};
  const inputBody = ${JSON.stringify(body)};
  const inputHeaders = ${JSON.stringify(headers)};

  let responseData = null;
  let status = 200;
  let responseHeaders = {};

  try {
    if (typeof userHandler === 'function') {
      const mockReq = {
        method: inputMethod,
        headers: inputHeaders,
        json: async () => inputBody,
        text: async () => typeof inputBody === 'string' ? inputBody : JSON.stringify(inputBody),
      };

      const res = await userHandler(mockReq);
      if (res) {
        status = res.status || 200;
        if (typeof res.json === 'function') {
          responseData = await res.json().catch(() => null);
        } else if (res.body) {
          try {
            responseData = JSON.parse(res.body);
          } catch {
            responseData = res.body;
          }
        } else {
          responseData = res;
        }
      }
    } else {
      responseData = { message: "Function executed successfully (no serve handler registered)" };
    }
  } catch (execErr) {
    status = 500;
    console.error("Execution Exception:", execErr.message);
    responseData = { error: execErr.message, stack: execErr.stack };
  }

  process.stdout.write("---HIND_OUTPUT_START---\\n" + JSON.stringify({
    status,
    response: responseData,
    logs,
  }) + "\\n---HIND_OUTPUT_END---");
}

execute();
`;

    fs.writeFileSync(scriptPath, harnessCode, 'utf8');

    // 3. Spawn child process with Node Permission Model & 5s timeout
    return new Promise((resolve, reject) => {
      let isSettled = false;
      let stdoutBuffer = '';
      let stderrBuffer = '';

      // Child process arguments (with node permission model)
      const nodeArgs = [
        '--permission',
        '--allow-fs-read=' + tmpDir,
        '--allow-fs-read=/var',
        '--allow-fs-read=/private',
        '--allow-fs-read=/tmp',
        scriptPath,
      ];

      // Spawn child with EMPTY env (except essential system PATH)
      const child = spawn(process.execPath, nodeArgs, {
        env: {
          PATH: process.env.PATH || '',
          NODE_ENV: 'production',
        },
        timeout: 5000, // 5s timeout
      });

      child.stdout.on('data', (chunk) => {
        stdoutBuffer += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderrBuffer += chunk.toString();
      });

      // Handle 5s timeout
      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try { child.kill('SIGKILL'); } catch (e) {}
          try { fs.unlinkSync(scriptPath); } catch (e) {}
          resolve({
            status: 504,
            response: { error: 'Function Execution Timeout (exceeded 5000ms limit)' },
            consoleLogs: ['[ERROR] Execution timed out after 5.0 seconds'],
            durationMs: 5000,
          });
        }
      }, 5000);

      child.on('close', (code) => {
        clearTimeout(timer);
        if (isSettled) return;
        isSettled = true;

        try { fs.unlinkSync(scriptPath); } catch (e) {}

        const durationMs = Math.round(performance.now() - startTime);

        // Parse Output
        try {
          const startMarker = '---HIND_OUTPUT_START---\n';
          const endMarker = '\n---HIND_OUTPUT_END---';
          const startIdx = stdoutBuffer.indexOf(startMarker);
          const endIdx = stdoutBuffer.indexOf(endMarker);

          if (startIdx !== -1 && endIdx !== -1) {
            const rawJson = stdoutBuffer.substring(startIdx + startMarker.length, endIdx);
            const parsed = JSON.parse(rawJson);
            return resolve({
              status: parsed.status || 200,
              response: parsed.response,
              consoleLogs: parsed.logs || [],
              durationMs,
            });
          }

          // Fallback if stdout marker missing
          resolve({
            status: code === 0 ? 200 : 500,
            response: { message: stdoutBuffer.trim() || 'Executed' },
            consoleLogs: stderrBuffer ? [`[STDERR] ${stderrBuffer.trim()}`] : [],
            durationMs,
          });
        } catch (parseErr) {
          resolve({
            status: 500,
            response: { error: 'Failed to parse function output: ' + parseErr.message },
            consoleLogs: stderrBuffer ? [`[STDERR] ${stderrBuffer.trim()}`] : [],
            durationMs,
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timer);
        if (isSettled) return;
        isSettled = true;
        try { fs.unlinkSync(scriptPath); } catch (e) {}
        const durationMs = Math.round(performance.now() - startTime);
        resolve({
          status: 500,
          response: { error: err.message },
          consoleLogs: [`[ERROR] Spawn Error: ${err.message}`],
          durationMs,
        });
      });
    });
  },
};

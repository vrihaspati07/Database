import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { spawn } from 'child_process'
import net from 'net'

function autoBackendPlugin() {
  let backendProc: any = null;
  let launched = false;
  return {
    name: 'auto-backend-server',
    configureServer() {
      // Check if backend port 4000 is open
      const socket = new net.Socket();
      socket.setTimeout(400);
      const launch = () => {
        if (launched) return;
        launched = true;
        socket.destroy();
        console.log('[Hind DB Core] Auto-launching Backend Engine on http://localhost:4000...');
        backendProc = spawn('node', ['server/index.js'], { stdio: 'inherit' });
      };
      socket.on('connect', () => {
        launched = true;
        socket.destroy();
        console.log('[Hind DB Core] Backend is already running on port 4000.');
      });
      socket.on('error', launch);
      socket.on('timeout', launch);
      socket.connect(4000, '127.0.0.1');

      process.on('exit', () => {
        if (backendProc) backendProc.kill();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    autoBackendPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pages/admin')) {
            return 'admin-panel';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/metrics': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/control-x7k9': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})


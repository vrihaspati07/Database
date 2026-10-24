import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  PackageCheck
} from 'lucide-react';

export const SDKs: React.FC = () => {
  const [activeSdk, setActiveSdk] = useState<'node' | 'python' | 'go' | 'rust' | 'java'>('node');
  const [copied, setCopied] = useState(false);

  const sdkInfo = {
    node: {
      name: 'TypeScript / Node.js',
      pkg: 'npm install @vrihadb/client',
      code: `import { VrihaDB } from '@vrihadb/client';

const client = new VrihaDB({
  endpoint: process.env.VRIHADB_URL,
  apiKey: process.env.VRIHADB_KEY,
});

// Automatic connection pooling and edge routing
const userProfile = await client.collection('users').get('usr_1029');`,
      docsUrl: '#'
    },
    python: {
      name: 'Python (Sync & Asyncio)',
      pkg: 'pip install vrihadb-python',
      code: `from vrihadb import AsyncVrihaClient

async with AsyncVrihaClient(url="vriha://us-east.vrihadb.io") as db:
    vector_results = await db.vector_search(
        collection="kb_embeddings",
        vector=[0.051, 0.812, -0.194],
        top_k=5
    )`,
      docsUrl: '#'
    },
    go: {
      name: 'Go (Golang)',
      pkg: 'go get github.com/vrihadb/vriha-go',
      code: `package main

import (
    "context"
    "github.com/vrihadb/vriha-go"
)

func main() {
    client, _ := vrihadb.NewClient("vriha://us-east.vrihadb.io")
    defer client.Close()
}`,
      docsUrl: '#'
    },
    rust: {
      name: 'Rust (tokio-based)',
      pkg: 'cargo add vrihadb',
      code: `use vrihadb::prelude::*;

#[tokio::main]
async fn main() -> Result<(), VrihaError> {
    let client = VrihaClient::connect("us-east.vrihadb.io").await?;
    let doc = client.table("events").find_one("evt_4901").await?;
    Ok(())
}`,
      docsUrl: '#'
    },
    java: {
      name: 'Java / Kotlin',
      pkg: '<dependency> io.vrihadb.client </dependency>',
      code: `VrihaClient client = VrihaClient.builder()
    .endpoint("us-east.vrihadb.io")
    .apiKey(System.getenv("VRIHA_KEY"))
    .build();

SearchResult results = client.vectorSearch("docs", queryEmbedding, 5);`,
      docsUrl: '#'
    }
  };

  const current = sdkInfo[activeSdk];

  const handleCopyPkg = () => {
    navigator.clipboard.writeText(current.pkg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="docs" className="py-24 relative overflow-hidden bg-[#080d1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-xs font-semibold text-blue-400 mb-4 font-mono">
            <Code2 className="w-3.5 h-3.5 text-orange-400" />
            <span>NATIVE CLIENT LIBRARIES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            First-Class SDKs in Your <span className="text-gradient-orange">Favorite Language</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Zero-overhead native wrappers with connection pooling, retries, and automatic batching built-in.
          </p>
        </div>

        {/* SDK Language Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {(Object.keys(sdkInfo) as Array<keyof typeof sdkInfo>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveSdk(key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSdk === key
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sdkInfo[key].name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Code & Install Box */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#090f20] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#060a16] border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <PackageCheck className="w-4 h-4 text-orange-400" />
              <span>{current.name}</span>
            </div>
            <button
              onClick={handleCopyPkg}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : current.pkg}</span>
            </button>
          </div>

          {/* Code */}
          <div className="p-6 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed bg-[#080d1a]">
            <pre className="text-slate-200">
              <code>{current.code}</code>
            </pre>
          </div>
        </div>

      </div>
    </section>
  );
};

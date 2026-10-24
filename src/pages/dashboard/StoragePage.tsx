import React, { useState, useEffect, useRef } from 'react';
import { 
  HardDrive, 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  X, 
  FileSpreadsheet, 
  FileCode, 
  Server
} from 'lucide-react';
import { dashboardApi, type StorageFile } from '../../services/dashboardApi';

export const StoragePage: React.FC = () => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [search, setSearch] = useState('');
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFiles(dashboardApi.getStorageFiles());
  }, []);

  const totalUsedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalMaxBytes = 53687091200; // 50 GB
  const usedPercentage = ((totalUsedBytes / totalMaxBytes) * 100).toFixed(1);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyLink = (file: StorageFile) => {
    const url = file.publicUrl || `https://storage.hind.io/production-assets/${file.name}`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    dashboardApi.deleteFile(id);
    setFiles(dashboardApi.getStorageFiles());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploading(true);
    setTimeout(() => {
      dashboardApi.uploadFile({
        name: selected.name,
        size: selected.size,
        mime: selected.type,
      });
      setFiles(dashboardApi.getStorageFiles());
      setUploading(false);
      setIsUploadModal(false);
    }, 400);
  };

  const getFileIcon = (file: StorageFile) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    if (file.name.endsWith('.pdf') || file.mime?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (file.name.match(/\.(png|jpg|jpeg|svg|webp)$/i) || file.mime?.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (file.name.match(/\.(xlsx|xls|csv)$/i)) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    return <FileCode className="w-5 h-5 text-[#64748B]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <HardDrive className="w-6 h-6 text-[#1E3A8A]" />
            Object Storage & S3 Buckets
          </h1>
          <p className="text-[#475569] text-sm mt-1">
            S3-compatible ultra-fast blob storage with automatic CDN edge caching.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-[#172554] rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      {/* Storage Usage Progress Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 font-bold text-[#0F172A]">
            <Server className="w-4 h-4 text-[#1E3A8A]" />
            <span>Bucket Capacity: production-assets-sovereign</span>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1E3A8A]">
            {formatSize(totalUsedBytes)} of 50 GB used ({usedPercentage}%)
          </span>
        </div>
        <div className="w-full bg-[#F1F5F9] rounded-full h-3 overflow-hidden p-0.5 border border-[#E2E8F0]">
          <div
            className="bg-gradient-to-r from-[#1E3A8A] to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, Number(usedPercentage))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>Encryption: AES-256 GCM at rest</span>
          <span>Access: Public Read via CDN / Signed URLs</span>
        </div>
      </div>

      {/* File Browser Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {/* Search & Breadcrumb Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search files or folders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#CBD5E1] bg-white outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>
          <span className="text-xs text-[#64748B] font-mono">
            /buckets/production-assets/
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-white text-[#64748B] uppercase font-semibold">
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Size</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Last Modified</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file)}
                      <span className="font-semibold text-[#0F172A] font-mono">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[#64748B] whitespace-nowrap">
                    {file.type === 'folder' ? `${file.itemsCount || 0} items` : formatSize(file.size)}
                  </td>
                  <td className="py-3.5 px-5 text-[#64748B] whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-100 text-slate-700">
                      {file.type === 'folder' ? 'DIRECTORY' : file.name.split('.').pop() || 'FILE'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-[#64748B] whitespace-nowrap">
                    {new Date(file.modified).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                      {file.type !== 'folder' && (
                        <button
                          onClick={() => handleCopyLink(file)}
                          className="p-1.5 text-[#475569] hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Copy Public CDN URL"
                        >
                          {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete File"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload File Modal */}
      {isUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E8F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#1E3A8A]" />
                Upload Object to S3 Storage
              </h3>
              <button onClick={() => setIsUploadModal(false)} className="p-1.5 text-[#64748B] hover:bg-[#E2E8F0] rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CBD5E1] hover:border-[#1E3A8A] rounded-2xl p-8 text-center cursor-pointer bg-[#F8FAFC] hover:bg-blue-50/30 transition-all"
            >
              <UploadCloud className="w-10 h-10 text-[#1E3A8A] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#0F172A]">Click or drag & drop file to upload</p>
              <p className="text-xs text-[#64748B] mt-1">Supports PNG, PDF, CSV, JSON, MP4 up to 5 GB</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploading && (
              <div className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl text-xs flex items-center gap-2 font-medium">
                <div className="w-3 h-3 rounded-full border-2 border-[#1E3A8A] border-t-transparent animate-spin" />
                Encrypting and uploading to sovereign S3 cluster...
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#475569] border border-[#CBD5E1] rounded-xl hover:bg-[#F1F5F9]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

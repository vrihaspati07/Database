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
  Shield, 
  ExternalLink, 
  Download, 
  AlertTriangle, 
  Plus, 
  Eye, 
  Loader2, 
  RefreshCw, 
  Globe, 
  Lock,
  Film,
  Music,
  Archive,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { storageApi, type StorageBucket, type StorageFileItem, type StorageQuotaInfo } from '../../services/storageApi';

export const StoragePage: React.FC = () => {
  // State
  const [buckets, setBuckets] = useState<StorageBucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('assets');
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [quota, setQuota] = useState<StorageQuotaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  
  // Modals & Banners
  const [isNewBucketModal, setIsNewBucketModal] = useState<boolean>(false);
  const [newBucketName, setNewBucketName] = useState<string>('');
  const [newBucketPublic, setNewBucketPublic] = useState<boolean>(true);
  const [modalError, setModalError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and drop ref
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Data Load
  const loadStorageData = async (preferredBucket?: string) => {
    try {
      setLoading(true);
      const [fetchedBuckets, fetchedQuota] = await Promise.all([
        storageApi.listBuckets(),
        storageApi.getQuota(),
      ]);

      setBuckets(fetchedBuckets);
      setQuota(fetchedQuota);

      // Determine active bucket
      const activeBucketName = preferredBucket || (fetchedBuckets.length > 0 ? fetchedBuckets[0].name : 'assets');
      setSelectedBucket(activeBucketName);

      if (activeBucketName) {
        const bucketFiles = await storageApi.listFiles(activeBucketName);
        setFiles(bucketFiles);
      }
    } catch (err: any) {
      console.error('[StoragePage Load Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStorageData();
  }, []);

  // Handle switching active bucket
  const handleSelectBucket = async (bucketName: string) => {
    setSelectedBucket(bucketName);
    try {
      setLoading(true);
      const bucketFiles = await storageApi.listFiles(bucketName);
      setFiles(bucketFiles);
    } catch (err) {
      console.error('Failed to load bucket files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create Bucket
  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    try {
      setModalError(null);
      const created = await storageApi.createBucket(newBucketName, newBucketPublic);
      setBuckets(prev => [...prev, created]);
      setSelectedBucket(created.name);
      setFiles([]);
      setIsNewBucketModal(false);
      setNewBucketName('');
      setStatusMessage({ type: 'success', text: `Bucket '${created.name}' created successfully.` });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create bucket');
    }
  };

  // Delete Bucket
  const handleDeleteBucket = async (bucketName: string) => {
    if (!window.confirm(`Are you sure you want to delete bucket '${bucketName}' and all files inside it?`)) {
      return;
    }

    try {
      await storageApi.deleteBucket(bucketName);
      const updatedBuckets = buckets.filter(b => b.name !== bucketName);
      setBuckets(updatedBuckets);
      setStatusMessage({ type: 'success', text: `Bucket '${bucketName}' deleted.` });
      setTimeout(() => setStatusMessage(null), 3000);

      if (updatedBuckets.length > 0) {
        handleSelectBucket(updatedBuckets[0].name);
      } else {
        setSelectedBucket('');
        setFiles([]);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete bucket' });
    }
  };

  // Upload File Handler
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    // Client side security check
    const blockedExts = ['.exe', '.sh', '.bat', '.cmd', '.msi'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (blockedExts.includes(ext)) {
      setStatusMessage({
        type: 'error',
        text: `Security Block: Executable files (${ext}) are prohibited on Hind DB Storage.`,
      });
      setTimeout(() => setStatusMessage(null), 6000);
      return;
    }

    try {
      setUploading(true);
      setStatusMessage(null);
      await storageApi.uploadFile(selectedBucket, file);
      
      // Refresh bucket files and quota
      const [updatedFiles, updatedQuota] = await Promise.all([
        storageApi.listFiles(selectedBucket),
        storageApi.getQuota(),
      ]);

      setFiles(updatedFiles);
      setQuota(updatedQuota);

      setStatusMessage({
        type: 'success',
        text: `File '${file.name}' uploaded to Hind DB Storage bucket '${selectedBucket}'.`,
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to upload file.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Copy Link (Public URL or Signed URL for private bucket)
  const handleCopyLink = async (file: StorageFileItem) => {
    try {
      if (!file.is_public) {
        const signed = await storageApi.createSignedUrl(selectedBucket, file.name, 3600);
        navigator.clipboard.writeText(signed.signedUrl);
        setCopiedId(file.id);
        setStatusMessage({
          type: 'success',
          text: `Private file signed URL generated and copied to clipboard (valid for 1 hour).`,
        });
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        navigator.clipboard.writeText(file.public_url);
        setCopiedId(file.id);
      }
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err: any) {
      navigator.clipboard.writeText(file.public_url);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!window.confirm(`Delete '${fileName}' from ${selectedBucket}?`)) return;

    try {
      await storageApi.deleteFile(selectedBucket, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      const updatedQuota = await storageApi.getQuota();
      setQuota(updatedQuota);

      setStatusMessage({ type: 'success', text: `File '${fileName}' removed.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete file' });
    }
  };

  // Helper: File Icons
  const getFileIcon = (file: StorageFileItem) => {
    const mime = (file.mime_type || '').toLowerCase();
    const name = file.name.toLowerCase();

    if (name.match(/\.(png|jpe?g|svg|webp|gif|bmp)$/) || mime.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    }
    if (name.endsWith('.pdf') || mime.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-600" />;
    }
    if (name.match(/\.(mp4|webm|mov|mkv)$/) || mime.startsWith('video/')) {
      return <Film className="w-5 h-5 text-purple-600" />;
    }
    if (name.match(/\.(mp3|wav|ogg|aac)$/) || mime.startsWith('audio/')) {
      return <Music className="w-5 h-5 text-pink-600" />;
    }
    if (name.match(/\.(zip|tar|gz|7z|rar)$/)) {
      return <Archive className="w-5 h-5 text-amber-600" />;
    }
    if (name.match(/\.(xlsx|xls|csv)$/)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    }
    return <FileCode className="w-5 h-5 text-slate-600" />;
  };

  // Filtered files
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const usedPercentNum = quota ? Math.min(100, (quota.usedBytes / quota.quotaBytes) * 100) : 4.6;
  const isStorageWarning = usedPercentNum >= 90;
  const isStorageFull = usedPercentNum >= 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Hind DB Storage
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase tracking-wider">
                  Sovereign Cloud
                </span>
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                High-performance object storage for media, docs, and datasets. 100% Indian Data Sovereignty.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewBucketModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            New Bucket
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isStorageFull}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between transition-all animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Quota & Capacity Usage Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-900">
              Storage Capacity:
            </span>
            <span className="text-sm font-bold text-slate-800">
              {quota ? storageApi.formatSize(quota.usedBytes) : '47.0 MB'} of {quota ? storageApi.formatSize(quota.quotaBytes) : '1.00 GB'} used
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium border border-slate-200">
              {usedPercentNum.toFixed(1)}% full
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Plan: {quota?.plan || 'Free'}</span>
            <span>•</span>
            <span>Max file size: 50MB</span>
            <button className="text-orange-600 hover:text-orange-700 font-semibold ml-2 inline-flex items-center gap-1">
              Upgrade to Pro <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isStorageFull
                ? 'bg-rose-600'
                : isStorageWarning
                ? 'bg-amber-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${Math.max(2, usedPercentNum)}%` }}
          />
        </div>

        {/* Quota Warnings */}
        {isStorageWarning && !isStorageFull && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Storage Warning: You have reached 90% of your free 1GB quota. Upgrade to Pro for 10GB capacity.</span>
          </div>
        )}
        {isStorageFull && (
          <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Storage Quota Exceeded (100%). New file uploads are currently blocked.</span>
            </div>
            <button className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all">
              Upgrade to Pro (10GB)
            </button>
          </div>
        )}
      </div>

      {/* 3. Buckets & Files Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Buckets List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Buckets ({buckets.length})
            </h2>
            <button
              onClick={() => setIsNewBucketModal(true)}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {buckets.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No buckets created yet.
              </div>
            ) : (
              buckets.map((b) => (
                <div
                  key={b.id || b.name}
                  onClick={() => handleSelectBucket(b.name)}
                  className={`group flex items-center justify-between p-3.5 cursor-pointer transition-all ${
                    selectedBucket === b.name
                      ? 'bg-orange-50/70 border-l-4 border-l-orange-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder
                      className={`w-4 h-4 shrink-0 ${
                        selectedBucket === b.name ? 'text-orange-600' : 'text-slate-400'
                      }`}
                    />
                    <div className="truncate">
                      <p className={`text-sm font-semibold truncate ${
                        selectedBucket === b.name ? 'text-orange-950' : 'text-slate-800'
                      }`}>
                        {b.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {b.is_public ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-500">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                        <span>•</span>
                        <span>{b.file_count || 0} files</span>
                      </div>
                    </div>
                  </div>

                  {b.name !== 'assets' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBucket(b.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-all"
                      title="Delete Bucket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sovereign Security Badge */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-orange-400" />
              Sovereign Shield Active
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Files are stored on high-speed S3 infrastructure with auto CDN edge delivery under{' '}
              <span className="text-orange-300 font-mono">storage.hinddb.com</span>. Executable and malicious formats are rejected automatically.
            </p>
          </div>
        </div>

        {/* Right Column: Drag & Drop + File Explorer */}
        <div className="lg:col-span-3 space-y-4">
          {/* A. Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-orange-500 bg-orange-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-orange-400 bg-white hover:bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploading to bucket: <span className="font-semibold text-orange-600 font-mono">{selectedBucket}</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                Supports Images, PDFs, Videos, CSVs up to 50MB per file. Executable files (.exe, .sh) are prohibited.
              </p>
            </div>
          </div>

          {/* B. Bucket Toolbar: Search & Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-orange-500 text-slate-800"
                />
              </div>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => loadStorageData(selectedBucket)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
                title="Refresh File List"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* C. Files Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                <p className="text-xs">Loading Hind DB storage assets...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Folder className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No files found in bucket '{selectedBucket}'</p>
                <p className="text-xs text-slate-400">Drag and drop files in the upload box above to add them.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Public URL</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredFiles.map((file) => {
                      const isImage = file.mime_type?.startsWith('image/') || file.name.match(/\.(png|jpe?g|webp|svg)$/i);
                      return (
                        <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* File Name & Preview Icon */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail preview if image */}
                              {isImage ? (
                                <div
                                  onClick={() => setPreviewImage({ url: file.public_url, name: file.name })}
                                  className="w-8 h-8 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative group/img flex items-center justify-center"
                                >
                                  <img
                                    src={file.proxy_url || file.public_url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to icon if thumbnail fails
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye className="w-3.5 h-3.5 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                  {getFileIcon(file)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(file.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Size */}
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {storageApi.formatSize(file.size_bytes)}
                          </td>

                          {/* Type */}
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {file.mime_type || 'binary'}
                          </td>

                          {/* Public URL Badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[160px]" title={file.public_url}>
                                {file.public_url}
                              </span>
                              <button
                                onClick={() => handleCopyLink(file)}
                                className="p-1 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all shrink-0"
                                title="Copy Hind DB Sovereign Public URL"
                              >
                                {copiedId === file.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={file.proxy_url || file.public_url}
                                target="_blank"
                                rel="noreferrer"
                                download={file.name}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                                title="Download / Open File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleDeleteFile(file.id, file.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* D. Developer SDK Quick Reference */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Hind DB Storage JavaScript SDK
              </h3>
              <span className="text-[11px] font-mono text-slate-400">@hinddb/client</span>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
{`// 1. Upload File
const { data, error } = await db.storage
  .from('${selectedBucket}')
  .upload(file);

// 2. Get Sovereign Public URL
const { publicUrl } = db.storage
  .from('${selectedBucket}')
  .getPublicUrl('photo.jpg');
// Output: https://storage.hinddb.com/{projectId}/${selectedBucket}/photo.jpg`}
            </pre>
          </div>
        </div>
      </div>

      {/* MODAL: Create Bucket */}
      {isNewBucketModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Folder className="w-5 h-5 text-orange-600" />
                Create Storage Bucket
              </h3>
              <button
                onClick={() => setIsNewBucketModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateBucket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bucket Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user-avatars, invoices"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:border-orange-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Only lowercase alphanumeric characters, dashes, and underscores.
                </p>
              </div>

              {/* Public vs Private toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <label className="text-xs font-semibold text-slate-800 block">
                  Bucket Visibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBucketPublic(true)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      newBucketPublic
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" /> Public Bucket
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBucketPublic(false)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      !newBucketPublic
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> Private Bucket
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  {newBucketPublic
                    ? 'Anyone with the link can view or download files directly.'
                    : 'Direct access blocked. Files require temporary 1-hour signed URLs.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBucketModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Image Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900 truncate">{previewImage.name}</p>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[65vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 truncate max-w-md">{previewImage.url}</span>
              <a
                href={previewImage.url}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Full
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

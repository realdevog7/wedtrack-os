import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { FileDoc } from '../types';
import {
  FolderKanban,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  X,
  Plus,
  FileCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const Files: React.FC = () => {
  const { files, addFile, deleteFile } = useWedding();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<FileDoc | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<string>('Contract');
  const [customCategory, setCustomCategory] = useState('');

  const baseCategories = ['Contract', 'Invoice', 'Inspiration', 'Guest Data', 'General', 'Other'];
  const allCategories = Array.from(
    new Set([...baseCategories.filter((c) => c !== 'Other'), ...files.map((f) => f.category)])
  );
  if (!allCategories.includes('Other')) allCategories.push('Other');

  const tabCategories = ['all', ...Array.from(new Set([...baseCategories.filter((c) => c !== 'Other'), ...files.map((f) => f.category)]))];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setDocName(file.name);

    // Auto-suggest category based on type
    if (file.type.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
      setDocCategory('Inspiration');
    } else if (file.type.includes('spreadsheet') || file.type.includes('csv') || /\.(csv|xlsx|xls)$/i.test(file.name)) {
      setDocCategory('Guest Data');
    } else {
      setDocCategory('Contract');
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const finalCat = docCategory === 'Other' && customCategory.trim() ? customCategory.trim() : docCategory;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      addFile({
        name: docName.trim() || selectedFile.name,
        category: finalCat as any,
        sizeBytes: selectedFile.size,
        type: selectedFile.type || (selectedFile.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        url,
      });
      // Reset & close modal
      setSelectedFile(null);
      setDocName('');
      setDocCategory('Contract');
      setCustomCategory('');
      setShowUploadModal(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDownload = (file: FileDoc) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredFiles = files.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const getFileIcon = (file: FileDoc) => {
    const isImage = file.type.includes('image') || file.url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
    const isPdf = file.type.includes('pdf') || file.url.startsWith('data:application/pdf') || /\.pdf$/i.test(file.name);
    const isSpreadsheet = file.type.includes('spreadsheet') || file.type.includes('csv') || /\.(csv|xlsx|xls)$/i.test(file.name);

    if (isImage) return null; // We render img tag
    if (isPdf) return <FileCheck className="w-12 h-12 text-rose-500" />;
    if (isSpreadsheet) return <FileSpreadsheet className="w-12 h-12 text-emerald-500" />;
    return <FileText className="w-12 h-12 text-indigo-500" />;
  };

  const isFileImage = (file: FileDoc) => {
    return file.type.includes('image') || file.url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  };

  const isFilePdf = (file: FileDoc) => {
    return file.type.includes('pdf') || file.url.startsWith('data:application/pdf') || /\.pdf$/i.test(file.name);
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg sm:text-2xl md:text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            File & Contract Vault
          </h1>
          <p className="text-xs text-slate-500">
            Store vendor contracts, catering quotes, invoices, and photo inspiration galleries with live PDF previewing.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all w-fit"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
        {tabCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-rose-500 text-white font-semibold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.id} className="glass-card rounded-3xl p-5 space-y-3 flex flex-col justify-between hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800/80">
            <div className="space-y-3">
              <div
                onClick={() => setPreviewFile(file)}
                className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center overflow-hidden relative cursor-pointer group border border-slate-200/50 dark:border-slate-700/50"
              >
                {isFileImage(file) ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                    {getFileIcon(file)}
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">
                      {file.name.split('.').pop() || file.category}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-semibold text-xs">
                  <Eye className="w-4 h-4" /> View Preview
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                    {file.category}
                  </span>
                  <span>{(file.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              <button
                onClick={() => deleteFile(file.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                title="Delete File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold text-base text-slate-700 dark:text-slate-300">No documents found in this category</h3>
          <p className="text-xs">Click "Upload Document" above to upload quotes, contracts, PDFs, or photos.</p>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full mx-3 sm:mx-auto p-4 sm:p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">Upload New Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-4">
              {/* File Drop Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Document / Photo
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    required={!selectedFile}
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <FileText className="w-10 h-10 mx-auto text-rose-500" />
                      <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <span className="text-[10px] text-rose-500 font-semibold underline mt-1 inline-block">Click to replace file</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-10 h-10 mx-auto text-slate-400 group-hover:text-rose-500 transition-colors" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Drag and drop file here, or <span className="text-rose-500 underline">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Supports PDF, Word, Excel, CSV, PNG, JPG</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venue Lease Agreement 2026"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {docCategory === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category name..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/30 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all"
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full mx-3 sm:mx-auto p-4 sm:p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3 truncate">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  {previewFile.category}
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100 truncate">{previewFile.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={() => setPreviewFile(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[65vh]">
              {isFileImage(previewFile) ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-md" />
              ) : isFilePdf(previewFile) ? (
                <iframe src={previewFile.url} className="w-full h-[75vh] rounded-xl border-0 shadow-inner bg-white" title="PDF Document Preview" />
              ) : (
                <div className="text-center p-12 text-slate-500 space-y-4 max-w-md">
                  <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 w-fit mx-auto">
                    <FileText className="w-16 h-16 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">{previewFile.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">This document format ({previewFile.type || 'file'}) cannot be previewed inline.</p>
                  </div>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 inline-flex items-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download Document Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

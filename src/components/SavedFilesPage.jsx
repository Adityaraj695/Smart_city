import React, { useEffect, useState } from 'react';
import { FolderOpen, FileJson, Trash2, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

export default function SavedFilesPage({ refreshKey, onOpenFile }) {
  const [files, setFiles] = useState(null);
  const [error, setError] = useState('');
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    api.listFiles().then((d) => setFiles(d.files)).catch((e) => setError(e.message));
  }, [refreshKey]);

  const open = async (id) => {
    setOpeningId(id);
    try {
      const file = await api.getFile(id);
      onOpenFile(file);
    } catch (e) {
      setError(e.message);
    } finally {
      setOpeningId(null);
    }
  };

  const remove = async (file) => {
    if (!window.confirm(`Delete "${file.name}" from your saved files?`)) return;
    try {
      await api.deleteFile(file.id);
      setFiles((fs) => fs.filter((f) => f.id !== file.id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section id="saved-files-section" className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-100">
        <FolderOpen className="w-4 h-4 text-blue-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
          Saved GeoJSON Files
        </h3>
        {files && <span className="text-[10px] text-neutral-400">({files.length})</span>}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {!files && !error && (
        <div className="py-6 flex justify-center text-neutral-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
      )}

      {files && files.length === 0 && (
        <p className="text-xs text-neutral-400 py-4 text-center">
          No files saved yet. Files you upload are stored here automatically.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {files?.map((file) => (
          <div key={file.id} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-2">
                <FileJson className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <h4 className="text-xs font-bold text-neutral-900 break-all">{file.name}</h4>
              </div>
              <div className="mt-2 text-[11px] text-neutral-500 space-y-0.5">
                <p>{file.featureCount} features{file.sizeLabel ? ` · ${file.sizeLabel}` : ''}</p>
                <p className="flex items-center gap-1 text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(file.uploadedAt.replace(' ', 'T') + 'Z').toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200 flex gap-2">
              <button
                onClick={() => open(file.id)}
                disabled={openingId === file.id}
                className="flex-1 py-1 px-2.5 rounded bg-white hover:bg-blue-600 hover:text-white border border-neutral-200 text-neutral-600 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                {openingId === file.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <>
                  <span>Review</span><ArrowRight className="w-3 h-3" />
                </>}
              </button>
              <button
                onClick={() => remove(file)}
                title="Delete"
                className="px-2 rounded bg-white hover:bg-rose-50 hover:text-rose-600 border border-neutral-200 text-neutral-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

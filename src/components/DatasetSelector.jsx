import React, { useEffect, useState } from 'react';
import { FileJson, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

// Dropdown on the dashboard for choosing which GeoJSON the map and analysis show:
// the built-in sample, or any file saved to the signed-in user's account.
export default function DatasetSelector({ activeSourceId, refreshKey, onSelectSample, onSelectFile }) {
  const [files, setFiles] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listFiles().then((d) => setFiles(d.files)).catch(() => {});
  }, [refreshKey]);

  const change = async (e) => {
    const value = e.target.value;
    setError('');
    if (value === 'sample') {
      onSelectSample();
      return;
    }
    setLoadingId(value);
    try {
      onSelectFile(await api.getFile(value));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl px-4 py-2.5 shadow-sm flex flex-wrap items-center gap-3">
      <FileJson className="w-4 h-4 text-blue-600 shrink-0" />
      <label htmlFor="dataset-select" className="text-xs font-bold uppercase tracking-wider text-neutral-700">
        GeoJSON on map
      </label>
      <select
        id="dataset-select"
        value={String(activeSourceId)}
        onChange={change}
        disabled={loadingId !== null}
        className="flex-1 min-w-[220px] max-w-md px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
      >
        <option value="sample">Sample: Patiala Sector 4 (built-in)</option>
        {files.map((f) => (
          <option key={f.id} value={String(f.id)}>
            {f.name} — {f.featureCount} features
          </option>
        ))}
      </select>
      {loadingId !== null && <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />}
      {error && <span className="text-xs text-rose-600">{error}</span>}
      {files.length === 0 && (
        <span className="text-[11px] text-neutral-400">Upload a GeoJSON file and it will appear here.</span>
      )}
    </div>
  );
}

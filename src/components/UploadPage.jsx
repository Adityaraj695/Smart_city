import React, { useState, useRef } from 'react';
import { Building2, FileJson, FolderOpen, MapPin, ChevronDown } from 'lucide-react';
import CityscapeIllustration from './CityscapeIllustration';

// The very first screen: its only job is to take a GeoJSON file (or let the
// user start from the sample dataset). Nothing about the data itself is
// shown here — that all appears on the dashboard once input has been given.
export default function UploadPage({ onFileUpload, onUseSample }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file) => {
    setUploadError(null);
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.geojson') && !fileName.endsWith('.json')) {
      setUploadError('Invalid format: File must be .geojson or .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.features && parsed.type !== 'FeatureCollection') {
          setUploadError('GeoJSON error: Missing FeatureCollection.');
          return;
        }
        onFileUpload(parsed, file.name, (file.size / 1024).toFixed(1) + ' KB');
      } catch (err) {
        setUploadError('Parse Error: Invalid JSON syntax in file.');
      }
    };
    reader.onerror = () => {
      setUploadError('Read error: Unable to read file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-[#eef4fb] via-[#f6f9fd] to-white text-[#0f2942] antialiased">
      {/* Top Navbar */}
      <header className="bg-[#0e2a47] text-white px-5 sm:px-10 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold">Smart City</h1>
            <p className="text-[11px] text-blue-100/70">Infrastructure Analysis &amp; Recommendation System</p>
          </div>
        </div>
        <nav className="flex items-center gap-5 sm:gap-8 text-sm font-medium text-blue-50/90">
          <a href="#about" className="hidden sm:inline hover:text-white transition-colors">About</a>
          <a href="#help" className="hidden sm:inline hover:text-white transition-colors">Help</a>
          <button
            className="flex items-center gap-1 shrink-0"
            title="Aditya Sharma"
          >
            <span className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              A
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-100/80 hidden sm:block" />
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 relative">
        {/* Left tagline card */}
        <div className="absolute left-6 lg:left-10 top-7 max-w-40 hidden md:block">
          <p className="font-bold text-sm leading-snug text-[#0f2942]">
            Smarter Infrastructure Brighter Tomorrows
          </p>
          <div className="w-10 h-0.5 bg-blue-500 mt-2 rounded-full" />
        </div>

        {/* Right taglines */}
        <div className="absolute right-6 lg:right-10 top-7 text-right hidden md:block">
          <p className="italic text-sm font-semibold text-[#0f2942]">Data-Driven Cities</p>
          <p className="italic text-sm font-semibold text-emerald-600">Stronger Communities</p>
        </div>

        {/* Decorative location pin */}
        <MapPin className="w-6 h-6 text-blue-300 absolute left-8 bottom-2 hidden lg:block" strokeWidth={1.75} />

        <div className="max-w-2xl mx-auto px-4 pt-14 sm:pt-20 pb-6 text-center">
          <h2 className="text-[2.25rem] sm:text-5xl font-extrabold tracking-tight leading-tight">
            Upload <span className="text-blue-600">GeoJSON</span> File
          </h2>
          <p className="text-[#5a6b80] mt-4 max-w-lg mx-auto leading-relaxed text-[15px]">
            Upload a GeoJSON file of a geographical area to analyze its infrastructure
            and essential public services.
          </p>

          {/* Upload dropzone */}
          <div className="mt-9 max-w-xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson,.json,application/geo+json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl px-8 py-10 flex flex-col items-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-100/60'
                  : 'border-blue-300 bg-blue-50/60 hover:bg-blue-50'
              }`}
            >
              <div className="relative mb-3">
                <FileJson className="w-14 h-14 text-blue-500" strokeWidth={1.5} />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold tracking-wide px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                  GEOJSON
                </span>
              </div>

              <p className="font-bold text-[#0f2942] mt-1">
                Drag and drop your GeoJSON file here
              </p>
              <p className="text-sm text-[#8a97a8] my-2">or</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current && fileInputRef.current.click();
                }}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse File</span>
              </button>

              <p className="text-xs text-[#8a97a8] mt-4">
                Supported format: .geojson, .json
              </p>

              {uploadError && (
                <p className="text-xs text-rose-600 mt-3 bg-rose-50 px-3 py-1.5 rounded border border-rose-200">
                  {uploadError}
                </p>
              )}
            </div>

            <button
              onClick={onUseSample}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-4 decoration-blue-300"
            >
              Continue with the sample dataset instead
            </button>
          </div>
        </div>

        {/* Handwritten accent, sitting just above the illustration */}
        <div className="flex justify-end pr-8 sm:pr-16 pt-2">
          <div className="text-right -rotate-2">
            <p
              className="text-teal-700 text-2xl sm:text-[28px] leading-[1.05]"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              Better Planning
              <br />
              Healthier Cities
            </p>
            <svg width="150" height="14" viewBox="0 0 150 14" className="ml-auto -mt-1 text-teal-600">
              <path
                d="M2 8 C 30 2, 60 12, 90 6 S 130 2, 148 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </main>

      {/* Illustrated skyline strip */}
      <CityscapeIllustration />
    </div>
  );
}

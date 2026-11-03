import React from 'react';

// Decorative flat-design skyline strip for the upload page: distant hills,
// a skyline, a river with a bridge, an elevated train, greenery, and a car.
// Purely illustrative — no data, no interactivity.
export default function CityscapeIllustration() {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      className="w-full h-55 sm:h-70 block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf2fb" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="riverFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe1f7" />
          <stop offset="100%" stopColor="#8fcdef" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="1440" height="320" fill="url(#skyFade)" />

      {/* distant hills */}
      <ellipse cx="180" cy="230" rx="260" ry="70" fill="#dbe7f5" />
      <ellipse cx="620" cy="245" rx="320" ry="60" fill="#e3edf8" />
      <ellipse cx="1180" cy="235" rx="300" ry="65" fill="#dbe7f5" />

      {/* clouds — kept low enough in the viewBox to survive the slice crop */}
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="140" cy="112" rx="46" ry="16" />
        <ellipse cx="175" cy="104" rx="32" ry="13" />
        <ellipse cx="980" cy="100" rx="50" ry="16" />
        <ellipse cx="1020" cy="93" rx="30" ry="12" />
        <ellipse cx="1310" cy="118" rx="40" ry="14" />
      </g>

      {/* skyline */}
      <g>
        <rect x="40" y="150" width="60" height="110" fill="#254a72" />
        <rect x="108" y="120" width="46" height="140" fill="#1c3a5c" />
        <rect x="162" y="170" width="70" height="90" fill="#2e5980" />
        <rect x="240" y="100" width="36" height="160" fill="#16324f" />
        <line x1="258" y1="70" x2="258" y2="100" stroke="#16324f" strokeWidth="3" />
        <circle cx="258" cy="66" r="4" fill="#16324f" />

        <rect x="1140" y="160" width="64" height="100" fill="#2e5980" />
        <rect x="1210" y="110" width="42" height="150" fill="#1c3a5c" />
        <rect x="1258" y="180" width="56" height="80" fill="#254a72" />
        <rect x="1322" y="130" width="40" height="130" fill="#16324f" />
        <rect x="1370" y="185" width="50" height="75" fill="#2e5980" />

        {/* windows */}
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 2 }).map((_, c) => (
            <rect
              key={`w-l-${r}-${c}`}
              x={116 + c * 18}
              y={132 + r * 24}
              width="10"
              height="14"
              fill="#9fc3e6"
              opacity="0.85"
            />
          ))
        )}
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 2 }).map((_, c) => (
            <rect
              key={`w-r-${r}-${c}`}
              x={1218 + c * 16}
              y={122 + r * 26}
              width="9"
              height="13"
              fill="#9fc3e6"
              opacity="0.85"
            />
          ))
        )}
      </g>

      {/* elevated train track */}
      <g>
        <line x1="700" y1="196" x2="1360" y2="196" stroke="#1c3a5c" strokeWidth="4" />
        {[730, 820, 910, 1000, 1090, 1180, 1270, 1350].map((x) => (
          <rect key={x} x={x - 3} y={196} width="6" height="34" fill="#1c3a5c" />
        ))}
        {/* train */}
        <g transform="translate(950,168)">
          <rect x="0" y="0" width="120" height="28" rx="8" fill="#2563eb" />
          <rect x="8" y="6" width="20" height="14" rx="2" fill="#eaf2fb" />
          <rect x="34" y="6" width="20" height="14" rx="2" fill="#eaf2fb" />
          <rect x="60" y="6" width="20" height="14" rx="2" fill="#eaf2fb" />
          <rect x="86" y="6" width="24" height="14" rx="2" fill="#eaf2fb" />
        </g>
      </g>

      {/* river + bridge */}
      <path
        d="M0 250 C 220 225, 340 270, 560 245 S 900 220, 1440 250 L1440 320 L0 320 Z"
        fill="url(#riverFade)"
      />
      <path
        d="M470 238 C 540 200, 640 200, 710 238"
        fill="none"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M470 238 C 540 200, 640 200, 710 238"
        fill="none"
        stroke="#16324f"
        strokeWidth="2.5"
      />
      <line x1="500" y1="240" x2="500" y2="256" stroke="#16324f" strokeWidth="3" />
      <line x1="590" y1="220" x2="590" y2="256" stroke="#16324f" strokeWidth="3" />
      <line x1="680" y1="240" x2="680" y2="256" stroke="#16324f" strokeWidth="3" />

      {/* riverbank greenery + park */}
      <path d="M0 262 C 160 248, 300 268, 470 258 L470 320 L0 320 Z" fill="#dcefe1" />
      <path d="M710 258 C 950 245, 1200 268, 1440 258 L1440 320 L710 320 Z" fill="#dcefe1" />

      {/* trees */}
      {[60, 130, 210, 340, 400].map((x, i) => (
        <g key={`tl-${x}`} transform={`translate(${x},${268 - (i % 2) * 6})`}>
          <rect x="-3" y="18" width="6" height="16" fill="#7a5230" />
          <circle cx="0" cy="10" r="18" fill={i % 2 === 0 ? '#22a06b' : '#2fbf82'} />
        </g>
      ))}
      {[760, 840, 1120, 1250, 1380].map((x, i) => (
        <g key={`tr-${x}`} transform={`translate(${x},${266 - (i % 2) * 6})`}>
          <rect x="-3" y="18" width="6" height="16" fill="#7a5230" />
          <circle cx="0" cy="10" r="17" fill={i % 2 === 0 ? '#2fbf82' : '#22a06b'} />
        </g>
      ))}

      {/* road + car */}
      <rect x="900" y="284" width="540" height="14" fill="#c9d3dd" />
      <line x1="900" y1="291" x2="1440" y2="291" stroke="#ffffff" strokeWidth="2" strokeDasharray="14 10" />
      <g transform="translate(1010,262)">
        <rect x="0" y="8" width="58" height="16" rx="6" fill="#1c3a5c" />
        <rect x="10" y="0" width="32" height="12" rx="4" fill="#2563eb" />
        <circle cx="12" cy="26" r="6" fill="#16324f" />
        <circle cx="46" cy="26" r="6" fill="#16324f" />
      </g>
    </svg>
  );
}

import React from "react";

/**
 * SolarKowsarLogo — inline SVG logo with a stylized glowing sun.
 *
 * Props:
 *  - size:       pixel size of the sun icon (default 36)
 *  - showText:   render the "Solar Kowsar" wordmark next to the icon (default true)
 *  - className:   extra classes on the wrapper
 *  - textClass:  extra classes on the wordmark
 */
export default function SolarKowsarLogo({
  size = 36,
  showText = true,
  className = "",
  textClass = "",
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Solar Kowsar"
      >
        <defs>
          <radialGradient id="sk-sun-core" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
          <radialGradient id="sk-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sk-rays" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx="32" cy="32" r="30" fill="url(#sk-sun-glow)" />

        {/* Rays */}
        <g stroke="url(#sk-rays)" strokeWidth="3.5" strokeLinecap="round">
          <line x1="32" y1="5"  x2="32" y2="13" />
          <line x1="32" y1="51" x2="32" y2="59" />
          <line x1="5"  y1="32" x2="13" y2="32" />
          <line x1="51" y1="32" x2="59" y2="32" />
          <line x1="12.5" y1="12.5" x2="18" y2="18" />
          <line x1="46" y1="46" x2="51.5" y2="51.5" />
          <line x1="51.5" y1="12.5" x2="46" y2="18" />
          <line x1="18" y1="46" x2="12.5" y2="51.5" />
        </g>

        {/* Sun body */}
        <circle cx="32" cy="32" r="13" fill="url(#sk-sun-core)" />
        <circle cx="28" cy="28" r="4" fill="#fffbeb" opacity="0.5" />
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight ${textClass}`}>
          <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Solar
          </span>
          <span className="text-foreground"> Kowsar</span>
        </span>
      )}
    </div>
  );
}
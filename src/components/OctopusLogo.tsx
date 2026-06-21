interface OctopusLogoProps {
  size?: number;
  className?: string;
}

export function OctopusLogo({ size = 32, className = "" }: OctopusLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="octoBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <radialGradient id="octoCheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#F0ABFC" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#F0ABFC" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="url(#octoBody)">
        <path d="M14 38 C 8 44, 6 52, 10 58 C 11 59, 13 58, 13 56 C 11 52, 13 46, 17 42 Z" />
        <path d="M20 42 C 16 50, 17 56, 20 60 C 21 61, 23 60, 23 58 C 21 54, 22 48, 24 44 Z" />
        <path d="M27 44 C 25 52, 26 58, 28 61 C 29 62, 31 61, 31 59 C 29 55, 30 49, 31 46 Z" />
        <path d="M33 46 C 32 53, 33 59, 35 62 C 36 63, 37 62, 37 60 C 36 56, 36 50, 36 47 Z" />
        <path d="M38 46 C 39 53, 40 59, 42 62 C 43 63, 44 62, 44 60 C 43 56, 43 50, 43 47 Z" />
        <path d="M44 44 C 46 52, 47 58, 49 61 C 50 62, 52 61, 51 59 C 49 55, 50 49, 51 46 Z" />
        <path d="M50 42 C 54 50, 55 56, 58 60 C 59 61, 61 60, 60 58 C 58 54, 59 48, 57 44 Z" />
        <path d="M56 38 C 62 44, 64 52, 60 58 C 59 59, 57 58, 57 56 C 59 52, 57 46, 53 42 Z" />
      </g>
      <ellipse cx="32" cy="28" rx="22" ry="20" fill="url(#octoBody)" />
      <ellipse cx="24" cy="20" rx="8" ry="6" fill="#C4B5FD" opacity="0.5" />
      <circle cx="18" cy="32" r="4" fill="url(#octoCheek)" />
      <circle cx="46" cy="32" r="4" fill="url(#octoCheek)" />
      <ellipse cx="24" cy="26" rx="4" ry="5" fill="#FFFFFF" />
      <ellipse cx="40" cy="26" rx="4" ry="5" fill="#FFFFFF" />
      <circle cx="25" cy="27" r="2.2" fill="#1F2937" />
      <circle cx="41" cy="27" r="2.2" fill="#1F2937" />
      <circle cx="25.7" cy="26.3" r="0.8" fill="#FFFFFF" />
      <circle cx="41.7" cy="26.3" r="0.8" fill="#FFFFFF" />
      <path d="M28 34 Q 32 38 36 34" stroke="#1F2937" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Biểu tượng: Lucide (https://lucide.dev), giấy phép ISC.
// Phần thân SVG chép nguyên từ lucide-static@1.72.0; sinh lại bằng cách tải lại file gốc, đừng sửa tay.
import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

// lucide: play
export const IconPlay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
  </Svg>
);

// lucide: pause
export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <rect x="14" y="3" width="5" height="18" rx="1" />
    <rect x="5" y="3" width="5" height="18" rx="1" />
  </Svg>
);

// lucide: skip-back
export const IconPrev = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
    <path d="M3 20V4" />
  </Svg>
);

// lucide: skip-forward
export const IconNext = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 4v16" />
    <path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
  </Svg>
);

// lucide: shuffle
export const IconShuffle = (p: IconProps) => (
  <Svg {...p}>
    <path d="m18 14 4 4-4 4" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
    <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
  </Svg>
);

// lucide: repeat
export const IconRepeat = (p: IconProps) => (
  <Svg {...p}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Svg>
);

// lucide: repeat-1
export const IconRepeatOne = (p: IconProps) => (
  <Svg {...p}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    <path d="M11 10h1v4" />
  </Svg>
);

// lucide: list-music
export const IconQueue = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 5H3" />
    <path d="M11 12H3" />
    <path d="M11 19H3" />
    <path d="M21 16V5" />
    <circle cx="18" cy="16" r="3" />
  </Svg>
);

// lucide: share-2
export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </Svg>
);

// lucide: x
export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);

// lucide: volume-2
export const IconVolume = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
    <path d="M16 9a5 5 0 0 1 0 6" />
    <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
  </Svg>
);

// lucide: volume-x
export const IconVolumeMute = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z" />
    <path d="m16.5 14.5 5-5" />
    <path d="m16.5 9.5 5 5" />
  </Svg>
);

// lucide: chevron-up
export const IconChevronUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="m18 15-6-6-6 6" />
  </Svg>
);

// lucide: chevron-down
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

// lucide: arrow-left
export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Svg>
);

// lucide: arrow-right
export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Svg>
);

// lucide: search
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <path d="m21 21-4.34-4.34" />
    <circle cx="11" cy="11" r="8" />
  </Svg>
);

// lucide: mic-vocal
export const IconLyrics = (p: IconProps) => (
  <Svg {...p}>
    <path d="m11 7.601-5.994 8.19a1 1 0 0 0 .1 1.298l.817.818a1 1 0 0 0 1.314.087L15.09 12" />
    <path d="M16.5 21.174C15.5 20.5 14.372 20 13 20c-2.058 0-3.928 2.356-6 2-2.072-.356-2.775-3.369-1.5-4.5" />
    <circle cx="16" cy="7" r="5" />
  </Svg>
);

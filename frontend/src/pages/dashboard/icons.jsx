export default function Icon({ name, size = 16, color = "currentColor" }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const icons = {
    grid: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill={color} />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill={color}
          opacity=".5"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill={color}
          opacity=".5"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill={color}
          opacity=".5"
        />
      </svg>
    ),
    activity: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <path
          d="M2 8h2l2-5 3 10 2-6 1 1h2"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    "trending-up": (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <path
          d="M2 12L6 7l3 3 5-6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 4h4v4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    user: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="3" stroke={color} strokeWidth="1.5" />
        <path
          d="M2.5 14c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    "plus-square": (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="2"
          width="12"
          height="12"
          rx="2"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M8 5v6M5 8h6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    target: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.5" />
        <circle cx="8" cy="8" r="1" fill={color} />
      </svg>
    ),
    flame: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2C8 2 3 6.5 3 10a5 5 0 0010 0C13 6.5 8 2 8 2z"
          stroke={color}
          strokeWidth="1.5"
          fill="rgba(168,85,247,0.15)"
        />
        <path
          d="M8 7c0 0-2 1.5-2 3a2 2 0 004 0C10 8.5 8 7 8 7z"
          fill={color}
          opacity=".5"
        />
      </svg>
    ),
    clock: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        <path
          d="M8 5v3.5l2.5 1.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    zap: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <path
          d="M9 2L4 9h4l-1 5L13 7H9L9 2z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    bar: (
      <svg style={s} viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="9"
          width="3"
          height="5"
          rx="1"
          fill={color}
          opacity=".5"
        />
        <rect
          x="6.5"
          y="5"
          width="3"
          height="9"
          rx="1"
          fill={color}
          opacity=".75"
        />
        <rect x="11" y="2" width="3" height="12" rx="1" fill={color} />
      </svg>
    ),
  };
  return icons[name] || null;
}

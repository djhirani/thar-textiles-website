type IconProps = { className?: string };

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" />
      <path d="m16 16 4 4" stroke="currentColor" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M5.5 8.5h13l1 12h-15l1-12Z" stroke="currentColor" />
      <path d="M9 9V6.8a3 3 0 0 1 6 0V9" stroke="currentColor" />
    </svg>
  );
}

export function ArrowIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M4 12h15M14 6l6 6-6 6" stroke="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="M4 8h16M4 16h16" stroke="currentColor" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" />
    </svg>
  );
}

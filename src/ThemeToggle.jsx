import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-label="Dark mode"
      aria-checked={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
    >
      <span className="theme-toggle__surface" aria-hidden="true">
        {isDark ? <Moon size={19} strokeWidth={2} /> : <Sun size={19} strokeWidth={2} />}
      </span>
    </button>
  );
}

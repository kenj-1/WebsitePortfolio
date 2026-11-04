/**
 * Persistent polite status region kept outside `aria-busy` and `hidden` subtrees
 * so screen readers reliably announce meaningful state changes (retries, errors, theme/effects changes).
 */
export default function LiveStatus({ message = '' }) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}


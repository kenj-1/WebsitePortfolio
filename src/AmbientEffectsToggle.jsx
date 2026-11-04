import { Sparkles } from 'lucide-react';

export default function AmbientEffectsToggle({ enabled, onToggle }) {
  return <button
    type="button"
    className="ambient-effects-toggle"
    aria-label="Decorative effects"
    aria-pressed={enabled}
    title={enabled ? 'Turn decorative effects off' : 'Turn decorative effects on'}
    onClick={onToggle}
  ><Sparkles size={18} strokeWidth={1.9} aria-hidden="true" /></button>;
}

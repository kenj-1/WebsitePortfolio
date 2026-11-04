import useProjectCardMotion from './useProjectCardMotion';

/**
 * Reusable 3D tilt + specular glare wrapper.
 *
 * Structure (class names are additive, so existing layout/Tailwind classes keep working):
 *   <Tag class="tilt-card …className">                 perspective container (data-tilting / data-motion-*)
 *     <div class="tilt-card__tilt …tiltClassName">     preserve-3d, receives tilt/lift via CSS variables
 *       <div class="tilt-card__surface …surfaceClassName">
 *         <span class="tilt-card__glass" aria-hidden>  frosted-glass layer (backdrop blur) behind content
 *         …children
 *         <span class="tilt-card__glare" aria-hidden>  specular highlight, opposite to the cursor
 *       </div>
 *     </div>
 *   </Tag>
 *
 * All pointer maths run in `useProjectCardMotion` (rAF-coalesced, IntersectionObserver-gated, no React
 * state updates). The glare/glass layers are `pointer-events: none`, so links, buttons and inputs inside
 * `children` stay fully interactive. Tilt pauses automatically while a descendant has keyboard focus,
 * so typing into an input inside a tilted panel never moves the panel.
 *
 * Depth: add the class `tilt-depth` (or `tilt-depth--far`) to a direct child to lift it forward in Z
 * while the card is engaged.
 */
export default function TiltCard({
  as: Tag = 'div',
  className = '',
  tiltClassName = '',
  surfaceClassName = '',
  enabled = true,
  suspended = false,
  intensity = 2.5,
  lift = 3,
  glare = true,
  glass = true,
  children,
  ...rest
}) {
  const { cardRef, surfaceRef } = useProjectCardMotion({ enabled, suspended, intensity, lift });

  return (
    <Tag
      {...rest}
      ref={cardRef}
      className={`tilt-card ${glass ? 'tilt-card--glass' : ''} ${className}`.replace(/\s+/g, ' ').trim()}
      data-motion-enabled={String(enabled)}
      data-motion-suspended={String(suspended)}
      data-tilting="false"
    >
      <div ref={surfaceRef} className={`tilt-card__tilt ${tiltClassName}`.trim()}>
        <div className={`tilt-card__surface ${surfaceClassName}`.trim()}>
          {glass && <span className="tilt-card__glass" aria-hidden="true" />}
          {children}
          {glare && <span className="tilt-card__glare" aria-hidden="true" />}
        </div>
      </div>
    </Tag>
  );
}

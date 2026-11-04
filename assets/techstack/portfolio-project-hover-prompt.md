# Portfolio project hover — Codex prompt

Update my existing portfolio's project panels with restrained 3D hover motion and glowing borders, inspired by the complete reference code below. Inspect existing components first and edit them in place.

1. Remove Pause/Play controls
- Remove the visible Pause/Play button from the hero photo stack and do not add animation buttons to project cards.
- Reuse the existing effects toggle, if present, to disable decorative motion including hero cycling. Keep its accessible label accurate.
- If there is no existing effects toggle, let the hero perform one short entrance shuffle lasting under 5 seconds, then settle. Do not leave an uncontrolled infinite loop.
- Always respect prefers-reduced-motion.

2. Project interactions
- Preserve the featured EmpathTune panel and the ExcelLent/Encantadia grid, content, imagery, links, and dialogs.
- On fine-pointer hover, tilt toward the pointer with perspective around 1200px: maximum ±4° for normal cards and ±2° for the wide featured panel.
- Add at most 3px of lift. Keep text legible and stable; avoid full-panel scaling, flips, bounces, continuous pulses, or automatic project animation.
- Use gentle easing and return smoothly to neutral over roughly 250–350ms on pointer exit/cancel.
- Fade in a thin gradient border and soft outer glow using existing burgundy #87292C, sand #F4D9A0, and brown #5B4632 theme tokens. Tune opacity separately for light/dark modes.
- Keep the glow around the edges, beneath content. Keep card radius and border thickness stable; do not shrink the inner card to reveal the border.
- On keyboard focus within a card, show the same border emphasis and a clear focus outline without cursor tilt.
- On touch, keep cards flat with subtle press feedback. A single tap must activate existing actions normally.

3. Stable implementation
- Use a reusable ProjectCard interaction hook/component with scoped project-card classes and configurable intensity.
- Use an untransformed outer wrapper for pointer measurements and an inner visual surface for tilt. Refresh measurements after resize/scroll; do not derive pointer position from the tilted surface.
- Update refs/CSS variables through at most one requestAnimationFrame loop for the active card. Avoid React state updates for every pointer move and stop scheduling frames when settled.
- Animate transform/opacity. Fade a pre-styled glow layer instead of animating blur or box-shadow every frame. Use will-change only if profiling warrants it.
- Keep clipping on the image/surface layer so glow and focus outlines are not cut off. If using preserve-3d, keep flattening properties such as overflow:hidden, filter, and isolation:isolate off that specific 3D container.
- Decorative layers need pointer-events:none and must stay below navigation/dialogs. Render dialogs outside transformed card containers where necessary.
- Compose with existing reveal animations using separate wrappers rather than overwriting their transforms.
- Reset and stop effects when a modal opens, the tab becomes hidden, reduced motion activates, effects are disabled, or the component unmounts. Clean up listeners, observers, and frames.
- Under reduced motion, disable tilt/lift and use static border/focus feedback.
- Keep layouts content-driven. New cards, longer text, and missing images must not require custom coordinates or animation code.

4. Preserve and adapt this reference
Save the original snippet with attribution in docs/references/uiverse-project-glow.md; do not import its global selectors into the app. In the adapted implementation, fix the empty border-radius declaration and replace fixed sizes, transition:all, neon colors, and generic class names. Preserve the Tiagoadag attribution in an implementation comment.

Original CSS:
~~~css
.card {
 width: 190px;
 height: 254px;
 background-image: linear-gradient(163deg, #00ff75 0%, #3700ff 100%);
 border-radius: 20px;
 transition: all .3s;
}

.card2 {
 width: 190px;
 height: 254px;
 background-color: #1a1a1a;
 border-radius:;
 transition: all .2s;
}

.card2:hover {
 transform: scale(0.98);
 border-radius: 20px;
}

.card:hover {
 box-shadow: 0px 0px 30px 1px rgba(0, 255, 117, 0.30);
}
~~~

Original HTML:
~~~html
<!-- From Uiverse.io by Tiagoadag --> 
<div class="card">
  <div class="card2">
  </div>
</div>
~~~

5. Verify
Check both themes, 320px mobile through desktop, keyboard activation, touch, reduced motion, rapid pointer entry/exit, resize/scroll, and project dialog opening/closing. Check for overflow, clipped borders, flicker, text blur, and broken click targets. Verify the featured panel stays subtle. Run the production build and report what was tested and any remaining limitations. Use existing dependencies; no 3D library is needed for this effect.

Research references:
- MDN — perspective: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective
- MDN — transform-style and flattening: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style
- web.dev — animation performance: https://web.dev/articles/animations-guide
- MDN — reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- W3C — Pause, Stop, Hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide

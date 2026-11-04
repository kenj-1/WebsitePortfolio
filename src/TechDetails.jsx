import { useEffect, useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

export default function TechDetails({ tech, projectLookup, onClose, onSelectProject }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (tech && dialog && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('.tech-details__close')?.focus();
    }
  }, [tech]);

  const keepFocusInside = event => {
    if (event.key !== 'Tab') return;
    const dialog = dialogRef.current;
    const controls = [
      ...dialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'),
    ].filter(control => control.getClientRects().length > 0);
    if (!controls.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!tech) return null;

  const learningPoints = Array.isArray(tech.learningPoints) ? tech.learningPoints.filter(Boolean) : [];
  const applications = Array.isArray(tech.applications) ? tech.applications.filter(Boolean) : [];
  const relatedProjects = (Array.isArray(tech.relatedProjectIds) ? tech.relatedProjectIds : [])
    .map(id => projectLookup.get(id))
    .filter(Boolean);

  return (
    <dialog
      className="tech-details"
      ref={dialogRef}
      aria-labelledby="tech-details-title"
      aria-modal="true"
      onClose={onClose}
      onKeyDown={keepFocusInside}
      onClick={event => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="tech-details__inner">
        <div className="tech-details__header">
          <div>
            <p className="tech-details__year">Started learning in {tech.year}</p>
            <h2 id="tech-details-title">{tech.name}</h2>
            <p className="tech-details__category">{tech.category}</p>
          </div>
          <button
            type="button"
            className="tech-details__close"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close technology details"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        {tech.summary && <p className="tech-details__summary">{tech.summary}</p>}

        {learningPoints.length > 0 && (
          <section className="tech-details__block" aria-labelledby="tech-details-learning">
            <h3 id="tech-details-learning">What I learned</h3>
            <ul>
              {learningPoints.map(point => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        )}

        {applications.length > 0 && (
          <section className="tech-details__block" aria-labelledby="tech-details-applications">
            <h3 id="tech-details-applications">How I applied it</h3>
            <ul>
              {applications.map(application => (
                <li key={application}>{application}</li>
              ))}
            </ul>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section className="tech-details__block" aria-labelledby="tech-details-projects">
            <h3 id="tech-details-projects">Related projects</h3>
            <ul className="tech-details__project-list">
              {relatedProjects.map(project => (
                <li key={project.id}>
                  {onSelectProject ? (
                    <button
                      type="button"
                      className="tech-details__project-button"
                      onClick={() => {
                        dialogRef.current?.close();
                        onSelectProject(project);
                      }}
                    >
                      <span>{project.name}</span>
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    <span>{project.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </dialog>
  );
}

import { useRef, useState } from 'react';
import { projects, techJourney, journeyMilestones } from './content';
import TechCard from './TechCard';
import TechDetails from './TechDetails';
import { ScrollReveal } from './ScrollReveal';

export default function TechJourney({
  items = techJourney,
  projectItems = projects,
  milestones = journeyMilestones,
  effectsEnabled = true,
  onModalChange,
  onSelectProject,
}) {
  const [selectedTech, setSelectedTech] = useState(null);
  const triggerRef = useRef(null);
  const projectLookup = new Map(
    (Array.isArray(projectItems) ? projectItems : []).map(project => [project.id, project]),
  );
  const yearGroups = [
    ...(Array.isArray(items) ? items : []).reduce((groups, tech) => {
      if (!groups.has(tech.year)) groups.set(tech.year, []);
      groups.get(tech.year).push(tech);
      return groups;
    }, new Map()),
  ].sort(([a], [b]) => Number(a) - Number(b));

  const openDetails = (tech, trigger) => {
    triggerRef.current = trigger;
    setSelectedTech(tech);
    onModalChange?.(true);
  };
  const closeDetails = () => {
    setSelectedTech(null);
    onModalChange?.(false);
    window.requestAnimationFrame(
      () => triggerRef.current?.isConnected && triggerRef.current.focus({ preventScroll: true }),
    );
  };

  return (
    <section className="section container tech-journey" id="skills" aria-labelledby="skills-title">
      <div className="section-header">
        <ScrollReveal delay={0}>
          <span className="section-micro-label">[ 04 ] // JOURNEY</span>
          <h2 id="skills-title" className="section-heading">
            Technical Journey
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.12}>
          <p className="section-subtitle">
            Chronological progression of technical capabilities, system foundations, and version control milestones.
          </p>
        </ScrollReveal>
      </div>
      <ol className="tech-journey__timeline">
        {yearGroups.map(([year, technologies]) => {
          const yearMilestone = milestones?.[year];
          return (
            <li className="tech-journey__year" key={year}>
              <ScrollReveal
                as="div"
                delay={0.05}
                viewport={{ once: false, margin: '0px 0px -40px 0px' }}
                className="tech-journey__year-header"
              >
                <span className="tech-journey__marker" aria-hidden="true" />
                <h3 className="tech-journey__year-label">{year}</h3>
              </ScrollReveal>
              <div className="tech-journey__year-body">
                <ul className="tech-journey__cards">
                  {technologies.map((tech, idx) => (
                    <ScrollReveal
                      as="li"
                      key={tech.id}
                      delay={0.04 * (idx % 4)}
                      viewport={{ once: false, margin: '0px 0px -40px 0px' }}
                      className="flex min-w-0 h-full"
                    >
                      <TechCard tech={tech} onOpen={openDetails} effectsEnabled={effectsEnabled} />
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
      <TechDetails
        tech={selectedTech}
        projectLookup={projectLookup}
        onClose={closeDetails}
        onSelectProject={onSelectProject}
      />
    </section>
  );
}

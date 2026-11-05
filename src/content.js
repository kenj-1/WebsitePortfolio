import cLogo from './assets/tech/c.webp';
import javaLogo from './assets/tech/java.webp';
import htmlLogo from './assets/tech/html.webp';
import cssLogo from './assets/tech/css.webp';
import javascriptLogo from './assets/tech/javascript.webp';
import tailwindLogo from './assets/tech/tailwind-css.webp';
import figmaLogo from './assets/tech/figma.webp';
import pythonLogo from './assets/tech/python.webp';
import reactLogo from './assets/tech/react.webp';
import sqlLogo from './assets/tech/sql.webp';
import supabaseLogo from './assets/tech/supabase.webp';
import springBootLogo from './assets/tech/spring-boot.png';
import notionLogo from './assets/tech/notion.png';

import awsOrgLogo from './assets/organizations/aws-wildquacc.jpeg';
import cssOrgLogo from './assets/organizations/css.jpeg';
import honorSocietyLogo from './assets/organizations/honor-society.jpeg';
import cituLogo from './assets/organizations/citu-logo.png';

import excellent640 from './assets/projects/excellent-home-640.webp';
import excellent1280 from './assets/projects/excellent-home-1280.webp';
import encantadiaBattle640 from './assets/projects/encantadia-battle-640.webp';
import encantadiaBattle1280 from './assets/projects/encantadia-battle-1280.webp';

// Portfolio content lives here. Add a project to the array to automatically
// create its card and details view. Keep claims, roles, and links accurate.
export const profile = {
  name: 'Dirk Kenji Balili',
  shortName: 'Kenji',
  email: 'dirkkenjibalili27@gmail.com',
  phone: '09562908527',
  phoneUrl: 'tel:+639562908527',
  telegramUrl: 'https://t.me/dkenjjj',
  location: 'Cebu City, Philippines',
  school: 'Cebu Institute of Technology – University',
  degree: 'BS Information Technology',
  graduation: 'Expected May 2028',
  introduction:
    'I’m an Information Technology student at CIT–U, building software projects and contributing to student communities.',
};

// Add portrait files to public/photos, then update only these entries.
// Empty src values intentionally show the decorative KB placeholders.
export const heroPhotos = [
  { id: 'portrait-one', src: '', alt: '', objectPosition: 'center' },
  { id: 'portrait-two', src: '', alt: '', objectPosition: 'center' },
  { id: 'portrait-three', src: '', alt: '', objectPosition: 'center' },
];

export const recognition = [
  'Parangal 2025 Academic Achiever',
  "Dean's Lister (2025-2026)",
  'College of Computer Studies Honor Roll',
];

// Verified academic awards and distinctions displayed in the dedicated Recognitions section.
export const academicAwards = [
  {
    id: 'parangal-2025-achiever',
    name: 'Parangal 2025 Academic Achiever',
    event: 'CIT–U Parangal Academic Convocation',
    organizer: 'Cebu Institute of Technology – University',
    date: '2025',
    type: 'Academic Distinction',
    category: 'achievements',
    status: 'Academic Awardee',
    role: 'BS Information Technology Scholar',
    context: 'Cebu Institute of Technology – University · Parangal 2025',
    visual: 'achievement',
    orgLogo: cituLogo,
    summary:
      'Recognized at CIT-U Parangal 2025 for outstanding academic performance in the BS Information Technology program.',
    description:
      'Conferred during the university-wide Parangal 2025 convocation ceremony at Cebu Institute of Technology – University in recognition of sustained academic excellence and top-tier rank in the BS Information Technology curriculum.',
    tags: ['Academic Excellence', 'BS Information Technology', 'CIT–U', 'Parangal 2025'],
    bullets: [
      'Recognized for exemplary grade-point standing in core programming and information technology coursework.',
      'Maintained rigorous dedication to software engineering fundamentals and systems architecture.',
    ],
    highlights: [
      'Recognized for exemplary grade-point standing in core programming and information technology coursework.',
      'Maintained rigorous dedication to software engineering fundamentals and systems architecture.',
    ],
    techStackContext:
      'Demonstrated theoretical and applied mastery across object-oriented programming, data structures, algorithms, relational database management systems, and software engineering methodologies.',
  },
  {
    id: 'deans-lister-2025-2026',
    name: "Dean's Lister (2025-2026)",
    event: 'College of Computer Studies Dean’s List',
    organizer: 'CIT–U College of Computer Studies',
    date: 'AY 2025–2026',
    type: 'Academic Honors',
    category: 'achievements',
    status: "Dean's List",
    role: 'BS Information Technology Student',
    context: 'College of Computer Studies · AY 2025–2026',
    visual: 'achievement',
    orgLogo: honorSocietyLogo,
    summary:
      "Named to the College of Computer Studies Dean's List for consistent distinction in coursework.",
    description:
      "Awarded Dean's List standing in the College of Computer Studies at Cebu Institute of Technology – University for sustained superior grade point averages across core engineering subjects.",
    tags: ["Dean's List", 'College of Computer Studies', 'Academic Honors', 'AY 2025–2026'],
    bullets: [
      'Maintained top-tier academic standing across Java OOP, relational databases, and web systems.',
      'Demonstrated consistent coursework leadership alongside hackathons and student tech communities.',
    ],
    highlights: [
      'Maintained top-tier academic standing across Java OOP, relational databases, and web systems.',
      'Demonstrated consistent coursework leadership alongside hackathons and student tech communities.',
    ],
    techStackContext:
      'Sustained top academic marks across rigorous technical coursework including Java, Spring Boot, MySQL, full-stack web development frameworks, and systems integration.',
  },
  {
    id: 'ccs-honor-roll-2025-2026',
    name: 'College of Computer Studies Honor Roll',
    event: 'College of Computer Studies Honor Roll',
    organizer: 'CIT–U College of Computer Studies',
    date: 'AY 2025–2026',
    type: 'Honor Roll Standing',
    category: 'achievements',
    status: 'Honor Roll Awardee',
    role: 'BS Information Technology Student',
    context: 'College of Computer Studies · 1st & 2nd Semester',
    visual: 'achievement',
    orgLogo: cssOrgLogo,
    summary:
      'Awarded Honor Roll status for Academic Year 2025-2026 (1st and 2nd Semester).',
    description:
      'Conferred Honor Roll status by the College of Computer Studies for exemplary academic achievement and technical excellence across consecutive semesters of Academic Year 2025–2026.',
    tags: ['Honor Roll', 'College of Computer Studies', 'Consecutive Semesters', 'AY 2025–2026'],
    bullets: [
      'Awarded Honor Roll status for Academic Year 2025-2026 (1st and 2nd Semester).',
      'Recognized for sustained technical excellence and mastery of computer studies curriculum.',
    ],
    highlights: [
      'Awarded Honor Roll status for Academic Year 2025-2026 (1st and 2nd Semester).',
      'Recognized for sustained technical excellence and mastery of computer studies curriculum.',
    ],
    techStackContext:
      'Consistently validated theoretical software engineering paradigms through high-distinction coursework deliverables, team software architecture, and semester-long system projects.',
  },
];

// Public contact links supplied by Kenji. Add more only after their URLs are confirmed.
export const socialLinks = [
  { platform: 'GitHub', label: 'Kenji on GitHub', url: 'https://github.com/kenj-1', icon: 'github' },
  { platform: 'LinkedIn', label: 'Kenji on LinkedIn', url: 'https://www.linkedin.com/in/dirk-kenji-balili-1a74873ab/', icon: 'linkedin' },
  { platform: 'Telegram', label: 'Message Kenji on Telegram', url: profile.telegramUrl, icon: 'telegram' },
  { platform: 'Instagram', label: 'Kenji on Instagram', url: 'https://www.instagram.com/okdirkyy/', icon: 'instagram' },
  { platform: 'Facebook', label: 'Kenji on Facebook', url: 'https://web.facebook.com/coachkrid/', icon: 'facebook' },
  { platform: 'Email', label: 'Email Kenji', url: `mailto:${profile.email}`, icon: 'mail' },
  { platform: 'Phone', label: 'Call Kenji', url: profile.phoneUrl, icon: 'phone' },
];

// Real project entries with employer-focused Tech Stack Context and bullet points.
export const projects = [
  {
    id: 'encantadia-echoes-of-the-gems',
    name: 'Encantadia: Echoes of the Gems',
    type: 'Game development · 2D Fighting & RPG',
    status: 'Java Swing & JDBC',
    visual: 'game',
    image: encantadiaBattle640,
    imageSrcSet: `${encantadiaBattle640} 640w, ${encantadiaBattle1280} 1280w`,
    imageSizes: '(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 560px',
    imageWidth: 1280,
    imageHeight: 684,
    imageAlt: 'Encantadia: Echoes of the Gems Java Swing battle screen with pixel-art characters, health bars, and ability controls',
    role: 'Team Leader',
    context: 'Academic Object-Oriented Programming Project',
    summary: 'An interactive Java Swing fighting game built with strict OOP principles and JDBC state management.',
    description:
      'Encantadia: Echoes of the Gems is an interactive fighting game featuring custom Java Swing screens, elemental Sang’gre abilities, a 7-tier Tower of Trials gauntlet, and JDBC-backed state persistence.',
    tags: ['Java', 'Java Swing', 'JDBC', 'OOP', 'State Management'],
    repoUrl: 'https://github.com/kenj-1/OOP2JAVAGAMEPROJECT.git',
    bullets: [
      'Interactive fighting game',
      'Applied OOP concepts',
      'Built Java Swing screens',
    ],
    highlights: [
      'Interactive fighting game',
      'Applied OOP concepts',
      'Built Java Swing screens',
    ],
    techStackContext:
      'Utilized Java Database Connectivity (JDBC) for robust state management and Java Swing for GUI rendering. Led the team in structuring complex game logic using strict Object-Oriented Programming (OOP) principles.',
  },
  {
    id: 'encantadia-turn-of-the-gems',
    name: 'Encantadia: Turn of the Gems',
    type: 'Game development · Console Strategy',
    status: 'Java CLI Game',
    visual: 'game',
    role: 'Developer / Team Member',
    context: 'CIT–U 2nd Year Java OOP Project',
    summary: 'A modular Java-based game integrating custom ASCII art and native file I/O structures.',
    description:
      'Encantadia: Turn of the Gems is an object-oriented Java console battle game featuring custom ASCII character art, native file I/O state handling, elemental damage ranges, and three distinct combat modes.',
    tags: ['Java', 'OOP', 'File I/O', 'ASCII Art', 'Modular Architecture'],
    repoUrl: 'https://github.com/kenj-1/OOP-Final-Project-.git',
    bullets: [
      'Java-based game',
      'Integrated ASCII art',
      'Managed file structures',
    ],
    highlights: [
      'Java-based game',
      'Integrated ASCII art',
      'Managed file structures',
    ],
    techStackContext:
      'Applied foundational OOP concepts to build a modular Java game architecture, utilizing native file I/O for state handling and custom ASCII asset rendering.',
  },
  {
    id: 'medfinds',
    name: 'MedFinds',
    type: 'Healthcare & HCI Simulation',
    status: 'Figma & HCI Prototype',
    visual: 'document',
    role: 'Team Leader',
    context: 'CIT–U Human-Computer Interaction Project',
    summary: 'A medicine-finding simulation built with complex functional Figma components and psychological HCI principles.',
    description:
      'MedFinds is a healthcare medicine-finding simulation engineered to optimize medical accessibility through psychological human-machine interaction and complex functional Figma components.',
    tags: ['Figma', 'HCI Principles', 'UI/UX Simulation', 'Medical Accessibility'],
    demoUrl: 'https://www.figma.com/design/7budAr0OWWmDh5aptqSuPk/MedFinds?node-id=0-1&t=23I84adWQvFW6AtQ-1',
    demoLabel: 'View Figma Prototype',
    bullets: [
      'Medicine-finding simulation',
      'Applied psychological human-machine interaction',
      'Built complex functional components',
    ],
    highlights: [
      'Medicine-finding simulation',
      'Applied psychological human-machine interaction',
      'Built complex functional components',
    ],
    techStackContext:
      'Designed complex, highly functional Figma simulations driven by strict Human-Computer Interaction (HCI) principles to optimize the user journey for medical accessibility.',
  },
  {
    id: 'empathtune-android',
    name: 'EmpathTune (Android Studio)',
    type: 'Mobile Development · Native Android',
    status: 'Android Studio Build',
    visual: 'music',
    role: 'Mobile Developer',
    context: 'Native Android & Spotify API Integration',
    summary: 'A native Android application featuring proper UI slicing, LLM prompting libraries, and physical phone hosting.',
    description:
      'EmpathTune (Android Studio) is a native Android mobile build integrating the Spotify API for music data, proper XML/Kotlin UI slicing, prebuilt LLM prompting libraries, and third-party device hosting for real-world usability testing.',
    tags: ['Android Studio', 'Kotlin', 'Spotify API', 'LLM Prompting', 'Mobile UI'],
    repoUrl: 'https://github.com/kenj-1/EmpathTuneApplication.git',
    bullets: [
      'Android phone hosting',
      'Proper UI slicing',
      'Utilized prebuilt libraries for LLM prompting',
    ],
    highlights: [
      'Android phone hosting',
      'Proper UI slicing',
      'Utilized prebuilt libraries for LLM prompting',
    ],
    techStackContext:
      'Engineered a native Android application using Android Studio, integrating the Spotify API for music data and configuring third-party device hosting for real-world usability testing.',
  },
  {
    id: 'empathtune-web',
    name: 'EmpathTune (Web Development)',
    type: 'Fullstack Web · Music & NLP',
    status: 'in-development',
    visual: 'music',
    role: 'Fullstack Developer',
    context: 'Fullstack Web Transition · Supabase & OAuth',
    summary: 'Fullstack web platform utilizing NLP prompts to foster human connection through shared music taste.',
    description:
      'EmpathTune (Web Development) transitions the EmpathTune experience to the web, combining Supabase backend database management, Google OAuth authentication, and NLP API integrations to connect people via music taste.',
    tags: ['Supabase', 'Google OAuth', 'NLP API', 'Fullstack Web', 'Django / Python'],
    bullets: [
      'Web transition',
      'NLP prompts for human connection via music taste',
    ],
    highlights: [
      'Web transition',
      'NLP prompts for human connection via music taste',
    ],
    techStackContext:
      'Architected a secure web application utilizing Supabase for backend database management and integrated Google OAuth for secure, seamless user authentication. Leveraged NLP API integrations to simulate human connection.',
  },
  {
    id: 'excellent',
    name: 'Excellent - Oltek',
    type: 'Automation & productivity',
    status: 'Hackathon project',
    visual: 'document',
    image: excellent640,
    imageSrcSet: `${excellent640} 640w, ${excellent1280} 1280w`,
    imageSizes: '(max-width: 768px) 92vw, (max-width: 1200px) 46vw, 560px',
    imageWidth: 1280,
    imageHeight: 566,
    imageAlt: 'ExcelLent web interface showing PDF, Word, CSV, and TXT to Excel conversion tools',
    role: 'Full-Stack & Document Pipeline Builder',
    summary: 'Turning documents into organized spreadsheets, with less manual work.',
    description:
      'ExcelLent is a hackathon project that explores converting PDF, CSV, DOCX, and TXT files into formatted Excel workbooks.',
    tags: ['Django REST', 'Python', 'Next.js'],
    context: 'Logistics Automation Challenge',
    repoUrl: 'https://github.com/kenj-1/Oltek.git',
    bullets: [
      'Mastered data parsing',
      'Implemented technical Python workflows',
      'Bulk multi-format processing with ZIP output',
    ],
    highlights: [
      'Mastered data parsing.',
      'Implemented technical Python workflows.',
      'Bulk multi-format processing with ZIP output.',
    ],
    techStackContext:
      'Engineered backend solutions utilizing advanced Python architectures. Implemented robust data parsing algorithms and structured technical workflows to optimize data processing.',
  },
];

// Highlighted milestones per year in the Technical Journey ([ 04 ] // JOURNEY)
export const journeyMilestones = {
  2025: {
    id: 'milestone-2025-version-control',
    year: 2025,
    title: 'Version Control & Collaboration',
    content:
      'Version Control & Collaboration: Mastered Git and GitHub, enabling seamless team collaboration, branching strategies, and CI/CD foundations for complex software projects.',
  },
};

// Years are when learning began, not proficiency levels or end dates.
export const techJourney = [
  {
    id: 'c',
    year: 2024,
    name: 'C',
    category: 'Programming language',
    logo: cLogo,
    summary: 'Started learning C in 2024.',
    learningPoints: [],
    applications: [],
    relatedProjectIds: [],
  },
  {
    id: 'git-github',
    year: 2025,
    name: 'Version Control & Collaboration',
    category: 'Git & GitHub · 2025 Milestone',
    logo: null,
    isMilestone: true,
    summary:
      'Version Control & Collaboration: Mastered Git and GitHub, enabling seamless team collaboration, branching strategies, and CI/CD foundations for complex software projects.',
    learningPoints: [
      'Mastered Git and GitHub workflows for multi-developer academic and hackathon repositories.',
      'Applied structured branching strategies, pull request reviews, and conflict resolution.',
      'Established CI/CD foundations for complex software projects.',
    ],
    applications: [
      'Version Control & Collaboration: Mastered Git and GitHub, enabling seamless team collaboration, branching strategies, and CI/CD foundations for complex software projects.',
    ],
    relatedProjectIds: [
      'encantadia-echoes-of-the-gems',
      'encantadia-turn-of-the-gems',
      'medfinds',
      'empathtune-android',
      'empathtune-web',
    ],
  },
  {
    id: 'java',
    year: 2025,
    name: 'Java',
    category: 'Programming language',
    logo: javaLogo,
    summary: 'Used with Swing and JDBC in the Encantadia game projects.',
    learningPoints: [],
    applications: [
      'Encantadia: Echoes of the Gems uses Java, Swing, and JDBC for a graphical fighting & RPG game.',
      'Encantadia: Turn of the Gems uses Java OOP and file I/O for a modular console strategy game.',
    ],
    relatedProjectIds: ['encantadia-echoes-of-the-gems', 'encantadia-turn-of-the-gems'],
  },
  {
    id: 'html',
    year: 2025,
    name: 'HTML',
    category: 'Markup language',
    logo: htmlLogo,
    summary: 'Page structure for this portfolio.',
    learningPoints: [],
    applications: ['This portfolio uses HTML for its page structure.'],
    relatedProjectIds: [],
  },
  {
    id: 'css',
    year: 2025,
    name: 'CSS',
    category: 'Style sheet language',
    logo: cssLogo,
    summary: 'Responsive styles and themes in this portfolio.',
    learningPoints: [],
    applications: ['This portfolio uses CSS for responsive layouts and light and dark themes.'],
    relatedProjectIds: [],
  },
  {
    id: 'javascript',
    year: 2025,
    name: 'JavaScript',
    category: 'Programming language',
    logo: javascriptLogo,
    summary: 'Interactions in this portfolio.',
    learningPoints: [],
    applications: ['This portfolio uses JavaScript for its interactive components.'],
    relatedProjectIds: [],
  },
  {
    id: 'tailwind-css',
    year: 2025,
    name: 'Tailwind CSS',
    category: 'CSS framework',
    logo: tailwindLogo,
    summary: 'Part of this portfolio’s styling setup.',
    learningPoints: [],
    applications: ['Tailwind CSS is configured in this portfolio’s Vite setup.'],
    relatedProjectIds: [],
  },
  {
    id: 'figma',
    year: 2025,
    name: 'Figma',
    category: 'Design tool',
    logo: figmaLogo,
    summary: 'Used for HCI simulations in MedFinds and UI slicing in EmpathTune.',
    learningPoints: [],
    applications: [
      'Designed complex, highly functional Figma simulations driven by strict HCI principles for MedFinds.',
    ],
    relatedProjectIds: ['medfinds', 'empathtune-android'],
  },
  {
    id: 'notion',
    year: 2025,
    name: 'Notion',
    category: 'Productivity & Documentation',
    logo: notionLogo,
    summary: 'Documentation, sprint tracking, and project organization across academic and hackathon workflows.',
    learningPoints: [
      'Engineered structured knowledge bases, product documentation, and database schemas for software projects.',
      'Organized sprint roadmaps, kanban pipelines, and design specs for hackathon builds.',
    ],
    applications: [
      'Used for project planning, feature specifications, and team knowledge bases across software projects.',
    ],
    relatedProjectIds: ['medfinds', 'empathtune-web', 'nagaalaga-mobile'],
  },
  {
    id: 'python',
    year: 2026,
    name: 'Python',
    category: 'Programming language',
    logo: pythonLogo,
    summary: 'Listed in EmpathTune and ExcelLent stacks.',
    learningPoints: [],
    applications: [],
    relatedProjectIds: ['empathtune-web', 'excellent'],
  },
  {
    id: 'react',
    year: 2026,
    name: 'React',
    category: 'UI library',
    logo: reactLogo,
    summary: 'Component UI in this portfolio.',
    learningPoints: [],
    applications: ['This portfolio uses React for its components and dialogs.'],
    relatedProjectIds: [],
  },
  {
    id: 'sql',
    year: 2026,
    name: 'SQL',
    category: 'Query language',
    logo: sqlLogo,
    summary: 'Started learning SQL in 2026.',
    learningPoints: [],
    applications: [],
    relatedProjectIds: [],
  },
  {
    id: 'supabase',
    year: 2026,
    name: 'Supabase',
    category: 'Backend platform',
    logo: supabaseLogo,
    logoScale: 1.35,
    summary: 'Backend database & auth platform in EmpathTune (Web Development).',
    learningPoints: [],
    applications: [
      'Used in EmpathTune (Web Development) for backend database management alongside Google OAuth.',
    ],
    relatedProjectIds: ['empathtune-web'],
  },
  {
    id: 'spring-boot',
    year: 2026,
    name: 'Spring Boot',
    category: 'Java framework',
    logo: springBootLogo,
    summary: 'Started learning Spring Boot in 2026.',
    learningPoints: [],
    applications: [],
    relatedProjectIds: [],
  },
];

export const leadershipExperiences = [
  {
    id: 'lead-encantadia',
    role: 'Team Leader',
    title: 'Encantadia: Echoes of the Gems',
    organization: 'CIT–U Software Architecture',
    period: '2025',
    badge: 'OOP Architecture',
    category: 'Academic Technical Leadership',
    bullets: [
      'Led core game logic structuring under strict Object-Oriented Programming (OOP) principles.',
      'Directed Java Swing GUI state management and JDBC relational database persistence.',
    ],
  },
  {
    id: 'lead-medfinds',
    role: 'Team Leader',
    title: 'MedFinds',
    organization: 'CIT–U Healthcare Innovation',
    period: '2025 — 2026',
    badge: 'HCI Simulation',
    category: 'Human-Computer Interaction',
    bullets: [
      'Directed user-centered simulation applying psychological HCI accessibility principles.',
      'Architected complex functional component systems and verified pharmacy locator flows in Figma.',
    ],
  },
  {
    id: 'lead-nagaalaga',
    role: 'Data Analyst',
    title: 'Nagaalaga Maternal Health Platform',
    organization: 'Regional Naga City Hackathon',
    period: '2026',
    badge: 'Semi-Finalist',
    category: 'Civic HealthTech Hackathon',
    bullets: [
      'Established quality control metrics, app performance telemetry, and test documentation.',
      'Drove structured data verification records that propelled the team to the competition semi-finals.',
    ],
  },
  {
    id: 'css-pr-head',
    role: 'Committee Head',
    title: 'Committee on Public Relations',
    organization: 'Computer Students Society · CIT–U',
    orgLogo: cssOrgLogo,
    period: 'June 2026 — Present',
    badge: 'Department Leadership',
    category: 'Student Leadership & Outreach',
    bullets: [
      'Spearhead marketing strategy, publication deliverables, and digital communications across the student body.',
      'Coordinate technical administration for online assemblies and manage community outreach campaigns.',
    ],
  },
  {
    id: 'aws-wildquacc-ops',
    role: 'Assistant Department Head',
    title: 'Operations Department',
    organization: 'AWS Student Builder Group – Wildquacc',
    orgLogo: awsOrgLogo,
    period: 'January 2026 — Present',
    badge: 'Cloud Community',
    category: 'Cloud Builder Community',
    bullets: [
      'Supervise operational logistics, seminar materials, and event coordination for campus AWS builder workshops.',
    ],
  },
  {
    id: 'san-remigio-spes',
    role: 'IT Support',
    title: 'Municipal Records & Systems Support',
    organization: 'Municipality of San Remigio · SPES',
    period: 'May — June 2025',
    badge: 'Public Sector IT',
    category: 'Technical Operations',
    bullets: [
      'Maintained and troubleshot municipal office PC hardware, reducing workstation downtime.',
      'Handled post-election records and citizen voters’ certificates with dependable accuracy.',
    ],
  },
];

export const experiences = leadershipExperiences;

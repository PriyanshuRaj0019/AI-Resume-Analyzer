import { RolePreset } from "../types";

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "fullstack",
    name: "Full-Stack Engineer",
    description: "Evaluates standard Node, React, Cloud, Databases and API development alignment.",
    suggestedJobDescription: `We are looking for a Senior Full-Stack Engineer to lead the development of our core web platform. 
Requirements:
- Strong experience with React, TypeScript, and modern state management.
- Backend proficiency with Node.js (Express), design of REST and GraphQL APIs.
- Deep knowledge of relational databases such as PostgreSQL or MySQL.
- AWS cloud experience (ECS, RDS, S3, CloudWatch) and Docker containerization.
- Familiarity with CI/CD pipelines (GitHub Actions) and automated testing frameworks (Jest/Cypress).`
  },
  {
    id: "frontend",
    name: "Frontend Developer",
    description: "Evaluates CSS, UI performance, state systems and modern design architecture alignment.",
    suggestedJobDescription: `We are seeking a Frontend Developer focused on building gorgeous, fast, and accessible user experiences.
Requirements:
- Extensive production experience with React, Vue, or Next.js, and TypeScript.
- Strong utility-first CSS skills using Tailwind CSS, responsive design, and fluid typography.
- Deep understanding of Web Performance optimization, bundle splitting, and client-side caching.
- Experience with interactive animations (e.g., Framer Motion / Motion).
- Accessibility standards compliance (WAI-ARIA, WCAG 2.1 AA).`
  },
  {
    id: "datascientist",
    name: "Data Scientist / ML Engineer",
    description: "Evaluates statistics, ML models, feature engineering and analytics tooling.",
    suggestedJobDescription: `We are hiring a Data Scientist to build predictive models and extract value from multi-TB user behavioral datasets.
Requirements:
- Advanced programming in Python (Pandas, NumPy, Scikit-Learn) or R.
- Implementation of Deep Learning frameworks such as TensorFlow or PyTorch.
- Strong SQL querying for complex data joins, window functions, and performance tuning.
- Data storytelling using visualizers like D3.js, Tableau, or Seaborn.
- Experience productionalizing ML models (MLflow, Triton, FastAPI containerization).`
  },
  {
    id: "productmanager",
    name: "Product Manager",
    description: "Evaluates planning, scrum, agile delivery, strategy, and business analytics integration.",
    suggestedJobDescription: `We are looking for an technical Product Manager to collaborate with engineering and design to launch high-customer-retention features.
Requirements:
- Proven experience owning a software product roadmap in an Agile/Scrum environment.
- Strong metric-driven analytical mindset using SQL, Mixpanel, Amplitude, or Google Analytics.
- Experience writing concrete PRDs (Product Requirement Documents) and comprehensive user stories.
- Ability to bridge business strategy with deep engineering architectural constraints.
- Exceptional stakeholder communication and presentation skills.`
  },
  {
    id: "designer",
    name: "UI/UX Product Designer",
    description: "Evaluates Figma proficiency, user testing, design systems, and visual layouts.",
    suggestedJobDescription: `We are seeking a UI/UX Product Designer to design beautiful interfaces and conduct empirical user research studies.
Requirements:
- Mastery of Figma, including auto-layout, component libraries, and master variables.
- Creation of cohesive Design Systems across web and mobile viewports.
- Conducting user interviews, Usability Testing, and translating research into wireframes.
- High aesthetic sense for clean grids, color-theory palettes, and motion heuristics.
- Basic understanding of web constructs (HTML/CSS/JS) to hand off seamlessly to developers.`
  }
];

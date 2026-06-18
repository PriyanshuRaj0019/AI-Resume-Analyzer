import { ResumeAnalysisResult } from "../types";

export interface HistoricScan {
  id: string;
  filename: string;
  timestamp: string;
  candidateName: string;
  candidateTitle: string;
  matchScore: number;
  targetRole: string;
  result: ResumeAnalysisResult;
}

export const SAMPLE_SCANS: HistoricScan[] = [
  {
    id: "scan_101",
    filename: "Sarah_Cooper_Resume_v4.pdf",
    timestamp: "2026-06-17T14:30:00Z",
    candidateName: "Sarah Cooper",
    candidateTitle: "Senior Frontend Architect",
    matchScore: 89,
    targetRole: "Frontend Developer",
    result: {
      candidateName: "Sarah Cooper",
      candidateTitle: "Senior Frontend Architect",
      contactInfo: {
        email: "sarah.cooper@devmail.com",
        phone: "+1 (555) 432-8761",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/sarah-cooper-fed",
        github: "github.com/scooper-codes"
      },
      summary: "Innovative Frontend Architect with 7+ years of experience constructing high-performance user interfaces and fluid web portals. Specialized in client-side bundling, design systems, and rapid responsive engineering.",
      skills: {
        technical: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vite", "Webpack", "A11y/WCAG", "Framer Motion"],
        soft: ["Technical Leadership", "Agile Roadmap Execution", "User-Centric Design Heuristics", "Mentorship"]
      },
      experience: [
        {
          role: "Lead Frontend Engineer",
          company: "SyncVelo Systems",
          duration: "2023 - Present",
          highlights: [
            "Architected new internal utility CSS and React design system, cutting initial visual bundle size by 35% across 4 core applications.",
            "Spearheaded accessibility audit to bring customer checkouts into complete WCAG 2.1 AA compliance.",
            "Optimized client-side cache layers and state stores, elevating Lighthouse performance scores from 64 to 98."
          ]
        },
        {
          role: "Senior UI Architect",
          company: "Novaflux Labs",
          duration: "2020 - 2023",
          highlights: [
            "Constructed dynamic drag-and-drop dashboard interfaces utilizing motion layout nodes and real-time canvas updates.",
            "Coordinated migration of core platform from Legacy Webpack setup to modernized Vite structures, saving developers 12 hours/week in HMR hot reload lag."
          ]
        }
      ],
      strengths: [
        {
          area: "Bundle Optimization & Performance",
          explanation: "Demonstrates advanced skill in web vitals, Lighthouse tuning, and modern build tooling setups (Vite/Webpack).",
          example: "Elevated platform core Lighthouse scores from 64 to 98."
        },
        {
          area: "Design System Engineering",
          explanation: "Strong competence in converting branding guidelines into modular, highly accessible client components.",
          example: "Created stateful UI components serving 4 major app frameworks."
        }
      ],
      missingSkills: [
        {
          skill: "Server-Side Rendering (SSR) Security",
          importance: "Highly Preferred",
          context: "Critical when dealing with enterprise dynamic session verification inside edge environments."
        }
      ],
      matchScore: 89,
      gapsAndRecommendations: [
        {
          section: "Enterprise Security Layout",
          observation: "Resume highlights exceptional client performance but lacks evidence of database/session token storage rules.",
          actionableFeedback: "Explicitly mention your handling of JWT storing, secure cookies, and Cross-Site Scripting (XSS) mitigation."
        }
      ]
    }
  },
  {
    id: "scan_102",
    filename: "Alex_Chen_CV.pdf",
    timestamp: "2026-06-16T11:15:00Z",
    candidateName: "Alex Chen",
    candidateTitle: "Full-Stack Software Developer",
    matchScore: 74,
    targetRole: "Full-Stack Engineer",
    result: {
      candidateName: "Alex Chen",
      candidateTitle: "Full-Stack Software Developer",
      contactInfo: {
        email: "alex.chen-dev@webnet.io",
        phone: "+1 (555) 890-4123",
        location: "Seattle, WA",
        github: "github.com/achen-fullstack"
      },
      summary: "Adaptable Full-Stack Engineer with 3+ years of experience implementing end-to-end web services, backend APIs, and React interfaces. Eager to optimize databases and design resilient software platforms.",
      skills: {
        technical: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "REST APIs", "AWS S3", "Git"],
        soft: ["Team Collaboration", "Empirical Problem Solving", "Systematic Diagnosis", "Scrum Frameworks"]
      },
      experience: [
        {
          role: "Software Engineer II",
          company: "Hyperion Digital",
          duration: "2024 - Present",
          highlights: [
            "Designed and implemented 15+ backend secure REST API endpoints in Express, improving database responses with optimized query joins.",
            "Developed fully customizable tables, filter rows, and dynamic layouts for managing database workflows."
          ]
        },
        {
          role: "Junior Software Specialist",
          company: "Apex Tech Labs",
          duration: "258 - 2024",
          highlights: [
            "Composed unit and system integration suites in Jest, expanding code coverage by 18% and preventing critical merge breaks."
          ]
        }
      ],
      strengths: [
        {
          area: "API Architecture & SQL Performance",
          explanation: "Solid baseline designing clean REST APIs and utilizing SQL joins/indexes for database response optimization.",
          example: "Built backend REST API endpoints and tuned database execution queries."
        },
        {
          area: "Automated Integration Testing",
          explanation: "Takes systematic ownership of quality, configuring reliable test suites to guard merges.",
          example: "Expanded testing code coverage metrics by 18%."
        }
      ],
      missingSkills: [
        {
          skill: "Docker / Containerization",
          importance: "Critical",
          context: "Modern cloud deploys require containerized packages to ensure standardized horizontal node scaling."
        },
        {
          skill: "CI/CD Pipeline Design",
          importance: "Highly Preferred",
          context: "Integrating automated test validation suites with GitHub Actions to accelerate deployments safely."
        }
      ],
      matchScore: 74,
      gapsAndRecommendations: [
        {
          section: "Cloud Integration Highlights",
          observation: "Mention of AWS S3 exists but general containerization or cloud compute setups (ECS, EC2, CloudWatch) are omitted.",
          actionableFeedback: "Describe how your APIs were deployed. If they ran inside Docker, or utilized Serverless Lambda, indicate it in your accomplishments."
        }
      ]
    }
  }
];

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  duration?: string;
  highlights?: string[];
}

export interface StrengthItem {
  area: string;
  explanation: string;
  example?: string;
}

export interface MissingSkillItem {
  skill: string;
  importance: "Critical" | "Highly Preferred" | "Optional" | string;
  context: string;
}

export interface RecommendationItem {
  section: string;
  observation: string;
  actionableFeedback: string;
}

export interface ResumeAnalysisResult {
  candidateName: string;
  candidateTitle: string;
  contactInfo: ContactInfo;
  summary: string;
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: ExperienceItem[];
  strengths: StrengthItem[];
  missingSkills: MissingSkillItem[];
  matchScore: number;
  gapsAndRecommendations: RecommendationItem[];
}

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  suggestedJobDescription: string;
}

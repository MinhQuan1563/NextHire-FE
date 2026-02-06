import { SkillLevel } from './skill-level.enum';

/**
 * Skill item structure
 */
export interface SkillItem {
  name: string; // max 100 chars
  level: SkillLevel;
  yearsOfExperience?: number; // non-negative number, optional
}

/**
 * Skills JSON structure
 * Stored as JSON string in UserProfileDto
 */
export interface SkillsJson {
  skills: SkillItem[];
}

/**
 * Experience item structure
 */
export interface ExperienceItem {
  company: string; // max 200 chars
  position: string; // max 200 chars
  startDate: string; // YYYY-MM-DD format
  endDate: string | null; // YYYY-MM-DD format or null
  isCurrent: boolean;
  description?: string; // max 2000 chars, optional
  achievements?: string[]; // each max 500 chars, optional
}

/**
 * Experience JSON structure
 * Stored as JSON string in UserProfileDto
 */
export interface ExperienceJson {
  experiences: ExperienceItem[];
}

/**
 * Education item structure
 */
export interface EducationItem {
  institution: string; // max 200 chars
  degree: string; // max 200 chars
  fieldOfStudy?: string; // max 200 chars, optional
  startDate: string; // YYYY-MM-DD format
  endDate: string | null; // YYYY-MM-DD format or null
  isCurrent: boolean;
  grade?: string; // max 50 chars, optional
  description?: string; // max 1000 chars, optional
}

/**
 * Education JSON structure
 * Stored as JSON string in UserProfileDto
 */
export interface EducationJson {
  educations: EducationItem[];
}

/**
 * Personal Project item structure
 */
export interface PersonalProjectItem {
  name: string; // max 200 chars
  description?: string; // max 2000 chars, optional
  technologies?: string[]; // each max 100 chars, optional
  startDate: string; // YYYY-MM-DD format
  endDate: string | null; // YYYY-MM-DD format or null
  isCurrent: boolean;
  url?: string; // valid URL format, optional
  githubUrl?: string; // valid URL format, optional
}

/**
 * Personal Projects JSON structure
 * Stored as JSON string in UserProfileDto
 */
export interface PersonalProjectsJson {
  projects: PersonalProjectItem[];
}

/**
 * Saved Job item structure
 */
export interface SavedJobItem {
  jobCode: string;
  savedDate: string; // YYYY-MM-DDTHH:mm:ssZ format (ISO 8601)
}

/**
 * Saved Jobs JSON structure
 * Stored as JSON string in UserProfileDto
 */
export interface SavedJobsJson {
  savedJobs: SavedJobItem[];
}


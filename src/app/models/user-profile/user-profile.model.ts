import { Gender } from './gender.enum';
import {
  SkillsJson,
  ExperienceJson,
  EducationJson,
  PersonalProjectsJson,
  SavedJobsJson
} from './profile-json-structures.model';

/**
 * UserProfileDto interface
 * Matches API schema: NextHireApp.Dtos.UserProfileDto
 */
export interface UserProfileDto {
  id: string; // UUID format
  userCode: string | null;
  fullName: string | null;
  dateOfBirth: string | null; // date-time format (ISO 8601)
  gender: Gender; // integer enum
  avatarUrl: string | null;
  skills: string | null; // JSON string of SkillsJson
  experience: string | null; // JSON string of ExperienceJson
  education: string | null; // JSON string of EducationJson
  personalProjects: string | null; // JSON string of PersonalProjectsJson
  portfolioUrl: string | null;
  savedJobs: string | null; // JSON string of SavedJobsJson
}

/**
 * Parsed UserProfile with typed JSON structures
 * Use this for component display logic
 */
export interface ParsedUserProfile {
  id: string;
  userCode: string | null;
  fullName: string | null;
  dateOfBirth: Date | null;
  gender: Gender;
  avatarUrl: string | null;
  skills: SkillsJson | null;
  experience: ExperienceJson | null;
  education: EducationJson | null;
  personalProjects: PersonalProjectsJson | null;
  portfolioUrl: string | null;
  savedJobs: SavedJobsJson | null;
}


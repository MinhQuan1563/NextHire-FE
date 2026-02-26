export interface AppUser {
  id: string;
  userCode: string;
  fullName?: string;
  dateOfBirth?: string;
  gender: GenderType;
  avatarUrl?: string;
  skills?: string;
  experience?: string;
  education?: string;
  personalProjects?: string;
  portfolioUrl?: string;
  savedJobs?: string;
}

export enum GenderType {
  Male = 1,
  Female = 2
}
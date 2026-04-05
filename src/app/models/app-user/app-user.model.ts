import { Gender } from "../user-profile";

export interface AppUser {
  id: string;
  userCode: string;
  fullName?: string;
  dateOfBirth?: string;
  gender: Gender;
  avatarUrl?: string;
  skills?: string;
  experience?: string;
  education?: string;
  personalProjects?: string;
  portfolioUrl?: string;
  savedJobs?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  isLocked?: boolean;
}

export interface GetUsersInput {
  filter?: string;
  isLocked?: boolean | null;
  skipCount: number;
  maxResultCount: number;
}
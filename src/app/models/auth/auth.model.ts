import { Gender } from "../user-profile";

export interface LoginRequest {
  userNameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  token: string;
  password: string;
}

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   fullName: string;
//   phoneNumber?: string;
//   profilePicture?: string;
//   avatarUrl?:string;
//   roles: string[];
// }

export interface User {
  id: string;
  userCode: string;
  fullName?: string;
  dateOfBirth?: string;
  gender: Gender;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  skills?: string;
  experience?: string;
  education?: string;
  personalProjects?: string;
  portfolioUrl?: string;
  savedJobs?: string;
}
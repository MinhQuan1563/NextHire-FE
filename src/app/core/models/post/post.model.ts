export interface PostResponse {
  postCode: string;
  userCode: string;
  content?: string;
  imageBase64s?: string[];
  postVersion: number;
  createdAt: string;
  modifiledDate: string;
  privacy: number;
  likeCount: number;
  commentCount: number;
}

export interface PostCreateForm {
  content?: string;
  privacy: number;
  images?: File[];
}

export interface PostUpdateForm {
  postCode: string;
  content?: string;
  privacy?: number;
  images?: File[];
}
export interface PostLike {
  likeId: string;
  postCode: string;
  userCode: string;
  type: number;
  createAt: string;
}

export interface CreatePostLike {
  postCode: string;
  type: number;
}
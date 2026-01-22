// Đã có PostResponse, PostCreateForm, PostUpdateForm

export interface PostComment {
  commentId: string;
  parentId?: string;
  postCode: string;
  userCode: string;
  content?: string;
  attachment?: string;
  createAt: string;
  childCommentCount: number;
}

export interface CreatePostComment {
  parentId?: string;
  postCode: string;
  content: string;
  attachment?: string;
}

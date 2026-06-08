export interface Comment {
  id: number;
  postId: number;
  userId: number;
  body: string;
  createdAt?: string;
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface CommentDto {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt?: string;
}

export const dtoToComment = (dto: CommentDto): Comment => ({
  id: Number(dto.id),
  postId: Number(dto.postId),
  userId: Number(dto.userId),
  body: dto.body,
  createdAt: dto.createdAt,
});

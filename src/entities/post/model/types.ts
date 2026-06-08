export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  tags?: string[];
  createdAt?: string;
}

export interface PostWithAuthor extends Post {
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface PostsPageParams {
  page: number;
  limit: number;
  userId?: number;
  tag?: string;
  query?: string;
}

export interface PostsPage {
  posts: Post[];
  total: number;
}

interface PostDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags?: string[];
  createdAt?: string;
}

export const dtoToPost = (dto: PostDto): Post => ({
  id: Number(dto.id),
  userId: Number(dto.userId),
  title: dto.title,
  body: dto.body,
  tags: dto.tags,
  createdAt: dto.createdAt,
});

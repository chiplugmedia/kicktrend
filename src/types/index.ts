export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage?: string | null;
  videoUrl?: string | null;
  category: string;
  tags: string;
  hashtags: string;
  readTime: number;
  views?: number;
  published: boolean;
  status?: string; // "pending" | "approved" | "rejected"
  rejectionReason?: string | null;
  createdAt: Date | string;
  authorUsername: string;
  author?: {
    username: string;
    avatar?: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  likesCount?: number;
  commentsCount?: number;
}

export interface PostDetail extends PostSummary {
  content: string;
  comments: {
    id: number;
    content: string;
    createdAt: Date | string;
    postId: number;
    authorUsername: string;
    author: {
      username: string;
      avatar?: string | null;
    };
  }[];
  likes: {
    id: number;
    postId: number;
    authorUsername: string;
  }[];
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  commentCount: number;
  likedBy: string[];
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
}

export type ArticleStatus = 'draft' | 'published' | 'scheduled';

export interface ArticleDraft {
  id: string;
  authorId: string;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  originalArticleId?: string;
}

export const CATEGORIES: string[] = [
  'Technology',
  'AI',
  'Programming',
  'Business',
  'Finance',
  'Travel',
  'Design',
  'Productivity',
  'Science',
  'Lifestyle'
];
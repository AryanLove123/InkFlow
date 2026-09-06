export interface SeedAuthor {
  uid: string;
  name: string;
  email: string;
  bio: string;
  avatarSeed: string;
}

export interface SeedArticleSpec {
  title: string;
  description: string;
  category: string;
  tags: string[];
  authorIndex: number;
  daysAgo: number;
  views: number;
  likeCount: number;
}
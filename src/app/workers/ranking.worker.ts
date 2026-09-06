import { score } from "firebase/firestore/pipelines";

const HALF_LIFE_DAYS = 14;

interface WorkerArticle {
  id: string;
  views: number;
  likes: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
  category: string;
  tags: string[];
  authorId: string;
  status: string;
}

interface RankRequest {
  requestId: number;
  mode: 'popular' | 'featured' | 'recommend';
  articles: WorkerArticle[];
  preferences?: { categories: string[]; tags: string[] };
  context?: { likedAuthorIds: string[]; likedCategories: string[]; viewedArticleIds: string[] };
}

function popularityScore(a: WorkerArticle): number {
  return a.views * 1 + a.likes * 5 + a.commentCount * 3;
}

function recencyMultiplier(a: WorkerArticle): number {
  const publishedAt = a.publishedAt ?? a.createdAt;
  const ageDays = (Date.now() - new Date(publishedAt).getTime()) / 86400000;
  return Math.max(Math.pow(0.5, Math.max(ageDays, 0) / HALF_LIFE_DAYS), 0.05);
}

function finalScore(a: WorkerArticle): number {
  return popularityScore(a) * recencyMultiplier(a);
}

function featuredScore(a: WorkerArticle): number {
  return finalScore(a) + recencyMultiplier(a) * 50;
}

function recommendationScore(
  a: WorkerArticle,
  preferences: { categories: string[]; tags: string[] },
  context: { likedAuthorIds: string[]; likedCategories: string[]; viewedArticleIds: string[] },
): number {
  let score = 0;
  if (preferences.categories.includes(a.category)) score += 10;
  score += a.tags.filter((t) => preferences.tags.includes(t)).length * 5;
  if (context.likedAuthorIds.includes(a.authorId)) score += 3;
  if (context.likedCategories.includes(a.category)) score += 3;
  if (context.viewedArticleIds.includes(a.id)) score -= 1;
  score += finalScore(a) * 0.001;
  return score;
}

addEventListener('message', ({ data }: MessageEvent<{ type: string; payload: RankRequest }>) => {
  if (data.type !== 'rank') return;

  const { requestId, mode, articles, preferences, context } = data.payload;
  const publishedArticles = articles.filter((a) => a.status == 'published');

  let articleScores: { id: string; score: number }[];

  if (mode == 'popular') {
    articleScores = publishedArticles.map((a) => ({ id: a.id, score: finalScore(a) }));
  } else if (mode == 'featured') {
    articleScores = publishedArticles.map((a) => ({id: a.id, score: featuredScore(a)}));
  } else {
    const pref = preferences ?? {categories: [], tags: []}
    const ctx = context ?? {likedAuthorIds: [], likedCategories: [], viewedArticleIds: []}
    articleScores = publishedArticles.map((a) => ({id: a.id, score: recommendationScore(a, pref, ctx)}));
  }
  articleScores.sort((a,b) => b.score - a.score);

  const rankedArticleIds = articleScores.map((a) => a.id);

  postMessage({
    type: 'rank-result',
    payload: {requestId, rankedIds: rankedArticleIds}
  });
});

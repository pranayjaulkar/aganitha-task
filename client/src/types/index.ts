export interface ShortUrl {
  id: string;
  code: string;
  url: string;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

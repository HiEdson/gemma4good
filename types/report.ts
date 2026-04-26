export interface Report {
  id: string;
  userId: string;
  type: "daily" | "weekly" | "monthly";
  content: string; // AI generated synthesis of dietary tendencies.
  createdAt: string;
}

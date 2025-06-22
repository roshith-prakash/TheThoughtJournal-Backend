import { v4 as uuidv4 } from "uuid";

export const createSlug = (title: string): string => {
  const uidNum = uuidv4();

  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove invalid chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Collapse multiple hyphens

  return `${slug}-${uidNum}`;
};

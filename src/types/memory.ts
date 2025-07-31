export interface Memory {
  id: string;
  title: string;
  description: string;
  image: string[]; // from image_urls column
  rawDate: string; // ISO like "2025-07-30"
  iso: string;
}

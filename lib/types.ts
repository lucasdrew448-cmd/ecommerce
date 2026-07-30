export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  image_url?: string;
  imageUrl?: string;
  images?: string[];
  details: string[];
  additional_images?: unknown;
};

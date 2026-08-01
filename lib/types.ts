export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
  images?: string[];
  details: string[];
  category_id?: string;
  product_type_id?: string;
  supplier_id?: string;
  stock?: number;
  additional_images?: string;
  sizes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
};

export type ProductType = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
};

export type Supplier = {
  id: string;
  name: string;
  description?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: string;
  created_at?: string;
};

export type HeroBanner = {
  id: string;
  url: string;
  title?: string;
  description?: string;
  created_at?: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  status: string;
  helpful_count?: number;
  created_at?: string;
  users?: {
    id: string;
    full_name?: string;
    email?: string;
  };
  products?: {
    id: string;
    name?: string;
  };
};

export type OrderItem = {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customer_email?: string;
  customer_name?: string;
  shipping_address?: string;
  shipping_destination?: string;
  shipping_method?: string;
  shipping_cost?: number;
  total_price: number;
  status?: string;
  ip_address?: string;
  created_at?: string;
  order_items?: OrderItem[];
};

export type OrderInput = {
  items: OrderItem[];
  customer_email: string;
  customer_name: string;
  shipping_address: string;
  shipping_destination: string;
  shipping_method: string;
  shipping_cost: number;
  total_price: number;
  card_number: string;
  card_name: string;
  card_expiry: string;
  card_cvv: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_zip: string;
  billing_country: string;
};

export type UploadResult = {
  success: boolean;
  url: string;
  publicId: string;
  size: number;
};
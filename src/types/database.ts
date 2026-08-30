export type ShippingStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export type AppRole = "admin" | "customer";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  category_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  merchize_product_id: string | null;
  merchize_synced_at: string | null;
  design_data: DesignData | null;
  created_at: string;
  updated_at: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  garment_type: string;
  blank_image_url: string;
  print_area: { x: number; y: number; width: number; height: number };
  created_at: string;
}

export type DesignLayer =
  | {
      id: string;
      type: "image";
      url: string;
      x: number; // % of canvas, center point
      y: number;
      scale: number; // multiplier
      rotation: number; // degrees
      aop: boolean; // all-over-print: tile across the whole garment
    }
  | {
      id: string;
      type: "text";
      text: string;
      x: number;
      y: number;
      scale: number;
      rotation: number;
      color: string;
      fontFamily: string;
    };

export interface SideDesign {
  templateId: string;
  garmentColor: string;
  layers: DesignLayer[];
}

export interface DesignData {
  front: SideDesign | null;
  back: SideDesign | null;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  is_suspended: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: string;
  shipping_status: ShippingStatus;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  currency: string;
  display_currency: string;
  total: number;
  display_total: number;
  carrier: string | null;
  tracking_number: string | null;
  customer_name: string;
  customer_email: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface OrderStatusEvent {
  id: string;
  order_id: string;
  status: ShippingStatus;
  note: string | null;
  created_at: string;
}

export interface ExchangeRate {
  currency_code: string;
  rate_to_aud: number;
  updated_at: string;
}

export type Credentials = {
  phone: string;
  password: string;
};

export type SimaCategory = {
  id: number;
  name: string;
  slug: string;
  level: number;
  path: string;
  is_leaf: boolean;
  is_adult: boolean;
  icon: string;
};

export type SimaOffer = {
  id: number;
  sid: number;
  name: string;
  description: string;
  slug: string;
  balance: string;
  price: number;
  box_depth: number;
  box_height: number;
  box_width: number;
  depth: number;
  height: number;
  width: number;
  weight: number;
  is_price_fixed: boolean;
  is_adult: boolean;
  is_markdown: boolean;
  trademark_id: number;
  country_id: number;
  unit_id: number;
  nested_unit_id: number;
  base_photo_url: string;
  minimum_order_quantity: number;
  min_qty: number;
  qty_multiplier: number;
  is_paid_delivery: boolean;
  supply_period: number;
  is_remote_store: boolean;
  parent_item_id: number;
  barcodes?: string[];
  is_exclusive: boolean;
  category_id: number;
  wholesale_price: number;
  price_max: number;
  is_protected: boolean;
  wholesale?: any;
  vat: number;
}

export type SimaOfferCategory = {
  id: number;
  item_id: number;
  category_id: number;
}
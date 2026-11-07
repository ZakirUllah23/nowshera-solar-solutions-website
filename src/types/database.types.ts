export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "admin" | "staff";
export type StockStatus = "in_stock" | "out_of_stock" | "available_on_order";
export type PublicationStatus = "draft" | "published" | "archived";
export type DiscountType = "percentage" | "fixed_amount" | "special_price";
export type PriceTargetType = "product" | "package";
export type EnquiryStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "quoted"
  | "converted"
  | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          description: string | null;
          tier_rating: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          tier_rating?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          tier_rating?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          brand_id: string | null;
          name: string;
          slug: string;
          sku: string;
          short_description: string | null;
          description: string | null;
          specifications: Json;
          regular_price: number;
          inventory_status: StockStatus;
          publication_status: PublicationStatus;
          is_featured: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          brand_id?: string | null;
          name: string;
          slug: string;
          sku: string;
          short_description?: string | null;
          description?: string | null;
          specifications?: Json;
          regular_price: number;
          inventory_status?: StockStatus;
          publication_status?: PublicationStatus;
          is_featured?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          brand_id?: string | null;
          name?: string;
          slug?: string;
          sku?: string;
          short_description?: string | null;
          description?: string | null;
          specifications?: Json;
          regular_price?: number;
          inventory_status?: StockStatus;
          publication_status?: PublicationStatus;
          is_featured?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      packages: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          capacity_kw: number;
          installation_cost: number;
          additional_costs: number;
          manual_price_override: number | null;
          inventory_status: StockStatus;
          publication_status: PublicationStatus;
          featured_image_url: string | null;
          is_featured: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          capacity_kw: number;
          installation_cost?: number;
          additional_costs?: number;
          manual_price_override?: number | null;
          inventory_status?: StockStatus;
          publication_status?: PublicationStatus;
          featured_image_url?: string | null;
          is_featured?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          capacity_kw?: number;
          installation_cost?: number;
          additional_costs?: number;
          manual_price_override?: number | null;
          inventory_status?: StockStatus;
          publication_status?: PublicationStatus;
          featured_image_url?: string | null;
          is_featured?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      package_items: {
        Row: {
          id: string;
          package_id: string;
          product_id: string;
          quantity: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          product_id: string;
          quantity: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          product_id?: string;
          quantity?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          discount_type: DiscountType;
          discount_value: number;
          start_time: string;
          end_time: string;
          is_enabled: boolean;
          banner_image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          discount_type: DiscountType;
          discount_value: number;
          start_time: string;
          end_time: string;
          is_enabled?: boolean;
          banner_image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          discount_type?: DiscountType;
          discount_value?: number;
          start_time?: string;
          end_time?: string;
          is_enabled?: boolean;
          banner_image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offer_products: {
        Row: {
          offer_id: string;
          product_id: string;
        };
        Insert: {
          offer_id: string;
          product_id: string;
        };
        Update: {
          offer_id?: string;
          product_id?: string;
        };
      };
      offer_packages: {
        Row: {
          offer_id: string;
          package_id: string;
        };
        Insert: {
          offer_id: string;
          package_id: string;
        };
        Update: {
          offer_id?: string;
          package_id?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          target_type: PriceTargetType;
          product_id: string | null;
          package_id: string | null;
          item_name: string;
          item_sku: string | null;
          price_field: string;
          previous_price: number | null;
          new_price: number | null;
          reason: string | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          target_type: PriceTargetType;
          product_id?: string | null;
          package_id?: string | null;
          item_name: string;
          item_sku?: string | null;
          price_field: string;
          previous_price?: number | null;
          new_price?: number | null;
          reason?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          target_type?: PriceTargetType;
          product_id?: string | null;
          package_id?: string | null;
          item_name?: string;
          item_sku?: string | null;
          price_field?: string;
          previous_price?: number | null;
          new_price?: number | null;
          reason?: string | null;
          changed_by?: string | null;
          created_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          email: string | null;
          city: string | null;
          address: string | null;
          message: string;
          product_id: string | null;
          package_id: string | null;
          status: EnquiryStatus;
          assigned_to: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          phone: string;
          email?: string | null;
          city?: string | null;
          address?: string | null;
          message: string;
          product_id?: string | null;
          package_id?: string | null;
          status?: EnquiryStatus;
          assigned_to?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          phone?: string;
          email?: string | null;
          city?: string | null;
          address?: string | null;
          message?: string;
          product_id?: string | null;
          package_id?: string | null;
          status?: EnquiryStatus;
          assigned_to?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      package_pricing_view: {
        Row: {
          package_id: string;
          name: string;
          slug: string;
          description: string | null;
          capacity_kw: number;
          installation_cost: number;
          additional_costs: number;
          manual_price_override: number | null;
          component_total: number;
          calculated_price: number;
          final_selling_price: number;
          is_manually_overridden: boolean;
          inventory_status: StockStatus;
          publication_status: PublicationStatus;
          is_featured: boolean;
          featured_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
      is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin_or_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_active_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      bootstrap_owner: {
        Args: { p_user_email: string };
        Returns: void;
      };
      get_package_calculated_price: {
        Args: { p_package_id: string };
        Returns: {
          component_total: number;
          calculated_price: number;
          final_selling_price: number;
          is_overridden: boolean;
        }[];
      };
      get_effective_product_price: {
        Args: { p_product_id: string; p_at_time?: string };
        Returns: {
          regular_price: number;
          promotional_price: number;
          discount_amount: number;
          offer_id: string | null;
          offer_title: string | null;
          discount_type: DiscountType | null;
          discount_value: number | null;
        }[];
      };
      get_effective_package_price: {
        Args: { p_package_id: string; p_at_time?: string };
        Returns: {
          component_total: number;
          calculated_price: number;
          manual_price_override: number | null;
          regular_selling_price: number;
          promotional_price: number;
          discount_amount: number;
          is_overridden: boolean;
          offer_id: string | null;
          offer_title: string | null;
          discount_type: DiscountType | null;
          discount_value: number | null;
        }[];
      };
    };
  };
}

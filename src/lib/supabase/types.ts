// Auto-generated Supabase types (run `supabase gen types typescript` to regenerate)
// For now this provides a typed scaffold matching our schema.sql

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';
export type ProjectStatus      = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type InvoiceStatus      = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ApprovalAction     = 'viewed' | 'approved' | 'rejected';
export type TaskPriority       = 'low' | 'medium' | 'high' | 'urgent';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          company_name: string | null;
          logo_url: string | null;
          brand_color: string;
          subscription_status: SubscriptionStatus;
          trial_starts_at: string;
          trial_ends_at: string;
          next_billing_date: string | null;
          billing_plan: 'monthly' | 'annual';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          freelancer_id: string;
          name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          login_token: string;
          portal_access: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'login_token' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          description: string | null;
          status: ProjectStatus;
          budget: number | null;
          deadline: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      files: {
        Row: {
          id: string;
          project_id: string;
          file_name: string;
          file_url: string;
          file_size: number | null;
          file_type: string | null;
          is_open_file: boolean;
          is_approved: boolean;
          approved_at: string | null;
          approved_ip: string | null;
          viewed_at: string | null;
          viewed_ip: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['files']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['files']['Insert']>;
      };
      shared_links: {
        Row: {
          id: string;
          file_id: string;
          type: 'approval' | 'view';
          slug: string;
          clicks: number;
          last_clicked_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shared_links']['Row'], 'id' | 'slug' | 'clicks' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['shared_links']['Insert']>;
      };
      approval_logs: {
        Row: {
          id: string;
          file_id: string;
          client_id: string | null;
          action: ApprovalAction;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['approval_logs']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      invoices: {
        Row: {
          id: string;
          freelancer_id: string;
          client_id: string;
          project_id: string | null;
          invoice_number: string;
          amount: number;
          gst_amount: number;
          total_amount: number;
          description: string | null;
          status: InvoiceStatus;
          payment_link: string | null;
          razorpay_payment_id: string | null;
          due_date: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          freelancer_id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          priority: TaskPriority;
          is_completed: boolean;
          due_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      custom_messages: {
        Row: {
          id: string;
          freelancer_id: string;
          category: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['custom_messages']['Insert']>;
      };
      white_label_settings: {
        Row: {
          freelancer_id: string;
          logo_url: string | null;
          brand_color: string;
          hide_branding: boolean;
          portal_title: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['white_label_settings']['Row']> & { freelancer_id: string };
        Update: Partial<Database['public']['Tables']['white_label_settings']['Row']>;
      };
      activity_logs: {
        Row: {
          id: string;
          freelancer_id: string;
          project_id: string | null;
          action: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      waitlist: {
        Row: { id: string; email: string; name: string | null; role: string | null; created_at: string };
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}

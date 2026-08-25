export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired';
export type ProjectStatus      = 'active' | 'on_hold' | 'completed' | 'cancelled';
export type InvoiceStatus      = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ApprovalAction     = 'viewed' | 'approved' | 'rejected';
export type TaskPriority       = 'low' | 'medium' | 'high' | 'urgent';

// ─── INDEPENDENT TABLE ROW & PLAYLOAD TYPES ───────────────────
// Declared separately to prevent circular type lookups in TypeScript

export type UserRow = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  company_name?: string | null;
  logo_url?: string | null;
  brand_color: string;
  subscription_status: string;
  trial_starts_at: string;
  trial_ends_at: string;
  next_billing_date?: string | null;
  billing_plan: string;
  created_at: string;
  gst?: string | null;
  is_active?: boolean;
};

export type ClientRow = {
  id: string;
  freelancer_id: string;
  name: string;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  login_token?: string;
  portal_access?: boolean;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  client_id: string;
  name: string;
  description?: string | null;
  status?: string;
  budget?: number | null;
  deadline?: string | null;
  created_at: string;
};

export type FileRow = {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  file_type?: string | null;
  is_open_file?: boolean;
  is_approved?: boolean;
  approved_at?: string | null;
  approved_ip?: string | null;
  viewed_at?: string | null;
  viewed_ip?: string | null;
  created_at: string;
};

export type SharedLinkRow = {
  id: string;
  file_id: string;
  type: 'approval' | 'view';
  slug?: string;
  clicks?: number;
  last_clicked_at?: string | null;
  created_at: string;
};

export type ApprovalLogRow = {
  id: string;
  file_id: string;
  client_id?: string | null;
  action: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
};

export type InvoiceRow = {
  id: string;
  freelancer_id: string;
  client_id: string;
  project_id?: string | null;
  invoice_number: string;
  amount: number;
  gst_amount?: number;
  total_amount?: number;
  description?: string | null;
  status?: string;
  payment_link?: string | null;
  razorpay_payment_id?: string | null;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
};

export type TaskRow = {
  id: string;
  freelancer_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  priority?: string;
  is_completed?: boolean;
  due_date?: string | null;
  created_at: string;
};

export type CustomMessageRow = {
  id: string;
  freelancer_id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
};

export type WhiteLabelSettingRow = {
  freelancer_id: string;
  logo_url?: string | null;
  brand_color: string;
  hide_branding?: boolean;
  portal_title?: string | null;
  updated_at: string;
};

export type WaitlistRow = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  created_at: string;
};

export type NotificationPreferenceRow = {
  freelancer_id: string;
  email_new_project?: boolean;
  email_file_approved?: boolean;
  email_invoice_paid?: boolean;
  email_task_due?: boolean;
  whatsapp_new_project?: boolean;
  whatsapp_file_approved?: boolean;
  whatsapp_invoice_paid?: boolean;
  whatsapp_task_due?: boolean;
  reminder_email?: string | null;
  reminder_time: string;
  updated_at: string;
};

export type ClientSessionRow = {
  id: string;
  client_id: string;
  token: string;
  expires_at: string;
  created_at: string;
};

export type ActivityLogRow = {
  id: string;
  freelancer_id: string;
  project_id?: string | null;
  action: string;
  metadata?: Json | null;
  created_at: string;
};

// ─── DATABASE SCHEMATIC MAP ───────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, 'created_at'>;
        Update: Partial<Omit<UserRow, 'created_at'>>;
        Relationships: [];
      };
      clients: {
        Row: ClientRow;
        Insert: Omit<ClientRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ClientRow, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "clients_freelancer_id_fkey"
            columns: ["freelancer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
      projects: {
        Row: ProjectRow;
        Insert: Omit<ProjectRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ProjectRow, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ];
      };
      files: {
        Row: FileRow;
        Insert: Omit<FileRow, 'id' | 'created_at'>;
        Update: Partial<Omit<FileRow, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ];
      };
      shared_links: {
        Row: SharedLinkRow;
        Insert: Omit<SharedLinkRow, 'id' | 'created_at'>;
        Update: Partial<Omit<SharedLinkRow, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "shared_links_file_id_fkey"
            columns: ["file_id"]
            referencedRelation: "files"
            referencedColumns: ["id"]
          }
        ];
      };
      approval_logs: {
        Row: ApprovalLogRow;
        Insert: Omit<ApprovalLogRow, 'id' | 'created_at'>;
        Update: {};
        Relationships: [];
      };
      invoices: {
        Row: InvoiceRow;
        Insert: Omit<InvoiceRow, 'id' | 'created_at'>;
        Update: Partial<Omit<InvoiceRow, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_freelancer_id_fkey"
            columns: ["freelancer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ];
      };
      tasks: {
        Row: TaskRow;
        Insert: Omit<TaskRow, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      custom_messages: {
        Row: CustomMessageRow;
        Insert: Omit<CustomMessageRow, 'id' | 'created_at'>;
        Update: Partial<Omit<CustomMessageRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      white_label_settings: {
        Row: WhiteLabelSettingRow;
        Insert: Partial<WhiteLabelSettingRow> & { freelancer_id: string };
        Update: Partial<WhiteLabelSettingRow>;
        Relationships: [];
      };
      waitlist: {
        Row: WaitlistRow;
        Insert: Omit<WaitlistRow, 'id' | 'created_at'>;
        Update: {};
        Relationships: [];
      };
      notification_preferences: {
        Row: NotificationPreferenceRow;
        Insert: Partial<NotificationPreferenceRow> & { freelancer_id: string };
        Update: Partial<NotificationPreferenceRow>;
        Relationships: [];
      };
      client_sessions: {
        Row: ClientSessionRow;
        Insert: Omit<ClientSessionRow, 'id' | 'created_at'>;
        Update: Partial<Omit<ClientSessionRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      activity_logs: {
        Row: ActivityLogRow;
        Insert: Omit<ActivityLogRow, 'id' | 'created_at'>;
        Update: {};
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

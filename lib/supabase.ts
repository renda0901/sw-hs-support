import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          name: string
          grade: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          grade: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          grade?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      exam_schedules: {
        Row: {
          id: string
          subject: string
          exam_type: string
          exam_date: string
          description: string | null
          grade: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          exam_type: string
          exam_date: string
          description?: string | null
          grade: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          exam_type?: string
          exam_date?: string
          description?: string | null
          grade?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      assignment_schedules: {
        Row: {
          id: string
          subject: string
          assignment_name: string
          assignment_type: string
          due_date: string
          description: string | null
          grade: string
          max_score: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          assignment_name: string
          assignment_type: string
          due_date: string
          description?: string | null
          grade: string
          max_score?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          assignment_name?: string
          assignment_type?: string
          due_date?: string
          description?: string | null
          grade?: string
          max_score?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      grades: {
        Row: {
          id: string
          user_id: string
          subject: string
          exam_type: string
          written_score: number | null
          performance_score_1: number | null
          performance_score_2: number | null
          performance_score_3: number | null
          final_score: number
          exam_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          exam_type: string
          written_score?: number | null
          performance_score_1?: number | null
          performance_score_2?: number | null
          performance_score_3?: number | null
          final_score: number
          exam_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          exam_type?: string
          written_score?: number | null
          performance_score_1?: number | null
          performance_score_2?: number | null
          performance_score_3?: number | null
          final_score?: number
          exam_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          subject: string
          current_score: number
          target_score: number
          time_frame: number
          difficulty: string
          total_study_hours: number
          weekly_hours: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          current_score: number
          target_score: number
          time_frame: number
          difficulty: string
          total_study_hours: number
          weekly_hours: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          current_score?: number
          target_score?: number
          time_frame?: number
          difficulty?: string
          total_study_hours?: number
          weekly_hours?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  safe_word: string | null;
  emergency_pin: string | null;
  created_at: string;
};

export type Canary = {
  id: string;
  user_id: string;
  trigger_type: 'phrase' | 'emoji' | 'pattern' | 'gesture';
  trigger_value: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
  is_primary: boolean;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  location: string | null;
  created_at: string;
  profiles: Profile;
  images: string[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  threat_analysis?: ThreatAnalysis;
};

export type ThreatAnalysis = {
  id: string;
  post_id: string | null;
  user_id: string;
  linguistic_risk_score: number;
  metadata_risk_score: number;
  combined_risk_score: number;
  linguistic_analysis: Record<string, any>;
  metadata_analysis: Record<string, any>;
  reasoning: string;
  enforcement_protocol: string;
  is_distress: boolean;
  processed_at: string;
};

export type DistressLog = {
  id: string;
  user_id: string;
  distress_type: 'canary' | 'ai_detected' | 'manual_sos';
  confidence_score: number;
  location: string | null;
  resolved: boolean;
  created_at: string;
};

export type TrackingSession = {
  id: string;
  user_id: string;
  distress_log_id: string | null;
  session_token: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  ping_interval_seconds: number;
};

export type AgentLog = {
  id: string;
  threat_analysis_id: string;
  agent_name: string;
  agent_type: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  execution_time_ms: number;
  error_message: string | null;
  logged_at: string;
};

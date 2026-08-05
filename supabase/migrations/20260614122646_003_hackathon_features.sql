-- Canary trigger definitions (user's secret distress signals)
CREATE TABLE canaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('phrase', 'emoji', 'pattern', 'gesture')),
  trigger_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-agent analysis results
CREATE TABLE threat_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  linguistic_risk_score DECIMAL(5,4) DEFAULT 0,
  metadata_risk_score DECIMAL(5,4) DEFAULT 0,
  combined_risk_score DECIMAL(5,4) DEFAULT 0,
  linguistic_analysis JSONB,
  metadata_analysis JSONB,
  reasoning TEXT,
  enforcement_protocol TEXT,
  is_distress BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Silent tracking sessions
CREATE TABLE tracking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  distress_log_id UUID REFERENCES distress_logs(id),
  session_token TEXT UNIQUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  ping_interval_seconds INTEGER DEFAULT 30
);

-- Encrypted location pings
CREATE TABLE location_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES tracking_sessions(id) ON DELETE CASCADE NOT NULL,
  encrypted_location TEXT NOT NULL,
  ping_number INTEGER NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent execution logs (for debugging/demonstration)
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_analysis_id UUID REFERENCES threat_analyses(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  execution_time_ms INTEGER,
  error_message TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE canaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
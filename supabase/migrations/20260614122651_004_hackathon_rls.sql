-- Canary policies
CREATE POLICY "select_own_canaries" ON canaries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_canaries" ON canaries FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_canaries" ON canaries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_canaries" ON canaries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Threat analysis policies
CREATE POLICY "select_own_analyses" ON threat_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Tracking session policies
CREATE POLICY "select_own_sessions" ON tracking_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_sessions" ON tracking_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_sessions" ON tracking_sessions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Location ping policies
CREATE POLICY "select_own_pings" ON location_pings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tracking_sessions WHERE tracking_sessions.id = location_pings.session_id AND tracking_sessions.user_id = auth.uid())
  );

CREATE POLICY "insert_own_pings" ON location_pings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM tracking_sessions WHERE tracking_sessions.id = location_pings.session_id AND tracking_sessions.user_id = auth.uid())
  );

-- Agent logs policies
CREATE POLICY "select_own_agent_logs" ON agent_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM threat_analyses WHERE threat_analyses.id = agent_logs.threat_analysis_id AND threat_analyses.user_id = auth.uid())
  );
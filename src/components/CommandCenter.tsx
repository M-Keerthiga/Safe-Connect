import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Brain,
  Terminal,
  X,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from 'lucide-react';
import { supabase, type ThreatAnalysis, type DistressLog } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CommandCenterProps {
  newPostId: string | null;
  onHide: () => void;
}

type AlertStatus = 'monitoring' | 'processing' | 'alert' | 'resolved';

export function CommandCenter({ newPostId, onHide }: CommandCenterProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<AlertStatus>('monitoring');
  const [latestAnalysis, setLatestAnalysis] = useState<ThreatAnalysis | null>(null);
  const [distressLogs, setDistressLogs] = useState<DistressLog[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState({
    canary: 'idle',
    linguistic: 'idle',
    metadata: 'idle',
    fusion: 'idle',
  });

  // Fetch distress logs
  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const { data: logs } = await supabase
        .from('distress_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logs) setDistressLogs(logs);
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Process new posts
  useEffect(() => {
    if (!user || !newPostId) return;

    setProcessingPostId(newPostId);
    setStatus('processing');
    setAgentStatus({ canary: 'processing', linguistic: 'processing', metadata: 'processing', fusion: 'idle' });
    addUpdate(`[NEW POST] ID: ${newPostId.slice(0, 8)}`);
    addUpdate('[CANARY ENGINE] Scanning for trigger patterns...');

    // Poll for threat analysis
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from('threat_analyses')
        .select('*')
        .eq('post_id', newPostId)
        .maybeSingle();

      if (data) {
        setLatestAnalysis(data);
        clearInterval(pollInterval);
        setProcessingPostId(null);
        setAgentStatus({ canary: 'complete', linguistic: 'complete', metadata: 'complete', fusion: 'complete' });

        if (data.is_distress) {
          setStatus('alert');
          addUpdate('⚠️ DISTRESS SIGNAL DETECTED');
          addUpdate('🚨 ALERTING EMERGENCY CONTACTS');
        } else {
          setStatus('monitoring');
          addUpdate('✅ Analysis complete - Normal activity confirmed');
        }

        addUpdate(`RISK SCORE: ${(data.combined_risk_score * 100).toFixed(1)}%`);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [user, newPostId]);

  const addUpdate = useCallback((message: string) => {
    setLiveUpdates((prev) => {
      const timestamp = new Date().toLocaleTimeString();
      return [`[${timestamp}] ${message}`, ...prev.slice(0, 49)];
    });
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-cc-bg to-[#0d0d14] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="relative px-6 py-4 bg-cc-card/50 border-b border-cc-border overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-safety-accent/20 via-transparent to-purple-600/20 animate-pulse" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              status === 'alert' ? 'bg-red-500 animate-ping' :
              status === 'processing' ? 'bg-yellow-500 animate-pulse' :
              'bg-green-500'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                status === 'alert' ? 'bg-red-500' :
                status === 'processing' ? 'bg-yellow-500' :
                'bg-green-500'
              } animate-ping absolute`} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-safety-accent" />
                Command Center
              </h1>
              <p className="text-xs text-cc-muted flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Multi-Agent Threat Analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-medium ${
              status === 'alert' ? 'bg-red-500/20 text-red-400 animate-pulse' :
              status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {status === 'monitoring' ? '◎ MONITORING' :
               status === 'processing' ? '⚡ PROCESSING' :
               status === 'alert' ? '⚠ ALERT' : '✓ RESOLVED'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Agent Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <AgentCard
            name="Canary Engine"
            icon={<Zap className="w-4 h-4" />}
            type="deterministic"
            status={agentStatus.canary}
            latency="<1ms"
          />
          <AgentCard
            name="Linguistic Agent"
            icon={<Brain className="w-4 h-4" />}
            type="ai"
            status={agentStatus.linguistic}
            latency={latestAnalysis?.linguistic_analysis?.executionTimeMs ? `${latestAnalysis.linguistic_analysis.executionTimeMs}ms` : '~150ms'}
          />
          <AgentCard
            name="Metadata Agent"
            icon={<MapPin className="w-4 h-4" />}
            type="ai"
            status={agentStatus.metadata}
            latency={latestAnalysis?.metadata_analysis?.executionTimeMs ? `${latestAnalysis.metadata_analysis.executionTimeMs}ms` : '~100ms'}
          />
          <AgentCard
            name="Fusion Engine"
            icon={<Shield className="w-4 h-4" />}
            type="ai"
            status={agentStatus.fusion}
            latency="~50ms"
          />
        </div>

        {/* Risk Analysis Panel */}
        {latestAnalysis && (
          <div className="bg-cc-card rounded-xl border border-cc-border p-4 animate-fade-in-up">
            <h3 className="text-sm font-mono text-cc-muted mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Latest Analysis
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <RiskMeter
                label="Linguistic"
                value={latestAnalysis.linguistic_risk_score}
                color="pink"
              />
              <RiskMeter
                label="Location"
                value={latestAnalysis.metadata_risk_score}
                color="cyan"
              />
              <RiskMeter
                label="Combined"
                value={latestAnalysis.combined_risk_score}
                color="purple"
                highlight
              />
            </div>

            {latestAnalysis.reasoning && (
              <div className="p-3 bg-cc-bg rounded-lg border border-cc-border">
                <p className="text-xs font-mono text-cc-muted leading-relaxed">
                  {latestAnalysis.reasoning}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Live Terminal */}
        <div className="bg-cc-card rounded-xl border border-cc-border overflow-hidden">
          <div className="px-4 py-2 bg-cc-bg border-b border-cc-border flex items-center gap-2">
            <Terminal className="w-4 h-4 text-safety-accent" />
            <span className="text-xs font-mono text-cc-muted">Live Pipeline Output</span>
            <div className="flex-1" />
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
          </div>
          <div className="h-40 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-[#0a0a10]">
            {liveUpdates.length === 0 ? (
              <div className="flex items-center gap-2 text-cc-muted animate-pulse">
                <Clock className="w-4 h-4" />
                <span>Awaiting new posts...</span>
              </div>
            ) : (
              liveUpdates.map((update, i) => (
                <div
                  key={i}
                  className={`${
                    update.includes('DISTRESS') || update.includes('ALERT') ? 'text-red-400' :
                    update.includes('complete') || update.includes('Normal') ? 'text-green-400' :
                    update.includes('RISK') ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}
                >
                  {update}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        {distressLogs.length > 0 && (
          <div className="bg-cc-card rounded-xl border border-cc-border overflow-hidden">
            <div className="px-4 py-2 bg-cc-bg border-b border-cc-border">
              <h3 className="text-xs font-mono text-cc-muted flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Recent Alerts
              </h3>
            </div>
            <div className="divide-y divide-cc-border">
              {distressLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className={`p-3 flex items-start gap-3 ${
                    log.resolved ? 'opacity-60' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    log.resolved ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {log.resolved ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-white">
                        {log.distress_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-cc-muted">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {log.location && (
                      <p className="text-xs text-cc-muted truncate">{log.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({
  name,
  icon,
  type,
  status,
  latency,
}: {
  name: string;
  icon: React.ReactNode;
  type: 'deterministic' | 'ai';
  status: 'idle' | 'processing' | 'complete';
  latency: string;
}) {
  return (
    <div className={`bg-cc-card rounded-xl border p-3 transition-all duration-300 ${
      status === 'processing'
        ? 'border-safety-accent shadow-lg shadow-safety-accent/20 agent-processing'
        : 'border-cc-border'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white">
          {icon}
          <span className="text-xs font-medium">{name}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${
          status === 'processing' ? 'bg-yellow-400 animate-pulse' :
          status === 'complete' ? 'bg-green-400' : 'bg-gray-600'
        }`} />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded ${
          type === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {type}
        </span>
        <span className="font-mono text-cc-muted">{latency}</span>
      </div>
    </div>
  );
}

function RiskMeter({
  label,
  value,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  color: 'pink' | 'cyan' | 'purple';
  highlight?: boolean;
}) {
  const percentage = Math.round(value * 100);
  const isRisk = percentage > 50;

  const gradients = {
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`text-center ${highlight ? 'scale-105' : ''}`}>
      <div className="relative w-16 h-16 mx-auto mb-2">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-cc-border"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${percentage * 1.76} 176`}
            className={`${isRisk ? 'text-red-500' : 'text-green-500'} transition-all duration-500`}
          />
        </svg>
        {/* Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold font-mono ${
            isRisk ? 'text-red-400' : 'text-green-400'
          }`}>
            {percentage}%
          </span>
        </div>
      </div>
      <span className={`text-xs font-mono ${highlight ? 'text-white' : 'text-cc-muted'}`}>
        {label}
      </span>
    </div>
  );
}

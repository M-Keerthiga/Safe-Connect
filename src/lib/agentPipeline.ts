// Multi-Agent Threat Analysis Pipeline (Async Execution)
import type { Post, ThreatAnalysis } from './supabase';

export interface LocationContext {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  speed: number | null; // m/s
  timestamp: number;
}

export interface AgentInput {
  postId: string;
  userId: string;
  content: string;
  location: LocationContext | null;
  userProfile: {
    homeLocation?: string;
    workHours?: { start: number; end: number };
    usualLocations?: string[];
  };
}

export interface AgentResult {
  agentName: string;
  agentType: 'linguistic' | 'metadata' | 'fusion';
  riskScore: number;
  flags: string[];
  reasoning: string;
  executionTimeMs: number;
  error?: string;
}

// Agent 1: Linguistic Pattern Analyzer
async function linguisticAgent(input: AgentInput): Promise<AgentResult> {
  const startTime = performance.now();

  const flags: string[] = [];
  let riskScore = 0;

  const content = input.content.toLowerCase();
  const words = content.split(/\s+/);

  // Check for forced positive indicators (sign of coercion)
  const forcedPositivePatterns = [
    /literally\s+the\s+best/i,
    /so\s+incredibly\s+(happy|safe|fine)/i,
    /everything\s+is\s+(perfect|amazing|wonderful)/i,
    /absolutely\s+no\s+(problems|issues|concerns)/i,
    /nothing\s+could\s+be\s+better/i,
  ];

  for (const pattern of forcedPositivePatterns) {
    if (pattern.test(content)) {
      flags.push('Forced positive language detected');
      riskScore += 0.3;
    }
  }

  // Check for distress keywords
  const distressKeywords = ['help', 'urgent', 'emergency', 'danger', 'scared', 'afraid', 'trapped', 'stuck'];
  for (const keyword of distressKeywords) {
    if (content.includes(keyword)) {
      flags.push(`Direct distress indicator: "${keyword}"`);
      riskScore += 0.2;
    }
  }

  // Check for unusual punctuation patterns (stress indicators)
  const excessiveExclamation = (content.match(/!{3,}/g) || []).length > 0;
  const allCaps = /[A-Z]{5,}/.test(input.content);
  const repeatedLetters = /(.)\1{3,}/.test(content);

  if (excessiveExclamation) {
    flags.push('Excessive exclamation marks');
    riskScore += 0.15;
  }
  if (allCaps) {
    flags.push('Excessive capitalization');
    riskScore += 0.2;
  }
  if (repeatedLetters) {
    flags.push('Letter repetition pattern');
    riskScore += 0.1;
  }

  // Check for time-based anomalies (late night posts when usually inactive)
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 5) {
    flags.push('Unusual posting time (late night/early morning)');
    riskScore += 0.1;
  }

  // Normalize risk score
  riskScore = Math.min(riskScore, 1.0);

  return {
    agentName: 'Linguistic Classifier',
    agentType: 'linguistic',
    riskScore,
    flags,
    reasoning: flags.length > 0
      ? `Detected ${flags.length} linguistic risk indicators`
      : 'No significant linguistic distress patterns detected',
    executionTimeMs: performance.now() - startTime,
  };
}

// Agent 2: Metadata Analytics Agent
async function metadataAgent(input: AgentInput): Promise<AgentResult> {
  const startTime = performance.now();

  const flags: string[] = [];
  let riskScore = 0;

  if (!input.location || !input.location.latitude) {
    return {
      agentName: 'Metadata Analytics',
      agentType: 'metadata',
      riskScore: 0,
      flags: [],
      reasoning: 'No location data available for analysis',
      executionTimeMs: performance.now() - startTime,
    };
  }

  // Check for movement vs content contradiction
  if (input.location.speed !== null && input.location.speed > 5) {
    // Moving at > 5 m/s (~18 km/h)
    const content = input.content.toLowerCase();

    // Contradictory phrases when moving fast
    const stationaryPhrases = [
      'just woke up', 'in bed', 'sleeping', 'relaxing', 'chilling at home',
      'sitting here', 'at my desk', 'cozy', 'staying in',
    ];

    for (const phrase of stationaryPhrases) {
      if (content.includes(phrase)) {
        flags.push(`Location contradiction: Content suggests "${phrase}" but GPS shows movement`);
        riskScore += 0.4;
      }
    }
  }

  // Check if unusual location
  if (input.userProfile.usualLocations && input.location.address) {
    const isUsualLocation = input.userProfile.usualLocations.some(
      (loc) => input.location!.address?.toLowerCase().includes(loc.toLowerCase())
    );

    if (!isUsualLocation) {
      flags.push('Location outside usual areas');
      riskScore += 0.15;
    }
  }

  // Time-based location check
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 5 && input.location.speed && input.location.speed > 0) {
    flags.push('Movement detected during late night hours');
    riskScore += 0.25;
  }

  // Normalize risk score
  riskScore = Math.min(riskScore, 1.0);

  return {
    agentName: 'Metadata Analytics',
    agentType: 'metadata',
    riskScore,
    flags,
    reasoning: flags.length > 0
      ? `Detected ${flags.length} metadata anomalies`
      : 'No concerning metadata patterns detected',
    executionTimeMs: performance.now() - startTime,
  };
}

// Agent 3: Fusion Agent (combines results)
async function fusionAgent(
  linguisticResult: AgentResult,
  metadataResult: AgentResult
): Promise<AgentResult> {
  const startTime = performance.now();

  const allFlags = [...linguisticResult.flags, ...metadataResult.flags];

  // Weighted combination
  const combinedRisk =
    (linguisticResult.riskScore * 0.6) + // Linguistic is weighted higher
    (metadataResult.riskScore * 0.4);

  // Threshold for distress
  const isDistress = combinedRisk >= 0.5;

  return {
    agentName: 'Fusion Engine',
    agentType: 'fusion',
    riskScore: Math.round(combinedRisk * 1000) / 1000,
    flags: allFlags,
    reasoning: isDistress
      ? `HIGH RISK: Combined analysis indicates potential distress. ${allFlags.length} risk factors identified.`
      : `LOW RISK: Combined analysis indicates normal activity. ${allFlags.length > 0 ? `${allFlags.length} minor flags noted.` : ''}`,
    executionTimeMs: performance.now() - startTime,
  };
}

// Main async pipeline execution
export async function executeMultiAgentPipeline(input: AgentInput): Promise<{
  linguistic: AgentResult;
  metadata: AgentResult;
  fusion: AgentResult;
  totalExecutionMs: number;
}> {
  const pipelineStart = performance.now();

  // Run both agents in parallel
  const [linguisticResult, metadataResult] = await Promise.all([
    linguisticAgent(input),
    metadataAgent(input),
  ]);

  // Run fusion agent on results
  const fusionResult = await fusionAgent(linguisticResult, metadataResult);

  return {
    linguistic: linguisticResult,
    metadata: metadataResult,
    fusion: fusionResult,
    totalExecutionMs: performance.now() - pipelineStart,
  };
}

// Export for threat analysis
export function createThreatAnalysis(
  postId: string,
  userId: string,
  pipelineResult: ReturnType<typeof executeMultiAgentPipeline> extends Promise<infer T> ? T : never
): Omit<ThreatAnalysis, 'id' | 'processed_at'> {
  return {
    post_id: postId,
    user_id: userId,
    linguistic_risk_score: pipelineResult.linguistic.riskScore,
    metadata_risk_score: pipelineResult.metadata.riskScore,
    combined_risk_score: pipelineResult.fusion.riskScore,
    linguistic_analysis: {
      flags: pipelineResult.linguistic.flags,
      reasoning: pipelineResult.linguistic.reasoning,
      executionTimeMs: pipelineResult.linguistic.executionTimeMs,
    },
    metadata_analysis: {
      flags: pipelineResult.metadata.flags,
      reasoning: pipelineResult.metadata.reasoning,
      executionTimeMs: pipelineResult.metadata.executionTimeMs,
    },
    reasoning: pipelineResult.fusion.reasoning,
    enforcement_protocol: pipelineResult.fusion.riskScore >= 0.7
      ? 'IMMEDIATE_ALERT'
      : pipelineResult.fusion.riskScore >= 0.5
      ? 'MONITOR_CLOSELY'
      : 'LOG_AND_CONTINUE',
    is_distress: pipelineResult.fusion.riskScore >= 0.5,
  };
}

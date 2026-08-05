import type { Canary } from './supabase';

export interface CanaryMatch {
  matched: boolean;
  canary: Canary | null;
  matchType: 'phrase' | 'emoji' | 'pattern';
  matchValue: string | null;
  executionTimeMs: number;
}

// Fast track: Lightning-fast deterministic canary detection (<1ms)
export function detectCanary(content: string, canaries: Canary[]): CanaryMatch {
  const startTime = performance.now();

  if (!content || !canaries.length) {
    return {
      matched: false,
      canary: null,
      matchType: 'phrase',
      matchValue: null,
      executionTimeMs: performance.now() - startTime,
    };
  }

  const normalizedContent = content.toLowerCase().trim();

  // Priority 1: Phrase matching (most specific)
  for (const canary of canaries) {
    if (canary.trigger_type === 'phrase' && canary.is_active) {
      const phrase = canary.trigger_value.toLowerCase();
      if (normalizedContent.includes(phrase)) {
        return {
          matched: true,
          canary,
          matchType: 'phrase',
          matchValue: canary.trigger_value,
          executionTimeMs: performance.now() - startTime,
        };
      }
    }
  }

  // Priority 2: Emoji matching (emoji sequences are covert distress signals)
  for (const canary of canaries) {
    if (canary.trigger_type === 'emoji' && canary.is_active) {
      const emojiPattern = canary.trigger_value;
      if (content.includes(emojiPattern)) {
        return {
          matched: true,
          canary,
          matchType: 'emoji',
          matchValue: emojiPattern,
          executionTimeMs: performance.now() - startTime,
        };
      }
    }
  }

  // Priority 3: Regex pattern matching
  for (const canary of canaries) {
    if (canary.trigger_type === 'pattern' && canary.is_active) {
      try {
        const regex = new RegExp(canary.trigger_value, 'i');
        if (regex.test(content)) {
          return {
            matched: true,
            canary,
            matchType: 'pattern',
            matchValue: canary.trigger_value,
            executionTimeMs: performance.now() - startTime,
          };
        }
      } catch {
        // Invalid regex, skip
        continue;
      }
    }
  }

  return {
    matched: false,
    canary: null,
    matchType: 'phrase',
    matchValue: null,
    executionTimeMs: performance.now() - startTime,
  };
}

// Predefined covert distress patterns (always active)
const COVERT_PATTERNS = {
  // Forced positive language (common in coercion)
  forcedPositive: [
    /everything\s+is\s+(totally|absolutely|so)+\s+(perfect|fine|great)/i,
    /having\s+the\s+best\s+time\s+ever/i,
    /so\s+happy\s+and\s+safe\s+here/i,
    /nothing\s+to\s+worry\s+about/i,
  ],

  // Subtle help requests
  subtleHelp: [
    /wish\s+someone\s+was\s+here/i,
    /feeling\s+a\s+bit\s+off/i,
    /need\s+to\s+talk\s+soon/i,
  ],

  // Anomaly indicators
  anomaly: [
    /staying\s+in\s+tonight/i, // When GPS shows movement
    /home\s+safe/i, // When not at home
    /just\s+(me|us)\s+here/i, // Unusual phrasing
  ],
};

export function detectCovertPatterns(content: string): {
  detected: boolean;
  patternType: string | null;
  confidence: number;
} {
  let maxConfidence = 0;
  let detectedType: string | null = null;

  for (const pattern of COVERT_PATTERNS.forcedPositive) {
    if (pattern.test(content)) {
      maxConfidence = Math.max(maxConfidence, 0.7);
      detectedType = 'forced_positive';
    }
  }

  for (const pattern of COVERT_PATTERNS.subtleHelp) {
    if (pattern.test(content)) {
      maxConfidence = Math.max(maxConfidence, 0.8);
      detectedType = 'subtle_help';
    }
  }

  for (const pattern of COVERT_PATTERNS.anomaly) {
    if (pattern.test(content)) {
      maxConfidence = Math.max(maxConfidence, 0.5);
      detectedType = 'anomaly';
    }
  }

  return {
    detected: maxConfidence > 0,
    patternType: detectedType,
    confidence: maxConfidence,
  };
}

import { DetectionResult } from './detector';

export type VerdictLevel = 'safe' | 'caution' | 'danger';

export interface Verdict {
  level: VerdictLevel;
  title: string;
  explanation: string;
  advice: string;
  color: string;
  emoji: string;
}

export function getVerdict(result: DetectionResult): Verdict {
  const { score, flags, suspiciousPatterns } = result;

  // RED - DANGER
  if (score >= 60) {
    return {
      level: 'danger',
      title: 'DANGER - This is likely a SCAM',
      explanation: buildExplanation(flags, suspiciousPatterns, 'danger'),
      advice: 'Do NOT click any links. Do NOT reply. Delete this message immediately.',
      color: 'bg-red-600',
      emoji: '🔴'
    };
  }

  // YELLOW - CAUTION
  if (score >= 25) {
    return {
      level: 'caution',
      title: 'CAUTION - Be very careful',
      explanation: buildExplanation(flags, suspiciousPatterns, 'caution'),
      advice: 'Do NOT click links. Call the official company using the number on your bill or card - not any number in this message.',
      color: 'bg-yellow-500',
      emoji: '🟡'
    };
  }

  // GREEN - SAFE
  return {
    level: 'safe',
    title: 'No major red flags detected',
    explanation: 'This message does not contain obvious scam indicators. However, always be cautious with unexpected messages.',
    advice: 'If you are unsure, contact the sender through official channels.',
    color: 'bg-green-600',
    emoji: '🟢'
  };
}

function buildExplanation(flags: string[], patterns: string[], level: VerdictLevel): string {
  if (level === 'safe') {
    return 'This message does not contain obvious scam indicators. However, always be cautious with unexpected messages.';
  }

  const reasons: string[] = [];

  // Prioritize most important flags
  const allIssues = [...flags, ...patterns];

  if (allIssues.some(s => s.toLowerCase().includes('sensitive') || s.toLowerCase().includes('password') || s.toLowerCase().includes('pin'))) {
    reasons.push('Legitimate companies will NEVER ask for passwords, PINs, or bank details via text or email.');
  }

  if (allIssues.some(s => s.toLowerCase().includes('urgency') || s.toLowerCase().includes('urgent'))) {
    reasons.push('Scammers create fake urgency to pressure you into acting quickly without thinking.');
  }

  if (allIssues.some(s => s.toLowerCase().includes('impersonation') || s.toLowerCase().includes('mum') || s.toLowerCase().includes('mom'))) {
    reasons.push('This looks like a family impersonation scam. Always verify by calling the person directly.');
  }

  if (allIssues.some(s => s.toLowerCase().includes('ip address') || s.toLowerCase().includes('fake'))) {
    reasons.push('The link appears to be fake or suspicious. Real companies use their official domain names.');
  }

  if (allIssues.some(s => s.toLowerCase().includes('shortened'))) {
    reasons.push('Shortened links hide the real destination. Scammers use them to trick you.');
  }

  if (reasons.length === 0 && allIssues.length > 0) {
    reasons.push('This message contains multiple warning signs commonly used in scams.');
  }

  return reasons.join(' ');
}

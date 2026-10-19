export interface DetectionResult {
  score: number;
  flags: string[];
  urls: string[];
  suspiciousPatterns: string[];
}

const URGENCY_KEYWORDS = [
  'urgent', 'immediately', 'within 24 hours', 'account suspended', 'verify now',
  'click here now', 'act now', 'expire', 'suspended', 'locked', 'unusual activity',
  'verify your account', 'confirm your identity', 'update payment', 'action required',
  'claim now', 'limited time', 'expires soon', 'today only'
];

const IMPERSONATION_PATTERNS = [
  'hi mum', 'hi mom', 'hi dad', 'lost my phone', 'new number', 'this is my new number',
  'text me back', 'can you help', 'need money', 'emergency'
];

const SENSITIVE_REQUESTS = [
  'password', 'pin', 'social security', 'bank details', 'card number', 'cvv', 'security code',
  'gift card', 'apple card', 'google play', 'steam card', 'account number', 'routing number'
];

const REWARD_SCAM_PATTERNS = [
  'complete our survey', 'earn exclusive points', 'redeem for gifts', 'claim your reward',
  'you\'ve won', 'congratulations', 'free gift', 'exclusive offer', 'rewards your feedback',
  'earn points', 'claim prize', 'winner'
];

const SCAM_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co',
  '.tk', '.ml', '.ga', '.cf', '.gq' // free TLDs
];

const KNOWN_BRANDS = [
  'amazon', 'paypal', 'bank', 'netflix', 'microsoft', 'apple', 'google',
  'facebook', 'instagram', 'fedex', 'ups', 'usps', 'dhl', 'irs', 'royalmail',
  'eastwest', 'visa', 'mastercard', 'discover', 'chase', 'wellsfargo', 'citibank',
  'bofa', 'bankofamerica', 'hsbc', 'barclays', 'santander', 'capitalone'
];

// Helper: Calculate Levenshtein distance for typo detection
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    // Get domain part (before first /)
    domain = domain.split('/')[0];
    // Get main domain (remove subdomains for common cases)
    const parts = domain.split('.');
    if (parts.length >= 2) {
      // Get last two parts (domain.tld)
      return parts.slice(-2).join('.').toLowerCase();
    }
    return domain.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function detectScam(text: string): DetectionResult {
  const lowerText = text.toLowerCase();
  const flags: string[] = [];
  const suspiciousPatterns: string[] = [];
  let score = 0;

  // Extract URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\b[a-z0-9-]+\.(com|net|org|co\.uk|tk|ml|ga|cf|gq)[^\s]*)/gi;
  const urls = text.match(urlRegex) || [];

  // Check for urgency
  URGENCY_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 15;
      suspiciousPatterns.push(`Urgency: "${keyword}"`);
    }
  });

  // Check for impersonation
  IMPERSONATION_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      score += 25;
      suspiciousPatterns.push(`Impersonation attempt: "${pattern}"`);
    }
  });

  // Check for sensitive info requests
  SENSITIVE_REQUESTS.forEach(request => {
    if (lowerText.includes(request)) {
      score += 30;
      suspiciousPatterns.push(`Asks for sensitive info: "${request}"`);
    }
  });

  // Check for reward/survey scams
  REWARD_SCAM_PATTERNS.forEach(pattern => {
    if (lowerText.includes(pattern)) {
      score += 20;
      suspiciousPatterns.push(`Reward scam phrase: "${pattern}"`);
    }
  });

  // Check URLs
  urls.forEach(url => {
    const lowerUrl = url.toLowerCase();
    const domain = extractDomain(url);
    
    // IP address URLs
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
      score += 40;
      flags.push(`Suspicious URL: Uses IP address instead of domain name`);
    }

    // Scam domains
    SCAM_DOMAINS.forEach(scamDomain => {
      if (lowerUrl.includes(scamDomain)) {
        score += 20;
        flags.push(`Shortened or suspicious URL detected`);
      }
    });

    // Enhanced typosquatting detection
    KNOWN_BRANDS.forEach(brand => {
      // Check if brand appears in URL
      if (lowerUrl.includes(brand)) {
        // Check for number substitutions
        if (lowerUrl.includes(brand + '0') || 
            lowerUrl.includes(brand + '1') ||
            lowerUrl.includes(brand + '-')) {
          score += 35;
          flags.push(`Possible fake ${brand} website`);
          return;
        }
      }

      // Check domain against brand with edit distance (typo detection)
      const domainName = domain.split('.')[0]; // Get just the name part
      const distance = levenshteinDistance(domainName, brand);
      
      // If domain is 1-2 characters different from a known brand, flag it
      if (distance > 0 && distance <= 2 && domainName.length >= 4) {
        score += 40;
        flags.push(`Domain "${domain}" looks like a typo of legitimate brand "${brand}"`);
      }

      // Check for missing characters (eastwets vs eastwest)
      if (brand.length > 5 && domainName.length >= brand.length - 2) {
        let matchCount = 0;
        let brandIndex = 0;
        for (let i = 0; i < domainName.length && brandIndex < brand.length; i++) {
          if (domainName[i] === brand[brandIndex]) {
            matchCount++;
            brandIndex++;
          }
        }
        // If most characters match in order but some are missing
        if (matchCount >= brand.length - 2 && matchCount < brand.length) {
          score += 40;
          flags.push(`Domain "${domain}" appears to be misspelled version of "${brand}"`);
        }
      }
    });

    // Check for suspicious TLDs in domain
    if (domain.endsWith('.top') || domain.endsWith('.xyz') || domain.endsWith('.online') || 
        domain.endsWith('.site') || domain.endsWith('.club') || domain.endsWith('.info')) {
      score += 15;
      suspiciousPatterns.push(`Unusual domain ending: ${domain.split('.').pop()}`);
    }
  });

  // Combined red flags
  if (urls.length > 0 && suspiciousPatterns.some(p => p.includes('sensitive info'))) {
    score += 50;
    flags.push('DANGER: Link + request for sensitive information');
  }

  if (suspiciousPatterns.length >= 3) {
    score += 30;
    flags.push('Multiple scam indicators detected');
  }

  return {
    score,
    flags,
    urls,
    suspiciousPatterns
  };
}

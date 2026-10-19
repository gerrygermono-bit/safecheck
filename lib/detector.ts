export interface DetectionResult {
  score: number;
  flags: string[];
  urls: string[];
  suspiciousPatterns: string[];
}

const URGENCY_KEYWORDS = [
  'urgent', 'immediately', 'within 24 hours', 'account suspended', 'verify now',
  'click here now', 'act now', 'expire', 'suspended', 'locked', 'unusual activity',
  'verify your account', 'confirm your identity', 'update payment', 'action required'
];

const IMPERSONATION_PATTERNS = [
  'hi mum', 'hi mom', 'hi dad', 'lost my phone', 'new number', 'this is my new number',
  'text me back', 'can you help', 'need money', 'emergency'
];

const SENSITIVE_REQUESTS = [
  'password', 'pin', 'social security', 'bank details', 'card number', 'cvv', 'security code',
  'gift card', 'apple card', 'google play', 'steam card', 'account number', 'routing number'
];

const SCAM_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co',
  '.tk', '.ml', '.ga', '.cf', '.gq' // free TLDs
];

const KNOWN_BRANDS = [
  'amazon', 'paypal', 'bank', 'netflix', 'microsoft', 'apple', 'google',
  'facebook', 'instagram', 'fedex', 'ups', 'usps', 'dhl', 'irs', 'royal mail'
];

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

  // Check URLs
  urls.forEach(url => {
    const lowerUrl = url.toLowerCase();
    
    // IP address URLs
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
      score += 40;
      flags.push(`Suspicious URL: Uses IP address instead of domain name`);
    }

    // Scam domains
    SCAM_DOMAINS.forEach(domain => {
      if (lowerUrl.includes(domain)) {
        score += 20;
        flags.push(`Shortened or suspicious URL detected`);
      }
    });

    // Typosquatting check (simple)
    KNOWN_BRANDS.forEach(brand => {
      if (lowerUrl.includes(brand) && 
          (lowerUrl.includes(brand + '0') || 
           lowerUrl.includes(brand + '1') ||
           lowerUrl.includes(brand + '-') ||
           lowerUrl.match(new RegExp(brand.split('').join('.?'), 'i')))) {
        score += 35;
        flags.push(`Possible fake ${brand} website`);
      }
    });
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

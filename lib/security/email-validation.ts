// Email validation utilities for spam prevention and duplicate detection

/**
 * List of common free email providers
 * This list can be expanded as needed
 */
const FREE_EMAIL_DOMAINS = new Set([
  // Major providers
  "gmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.es",
  "yahoo.it",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.de",
  "live.com",
  "msn.com",
  "aol.com",
  "aol.co.uk",
  "aol.fr",
  "aol.de",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "mail.com",
  "gmx.com",
  "gmx.de",
  "gmx.fr",
  "gmx.co.uk",
  "inbox.com",
  "fastmail.com",
  "tutanota.com",
  "tutanota.de",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "rediffmail.com",
  "rediff.com",
  "hushmail.com",
  "hush.com",
  "disposable.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "throwaway.email",
  "temp-mail.org",
  "mailinator.com",
  "getnada.com",
  "mohmal.com",
  "fakemail.net",
  "sharklasers.com",
  "grr.la",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "bccto.me",
  "chammy.info",
  "devnullmail.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "fakemailgenerator.com",
  "maildrop.cc",
  "meltmail.com",
  "mintemail.com",
  "mytrashmail.com",
  "nospamfor.us",
  "nowmymail.com",
  "spamgourmet.com",
  "spamhole.com",
  "trashmail.com",
  "trashmail.net",
  "trashmailer.com",
  "tempinbox.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "jetable.org",
  "melt.li",
  "meltmail.net",
  "mintemail.com",
  "mohmal.com",
  "mytemp.email",
  "nada.email",
  "nada.ltd",
  "nada.pro",
  "nada1.ltd",
  "nadaemail.com",
  "nadaemail.net",
  "nadaemail.org",
  "nadaemail.pro",
  "nadaemail.xyz",
  "nadaemail1.com",
  "nadaemail1.net",
  "nadaemail1.org",
  "nadaemail1.pro",
  "nadaemail1.xyz",
  "nadaemail2.com",
  "nadaemail2.net",
  "nadaemail2.org",
  "nadaemail2.pro",
  "nadaemail2.xyz",
  "nadaemail3.com",
  "nadaemail3.net",
  "nadaemail3.org",
  "nadaemail3.pro",
  "nadaemail3.xyz",
  "nadaemail4.com",
  "nadaemail4.net",
  "nadaemail4.org",
  "nadaemail4.pro",
  "nadaemail4.xyz",
  "nadaemail5.com",
  "nadaemail5.net",
  "nadaemail5.org",
  "nadaemail5.pro",
  "nadaemail5.xyz",
]);

/**
 * Check if an email domain is a free email provider
 */
export function isFreeEmailProvider(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const domain = email.toLowerCase().split("@")[1];
  if (!domain) {
    return false;
  }

  // Check exact match
  if (FREE_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  // Check for disposable/temporary email patterns
  const disposablePatterns = [
    /^temp/i,
    /^tmp/i,
    /^disposable/i,
    /^throwaway/i,
    /^fake/i,
    /^spam/i,
    /^trash/i,
    /^mohmal/i,
    /^guerrilla/i,
    /^10minute/i,
    /^nada/i,
    /^getnada/i,
    /^maildrop/i,
    /^melt/i,
    /^mint/i,
    /^yopmail/i,
    /^jetable/i,
  ];

  return disposablePatterns.some(pattern => pattern.test(domain));
}

/**
 * Normalize email address to prevent duplicate accounts
 * Handles:
 * - Gmail: dots are ignored, plus signs and everything after are ignored
 * - Other providers: plus signs and everything after are removed
 * - Case normalization
 * 
 * Examples:
 * - user.name@gmail.com -> username@gmail.com
 * - user.name+tag@gmail.com -> username@gmail.com
 * - User.Name+Tag@Gmail.COM -> username@gmail.com
 * - user+tag@yahoo.com -> user@yahoo.com
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  let normalized = email.trim().toLowerCase();

  // Split into local and domain parts
  const parts = normalized.split("@");
  if (parts.length !== 2) {
    return normalized; // Invalid email format, return as-is
  }

  let [localPart, domain] = parts;

  // Gmail-specific normalization
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Remove dots
    localPart = localPart.replace(/\./g, "");
    // Remove plus sign and everything after
    const plusIndex = localPart.indexOf("+");
    if (plusIndex !== -1) {
      localPart = localPart.substring(0, plusIndex);
    }
  } else {
    // For other providers, just remove plus sign and everything after
    const plusIndex = localPart.indexOf("+");
    if (plusIndex !== -1) {
      localPart = localPart.substring(0, plusIndex);
    }
  }

  return `${localPart}@${domain}`;
}

/**
 * Check if two emails are the same after normalization
 */
export function emailsMatch(email1: string, email2: string): boolean {
  return normalizeEmail(email1) === normalizeEmail(email2);
}

/**
 * Get email domain for rate limiting purposes
 */
export function getEmailDomain(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const parts = email.toLowerCase().split("@");
  if (parts.length !== 2) {
    return null;
  }

  return parts[1];
}

/**
 * Validate email format and check for suspicious patterns
 */
export interface EmailValidationResult {
  valid: boolean;
  isFreeEmail: boolean;
  normalizedEmail: string;
  domain: string | null;
  warnings: string[];
}

export function validateEmail(email: string): EmailValidationResult {
  const warnings: string[] = [];
  const normalizedEmail = normalizeEmail(email);
  const domain = getEmailDomain(email);
  const isFreeEmail = isFreeEmailProvider(email);

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(email) && email.length <= 254;

  // Check for suspicious patterns
  if (isFreeEmail) {
    warnings.push("Free email provider detected");
  }

  // Check for suspicious local part patterns
  const suspiciousPatterns = [
    /^test/i,
    /^temp/i,
    /^fake/i,
    /^spam/i,
    /^admin/i,
    /^noreply/i,
    /^no-reply/i,
    /^donotreply/i,
    /^donotreplay/i,
  ];

  const localPart = normalizedEmail.split("@")[0];
  if (suspiciousPatterns.some(pattern => pattern.test(localPart))) {
    warnings.push("Suspicious email pattern detected");
  }

  return {
    valid,
    isFreeEmail,
    normalizedEmail,
    domain,
    warnings,
  };
}

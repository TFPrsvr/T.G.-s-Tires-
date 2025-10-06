import { z } from 'zod';

export class SecurityInputValidator {
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(\b(script|javascript|vbscript|onload|onerror|onclick)\b)/gi,
    /[<>'"\\]/g,
    /(--|\#|\/\*|\*\/)/g,
  ];

  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  private static readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\./g,
    /\/\.\./g,
    /\.\.\\/g,
    /\.\.\//g,
  ];

  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .slice(0, 1000);
  }

  static validateEmail(email: string): boolean {
    const emailSchema = z.string().email().max(254);
    try {
      emailSchema.parse(email);
      return !this.containsSuspiciousPatterns(email);
    } catch {
      return false;
    }
  }

  static validatePhoneNumber(phone: string): boolean {
    const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]{10,20}$/);
    try {
      phoneSchema.parse(phone);
      return !this.containsSuspiciousPatterns(phone);
    } catch {
      return false;
    }
  }

  static validatePrice(price: string | number): boolean {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 999999;
  }

  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    if (this.containsSuspiciousPatterns(file.name)) {
      return { valid: false, error: 'Suspicious file name detected.' };
    }

    return { valid: true };
  }

  static containsSuspiciousPatterns(input: string): boolean {
    const patterns = [
      ...this.SQL_INJECTION_PATTERNS,
      ...this.XSS_PATTERNS,
      ...this.PATH_TRAVERSAL_PATTERNS,
    ];

    return patterns.some(pattern => pattern.test(input));
  }

  static validateTireData(data: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof data !== 'object' || data === null) {
      errors.push('Invalid data format');
      return { valid: false, errors };
    }

    const tireData = data as Record<string, unknown>;

    if (!tireData.size || typeof tireData.size !== 'string' || tireData.size.length > 50) {
      errors.push('Invalid tire size format');
    }

    if (tireData.price && !this.validatePrice(tireData.price)) {
      errors.push('Invalid price format');
    }

    if (tireData.description && (typeof tireData.description !== 'string' || tireData.description.length > 2000)) {
      errors.push('Description too long or invalid format');
    }

    if (this.containsSuspiciousPatterns(JSON.stringify(data))) {
      errors.push('Suspicious content detected');
    }

    return { valid: errors.length === 0, errors };
  }

  static logSecurityEvent(event: string, details: unknown, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      ip: 'N/A', // Will be filled by middleware
    };

    console.warn(`[SECURITY ${severity}]`, logEntry);

    if (severity === 'CRITICAL' || severity === 'HIGH') {
      // In production, this would trigger alerts
      console.error('HIGH SEVERITY SECURITY EVENT', logEntry);
    }
  }
}
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/security/rate-limiter';
import { IPSecurityManager } from '@/lib/security/ip-security';
import { SecurityInputValidator } from '@/lib/security/input-validator';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.nextUrl.pathname;

  // Layer 1: Network Security - IP Analysis and Rate Limiting
  const ipAnalysis = IPSecurityManager.analyzeIP(ip, userAgent);
  if (!ipAnalysis.allowed) {
    SecurityInputValidator.logSecurityEvent(
      'IP_BLOCKED',
      { ip, reason: ipAnalysis.reason, url },
      'HIGH'
    );
    return new NextResponse('Access denied', { status: 403 });
  }

  // Rate limiting based on route type
  let rateLimitType: keyof typeof RateLimiter.LIMITS = 'API';
  if (url.startsWith('/api/auth')) rateLimitType = 'LOGIN';
  else if (url.startsWith('/api/upload')) rateLimitType = 'UPLOAD';
  else if (url.includes('register')) rateLimitType = 'REGISTRATION';

  const rateLimitResult = RateLimiter.check(ip, rateLimitType);
  if (!rateLimitResult.allowed) {
    IPSecurityManager.reportViolation(ip, 'RATE_LIMIT');
    return new NextResponse('Rate limit exceeded', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      },
    });
  }

  // Layer 2: Input Validation - Check for suspicious patterns in URL and query params
  const fullUrl = request.url;
  if (SecurityInputValidator.containsSuspiciousPatterns(fullUrl)) {
    IPSecurityManager.reportViolation(ip, 'SUSPICIOUS_INPUT');
    SecurityInputValidator.logSecurityEvent(
      'SUSPICIOUS_URL_PATTERN',
      { ip, url: fullUrl },
      'MEDIUM'
    );
    return new NextResponse('Invalid request', { status: 400 });
  }

  // Security headers for all responses
  const response = NextResponse.next();

  // Layer 5: Additional Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Rate limiting headers
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remainingRequests.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

  // Layer 6: Real-Time Monitoring - Log request
  const processingTime = Date.now() - start;
  if (processingTime > 1000) {
    SecurityInputValidator.logSecurityEvent(
      'SLOW_REQUEST',
      { ip, url, processingTime, userAgent },
      'LOW'
    );
  }

  return response;
}

function getClientIP(request: NextRequest): string {
  // Try various headers to get the real client IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIp) {
    return xRealIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return request.ip || '127.0.0.1';
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
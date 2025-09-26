interface IPReputation {
  ip: string;
  trustScore: number;
  lastSeen: number;
  violations: number;
  blocked: boolean;
  country?: string;
}

export class IPSecurityManager {
  private static ipDatabase = new Map<string, IPReputation>();

  private static readonly BLOCKED_COUNTRIES = [
    // Add countries if needed for geo-blocking
  ];

  private static readonly KNOWN_VPN_RANGES = [
    // Common VPN IP ranges - in production, use a proper VPN detection service
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
  ];

  static analyzeIP(ip: string, userAgent?: string): {
    allowed: boolean;
    trustScore: number;
    reason?: string;
  } {
    const reputation = this.getOrCreateReputation(ip);

    // Check if IP is blocked
    if (reputation.blocked) {
      return {
        allowed: false,
        trustScore: 0,
        reason: 'IP address is blocked due to previous violations',
      };
    }

    // Calculate trust score based on history
    let trustScore = Math.max(0, 100 - reputation.violations * 10);

    // Check for suspicious patterns
    if (this.isSuspiciousUserAgent(userAgent)) {
      trustScore -= 20;
    }

    if (this.isKnownVPN(ip)) {
      trustScore -= 15;
    }

    // Update reputation
    reputation.lastSeen = Date.now();
    reputation.trustScore = trustScore;
    this.ipDatabase.set(ip, reputation);

    return {
      allowed: trustScore > 30,
      trustScore,
      reason: trustScore <= 30 ? 'Low trust score due to suspicious activity' : undefined,
    };
  }

  static reportViolation(
    ip: string,
    violationType: 'RATE_LIMIT' | 'SUSPICIOUS_INPUT' | 'AUTH_FAILURE' | 'MALICIOUS_REQUEST'
  ): void {
    const reputation = this.getOrCreateReputation(ip);
    reputation.violations++;

    // Auto-block after certain violations
    if (reputation.violations >= 10) {
      reputation.blocked = true;
      console.warn(`[SECURITY CRITICAL] Auto-blocked IP ${ip} after ${reputation.violations} violations`);
    }

    this.ipDatabase.set(ip, reputation);

    console.warn(`[SECURITY MEDIUM] IP violation reported: ${ip} - ${violationType}`, {
      violations: reputation.violations,
      trustScore: reputation.trustScore,
    });
  }

  static blockIP(ip: string, reason: string): void {
    const reputation = this.getOrCreateReputation(ip);
    reputation.blocked = true;
    reputation.violations += 5; // Penalty for manual block

    this.ipDatabase.set(ip, reputation);

    console.warn(`[SECURITY HIGH] Manually blocked IP: ${ip} - Reason: ${reason}`);
  }

  static unblockIP(ip: string): void {
    const reputation = this.getOrCreateReputation(ip);
    reputation.blocked = false;
    reputation.violations = Math.max(0, reputation.violations - 2);

    this.ipDatabase.set(ip, reputation);

    console.info(`[SECURITY INFO] Unblocked IP: ${ip}`);
  }

  private static getOrCreateReputation(ip: string): IPReputation {
    let reputation = this.ipDatabase.get(ip);

    if (!reputation) {
      reputation = {
        ip,
        trustScore: 100,
        lastSeen: Date.now(),
        violations: 0,
        blocked: false,
      };
      this.ipDatabase.set(ip, reputation);
    }

    return reputation;
  }

  private static isSuspiciousUserAgent(userAgent?: string): boolean {
    if (!userAgent) return true;

    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /python/i,
      /curl/i,
      /wget/i,
      /postman/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private static isKnownVPN(ip: string): boolean {
    // In production, use a proper VPN detection service
    // This is a simplified check
    return this.KNOWN_VPN_RANGES.some(range => {
      // Simple CIDR check - in production use proper IP range checking
      return ip.startsWith(range.split('/')[0].slice(0, -2));
    });
  }

  static getIPStats(): {
    totalIPs: number;
    blockedIPs: number;
    averageTrustScore: number;
  } {
    const ips = Array.from(this.ipDatabase.values());
    const blockedIPs = ips.filter(ip => ip.blocked).length;
    const averageTrustScore = ips.length > 0
      ? ips.reduce((sum, ip) => sum + ip.trustScore, 0) / ips.length
      : 100;

    return {
      totalIPs: ips.length,
      blockedIPs,
      averageTrustScore: Math.round(averageTrustScore),
    };
  }

  static cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    for (const [ip, reputation] of this.ipDatabase.entries()) {
      if (!reputation.blocked && now - reputation.lastSeen > maxAge) {
        this.ipDatabase.delete(ip);
      }
    }
  }
}

// Clean up old IP records every hour
if (typeof window === 'undefined') {
  setInterval(() => {
    IPSecurityManager.cleanup();
  }, 60 * 60 * 1000);
}
import { NextResponse } from 'next/server';

// Dynamic import to handle cases where jsonwebtoken might not be available
let jwt: any;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  // jsonwebtoken not available
}

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: 'unknown',
  };

  // Check 1: Environment Variables
  const checks = {
    APPLE_ID: !!process.env.APPLE_ID,
    APPLE_SECRET: !!process.env.APPLE_SECRET,
    APPLE_TEAM_ID: !!process.env.APPLE_TEAM_ID,
    APPLE_KEY_ID: !!process.env.APPLE_KEY_ID,
  };

  results.checks.environmentVariables = {
    ...checks,
    allPresent: Object.values(checks).every(v => v === true),
  };

  // Check 2: Validate JWT Token Format
  if (process.env.APPLE_SECRET) {
    if (!jwt) {
      results.checks.jwtToken = {
        valid: false,
        error: 'jsonwebtoken module not available',
      };
    } else {
      try {
        const decoded = jwt.decode(process.env.APPLE_SECRET, { complete: true });
      
      if (decoded && typeof decoded === 'object' && 'header' in decoded && 'payload' in decoded) {
        const header = decoded.header as any;
        const payload = decoded.payload as any;
        
        results.checks.jwtToken = {
          valid: true,
          algorithm: header.alg,
          keyId: header.kid,
          issuer: payload.iss,
          audience: payload.aud,
          subject: payload.sub,
          issuedAt: new Date(payload.iat * 1000).toISOString(),
          expiresAt: new Date(payload.exp * 1000).toISOString(),
          expiresInDays: Math.floor((payload.exp - payload.iat) / 86400),
        };

        // Validate token structure
        results.checks.jwtToken.validStructure = 
          header.alg === 'ES256' &&
          header.kid === process.env.APPLE_KEY_ID &&
          payload.iss === process.env.APPLE_TEAM_ID &&
          payload.aud === 'https://appleid.apple.com' &&
          payload.sub === process.env.APPLE_ID;
        } else {
          results.checks.jwtToken = {
            valid: false,
            error: 'Invalid JWT structure',
          };
        }
      } catch (error: any) {
        results.checks.jwtToken = {
          valid: false,
          error: error.message,
        };
      }
    }
  } else {
    results.checks.jwtToken = {
      valid: false,
      error: 'APPLE_SECRET not set',
    };
  }

  // Check 3: Values Match
  if (process.env.APPLE_SECRET && results.checks.jwtToken.valid) {
    const jwtData = results.checks.jwtToken;
    results.checks.valuesMatch = {
      teamIdMatches: jwtData.issuer === process.env.APPLE_TEAM_ID,
      keyIdMatches: jwtData.keyId === process.env.APPLE_KEY_ID,
      servicesIdMatches: jwtData.subject === process.env.APPLE_ID,
      allMatch: 
        jwtData.issuer === process.env.APPLE_TEAM_ID &&
        jwtData.keyId === process.env.APPLE_KEY_ID &&
        jwtData.subject === process.env.APPLE_ID,
    };
  }

  // Check 4: NextAuth Provider Availability
  try {
    // Try to import and check if provider would be available
    const hasAppleProvider = !!(process.env.APPLE_ID && process.env.APPLE_SECRET);
    results.checks.nextAuthProvider = {
      available: hasAppleProvider,
      reason: hasAppleProvider 
        ? 'Apple provider will be initialized' 
        : 'Missing APPLE_ID or APPLE_SECRET',
    };
  } catch (error: any) {
    results.checks.nextAuthProvider = {
      available: false,
      error: error.message,
    };
  }

  // Overall Status
  const allChecks = [
    results.checks.environmentVariables?.allPresent,
    results.checks.jwtToken?.valid,
    results.checks.jwtToken?.validStructure,
    results.checks.valuesMatch?.allMatch,
    results.checks.nextAuthProvider?.available,
  ].filter(v => v !== undefined);

  results.overall = allChecks.every(v => v === true) ? 'pass' : 'fail';
  results.summary = {
    totalChecks: allChecks.length,
    passedChecks: allChecks.filter(v => v === true).length,
    failedChecks: allChecks.filter(v => v === false).length,
  };

  // Add helpful messages
  results.messages = [];
  if (!results.checks.environmentVariables?.allPresent) {
    results.messages.push('⚠️ Some environment variables are missing');
  }
  if (!results.checks.jwtToken?.valid) {
    results.messages.push('❌ JWT token is invalid or malformed');
  }
  if (!results.checks.valuesMatch?.allMatch) {
    results.messages.push('⚠️ JWT token values do not match environment variables');
  }
  if (results.checks.jwtToken?.expiresInDays && results.checks.jwtToken.expiresInDays < 30) {
    results.messages.push(`⚠️ JWT token expires in ${results.checks.jwtToken.expiresInDays} days - consider regenerating`);
  }
  if (results.overall === 'pass') {
    results.messages.push('✅ All checks passed! Apple Sign-In should work correctly.');
  }

  return NextResponse.json(results, {
    status: results.overall === 'pass' ? 200 : 400,
  });
}

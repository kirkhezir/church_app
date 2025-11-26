import jwt from 'jsonwebtoken';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Token pair for authentication
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT Service for token generation and validation
 */
export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret =
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || `${this.accessTokenSecret}-refresh`;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'church-app',
      audience: 'church-app-users',
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'church-app',
      audience: 'church-app-users',
    } as jwt.SignOptions);
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'church-app',
        audience: 'church-app-users',
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify and decode refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'church-app',
        audience: 'church-app-users',
      }) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Decode token without verification (for inspection)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Generate a temporary MFA token for the login flow
   * This token is short-lived and used only to verify MFA during login
   */
  generateMFAToken(payload: JWTPayload): string {
    return jwt.sign({ ...payload, type: 'mfa' }, this.accessTokenSecret, {
      expiresIn: '5m', // MFA token expires in 5 minutes
      issuer: 'church-app',
      audience: 'church-app-mfa',
    } as jwt.SignOptions);
  }

  /**
   * Verify MFA token
   */
  verifyMFAToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'church-app',
        audience: 'church-app-mfa',
      }) as JWTPayload & { type: string };

      if (decoded.type !== 'mfa') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('MFA token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid MFA token');
      }
      throw new Error('MFA token verification failed');
    }
  }
}

// Export singleton instance
export const jwtService = new JWTService();

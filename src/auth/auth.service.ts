import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback',
    );
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getTokens(code: string): Promise<Credentials> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({ access_token: token });
      await google.oauth2('v2').tokeninfo({
        access_token: token,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<Credentials> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }
}

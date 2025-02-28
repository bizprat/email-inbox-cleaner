import {
  Controller,
  Get,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @Get('google')
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  async googleAuth(@Res() res: Response) {
    const authUrl = this.authService.getAuthUrl();
    res.redirect(authUrl);
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      throw new UnauthorizedException(error);
    }

    try {
      const tokens = await this.authService.getTokens(code);
      await this.emailService.setCredentials(tokens);

      // In a real application, you would:
      // 1. Store the refresh token securely
      // 2. Set up a session or JWT
      // 3. Store user information

      res.redirect('/emails'); // Redirect to the main application
    } catch (err) {
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Query('refresh_token') refreshToken: string) {
    try {
      const credentials = await this.authService.refreshToken(refreshToken);
      await this.emailService.setCredentials(credentials);
      return { success: true, data: credentials };
    } catch (err) {
      throw new UnauthorizedException('Failed to refresh token');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { StorageService } from '../storage/storage.service';
import { OAuth2Client } from 'google-auth-library';
import { Credentials } from 'google-auth-library';
import { GmailMessage, GmailLabel } from './gmail.types';

@Injectable()
export class EmailService {
  private readonly oauth2Client: OAuth2Client;
  private readonly gmail: any;

  constructor(private readonly storageService: StorageService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback',
    );

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async setCredentials(credentials: Credentials) {
    this.oauth2Client.setCredentials(credentials);
  }

  async fetchEmails(query = 'in:inbox', maxResults = 100) {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = (response.data.messages as { id: string }[]) || [];
      const emails = await Promise.all(
        messages.map(async (message: { id: string }) => {
          const { data: email } = (await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          })) as { data: GmailMessage };

          const headers = email.payload.headers;
          const subject =
            headers.find((h) => h.name === 'Subject')?.value || '';
          const from = headers.find((h) => h.name === 'From')?.value || '';
          const to = headers.find((h) => h.name === 'To')?.value || '';
          const date = new Date(parseInt(email.internalDate, 10)).toISOString();

          let attachmentsSize = 0;
          if (email.payload.parts) {
            attachmentsSize = email.payload.parts.reduce(
              (size: number, part) => size + (part.body.size || 0),
              0,
            );
          }

          return this.storageService.saveEmail({
            messageId: email.id,
            threadId: email.threadId,
            subject,
            from,
            to,
            receivedAt: new Date(date),
            labels: email.labelIds || [],
            attachmentsSize,
            isArchived: email.labelIds?.includes('ARCHIVED') || false,
            isDeleted: email.labelIds?.includes('TRASH') || false,
          });
        }),
      );

      // Update email stats
      for (const email of emails) {
        await this.storageService.updateEmailStats({
          sender: email.from,
          emailCount: 1,
          lastEmailDate: email.receivedAt,
          totalAttachmentsSize: email.attachmentsSize || 0,
        });
      }

      return emails;
    } catch (error) {
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }

  async archiveEmail(messageId: string) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: ['ARCHIVED'],
          removeLabelIds: ['INBOX'],
        },
      });

      await this.storageService.saveEmail({
        messageId,
        isArchived: true,
      });
    } catch (error) {
      throw new Error(`Failed to archive email: ${error.message}`);
    }
  }

  async deleteEmail(messageId: string) {
    try {
      await this.gmail.users.messages.trash({
        userId: 'me',
        id: messageId,
      });

      await this.storageService.saveEmail({
        messageId,
        isDeleted: true,
      });
    } catch (error) {
      throw new Error(`Failed to delete email: ${error.message}`);
    }
  }

  async addLabel(messageId: string, labelName: string) {
    try {
      // First, check if label exists
      const labelsResponse = await this.gmail.users.labels.list({
        userId: 'me',
      });

      let label = (labelsResponse.data.labels as GmailLabel[]).find(
        (l) => l.name === labelName,
      );

      // Create label if it doesn't exist
      if (!label) {
        const createResponse = await this.gmail.users.labels.create({
          userId: 'me',
          requestBody: {
            name: labelName,
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
          },
        });
        label = createResponse.data;
      }

      // Add label to message
      if (!label?.id) {
        throw new Error('Failed to create or find label');
      }

      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [label.id],
        },
      });

      // Update local storage
      const email = await this.storageService.saveEmail({
        messageId,
        labels: [labelName],
      });

      return email;
    } catch (error) {
      throw new Error(`Failed to add label: ${error.message}`);
    }
  }
}

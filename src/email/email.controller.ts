import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { StorageService } from '../storage/storage.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('emails')
@Controller('emails')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Fetch emails with optional filters' })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'maxResults', required: false })
  async fetchEmails(
    @Query('query') query?: string,
    @Query('maxResults') maxResults?: number,
  ) {
    const emails = await this.emailService.fetchEmails(query, maxResults);
    return { success: true, data: emails };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get email statistics' })
  @ApiQuery({ name: 'sender', required: false })
  async getEmailStats(@Query('sender') sender?: string) {
    if (sender) {
      const stats = await this.storageService.getSenderStats(sender);
      return { success: true, data: stats };
    }
    const emails = await this.storageService.getEmails({});
    const stats = {
      total: emails.length,
      archived: emails.filter((e) => e.isArchived).length,
      deleted: emails.filter((e) => e.isDeleted).length,
      withAttachments: emails.filter((e) => (e.attachmentsSize ?? 0) > 0)
        .length,
    };
    return { success: true, data: stats };
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive an email' })
  async archiveEmail(@Param('id') messageId: string) {
    await this.emailService.archiveEmail(messageId);
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an email' })
  async deleteEmail(@Param('id') messageId: string) {
    await this.emailService.deleteEmail(messageId);
    return { success: true };
  }

  @Post(':id/labels')
  @ApiOperation({ summary: 'Add a label to an email' })
  async addLabel(
    @Param('id') messageId: string,
    @Body('label') labelName: string,
  ) {
    const email = await this.emailService.addLabel(messageId, labelName);
    return { success: true, data: email };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search emails with filters' })
  @ApiQuery({ name: 'sender', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'isArchived', required: false })
  @ApiQuery({ name: 'isDeleted', required: false })
  async searchEmails(
    @Query('sender') sender?: string,
    @Query('category') category?: string,
    @Query('isArchived') isArchived?: boolean,
    @Query('isDeleted') isDeleted?: boolean,
  ) {
    const emails = await this.storageService.getEmails({
      sender,
      category,
      isArchived,
      isDeleted,
    });
    return { success: true, data: emails };
  }
}

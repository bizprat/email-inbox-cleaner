# Email Cleaner

An AI-powered email organization tool built with NestJS that helps clean and organize your Gmail inbox.

## Features

- Gmail OAuth integration
- Email categorization and analysis using AI
- Support for multiple LLM providers (OpenAI and custom LLM endpoints)
- Bulk operations (delete, archive, label)
- Email analytics and insights
- REST API for third-party integrations
- Built with TypeScript and NestJS
- SQLite database with Drizzle ORM

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Gmail account
- Google Cloud Console project with Gmail API enabled
- AI Provider:
  - OpenAI API key, or
  - Custom LLM endpoint

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd email-inbox-cleaner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Google OAuth credentials
- Configure your preferred AI provider (see LLM Configuration below)

```bash
cp .env.example .env
```

4. Set up the database:
```bash
npm run db:generate   # Generate SQLite migrations
npm run db:migrate    # Create database tables

# The above commands will:
# 1. Generate SQL migration files in ./drizzle directory
# 2. Create sqlite.db file with the following tables:
#    - emails: Stores email data and analysis results
#    - email_stats: Tracks email statistics
#    - user_preferences: Stores user settings and rules
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.
API documentation will be available at http://localhost:3000/api.

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Configure OAuth Consent Screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Fill in the required fields:
     - App name: "Email Cleaner"
     - User support email: your email
     - Developer contact email: your email
   - Add scopes:
     - Select "Gmail API" scopes:
       - `.../auth/gmail.readonly`
       - `.../auth/gmail.modify`
       - `.../auth/gmail.labels`
   - Add test users (in testing mode)

5. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Email Cleaner"
   - Add Authorized redirect URIs:
     ```
     http://localhost:3000/auth/google/callback
     ```
   - Click "Create"
   - A popup will show your client ID and secret

6. Configure environment variables:
   ```bash
   # In your .env file:
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

Note: When testing, you might need to:
- Use an email address added as a test user
- Wait a few minutes after configuration before testing
- Ensure the redirect URI matches exactly

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## LLM Configuration

The application supports two LLM providers for email analysis. Configure your chosen provider in `.env`:

1. OpenAI Configuration:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-api-key
LLM_MODEL=gpt-4-turbo-preview     # Optional: Defaults to gpt-4-turbo-preview
```

2. Custom LLM Provider:
```env
LLM_PROVIDER=custom
LLM_API_KEY=your-api-key
LLM_BASE_URL=your-endpoint        # Example: http://localhost:8000/v1
LLM_MODEL=your-model-name         # Required: Your model identifier
```

The custom provider endpoint should accept requests in this format:
```json
{
  "model": "your-model-name",
  "prompt": "your-prompt",
  "temperature": 0.3
}

Response should be JSON:
{
  "type": "email-type",
  "sentiment": "sentiment-value",
  "summary": "email-summary",
  "actionRequired": boolean,
  "importance": number,
  "category": "category-value"
}
```

## Usage Instructions

After setting up the project, follow these steps to start cleaning your emails:

1. Start the Server:
```bash
npm run dev
```

2. Authenticate with Gmail:
   - Visit http://localhost:3000/auth/google in your browser
   - Allow access to your Gmail account when prompted
   - You'll be redirected back to the application

3. Use the API:
   ```bash
   # Get all inbox emails
   curl http://localhost:3000/emails

   # Search emails by sender
   curl "http://localhost:3000/emails/search?sender=example@gmail.com"

   # Get email statistics
   curl http://localhost:3000/emails/stats

   # Archive an email
   curl -X POST http://localhost:3000/emails/{email-id}/archive

   # Delete an email
   curl -X DELETE http://localhost:3000/emails/{email-id}

   # Add a label to an email
   curl -X POST http://localhost:3000/emails/{email-id}/labels \
     -H "Content-Type: application/json" \
     -d '{"label": "Important"}'

   # Analyze an email with AI
   curl -X POST http://localhost:3000/analytics/analyze \
     -H "Content-Type: application/json" \
     -d '{
       "subject": "Meeting Tomorrow",
       "body": "email content here",
       "from": "sender@example.com",
       "date": "2024-02-28T12:00:00Z"
     }'
   ```

4. Example Responses:
   ```json
   # GET /emails/stats
   {
     "success": true,
     "data": {
       "total": 150,
       "archived": 45,
       "deleted": 12,
       "withAttachments": 30
     }
   }

   # POST /analytics/analyze
   {
     "success": true,
     "data": {
       "type": "business",
       "sentiment": "positive",
       "summary": "Meeting confirmation for tomorrow at 2 PM",
       "actionRequired": true,
       "importance": 4,
       "category": "meetings"
     }
   }
   ```

5. Access Documentation:
   - Full API documentation: http://localhost:3000/api
   - Interactive Swagger UI for testing endpoints
   - Detailed request/response schemas

The application will:
- Store email metadata in SQLite database
- Track email statistics and patterns
- Provide AI-powered analysis
- Maintain synchronization with Gmail
- Allow bulk operations through the API

## API Endpoints

### Auth
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/refresh` - Refresh access token

### Emails
- `GET /emails` - List emails
- `GET /emails/search` - Search emails
- `GET /emails/stats` - Get email statistics
- `POST /emails/:id/archive` - Archive an email
- `DELETE /emails/:id` - Delete an email
- `POST /emails/:id/labels` - Add label to email

### Analytics
- `POST /analytics/analyze` - Analyze a single email
- `POST /analytics/batch-analyze` - Analyze multiple emails
- `GET /analytics/config` - Get current LLM configuration

## Database Schema

### Emails
- messageId (unique)
- threadId
- subject
- from
- to
- receivedAt
- labels
- attachmentsSize
- category
- importance
- isArchived
- isDeleted
- aiAnalysis

### EmailStats
- sender
- emailCount
- lastEmailDate
- averageResponseTime
- totalAttachmentsSize
- categories

### UserPreferences
- userId
- autoArchiveRules
- autoLabelRules
- defaultImportance

## Troubleshooting

### Common Issues

1. Authentication Issues:
   ```
   Error: Failed to authenticate with Google
   ```
   - Check if your Google OAuth credentials are correct in `.env`
   - Ensure Gmail API is enabled in Google Cloud Console
   - Verify the redirect URI matches exactly

2. LLM Configuration:
   ```
   Error: API key not found for provider
   ```
   - Check if you've set the correct LLM provider in `.env`
   - Verify API key is set for your chosen provider
   - For custom LLM, ensure base URL is accessible

3. Database Issues:
   ```
   Error: no such table: emails
   ```
   - Run `npm run db:generate && npm run db:migrate`
   - Check if sqlite.db file exists in root directory
   - Verify database permissions

4. Email Fetching:
   ```
   Error: Failed to fetch emails
   ```
   - Check your Google OAuth token hasn't expired
   - Use `/auth/refresh` endpoint to refresh token
   - Verify Gmail API quotas and limits

### Getting Help

- Check the detailed logs with `npm run dev`
- Use Swagger UI at `/api` for API documentation
- File issues on GitHub with logs and reproduction steps

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

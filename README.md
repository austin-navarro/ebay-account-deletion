# Account Deletion Notification Service

A service to handle account deletion notifications from Google Marketplace.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.template` to `.env` and fill in your values:
   ```bash
   cp .env.template .env
   ```
4. Start the service:
   ```bash
   npm start
   ```

## Development

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health`
- Returns service health status

### Account Deletion Notification
- `POST /account-deletion`
- Headers:
  - `x-verification-token`: Your verification token
- Body (JSON):
  ```json
  {
    "user_id": "abc123",
    "deleted_at": "2025-04-10T12:34:56Z"
  }
  ```

## Railway Deployment

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Deploy:
   ```bash
   railway up
   ```

## Environment Variables

- `VERIFICATION_TOKEN`: Secret token for webhook verification
- `PORT`: Port to run the service on (default: 3000)
- `NODE_ENV`: Environment name (development/production) 
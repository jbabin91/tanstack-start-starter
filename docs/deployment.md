# Deployment

This application is configured for automatic deployment using [Coolify](https://coolify.io), a self-hostable alternative to Heroku/Netlify/Vercel.

## Auto-Deployment

The application is automatically deployed when changes are pushed to the main branch. Coolify handles:

- **Build Process** - Runs `pnpm build` automatically
- **Environment Variables** - Manages production secrets and configuration
- **Database Migrations** - Executes database migrations on deployment
- **Health Checks** - Monitors application availability
- **SSL/TLS** - Provides automatic HTTPS certificates

## Environment Configuration

The following environment variables are required for production:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_BASE_URL=https://your-domain.com

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@your-domain.com

# File Storage (optional)
S3_BUCKET_NAME=your-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Manual Deployment

If deploying manually to other platforms:

### Build Commands

```sh
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Setup

```sh
# Run migrations
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed
```

### Health Check

The application exposes a health check endpoint at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Performance Considerations

- **PostgreSQL** - Ensure proper indexing and connection pooling
- **CDN** - Use a CDN for static assets and images
- **Memory** - Minimum 512MB RAM recommended
- **Node.js** - Version 18+ required

## Monitoring

Coolify provides built-in monitoring for:

- Application uptime and response times
- Resource usage (CPU, memory, disk)
- Database connectivity and performance
- Error logs and alerts

For additional monitoring, consider integrating with external services like:

- **Sentry** for error tracking
- **LogRocket** for user session replay
- **Posthog** for analytics

## Scaling

For high-traffic deployments:

- **Horizontal Scaling** - Deploy multiple application instances
- **Database Scaling** - Use read replicas for improved performance
- **Caching** - Implement Redis for session storage and caching
- **Load Balancing** - Distribute traffic across instances

Coolify supports these scaling patterns through its Docker-based infrastructure.

## Support

For deployment issues:

1. Check Coolify logs for build/runtime errors
2. Verify environment variables are properly set
3. Ensure database connectivity and migrations are complete
4. Review the [TanStack Start deployment docs](https://tanstack.com/start/latest/docs/deployment)

The application follows standard Node.js deployment practices and should work with most hosting providers that support Docker or Node.js applications.

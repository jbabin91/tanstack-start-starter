# Enhanced Session Management Database Architecture

## Overview

Comprehensive database architecture for enhanced session management features in TanStack Start application. Integrates seamlessly with better-auth's existing sessions table while providing detailed tracking, security monitoring, and device management capabilities.

## Schema Design

### Core Architecture

```sh
sessions (better-auth managed)
├── session_metadata (1:1) - Detailed session tracking
├── session_activity_log (1:many) - Audit trail
└── trusted_devices (many:many via user) - Device management
```

### Table Relationships

1. **session_metadata** → **sessions** (1:1, CASCADE DELETE)
2. **trusted_devices** → **users** (many:1)
3. **session_activity_log** → **sessions** (many:1, CASCADE DELETE)
4. **session_activity_log** → **users** (many:1)

## Table Specifications

### session_metadata

**Purpose**: Detailed tracking of session characteristics, security scoring, and activity metrics.

**Key Features**:

- Device fingerprinting and identification
- Geographic and network information
- Security scoring (0-100)
- Trust device status
- Activity counters and timestamps

**Security Considerations**:

- Device fingerprints are SHA-256 hashed
- Location data limited to country/region level
- Trust factors stored as encrypted JSON
- Row-level security policies enforced

### trusted_devices

**Purpose**: Persistent device management allowing users to trust devices across sessions.

**Key Features**:

- User-assigned device names
- Trust levels (high, medium, low)
- Expiration dates for temporary trust
- Activity tracking (first seen, last seen)
- Soft deletion with is_active flag

### session_activity_log

**Purpose**: Comprehensive audit trail for security, compliance, and analytics.

**Key Features**:

- Activity type classification (login, logout, page_view, api_request, security_event, error)
- Request/response tracking
- Performance monitoring
- Flexible JSON event details
- Monthly partitioning for performance

## Performance Optimization

### Index Strategy

**session_metadata**: session_id (unique), device_fingerprint, security_score, last_activity_at, created_at
**trusted_devices**: (user_id, is_active), device_fingerprint, expires_at, last_seen_at
**session_activity_log**: (session_id, created_at DESC), (user_id, created_at DESC), activity_type, ip_address

### Query Performance

Estimated times with proper indexing:

- User's active sessions: <10ms
- Session metadata lookup: <5ms
- Trusted devices for user: <10ms
- Activity log for session: <20ms
- Security score analysis: <50ms

## Data Retention Strategy

### Retention Policies

- **session_metadata**: 30 days after session expiry
- **trusted_devices**: 1 year inactive (soft → hard delete)
- **session_activity_log**: 90 days detailed, 2 years archived

### Cleanup Implementation

- Daily cleanup for expired devices
- Monthly archival for activity logs
- Automated stored procedures
- Storage monitoring and alerts

## Security Implementation

### Data Protection

- SHA-256 hashed device fingerprints with salt
- Location data limited to country/region
- Encrypted sensitive JSON fields
- Row-level security (RLS) policies
- Audit logging for administrative access

### Access Control

- Users access only their own session data
- Admin roles with audit logging
- Service accounts with limited read access
- No direct public access to metadata tables

## Migration Strategy

### 5-Phase Approach

1. **Core Infrastructure**: session_metadata table + basic indexes
2. **Device Management**: trusted_devices table + relationships
3. **Activity Logging**: session_activity_log with partitioning
4. **Security & Optimization**: RLS policies + encryption
5. **Monitoring & Maintenance**: dashboards + automated cleanup

### Commands Ready

- `pnpm db:generate` - Generate migrations from schema
- `pnpm db:migrate` - Apply migrations to database
- `pnpm db:studio` - Visual inspection of new tables

## Integration with TanStack Start

### Compatibility

- **Zero Breaking Changes**: All additions are compatible with existing better-auth schema
- **Foreign Key Integrity**: Proper references with cascade deletes
- **Schema Generation**: Compatible with `pnpm auth:generate` workflow

### Implementation Patterns

- **Arktype Validation**: Full integration with project validation patterns
- **Snake Case**: Consistent PostgreSQL naming convention
- **nanoid() IDs**: Using project's ID generation utility
- **Module Structure**: Ready for API organization in `src/modules/*/api/`

## File Locations

- **Schema**: `src/lib/db/schemas/session-metadata.ts`
- **Enhanced Seed**: `src/lib/db/seed.ts` (includes realistic session data)
- **Schema Index**: `src/lib/db/schemas/index.ts` (updated exports)

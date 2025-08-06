# Security Documentation

Comprehensive security documentation covering authentication, authorization, and security best practices for the platform.

## Overview

The platform implements a multi-layered security architecture with:

- **Authentication** - Email/password with verification using better-auth
- **Authorization** - Role-based permissions with organizational context
- **Session Management** - Multi-session support with secure token handling
- **Data Protection** - Resource-level access control and audit trails

## Authentication & Identity

### [Authentication Flows](./authentication-flows.md)

Complete authentication system implementation:

- **Registration and email verification** workflows
- **Login processes** including organization context switching
- **Multi-session management** for multiple devices and organizations
- **Password management** including reset and change flows
- **Security patterns** including rate limiting and session validation

Essential for understanding user identity management and session security.

### [Permissions System](./permissions-system.md)

Role-based access control across personal and organizational contexts:

- **Permission architecture** with global and organization-specific permissions
- **Role hierarchy** from members to owners with appropriate access levels
- **Resource-level security** for fine-grained access control
- **Server function protection** with standardized permission middleware
- **Client-side permission checking** with React hooks and conditional rendering

Critical for implementing secure feature access and data protection.

## Security Architecture

### Authentication Stack

**better-auth Integration:**

```typescript
export const auth = betterAuth({
  database: { provider: 'pg', url: env.DATABASE_URL },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    organization({ allowUserToCreateOrganization: true }),
    multiSession(),
    username(),
  ],
});
```

**Session Security Features:**

- **Automatic expiration** with configurable timeout
- **Token rotation** for enhanced security
- **Multi-device support** with session isolation
- **Organization context switching** with permission validation

### Authorization Model

**Hierarchical Permissions:**

- **Personal Context** - Individual user permissions
- **Organization Context** - Role-based permissions within organizations
- **Resource-Level** - Fine-grained access control for posts and data

**Permission Resolution:**

```typescript
// Context-aware permission checking
const permissions = await getUserPermissions(userId, organizationId);
const hasAccess =
  permissions.includes(requiredPermission) || permissions.includes('*');
```

## Security Best Practices

### Server-Side Security

**Always Validate on Server:**

```typescript
// Correct approach - server-side validation
export const protectedAction = createServerFn({ method: 'POST' }).handler(
  async (data) => {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new Error('Unauthorized');

    const hasPermission = await checkPermissions(
      session.user.id,
      'required:permission',
    );
    if (!hasPermission) throw new Error('Forbidden');

    // Perform protected action
  },
);
```

**Defense in Depth:**

1. **Route Protection** - Prevent unauthorized page access
2. **API Protection** - Validate all server function calls
3. **Resource Checks** - Verify ownership and context
4. **UI Hiding** - Conditional rendering based on permissions

### Client-Side Security

**Permission-Based UI:**

```typescript
function SecureComponent() {
  const hasPermission = useHasPermission('feature:access');

  if (!hasPermission) {
    return <AccessDenied />;
  }

  return <ProtectedFeature />;
}
```

**Security Headers:**

- **CSRF Protection** - Built into better-auth
- **XSS Prevention** - Content Security Policy headers
- **Secure Cookies** - httpOnly and secure flags
- **HTTPS Enforcement** - TLS termination at load balancer

## Data Protection

### Personal Data Handling

**User Information:**

- **Email addresses** - Encrypted in database
- **Passwords** - Hashed using bcrypt with salt
- **Profile data** - Access-controlled based on privacy settings
- **Session tokens** - Secure generation and storage

**GDPR Compliance:**

- **Data minimization** - Collect only necessary information
- **Right to deletion** - Account deletion removes all user data
- **Data portability** - Export user's content and data
- **Consent management** - Clear opt-in for data processing

### Content Security

**Post Access Control:**

```typescript
// Multi-layered content security
async function checkPostAccess(userId: string, postId: string, action: string) {
  const post = await getPost(postId);

  // Check publication status
  if (post.status !== 'published' && post.authorId !== userId) {
    // Verify co-author access or organization permissions
    return await checkDetailedPermissions(userId, post, action);
  }

  return true;
}
```

**Draft Protection:**

- **Private by default** - Only author has access initially
- **Controlled sharing** - Explicit permission grants for collaborators
- **Expiring links** - Time-limited access for external reviewers
- **Audit trails** - Track all access to sensitive content

## Monitoring and Auditing

### Security Logging

**Authentication Events:**

```typescript
// Comprehensive audit logging
await logSecurityEvent({
  type: 'authentication',
  action: 'login_attempt',
  userId: user.id,
  success: true,
  metadata: { ipAddress, userAgent, organizationId },
});
```

**Permission Checks:**

```typescript
// Track all permission decisions
await auditPermissionCheck(userId, permission, resourceId, granted, {
  organizationId,
  context,
});
```

### Anomaly Detection

**Suspicious Activity Patterns:**

- **Multiple failed login attempts** from same IP
- **Unusual organization switching** patterns
- **Bulk data access** outside normal patterns
- **Permission escalation** attempts

**Response Actions:**

- **Account lockout** after failed attempts
- **Session revocation** for suspicious activity
- **Admin notifications** for critical events
- **Automated blocking** of malicious IPs

## Incident Response

### Security Incident Workflow

1. **Detection** - Automated monitoring and manual reporting
2. **Assessment** - Determine scope and severity of incident
3. **Containment** - Isolate affected systems and revoke access
4. **Investigation** - Analyze logs and determine root cause
5. **Recovery** - Restore services and implement fixes
6. **Post-incident** - Document lessons learned and update procedures

### Emergency Procedures

**Account Compromise:**

```typescript
// Emergency account lockdown
export const emergencyLockdown = createServerFn({ method: 'POST' }).handler(
  async ({ userId, reason }) => {
    // Revoke all sessions
    await auth.api.revokeUserSessions(userId);

    // Disable account
    await disableUserAccount(userId);

    // Audit trail
    await logSecurityIncident('account_lockdown', { userId, reason });
  },
);
```

## Security Testing

### Automated Security Testing

**Authentication Tests:**

```typescript
describe('Authentication Security', () => {
  test('prevents brute force attacks', async () => {
    // Test rate limiting
    for (let i = 0; i < 10; i++) {
      await expect(loginWithBadPassword()).rejects.toThrow();
    }

    // Verify account lockout
    await expect(loginWithGoodPassword()).rejects.toThrow('Account locked');
  });
});
```

**Permission Tests:**

```typescript
describe('Authorization', () => {
  test('prevents privilege escalation', async () => {
    const member = await createMember();
    const adminAction = adminOnlyServerFunction;

    await expect(adminAction.call(member)).rejects.toThrow('Forbidden');
  });
});
```

### Manual Security Reviews

**Regular Security Audits:**

- **Code reviews** focusing on security implications
- **Penetration testing** of authentication flows
- **Permission matrix verification** across all features
- **Social engineering** assessments

## Compliance and Standards

### Security Standards

**OWASP Top 10 Compliance:**

- ✅ **Injection Prevention** - Parameterized queries with Drizzle ORM
- ✅ **Broken Authentication** - Industry-standard session management
- ✅ **Sensitive Data Exposure** - Encryption at rest and in transit
- ✅ **XML External Entities** - Not applicable (no XML processing)
- ✅ **Broken Access Control** - Comprehensive permission system
- ✅ **Security Misconfiguration** - Secure defaults and configuration
- ✅ **Cross-Site Scripting** - Content Security Policy and input sanitization
- ✅ **Insecure Deserialization** - Type-safe serialization with TypeScript
- ✅ **Components with Known Vulnerabilities** - Regular dependency updates
- ✅ **Insufficient Logging & Monitoring** - Comprehensive audit trails

### Privacy Protection

**Data Protection Principles:**

- **Purpose limitation** - Data used only for stated purposes
- **Data minimization** - Collect only necessary information
- **Storage limitation** - Retain data only as long as needed
- **Accuracy** - Maintain accurate and up-to-date information
- **Security** - Implement appropriate technical safeguards

This security documentation provides comprehensive coverage of authentication, authorization, and protection mechanisms implemented across the platform. Regular reviews and updates ensure ongoing security effectiveness.

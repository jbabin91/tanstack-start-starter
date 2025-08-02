import type { InferSelectModel } from 'drizzle-orm';

import type {
  sessionActivityLog,
  sessionMetadata,
  sessions,
  trustedDevices,
} from '@/lib/db/schemas';

export type Session = InferSelectModel<typeof sessions>;
export type SessionActivity = InferSelectModel<typeof sessionActivityLog>;
export type SessionMetadata = InferSelectModel<typeof sessionMetadata>;
export type TrustedDevice = InferSelectModel<typeof trustedDevices>;

// Import the actual types from the server functions
export type { SessionActivity as SessionActivityFromAPI } from '@/modules/accounts/api/get-session-activity';
export type { SessionWithDetails } from '@/modules/accounts/api/get-sessions';

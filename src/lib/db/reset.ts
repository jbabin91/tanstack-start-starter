/* eslint-disable unicorn/no-process-exit */
import readline from 'node:readline';

import { reset } from 'drizzle-seed';

import { db } from '@/lib/db';
import * as schema from '@/lib/db/schemas';

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    '⚠️ This will ERASE ALL DATA in your database. Type "yes" to confirm: ',
    (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'yes') {
        reset(db, schema)
          .then(() => {
            console.log('✅ Database reset complete.');
            process.exit(0);
          })
          .catch((error) => {
            console.error('❌ Database reset failed:', error);
            process.exit(1);
          });
      } else {
        console.log('❌ Database reset aborted.');
        process.exit(0);
      }
    },
  );
}

main();

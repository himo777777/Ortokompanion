/**
 * Source Validation Script
 *
 * Quick check of source status without full content analysis
 *
 * Usage:
 * npm run validate-sources
 */

import { checkSourcesNeedingUpdate } from '../lib/content-validation';
import { VERIFIED_SOURCES } from '../data/verified-sources';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}=== SOURCE VALIDATION ===${colors.reset}\n`);

const status = checkSourcesNeedingUpdate();
const totalSources = Object.keys(VERIFIED_SOURCES).length;

console.log(`Total Sources: ${totalSources}\n`);

// Expired sources
if (status.expired.length > 0) {
  console.log(`${colors.red}❌ EXPIRED (${status.expired.length}):${colors.reset}`);
  status.expired.forEach((id) => {
    const source = VERIFIED_SOURCES[id];
    if (source && source.expirationDate) {
      const expDate = new Date(source.expirationDate);
      const daysAgo = Math.floor((Date.now() - expDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`  - ${id} (expired ${daysAgo} days ago)`);
    }
  });
  console.log();
} else {
  console.log(`${colors.green}✓ No expired sources${colors.reset}\n`);
}

// Expiring soon
if (status.expiringSoon.length > 0) {
  console.log(`${colors.yellow}⚠ EXPIRING SOON (${status.expiringSoon.length}):${colors.reset}`);
  status.expiringSoon.forEach((id) => {
    const source = VERIFIED_SOURCES[id];
    if (source && source.expirationDate) {
      const expDate = new Date(source.expirationDate);
      const daysUntil = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      console.log(`  - ${id} (${daysUntil} days until expiration)`);
    }
  });
  console.log();
} else {
  console.log(`${colors.green}✓ No sources expiring within 90 days${colors.reset}\n`);
}

// Needs review
if (status.needsReview.length > 0) {
  console.log(`${colors.yellow}⚠ NEEDS REVIEW (${status.needsReview.length}):${colors.reset}`);
  status.needsReview.forEach((id) => {
    const source = VERIFIED_SOURCES[id];
    console.log(`  - ${id} (status: ${source?.verificationStatus})`);
  });
  console.log();
} else {
  console.log(`${colors.green}✓ All sources verified${colors.reset}\n`);
}

// Summary
const issueCount = status.expired.length + status.expiringSoon.length + status.needsReview.length;
if (issueCount === 0) {
  console.log(`${colors.green}✓✓✓ All sources are up-to-date and verified!${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.yellow}⚠ ${issueCount} source(s) need attention${colors.reset}`);
  process.exit(1);
}

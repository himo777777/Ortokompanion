/**
 * Content Quality Analysis Script
 *
 * Run this script to analyze the current state of content in OrtoKompanion:
 * - Quality reports per domain
 * - Source expiration status
 * - Distribution analysis
 * - Recommendations for improvement
 *
 * Usage:
 * npx ts-node scripts/analyze-content-quality.ts
 */

import {
  generateQualityReport,
  checkSourcesNeedingUpdate,
  suggestOptimalDistribution,
  validateQuestion,
} from '../lib/content-validation';

import {
  ALL_QUESTIONS,
  TRAUMA_QUESTIONS,
  HOEFT_QUESTIONS,
  FOT_FOTLED_QUESTIONS,
  HAND_HANDLED_QUESTIONS,
  KNA_QUESTIONS,
  AXEL_ARMBAGE_QUESTIONS,
  RYGG_QUESTIONS,
  SPORT_QUESTIONS,
  TUMOR_QUESTIONS,
} from '../data/questions';

import { Domain } from '../types/onboarding';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function printHeader(text: string) {
  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function printSection(text: string) {
  console.log(`\n${colors.blue}${text}${colors.reset}`);
  console.log(`${colors.blue}${'-'.repeat(text.length)}${colors.reset}`);
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓${colors.reset} ${text}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠${colors.reset} ${text}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗${colors.reset} ${text}`);
}

function printInfo(text: string) {
  console.log(`${colors.white}  ${text}${colors.reset}`);
}

// Main analysis function
function analyzeContent() {
  printHeader('ORTOKOMPANION - CONTENT QUALITY ANALYSIS');

  // 1. Overall Statistics
  printSection('1. Overall Statistics');
  printInfo(`Total Questions: ${ALL_QUESTIONS.length}`);

  const domainMap = {
    trauma: TRAUMA_QUESTIONS,
    höft: HOEFT_QUESTIONS,
    'fot-fotled': FOT_FOTLED_QUESTIONS,
    'hand-handled': HAND_HANDLED_QUESTIONS,
    knä: KNA_QUESTIONS,
    'axel-armbåge': AXEL_ARMBAGE_QUESTIONS,
    rygg: RYGG_QUESTIONS,
    sport: SPORT_QUESTIONS,
    tumör: TUMOR_QUESTIONS,
  };

  console.log('\nQuestions per Domain:');
  Object.entries(domainMap).forEach(([domain, questions]) => {
    const count = questions.length;
    const color = count >= 50 ? colors.green : count >= 30 ? colors.yellow : colors.red;
    console.log(
      `  ${domain.padEnd(15)} ${color}${count.toString().padStart(3)}${colors.reset} questions`
    );
  });

  // 2. Source Status
  printSection('2. Source Status');
  const sourceStatus = checkSourcesNeedingUpdate();

  if (sourceStatus.expired.length > 0) {
    printError(`${sourceStatus.expired.length} expired sources:`);
    sourceStatus.expired.forEach((id) => printInfo(`  - ${id}`));
  } else {
    printSuccess('No expired sources');
  }

  if (sourceStatus.expiringSoon.length > 0) {
    printWarning(`${sourceStatus.expiringSoon.length} sources expiring within 90 days:`);
    sourceStatus.expiringSoon.forEach((id) => printInfo(`  - ${id}`));
  } else {
    printSuccess('No sources expiring soon');
  }

  if (sourceStatus.needsReview.length > 0) {
    printWarning(`${sourceStatus.needsReview.length} sources need review:`);
    sourceStatus.needsReview.forEach((id) => printInfo(`  - ${id}`));
  }

  // 3. Quality Reports per Domain
  printSection('3. Domain Quality Reports');

  const allReports: Array<{
    domain: string;
    report: ReturnType<typeof generateQualityReport>;
  }> = [];

  Object.entries(domainMap).forEach(([domain, questions]) => {
    const report = generateQualityReport(questions, domain as Domain);
    allReports.push({ domain, report });

    console.log(`\n${colors.magenta}${domain.toUpperCase()}${colors.reset}`);

    // Quality Score
    const scoreColor =
      report.qualityScore >= 85
        ? colors.green
        : report.qualityScore >= 70
        ? colors.yellow
        : colors.red;
    console.log(
      `  Quality Score: ${scoreColor}${report.qualityScore}/100${colors.reset}`
    );

    // Stats
    printInfo(`Total Questions: ${report.totalQuestions}`);
    printInfo(
      `With TutorMode: ${report.questionsWithTutorMode}/${report.totalQuestions} (${Math.round((report.questionsWithTutorMode / report.totalQuestions) * 100)}%)`
    );
    printInfo(
      `With References: ${report.questionsWithReferences}/${report.totalQuestions} (${Math.round((report.questionsWithReferences / report.totalQuestions) * 100)}%)`
    );

    // Expired references
    if (report.expiredReferences.length > 0) {
      printError(`Expired References: ${report.expiredReferences.join(', ')}`);
    }

    // Missing references
    if (report.missingReferences.length > 0) {
      printError(`Missing References: ${report.missingReferences.join(', ')}`);
    }

    // Band distribution
    console.log('  Band Distribution:');
    Object.entries(report.bandDistribution).forEach(([band, count]) => {
      const percentage = ((count / report.totalQuestions) * 100).toFixed(1);
      console.log(`    ${band}: ${count.toString().padStart(2)} (${percentage}%)`);
    });

    // Level distribution
    console.log('  Level Distribution:');
    Object.entries(report.levelDistribution).forEach(([level, count]) => {
      const percentage = ((count / report.totalQuestions) * 100).toFixed(1);
      console.log(`    ${level.padEnd(10)}: ${count.toString().padStart(2)} (${percentage}%)`);
    });
  });

  // 4. Recommendations
  printSection('4. Recommendations');

  // Overall quality
  const avgQualityScore =
    allReports.reduce((sum, r) => sum + r.report.qualityScore, 0) / allReports.length;

  if (avgQualityScore >= 85) {
    printSuccess(`Overall quality is excellent (${avgQualityScore.toFixed(1)}/100)`);
  } else if (avgQualityScore >= 70) {
    printWarning(
      `Overall quality is good but could be improved (${avgQualityScore.toFixed(1)}/100)`
    );
  } else {
    printError(
      `Overall quality needs improvement (${avgQualityScore.toFixed(1)}/100)`
    );
  }

  // Domains needing expansion
  console.log('\n📈 Domains needing expansion (target: 50 questions):');
  allReports
    .filter((r) => r.report.totalQuestions < 50)
    .sort((a, b) => a.report.totalQuestions - b.report.totalQuestions)
    .forEach((r) => {
      const needed = 50 - r.report.totalQuestions;
      printWarning(`${r.domain}: needs ${needed} more questions`);

      // Show optimal distribution for target
      const optimal = suggestOptimalDistribution(50);
      const current = r.report.bandDistribution;

      console.log('    Suggested additions by band:');
      Object.entries(optimal.bands).forEach(([band, target]) => {
        const currentCount = current[band as keyof typeof current] || 0;
        const needed = Math.max(0, target - currentCount);
        if (needed > 0) {
          console.log(`      Band ${band}: +${needed} questions`);
        }
      });
    });

  // TutorMode coverage
  console.log('\n📚 TutorMode coverage:');
  allReports.forEach((r) => {
    const coverage = (r.report.questionsWithTutorMode / r.report.totalQuestions) * 100;
    if (coverage < 80) {
      const needed = Math.ceil((r.report.totalQuestions * 0.8) - r.report.questionsWithTutorMode);
      printWarning(
        `${r.domain}: ${coverage.toFixed(1)}% coverage, add TutorMode to ${needed} more questions`
      );
    } else {
      printSuccess(`${r.domain}: ${coverage.toFixed(1)}% coverage`);
    }
  });

  // 5. Validation Summary
  printSection('5. Validation Summary');

  let totalErrors = 0;
  let totalWarnings = 0;

  ALL_QUESTIONS.forEach((q) => {
    const result = validateQuestion(q);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  });

  if (totalErrors === 0) {
    printSuccess('All questions pass validation');
  } else {
    printError(`${totalErrors} validation errors found`);
    printInfo('Run validateQuestion() on individual questions for details');
  }

  if (totalWarnings > 0) {
    printWarning(`${totalWarnings} validation warnings`);
  }

  // 6. Action Items
  printSection('6. Action Items');

  const actionItems: string[] = [];

  // Expired sources
  if (sourceStatus.expired.length > 0) {
    actionItems.push(`Update ${sourceStatus.expired.length} expired sources`);
  }

  // Low quality domains
  allReports.forEach((r) => {
    if (r.report.qualityScore < 70) {
      actionItems.push(`Improve quality of ${r.domain} domain (score: ${r.report.qualityScore})`);
    }
  });

  // Small domains
  allReports.forEach((r) => {
    if (r.report.totalQuestions < 30) {
      actionItems.push(`Expand ${r.domain} to at least 30 questions (current: ${r.report.totalQuestions})`);
    }
  });

  // TutorMode gaps
  allReports.forEach((r) => {
    const coverage = (r.report.questionsWithTutorMode / r.report.totalQuestions) * 100;
    if (coverage < 80) {
      const needed = Math.ceil((r.report.totalQuestions * 0.8) - r.report.questionsWithTutorMode);
      actionItems.push(`Add TutorMode to ${needed} questions in ${r.domain}`);
    }
  });

  if (actionItems.length === 0) {
    printSuccess('No action items - excellent work!');
  } else {
    console.log('\nPriority tasks:');
    actionItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item}`);
    });
  }

  printHeader('END OF REPORT');
}

// Run analysis
try {
  analyzeContent();
} catch (error) {
  console.error('Error running analysis:', error);
  process.exit(1);
}

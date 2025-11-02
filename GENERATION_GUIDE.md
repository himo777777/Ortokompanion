# AI Content Generation Guide

Complete guide to generating medical questions using the OrtoKompanion AI generation system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [System Architecture](#system-architecture)
4. [Generation Workflow](#generation-workflow)
5. [CLI Commands](#cli-commands)
6. [Quality Control](#quality-control)
7. [Cost & Time Estimates](#cost--time-estimates)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The OrtoKompanion AI generation system creates high-quality Swedish medical questions with TutorMode content using OpenAI's GPT-4o-mini model.

### Features

- ✅ **Automated question generation** with complete TutorMode
- ✅ **Evidence-based content** using verified sources only
- ✅ **Socialstyrelsen alignment** - maps to competency goals
- ✅ **Multi-stage validation** - automated + expert review
- ✅ **Cost-effective** - ~$0.001 per question
- ✅ **Fast** - 2-3 seconds per question

### What Gets Generated

Each question includes:
- Clinical scenario (realistic Swedish context)
- 4 options (1 correct + 3 plausible distractors)
- Comprehensive explanation with source citations
- 3 progressive hints
- 3-4 common mistakes
- 3-5 teaching points
- Mnemonic/trick (if applicable)

---

## Quick Start

### Prerequisites

1. **OpenAI API Key** - Set in `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-your_api_key_here
   ```

2. **Dependencies installed**:
   ```bash
   npm install
   ```

### Generate Your First Questions

```bash
# Generate 10 sport questions for ST2, Band B
npm run generate-questions -- --domain=sport --level=st2 --band=B --count=10

# Output: generated/sport-st2-questions.json
```

### Add TutorMode to Existing Questions

```bash
# Add TutorMode to all questions that don't have it
npm run add-tutormode -- --missing-only

# Output: generated/tutormode-additions.json
```

---

## System Architecture

### File Structure

```
/workspaces/Ortokompanion/
├── lib/
│   ├── generation-prompts.ts         # Prompt templates
│   ├── ai-question-generator.ts      # Question generation service
│   └── tutormode-generator.ts        # TutorMode generation service
│
├── scripts/
│   ├── generate-questions.ts         # CLI for question generation
│   └── add-tutormode.ts              # CLI for TutorMode addition
│
├── generated/                        # Output directory
│   ├── sport-st2-questions.json
│   ├── tutormode-additions.json
│   └── validation-reports/
│
└── data/
    ├── verified-sources.ts           # Evidence-based sources
    └── socialstyrelsen-goals.ts      # Competency goals
```

### Core Components

**1. Prompt Templates** (`lib/generation-prompts.ts`)
- Question generation prompts
- TutorMode generation prompts
- Band descriptions
- Domain-specific aspects

**2. Question Generator** (`lib/ai-question-generator.ts`)
- `generateQuestionBatch()` - Generate single batch
- `generateWithBandDistribution()` - Generate with band mix
- `validateQuestionBatch()` - Quality validation
- `estimateGenerationCost()` - Cost estimation

**3. TutorMode Generator** (`lib/tutormode-generator.ts`)
- `generateTutorMode()` - Generate for single question
- `generateTutorModeBatch()` - Generate for multiple
- `validateTutorMode()` - Quality validation

---

## Generation Workflow

### Phase 1: Generation

1. **Select parameters**:
   - Domain (trauma, höft, sport, etc.)
   - Level (student, at, st1-st5, specialist, etc.)
   - Band (A=easy, E=expert)
   - Count (number of questions)

2. **Run generation**:
   ```bash
   npm run generate-questions -- --domain=sport --level=st3 --count=10
   ```

3. **AI generates**:
   - Fetches relevant sources
   - Fetches Socialstyrelsen goals
   - Creates structured prompt
   - Calls OpenAI API
   - Validates output

4. **Output files created**:
   - `generated/sport-st3-questions.json` - Generated questions
   - `generated/sport-st3-questions-validation.json` - Quality report

### Phase 2: Validation

Automated validation checks:
- ✅ All required fields present
- ✅ 4 options with 1 correct answer
- ✅ Correct answer matches one option exactly
- ✅ At least 2 source references
- ✅ At least 1 related goal
- ✅ TutorMode has 3 hints, 3+ mistakes, 3+ teaching points
- ✅ No duplicate questions

### Phase 3: Medical Review

**CRITICAL**: All generated content requires expert review.

Review checklist:
- [ ] Clinical scenario is realistic
- [ ] Correct answer aligns with current guidelines
- [ ] Wrong answers are plausible but clearly incorrect
- [ ] Explanation cites accurate sources
- [ ] Swedish terminology is correct
- [ ] No medical errors
- [ ] TutorMode hints are pedagogically sound

Mark questions as:
- `approved` - Ready for integration
- `needs-revision` - Requires edits
- `rejected` - Not suitable

### Phase 4: Integration

Once approved:

1. **Import to questions.ts**:
   ```typescript
   // Add to appropriate domain array
   export const SPORT_QUESTIONS: MCQQuestion[] = [
     // ... existing questions
     // ... new approved questions
   ];
   ```

2. **Update ALL_QUESTIONS**:
   ```typescript
   export const ALL_QUESTIONS: MCQQuestion[] = [
     ...TRAUMA_QUESTIONS,
     ...SPORT_QUESTIONS,  // Now includes new questions
     // ...
   ];
   ```

3. **Run validation**:
   ```bash
   npm run analyze-content
   npm run build
   ```

---

## CLI Commands

### Generate Questions

**Basic usage**:
```bash
npm run generate-questions -- [options]
```

**Options**:
- `--domain=<domain>` - Domain (trauma, höft, sport, etc.) *required*
- `--level=<level>` - Education level (st1, st2, etc.) *required*
- `--band=<band>` - Difficulty band (A, B, C, D, E) *optional*
- `--count=<number>` - Number of questions [default: 10]
- `--startId=<number>` - Starting ID [default: 1]
- `--output=<path>` - Output file path
- `--batch=<name>` - Use predefined batch config
- `--config=<path>` - Use config file
- `--dry-run` - Estimate cost only

**Examples**:

```bash
# Generate 10 sport questions for ST2, Band B
npm run generate-questions -- --domain=sport --level=st2 --band=B --count=10

# Generate 20 questions with mixed bands
npm run generate-questions -- --domain=höft --level=st5 --count=20

# Use predefined batch
npm run generate-questions -- --batch=st5-hoeft

# Dry run to estimate cost
npm run generate-questions -- --domain=tumör --level=st3 --count=30 --dry-run
```

### Add TutorMode

**Basic usage**:
```bash
npm run add-tutormode -- [options]
```

**Options**:
- `--missing-only` - Generate for all questions without TutorMode [default]
- `--question=<id>` - Generate for specific question
- `--level=<level>` - Filter by education level
- `--count=<number>` - Limit number to process
- `--output=<path>` - Output file path
- `--dry-run` - Estimate time/cost only

**Examples**:

```bash
# Generate for all missing TutorMode (108 questions)
npm run add-tutormode -- --missing-only

# Generate for specific question
npm run add-tutormode -- --question=höft-045

# Generate for 10 ST2 questions
npm run add-tutormode -- --level=st2 --count=10

# Dry run to estimate
npm run add-tutormode -- --dry-run
```

---

## Quality Control

### Automated Validation

Every generated question is automatically validated:

```typescript
{
  valid: true,
  errors: [],
  warnings: [
    "Should have at least 1 related goal"
  ]
}
```

**Error conditions** (must fix):
- Missing required fields
- Incorrect number of options
- Correct answer doesn't match any option
- Missing or invalid TutorMode structure

**Warning conditions** (should review):
- Very short question/explanation
- Few tags (< 3)
- No related goals
- Question-style hints (should be statements)

### Manual Review

Expert reviewers should check:

**Medical accuracy**:
- Current Swedish/international guidelines
- Correct source citations
- No outdated information

**Swedish language**:
- Correct medical terminology
- No "Benglish" (English words in Swedish)
- Proper grammar and spelling

**Pedagogical quality**:
- Hints are progressive and helpful
- Common mistakes are realistic
- Teaching points are clinically relevant
- Mnemonics aid memory (if present)

### Quality Metrics

Target metrics:
- **Validity rate**: >95% pass automated validation
- **Approval rate**: >80% approved after review
- **Revision rate**: <15% need minor edits
- **Rejection rate**: <5% rejected

---

## Cost & Time Estimates

### Pricing (OpenAI gpt-4o-mini)

- **Input**: $0.150 per 1M tokens
- **Output**: $0.600 per 1M tokens

### Per Question Costs

| Type | Input Tokens | Output Tokens | Cost |
|------|--------------|---------------|------|
| Full question | ~2,000 | ~1,000 | $0.0009 |
| TutorMode only | ~600 | ~400 | $0.0003 |

### Batch Estimates

| Task | Questions | Time | Cost |
|------|-----------|------|------|
| Sport domain (30q) | 30 | 2 min | $0.027 |
| ST5 level (22q) | 22 | 90 sec | $0.020 |
| TutorMode (108q) | 108 | 9 min | $0.097 |
| **All gaps (296 items)** | **296** | **~20 min** | **$0.27** |

### Timeline

**AI Generation**: ~16 minutes for all 296 items

**Expert Review**: ~25 hours
- 5 minutes per question
- Review medical accuracy
- Check Swedish terminology
- Validate pedagogical quality

**Integration**: ~8 hours
- Import approved questions
- Update question arrays
- Run validation tests
- Fix any issues

**Total**: 5-6 work days (with dedicated reviewer)

---

## Troubleshooting

### Common Issues

**1. "OpenAI API key not found"**

```bash
# Add to .env.local
OPENAI_API_KEY=sk-your_api_key_here
```

**2. "Generation failed: Rate limit exceeded"**

- Wait 60 seconds and retry
- System has built-in rate limiting (2 sec between requests)
- Consider reducing batch size

**3. "Validation errors: Correct answer doesn't match any option"**

- AI occasionally generates mismatched answers
- Mark for regeneration
- Usually happens in <5% of cases

**4. "Too many warnings about question-style hints"**

- TutorMode validator flags hints ending with "?"
- Review and convert to statements
- Example fix:
  - ❌ "Vad säger ATLS om prioritering?"
  - ✅ "ATLS prioriterar alltid Airway före Breathing"

**5. "Build fails after integration"**

```bash
# Run validation first
npm run analyze-content

# Check TypeScript errors
npm run build
```

### Debug Tips

**Enable detailed logging**:
```bash
# In .env.local
ENABLE_DETAILED_LOGS=true
```

**Check generated files**:
```bash
# View validation report
cat generated/sport-st2-questions-validation.json

# Count valid questions
jq '.validCount' generated/sport-st2-questions-validation.json
```

**Test single question generation**:
```bash
# Generate just 1 question to test
npm run generate-questions -- --domain=sport --level=st2 --count=1
```

---

## Appendices

### A. Available Domains

- `trauma` - Trauma ortopedi
- `höft` - Höftkirurgi
- `fot-fotled` - Fot- och fotledkirurgi
- `hand-handled` - Hand- och handledskirurgi
- `knä` - Knäkirurgi
- `axel-armbåge` - Axel- och armbågskirurgi
- `rygg` - Ryggradskirurgi
- `sport` - Sportortopedi
- `tumör` - Tumörortopedi

### B. Available Levels

- `student` - Läkarstudent
- `at` - AT-läkare
- `st1` - ST-läkare år 1 (Ortopedi)
- `st2` - ST-läkare år 2 (Ortopedi)
- `st3` - ST-läkare år 3 (Ortopedi)
- `st4` - ST-läkare år 4 (Ortopedi)
- `st5` - ST-läkare år 5 (Ortopedi)
- `st-allmänmedicin` - ST Allmänmedicin (ortho placement)
- `st-akutsjukvård` - ST Akutsjukvård (ortho placement)
- `specialist-ortopedi` - Specialist Ortopedi
- `specialist-allmänmedicin` - Specialist Allmänmedicin
- `specialist-akutsjukvård` - Specialist Akutsjukvård

### C. Difficulty Bands

| Band | Level | % Distribution | Description |
|------|-------|----------------|-------------|
| A | Foundation | 25% | Basic facts, anatomy, classifications |
| B | Core | 30% | Clinical application, diagnosis |
| C | Problem-solving | 25% | Complex cases, differential diagnosis |
| D | Advanced | 15% | Complications, revisions |
| E | Expert | 5% | Rare conditions, subspecialty |

### D. Predefined Batches

Run with: `npm run generate-questions -- --batch=<name>`

- `st5-hoeft` - 8 questions, ST5 höft (Bands C, D, E)
- `st5-kna` - 7 questions, ST5 knä (Bands C, D, E)
- `st5-trauma` - 7 questions, ST5 trauma (Bands C, D, E)
- `sport-st2` - 10 questions, ST2 sport (Bands A, B, C)
- `sport-st3` - 10 questions, ST3 sport (Bands B, C, D)
- `sport-st4` - 10 questions, ST4 sport (Bands C, D, E)
- `tumor-st2` - 10 questions, ST2 tumör (Bands A, B, C)
- `tumor-st3` - 10 questions, ST3 tumör (Bands B, C, D)
- `tumor-st4` - 10 questions, ST4 tumör (Bands C, D, E)

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review generated validation reports
- Check AI service logs in dev console
- Verify OpenAI API key is valid

---

**Version**: 1.0.0
**Last Updated**: 2025-11-02
**System**: OrtoKompanion AI Generation v1.0

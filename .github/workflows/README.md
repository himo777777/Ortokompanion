# GitHub Actions Workflows

Detta projekt använder GitHub Actions för automatisk CI/CD.

## Workflows

### 1. CI (ci.yml)
**Körs vid:** Push till main/master/claude/* branches, och pull requests

**Jobb:**
- **Build and Test** - Bygger projektet på Node.js 18 och 20
  - Installerar dependencies
  - Kör linter (`npm run lint`)
  - Bygger projektet (`npm run build`)
  - Verifierar att build lyckades

- **TypeScript Type Check** - Kontrollerar TypeScript-typer
  - Kör `tsc --noEmit` för att hitta type errors

- **Bundle Size** - Analyserar bundle-storlek
  - Visar storlek på .next/static
  - Listar de 10 största chunks

### 2. PR Comment (pr-comment.yml)
**Körs vid:** När PRs öppnas eller uppdateras

**Jobb:**
- Kommenterar på PR:n med build-status och output
- Ger snabb feedback direkt i PR:n

### 3. Dependency Review (dependency-review.yml)
**Körs vid:** Pull requests till main/master

**Jobb:**
- **Dependency Review** - Scannar nya dependencies för sårbarheter
  - Failar på moderate+ severity
  - Kommenterar i PR:n

- **NPM Security Audit** - Kör `npm audit`
  - Visar säkerhetsproblem i dependencies
  - Föreslår fixes

### 4. CodeQL Security Scan (codeql.yml)
**Körs vid:**
- Push till main/master
- Pull requests
- Schemalagt varje måndag kl 06:00 UTC

**Jobb:**
- Scannar kod för säkerhetsproblem
- Hittar vanliga sårbarheter (OWASP Top 10, etc.)
- Rapporterar i GitHub Security tab

## Status Badges

Lägg till dessa i README.md:

```markdown
![CI](https://github.com/himo777777/Ortokompanion/workflows/CI/badge.svg)
![CodeQL](https://github.com/himo777777/Ortokompanion/workflows/CodeQL%20Security%20Scan/badge.svg)
```

## Lokal utveckling

Testa samma checks lokalt innan du pushar:

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build
```

## Troubleshooting

### Build failar i CI men inte lokalt
- Rensa cache: `rm -rf .next node_modules && npm install`
- Kontrollera Node.js version: `node --version` (ska vara 18+)

### TypeScript errors i CI
- Kör `npx tsc --noEmit` lokalt för att se samma errors
- Fixa alla type errors innan push

### Dependency vulnerabilities
- Kör `npm audit` lokalt
- Fixa med `npm audit fix` eller uppdatera manuellt

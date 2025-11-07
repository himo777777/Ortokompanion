#!/bin/bash
###############################################################################
# Ortokompanion Question Generation - START SCRIPT
# Genererar 50 frågor med svenska källor prioriterade
###############################################################################

set -e  # Exit on error

echo "🚀 Ortokompanion - Generering av 50 Frågor med Svenska Källor"
echo "================================================================"
echo ""

# Färger för output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kontrollera att vi är i rätt directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Fel: Måste köras från rot-directory av projektet${NC}"
    exit 1
fi

# Kontrollera att OpenAI API key finns
if ! grep -q "OPENAI_API_KEY" .env.local 2>/dev/null; then
    echo -e "${RED}❌ Fel: OPENAI_API_KEY saknas i .env.local${NC}"
    echo "Lägg till din OpenAI API key i .env.local:"
    echo "OPENAI_API_KEY=sk-..."
    exit 1
fi

echo -e "${GREEN}✅ OpenAI API key hittad${NC}"
echo ""

# Skapa generated directory om den inte finns
mkdir -p generated

# Dry run först för att estimera kostnad
echo -e "${BLUE}💰 Estimerar kostnad...${NC}"
npm run generate-questions -- --config=config/pilot-swedish-sources.json --dry-run 2>/dev/null || true
echo ""

# Fråga användaren om bekräftelse
echo -e "${YELLOW}Vill du fortsätta med generering av 50 frågor? (y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Avbruten av användare"
    exit 0
fi

echo ""
echo -e "${BLUE}📊 Startar generering av 50 frågor i 5 batches...${NC}"
echo ""

# Tidsstämpel för start
START_TIME=$(date +%s)

# Batch 1: Trauma Band A (10 frågor)
echo -e "${BLUE}[1/5] Genererar Trauma Band A (10 frågor)...${NC}"
npm run generate-questions -- \
    --domain=trauma \
    --level=student \
    --band=A \
    --count=10 \
    --output=generated/batch1-trauma-band-a.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Batch 1 klar!${NC}"
else
    echo -e "${RED}❌ Batch 1 misslyckades${NC}"
    exit 1
fi
echo ""

# Vänta 2 sekunder mellan batches för att inte överbelasta API
sleep 2

# Batch 2: Tumör Band A (10 frågor)
echo -e "${BLUE}[2/5] Genererar Tumör Band A (10 frågor)...${NC}"
npm run generate-questions -- \
    --domain=tumör \
    --level=student \
    --band=A \
    --count=10 \
    --output=generated/batch2-tumor-band-a.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Batch 2 klar!${NC}"
else
    echo -e "${RED}❌ Batch 2 misslyckades${NC}"
    exit 1
fi
echo ""

sleep 2

# Batch 3: Sport Band A (10 frågor)
echo -e "${BLUE}[3/5] Genererar Sport Band A (10 frågor)...${NC}"
npm run generate-questions -- \
    --domain=sport \
    --level=at \
    --band=A \
    --count=10 \
    --output=generated/batch3-sport-band-a.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Batch 3 klar!${NC}"
else
    echo -e "${RED}❌ Batch 3 misslyckades${NC}"
    exit 1
fi
echo ""

sleep 2

# Batch 4: Höft Band B (10 frågor)
echo -e "${BLUE}[4/5] Genererar Höft Band B (10 frågor)...${NC}"
npm run generate-questions -- \
    --domain=höft \
    --level=st1 \
    --band=B \
    --count=10 \
    --output=generated/batch4-hoeft-band-b.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Batch 4 klar!${NC}"
else
    echo -e "${RED}❌ Batch 4 misslyckades${NC}"
    exit 1
fi
echo ""

sleep 2

# Batch 5: Knä Band B (10 frågor)
echo -e "${BLUE}[5/5] Genererar Knä Band B (10 frågor)...${NC}"
npm run generate-questions -- \
    --domain=knä \
    --level=st1 \
    --band=B \
    --count=10 \
    --output=generated/batch5-kna-band-b.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Batch 5 klar!${NC}"
else
    echo -e "${RED}❌ Batch 5 misslyckades${NC}"
    exit 1
fi
echo ""

# Beräkna total tid
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Sammanfattning
echo ""
echo "================================================================"
echo -e "${GREEN}🎉 ALLA 50 FRÅGOR GENERERADE!${NC}"
echo "================================================================"
echo ""
echo "📁 Genererade filer:"
echo "   - generated/batch1-trauma-band-a.json"
echo "   - generated/batch2-tumor-band-a.json"
echo "   - generated/batch3-sport-band-a.json"
echo "   - generated/batch4-hoeft-band-b.json"
echo "   - generated/batch5-kna-band-b.json"
echo ""
echo "⏱️  Total tid: ${MINUTES}m ${SECONDS}s"
echo ""
echo -e "${YELLOW}📋 NÄSTA STEG:${NC}"
echo ""
echo "1. MEDICAL REVIEW (KRITISKT!):"
echo "   Granska alla frågor för medicinsk korrekthet"
echo "   Verifiera svenska källor och exakta data"
echo "   Använd checklista i SVENSKA_KALLOR_PRIORITET.md"
echo ""
echo "2. VALIDERING:"
echo "   Kör: npm run test:run"
echo "   Kontrollera att alla frågor följer schema"
echo ""
echo "3. INTEGRATION:"
echo "   Lägg godkända frågor i data/questions.ts"
echo "   Uppdatera ALL_QUESTIONS array"
echo "   Commit och push"
echo ""
echo -e "${GREEN}✅ Systemet är redo att generera fler frågor!${NC}"
echo ""

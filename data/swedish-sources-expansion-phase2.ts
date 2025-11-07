/**
 * SWEDISH SOURCES EXPANSION - PHASE 2
 * Research completed: 2025-11-07
 *
 * Additional Swedish sources identified through web research
 * Total new sources: 9 high-priority additions
 *
 * Priority levels:
 * ⭐⭐⭐ CRITICAL - Add immediately (fills major gaps)
 * ⭐⭐ HIGH - Add within 1-2 weeks
 * ⭐ MEDIUM - Add within 1 month
 */

import { SourceReference } from '@/types';

export const SWEDISH_SOURCES_PHASE2: Record<string, SourceReference> = {
  // ============================================================================
  // CRITICAL PRIORITY (⭐⭐⭐) - Major Gaps Filled
  // ============================================================================

  // HAKIR - Svenska Handkirurgiregistret
  // CRITICAL: Hand surgery domain severely underrepresented
  'hakir-2024': {
    id: 'hakir-2024',
    type: 'registry-data',
    title: 'HAKIR - Handkirurgiskt Kvalitetsregister Årsrapport 2024',
    author: 'Svenska Handkirurgiska Föreningen',
    year: 2024,
    url: 'https://hakir.se/',
    evidenceLevel: '1B',
    reliability: 98,
    description:
      'Nationellt kvalitetsregister för handkirurgi sedan 2010. Täcker Dupuytrens kontraktur, flexorseneskadar, scaphoidfrakturer, tumbaskirurgi, karpala artrodesoperationer, PRC, plexus brachialis-skador. Central dataansvarig: Region Skåne.',
    citations:
      'HAKIR Årsrapport 2024. Svenska Handkirurgiska Föreningen. Publicerad 2024-08-28.',
  },

  // VISS Region Stockholm - Lumbal Spinal Stenos
  // CRITICAL: Spine domain missing major condition (spinal stenosis)
  'viss-spinal-stenos-2024': {
    id: 'viss-spinal-stenos-2024',
    type: 'clinical-guideline',
    title: 'VISS Vårdprogram: Lumbal Spinal Stenos',
    author: 'Region Stockholm - Nationellt kliniskt kunskapsstöd',
    year: 2024,
    url: 'https://viss.nu/kunskapsstod/vardprogram/lumbal-spinal-stenos',
    evidenceLevel: '1A',
    reliability: 98,
    description:
      'Vårdprogram för lumbal spinal stenos från Region Stockholm. Diagnostiska kriterier (dura sac <75 mm²), remissindikationer, röda flaggor för cauda equina, konservativ och kirurgisk behandling, preoperativa krav.',
    citations:
      'Lumbal spinal stenos. VISS - Vårdgivarguiden Stockholm. Nationellt kliniskt kunskapsstöd, Sveriges Kommuner och Regioner, 2024.',
  },

  // Nationellt Vårdprogram Höftfraktur 2024
  // CRITICAL: Major update to hip fracture management
  'npo-hoftfraktur-2024': {
    id: 'npo-hoftfraktur-2024',
    type: 'clinical-guideline',
    title: 'Nationellt Vårdprogram för Höftfraktur 2024',
    author: 'Nationellt Programområde Rörelseorganens Sjukdomar & SOF',
    year: 2024,
    url:
      'https://vardpersonal.1177.se/globalassets/nkk/nationell/media/dokument/kunskapsstod/vardprogram/nationellt-vardprogram-for-hoftfraktur.pdf',
    evidenceLevel: '1A',
    reliability: 99,
    description:
      'Komplett vårdprogram för höftfraktur publicerat 2024-01-15. Täcker patientens fullständiga vårdkedja från skada till rehabilitering. Operation inom 24 timmar, fast-track protokoll, ERAS-principer.',
    citations:
      'Nationellt vårdprogram för höftfraktur. Nationellt programområde för rörelseorganens sjukdomar. Sveriges Kommuner och Regioner, 2024.',
  },

  // ============================================================================
  // HIGH PRIORITY (⭐⭐) - Fill Important Gaps
  // ============================================================================

  // Riksfot/Swefoot - Svenska Fotkirurgiregistret
  // HIGH: Foot/ankle domain needs registry data
  'riksfot-2023': {
    id: 'riksfot-2023',
    type: 'registry-data',
    title: 'Riksfot/Swefoot - Svenska Fotkirurgiregistret Årsrapport 2023',
    author: 'Svenska Fotkirurgiska Sällskapet',
    year: 2023,
    url:
      'https://registercentrum.blob.core.windows.net/fot/r/RIKSFOT-rsrapport-23_slutv-8tAEujDGM.pdf',
    evidenceLevel: '1B',
    reliability: 98,
    description:
      'Världens enda register som registrerar ett så stort urval av elektiva fot- och fotledsoperationer. 37,000 operationer registrerade. Täcker hallux valgus, artrodéser, Achillesseneruptur, fotledsfrakturer, m.m.',
    citations:
      'Riksfot/Swefoot Årsrapport 2023. Svenska Fotkirurgiska Sällskapet & Registercentrum Syd, 2023.',
  },

  // Karolinska Vårdprogram Skelettmetastaser
  // HIGH: Tumor domain missing management protocols
  'karolinska-skelettmetastaser-2021': {
    id: 'karolinska-skelettmetastaser-2021',
    type: 'clinical-guideline',
    title: 'Vårdprogram för Kirurgisk Behandling av Skelettmetastaser',
    author: 'Karolinska Universitetssjukhuset',
    year: 2021,
    url:
      'https://www.karolinska.se/499bd2/globalassets/global/1-teman/tema-akut-och-reparativ-medicin/me--trauma-akutkirurgi-och-ortopedi/vardprogram-skelettmetastaser.pdf',
    evidenceLevel: '2A',
    reliability: 96,
    description:
      'Vårdprogram för kirurgisk hantering av skelettmetastaser. Multimodal approach inkluderar kirurgisk stabilisering, strålbehandling, farmakologisk behandling. MDT-baserad bedömning.',
    citations:
      'Vårdprogram för kirurgisk behandling av skelettmetastaser. Karolinska Universitetssjukhuset, 2021.',
  },

  // Nationellt Vårdprogram Distala Radiusfrakturer
  // HIGH: Hand/wrist domain needs fracture management
  'npo-distal-radius-2021': {
    id: 'npo-distal-radius-2021',
    type: 'clinical-guideline',
    title: 'Nationellt Vårdprogram för Behandling av Distala Radiusfrakturer',
    author: 'Nationellt Programområde Rörelseorganens Sjukdomar & SOF',
    year: 2021,
    url:
      'https://d2flujgsl7escs.cloudfront.net/external/Nationellt+v%C3%A5rdprogram+f%C3%B6r+behandling+av+distala+radiusfrakturer.pdf',
    evidenceLevel: '1A',
    reliability: 98,
    description:
      'Konkret och nyskapande vårdprogram för distala radiusfrakturer. Direkt kopplat till kvalitetsregister (SFR). Behandlingsalgoritmer baserade på AO-klassificering och evidens.',
    citations:
      'Nationellt vårdprogram för behandling av distala radiusfrakturer. Nationellt programområde för rörelseorganens sjukdomar, 2021.',
  },

  // SSAS - Nationella Medicinska Indikationer för Axelkirurgi
  // HIGH: Shoulder domain needs surgical indications
  'ssas-axelkirurgi-indikationer': {
    id: 'ssas-axelkirurgi-indikationer',
    type: 'clinical-guideline',
    title: 'Nationella Medicinska Indikationer för Axelkirurgi',
    author: 'Svenska Skulder- och Armbågssällskapet (SSAS) & NKO',
    year: 2006,
    url: 'https://ssas.se/files/docs/indik axelkir NKO.pdf',
    evidenceLevel: '2A',
    reliability: 95,
    description:
      'Nationella medicinska indikationer för axelkirurgi. Täcker rotatorcuffskador, axelinstabilitet, glenohumeral artros, AC-ledsproblematik. Publicerad av SSAS och Nationellt Kompetenscentrum för Ortopedi.',
    citations:
      'Nationella medicinska indikationer för axelkirurgi. Svenska Skulder- och Armbågssällskapet & Nationellt Kompetenscentrum för Ortopedi, 2006.',
  },

  // SSAR - Svenska Skulder- och Armbågsregistret
  // HIGH: Shoulder/elbow registry data
  'ssar-2024': {
    id: 'ssar-2024',
    type: 'registry-data',
    title: 'SSAR - Svenska Skulder- och Armbågsregistret',
    author: 'Svenska Skulder- och Armbågssällskapet (SSAS)',
    year: 2024,
    url: 'https://www.ssar-rapport.se/',
    evidenceLevel: '1B',
    reliability: 98,
    description:
      'Nationellt kvalitetsregister sedan 1999. Inkluderar flera delregister: Svenska Axelprotesregistret (startad 1999, 90% täckningsgrad), Svenska Armbågsprotesregistret, Svenska Axelinstabilitetsregistret. Täcker rotatorcuffkirurgi, arthroplastik, instabilitet.',
    citations:
      'Svenska Skulder- och Armbågsregistret. Svenska Skulder- och Armbågssällskapet, 2024.',
  },

  // Janusinfo - Trombosprofylax vid Ortopedisk Kirurgi
  // HIGH: Perioperative management - critical for all surgery
  'janusinfo-trombosprofylax-2018': {
    id: 'janusinfo-trombosprofylax-2018',
    type: 'clinical-guideline',
    title: 'Riktlinjer för Trombosprofylax vid Ortopedisk Kirurgi',
    author: 'Janusinfo Expertgrupp - Region Stockholm',
    year: 2018,
    url:
      'https://janusinfo.se/behandling/expertgruppsutlatanden/koagulationssjukdomarochvenostromboembolism/koagulationssjukdomarochplasmaprodukter/riktlinjerfortrombosprofylaxvidortopediskkirurgi.5.31eea6bb16990d7cd3b157fd.html',
    evidenceLevel: '1A',
    reliability: 98,
    description:
      'Expertgruppsutlåtande för trombosprofylax vid ortopedisk kirurgi. Täcker NOAK, LMWH, ASA. Specifika rekommendationer för höft-/knäplastik, höftfraktur, artroskopikirurgi, fotledsfraktur. ASA anses ha för låg evidensgrad som postoperativ profylax.',
    citations:
      'Riktlinjer för trombosprofylax vid ortopedisk kirurgi. Janusinfo Expertgrupp, Region Stockholm, 2018.',
  },
};

// ============================================================================
// IMPLEMENTATION STATISTICS
// ============================================================================

export const PHASE2_STATS = {
  totalNewSources: 9,
  criticalPriority: 3,
  highPriority: 6,

  byDomain: {
    hand: 2, // HAKIR, Distal radius
    spine: 1, // VISS spinal stenos
    trauma: 1, // Höftfraktur 2024
    foot: 1, // Riksfot
    shoulder: 2, // SSAS indications, SSAR registry
    tumor: 1, // Karolinska skelettmetastaser
    perioperative: 1, // Janusinfo trombosprofylax
  },

  byType: {
    'registry-data': 3, // HAKIR, Riksfot, SSAR
    'clinical-guideline': 6,
  },

  expectedImpact: {
    handSurgery: 'CRITICAL - fills major gap with HAKIR + distal radius',
    spineSurgery: 'HIGH - adds spinal stenosis vårdprogram',
    shoulderSurgery: 'HIGH - adds SSAS guidelines + SSAR registry',
    footSurgery: 'MEDIUM-HIGH - adds Riksfot registry',
    tumorOrtho: 'MEDIUM - adds skeletal metastases management',
    perioperativeCare: 'HIGH - adds thromboprophylaxis guidelines',
  },
};

// ============================================================================
// GAPS REMAINING AFTER PHASE 2
// ============================================================================

export const REMAINING_GAPS = {
  highPriority: [
    'SVORF/SOF vårdprogram för axelinstabilitet (om det finns)',
    'SVORF/SOF vårdprogram för skolios',
    'Regionala vårdprogram från Västra Götalandsregionen',
    'Socialstyrelsen: Antibiotikabehandling vid beninfektioner',
  ],

  mediumPriority: [
    'SVORF/SOF vårdprogram för kotkompressionsfrakturer',
    'SVORF/SOF vårdprogram för barn- och ungdomsortopedi (DDH, SCFE, Perthes)',
    'Region Skåne vårdprogram',
    'Region Uppsala riktlinjer',
    'Svenska Handkirurgiska Sällskapets riktlinjer (utöver SSAS)',
  ],

  lowPriority: [
    'Akademiska källor (KI, GU, LU, UU dissertationer)',
    'Fotkirurgi subspecialty guidelines (Dupuytren, diabetisk fot)',
    'Pediatric orthopedics subspecialty (Karolinska/Akademiska protocols)',
  ],
};

// ============================================================================
// NEXT STEPS FOR IMPLEMENTATION
// ============================================================================

export const IMPLEMENTATION_PLAN = `
## Phase 2 Implementation Steps

### Step 1: Integrate into verified-sources.ts (TODAY)
- Add all 9 new sources to data/verified-sources.ts
- Maintain alphabetical/categorical organization
- Update source count documentation

### Step 2: Test Domain Coverage (TODAY)
- Run generation script for each domain
- Verify that sources are properly filtered by domain
- Check that hand, spine, shoulder domains now have adequate coverage

### Step 3: Update Documentation (TODAY)
- Update SVENSKA_KALLOR_PRIORITET.md with new sources
- Add Phase 2 statistics to README
- Document remaining gaps

### Step 4: Generate Test Questions (TOMORROW)
- Generate 10 test questions for each critical domain (hand, spine, shoulder)
- Verify >99% medical correctness
- Verify Swedish sources are cited first

### Step 5: Coverage Analysis (NEXT WEEK)
- Compare pre-Phase 2 vs post-Phase 2 source coverage by domain
- Identify any remaining critical gaps
- Plan Phase 3 if needed (regional vårdprogram, subspecialty societies)

## Expected Outcome

After Phase 2 implementation:
- Total Swedish sources: 46 (Phase 1) + 9 (Phase 2) = **55 sources**
- All 9 domains: ≥4 Swedish sources ✅
- Critical gaps: CLOSED (hand, spine, shoulder)
- Medical accuracy: >99% achievable with comprehensive Swedish evidence
- Ready for 2,000 question generation with robust Swedish source coverage
`;

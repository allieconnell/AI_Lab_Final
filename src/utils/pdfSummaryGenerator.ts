import { jsPDF } from 'jspdf';
import { DEFAULT_PRIORITY_RANKING, DMV_AREA_OPTIONS, RANKING_ITEMS } from '../data/dmvData';
import {
  AssistanceProgram,
  BuyerPersonaProfile,
  CreditBand,
  HomebuyingReadinessAssessment,
  HomeCandidate,
  IncomeBand,
  RankItemId,
  SavingsBand,
  SurveyAnswers,
} from '../types/homebuying';
import {
  calculateMonthlyPayment,
  estimatePriceRangeFromSurvey,
  formatCurrency,
  PortalSearchLinks,
} from './homebuyingEngine';

interface PdfSummaryPayload {
  answers: SurveyAnswers;
  buyerProfile: BuyerPersonaProfile;
  readiness: HomebuyingReadinessAssessment;
  portalLinks: PortalSearchLinks;
  matchedPrograms: AssistanceProgram[];
  likedHomes: HomeCandidate[];
  activeFilters: {
    areaLabel: string;
    maxPrice: number;
    minBeds: number;
    maxHoa: number | null;
    homeTypes: string[];
    activeKeywords: string[];
  };
}

// Luxury Winter RGB palette
const COLORS = {
  indigo: [58, 43, 109] as [number, number, number], // #3A2B6D
  berry: [206, 76, 109] as [number, number, number], // #CE4C6D
  berryDark: [176, 54, 86] as [number, number, number], // #B03656
  jade: [25, 111, 101] as [number, number, number], // #196F65
  cerulean: [33, 125, 142] as [number, number, number], // #217D8E
  champagneBg: [251, 243, 234] as [number, number, number], // soft #EEBC8E tint
  champagneLine: [216, 182, 146] as [number, number, number],
  ink: [27, 22, 51] as [number, number, number], // #1B1633
  muted: [62, 55, 87] as [number, number, number], // #3E3757
  hairline: [207, 201, 219] as [number, number, number], // #CFC9DB
  surface: [251, 248, 244] as [number, number, number], // #FBF8F4
  white: [255, 255, 255] as [number, number, number],
};

function cleanPdfText(input: string): string {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, ' - ')
    .replace(/\u00B7/g, '|')
    .replace(/\u2022/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\n]/g, '');
}

function formatIncomeBand(band: IncomeBand | null): string {
  switch (band) {
    case 'under_95k':
      return 'Under $95,000';
    case '95k_135k':
      return '$95,000 - $135,000';
    case '135k_185k':
      return '$135,000 - $185,000';
    case '185k_250k':
      return '$185,000 - $250,000';
    case 'over_250k':
      return 'Over $250,000';
    default:
      return 'Not specified';
  }
}

function formatSavingsBand(band: SavingsBand | null): string {
  switch (band) {
    case 'under_15k':
      return 'Under $15,000';
    case '15k_35k':
      return '$15,000 - $35,000';
    case '35k_70k':
      return '$35,000 - $70,000';
    case '70k_120k':
      return '$70,000 - $120,000';
    case 'over_120k':
      return 'Over $120,000';
    default:
      return 'Not specified';
  }
}

function formatCreditBand(band: CreditBand | null): string {
  switch (band) {
    case '580_639':
      return '580 - 639';
    case '640_679':
      return '640 - 679';
    case '680_739':
      return '680 - 739';
    case '740_plus':
      return '740 or higher';
    default:
      return 'Not specified';
  }
}

export function downloadBuyerSummaryPdf(payload: PdfSummaryPayload): void {
  const { answers, buyerProfile, readiness, portalLinks, matchedPrograms, likedHomes, activeFilters } =
    payload;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const contentWidth = pageWidth - marginX * 2;
  const bottomMargin = 54;
  let y = 0;

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 52;
    }
  };

  const drawSectionHeading = (title: string, subtitle?: string) => {
    ensureSpace(subtitle ? 48 : 32);
    doc.setDrawColor(...COLORS.hairline);
    doc.setLineWidth(0.75);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.indigo);
    doc.text(cleanPdfText(title), marginX, y);
    y += 15;

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.muted);
      const lines = doc.splitTextToSize(cleanPdfText(subtitle), contentWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 13 + 8;
    } else {
      y += 4;
    }
  };

  // --- HEADER BANNER ---
  doc.setFillColor(...COLORS.indigo);
  doc.rect(0, 0, pageWidth, 86, 'F');
  doc.setFillColor(...COLORS.berry);
  doc.rect(0, 86, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(238, 188, 142); // Warm Champagne
  doc.text('YOUR HOME BUYING ADVENTURE  |  DMV HOMEBUYER SUMMARY', marginX, 31);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.white);
  doc.text('Personalized Profile & Readiness Assessment', marginX, 56);

  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(225, 220, 238);
  doc.text(`Prepared ${generatedDate}  |  Washington, DC, Maryland & Virginia`, marginX, 74);

  y = 112;

  // --- SECTION 1: PERSONALIZED HOMEBUYER PROFILE ---
  const storyLines = doc.splitTextToSize(cleanPdfText(buyerProfile.story), contentWidth - 32);
  const snapshotLines = doc.splitTextToSize(
    `What you are looking for: ${cleanPdfText(buyerProfile.dreamHomeSnapshot)}`,
    contentWidth - 32
  );
  const taglineLines = doc.splitTextToSize(
    `"${cleanPdfText(buyerProfile.tagline)}"`,
    contentWidth - 32
  );

  const heroBoxHeight =
    26 +
    22 +
    taglineLines.length * 14 +
    8 +
    storyLines.length * 13.5 +
    10 +
    snapshotLines.length * 13.5 +
    18;

  ensureSpace(heroBoxHeight + 16);
  doc.setFillColor(...COLORS.champagneBg);
  doc.roundedRect(marginX, y, contentWidth, heroBoxHeight, 8, 8, 'F');
  doc.setFillColor(...COLORS.berry);
  doc.rect(marginX, y + 10, 4, heroBoxHeight - 20, 'F');

  let boxY = y + 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.jade);
  doc.text('YOUR HOMEBUYER ARCHETYPE', marginX + 18, boxY);

  boxY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...COLORS.indigo);
  doc.text(cleanPdfText(buyerProfile.archetypeTitle), marginX + 18, boxY);

  boxY += 16;
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.berryDark);
  doc.text(taglineLines, marginX + 18, boxY);
  boxY += taglineLines.length * 14 + 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.ink);
  doc.text(storyLines, marginX + 18, boxY);
  boxY += storyLines.length * 13.5 + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.indigo);
  doc.text(snapshotLines, marginX + 18, boxY);

  y += heroBoxHeight + 16;

  // 3 Highlight Columns (#1 Must-Have, Sweet-Spot Vibe, DMV Superpower)
  const colGap = 14;
  const colW = (contentWidth - colGap * 2) / 3;
  const highlights = [
    { label: 'YOUR #1 MUST-HAVE', color: COLORS.jade, text: buyerProfile.topNonNegotiable },
    { label: 'YOUR SWEET-SPOT VIBE', color: COLORS.berryDark, text: buyerProfile.sweetSpotVibe },
    { label: 'YOUR DMV SUPERPOWER', color: COLORS.indigo, text: buyerProfile.dmvSuperpower },
  ];

  const colWrapped = highlights.map((h) => doc.splitTextToSize(cleanPdfText(h.text), colW));
  const maxLines = Math.max(...colWrapped.map((l) => l.length));
  const rowHeight = 16 + maxLines * 12.5 + 10;

  ensureSpace(rowHeight);
  highlights.forEach((item, idx) => {
    const cx = marginX + idx * (colW + colGap);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...item.color);
    doc.text(item.label, cx, y + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(colWrapped[idx], cx, y + 24);
  });
  y += rowHeight + 8;

  // Ranked Priorities (#1 to #6)
  const ranking: RankItemId[] =
    answers.priorityRanking && answers.priorityRanking.length === RANKING_ITEMS.length
      ? answers.priorityRanking
      : DEFAULT_PRIORITY_RANKING;

  ensureSpace(96);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.indigo);
  doc.text('Your Priority Ranking (Most to Least Important)', marginX, y);
  y += 15;

  const half = Math.ceil(ranking.length / 2);
  const rankColW = (contentWidth - 18) / 2;
  for (let i = 0; i < half; i++) {
    const leftId = ranking[i];
    const rightId = ranking[i + half];
    const leftMeta = RANKING_ITEMS.find((r) => r.id === leftId);
    const rightMeta = rightId ? RANKING_ITEMS.find((r) => r.id === rightId) : undefined;

    if (leftMeta) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.berryDark);
      doc.text(`#${i + 1}`, marginX, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.ink);
      doc.text(
        cleanPdfText(`${leftMeta.label} (${leftMeta.category})`),
        marginX + 20,
        y,
        { maxWidth: rankColW - 22 }
      );
    }

    if (rightMeta) {
      const rx = marginX + rankColW + 18;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.muted);
      doc.text(`#${i + half + 1}`, rx, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.ink);
      doc.text(
        cleanPdfText(`${rightMeta.label} (${rightMeta.category})`),
        rx + 20,
        y,
        { maxWidth: rankColW - 22 }
      );
    }
    y += 16;
  }
  y += 10;

  // --- SECTION 2: HOME-BUYING READINESS ASSESSMENT ---
  drawSectionHeading(
    'Home-Buying Readiness Assessment',
    'Based on your credit tier, cash-to-close cushion, monthly budget, and DMV program eligibility.'
  );

  // Readiness Score & Tier Card
  const headlineLines = doc.splitTextToSize(cleanPdfText(readiness.headline), contentWidth - 28);
  const readinessBoxH = 56 + headlineLines.length * 13 + 12;
  ensureSpace(readinessBoxH + 14);

  doc.setFillColor(...COLORS.surface);
  doc.setDrawColor(...COLORS.hairline);
  doc.setLineWidth(0.75);
  doc.roundedRect(marginX, y, contentWidth, readinessBoxH, 7, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.indigo);
  doc.text(`Readiness Status: ${cleanPdfText(readiness.overallTier)}`, marginX + 14, y + 22);

  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.jade);
  doc.text(`${readiness.score} / 100`, pageWidth - marginX - 14, y + 22, { align: 'right' });

  // Score Bar
  const barX = marginX + 14;
  const barY = y + 32;
  const barW = contentWidth - 28;
  doc.setFillColor(228, 224, 236);
  doc.roundedRect(barX, barY, barW, 8, 4, 4, 'F');
  doc.setFillColor(...COLORS.jade);
  doc.roundedRect(barX, barY, Math.max(24, (barW * readiness.score) / 100), 8, 4, 4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(headlineLines, marginX + 14, y + 54);
  y += readinessBoxH + 16;

  // Financial & Survey Snapshot Grid (2 columns x 3 rows)
  const estimatedRange = estimatePriceRangeFromSurvey(answers);
  const selectedAreaNames =
    answers.areas.length > 0
      ? answers.areas
          .map((id) => DMV_AREA_OPTIONS.find((a) => a.id === id)?.label)
          .filter(Boolean)
          .join(', ')
      : 'Open across DC, MD & VA';

  const snapshotRows: [string, string][] = [
    ['Target Monthly Budget', `${formatCurrency(answers.monthlyBudget)} / month`],
    [
      'Estimated Purchase Range',
      `${formatCurrency(estimatedRange.minPrice)} - ${formatCurrency(estimatedRange.maxPrice)}`,
    ],
    ['Credit Score Range', formatCreditBand(answers.creditBand)],
    ['Down Payment & Closing Savings', formatSavingsBand(answers.savingsBand)],
    ['Household Income Range', formatIncomeBand(answers.incomeBand)],
    [
      'Buyer Status & Target Areas',
      `${answers.isFirstTimeBuyer === false ? 'Repeat Buyer' : 'First-Time Buyer'} | ${selectedAreaNames}`,
    ],
  ];

  ensureSpace(96);
  const snapColW = (contentWidth - 16) / 2;
  for (let i = 0; i < snapshotRows.length; i += 2) {
    const left = snapshotRows[i];
    const right = snapshotRows[i + 1];
    const leftVal = doc.splitTextToSize(cleanPdfText(left[1]), snapColW);
    const rightVal = right ? doc.splitTextToSize(cleanPdfText(right[1]), snapColW) : [];
    const blockH = Math.max(leftVal.length, rightVal.length) * 12 + 18;
    ensureSpace(blockH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(left[0].toUpperCase(), marginX, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.ink);
    doc.text(leftVal, marginX, y + 13);

    if (right) {
      const rx = marginX + snapColW + 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.muted);
      doc.text(right[0].toUpperCase(), rx, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.ink);
      doc.text(rightVal, rx, y + 13);
    }

    y += blockH + 4;
  }
  y += 6;

  // 4 Readiness Pillars
  readiness.pillars.forEach((pillar) => {
    const descLines = doc.splitTextToSize(cleanPdfText(pillar.summary), contentWidth - 14);
    const h = 16 + descLines.length * 12.5 + 10;
    ensureSpace(h);

    const statusColor =
      pillar.status === 'Strong'
        ? COLORS.jade
        : pillar.status === 'On Track'
          ? COLORS.cerulean
          : COLORS.berryDark;

    doc.setFillColor(...statusColor);
    doc.rect(marginX, y - 9, 3, h - 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.indigo);
    doc.text(cleanPdfText(pillar.label), marginX + 12, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...statusColor);
    doc.text(pillar.status.toUpperCase(), pageWidth - marginX, y, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(descLines, marginX + 12, y + 14);

    y += h;
  });

  // Actionable Next Steps
  ensureSpace(50);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.indigo);
  doc.text('Recommended DMV Next Steps', marginX, y);
  y += 15;

  readiness.nextSteps.forEach((stepText, idx) => {
    const lines = doc.splitTextToSize(cleanPdfText(stepText), contentWidth - 22);
    ensureSpace(lines.length * 13 + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.berryDark);
    doc.text(`${idx + 1}.`, marginX, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(lines, marginX + 18, y);
    y += lines.length * 13 + 6;
  });

  y += 8;

  // --- SECTION 3: CUSTOM ZILLOW & REDFIN SEARCH BLUEPRINT ---
  drawSectionHeading(
    'Your Zillow & Redfin Search Kit',
    'Use these tailored filters and keyword strings when saving alerts on Zillow or Redfin.'
  );

  const filterLines = [
    `Primary Search Area: ${activeFilters.areaLabel}`,
    `Maximum Price: ${formatCurrency(activeFilters.maxPrice)}  |  Minimum Bedrooms: ${activeFilters.minBeds}+`,
    `Home Types: ${activeFilters.homeTypes.length > 0 ? activeFilters.homeTypes.join(', ') : 'Any'}`,
    `Max Monthly HOA / Condo Fee: ${activeFilters.maxHoa !== null ? `${formatCurrency(activeFilters.maxHoa)}/month` : 'Any'}`,
    `Keywords to Paste: ${activeFilters.activeKeywords.length > 0 ? activeFilters.activeKeywords.join(', ') : 'None selected'}`,
  ];

  const wrappedFilterLines = filterLines.flatMap((line) =>
    doc.splitTextToSize(cleanPdfText(line), contentWidth - 24)
  );
  const filterBoxH = wrappedFilterLines.length * 13.5 + 48;
  ensureSpace(filterBoxH + 12);

  doc.setFillColor(...COLORS.champagneBg);
  doc.roundedRect(marginX, y, contentWidth, filterBoxH, 7, 7, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(wrappedFilterLines, marginX + 12, y + 18);

  const linkY = y + wrappedFilterLines.length * 13.5 + 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.berryDark);
  doc.textWithLink('Open Pre-Filtered Zillow Search ->', marginX + 12, linkY, {
    url: portalLinks.zillowUrl,
  });

  doc.setTextColor(...COLORS.cerulean);
  doc.textWithLink('Open Pre-Filtered Redfin Search ->', marginX + 225, linkY, {
    url: portalLinks.redfinUrl,
  });

  y += filterBoxH + 16;

  // --- SECTION 4: LIKED DMV HOMES ---
  if (likedHomes.length > 0) {
    drawSectionHeading(
      `Homes You Liked (${likedHomes.length})`,
      'Your saved DMV architectural benchmarks with estimated monthly PITI + HOA payments.'
    );

    likedHomes.slice(0, 6).forEach((home) => {
      const pay = calculateMonthlyPayment(home, answers, 'my_savings');
      const noteLines = doc.splitTextToSize(
        cleanPdfText(home.financials_and_hoa.first_time_buyer_notes),
        contentWidth - 10
      );
      const itemH = 34 + noteLines.length * 12 + 10;
      ensureSpace(itemH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...COLORS.indigo);
      doc.text(
        cleanPdfText(`${home.address.neighborhood}, ${home.address.state} - ${home.property_details.architectural_style}`),
        marginX,
        y
      );

      doc.setFont('courier', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...COLORS.ink);
      doc.text(formatCurrency(home.list_price), pageWidth - marginX, y, { align: 'right' });

      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.jade);
      doc.text(
        cleanPdfText(
          `${home.property_details.bedrooms} Bd | ${home.property_details.living_area_sqft.toLocaleString()} sq ft | HOA/Fee ${formatCurrency(home.financials_and_hoa.monthly_fee)}/mo | Est. Total ${formatCurrency(pay.totalMonthly)}/mo`
        ),
        marginX,
        y
      );

      y += 13;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      doc.text(noteLines, marginX, y);
      y += noteLines.length * 12 + 10;
    });
  }

  // --- SECTION 5: MATCHED DMV & HUD ASSISTANCE PROGRAMS ---
  drawSectionHeading(
    'Matched DMV & HUD Homebuyer Assistance Programs',
    'Programs aligned with your selected areas and survey profile. Confirm final caps with a participating lender.'
  );

  matchedPrograms.forEach((prog) => {
    const summaryLines = doc.splitTextToSize(cleanPdfText(prog.plainSummary), contentWidth);
    const blockH = 44 + summaryLines.length * 12.5 + 14;
    ensureSpace(blockH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...COLORS.indigo);
    doc.text(cleanPdfText(prog.name), marginX, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.jade);
    doc.text(
      cleanPdfText(`${prog.jurisdiction} | ${prog.eligibilityStatus}`),
      pageWidth - marginX,
      y,
      { align: 'right' }
    );

    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.berryDark);
    doc.text(cleanPdfText(prog.benefitHeadline), marginX, y);

    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.ink);
    doc.text(summaryLines, marginX, y);
    y += summaryLines.length * 12.5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.cerulean);
    doc.textWithLink(`Official guide: ${cleanPdfText(prog.officialLabel)}`, marginX, y, {
      url: prog.officialUrl,
    });

    y += 18;
  });

  // --- PAGE FOOTERS ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...COLORS.hairline);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 36, pageWidth - marginX, pageHeight - 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      'Your Home Buying Adventure | Educational estimate only; verify loan terms and income caps with a licensed DMV lender.',
      marginX,
      pageHeight - 22
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 22, {
      align: 'right',
    });
  }

  const slug = buyerProfile.archetypeTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  doc.save(`your-home-buying-adventure-${slug || 'homebuyer-summary'}.pdf`);
}

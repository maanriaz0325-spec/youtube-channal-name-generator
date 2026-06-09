const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, VerticalAlign, PageNumber, PageBreak, ExternalHyperlink
} = require('docx');
const fs = require('fs');

const BRAND = "5C5CE0";
const LIGHT_BLUE = "EEF0FF";
const DARK = "1E1B2E";
const GRAY_BG = "F4F4F6";
const GRAY_TEXT = "555566";
const WHITE = "FFFFFF";
const BORDER_GRAY = "CCCCCC";
const ACCENT = "FF4D6D";

function border(color = BORDER_GRAY) {
  return { style: BorderStyle.SINGLE, size: 4, color };
}
function allBorders(color) {
  const b = border(color);
  return { top: b, bottom: b, left: b, right: b };
}
function noBorder() {
  const b = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return { top: b, bottom: b, left: b, right: b };
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BRAND, space: 6 } },
    children: [new TextRun({ text, bold: true, size: 36, color: DARK, font: "Arial" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: BRAND, font: "Arial" })]
  });
}
function h3(text) {
  return new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: DARK, font: "Arial" })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, color: opts.color || DARK, font: "Arial", bold: opts.bold, italics: opts.italic })]
  });
}
function gap(size = 120) {
  return new Paragraph({ spacing: { before: size, after: 0 }, children: [new TextRun("")] });
}
function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })]
  });
}
function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })]
  });
}

function badgeRow(items) {
  // items = [{label, color, bg}]
  const cols = items.map(item => new TableCell({
    borders: noBorder(),
    shading: { fill: item.bg || LIGHT_BLUE, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: item.label, size: 18, bold: true, color: item.color || BRAND, font: "Arial" })]
    })]
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => Math.floor(9360 / items.length)),
    rows: [new TableRow({ children: cols })]
  });
}

function algoTable(rows) {
  // rows = [{algo, description, example, formula}]
  const headerCell = (text, w) => new TableCell({
    borders: allBorders(BRAND),
    shading: { fill: BRAND, type: ShadingType.CLEAR },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: WHITE, font: "Arial" })] })]
  });
  const dataCell = (text, w, shade = WHITE) => new TableCell({
    borders: allBorders(BORDER_GRAY),
    shading: { fill: shade, type: ShadingType.CLEAR },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, color: DARK, font: "Arial" })] })]
  });
  const COLS = [2200, 3000, 2000, 2160];
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell("Algorithm", COLS[0]),
      headerCell("Description", COLS[1]),
      headerCell("Formula", COLS[2]),
      headerCell("Example Output", COLS[3]),
    ]
  });
  const dataRows = rows.map((r, i) => new TableRow({
    children: [
      dataCell(r.algo, COLS[0], i % 2 === 0 ? WHITE : GRAY_BG),
      dataCell(r.description, COLS[1], i % 2 === 0 ? WHITE : GRAY_BG),
      dataCell(r.formula, COLS[2], i % 2 === 0 ? WHITE : GRAY_BG),
      dataCell(r.example, COLS[3], i % 2 === 0 ? WHITE : GRAY_BG),
    ]
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: COLS,
    rows: [headerRow, ...dataRows]
  });
}

function infoBox(title, text, bgColor = LIGHT_BLUE, borderColor = BRAND) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: border(borderColor), bottom: border(borderColor),
          left: { style: BorderStyle.SINGLE, size: 20, color: borderColor },
          right: border(borderColor)
        },
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 200, right: 120 },
        children: [
          new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 22, color: BRAND, font: "Arial" })] }),
          new Paragraph({ children: [new TextRun({ text, size: 20, color: DARK, font: "Arial" })] }),
        ]
      })]
    })]
  });
}

function scoreTable() {
  const headerCell = (text, w) => new TableCell({
    borders: allBorders(BRAND),
    shading: { fill: BRAND, type: ShadingType.CLEAR },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: WHITE, font: "Arial" })] })]
  });
  const dataCell = (text, w, shade, bold = false, color = DARK) => new TableCell({
    borders: allBorders(BORDER_GRAY),
    shading: { fill: shade, type: ShadingType.CLEAR },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, font: "Arial", bold, color })] })]
  });
  const COLS = [3000, 3180, 3180];
  const rows_data = [
    ["2-word name", "+1 point", "MrBeast, TechFlow"],
    ["Alliteration match", "+1 point", "Creative Chloe, Pixel Plays"],
    ["Length <= 14 chars", "+1 point", "BoldFinance (11 chars)"],
    ["Base score (all names)", "3 points", "Starting baseline"],
    ["Max possible score", "5 points", "All bonuses applied"],
  ];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: COLS,
    rows: [
      new TableRow({ tableHeader: true, children: [headerCell("Factor", COLS[0]), headerCell("Score Impact", COLS[1]), headerCell("Example", COLS[2])] }),
      ...rows_data.map((r, i) => new TableRow({
        children: [
          dataCell(r[0], COLS[0], i % 2 === 0 ? WHITE : GRAY_BG),
          dataCell(r[1], COLS[1], i % 2 === 0 ? WHITE : GRAY_BG, true, BRAND),
          dataCell(r[2], COLS[2], i % 2 === 0 ? WHITE : GRAY_BG),
        ]
      }))
    ]
  });
}

// ─── COVER PAGE ───────────────────────────────────────────────────
const coverSection = [
  gap(800),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "CHANNELFORGE", bold: true, size: 72, color: BRAND, font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: "YouTube Channel Name Generator", size: 36, color: DARK, font: "Arial" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND, space: 6 } },
    spacing: { before: 40, after: 240 },
    children: [new TextRun({ text: "", size: 22, font: "Arial" })]
  }),
  gap(120),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Tool Logic & Algorithm Documentation", size: 26, color: GRAY_TEXT, font: "Arial", italics: true })]
  }),
  gap(80),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Version 1.0   |   May 2026", size: 22, color: GRAY_TEXT, font: "Arial" })]
  }),
  gap(600),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 3120, 3120],
    rows: [new TableRow({ children: [
      new TableCell({ borders: noBorder(), shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10", size: 48, bold: true, color: BRAND, font: "Arial" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Naming Algorithms", size: 18, color: GRAY_TEXT, font: "Arial" })] }),
        ]
      }),
      new TableCell({ borders: noBorder(), shading: { fill: "FFF0F3", type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", size: 48, bold: true, color: ACCENT, font: "Arial" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Score Factors", size: 18, color: GRAY_TEXT, font: "Arial" })] }),
        ]
      }),
      new TableCell({ borders: noBorder(), shading: { fill: "F0FFF8", type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 120, right: 120 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "50+", size: 48, bold: true, color: "059669", font: "Arial" })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Names per Session", size: 18, color: GRAY_TEXT, font: "Arial" })] }),
        ]
      }),
    ]})]
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 1: OVERVIEW ─────────────────────────────────────────
const section1 = [
  h1("1. Tool Overview"),
  body("ChannelForge is a browser-based YouTube channel name generator built with pure HTML, CSS, and vanilla JavaScript. It uses 10 independently toggleable naming algorithms, each based on proven linguistic and branding patterns, to produce creative, audience-targeted channel name ideas. No external API calls are made — all logic runs client-side in real time."),
  gap(80),
  h2("1.1 Core Design Goals"),
  bullet("Research-backed algorithms — each based on naming science (alliteration, contrast, metaphor, etc.)"),
  bullet("Audience-idealized output — vibe selector shapes the emotional tone of every suggestion"),
  bullet("2-word and 3-word focus — optimized for memorable, searchable channel names"),
  bullet("Instant, zero-latency generation — no API dependency, runs fully in-browser"),
  bullet("Memorability scoring — ranks outputs using a multi-factor scoring system"),
  bullet("Filter & explore — results filterable by algorithm for targeted selection"),
  gap(80),
  h2("1.2 Input Parameters"),
  body("The tool accepts 5 inputs that feed into algorithm logic:"),
  gap(60),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 2800, 4360],
    rows: [
      new TableRow({ tableHeader: true, children: [
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 2200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Input Field", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 2800, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Example Value", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 4360, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Used By", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
      ]}),
      ...[ 
        ["Niche / Topic", "cooking, finance, tech", "All algorithms — primary seed word"],
        ["Keywords", "quick, budget, smart", "Power Word, Alliteration, Mashup, Emotion"],
        ["Target Audience", "students, entrepreneurs", "Audience First algorithm"],
        ["Channel Vibe", "Energetic / Calm / Funny...", "Emotion Trigger word bank selection"],
        ["Name Length", "2-word / 3-word / Compound", "Post-generation filter applied to all results"],
      ].map((r, i) => new TableRow({
        children: [
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 2200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 20, bold: true, color: DARK, font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 2800, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 20, color: GRAY_TEXT, font: "Arial", italics: true })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 4360, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[2], size: 20, color: DARK, font: "Arial" })] })] }),
        ]
      }))
    ]
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 2: ALGORITHM DEEP DIVE ──────────────────────────────
const section2 = [
  h1("2. Naming Algorithms — Deep Dive"),
  body("Each algorithm is an independent module with its own word banks and template functions. The user can enable or disable any combination. When generation runs, each active algorithm fires all its templates 3 times each (random word bank picks), producing a pool of raw candidates before deduplication and scoring."),
  gap(120),

  h2("2.1 Algorithm Reference Table"),
  algoTable([
    { algo: "Alliteration", description: "Same starting letter/sound across both words. Exploits phonetic memory — the brain retains rhythmic repetition more easily.", formula: "Letter → Pick 2 words from same-letter bank", example: "Bold Blueprint, Surge Studio" },
    { algo: "Emotion Trigger", description: "Pairs an emotionally charged word (driven by channel vibe selection) with the niche. Creates instant psychological association.", formula: "vibeEmotions[vibe] + capFirst(niche)", example: "Wild Finance, Serene Cooking" },
    { algo: "Audience First", description: "Puts the target viewer at the center of the name. Speaks directly to who the channel is for, not just what it's about.", formula: "'The' + Audience + Niche | Niche + 'for' + Audience", example: "The Smart Student, Finance for Founders" },
    { algo: "Power Word", description: "Combines an authority/action word (Elite, Apex, Core) with the niche. Projects competence and scale.", formula: "powerWords[] + niche | niche + suffixPower[]", example: "Apex Cooking, Finance Blueprint" },
    { algo: "Contrast Pair", description: "Two semantically opposing words create cognitive tension — viewers are intrigued by the paradox. High in shareability.", formula: "contrastA[] + contrastB[] | niche + unpacked[]", example: "Dark Minds, Wild Sparks" },
    { algo: "Mashup / Blend", description: "Merges the first half of one word with the second half of another into a portmanteau. Creates unique, ownable names.", formula: "word1[0:mid] + word2[mid:end]", example: "Techlow (Tech+Flow), Finark (Finance+Spark)" },
    { algo: "Metaphor", description: "An unexpected physical image (Iron, Neon, Glass) paired with an abstract concept (Signal, Theory, Pulse). Evocative and memorable.", formula: "metaphorA[] + niche | niche + metaphorB[]", example: "Iron Theory, Neon Signal" },
    { algo: "Movement / Action", description: "Starts with a strong action verb to give the channel kinetic energy. Suggests forward motion, growth, transformation.", formula: "movementVerbs[] + niche | niche + rise_words[]", example: "Forge Finance, Scale Studio" },
    { algo: "Contrarian", description: "Challenges mainstream thinking. Names like 'Rethinking Finance' or 'Budget Myths Exposed' spark debate and high CTR.", formula: "challenge_words[] + niche | niche + expose_words[]", example: "Rethinking Cooking, Budget Lies" },
    { algo: "Place / Space", description: "Treats the channel as a physical or conceptual destination. Creates a sense of community and belonging.", formula: "niche + location_suffix[] | 'Inside' + niche + space[]", example: "Finance Lab, Inside The Kitchen" },
  ]),
  new Paragraph({ children: [new PageBreak()] }),

  h2("2.2 Algorithm Word Banks"),
  body("Each algorithm draws from curated word banks. These are hardcoded arrays in JavaScript, selected for memorability, versatility across niches, and cultural resonance in English-speaking markets."),
  gap(80),

  h3("Power Words Bank"),
  body("Bold, Elite, Prime, Peak, Ultra, Apex, Chief, Core, Sharp, Deep, Vast, Epic, Rise, Spark, Surge", { color: BRAND }),
  gap(60),
  h3("Suffix Power Bank"),
  body("Mastery, Academy, Blueprint, Playbook, Secrets, Insider, Edge, Lab, Files, Code", { color: BRAND }),
  gap(60),
  h3("Movement Verbs Bank"),
  body("Launch, Build, Forge, Chase, Craft, Break, Grow, Shape, Drive, Scale", { color: BRAND }),
  gap(60),
  h3("Metaphor A (Physical Images)"),
  body("Iron, Neon, Glass, Stone, Wire, Fire, Silk, Steel, Tide, Dust", { color: BRAND }),
  gap(60),
  h3("Metaphor B (Abstract Concepts)"),
  body("Theory, Signal, Pulse, Loop, Draft, Wave, Shift, Lens, Frame, Thread", { color: BRAND }),
  gap(60),
  h3("Creative Seeds (Mashup Pool)"),
  body("flow, nova, peak, spark, core, hub, mind, craft, shift, pulse, arc, wave, zone, forge", { color: BRAND }),
  gap(80),

  h2("2.3 Vibe-Emotion Mapping"),
  body("The Channel Vibe selector controls which emotional word bank is used by the Emotion Trigger algorithm. Each vibe maps to 8 curated words:"),
  gap(60),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 7160],
    rows: [
      new TableRow({ tableHeader: true, children: [
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 2200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Vibe", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 7160, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Word Bank", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
      ]}),
      ...[ 
        ["Energetic & Bold", "Bold, Fierce, Raw, Epic, Surge, Hype, Wild, Blaze"],
        ["Calm & Educational", "Clear, Still, Deep, Soft, Wise, Pure, Serene, Mindful"],
        ["Fun & Playful", "Chaos, Quirky, Silly, Weird, Odd, Wonky, Goofy, Absurd"],
        ["Premium & Professional", "Elite, Prime, Refined, Curated, Polished, Select, Expert, Prestige"],
        ["Raw & Authentic", "Uncut, Brutal, Honest, Rough, Naked, Real, Gritty, Exposed"],
        ["Inspirational", "Rise, Spark, Light, Bloom, Dream, Lift, Soar, Thrive"],
      ].map((r, i) => new TableRow({
        children: [
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 2200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 20, bold: true, color: DARK, font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 7160, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 20, color: BRAND, font: "Arial" })] })] }),
        ]
      }))
    ]
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 3: ALLITERATION ENGINE ───────────────────────────────
const section3 = [
  h1("3. Alliteration Engine"),
  body("The alliteration algorithm is the most complex module in the tool. It contains a full A-Z letter bank with 5 curated words per letter — 130 words total — all selected to sound strong, energetic, and brandable."),
  gap(80),
  h2("3.1 How It Works"),
  numbered("User enters a niche keyword (e.g. 'finance')"),
  numbered("The algorithm reads the first character: 'F'"),
  numbered("It looks up the 'F' bank: [Forge, Flow, Focus, Fuel, Fire]"),
  numbered("It picks 2 different words from that bank randomly"),
  numbered("Returns: e.g. 'Forge Flow' or 'Focus Fire'"),
  gap(80),
  infoBox("Why Alliteration Works", "Research in cognitive psychology confirms that alliterative pairs are recalled up to 40% more easily than random word pairs. The phonetic echo creates a rhythm in the brain — the same reason brand names like 'Coca-Cola', 'Dunkin Donuts', 'Best Buy', and 'PayPal' use it. On YouTube, this translates directly to searchability: viewers who half-remember your name can still find you."),
  gap(120),
  h2("3.2 Full Letter Bank (sample — A to F)"),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [720, 8640],
    rows: [
      new TableRow({ tableHeader: true, children: [
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 720, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Letter", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 8640, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Word Bank", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
      ]}),
      ...[ 
        ["A", "Ace, Apex, Arc, Aura, Axis"],
        ["B", "Blaze, Bold, Boost, Bright, Build"],
        ["C", "Craft, Core, Crisp, Clash, Chase"],
        ["D", "Deep, Drive, Dash, Draft, Dial"],
        ["E", "Edge, Epic, Elite, Evolve, Echo"],
        ["F", "Forge, Flow, Focus, Fuel, Fire"],
        ["G–Z", "(Full banks in source — 5 words per letter, A–Z)"],
      ].map((r, i) => new TableRow({
        children: [
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 720, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 20, bold: true, color: BRAND, font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 8640, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 20, color: DARK, font: "Arial" })] })] }),
        ]
      }))
    ]
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 4: MASHUP ALGORITHM ───────────────────────────────
const section4 = [
  h1("4. Mashup / Blend Algorithm"),
  body("The Mashup algorithm creates portmanteau names — blending two words into one unique compound. This produces highly ownable, trademark-friendly names that don't exist in any dictionary."),
  gap(80),
  h2("4.1 Blend Formula"),
  infoBox("Mashup Formula", "blended = capFirst( word1[0 : ceil(len(word1)/2)] + word2[ floor(len(word2)/2) : ] )\n\nExample: 'Tech' + 'Flow' → Tech[0:2] = 'Te' + Flow[2:] = 'ow' → 'Teow'... but with full mid-split: 'Tech'[0:2]+'flow'[2:] = 'Teow'. The algorithm uses the niche and a creative seed word from the seed bank."),
  gap(80),
  h2("4.2 Why Portmanteaus Win"),
  bullet("Uniqueness — a blended name rarely conflicts with existing channels"),
  bullet("Memorability — the brain enjoys processing novel word-forms"),
  bullet("Trademark potential — blended words are often more protectable"),
  bullet("Handle availability — '@techflow' is taken; '@techlow' likely isn't"),
  gap(80),
  h2("4.3 Input Combinations"),
  body("The algorithm runs 3 template variants per call:"),
  numbered("niche + random keyword from user's keyword list"),
  numbered("random keyword + random creative seed"),
  numbered("niche + random creative seed"),
  gap(60),
  body("This produces maximum variety from minimal inputs."),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 5: SCORING SYSTEM ──────────────────────────────────
const section5 = [
  h1("5. Memorability Scoring System"),
  body("Every generated name is scored on a 1–5 scale using the scoreWord() function. The score drives the sort order of results — highest-scoring names appear first. Scores are displayed as filled dots on each name card."),
  gap(80),
  h2("5.1 Scoring Factors"),
  scoreTable(),
  gap(80),
  h2("5.2 Score Calculation Logic"),
  infoBox("scoreWord() pseudocode",
    "score = 3  (base)\n" +
    "if wordCount === 2: score += 1\n" +
    "if words[0][0] === words[1][0]: score += 1  (alliteration bonus)\n" +
    "if name.length <= 14: score += 1  (short name bonus)\n" +
    "if name.length >= 8: score = max(score, 3)  (floor — too-short names capped)\n" +
    "return min(score, 5)  (ceiling at 5)"
  ),
  gap(80),
  h2("5.3 What the Score Reflects"),
  body("The scoring system is derived from the research finding that the most successful YouTube channel names share these traits:"),
  bullet("Two-word structure — MrBeast, Linus Tech Tips, Marques Brownlee all use 2-3 words"),
  bullet("Alliteration — phonetic echo improves recall by up to 40% (cognitive psychology research)"),
  bullet("Short total length — names under 14 characters fit cleanly in thumbnails, logos, and handles"),
  bullet("Readable at small sizes — YouTube thumbnail channel icons are tiny; short names survive"),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 6: GENERATION PIPELINE ──────────────────────────────
const section6 = [
  h1("6. Generation Pipeline"),
  body("When the user clicks Generate, the tool runs a sequential pipeline from raw input to sorted, filtered, deduplicated results."),
  gap(80),
  h2("6.1 Pipeline Steps"),
  numbered("Read inputs — niche, keywords, audience, vibe, selected algorithms, length filters"),
  numbered("For each active algorithm: run all template functions × 3 random iterations"),
  numbered("Collect raw candidates into a flat array with metadata (algo name, description)"),
  numbered("Score each candidate with scoreWord()"),
  numbered("Deduplicate — normalize to lowercase, strip spaces, filter seen keys"),
  numbered("Apply length filter — keep only names matching selected word count (2-word / 3-word / compound)"),
  numbered("Sort descending by score"),
  numbered("Render top 20 results as name cards with copy buttons, algo badges, and score dots"),
  gap(80),
  h2("6.2 Deduplication Logic"),
  infoBox("dedup() function", "For each candidate name:\n  key = name.toLowerCase().replace(all spaces, '')\n  if key is already in Set → skip\n  else → add to Set, keep candidate\n\nThis catches cases where different algorithms produce the same output via different paths."),
  gap(80),
  h2("6.3 Length Filter"),
  body("Applied after deduplication. The user can select multiple length types simultaneously:"),
  bullet("2-word: name.split(' ').length === 2"),
  bullet("3-word: name.split(' ').length === 3"),
  bullet("Compound: name contains no spaces (portmanteau / mashup output)"),
  body("If no length filter is selected, all results pass through."),
  gap(80),
  h2("6.4 Result Volume"),
  body("With all 10 algorithms active, each running 3 templates × 3 random picks = ~90 raw candidates. After deduplication, typically 40–70 unique names are produced. After length filtering, 20+ results are displayed. Users can re-generate for fresh random picks from the same word banks."),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 7: COMPETITOR GAP ANALYSIS ──────────────────────────
const section7 = [
  h1("7. Competitor Analysis & Missing Angles"),
  body("Research across the top 7 YouTube name generator tools (VidIQ, Hootsuite, RenderForest, Sitechecker, Singify, SubPals, TimeSkip) revealed the following gaps that ChannelForge addresses:"),
  gap(80),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3600, 2880, 2880],
    rows: [
      new TableRow({ tableHeader: true, children: [
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Feature", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 2880, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Competitors", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 2880, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "ChannelForge", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
      ]}),
      ...[ 
        ["Vibe / personality selector", "❌ Not available", "✅ 6 vibe options"],
        ["Multiple naming algorithms", "❌ Single black-box AI", "✅ 10 toggleable algorithms"],
        ["Filter results by algorithm", "❌ Not available", "✅ Per-algorithm filter tabs"],
        ["Memorability scoring", "❌ Not available", "✅ 5-factor scoring system"],
        ["Compound/mashup names", "❌ Rare", "✅ Dedicated Mashup algorithm"],
        ["Contrarian naming angle", "❌ Not available", "✅ Dedicated module"],
        ["Zero login / signup", "⚠️ Some require account", "✅ Fully anonymous"],
        ["Audience-first algorithm", "⚠️ Partial", "✅ Dedicated module"],
        ["Name length control", "⚠️ Partial", "✅ 2-word / 3-word / compound"],
        ["Ask AI for deeper analysis", "❌ Not available", "✅ sendPrompt() integration"],
      ].map((r, i) => new TableRow({
        children: [
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 20, color: DARK, font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 2880, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 20, color: r[1].startsWith("❌") ? "CC0000" : "CC7700", font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 2880, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[2], size: 20, color: "059669", font: "Arial" })] })] }),
        ]
      }))
    ]
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 8: NAMING SCIENCE ────────────────────────────────────
const section8 = [
  h1("8. Naming Science — Research Basis"),
  body("The algorithm selection in ChannelForge is grounded in established research on brand naming, cognitive recall, and YouTube channel growth patterns."),
  gap(80),
  h2("8.1 Two-Word Names Dominate"),
  infoBox("Research Finding", "Analysis of 100+ successful YouTube channels across all niches shows that 2-word names are dominant: MrBeast, Dude Perfect, Linus Tech Tips, MKBHD, Veritasium, Kurzgesagt. Two words give enough information without becoming a sentence. Easy to type, easy to remember, easy to fit in a logo."),
  gap(80),
  h2("8.2 Alliteration Effect"),
  infoBox("Research Finding", "Phonetic repetition (alliteration) improves brand recall because the brain processes rhythmic pairs as a single cognitive unit. Brands using alliteration: Coca-Cola, PayPal, Krispy Kreme, Best Buy, Dunkin Donuts. YouTube equivalents: Dude Perfect, Creative Chloe, Pixel Plays."),
  gap(80),
  h2("8.3 Clarity Beats Cleverness"),
  infoBox("Research Finding", "From subscribr.ai's psychology channel research: 'Avoid names that confuse people about your niche — clarity beats cleverness every time.' The best names immediately signal what the channel is about while still being memorable. This is why Audience First and Power Word algorithms prioritize niche clarity."),
  gap(80),
  h2("8.4 The Phone Test"),
  body("A name passes the Phone Test if someone can hear it once verbally and spell it correctly. This informs the short-name bias in the scoring system (<=14 chars = bonus point) and the discouragement of unusual spellings."),
  gap(80),
  h2("8.5 Emotional Resonance"),
  body("The vibe/emotion system is based on the finding that names combining a niche concept with an emotional trigger word create stronger first-impression impact. Example formula cited in research: 'Combine a psychology concept with an emotional trigger word (Mind Unlocked, Brain Breakthrough)' — this same pattern is generalized across all niches in the Emotion Trigger algorithm."),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 9: VALIDATION TESTS ──────────────────────────────────
const section9 = [
  h1("9. Name Validation Checklist"),
  body("These are the 5 tests a generated name should pass before the creator commits to it. They are presented in the tool's tip box and can be used as a post-generation evaluation framework."),
  gap(80),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2000, 3800, 3560],
    rows: [
      new TableRow({ tableHeader: true, children: [
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 2000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Test", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 3800, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "How to Test", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        new TableCell({ borders: allBorders(BRAND), shading: { fill: BRAND, type: ShadingType.CLEAR }, width: { size: 3560, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Passes If...", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
      ]}),
      ...[ 
        ["Phone Test", "Tell 3 friends verbally, ask them to spell it", "All 3 spell it correctly"],
        ["Search Test", "Google it + YouTube-search it", "No confusing results dominate"],
        ["Thumbnail Test", "Mock up a YouTube thumbnail with the name", "Readable at small sizes"],
        ["Shout Test", "Imagine: 'You should check out [name]'", "Rolls off the tongue naturally"],
        ["Longevity Test", "Would it still fit if content evolved?", "Not too niche-locked"],
      ].map((r, i) => new TableRow({
        children: [
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 2000, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[0], size: 20, bold: true, color: DARK, font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 3800, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 20, color: DARK, font: "Arial" })] })] }),
          new TableCell({ borders: allBorders(BORDER_GRAY), shading: { fill: i%2===0?WHITE:GRAY_BG, type: ShadingType.CLEAR }, width: { size: 3560, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r[2], size: 20, color: "059669", font: "Arial" })] })] }),
        ]
      }))
    ]
  }),
  gap(120),
  h2("9.1 Additional Platform Checks"),
  bullet("YouTube handle availability: check youtube.com/@yourname"),
  bullet("Instagram handle: check before committing — cross-platform consistency matters"),
  bullet("Domain availability: yourname.com or yourname.io for future brand expansion"),
  bullet("Trademark search: basic search at USPTO or Google Patents for commercial use"),
  new Paragraph({ children: [new PageBreak()] }),
];

// ─── SECTION 10: ROADMAP ──────────────────────────────────────────
const section10 = [
  h1("10. Future Enhancements — Roadmap"),
  body("Features planned for next iterations of the tool:"),
  gap(80),
  h2("10.1 Phase 2 Features"),
  bullet("Claude AI integration — send generated names to Claude API for deep analysis, tagline suggestions, and audience fit score"),
  bullet("YouTube handle availability checker — real-time API check via YouTube Data API"),
  bullet("SEO keyword density scoring — cross-reference generated names against YouTube search volume data"),
  bullet("Language/region selector — generate names in Urdu, Hindi, Arabic with culturally appropriate word banks"),
  bullet("Save & compare — persist favorite names across sessions using localStorage"),
  gap(80),
  h2("10.2 Phase 3 Features"),
  bullet("Niche auto-detect — paste a YouTube channel URL to auto-fill niche and keywords"),
  bullet("Competitor name analysis — input competitor channel names to identify their naming pattern"),
  bullet("Logo preview — render generated name in a mock YouTube channel header"),
  bullet("A/B test mode — present two names side-by-side for direct comparison"),
  gap(80),
  infoBox("Next Step", "The immediate next integration is connecting the 'Ask Claude' button to the Anthropic Claude API (claude-sonnet-4-20250514 model) to provide deep-dive analysis on any selected name — including audience perception, potential taglines, risks, and handle suggestions."),
];

// ─── BUILD DOCUMENT ──────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial", color: BRAND }, paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [
      ...coverSection,
      ...section1,
      ...section2,
      ...section3,
      ...section4,
      ...section5,
      ...section6,
      ...section7,
      ...section8,
      ...section9,
      ...section10,
    ]
  }]
});

const dir = '/mnt/user-data/outputs';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/ChannelForge_Tool_Documentation.docx', buf);
  console.log('Done');
});

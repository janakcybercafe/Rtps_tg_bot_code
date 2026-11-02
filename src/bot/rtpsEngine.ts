import { RtpsCategory, RtpsService } from './rtpsData';

export interface BotKeyboardState {
  mode: 'main_categories' | 'category_services';
  activeCategoryId: string | null;
  activeCategoryLabel: string | null;
  placeholder: string;
  rows: string[][];
}

export interface BotReplyResult {
  replyText: string;
  matchedService?: RtpsService;
  matchedCategory?: RtpsCategory;
  suggestedServices?: RtpsService[];
  keyboard: BotKeyboardState;
  actionType:
    | 'command_start'
    | 'command_help'
    | 'select_category'
    | 'back_to_categories'
    | 'all_services'
    | 'service_details'
    | 'fuzzy_suggestions'
    | 'not_found';
}

export const NAV_BACK_BUTTON = '⬅️ Back to Categories';
export const NAV_ALL_SERVICES_BUTTON = '📋 All Services List';
export const NAV_HELP_BUTTON = '❓ Help & Commands';

/**
 * Builds the Telegram ReplyKeyboardMarkup rows (shown under the typing panel)
 */
export function buildMainCategoryKeyboard(categories: RtpsCategory[]): BotKeyboardState {
  const rows: string[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    const pair = [categories[i].label];
    if (i + 1 < categories.length) {
      pair.push(categories[i + 1].label);
    }
    rows.push(pair);
  }
  rows.push([NAV_ALL_SERVICES_BUTTON, NAV_HELP_BUTTON]);

  return {
    mode: 'main_categories',
    activeCategoryId: null,
    activeCategoryLabel: null,
    placeholder: 'Choose a category below or type e.g. "cast certificate"...',
    rows
  };
}

export function buildCategoryServicesKeyboard(
  category: RtpsCategory,
  services: RtpsService[]
): BotKeyboardState {
  const categoryServices = services.filter((s) => s.category === category.id);
  const rows: string[][] = [];

  for (let i = 0; i < categoryServices.length; i += 2) {
    const pair = [categoryServices[i].buttonLabel];
    if (i + 1 < categoryServices.length) {
      pair.push(categoryServices[i + 1].buttonLabel);
    }
    rows.push(pair);
  }

  rows.push([NAV_BACK_BUTTON, NAV_HELP_BUTTON]);

  return {
    mode: 'category_services',
    activeCategoryId: category.id,
    activeCategoryLabel: category.label,
    placeholder: `Select ${category.shortTitle} or type any service name...`,
    rows
  };
}

/**
 * Formats the detailed RTPS document & verification checklist for a matched service
 */
export function formatServiceReply(service: RtpsService): string {
  const docsList = service.documentsRequired
    .map((doc, idx) => `${idx + 1}. ${doc}`)
    .join('\n');

  const verificationsList = service.verificationsRequired
    .map((ver) => `• ${ver}`)
    .join('\n');

  const notesList =
    service.importantNotes.length > 0
      ? `\n\n⚠️ *Important Cyber Cafe / Applicant Notes:*\n` +
        service.importantNotes.map((n) => `• ${n}`).join('\n')
      : '';

  return (
    `🏛️ *${service.name} (${service.hindiName})*\n` +
    `Service Code: \`${service.code}\` · Portal: \`${service.portalName}\`\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `📄 *REQUIRED DOCUMENTS (आवश्यक दस्तावेज):*\n${docsList}\n\n` +
    `✅ *VERIFICATION PROCESS (सत्यापन प्रक्रिया):*\n${verificationsList}\n\n` +
    `⏱️ *Official Timeline:* ${service.timelineDays}\n` +
    `✍️ *Issuing Authority:* ${service.issuingAuthority}\n` +
    `💳 *Govt Portal Fee:* ${service.govtFee}` +
    notesList
  );
}

/**
 * Normalizes user text for search matching (strips emojis, punctuation, extra spaces)
 */
export function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches services by exact button match, exact name, keyword inclusion, or token overlap
 * Specifically handles common spellings like "cast certificate" -> Caste Certificate.
 */
export function findMatchingServices(
  rawInput: string,
  services: RtpsService[]
): { exact: RtpsService | null; suggestions: RtpsService[] } {
  const trimmed = rawInput.trim();
  if (!trimmed) return { exact: null, suggestions: [] };

  // 1. Exact button label match
  const buttonMatch = services.find(
    (s) => s.buttonLabel.toLowerCase() === trimmed.toLowerCase()
  );
  if (buttonMatch) {
    return { exact: buttonMatch, suggestions: [buttonMatch] };
  }

  const norm = normalizeQuery(trimmed);
  if (!norm) return { exact: null, suggestions: [] };

  // 2. Direct name, Hindi name, code, or exact keyword match
  for (const service of services) {
    const normName = normalizeQuery(service.name);
    const normButton = normalizeQuery(service.buttonLabel);
    if (
      norm === normName ||
      norm === normButton ||
      norm === service.code.toLowerCase() ||
      service.hindiName.includes(trimmed)
    ) {
      return { exact: service, suggestions: [service] };
    }

    for (const kw of service.keywords) {
      const normKw = normalizeQuery(kw);
      if (norm === normKw) {
        return { exact: service, suggestions: [service] };
      }
    }
  }

  // 3. Score each service based on keyword containment and token matching
  // (e.g. "cast certificate", "apply for cast certificate", "documents for niwas")
  const stopWords = new Set([
    'for',
    'apply',
    'how',
    'to',
    'what',
    'documents',
    'document',
    'need',
    'needed',
    'verification',
    'form',
    'in',
    'bihar',
    'rtps',
    'ka',
    'ke',
    'liye',
    'kya',
    'chahiye'
  ]);

  const queryTokens = norm
    .split(' ')
    .filter((t) => t.length > 1 && !stopWords.has(t));

  // Normalize common synonyms/typos like "cast" -> "caste"
  const synonymMap: Record<string, string> = {
    cast: 'caste',
    jati: 'caste',
    jaati: 'caste',
    niwas: 'residential',
    nivas: 'residential',
    awasiya: 'residential',
    aawasiya: 'residential',
    domicile: 'residential',
    aay: 'income',
    rashan: 'ration',
    rashion: 'ration',
    vridha: 'vridhjan',
    budhapa: 'vridhjan',
    acharan: 'character',
    aacharan: 'character',
    charitra: 'character',
    janam: 'birth',
    janm: 'birth',
    mrityu: 'death',
    maran: 'death',
    dakhil: 'mutation',
    kharij: 'mutation'
  };

  const expandedTokens = queryTokens.map((t) => synonymMap[t] || t);

  const scored: { service: RtpsService; score: number }[] = [];

  for (const service of services) {
    let score = 0;
    const normName = normalizeQuery(service.name);
    const allKeywords = service.keywords.map(normalizeQuery);

    // Check if full normalized query is a substring of any keyword or vice-versa
    for (const kw of allKeywords) {
      if (norm.includes(kw) && kw.length >= 3) {
        score += 50 + kw.length;
      } else if (kw.includes(norm) && norm.length >= 3) {
        score += 40;
      }
    }

    if (normName.includes(norm) && norm.length >= 3) {
      score += 45;
    }

    // Check token matches
    for (let i = 0; i < queryTokens.length; i++) {
      const rawTok = queryTokens[i];
      const expTok = expandedTokens[i];
      if (rawTok === 'certificate' || rawTok === 'praman' || rawTok === 'patra') {
        // Generic word gets small boost only if combined with another match
        if (normName.includes('certificate')) score += 3;
        continue;
      }

      if (
        normName.includes(rawTok) ||
        normName.includes(expTok) ||
        allKeywords.some((k) => k.includes(rawTok) || k.includes(expTok))
      ) {
        score += 25;
      }
    }

    if (score > 0) {
      scored.push({ service, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { exact: null, suggestions: [] };
  }

  // If top result has a strong score (>= 20), return it as exact match
  if (scored[0].score >= 20) {
    return {
      exact: scored[0].service,
      suggestions: scored.slice(0, 4).map((s) => s.service)
    };
  }

  return {
    exact: null,
    suggestions: scored.slice(0, 4).map((s) => s.service)
  };
}

/**
 * Main message processor for the RTPS Telegram Bot
 */
export function processBotMessage(
  rawText: string,
  categories: RtpsCategory[],
  services: RtpsService[],
  currentKeyboard?: BotKeyboardState
): BotReplyResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const mainKeyboard = buildMainCategoryKeyboard(categories);
  const activeKeyboard = currentKeyboard || mainKeyboard;

  // 1. Handle /start or main menu commands
  if (
    lower === '/start' ||
    lower.startsWith('/start ') ||
    lower === 'start' ||
    text === NAV_BACK_BUTTON ||
    lower === 'main menu' ||
    lower === '🏠 main menu' ||
    lower === 'back'
  ) {
    const isStart = lower.startsWith('/start') || lower === 'start';
    const categoryLines = categories
      .map((c) => `• *${c.label}* — ${c.description}`)
      .join('\n');

    const replyText = isStart
      ? `🙏 *Welcome to RTPS & ServicePlus Cyber Assistant Bot!*\n\n` +
        `Choose any **Category Button** from the menu panel below the typing bar, or **type the name of any service** directly (for example: \`cast certificate\`, \`income certificate\`, \`niwas\`, \`obc ncl\`, \`ration card\`, \`lpc\`).\n\n` +
        `📂 *Available Service Categories:*\n${categoryLines}\n\n` +
        `💡 *Commands:* Use \`/start\` for the main menu or \`/help\` for instructions.`
      : `📂 *Main Menu — Select an RTPS Service Category:*\n\nChoose a category from the keyboard buttons below the typing panel, or type any service name directly:`;

    return {
      replyText,
      keyboard: mainKeyboard,
      actionType: isStart ? 'command_start' : 'back_to_categories'
    };
  }

  // 2. Handle /help or Help button
  if (
    lower === '/help' ||
    lower.startsWith('/help ') ||
    text === NAV_HELP_BUTTON ||
    lower === 'help'
  ) {
    const sampleKeywords = [
      '`cast certificate` (जाति प्रमाण पत्र)',
      '`residential certificate` or `niwas` (निवास प्रमाण पत्र)',
      '`income certificate` (आय प्रमाण पत्र)',
      '`obc ncl` or `ews certificate`',
      '`new ration card` (नया राशन कार्ड)',
      '`lpc` or `land mutation` (दाखिल-खारिज)',
      '`vridhjan pension` (वृद्धजन पेंशन)',
      '`birth certificate` or `death certificate`'
    ].join('\n• ');

    const replyText =
      `❓ *RTPS Assistant Bot — Help & Usage Guide*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*How to check Documents & Verifications:*\n` +
      `1️⃣ *Using Menu Buttons (Under Typing Bar):* Tap any category button below the typing box to view services in that department, then tap the service name.\n\n` +
      `2️⃣ *By Typing Service Name Directly:* Type the service name in English or Hinglish and send. Example queries you can type right now:\n• ${sampleKeywords}\n\n` +
      `*Bot Commands:*\n` +
      `• \`/start\` — Reset menu & show all RTPS category buttons\n` +
      `• \`/help\` — Show this help guide and example service names`;

    return {
      replyText,
      keyboard: activeKeyboard,
      actionType: 'command_help'
    };
  }

  // 3. Handle "All Services List" button
  if (text === NAV_ALL_SERVICES_BUTTON || lower === 'all services') {
    const grouped = categories
      .map((cat) => {
        const catServices = services.filter((s) => s.category === cat.id);
        const lines = catServices
          .map((s) => `   ▫️ *${s.name}* (${s.hindiName})`)
          .join('\n');
        return `${cat.label}\n${lines}`;
      })
      .join('\n\n');

    return {
      replyText:
        `📋 *Complete RTPS Service Directory (${services.length} Services)*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n${grouped}\n\n` +
        `👇 *Tap a category below or type any service name (e.g. "cast certificate") for full document & verification details:*`,
      keyboard: mainKeyboard,
      actionType: 'all_services'
    };
  }

  // 4. Check if user clicked/typed a Category button
  const matchedCat = categories.find(
    (c) =>
      c.label.toLowerCase() === lower ||
      c.shortTitle.toLowerCase() === lower ||
      c.id.toLowerCase() === lower
  );

  if (matchedCat) {
    const catServices = services.filter((s) => s.category === matchedCat.id);
    const serviceBullets = catServices
      .map((s) => `• *${s.buttonLabel}* — ${s.hindiName} (\`${s.timelineDays}\`)`)
      .join('\n');

    const nextKeyboard = buildCategoryServicesKeyboard(matchedCat, services);

    return {
      replyText:
        `${matchedCat.label}\n` +
        `_${matchedCat.description}_\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${serviceBullets}\n\n` +
        `👇 *Tap a service button in the menu under the typing bar to see required documents & verification steps:*`,
      matchedCategory: matchedCat,
      keyboard: nextKeyboard,
      actionType: 'select_category'
    };
  }

  // 5. Search for matching RTPS Service (exact button or typed name like "cast certificate")
  const { exact, suggestions } = findMatchingServices(text, services);

  if (exact) {
    const serviceCategory = categories.find((c) => c.id === exact.category);
    const nextKeyboard = serviceCategory
      ? buildCategoryServicesKeyboard(serviceCategory, services)
      : activeKeyboard;

    return {
      replyText: formatServiceReply(exact),
      matchedService: exact,
      matchedCategory: serviceCategory,
      keyboard: nextKeyboard,
      actionType: 'service_details'
    };
  }

  if (suggestions.length > 0) {
    const listText = suggestions
      .map((s) => `• \`${s.name}\` (${s.hindiName})`)
      .join('\n');
    return {
      replyText:
        `🔍 Did you mean one of these RTPS services?\n\n${listText}\n\n` +
        `Type the service name or select a category button from the keyboard below.`,
      suggestedServices: suggestions,
      keyboard: activeKeyboard,
      actionType: 'fuzzy_suggestions'
    };
  }

  return {
    replyText:
      `⚠️ Could not find an RTPS service matching *"${text}"*.\n\n` +
      `Try typing:\n` +
      `• \`cast certificate\` (जाति प्रमाण पत्र)\n` +
      `• \`residential certificate\` (निवास प्रमाण पत्र)\n` +
      `• \`income certificate\` (आय प्रमाण पत्र)\n` +
      `• \`ration card\` or \`lpc\`\n\n` +
      `Or tap any category button below the typing box:`,
    keyboard: mainKeyboard,
    actionType: 'not_found'
  };
}

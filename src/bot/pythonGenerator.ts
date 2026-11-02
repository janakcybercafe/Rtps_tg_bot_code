import { RtpsCategory, RtpsService } from './rtpsData';

export function generatePythonBotCode(
  categories: RtpsCategory[],
  services: RtpsService[],
  framework: 'python-telegram-bot' | 'aiogram' = 'python-telegram-bot'
): string {
  const categoriesJson = JSON.stringify(categories, null, 4);
  const servicesJson = JSON.stringify(services, null, 4);

  if (framework === 'aiogram') {
    return `#!/usr/bin/env python3
"""
RTPS & ServicePlus Cyber Cafe Assistant — Standard Telegram Bot API (aiogram v3)
Requires ONLY BOT_TOKEN in environment variables (No MTProto API_ID/API_HASH needed).
Features:
- Persistent ReplyKeyboardMarkup menu buttons under the typing panel
- /start and /help commands
- Category navigation & instant fuzzy lookup (e.g. "cast certificate", "niwas", "income")
"""

import os
import re
import asyncio
import logging
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton, BotCommand
from aiogram.filters import CommandStart, Command
from aiogram.enums import ParseMode

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

BOT_TOKEN = os.environ.get("BOT_TOKEN", "").strip()
if not BOT_TOKEN:
    raise RuntimeError("Missing BOT_TOKEN environment variable! Export BOT_TOKEN='your_botfather_token'")

CATEGORIES = ${categoriesJson}

SERVICES = ${servicesJson}

NAV_BACK = "⬅️ Back to Categories"
NAV_ALL = "📋 All Services List"
NAV_HELP = "❓ Help & Commands"


def build_main_keyboard() -> ReplyKeyboardMarkup:
    rows = []
    for i in range(0, len(CATEGORIES), 2):
        pair = [KeyboardButton(text=CATEGORIES[i]["label"])]
        if i + 1 < len(CATEGORIES):
            pair.append(KeyboardButton(text=CATEGORIES[i + 1]["label"]))
        rows.append(pair)
    rows.append([KeyboardButton(text=NAV_ALL), KeyboardButton(text=NAV_HELP)])
    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        is_persistent=True,
        input_field_placeholder='Choose category or type e.g. "cast certificate"...'
    )


def build_category_keyboard(category_id: str, short_title: str) -> ReplyKeyboardMarkup:
    cat_services = [s for s in SERVICES if s["category"] == category_id]
    rows = []
    for i in range(0, len(cat_services), 2):
        pair = [KeyboardButton(text=cat_services[i]["buttonLabel"])]
        if i + 1 < len(cat_services):
            pair.append(KeyboardButton(text=cat_services[i + 1]["buttonLabel"]))
        rows.append(pair)
    rows.append([KeyboardButton(text=NAV_BACK), KeyboardButton(text=NAV_HELP)])
    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        is_persistent=True,
        input_field_placeholder=f"Select {short_title} or type service name..."
    )


def normalize_query(text: str) -> str:
    cleaned = re.sub(r"[^\\w\\s-]", " ", text.lower())
    return re.sub(r"\\s+", " ", cleaned).strip()


SYNONYMS = {
    "cast": "caste",
    "jati": "caste",
    "jaati": "caste",
    "niwas": "residential",
    "nivas": "residential",
    "awasiya": "residential",
    "domicile": "residential",
    "aay": "income",
    "rashan": "ration",
    "rashion": "ration",
    "vridha": "vridhjan",
    "acharan": "character",
    "janam": "birth",
    "mrityu": "death",
    "dakhil": "mutation",
}


def find_matching_service(raw_text: str):
    trimmed = raw_text.strip()
    for s in SERVICES:
        if s["buttonLabel"].lower() == trimmed.lower():
            return s

    norm = normalize_query(trimmed)
    if not norm:
        return None

    for s in SERVICES:
        if norm in (normalize_query(s["name"]), normalize_query(s["buttonLabel"]), s["code"].lower()):
            return s
        for kw in s["keywords"]:
            if norm == normalize_query(kw):
                return s

    tokens = [SYNONYMS.get(t, t) for t in norm.split() if len(t) > 1]
    best_service = None
    best_score = 0

    for s in SERVICES:
        score = 0
        norm_name = normalize_query(s["name"])
        norm_kws = [normalize_query(k) for k in s["keywords"]]
        for kw in norm_kws:
            if len(kw) >= 3 and (kw in norm or norm in kw):
                score += 45
        for tok in tokens:
            if tok in ("certificate", "praman", "patra"):
                continue
            if tok in norm_name or any(tok in k for k in norm_kws):
                score += 25
        if score > best_score:
            best_score = score
            best_service = s

    return best_service if best_score >= 20 else None


def format_service_reply(s: dict) -> str:
    docs = "\\n".join(f"{i+1}. {d}" for i, d in enumerate(s["documentsRequired"]))
    vers = "\\n".join(f"• {v}" for v in s["verificationsRequired"])
    notes = ""
    if s.get("importantNotes"):
        notes = "\\n\\n⚠️ *Important Notes:*\\n" + "\\n".join(f"• {n}" for n in s["importantNotes"])

    return (
        f"🏛️ *{s['name']} ({s['hindiName']})*\\n"
        f"Service Code: \`{s['code']}\` · Portal: \`{s['portalName']}\`\\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\\n\\n"
        f"📄 *REQUIRED DOCUMENTS (आवश्यक दस्तावेज):*\\n{docs}\\n\\n"
        f"✅ *VERIFICATION PROCESS (सत्यापन प्रक्रिया):*\\n{vers}\\n\\n"
        f"⏱️ *Official Timeline:* {s['timelineDays']}\\n"
        f"✍️ *Issuing Authority:* {s['issuingAuthority']}\\n"
        f"💳 *Govt Portal Fee:* {s['govtFee']}"
        f"{notes}"
    )


dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: Message):
    cat_lines = "\\n".join(f"• *{c['label']}* — {c['description']}" for c in CATEGORIES)
    text = (
        "🙏 *Welcome to RTPS & ServicePlus Assistant Bot!*\\n\\n"
        "Choose a **Category Button** from the menu under the typing panel, or **type any service name** "
        "(e.g. \`cast certificate\`, \`income certificate\`, \`niwas\`, \`ration card\`).\\n\\n"
        f"📂 *Service Categories:*\\n{cat_lines}"
    )
    await message.answer(text, parse_mode=ParseMode.MARKDOWN, reply_markup=build_main_keyboard())


@dp.message(Command("help"))
async def cmd_help(message: Message):
    text = (
        "❓ *RTPS Bot Help & Commands*\\n"
        "━━━━━━━━━━━━━━━━━━━━━━\\n"
        "1️⃣ Tap any category button below the typing box to browse services.\\n"
        "2️⃣ Or directly type a service name like \`cast certificate\`, \`niwas\`, \`income\`, \`obc ncl\`, \`lpc\`.\\n\\n"
        "• \`/start\` — Show main category menu\\n"
        "• \`/help\` — Show this help guide"
    )
    await message.answer(text, parse_mode=ParseMode.MARKDOWN, reply_markup=build_main_keyboard())


@dp.message(F.text)
async def handle_text(message: Message):
    text = (message.text or "").strip()
    if text == NAV_BACK:
        await message.answer("📂 *Main Menu — Select a Category:*", parse_mode=ParseMode.MARKDOWN, reply_markup=build_main_keyboard())
        return
    if text == NAV_HELP:
        await cmd_help(message)
        return
    if text == NAV_ALL:
        lines = []
        for c in CATEGORIES:
            items = "\\n".join(f"  ▫️ {s['name']} ({s['hindiName']})" for s in SERVICES if s["category"] == c["id"])
            lines.append(f"*{c['label']}*\\n{items}")
        await message.answer("\\n\\n".join(lines), parse_mode=ParseMode.MARKDOWN, reply_markup=build_main_keyboard())
        return

    for c in CATEGORIES:
        if text.lower() in (c["label"].lower(), c["shortTitle"].lower()):
            cat_services = [s for s in SERVICES if s["category"] == c["id"]]
            bullets = "\\n".join(f"• *{s['buttonLabel']}* — {s['hindiName']}" for s in cat_services)
            await message.answer(
                f"*{c['label']}*\\n\\n{bullets}\\n\\n👇 *Select a service from the bottom menu:*",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=build_category_keyboard(c["id"], c["shortTitle"])
            )
            return

    matched = find_matching_service(text)
    if matched:
        await message.answer(format_service_reply(matched), parse_mode=ParseMode.MARKDOWN)
        return

    await message.answer(
        f"⚠️ Service not found for *{text}*. Try typing \`cast certificate\`, \`income\`, \`niwas\`, or use the menu buttons below.",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_keyboard()
    )


async def main():
    bot = Bot(token=BOT_TOKEN)
    await bot.set_my_commands([
        BotCommand(command="start", description="Open RTPS Category Menu"),
        BotCommand(command="help", description="How to search RTPS services"),
    ])
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
`;
  }

  return `#!/usr/bin/env python3
"""
RTPS & ServicePlus Cyber Cafe Assistant — Standard Telegram Bot API
Library: python-telegram-bot v21+ (Async)
Auth: Uses ONLY BOT_TOKEN in environment variables (No MTProto API_ID/API_HASH needed).

Features:
1. Persistent Bottom Menu Keyboard (ReplyKeyboardMarkup under the typing panel)
2. Commands: /start and /help
3. Category drill-down buttons + Direct text/fuzzy search (e.g. "cast certificate")
4. Instant reply with Required Documents, Verification Steps, Official Timeline & Portal
"""

import os
import re
import logging
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, BotCommand
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Only requires standard BotFather token in environment variable
BOT_TOKEN = os.environ.get("BOT_TOKEN", "").strip()

CATEGORIES = ${categoriesJson}

SERVICES = ${servicesJson}

NAV_BACK_BUTTON = "⬅️ Back to Categories"
NAV_ALL_SERVICES_BUTTON = "📋 All Services List"
NAV_HELP_BUTTON = "❓ Help & Commands"

SYNONYM_MAP = {
    "cast": "caste",
    "jati": "caste",
    "jaati": "caste",
    "niwas": "residential",
    "nivas": "residential",
    "awasiya": "residential",
    "aawasiya": "residential",
    "domicile": "residential",
    "aay": "income",
    "rashan": "ration",
    "rashion": "ration",
    "vridha": "vridhjan",
    "budhapa": "vridhjan",
    "acharan": "character",
    "aacharan": "character",
    "charitra": "character",
    "janam": "birth",
    "janm": "birth",
    "mrityu": "death",
    "maran": "death",
    "dakhil": "mutation",
    "kharij": "mutation",
}


def build_main_category_keyboard() -> ReplyKeyboardMarkup:
    """Builds persistent menu buttons shown directly under the Telegram typing bar."""
    rows = []
    for i in range(0, len(CATEGORIES), 2):
        row = [KeyboardButton(CATEGORIES[i]["label"])]
        if i + 1 < len(CATEGORIES):
            row.append(KeyboardButton(CATEGORIES[i + 1]["label"]))
        rows.append(row)
    rows.append([KeyboardButton(NAV_ALL_SERVICES_BUTTON), KeyboardButton(NAV_HELP_BUTTON)])
    return ReplyKeyboardMarkup(
        rows,
        resize_keyboard=True,
        is_persistent=True,
        input_field_placeholder='Choose category or type e.g. "cast certificate"...',
    )


def build_category_services_keyboard(category: dict) -> ReplyKeyboardMarkup:
    """Builds persistent service buttons for a chosen RTPS category."""
    cat_services = [s for s in SERVICES if s["category"] == category["id"]]
    rows = []
    for i in range(0, len(cat_services), 2):
        row = [KeyboardButton(cat_services[i]["buttonLabel"])]
        if i + 1 < len(cat_services):
            row.append(KeyboardButton(cat_services[i + 1]["buttonLabel"]))
        rows.append(row)
    rows.append([KeyboardButton(NAV_BACK_BUTTON), KeyboardButton(NAV_HELP_BUTTON)])
    return ReplyKeyboardMarkup(
        rows,
        resize_keyboard=True,
        is_persistent=True,
        input_field_placeholder=f"Select {category['shortTitle']} or type service name...",
    )


def normalize_query(text: str) -> str:
    cleaned = re.sub(r"[^\\w\\s-]", " ", text.lower())
    return re.sub(r"\\s+", " ", cleaned).strip()


def find_matching_service(raw_input: str):
    trimmed = raw_input.strip()
    if not trimmed:
        return None

    # 1. Exact button label match
    for service in SERVICES:
        if service["buttonLabel"].lower() == trimmed.lower():
            return service

    norm = normalize_query(trimmed)
    if not norm:
        return None

    # 2. Direct name or keyword match
    for service in SERVICES:
        if norm in (
            normalize_query(service["name"]),
            normalize_query(service["buttonLabel"]),
            service["code"].lower(),
        ):
            return service
        for kw in service["keywords"]:
            if norm == normalize_query(kw):
                return service

    # 3. Token & typo-tolerant scoring (handles "cast certificate", "apply for niwas", etc.)
    stop_words = {"for", "apply", "how", "to", "what", "documents", "document", "need", "form", "in"}
    tokens = [t for t in norm.split() if len(t) > 1 and t not in stop_words]
    expanded_tokens = [SYNONYM_MAP.get(t, t) for t in tokens]

    best_match = None
    best_score = 0

    for service in SERVICES:
        score = 0
        norm_name = normalize_query(service["name"])
        all_kws = [normalize_query(k) for k in service["keywords"]]

        for kw in all_kws:
            if len(kw) >= 3 and kw in norm:
                score += 50 + len(kw)
            elif len(norm) >= 3 and norm in kw:
                score += 40

        for raw_tok, exp_tok in zip(tokens, expanded_tokens):
            if raw_tok in ("certificate", "praman", "patra"):
                if "certificate" in norm_name:
                    score += 3
                continue
            if (
                raw_tok in norm_name
                or exp_tok in norm_name
                or any(raw_tok in k or exp_tok in k for k in all_kws)
            ):
                score += 25

        if score > best_score:
            best_score = score
            best_match = service

    return best_match if best_score >= 20 else None


def format_service_reply(service: dict) -> str:
    docs_list = "\\n".join(
        f"{idx + 1}. {doc}" for idx, doc in enumerate(service["documentsRequired"])
    )
    ver_list = "\\n".join(f"• {ver}" for ver in service["verificationsRequired"])
    notes = ""
    if service.get("importantNotes"):
        notes = "\\n\\n⚠️ *Important Notes:*\\n" + "\\n".join(
            f"• {n}" for n in service["importantNotes"]
        )

    return (
        f"🏛️ *{service['name']} ({service['hindiName']})*\\n"
        f"Service Code: \`{service['code']}\` · Portal: \`{service['portalName']}\`\\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\\n\\n"
        f"📄 *REQUIRED DOCUMENTS (आवश्यक दस्तावेज):*\\n{docs_list}\\n\\n"
        f"✅ *VERIFICATION PROCESS (सत्यापन प्रक्रिया):*\\n{ver_list}\\n\\n"
        f"⏱️ *Official Timeline:* {service['timelineDays']}\\n"
        f"✍️ *Issuing Authority:* {service['issuingAuthority']}\\n"
        f"💳 *Govt Portal Fee:* {service['govtFee']}"
        f"{notes}"
    )


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    category_lines = "\\n".join(
        f"• *{c['label']}* — {c['description']}" for c in CATEGORIES
    )
    welcome_text = (
        "🙏 *Welcome to RTPS & ServicePlus Cyber Assistant Bot!*\\n\\n"
        "Choose any **Category Button** from the menu panel below the typing bar, "
        "or **type the name of any service** directly (for example: \`cast certificate\`, "
        "\`income certificate\`, \`niwas\`, \`obc ncl\`, \`ration card\`, \`lpc\`).\\n\\n"
        f"📂 *Available Service Categories:*\\n{category_lines}\\n\\n"
        "💡 *Commands:* Use \`/start\` for main menu or \`/help\` for instructions."
    )
    await update.message.reply_text(
        welcome_text,
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_category_keyboard(),
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    help_text = (
        "❓ *RTPS Assistant Bot — Help & Usage Guide*\\n"
        "━━━━━━━━━━━━━━━━━━━━━━\\n\\n"
        "*How to check Documents & Verifications:*\\n"
        "1️⃣ *Using Menu Buttons (Under Typing Bar):* Tap any category button below the typing box "
        "to view services in that department, then tap the service name.\\n\\n"
        "2️⃣ *By Typing Service Name Directly:* Type the service name and send:\\n"
        "• \`cast certificate\` (जाति प्रमाण पत्र)\\n"
        "• \`residential certificate\` or \`niwas\` (निवास प्रमाण पत्र)\\n"
        "• \`income certificate\` (आय प्रमाण पत्र)\\n"
        "• \`obc ncl\` or \`ews certificate\`\\n"
        "• \`new ration card\` or \`lpc\`\\n\\n"
        "*Bot Commands:*\\n"
        "• \`/start\` — Reset menu & show all RTPS category buttons\\n"
        "• \`/help\` — Show this help guide"
    )
    await update.message.reply_text(
        help_text,
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_category_keyboard(),
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.text:
        return

    text = update.message.text.strip()
    lower = text.lower()

    # Navigation buttons
    if text == NAV_BACK_BUTTON or lower in ("back", "main menu"):
        await update.message.reply_text(
            "📂 *Main Menu — Select an RTPS Service Category:*",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=build_main_category_keyboard(),
        )
        return

    if text == NAV_HELP_BUTTON or lower == "help":
        await help_command(update, context)
        return

    if text == NAV_ALL_SERVICES_BUTTON or lower == "all services":
        sections = []
        for cat in CATEGORIES:
            cat_services = [s for s in SERVICES if s["category"] == cat["id"]]
            lines = "\\n".join(
                f"   ▫️ *{s['name']}* ({s['hindiName']})" for s in cat_services
            )
            sections.append(f"{cat['label']}\\n{lines}")
        reply = (
            f"📋 *Complete RTPS Service Directory ({len(SERVICES)} Services)*\\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\\n\\n" + "\\n\\n".join(sections)
        )
        await update.message.reply_text(
            reply,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=build_main_category_keyboard(),
        )
        return

    # Category selection
    for cat in CATEGORIES:
        if lower in (cat["label"].lower(), cat["shortTitle"].lower(), cat["id"].lower()):
            cat_services = [s for s in SERVICES if s["category"] == cat["id"]]
            bullets = "\\n".join(
                f"• *{s['buttonLabel']}* — {s['hindiName']} (\`{s['timelineDays']}\`)"
                for s in cat_services
            )
            await update.message.reply_text(
                f"{cat['label']}\\n_{cat['description']}_\\n"
                f"━━━━━━━━━━━━━━━━━━━━━━\\n\\n{bullets}\\n\\n"
                f"👇 *Tap a service button in the menu under the typing bar:*",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=build_category_services_keyboard(cat),
            )
            return

    # Service match (button click or typed query like "cast certificate")
    matched = find_matching_service(text)
    if matched:
        cat = next((c for c in CATEGORIES if c["id"] == matched["category"]), None)
        kb = build_category_services_keyboard(cat) if cat else build_main_category_keyboard()
        await update.message.reply_text(
            format_service_reply(matched),
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=kb,
        )
        return

    await update.message.reply_text(
        f"⚠️ Could not find an RTPS service matching *\\"{text}\\"*.\\n\\n"
        "Try typing \`cast certificate\`, \`residential certificate\`, \`income certificate\`, "
        "\`ration card\`, or tap a category button below:",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_category_keyboard(),
    )


async def post_init(application: Application) -> None:
    """Registers /start and /help in the Telegram command menu button."""
    await application.bot.set_my_commands(
        [
            BotCommand("start", "Start bot & show RTPS category menu buttons"),
            BotCommand("help", "Show instructions & supported RTPS services"),
        ]
    )


def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError(
            "BOT_TOKEN environment variable is not set! "
            "Run: export BOT_TOKEN='123456:ABC-DEF...' && python bot.py"
        )

    app = Application.builder().token(BOT_TOKEN).post_init(post_init).build()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("RTPS Bot started polling (Standard Bot API Mode)...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
`;
}

export function generateDeploymentFiles(framework: 'python-telegram-bot' | 'aiogram') {
  const requirementsTxt =
    framework === 'aiogram'
      ? `aiogram>=3.13.0\npython-dotenv>=1.0.1\n`
      : `python-telegram-bot>=21.6\npython-dotenv>=1.0.1\n`;

  const dockerfile = `FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY bot.py .

# Pass BOT_TOKEN via environment variable in Hostinger / Render / Koyeb / Docker
CMD ["python", "bot.py"]
`;

  const dockerCompose = `services:
  rtps-telegram-bot:
    build: .
    container_name: rtps_cyber_bot
    restart: unless-stopped
    environment:
      - BOT_TOKEN=\${BOT_TOKEN}
`;

  return { requirementsTxt, dockerfile, dockerCompose };
}

#!/usr/bin/env python3
"""
RTPS & ServicePlus Cyber Cafe Assistant — Standard Telegram Bot API
Library: python-telegram-bot v21+ (Async)
Auth: Uses ONLY BOT_TOKEN in environment variables (No MTProto API_ID/API_HASH needed).

How to run:
  pip install "python-telegram-bot>=21.6"
  export BOT_TOKEN="your_bot_token_from_botfather"
  python bot.py
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

BOT_TOKEN = os.environ.get("BOT_TOKEN", "").strip()

CATEGORIES = [
    {
        "id": "general_cert",
        "label": "📜 General Certificates",
        "shortTitle": "General Certificates",
        "description": "Caste, Residential (Domicile), Income, OBC/EBC NCL, EWS & Character Certificates",
    },
    {
        "id": "revenue_land",
        "label": "🌾 Revenue & Land (Bhumi)",
        "shortTitle": "Revenue & Land",
        "description": "LPC (Land Possession), Dakhil-Kharij (Mutation) & Parimarjan Plus",
    },
    {
        "id": "ration_food",
        "label": "🪪 Ration & Food Supply",
        "shortTitle": "Ration & Food Supply",
        "description": "New Ration Card (Form Ka), Member Addition/Deletion (Form Kha)",
    },
    {
        "id": "social_pension",
        "label": "👵 Social Welfare & Pension",
        "shortTitle": "Social Welfare & Pension",
        "description": "Vridhjan Pension, Widow Pension & Disability Social Security Schemes",
    },
    {
        "id": "birth_municipal",
        "label": "🏥 Birth, Death & Panchayat",
        "shortTitle": "Birth, Death & Panchayat",
        "description": "Birth Registration, Death Certificate & Marriage Registration",
    },
]

SERVICES = [
    {
        "id": "caste_certificate",
        "code": "RTPS-GAD-01",
        "name": "Caste Certificate",
        "hindiName": "जाति प्रमाण पत्र",
        "category": "general_cert",
        "buttonLabel": "📜 Caste Certificate",
        "keywords": ["cast certificate", "caste certificate", "cast", "caste", "jati", "jaati", "jati praman patra"],
        "documentsRequired": [
            "Applicant Aadhaar Card (आवेदक का आधार कार्ड)",
            "Self-Declaration Affidavit / स्व-घोषणा पत्र (Form-XI signed by applicant)",
            "Father / Ancestor Land Record (खतियान / जमीन की रसीद) showing caste, OR Father Caste Certificate",
            "Voter ID / Ration Card / Electricity Bill for address proof",
            "Passport-size photograph",
            "For Married Women: Father-side proof (Mayka Khatiyan/Father Caste Certificate)",
        ],
        "verificationsRequired": [
            "Step 1 — OTP / Aadhaar Demographic Verification during online submission on ServicePlus",
            "Step 2 — Halka Karamchari (हल्का कर्मचारी) field/record verification of Khatiyan & lineage",
            "Step 3 — Circle Inspector (CI) / Revenue Officer (RO / अंचल अधिकारी) digital signature approval",
            "Step 4 — If applying for SDO / DM level: RO-issued Caste Certificate is mandatory first",
        ],
        "timelineDays": "10 Working Days",
        "issuingAuthority": "Revenue Officer (RO) / Circle Officer (CO) -> SDO -> DM",
        "govtFee": "₹0 (Free on ServicePlus Portal)",
        "portalName": "serviceonline.bihar.gov.in",
    },
    {
        "id": "residential_certificate",
        "code": "RTPS-GAD-02",
        "name": "Residential / Domicile Certificate",
        "hindiName": "निवास / आवासीय प्रमाण पत्र",
        "category": "general_cert",
        "buttonLabel": "🏠 Residential Certificate",
        "keywords": ["residential certificate", "residence certificate", "domicile", "niwas", "nivas", "awasiya"],
        "documentsRequired": [
            "Applicant Aadhaar Card (आधार कार्ड)",
            "Signed Self-Declaration Form (स्व-घोषणा पत्र)",
            "Voter ID Card / Ration Card / Electricity Bill / Land Tax Receipt",
            "Passport-size photograph of applicant",
        ],
        "verificationsRequired": [
            "Step 1 — Online portal submission & SMS reference number generation",
            "Step 2 — Halka Karamchari verification of permanent residence in the Ward / Panchayat",
            "Step 3 — Revenue Officer (RO) digital approval and QR-coded certificate issuance",
        ],
        "timelineDays": "10 Working Days",
        "issuingAuthority": "Revenue Officer (RO) / Circle Officer (CO)",
        "govtFee": "₹0 (Free on Official RTPS Portal)",
        "portalName": "serviceonline.bihar.gov.in",
    },
    {
        "id": "income_certificate",
        "code": "RTPS-GAD-03",
        "name": "Income Certificate",
        "hindiName": "आय प्रमाण पत्र",
        "category": "general_cert",
        "buttonLabel": "💰 Income Certificate",
        "keywords": ["income certificate", "income", "aay", "aay praman patra"],
        "documentsRequired": [
            "Applicant Aadhaar Card (आधार कार्ड)",
            "Self-Declaration Form (स्व-घोषणा पत्र) stating annual family income",
            "Recent Land Revenue Receipt (लगान रसीद) if agricultural income is mentioned",
            "Salary Slip / Form-16 / ITR (if salaried)",
            "Passport-size photograph",
        ],
        "verificationsRequired": [
            "Step 1 — Halka Karamchari assessment of family annual income (Agriculture + Business + Salary)",
            "Step 2 — Revenue Officer (RO) digital signature approval",
        ],
        "timelineDays": "10 Working Days",
        "issuingAuthority": "Revenue Officer (RO) / Circle Officer (CO)",
        "govtFee": "₹0 (Free on Official RTPS Portal)",
        "portalName": "serviceonline.bihar.gov.in",
    },
]

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
    "domicile": "residential",
    "aay": "income",
}


def build_main_category_keyboard() -> ReplyKeyboardMarkup:
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
    cleaned = re.sub(r"[^\w\s-]", " ", text.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def find_matching_service(raw_input: str):
    trimmed = raw_input.strip()
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
    tokens = [SYNONYM_MAP.get(t, t) for t in norm.split() if len(t) > 1]
    for s in SERVICES:
        norm_name = normalize_query(s["name"])
        for tok in tokens:
            if tok != "certificate" and tok in norm_name:
                return s
    return None


def format_service_reply(service: dict) -> str:
    docs_list = "\n".join(f"{idx + 1}. {doc}" for idx, doc in enumerate(service["documentsRequired"]))
    ver_list = "\n".join(f"• {ver}" for ver in service["verificationsRequired"])
    return (
        f"🏛️ *{service['name']} ({service['hindiName']})*\n"
        f"Service Code: `{service['code']}` · Portal: `{service['portalName']}`\n"
        f"━━━━━━━━━━━━━━━━━━━━━━\n\n"
        f"📄 *REQUIRED DOCUMENTS (आवश्यक दस्तावेज):*\n{docs_list}\n\n"
        f"✅ *VERIFICATION PROCESS (सत्यापन प्रक्रिया):*\n{ver_list}\n\n"
        f"⏱️ *Official Timeline:* {service['timelineDays']}\n"
        f"✍️ *Issuing Authority:* {service['issuingAuthority']}\n"
        f"💳 *Govt Portal Fee:* {service['govtFee']}"
    )


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "🙏 *Welcome to RTPS & ServicePlus Cyber Assistant Bot!*\n\n"
        "Choose a **Category Button** below the typing bar, or type any service name like `cast certificate`.",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_category_keyboard(),
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "❓ *RTPS Assistant Bot — Help*\n"
        "• Tap a category button under the typing panel or type a service name like `cast certificate`.\n"
        "• `/start` — Main category menu\n"
        "• `/help` — Show help guide",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_category_keyboard(),
    )


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.text:
        return
    text = update.message.text.strip()
    if text == NAV_BACK_BUTTON:
        await start_command(update, context)
        return
    if text == NAV_HELP_BUTTON:
        await help_command(update, context)
        return
    for cat in CATEGORIES:
        if text.lower() in (cat["label"].lower(), cat["shortTitle"].lower()):
            await update.message.reply_text(
                f"*{cat['label']}*\n👇 Tap a service button below the typing panel:",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=build_category_services_keyboard(cat),
            )
            return
    matched = find_matching_service(text)
    if matched:
        await update.message.reply_text(
            format_service_reply(matched),
            parse_mode=ParseMode.MARKDOWN,
        )
        return
    await update.message.reply_text(
        "Try typing `cast certificate`, `residential certificate`, or `income certificate`, or use the buttons below.",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=build_main_category_keyboard(),
    )


async def post_init(application: Application) -> None:
    await application.bot.set_my_commands([
        BotCommand("start", "Start bot & show RTPS category menu buttons"),
        BotCommand("help", "Show instructions & supported RTPS services"),
    ])


def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError("Set BOT_TOKEN environment variable first!")
    app = Application.builder().token(BOT_TOKEN).post_init(post_init).build()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()

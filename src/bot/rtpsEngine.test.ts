import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_CATEGORIES, INITIAL_SERVICES } from './rtpsData';
import {
  buildMainCategoryKeyboard,
  findMatchingServices,
  processBotMessage,
  NAV_BACK_BUTTON
} from './rtpsEngine';
import { generatePythonBotCode } from './pythonGenerator';

test('/start command returns welcome text and persistent main category ReplyKeyboardMarkup', () => {
  const res = processBotMessage('/start', INITIAL_CATEGORIES, INITIAL_SERVICES);
  assert.equal(res.actionType, 'command_start');
  assert.equal(res.keyboard.mode, 'main_categories');
  assert.ok(res.replyText.includes('Welcome to RTPS'));
  assert.ok(res.keyboard.rows.length >= 3);
  assert.equal(res.keyboard.rows[0][0], '📜 General Certificates');
});

test('/help command returns usage guide and commands', () => {
  const res = processBotMessage('/help', INITIAL_CATEGORIES, INITIAL_SERVICES);
  assert.equal(res.actionType, 'command_help');
  assert.ok(res.replyText.includes('/start'));
  assert.ok(res.replyText.includes('/help'));
  assert.ok(res.replyText.includes('cast certificate'));
});

test('selecting a category updates bottom keyboard to show services in that category', () => {
  const res = processBotMessage(
    '📜 General Certificates',
    INITIAL_CATEGORIES,
    INITIAL_SERVICES
  );
  assert.equal(res.actionType, 'select_category');
  assert.equal(res.keyboard.mode, 'category_services');
  assert.equal(res.keyboard.activeCategoryId, 'general_cert');
  const flatButtons = res.keyboard.rows.flat();
  assert.ok(flatButtons.includes('📜 Caste Certificate'));
  assert.ok(flatButtons.includes('🏠 Residential Certificate'));
  assert.ok(flatButtons.includes('💰 Income Certificate'));
  assert.ok(flatButtons.includes(NAV_BACK_BUTTON));
});

test('typing "cast certificate" instantly replies with required documents and verification steps', () => {
  const res = processBotMessage('cast certificate', INITIAL_CATEGORIES, INITIAL_SERVICES);
  assert.equal(res.actionType, 'service_details');
  assert.ok(res.matchedService);
  assert.equal(res.matchedService.id, 'caste_certificate');
  assert.ok(res.replyText.includes('Caste Certificate'));
  assert.ok(res.replyText.includes('REQUIRED DOCUMENTS'));
  assert.ok(res.replyText.includes('VERIFICATION PROCESS'));
  assert.ok(res.replyText.includes('Halka Karamchari'));
  assert.ok(res.replyText.includes('Aadhaar Card'));
});

test('fuzzy search matches Hindi/Hinglish terms like niwas, aay, ration card, and lpc', () => {
  const niwas = findMatchingServices('niwas praman patra', INITIAL_SERVICES);
  assert.equal(niwas.exact?.id, 'residential_certificate');

  const income = findMatchingServices('apply for income certificate', INITIAL_SERVICES);
  assert.equal(income.exact?.id, 'income_certificate');

  const ration = findMatchingServices('new rashan card', INITIAL_SERVICES);
  assert.equal(ration.exact?.id, 'new_ration_card');

  const lpc = findMatchingServices('lpc', INITIAL_SERVICES);
  assert.equal(lpc.exact?.id, 'lpc_certificate');
});

test('generated Python code includes BOT_TOKEN env var, ReplyKeyboardMarkup, /start, and /help', () => {
  const ptbCode = generatePythonBotCode(
    INITIAL_CATEGORIES,
    INITIAL_SERVICES,
    'python-telegram-bot'
  );
  assert.ok(ptbCode.includes('os.environ.get("BOT_TOKEN"'));
  assert.ok(ptbCode.includes('ReplyKeyboardMarkup'));
  assert.ok(ptbCode.includes('is_persistent=True'));
  assert.ok(ptbCode.includes('CommandHandler("start"'));
  assert.ok(ptbCode.includes('CommandHandler("help"'));
});

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  RtpsCategory,
  RtpsService
} from './src/bot/rtpsData';
import { processBotMessage, BotKeyboardState } from './src/bot/rtpsEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

let activeCategories: RtpsCategory[] = [...INITIAL_CATEGORIES];
let activeServices: RtpsService[] = [...INITIAL_SERVICES];
const chatKeyboardMemory = new Map<number, BotKeyboardState>();

interface LiveBotRuntimeStatus {
  configured: boolean;
  connected: boolean;
  botUsername: string | null;
  botFirstName: string | null;
  processedMessagesCount: number;
  lastError: string | null;
}

const botStatus: LiveBotRuntimeStatus = {
  configured: false,
  connected: false,
  botUsername: null,
  botFirstName: null,
  processedMessagesCount: 0,
  lastError: null
};

async function startTelegramPolling() {
  const token = (process.env.BOT_TOKEN || '').trim();
  if (!token || token === 'MY_BOT_TOKEN' || token === '""') {
    botStatus.configured = false;
    botStatus.connected = false;
    return;
  }

  botStatus.configured = true;
  const apiBase = `https://api.telegram.org/bot${token}`;

  try {
    // 1. Verify token with getMe
    const meRes = await fetch(`${apiBase}/getMe`);
    const meData = (await meRes.json()) as {
      ok: boolean;
      result?: { username?: string; first_name?: string };
      description?: string;
    };

    if (!meData.ok || !meData.result) {
      botStatus.connected = false;
      botStatus.lastError = meData.description || 'Invalid BOT_TOKEN';
      return;
    }

    botStatus.connected = true;
    botStatus.botUsername = meData.result.username || null;
    botStatus.botFirstName = meData.result.first_name || 'RTPS Bot';
    botStatus.lastError = null;

    // 2. Register /start and /help commands
    await fetch(`${apiBase}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: 'Open RTPS Category Menu' },
          { command: 'help', description: 'How to search RTPS services' }
        ]
      })
    });

    // Delete any existing webhook so getUpdates polling works
    await fetch(`${apiBase}/deleteWebhook`);

    // 3. Long-polling loop
    let offset = 0;
    const poll = async () => {
      while (botStatus.connected) {
        try {
          const res = await fetch(
            `${apiBase}/getUpdates?offset=${offset}&timeout=25`,
            { signal: AbortSignal.timeout(30000) }
          );
          const data = (await res.json()) as {
            ok: boolean;
            result?: Array<{
              update_id: number;
              message?: {
                chat: { id: number };
                text?: string;
              };
            }>;
          };

          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              offset = update.update_id + 1;
              const msg = update.message;
              if (msg && msg.text && msg.chat?.id) {
                const chatId = msg.chat.id;
                const prevKb = chatKeyboardMemory.get(chatId);
                const reply = processBotMessage(
                  msg.text,
                  activeCategories,
                  activeServices,
                  prevKb
                );
                chatKeyboardMemory.set(chatId, reply.keyboard);
                botStatus.processedMessagesCount += 1;

                const replyMarkup = {
                  keyboard: reply.keyboard.rows.map((row) =>
                    row.map((btnText) => ({ text: btnText }))
                  ),
                  resize_keyboard: true,
                  is_persistent: true,
                  input_field_placeholder: reply.keyboard.placeholder
                };

                await fetch(`${apiBase}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: reply.replyText,
                    parse_mode: 'Markdown',
                    reply_markup: replyMarkup
                  })
                });
              }
            }
          }
        } catch {
          // Wait briefly on transient network timeout before next poll
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    };

    poll();
  } catch (err) {
    botStatus.connected = false;
    botStatus.lastError =
      err instanceof Error ? err.message : 'Failed to connect to Telegram API';
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/bot-status', (_req, res) => {
    res.json(botStatus);
  });

  app.post('/api/sync-services', (req, res) => {
    if (Array.isArray(req.body?.services) && req.body.services.length > 0) {
      activeServices = req.body.services;
    }
    res.json({ ok: true, count: activeServices.length });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    startTelegramPolling();
  });
}

startServer();

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Keyboard,
  RotateCcw,
  CheckSquare,
  Square,
  FileText,
  ShieldCheck,
  Clock,
  ChevronRight,
  Search
} from 'lucide-react';
import { RtpsCategory, RtpsService } from '../bot/rtpsData';
import {
  BotKeyboardState,
  buildMainCategoryKeyboard,
  processBotMessage
} from '../bot/rtpsEngine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedServiceId?: string;
}

interface TelegramSimulatorProps {
  categories: RtpsCategory[];
  services: RtpsService[];
  onNavigateToCode: () => void;
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Renders Telegram-like Markdown (*bold*, _italic_, `code`) cleanly
 */
function renderFormattedMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|_[^_]+_)/g);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return (
              <strong key={partIdx} className="font-semibold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return (
              <strong key={partIdx} className="font-semibold text-slate-900">
                {part.slice(1, -1)}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
              <code
                key={partIdx}
                className="font-mono text-xs bg-slate-100 text-sky-800 px-1.5 py-0.5 rounded border border-slate-200"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
            return (
              <em key={partIdx} className="italic text-slate-600">
                {part.slice(1, -1)}
              </em>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({
  categories,
  services,
  onNavigateToCode
}) => {
  const initialStart = processBotMessage('/start', categories, services);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-user-start',
      sender: 'user',
      text: '/start',
      timestamp: '09:30 AM'
    },
    {
      id: 'init-bot-start',
      sender: 'bot',
      text: initialStart.replyText,
      timestamp: '09:30 AM'
    }
  ]);

  const [keyboardState, setKeyboardState] = useState<BotKeyboardState>(() =>
    buildMainCategoryKeyboard(categories)
  );
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [activeService, setActiveService] = useState<RtpsService>(
    () => services.find((s) => s.id === 'caste_certificate') || services[0]
  );
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Keep activeService synced if services list changes
  useEffect(() => {
    if (activeService) {
      const updated = services.find((s) => s.id === activeService.id);
      if (updated) setActiveService(updated);
    }
  }, [services, activeService]);

  const sendUserMessage = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'user',
      text: trimmed,
      timestamp: formatTime()
    };

    const result = processBotMessage(trimmed, categories, services, keyboardState);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: 'bot',
      text: result.replyText,
      timestamp: formatTime(),
      matchedServiceId: result.matchedService?.id
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setKeyboardState(result.keyboard);
    setIsKeyboardOpen(true);

    if (result.matchedService) {
      setActiveService(result.matchedService);
      setCheckedDocs({});
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendUserMessage(inputText);
    setInputText('');
  };

  const handleResetChat = () => {
    const freshStart = processBotMessage('/start', categories, services);
    setMessages([
      {
        id: `user-reset-${Date.now()}`,
        sender: 'user',
        text: '/start',
        timestamp: formatTime()
      },
      {
        id: `bot-reset-${Date.now()}`,
        sender: 'bot',
        text: freshStart.replyText,
        timestamp: formatTime()
      }
    ]);
    setKeyboardState(freshStart.keyboard);
    setIsKeyboardOpen(true);
  };

  const toggleDocCheck = (docIndex: number) => {
    const key = `${activeService.id}-${docIndex}`;
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = activeService
    ? activeService.documentsRequired.filter(
        (_, idx) => checkedDocs[`${activeService.id}-${idx}`]
      ).length
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left / Center Column: Live Telegram Bot Simulator with ReplyKeyboardMarkup under typing bar */}
      <div className="lg:col-span-7 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Telegram Bot Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
              RT
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">
                RTPS & ServicePlus Cyber Assistant
              </h2>
              <p className="text-xs text-slate-300 truncate">
                bot · Standard Bot API (BOT_TOKEN) · ReplyKeyboardMarkup Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => sendUserMessage('/start')}
              className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-slate-700 transition-colors whitespace-nowrap shrink-0"
              aria-label="Send /start command"
            >
              /start
            </button>
            <button
              type="button"
              onClick={() => sendUserMessage('/help')}
              className="px-2.5 py-1.5 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-slate-700 transition-colors whitespace-nowrap shrink-0"
              aria-label="Send /help command"
            >
              /help
            </button>
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              aria-label="Reset Telegram Chat"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Test Query Strip */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 mr-1 whitespace-nowrap shrink-0">
            Instant test queries:
          </span>
          {[
            'cast certificate',
            'residential certificate',
            'income certificate',
            'obc ncl',
            'new ration card',
            'lpc'
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => sendUserMessage(sample)}
              className="px-2 py-0.5 text-xs font-mono text-slate-700 bg-white hover:bg-sky-50 hover:text-sky-700 border border-slate-200 rounded transition-colors whitespace-nowrap shrink-0"
            >
              "{sample}"
            </button>
          ))}
        </div>

        {/* Telegram Chat Message Thread */}
        <div
          ref={chatContainerRef}
          data-testid="telegram-chat-thread"
          className="h-[370px] overflow-y-auto p-4 space-y-3 bg-[#e2e8f0]/60"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed border ${
                    isUser
                      ? 'bg-sky-700 text-white border-sky-800 rounded-br-xs'
                      : 'bg-white text-slate-800 border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className={isUser ? 'text-white font-medium' : 'text-slate-800'}>
                    {isUser ? msg.text : renderFormattedMessage(msg.text)}
                  </div>
                  <div
                    className={`mt-1.5 text-[11px] font-mono tabular-nums text-right ${
                      isUser ? 'text-sky-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Typing Panel (Input Bar) */}
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-slate-200"
        >
          <button
            type="button"
            onClick={() => sendUserMessage('/help')}
            className="px-2.5 py-2 text-xs font-mono font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title="Bot Commands (/start, /help)"
            aria-label="Run /help command"
          >
            / Menu
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={keyboardState.placeholder}
            aria-label="Message input or RTPS service name"
            className="flex-1 min-w-0 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
          />

          <button
            type="button"
            onClick={() => setIsKeyboardOpen((prev) => !prev)}
            aria-label={
              isKeyboardOpen ? 'Hide bottom menu buttons' : 'Show bottom menu buttons'
            }
            aria-expanded={isKeyboardOpen}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              isKeyboardOpen
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle Persistent Reply Keyboard Under Typing Panel"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            type="submit"
            aria-label="Send message"
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Persistent ReplyKeyboardMarkup Menu Panel UNDER the Typing Panel */}
        {isKeyboardOpen && (
          <div
            data-testid="reply-keyboard-panel"
            className="bg-slate-100 border-t border-slate-200 p-2.5 select-none"
          >
            <div className="flex items-center justify-between px-1 pb-2 text-xs text-slate-500">
              <span>
                Telegram ReplyKeyboardMarkup (Under Typing Panel) ·{' '}
                <strong className="font-medium text-slate-700">
                  {keyboardState.mode === 'main_categories'
                    ? 'Main Categories Menu'
                    : `Category: ${keyboardState.activeCategoryLabel}`}
                </strong>
              </span>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                is_persistent=True
              </span>
            </div>

            <div className="space-y-1.5">
              {keyboardState.rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`
                  }}
                >
                  {row.map((btnLabel) => {
                    const isBackOrNav =
                      btnLabel === '⬅️ Back to Categories' ||
                      btnLabel === '📋 All Services List' ||
                      btnLabel === '❓ Help & Commands';
                    return (
                      <button
                        key={btnLabel}
                        type="button"
                        onClick={() => sendUserMessage(btnLabel)}
                        className={`px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors text-center truncate ${
                          isBackOrNav
                            ? 'bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border-slate-300'
                            : 'bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-900 border-slate-200/90 shadow-2xs'
                        }`}
                      >
                        {btnLabel}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Instant Service Document & Verification Checklist Inspector */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Service Quick-Selector Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Operator Document & Verification Desk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Interactive checklist synced with the bot's last queried RTPS service
              </p>
            </div>
          </div>

          <label
            htmlFor="quick-service-select"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Jump to Any RTPS Service ({services.length} Configured):
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="quick-service-select"
                value={activeService?.id || ''}
                onChange={(e) => {
                  const found = services.find((s) => s.id === e.target.value);
                  if (found) {
                    setActiveService(found);
                    setCheckedDocs({});
                    sendUserMessage(found.buttonLabel);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.label}>
                    {services
                      .filter((s) => s.category === cat.id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.hindiName})
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Service Detailed Checklist Card */}
        {activeService && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="text-xs text-slate-500 font-mono tabular-nums flex flex-wrap items-center gap-1.5">
                <span>{activeService.code}</span>
                <span aria-hidden="true">·</span>
                <span>{activeService.portalName}</span>
                <span aria-hidden="true">·</span>
                <span>{activeService.govtFee}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {activeService.name}
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                {activeService.hindiName}
              </p>
            </div>

            {/* Required Documents with interactive verification checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-700" />
                  Required Documents Checklist
                </span>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {checkedCount}/{activeService.documentsRequired.length} verified
                </span>
              </div>
              <ul className="space-y-2">
                {activeService.documentsRequired.map((doc, idx) => {
                  const isChecked = !!checkedDocs[`${activeService.id}-${idx}`];
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleDocCheck(idx)}
                        className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg border text-xs leading-relaxed transition-colors ${
                          isChecked
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                            : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span>{doc}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Verification Stages */}
            <div>
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                Official Verification & Approval Flow
              </h4>
              <ol className="space-y-2 text-xs text-slate-700">
                {activeService.verificationsRequired.map((step, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 leading-relaxed"
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Timeline & Authority Metadata */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Timeline: <strong className="text-slate-900">{activeService.timelineDays}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={onNavigateToCode}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap shrink-0"
              >
                <span>Get Python Bot Code</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  RtpsCategory,
  RtpsService
} from './bot/rtpsData';
import { generatePythonBotCode } from './bot/pythonGenerator';
import { TelegramSimulator } from './components/TelegramSimulator';
import { ServiceDirectoryView } from './components/ServiceDirectoryView';
import { PythonCodeExportView } from './components/PythonCodeExportView';

type ActiveTab = 'simulator' | 'directory' | 'python_code';

const STORAGE_KEY = 'rtps_bot_services_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [categories] = useState<RtpsCategory[]>(INITIAL_CATEGORIES);
  const [services, setServices] = useState<RtpsService[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_SERVICES;
  });

  const [botLiveInfo, setBotLiveInfo] = useState<{
    configured: boolean;
    connected: boolean;
    botUsername: string | null;
  }>({ configured: false, connected: false, botUsername: null });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch {
      // ignore storage errors
    }
    fetch('/api/sync-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services })
    }).catch(() => {});
  }, [services]);

  useEffect(() => {
    fetch('/api/bot-status')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.configured === 'boolean') {
          setBotLiveInfo({
            configured: data.configured,
            connected: !!data.connected,
            botUsername: data.botUsername || null
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAddService = (newSrv: RtpsService) => {
    setServices((prev) => [newSrv, ...prev]);
  };

  const handleUpdateService = (updatedSrv: RtpsService) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedSrv.id ? updatedSrv : s))
    );
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleDownloadBotPy = () => {
    const code = generatePythonBotCode(
      categories,
      services,
      'python-telegram-bot'
    );
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bot.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('simulator');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            RTPS Bot Studio
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Primary Workspace Navigation"
            className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'simulator'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Telegram Simulator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'directory'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              RTPS Services ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('python_code')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'python_code'
                  ? 'border-sky-700 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Python Code & Deploy
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleDownloadBotPy}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download bot.py</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Contextual Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-2">
              <span>Standard Telegram Bot API</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">BOT_TOKEN Only</span>
              <span aria-hidden="true">·</span>
              <span>Persistent Bottom Menu Buttons (ReplyKeyboardMarkup)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              {activeTab === 'simulator' &&
                'RTPS ServicePlus Telegram Bot & Menu Simulator'}
              {activeTab === 'directory' &&
                'RTPS Services, Documents & Verification Database'}
              {activeTab === 'python_code' &&
                'Ready-to-Run Python Bot Code & Hostinger Docker Setup'}
            </h1>
          </div>

          <div className="text-xs text-slate-600 font-mono tabular-nums flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span>
              {botLiveInfo.connected && botLiveInfo.botUsername
                ? `Live Telegram: @${botLiveInfo.botUsername}`
                : 'Simulator Active (Set BOT_TOKEN in Secrets for Live Telegram)'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{categories.length} Categories</span>
            <span aria-hidden="true">·</span>
            <span>{services.length} RTPS Services</span>
          </div>
        </div>

        {/* Active View */}
        {activeTab === 'simulator' && (
          <TelegramSimulator
            categories={categories}
            services={services}
            onNavigateToCode={() => setActiveTab('python_code')}
          />
        )}

        {activeTab === 'directory' && (
          <ServiceDirectoryView
            categories={categories}
            services={services}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
          />
        )}

        {activeTab === 'python_code' && (
          <PythonCodeExportView categories={categories} services={services} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            RTPS Bot Studio · Designed for Standard Telegram Bot API (BOT_TOKEN)
          </span>
          <span>
            Supports /start · /help · Persistent ReplyKeyboardMarkup · Fuzzy Service Search
          </span>
        </div>
      </footer>
    </div>
  );
}

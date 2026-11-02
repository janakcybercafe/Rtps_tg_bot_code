import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FileCode } from 'lucide-react';
import { RtpsCategory, RtpsService } from '../bot/rtpsData';
import {
  generateDeploymentFiles,
  generatePythonBotCode
} from '../bot/pythonGenerator';

interface PythonCodeExportViewProps {
  categories: RtpsCategory[];
  services: RtpsService[];
}

type CodeFileTab = 'bot.py' | 'requirements.txt' | 'Dockerfile' | 'docker-compose.yml';

export const PythonCodeExportView: React.FC<PythonCodeExportViewProps> = ({
  categories,
  services
}) => {
  const [framework, setFramework] = useState<'python-telegram-bot' | 'aiogram'>(
    'python-telegram-bot'
  );
  const [activeFile, setActiveFile] = useState<CodeFileTab>('bot.py');
  const [copied, setCopied] = useState<boolean>(false);

  const botPyContent = generatePythonBotCode(categories, services, framework);
  const { requirementsTxt, dockerfile, dockerCompose } =
    generateDeploymentFiles(framework);

  const fileContentsMap: Record<CodeFileTab, string> = {
    'bot.py': botPyContent,
    'requirements.txt': requirementsTxt,
    Dockerfile: dockerfile,
    'docker-compose.yml': dockerCompose
  };

  const currentCode = fileContentsMap[activeFile];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = currentCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Deployment Instructions & Environment Setup */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Standard Bot API Setup (BOT_TOKEN Only)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This Python bot uses Telegram's official HTTP Bot API. It requires only{' '}
              <code className="font-mono text-sky-800 bg-slate-100 px-1 py-0.5 rounded">
                BOT_TOKEN
              </code>{' '}
              in your environment variables—no MTProto phone login or API hashes.
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Python Library:
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFramework('python-telegram-bot')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  framework === 'python-telegram-bot'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                python-telegram-bot
              </button>
              <button
                type="button"
                onClick={() => setFramework('aiogram')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  framework === 'aiogram'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                aiogram v3 (Async)
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-sky-700" />
              <span>Run in 3 Steps (Local / Hostinger / Render)</span>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 font-medium">
                01. Install dependencies:
              </p>
              <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                pip install -r requirements.txt
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 font-medium">
                02. Set BOT_TOKEN from @BotFather:
              </p>
              <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                export BOT_TOKEN="123456789:AAF_your_token_here"
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 font-medium">
                03. Start the RTPS Bot:
              </p>
              <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                python bot.py
              </pre>
            </div>
          </div>
        </div>

        {/* Summary of Embedded Features */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-600">
          <h4 className="font-semibold text-slate-900 text-sm">
            Included in Generated Code
          </h4>
          <p>
            • <strong className="text-slate-800">{categories.length} Categories</strong>{' '}
            rendered in a 2-column persistent <code className="font-mono">ReplyKeyboardMarkup</code>{' '}
            under the Telegram typing bar
          </p>
          <p>
            • <strong className="text-slate-800">{services.length} RTPS Services</strong>{' '}
            with full Hindi/English document checklists & verification steps
          </p>
          <p>
            • Built-in <code className="font-mono">/start</code> and{' '}
            <code className="font-mono">/help</code> command handlers registered with{' '}
            <code className="font-mono">set_my_commands</code>
          </p>
          <p>
            • Typo-tolerant query matching (e.g., typing{' '}
            <code className="font-mono">"cast certificate"</code> or{' '}
            <code className="font-mono">"niwas"</code> works automatically)
          </p>
        </div>
      </div>

      {/* Right Column: Code Viewer & Downloader */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1">
            {(
              ['bot.py', 'requirements.txt', 'Dockerfile', 'docker-compose.yml'] as CodeFileTab[]
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFile(tab)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeFile === tab
                    ? 'bg-sky-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{tab}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy {activeFile}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDownload(activeFile, currentCode)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeFile}</span>
            </button>
          </div>
        </div>

        <pre
          data-testid="python-code-preview"
          className="p-4 text-xs font-mono text-slate-100 overflow-x-auto max-h-[620px] leading-relaxed"
        >
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
};

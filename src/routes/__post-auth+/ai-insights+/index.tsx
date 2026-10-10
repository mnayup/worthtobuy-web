import React from 'react';
import {
  MessageSquarePlus,
  FileText,
  LoaderCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import { api } from '~/lib/api';
import { PageHeader } from '~/components/PageHeader';
import { Toast } from '~/components/Toast';
import { useAiInsights } from './hooks/use-ai-insights';
import {
  AssistantAvatar,
  ChatBubble,
  LoadingBubble,
} from './components/ai-chat-bubble';
import { ReportCard } from './components/ai-report-card';
import { PrintableReport } from './components/ai-printable-report';
import {
  AiStatusCards,
  AiFeatureHighlights,
} from './components/ai-status-cards';
import { AiChatHistory } from './components/ai-chat-history';

export async function loader() {
  const [statusRes, historyRes] = await Promise.allSettled([
    api.get('/ai/status'),
    api.get('/ai/history?limit=80'),
  ]);
  return {
    status: statusRes.status === 'fulfilled' ? statusRes.value.data : null,
    history: historyRes.status === 'fulfilled' ? historyRes.value.data.data || [] : [],
  };
}

export default function AiInsightsRoute() {
  const {
    user,
    status,
    conversationId,
    messages,
    question,
    setQuestion,
    loading,
    reportLoading,
    report,
    toast,
    setToast,
    messagesEndRef,
    suggestedQuestions,
    sessions,
    startNewChat,
    openSession,
    sendQuestion,
    generateReport,
  } = useAiInsights();

  return (
    <div className="animate-rise">
      <div className="no-print">
        <PageHeader
          title="WORTHTOBUY AI Assistant"
          description={
            'Inquire about revenue, pending orders, customers, products, and ' +
            'events using grounded business context with strict role access.'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-secondary !bg-white cursor-pointer"
                onClick={startNewChat}
              >
                <MessageSquarePlus size={17} /> New Chat
              </button>
              {user?.role !== 'ADMIN' && (
                <button
                  className="btn-primary cursor-pointer"
                  disabled={reportLoading || !status?.enabled}
                  onClick={generateReport}
                >
                  {reportLoading ? (
                    <LoaderCircle className="animate-spin" size={17} />
                  ) : (
                    <FileText size={17} />
                  )}
                  Generate Business Report
                </button>
              )}
            </div>
          }
        />

        <AiStatusCards status={status} userRole={user?.role} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="card flex min-h-[680px] flex-col overflow-hidden">
            <div
              className={
                'flex items-center justify-between gap-3 border-b ' +
                'border-brand-100 bg-brand-50/50 px-5 py-4'
              }
            >
              <div className="flex items-center gap-3">
                <AssistantAvatar />
                <div>
                  <h2 className="font-black text-brand-900">🤖 WORTHTOBUY AI</h2>
                  <p className="text-xs font-semibold text-brand-400">
                    Context is dynamically loaded by backend for query precision.
                  </p>
                </div>
              </div>
              <span
                className={
                  'hidden rounded-full bg-white px-3 py-1.5 text-[10px] ' +
                  'font-extrabold text-brand-500 sm:inline shadow-xs'
                }
              >
                {conversationId.slice(0, 8)}
              </span>
            </div>

            <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto bg-[#fffdfa] p-4 sm:p-5">
              {!messages.length && (
                <div className="mx-auto max-w-2xl py-8 text-center">
                  <div
                    className={
                      'mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] ' +
                      'bg-brand-900 text-white shadow-xl shadow-brand-900/20'
                    }
                  >
                    <Sparkles size={28} />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-brand-900">
                    Inquire About WORTHTOBUY Business
                  </h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-brand-500">
                    The assistant receives summarized relevant data matching your exact inquiry
                    and security clearance.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.map((item) => (
                      <button
                        key={item}
                        disabled={!status?.enabled}
                        onClick={() => sendQuestion(item)}
                        className={
                          'rounded-full border border-brand-200 bg-white px-3.5 py-2 ' +
                          'text-xs font-bold text-brand-700 transition hover:border-brand-400 ' +
                          'hover:bg-brand-50 disabled:opacity-50 shadow-xs cursor-pointer'
                        }
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {loading && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuestion();
              }}
              className="border-t border-brand-100 bg-white p-4 sm:p-5"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendQuestion();
                    }
                  }}
                  className="input min-h-[48px] max-h-36 resize-y"
                  placeholder="Ask a question about sales, inventory, orders, or finances..."
                  maxLength={1000}
                  autoFocus
                />
                <button
                  type="submit"
                  aria-label="Send inquiry"
                  disabled={!question.trim() || loading || !status?.enabled}
                  className="btn-primary h-12 w-12 shrink-0 !px-0 cursor-pointer"
                >
                  <Send size={18} />
                </button>
              </div>
              <div
                className={
                  'mt-2 flex items-center justify-between text-[10px] ' +
                  'font-semibold text-brand-400'
                }
              >
                <span>Press Enter to send • Shift+Enter for new line</span>
                <span>{question.length}/1000</span>
              </div>
            </form>
          </section>

          <AiChatHistory
            sessions={sessions}
            conversationId={conversationId}
            onOpenSession={openSession}
            onNewChat={startNewChat}
          />
        </div>

        {report && <ReportCard report={report} onPrint={() => window.print()} />}

        <AiFeatureHighlights />
      </div>

      {report && <PrintableReport report={report} />}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

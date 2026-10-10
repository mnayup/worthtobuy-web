import { useState, useEffect, useMemo, useRef } from 'react';
import { api, errorMessage } from '~/lib/api';
import { useAuth } from '~/context/AuthContext';
import type { AiStatus, ChatMessage, HistoryItem, WeeklyReport } from '../types';

export function newConversationId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `conversation-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function useAiInsights() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [conversationId, setConversationId] = useState<string>(newConversationId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedQuestions = useMemo(() => {
    if (user?.role === 'ADMIN') {
      return [
        'Which items are pending purchase?',
        'What are the most requested products?',
        'Who is the customer with highest volume?',
        'Which shipments have not been delivered yet?',
      ];
    }
    if (user?.role === 'FINANCE') {
      return [
        'What is this month’s total revenue?',
        'How many invoices have outstanding balance?',
        'What is the estimated net profit this month?',
        'Compare performance of this month with last month.',
      ];
    }
    return [
      'What is this month’s total revenue?',
      'What operational issues should be prioritized this week?',
      'Who are the top customers by spend?',
      'Which shopping period was most profitable?',
      'What products are most popular?',
    ];
  }, [user?.role]);

  const sessions = useMemo(() => {
    const grouped = new Map<string, HistoryItem>();
    for (const item of history) {
      if (item.conversationId && item.action === 'AI_CHAT' && !grouped.has(item.conversationId)) {
        grouped.set(item.conversationId, item);
      }
    }
    return [...grouped.values()].slice(0, 20);
  }, [history]);

  const refreshHistory = async () => {
    try {
      const response = await api.get('/ai/history?limit=80');
      setHistory(response.data.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    Promise.allSettled([
      api.get('/ai/status'),
      api.get('/ai/history?limit=80'),
    ])
      .then(([statusRes, historyRes]) => {
        if (statusRes.status === 'fulfilled') setStatus(statusRes.value.data);
        if (historyRes.status === 'fulfilled') {
          setHistory(historyRes.value.data.data || []);
        }
      })
      .catch((caught) => {
        setToast({ message: errorMessage(caught), type: 'error' });
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startNewChat = () => {
    setConversationId(newConversationId());
    setMessages([]);
    setReport(null);
    setQuestion('');
  };

  const openSession = async (sessionId: string) => {
    try {
      const enc = encodeURIComponent(sessionId);
      const response = await api.get(`/ai/history?conversationId=${enc}&limit=100`);
      const records = [...(response.data.data || [])].reverse() as HistoryItem[];
      const nextMessages: ChatMessage[] = [];

      for (const item of records) {
        if (item.action !== 'AI_CHAT' || !item.question || !item.answer) continue;
        nextMessages.push({
          id: `user-${item.id}`,
          role: 'user',
          text: item.question,
          generatedAt: item.generatedAt || item.createdAt,
        });
        nextMessages.push({
          id: `assistant-${item.id}`,
          role: 'assistant',
          text: item.answer,
          sources: item.sources || [],
          generatedAt: item.generatedAt || item.createdAt,
        });
      }
      setConversationId(sessionId);
      setMessages(nextMessages);
      setReport(null);
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    }
  };

  const sendQuestion = async (value?: string) => {
    const text = (value ?? question).trim();
    if (!text || loading || !status?.enabled) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      generatedAt: new Date().toISOString(),
    };
    setMessages((curr) => [...curr, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { question: text, conversationId });
      setConversationId(response.data.conversationId || conversationId);
      setMessages((curr) => [
        ...curr,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.data.answer,
          sources: response.data.sources,
          generatedAt: response.data.generatedAt,
        },
      ]);
      refreshHistory();
    } catch (caught) {
      const msg = errorMessage(caught);
      setToast({ message: msg, type: 'error' });
      setMessages((curr) => [
        ...curr,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: `Request could not be processed.\n\n${msg}`,
          generatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (reportLoading || !status?.enabled) return;
    setReportLoading(true);

    try {
      const response = await api.post('/ai/report', { conversationId });
      setReport(response.data.report);
      setConversationId(response.data.conversationId || conversationId);
      setMessages((curr) => [
        ...curr,
        {
          id: `report-${Date.now()}`,
          role: 'assistant',
          text: `Weekly Business Report successfully generated.\n\n` +
            response.data.report.executiveSummary,
          sources: response.data.sources,
          generatedAt: response.data.generatedAt,
        },
      ]);
      setToast({
        message: 'Weekly Business Report successfully created from real-time data.',
        type: 'success',
      });
      refreshHistory();
    } catch (caught) {
      setToast({ message: errorMessage(caught), type: 'error' });
    } finally {
      setReportLoading(false);
    }
  };

  return {
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
  };
}

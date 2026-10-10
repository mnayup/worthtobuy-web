import React from 'react';
import { History, MessageSquarePlus, Clock3, ShieldCheck } from 'lucide-react';
import { dateTime } from '~/lib/format';
import type { HistoryItem } from '../types';

interface AiChatHistoryProps {
  sessions: HistoryItem[];
  conversationId: string;
  onOpenSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export function AiChatHistory({
  sessions,
  conversationId,
  onOpenSession,
  onNewChat,
}: AiChatHistoryProps) {
  return (
    <aside className="card h-fit overflow-hidden xl:sticky xl:top-0">
      <div className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-4">
        <div className="flex items-center gap-2">
          <History size={17} className="text-brand-500" />
          <h2 className="font-black text-brand-900">Chat History</h2>
        </div>
        <button
          onClick={onNewChat}
          className="rounded-lg p-2 text-brand-400 hover:bg-brand-50 transition cursor-pointer"
          title="New Chat"
        >
          <MessageSquarePlus size={17} />
        </button>
      </div>

      <div className="scrollbar-thin max-h-[610px] overflow-y-auto p-2">
        {sessions.length ? (
          sessions.map((session) => (
            <button
              key={session.conversationId}
              onClick={() => onOpenSession(session.conversationId!)}
              className={
                'mb-1 block w-full rounded-xl px-3 py-3 text-left transition cursor-pointer ' +
                (session.conversationId === conversationId
                  ? 'bg-brand-900 text-white'
                  : 'hover:bg-brand-50')
              }
            >
              <p
                className={
                  'line-clamp-2 text-xs font-extrabold ' +
                  (session.conversationId === conversationId
                    ? 'text-white'
                    : 'text-brand-800')
                }
              >
                {session.question || 'AI Conversation'}
              </p>
              <div
                className={
                  'mt-2 flex items-center gap-1.5 text-[10px] font-semibold ' +
                  (session.conversationId === conversationId
                    ? 'text-white/65'
                    : 'text-brand-400')
                }
              >
                <Clock3 size={11} />
                {dateTime(session.generatedAt || session.createdAt)}
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <History className="mx-auto text-brand-200" />
            <p className="mt-3 text-xs font-bold text-brand-400">No chat history yet.</p>
          </div>
        )}
      </div>

      <div
        className={
          'border-t border-brand-100 bg-brand-50/60 px-4 py-3 ' +
          'text-[10px] leading-5 text-brand-500'
        }
      >
        <ShieldCheck className="mr-1 inline text-brand-600" size={12} />
        Audit records are sourced securely from your authorized user account.
      </div>
    </aside>
  );
}

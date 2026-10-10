import React from 'react';
import { Bot, UserRound } from 'lucide-react';
import { dateTime } from '~/lib/format';
import type { ChatMessage } from '../types';

export function sourceLabel(source: string) {
  return source.replaceAll('_', ' ').replace(/\b\w/g, (val) => val.toUpperCase());
}

export function AssistantAvatar() {
  return (
    <div
      className={
        'grid h-9 w-9 shrink-0 place-items-center rounded-2xl ' +
        'bg-brand-900 text-white shadow-lg shadow-brand-900/15'
      }
    >
      <Bot size={18} />
    </div>
  );
}

export function ChatBubble({ message }: { message: ChatMessage }) {
  const assistant = message.role === 'assistant';
  return (
    <div className={'flex items-start gap-3 ' + (assistant ? '' : 'flex-row-reverse')}>
      {assistant ? (
        <AssistantAvatar />
      ) : (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-cherry-500 text-white">
          <UserRound size={17} />
        </div>
      )}
      <div
        className={
          'max-w-[88%] rounded-[1.25rem] px-4 py-3.5 shadow-sm ' +
          (assistant
            ? 'rounded-tl-md border border-brand-100 bg-white text-brand-800'
            : 'rounded-tr-md bg-cherry-500 text-white')
        }
      >
        <div className="whitespace-pre-wrap text-sm leading-6">{message.text}</div>
        {assistant && Boolean(message.sources?.length) && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-100 pt-3">
            {message.sources?.map((source) => (
              <span
                key={source}
                className={
                  'rounded-full bg-brand-50 px-2.5 py-1 text-[10px] ' +
                  'font-extrabold uppercase tracking-wide text-brand-500'
                }
              >
                {sourceLabel(source)}
              </span>
            ))}
          </div>
        )}
        {message.generatedAt && (
          <p
            className={
              'mt-2 text-[10px] font-semibold ' +
              (assistant ? 'text-brand-300' : 'text-white/70')
            }
          >
            {dateTime(message.generatedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

export function LoadingBubble() {
  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div
        className={
          'flex items-center gap-1.5 rounded-[1.25rem] rounded-tl-md ' +
          'border border-brand-100 bg-white px-4 py-4 shadow-sm'
        }
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 animate-bounce rounded-full bg-brand-400"
            style={{ animationDelay: `${index * 140}ms` }}
          />
        ))}
        <span className="ml-2 text-xs font-bold text-brand-500">
          Generating insights from live business data...
        </span>
      </div>
    </div>
  );
}

import { CheckCircle2, Clock } from 'lucide-react';
import { dateTime } from '~/lib/format';

interface TrackingTimelineProps {
  timeline: any[];
}

export function TrackingTimeline({ timeline }: TrackingTimelineProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900 mb-6">
        <Clock size={20} className="text-rose-600" />
        <h3 className="text-lg font-black tracking-tight">Timeline Progress Belanja</h3>
      </div>

      <div
        className={
          'relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 ' +
          'before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200'
        }
      >
        {timeline.map((item: any) => {
          const isDone = item.isCompleted;
          const isCurrent = item.isCurrent;

          const dotClass = isCurrent
            ? 'bg-rose-600 text-white ring-4 ring-rose-100'
            : isDone
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-200 text-slate-400';

          const titleColor = isCurrent
            ? 'text-rose-600'
            : isDone
            ? 'text-slate-900'
            : 'text-slate-400';

          return (
            <div key={item.step} className="relative group">
              <div
                className={
                  'absolute -left-6 sm:-left-8 flex h-6 w-6 items-center ' +
                  `justify-center rounded-full transition ${dotClass}`
                }
              >
                {isDone ? (
                  <CheckCircle2 size={14} className="fill-white/20" />
                ) : (
                  <span className="text-[10px] font-black">{item.step}</span>
                )}
              </div>

              <div
                className={
                  'rounded-2xl border border-slate-100 bg-slate-50/50 p-4 ' +
                  'transition hover:bg-slate-50 hover:border-slate-200'
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black ${titleColor}`}>
                      {item.title}
                    </p>
                    {isCurrent && (
                      <span
                        className={
                          'rounded-full bg-rose-100 px-2 py-0.5 text-[9px] ' +
                          'font-black uppercase text-rose-700 animate-pulse'
                        }
                      >
                        PROSES SAAT INI
                      </span>
                    )}
                  </div>

                  {item.date && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {dateTime(item.date)}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

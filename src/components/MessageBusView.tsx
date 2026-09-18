import React, { useState, useMemo } from 'react';
import { Message } from '../types';
import { Radio, Search, ArrowRight, CornerDownRight } from 'lucide-react';

interface MessageBusViewProps {
  messages: Message[];
  onSelectAgent?: (agentId: string) => void;
}

export const MessageBusView: React.FC<MessageBusViewProps> = ({ messages, onSelectAgent }) => {
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredMessages = useMemo(() => {
    return messages
      .slice(-150)
      .reverse()
      .filter((m) => {
        const matchesTopic =
          topicFilter === "all" ||
          (topicFilter === "proposal" && m.topic.startsWith("proposal:")) ||
          (topicFilter === "accept" && m.topic.startsWith("accept:")) ||
          (topicFilter === "artifact" && m.topic.startsWith("artifact:"));

        const matchesSearch =
          search.trim() === "" ||
          m.sender.toLowerCase().includes(search.toLowerCase()) ||
          m.recipient.toLowerCase().includes(search.toLowerCase()) ||
          m.topic.toLowerCase().includes(search.toLowerCase()) ||
          JSON.stringify(m.content).toLowerCase().includes(search.toLowerCase());

        return matchesTopic && matchesSearch;
      });
  }, [messages, topicFilter, search]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          <h3 className="text-sm font-bold text-neutral-800">
            Live MessageBus Telemetry Stream
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            ({messages.length.toLocaleString()} total messages recorded)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 text-xs">
            {["all", "proposal", "accept", "artifact"].map((f) => (
              <button
                key={f}
                onClick={() => setTopicFilter(f)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                  topicFilter === f
                    ? "bg-white text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter stream..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 font-mono text-xs">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 italic">
            No messages matching the filter criteria.
          </div>
        ) : (
          filteredMessages.map((m, idx) => {
            let topicBadge = "bg-neutral-100 text-neutral-700";
            if (m.topic.startsWith("proposal:")) topicBadge = "bg-teal-100 text-teal-800 border-teal-200";
            else if (m.topic.startsWith("accept:")) topicBadge = "bg-blue-100 text-blue-800 border-blue-200";
            else if (m.topic.startsWith("artifact:")) topicBadge = "bg-purple-100 text-purple-800 border-purple-200";

            return (
              <div
                key={`${m.msg_id}-${idx}`}
                className="p-2 rounded-lg bg-neutral-50/70 hover:bg-neutral-100/70 border border-neutral-100 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-neutral-400 w-10">t={m.timestamp}</span>
                  <button
                    onClick={() => onSelectAgent?.(m.sender)}
                    className="font-bold text-neutral-800 hover:underline hover:text-neutral-950"
                  >
                    {m.sender}
                  </button>
                  <span className="text-neutral-300">➔</span>
                  <span
                    className={
                      m.recipient === "broadcast"
                        ? "text-neutral-400 italic"
                        : "text-neutral-700 font-semibold cursor-pointer hover:underline"
                    }
                    onClick={() => m.recipient !== "broadcast" && onSelectAgent?.(m.recipient)}
                  >
                    {m.recipient}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${topicBadge}`}>
                    {m.topic}
                  </span>
                </div>

                <div className="text-neutral-600 truncate max-w-sm text-[11px]">
                  {typeof m.content === "object"
                    ? JSON.stringify(m.content).slice(0, 80)
                    : String(m.content)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { SimulationStats } from '../types';
import { Users, Mail, Sparkles, Share2, Inbox, Send } from 'lucide-react';

interface MetricsBarProps {
  stats: SimulationStats;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 500 Agents */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Agents</span>
          <Users className="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <div className="font-mono text-xl font-bold text-neutral-900">500</div>
        <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center justify-between">
          <span>10 domains × 50</span>
          {stats.aiConnectedCount !== undefined && stats.aiConnectedCount > 0 && (
            <span className="text-purple-700 font-semibold font-mono text-[10px] bg-purple-50 px-1 rounded">
              {stats.aiConnectedCount} AI
            </span>
          )}
        </div>
      </div>

      {/* Total Messages */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Msgs</span>
          <Mail className="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <div className="font-mono text-xl font-bold text-neutral-900">
          {stats.totalMessages.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">Direct + Broadcast</div>
      </div>

      {/* Proposals Broadcast */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Proposals</span>
          <Send className="w-3.5 h-3.5 text-teal-600" />
        </div>
        <div className="font-mono text-xl font-bold text-teal-700">
          {stats.proposalsCount.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">Initial domain works</div>
      </div>

      {/* Cross-Domain Artifacts */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Artifacts</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="font-mono text-xl font-bold text-purple-700">
          {stats.artifactsCount.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">Synthesized creations</div>
      </div>

      {/* Collaboration Edges */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Collab Edges</span>
          <Share2 className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <div className="font-mono text-xl font-bold text-amber-800">
          {stats.uniqueEdgesCount.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">Agent-to-agent links</div>
      </div>

      {/* Pending in Queues */}
      <div className="bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between text-neutral-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
          <Inbox className="w-3.5 h-3.5 text-neutral-500" />
        </div>
        <div className="font-mono text-xl font-bold text-neutral-900">
          {stats.pendingQueueCount.toLocaleString()}
        </div>
        <div className="text-[11px] text-neutral-500 mt-0.5">In agent inboxes</div>
      </div>
    </div>
  );
};

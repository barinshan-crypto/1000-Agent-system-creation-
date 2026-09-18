import React from 'react';
import { Domain } from '../types';

interface DomainPieceProps {
  domain: string;
  data: any;
  compact?: boolean;
}

export const DomainPieceRenderer: React.FC<DomainPieceProps> = ({ domain, data, compact = false }) => {
  if (!data) {
    return <div className="text-xs text-neutral-400 italic">No content available</div>;
  }

  // If this piece is an already synthesized artifact
  if (data.kind === "synthesis" || (data.domain_a && data.domain_b)) {
    return (
      <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-purple-800 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Nested Synthesis: {data.domain_a} + {data.domain_b}
        </div>
        <div className="text-neutral-600 truncate">
          By: {Array.isArray(data.by) ? data.by.join(", ") : "Multi-agent"}
        </div>
      </div>
    );
  }

  switch (domain) {
    case Domain.ART:
    case "art":
      return (
        <div className="space-y-1.5">
          {data.palette && Array.isArray(data.palette) && (
            <div className="flex items-center gap-1.5">
              {data.palette.map((hex: string, i: number) => (
                <div key={i} className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-md border border-neutral-300/80 shadow-xs shrink-0"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                  {!compact && <span className="text-[11px] font-mono text-neutral-500">{hex}</span>}
                </div>
              ))}
            </div>
          )}
          {data.mood && (
            <div className="text-xs font-medium text-neutral-700 flex items-center gap-1">
              <span className="text-neutral-400">Mood:</span>
              <span className="italic">"{data.mood}"</span>
            </div>
          )}
        </div>
      );

    case Domain.MUSIC:
    case "music":
      return (
        <div className="space-y-1.5">
          {data.notes && Array.isArray(data.notes) && (
            <div className="flex items-center gap-1">
              {data.notes.map((note: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-rose-100 text-rose-800 font-mono text-xs font-semibold"
                >
                  {note}
                </span>
              ))}
              {data.tempo && (
                <span className="ml-2 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  ♩ {data.tempo} BPM
                </span>
              )}
            </div>
          )}
        </div>
      );

    case Domain.BIOLOGY:
    case "biology":
      return (
        <div className="space-y-1.5">
          {data.sequence && (
            <div className="font-mono text-xs tracking-wider flex flex-wrap gap-0.5">
              {data.sequence.split("").map((bp: string, i: number) => {
                let color = "bg-neutral-100 text-neutral-800";
                if (bp === "A") color = "bg-emerald-100 text-emerald-800";
                if (bp === "C") color = "bg-sky-100 text-sky-800";
                if (bp === "G") color = "bg-amber-100 text-amber-800";
                if (bp === "T") color = "bg-rose-100 text-rose-800";
                return (
                  <span key={i} className={`px-1 py-0.2 rounded font-bold ${color}`}>
                    {bp}
                  </span>
                );
              })}
            </div>
          )}
          {data.trait && (
            <div className="text-xs text-neutral-700">
              <span className="text-neutral-400">Trait:</span> {data.trait}
            </div>
          )}
        </div>
      );

    case Domain.SCIENCE:
    case "science":
      return (
        <div className="space-y-1">
          {data.claim && (
            <div className="text-xs font-medium text-neutral-800">
              {data.claim}
            </div>
          )}
          {data.test && (
            <div className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded inline-block border border-teal-200">
              🧪 {data.test}
            </div>
          )}
        </div>
      );

    case Domain.ENGINEERING:
    case "engineering":
      return (
        <div className="space-y-1">
          {data.spec && (
            <div className="font-mono text-xs font-semibold text-neutral-800">
              {data.spec}
            </div>
          )}
          {data.constraint && (
            <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-200 font-mono">
              ⚡ {data.constraint}
            </div>
          )}
        </div>
      );

    case Domain.PHILOSOPHY:
    case "philosophy":
      return (
        <div className="space-y-1">
          {data.proposition && (
            <div className="text-xs italic text-neutral-800">
              "{data.proposition}"
            </div>
          )}
          {data.stance && (
            <div className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block border border-purple-200 capitalize">
              Stance: {data.stance}
            </div>
          )}
        </div>
      );

    case Domain.ECONOMICS:
    case "economics":
      return (
        <div className="space-y-1">
          {data.rule && (
            <div className="text-xs font-semibold text-neutral-800">
              💳 {data.rule}
            </div>
          )}
          {data.effect && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-200">
              📊 {data.effect}
            </div>
          )}
        </div>
      );

    case Domain.LANGUAGE:
    case "language":
      return (
        <div className="space-y-1">
          {data.phrase && (
            <div className="text-xs font-medium text-neutral-800">
              "{data.phrase}"
            </div>
          )}
          {data.grammar && (
            <div className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block border border-blue-200">
              Syntax: {data.grammar}
            </div>
          )}
        </div>
      );

    case Domain.MATH:
    case "math":
      return (
        <div className="space-y-1">
          {data.formula && (
            <div className="font-mono text-xs font-semibold text-neutral-900 bg-neutral-100 px-2 py-1 rounded">
              {data.formula}
            </div>
          )}
          {data.property && (
            <div className="text-[11px] text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded inline-block border border-cyan-200">
              Property: {data.property}
            </div>
          )}
        </div>
      );

    case Domain.SOCIAL:
    case "social":
      return (
        <div className="space-y-1">
          {data.norm && (
            <div className="text-xs font-medium text-neutral-800">
              🤝 {data.norm}
            </div>
          )}
          {data.reach !== undefined && (
            <div className="text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block border border-indigo-200">
              Reach: {Number(data.reach).toLocaleString()} actors
            </div>
          )}
        </div>
      );

    default:
      return (
        <pre className="text-[11px] font-mono text-neutral-600 overflow-x-auto">
          {JSON.stringify(data, null, 1)}
        </pre>
      );
  }
};

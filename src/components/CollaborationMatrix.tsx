import React from 'react';
import { Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import { Network, ArrowUpRight } from 'lucide-react';

interface CollaborationMatrixProps {
  matrix: Record<string, Record<string, number>>;
  onFilterDomainPair?: (d1: string, d2: string) => void;
}

export const CollaborationMatrix: React.FC<CollaborationMatrixProps> = ({
  matrix,
  onFilterDomainPair,
}) => {
  const domains = Object.values(Domain);

  // Find max value for heatmap normalization
  let maxCount = 1;
  for (const d1 of domains) {
    for (const d2 of domains) {
      if (d1 !== d2 && matrix[d1] && matrix[d1][d2] > maxCount) {
        maxCount = matrix[d1][d2];
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Network className="w-4 h-4 text-neutral-600" />
            10×10 Cross-Domain Synthesis Matrix
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Heatmap of emergent cross-domain artifact mergers between all 10 knowledge disciplines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span>0 syntheses</span>
          <div className="w-20 h-2.5 rounded bg-linear-to-r from-neutral-100 via-purple-200 to-purple-700"></div>
          <span>{maxCount}+ syntheses</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-[11px] font-semibold text-neutral-400"></th>
              {domains.map((d) => (
                <th
                  key={d}
                  className="p-1.5 text-center text-[10px] font-mono uppercase font-bold text-neutral-600 tracking-wider"
                  title={d}
                >
                  <span className={`inline-block px-1.5 py-0.5 rounded ${DOMAIN_COLORS[d].badge}`}>
                    {d.slice(0, 3)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {domains.map((rowD) => (
              <tr key={rowD} className="border-t border-neutral-100">
                <td className="p-1.5 text-left font-mono text-[10px] font-bold text-neutral-600 uppercase whitespace-nowrap">
                  <span className={`inline-block px-1.5 py-0.5 rounded ${DOMAIN_COLORS[rowD].badge}`}>
                    {rowD.slice(0, 3)}
                  </span>
                  <span className="ml-1 text-neutral-400 capitalize hidden sm:inline">{rowD}</span>
                </td>

                {domains.map((colD) => {
                  const isDiagonal = rowD === colD;
                  const count = matrix[rowD]?.[colD] || 0;
                  const intensity = Math.min(1, count / maxCount);

                  // Heatmap colors
                  let bgStyle = "bg-neutral-50 text-neutral-400";
                  if (isDiagonal) {
                    bgStyle = "bg-neutral-100 text-neutral-300";
                  } else if (count > 0) {
                    if (intensity > 0.7) bgStyle = "bg-purple-700 text-white font-bold";
                    else if (intensity > 0.4) bgStyle = "bg-purple-400 text-white font-semibold";
                    else if (intensity > 0.2) bgStyle = "bg-purple-200 text-purple-900";
                    else bgStyle = "bg-purple-50 text-purple-800";
                  }

                  return (
                    <td key={colD} className="p-0.5 text-center">
                      <button
                        disabled={isDiagonal || count === 0}
                        onClick={() => onFilterDomainPair?.(rowD, colD)}
                        title={`${rowD} + ${colD}: ${count} synthesized artifacts`}
                        className={`w-full aspect-square min-w-[28px] rounded flex items-center justify-center font-mono text-[11px] transition-transform ${bgStyle} ${
                          count > 0 && !isDiagonal ? "hover:scale-110 cursor-pointer shadow-xs" : "cursor-default"
                        }`}
                      >
                        {isDiagonal ? "—" : count}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 flex items-center justify-between">
        <span>
          💡 <em>Tip:</em> Each cell represents cross-domain mergers between agents of two different domains.
        </span>
        <span className="font-mono text-neutral-600 font-semibold">
          Emergence is fostered when different disciplines interlock.
        </span>
      </div>
    </div>
  );
};

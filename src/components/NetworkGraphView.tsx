import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AgentData, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import { Share2, ZoomIn, ZoomOut, RotateCcw, Filter, Search, Info, Terminal, Download } from 'lucide-react';

interface NetworkGraphViewProps {
  agents: AgentData[];
  onSelectAgent?: (id: string) => void;
  onOpenPythonTab?: () => void;
}

interface Node {
  id: string;
  idx: number;
  domain: Domain;
  job: string;
  rule: string;
  made: number;
  partnersCount: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  agents,
  onSelectAgent,
  onOpenPythonTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minDegree, setMinDegree] = useState<number>(0);
  const [layoutMode, setLayoutMode] = useState<"cluster" | "radial">("cluster");
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate unique edges from agents
  const { nodes, edges, edgeCount } = useMemo(() => {
    const edgeSet = new Set<string>();
    const edgeList: Edge[] = [];

    const domainColors: Record<Domain, string> = {
      [Domain.SCIENCE]: "#0284c7",
      [Domain.ART]: "#e11d48",
      [Domain.ENGINEERING]: "#4f46e5",
      [Domain.PHILOSOPHY]: "#d97706",
      [Domain.ECONOMICS]: "#059669",
      [Domain.BIOLOGY]: "#16a34a",
      [Domain.LANGUAGE]: "#0d9488",
      [Domain.MATH]: "#9333ea",
      [Domain.MUSIC]: "#ea580c",
      [Domain.SOCIAL]: "#db2777",
    };

    const nodeList: Node[] = agents.map((a) => {
      const pCount = a.partners.length;
      return {
        id: a.id,
        idx: a.idx,
        domain: a.domain,
        job: a.job,
        rule: a.decision_name,
        made: a.made,
        partnersCount: pCount,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: Math.max(3.5, Math.min(10, 3.5 + pCount * 0.8)),
        color: domainColors[a.domain] || "#64748b",
      };
    });

    const agentIdSet = new Set(agents.map((a) => a.id));

    agents.forEach((a) => {
      a.partners.forEach((p) => {
        if (agentIdSet.has(p)) {
          const key = a.id < p ? `${a.id}:${p}` : `${p}:${a.id}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edgeList.push({ source: a.id, target: p });
          }
        }
      });
    });

    return { nodes: nodeList, edges: edgeList, edgeCount: edgeList.length };
  }, [agents]);

  // Compute node positions based on layout
  const positionedNodes = useMemo(() => {
    const width = 1200;
    const height = 800;
    const cx = width / 2;
    const cy = height / 2;

    const domains = Object.values(Domain);
    const domainAngleMap: Record<string, number> = {};
    domains.forEach((d, i) => {
      domainAngleMap[d] = (i / domains.length) * 2 * Math.PI;
    });

    const domainGroups: Record<string, Node[]> = {};
    nodes.forEach((n) => {
      if (!domainGroups[n.domain]) domainGroups[n.domain] = [];
      domainGroups[n.domain].push(n);
    });

    const result: Record<string, Node> = {};

    if (layoutMode === "cluster") {
      // 10 radial clusters, one for each domain
      const clusterRadius = 260;
      domains.forEach((d) => {
        const group = domainGroups[d] || [];
        const baseAngle = domainAngleMap[d];
        const clCx = cx + clusterRadius * Math.cos(baseAngle);
        const clCy = cy + clusterRadius * Math.sin(baseAngle);

        group.forEach((node, j) => {
          const subR = 20 + 65 * Math.sqrt(j / Math.max(1, group.length));
          const subA = j * 2.39996; // Golden angle spiral
          result[node.id] = {
            ...node,
            x: clCx + subR * Math.cos(subA),
            y: clCy + subR * Math.sin(subA),
          };
        });
      });
    } else {
      // Single global radial circle sorted by domain
      const radius = 320;
      nodes.forEach((node, idx) => {
        const angle = (idx / nodes.length) * 2 * Math.PI;
        result[node.id] = {
          ...node,
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        };
      });
    }

    return result;
  }, [nodes, layoutMode]);

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return (Object.values(positionedNodes) as Node[]).filter((n: Node) => {
      if (selectedDomain !== "all" && n.domain !== selectedDomain) return false;
      if (n.partnersCount < minDegree) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.id.toLowerCase().includes(q) || n.job.toLowerCase().includes(q);
      }
      return true;
    });
  }, [positionedNodes, selectedDomain, minDegree, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 1000;
    const height = 650;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#0f172a"; // Slate-900 dark graph canvas
    ctx.fillRect(0, 0, width, height);

    // Apply pan & zoom
    ctx.save();
    ctx.translate(pan.x + width / 2, pan.y + height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-600, -400); // Center standard 1200x800 layout

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1200; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 800);
      ctx.stroke();
    }
    for (let y = 0; y <= 800; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // Draw domain cluster labels in cluster mode
    if (layoutMode === "cluster") {
      const domains = Object.values(Domain);
      domains.forEach((d, i) => {
        const baseAngle = (i / domains.length) * 2 * Math.PI;
        const lx = 600 + (260 + 95) * Math.cos(baseAngle);
        const ly = 400 + (260 + 95) * Math.sin(baseAngle);
        ctx.fillStyle = DOMAIN_COLORS[d]?.text ? "#94a3b8" : "#94a3b8";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.toUpperCase(), lx, ly);
      });
    }

    // Draw Edges
    const isHoverActive = !!hoveredNode;
    const hoveredPartnerSet = hoveredNode ? new Set(agents.find((a) => a.id === hoveredNode.id)?.partners || []) : null;

    ctx.lineWidth = 0.75;
    for (const e of edges) {
      const u = positionedNodes[e.source];
      const v = positionedNodes[e.target];
      if (!u || !v) continue;
      if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) continue;

      let strokeColor = "rgba(148, 163, 184, 0.16)";
      let strokeWidth = 0.75;

      if (isHoverActive) {
        if (hoveredNode && (e.source === hoveredNode.id || e.target === hoveredNode.id)) {
          strokeColor = "rgba(238, 242, 255, 0.85)";
          strokeWidth = 2.0;
        } else {
          strokeColor = "rgba(148, 163, 184, 0.04)";
        }
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(u.x, u.y);
      ctx.lineTo(v.x, v.y);
      ctx.stroke();
    }

    // Draw Nodes
    for (const n of visibleNodes) {
      const isHovered = hoveredNode?.id === n.id;
      const isConnectedToHover = hoveredPartnerSet ? hoveredPartnerSet.has(n.id) : false;

      ctx.beginPath();
      ctx.arc(n.x, n.y, isHovered ? n.radius + 3 : n.radius, 0, Math.PI * 2);

      if (isHoverActive) {
        if (isHovered) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = n.color;
          ctx.shadowBlur = 12;
        } else if (isConnectedToHover) {
          ctx.fillStyle = n.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = n.color;
        } else {
          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.25;
          ctx.shadowBlur = 0;
        }
      } else {
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
      }

      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Node stroke
      ctx.strokeStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = isHovered ? 2 : 0.6;
      ctx.stroke();

      // Top hub label if degree >= 5
      if ((n.partnersCount >= 6 && !isHoverActive) || isHovered || isConnectedToHover) {
        ctx.fillStyle = isHovered ? "#ffffff" : "#cbd5e1";
        ctx.font = isHovered ? "bold 10px monospace" : "9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(n.id.split("-")[0], n.x, n.y - n.radius - 4);
      }
    }

    ctx.restore();
  }, [positionedNodes, edges, visibleNodes, visibleNodeIds, hoveredNode, zoom, pan, layoutMode, agents]);

  // Handle Mouse Events for Drag & Pan & Hover
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Node hit testing
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Invert canvas transform
    const worldX = (mouseX - (pan.x + width / 2)) / zoom + 600;
    const worldY = (mouseY - (pan.y + height / 2)) / zoom + 400;

    let found: Node | null = null;
    for (const n of visibleNodes) {
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      if (dx * dx + dy * dy <= (n.radius + 6) * (n.radius + 6)) {
        found = n;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredNode && onSelectAgent) {
      onSelectAgent(hoveredNode.id);
    }
  };

  // Reset View
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Info Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              500-Agent Collaboration Network Graph
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live graph visualization mirroring NetworkX/PyVis output. Nodes represent agents; lines represent emergent collaborations.
            </p>
          </div>

          {/* Quick Metrics & Python CTA */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-xs font-bold text-neutral-800">
                {visibleNodes.length} / 500 Nodes • {edgeCount} Edges
              </div>
              <div className="text-[10px] text-neutral-500">
                Avg Degree: {( (2 * edgeCount) / Math.max(1, nodes.length) ).toFixed(2)}
              </div>
            </div>
            {onOpenPythonTab && (
              <button
                id="view-python-code-btn"
                onClick={onOpenPythonTab}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-purple-300" />
                <span>Python Script</span>
              </button>
            )}
          </div>
        </div>

        {/* Graph Controls Toolbar */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Domain Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Domain:</span>
            <select
              id="graph-domain-filter"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            >
              <option value="all">All Domains (10)</option>
              {Object.values(Domain).map((d) => (
                <option key={d} value={d}>
                  {d.toUpperCase()} (50 agents)
                </option>
              ))}
            </select>
          </div>

          {/* Min Connections Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-medium">Min Collaborations:</span>
            <input
              type="range"
              min="0"
              max="8"
              value={minDegree}
              onChange={(e) => setMinDegree(Number(e.target.value))}
              className="w-24 accent-purple-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-neutral-700 w-4">{minDegree}+</span>
          </div>

          {/* Layout Mode */}
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg font-medium">
            <button
              onClick={() => setLayoutMode("cluster")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                layoutMode === "cluster" ? "bg-white text-neutral-900 shadow-xs font-semibold" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Domain Clusters
            </button>
            <button
              onClick={() => setLayoutMode("radial")}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                layoutMode === "radial" ? "bg-white text-neutral-900 shadow-xs font-semibold" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Global Ring
            </button>
          </div>

          {/* Search Agent ID */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agent ID / job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs w-44 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Zoom and Pan Controls */}
          <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-0.5 bg-white">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z * 1.25))}
              className="p-1 rounded text-neutral-600 hover:bg-neutral-100"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z / 1.25))}
              className="p-1 rounded text-neutral-600 hover:bg-neutral-100"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 rounded text-neutral-600 hover:bg-neutral-100"
              title="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden border border-neutral-800 bg-slate-900 shadow-inner select-none cursor-grab active:cursor-grabbing"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          className="block w-full"
        />

        {/* Legend Overlay in Lower Left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-lg pointer-events-none">
          <div className="font-semibold text-slate-200 mb-1.5 uppercase tracking-wider text-[10px]">
            Domains (10 Disciplines)
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Science</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Art</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Engineering</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Philosophy</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Economics</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Biology</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Language</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Math</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Music</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Social</div>
          </div>
        </div>

        {/* Hovered Node Tooltip Overlay */}
        {hoveredNode && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-neutral-200 rounded-xl p-3 text-xs shadow-xl max-w-xs text-neutral-800 pointer-events-none">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-1.5 mb-1.5">
              <span className="font-mono font-bold text-neutral-900">{hoveredNode.id}</span>
              <span
                className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: hoveredNode.color }}
              >
                {hoveredNode.domain}
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div>
                <strong className="text-neutral-500">Job:</strong>{" "}
                <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800 font-mono text-[10px]">
                  {hoveredNode.job}
                </code>
              </div>
              <div>
                <strong className="text-neutral-500">Decision Rule:</strong>{" "}
                <span className="capitalize">{hoveredNode.rule}</span>
              </div>
              <div>
                <strong className="text-neutral-500">Artifacts Made:</strong> {hoveredNode.made}
              </div>
              <div>
                <strong className="text-neutral-500">Collaborators ({hoveredNode.partnersCount}):</strong>
                <div className="text-[10px] text-neutral-600 truncate mt-0.5">
                  {agents.find((a) => a.id === hoveredNode.id)?.partners.join(", ") || "None yet"}
                </div>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-neutral-100 text-[10px] text-purple-600 font-medium">
              Click node to inspect in 500-Agent Matrix
            </div>
          </div>
        )}

        {/* Instruction overlay badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-slate-400 text-[10px] px-2.5 py-1 rounded-full border border-slate-700 pointer-events-none">
          Click + Drag to Pan • Scroll / Buttons to Zoom • Hover Node to Trace Collaborators
        </div>
      </div>
    </div>
  );
};

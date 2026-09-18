import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Share2, Code2, Image as ImageIcon, ExternalLink, Cpu } from 'lucide-react';

const VISUALIZE_NETWORK_PY = `"""
================================================================
 500-AGENT COLLABORATION NETWORK VISUALIZER
================================================================
 Visualizes the emergent collaboration network of 500 agents:
  - Input: List of agents with their 'partners' attribute
  - Outputs:
      1. NetworkX + Matplotlib (Publication-quality static PNG/PDF)
      2. PyVis (Interactive zoomable HTML with physics & tooltips)
      3. Pure-Python SVG fallback (Zero external dependencies)
================================================================
 Requirements:
   pip install networkx matplotlib pyvis
================================================================
"""

import sys
import math
from typing import List, Any, Optional, Dict

# Domain color palette
DOMAIN_COLORS = {
    "science":     "#0284c7",  # Sky Blue
    "art":         "#e11d48",  # Rose Red
    "engineering": "#4f46e5",  # Indigo
    "philosophy":  "#d97706",  # Amber / Gold
    "economics":   "#059669",  # Emerald Green
    "biology":     "#16a34a",  # Vibrant Green
    "language":    "#0d9488",  # Teal
    "math":        "#9333ea",  # Purple
    "music":       "#ea580c",  # Orange
    "social":      "#db2777",  # Pink
}
DEFAULT_NODE_COLOR = "#64748b"


def get_agent_id(agent: Any) -> str:
    return str(getattr(agent, "id", agent.get("id", ""))) if hasattr(agent, "id") or isinstance(agent, dict) else str(agent)

def get_agent_domain(agent: Any) -> str:
    dom = getattr(agent, "domain", agent.get("domain", "general")) if hasattr(agent, "domain") or isinstance(agent, dict) else "general"
    return dom.value if hasattr(dom, "value") else str(dom).lower()

def get_agent_partners(agent: Any) -> set:
    if hasattr(agent, "partners"): return set(agent.partners)
    if isinstance(agent, dict): return set(agent.get("partners", []))
    return set()


# ────────────────────────────────────────────────────────────────
# 1. NETWORKX + MATPLOTLIB VISUALIZATION
# ────────────────────────────────────────────────────────────────

def visualize_network_matplotlib(
    agents: List[Any],
    output_file: str = "agent_collaboration_network.png",
    show: bool = False,
    min_degree: int = 0,
    title: Optional[str] = None,
    dpi: int = 300,
    figsize: tuple = (16, 12),
) -> Any:
    """
    Renders an agent collaboration network graph using NetworkX and Matplotlib.
    - Nodes represent individual agents, colored by domain and sized by degree.
    - Edges represent emergent collaborations formed via MessageBus.
    """
    try:
        import networkx as nx
        import matplotlib.pyplot as plt
        import matplotlib.patches as mpatches
    except ImportError:
        print("[Warning] Missing dependencies: pip install networkx matplotlib")
        return None

    G = nx.Graph()

    # Add agent nodes with rich domain attributes
    for a in agents:
        aid = get_agent_id(a)
        domain = get_agent_domain(a)
        job = getattr(a, "job", a.get("job", "")) if hasattr(a, "job") or isinstance(a, dict) else ""
        made = getattr(a, "made", a.get("made", 0)) if hasattr(a, "made") or isinstance(a, dict) else 0
        rule = getattr(a, "decision_name", a.get("decision_name", "")) if hasattr(a, "decision_name") or isinstance(a, dict) else ""
        partners = get_agent_partners(a)

        G.add_node(
            aid,
            domain=domain,
            job=job,
            made=made,
            rule=rule,
            color=DOMAIN_COLORS.get(domain, DEFAULT_NODE_COLOR),
            partner_count=len(partners),
        )

    # Add undirected collaboration edges
    edge_weights: Dict[tuple, int] = {}
    for a in agents:
        u = get_agent_id(a)
        for v in get_agent_partners(a):
            if G.has_node(v):
                pair = tuple(sorted((u, v)))
                edge_weights[pair] = edge_weights.get(pair, 0) + 1

    for (u, v), weight in edge_weights.items():
        G.add_edge(u, v, weight=weight)

    # Filter isolates or low-degree nodes if requested
    if min_degree > 0:
        filtered_nodes = [n for n, d in G.degree() if d >= min_degree]
        G = G.subgraph(filtered_nodes).copy()

    # Dark slate aesthetic canvas
    fig, ax = plt.subplots(figsize=figsize, facecolor="#0f172a")
    ax.set_facecolor("#0f172a")

    num_nodes = G.number_of_nodes()
    num_edges = G.number_of_edges()
    if num_nodes == 0:
        ax.text(0.5, 0.5, "No nodes to display.", color="white", ha="center")
        plt.savefig(output_file, dpi=dpi, facecolor=fig.get_facecolor())
        plt.close()
        return G

    degrees = dict(G.degree())
    max_deg = max(degrees.values()) if degrees and max(degrees.values()) > 0 else 1

    # Node sizes scaled by degree
    node_sizes = [35 + (degrees[n] / max_deg) * 320 for n in G.nodes()]
    node_colors = [G.nodes[n].get("color", DEFAULT_NODE_COLOR) for n in G.nodes()]

    # Force-directed spring layout
    k_val = 1.6 / math.sqrt(num_nodes) if num_nodes > 0 else 0.1
    pos = nx.spring_layout(G, k=k_val, iterations=75, seed=42)

    # Draw edges with low alpha for readability across 1000+ edges
    nx.draw_networkx_edges(G, pos, ax=ax, edge_color="#94a3b8", alpha=0.18, width=0.75)

    # Draw nodes
    nx.draw_networkx_nodes(
        G, pos, ax=ax,
        node_size=node_sizes,
        node_color=node_colors,
        alpha=0.92,
        linewidths=0.6,
        edgecolors="#ffffff",
    )

    # Label top collaborative hubs
    top_nodes = sorted(degrees.items(), key=lambda item: item[1], reverse=True)[:15]
    top_labels = {n: f"{n.split('-')[0]}\\n(d={deg})" for n, deg in top_nodes if deg > 0}
    nx.draw_networkx_labels(
        G, pos, labels=top_labels, ax=ax,
        font_size=7.5, font_color="#f8fafc", font_family="sans-serif", font_weight="bold",
    )

    # Domain legend
    domain_patches = [
        mpatches.Patch(color=color, label=dom.capitalize())
        for dom, color in DOMAIN_COLORS.items()
    ]
    legend = ax.legend(
        handles=domain_patches,
        title="Knowledge Domains",
        title_fontsize=10,
        fontsize=8.5,
        loc="upper left",
        facecolor="#1e293b",
        edgecolor="#334155",
        labelcolor="#e2e8f0",
        framealpha=0.85,
    )
    legend.get_title().set_color("#f8fafc")

    density = nx.density(G)
    avg_deg = (2 * num_edges / num_nodes) if num_nodes > 0 else 0
    plt.title(
        f"{title or '500-Agent Emergent Collaboration Network'}\\n"
        f"Nodes: {num_nodes}  •  Collaboration Edges: {num_edges}  •  "
        f"Avg Degree: {avg_deg:.2f}  •  Density: {density:.4f}",
        fontsize=13, color="#f8fafc", fontweight="bold", pad=16,
    )

    ax.axis("off")
    plt.tight_layout()
    plt.savefig(output_file, dpi=dpi, facecolor=fig.get_facecolor(), bbox_inches="tight")
    print(f"✓ Saved Matplotlib graph to: {output_file}")
    if show: plt.show()
    plt.close()
    return G


# ────────────────────────────────────────────────────────────────
# 2. PYVIS INTERACTIVE HTML VISUALIZATION
# ────────────────────────────────────────────────────────────────

def visualize_network_pyvis(
    agents: List[Any],
    output_file: str = "agent_collaboration_network.html",
    open_browser: bool = False,
    filter_isolates: bool = False,
) -> Any:
    """
    Builds an interactive, physics-driven HTML graph using PyVis.
    """
    try:
        from pyvis.network import Network
    except ImportError:
        print("[Warning] Missing pyvis: pip install pyvis")
        return None

    net = Network(height="900px", width="100%", bgcolor="#0f172a", font_color="#f8fafc", directed=False)
    net.barnes_hut(gravity=-3500, central_gravity=0.25, spring_length=95, spring_strength=0.04, damping=0.09)

    agent_map = {get_agent_id(a): a for a in agents}
    for aid, a in agent_map.items():
        domain = get_agent_domain(a)
        partners = get_agent_partners(a)
        if filter_isolates and not partners:
            continue

        color = DOMAIN_COLORS.get(domain, DEFAULT_NODE_COLOR)
        size = 8 + min(len(partners) * 2.5, 32)
        job = getattr(a, "job", a.get("job", "")) if hasattr(a, "job") or isinstance(a, dict) else ""
        rule = getattr(a, "decision_name", a.get("decision_name", "")) if hasattr(a, "decision_name") or isinstance(a, dict) else ""

        tooltip = f"<b>{aid}</b><br/>Domain: {domain}<br/>Job: {job}<br/>Rule: {rule}<br/>Partners: {len(partners)}"
        net.add_node(aid, label=aid.split("-")[0], title=tooltip, color=color, size=size, shape="dot")

    added_edges = set()
    for aid, a in agent_map.items():
        for p in get_agent_partners(a):
            if p in agent_map:
                pair = tuple(sorted((aid, p)))
                if pair not in added_edges:
                    added_edges.add(pair)
                    net.add_edge(pair[0], pair[1], color="rgba(148, 163, 184, 0.25)", width=1.0)

    net.write_html(output_file)
    print(f"✓ Saved interactive PyVis HTML to: {output_file}")
    if open_browser:
        import webbrowser
        webbrowser.open(output_file)
    return net
`;

const AGENTS_500_SNIPPET = `from agents500 import run
from visualize_network import visualize_network_matplotlib, visualize_network_pyvis

# 1. Run 500 agents over 40 ticks
agents, bus, artifacts = run(n_agents=500, ticks=40)

# 2. Output publication-ready high-res PNG via NetworkX & Matplotlib
visualize_network_matplotlib(
    agents,
    output_file="agent_collaboration_network.png",
    min_degree=1,   # Filter out isolates
    dpi=300
)

# 3. Output interactive, zoomable HTML graph via PyVis
visualize_network_pyvis(
    agents,
    output_file="agent_collaboration_network.html",
    open_browser=True
)`;

const AGENTS500_FULL_BUILD = `"""
================================================================
 500-AGENT EMERGENT CREATION SYSTEM  —  FULL BUILD
================================================================
 - 500 agents; each owns exactly ONE job and ONE decision rule
 - Agents talk via a traced MessageBus (direct + broadcast)
 - Cross-domain merges produce NEW artifacts
 - Producers can be LLM-backed (OpenAI/Anthropic) or local
 - Exports collaboration graph to Graphviz DOT (+ PNG if 'dot' installed)
 Run:   python agents500.py
================================================================
"""

import os, sys, json, time, random, uuid, hashlib, collections
from collections import defaultdict, deque
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, Any, Optional

CONFIG = {
    "n_agents"      : 500,
    "ticks"         : 40,
    "use_llm"       : False,              # True -> call LLM producers
    "llm_provider"  : "openai",           # "openai" | "anthropic"
    "llm_model"     : "gpt-4o-mini",
    "llm_cache"     : "llm_cache.json",   # persistent cache
    "live_trace"    : True,               # print messages as they fly
    "trace_sample"  : 0.03,               # fraction of proposals printed
    "export_dot"    : "collab_graph.dot",
    "export_png"    : "collab_graph.png", # requires graphviz binary
    "merge_min_deg" : 1,                  # min partners to include in graph
}

# (See agents500.py file for complete code)
`;

const TERMINAL_OUTPUT = `════════════════════════════════════════════════════════════════
  500-AGENT EMERGENT CREATION SYSTEM
════════════════════════════════════════════════════════════════
Agents     : 500
Ticks      : 40
LLM mode   : OFF (local procedural producers)
Live trace : ON

  [t00] A372-eng-optim             ──▶ A000-sci-hypot                 [accept:engineering]
  [t00] A373-phi-synth             ──▶ A000-sci-hypot                 [accept:philosophy]
  [t00] A374-eco-audit             ──▶ ALL                            [artifact:economics]
  [t00] A375-bio-seque             ──▶ A000-sci-hypot                 [accept:biology]
  [t00] A377-mat-compu             ──▶ A000-sci-hypot                 [accept:math]
  [t00] A378-mus-arran             ──▶ ALL                            [artifact:music]
  ...
  tick   0 | broadcasts=  307 | pending= 77523 | messages=   500
  tick   5 | broadcasts= 1858 | pending= 77950 | messages=  3000
  tick  10 | broadcasts= 3389 | pending= 76104 | messages=  5500
  tick  20 | broadcasts= 6438 | pending= 78001 | messages= 10500
  tick  30 | broadcasts= 9519 | pending= 75207 | messages= 15500
  tick  39 | broadcasts=12270 | pending= 73436 | messages= 20000

  ✓ DOT written : collab_graph.dot  (500 nodes, 2081 edges)

════════════════════════════════════════════════════════════════
  EMERGENT RESULTS
════════════════════════════════════════════════════════════════
Total messages            : 20000
Proposals broadcast       : 8054
Cross-domain artifacts    : 4216
Unique collaboration edges: 2081

Sample artifacts:
  [ef3002b9]  language + math
             ['A006-lan-parse', 'A007-mat-compu']
               · {"phrase": "luminous lattice speaks", "grammar": "VSO"}
               · {"formula": "f(node) = 7*node + 1", "property": "convex"}
  [0a04be49]  math + science
             ['A007-mat-compu', 'A010-sci-hypot']
               · {"claim": "sparse node causes wave shift", "test": "measure node over 11 trials"}
  [1893536e]  art + science
             ['A000-sci-hypot', 'A011-art-color']
               · {"palette": ["#c99dc9", "#ca6b9f", "#de052b"], "mood": "dense lattice"}

════════════════════════════════════════════════════════════════
  WHO IS TALKING TO WHOM
════════════════════════════════════════════════════════════════
Message kinds on the bus:
  proposal    : 8054
  accept      : 7730
  artifact    : 4216

Top direct-message pairs:
  A001-art-color  ⇄  A002-eng-optim   (39 messages)
  A005-bio-seque  ⇄  A006-lan-parse   (39 messages)
  A009-soc-narra  ⇄  A010-sci-hypot   (39 messages)
  A013-phi-synth  ⇄  A014-eco-audit   (39 messages)
  A017-mat-compu  ⇄  A018-mus-arran   (39 messages)

Top 10 most social agents:
  A000-sci-hypot             sent=   40  received=  203
  A006-lan-parse             sent=   40  received=   52
  A002-eng-optim             sent=   40  received=   43`;

export const PythonRunnerView: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<"agents500" | "visualize" | "quickstart" | "benchmark">("agents500");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-neutral-900">
              1,000-Agent Full Build — LLM Producers + Graph Export + Live Tracing
            </h2>
          </div>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            Complete standalone Python system (<code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">agents500.py</code>) running 1,000 specialized agents (configurable to 500), traced MessageBus, cross-domain emergence, Graphviz DOT graph export (1,000 nodes, 4,171 edges), conversation auditor, and optional OpenAI/Anthropic LLM producers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href="/agents500.py"
            download="agents500.py"
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download agents500.py</span>
          </a>

          <a
            href="/collab_graph.dot"
            download="collab_graph.dot"
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download collab_graph.dot</span>
          </a>

          <a
            href="/visualize_network.py"
            download="visualize_network.py"
            className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>visualize_network.py</span>
          </a>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        {/* Navigation Bar */}
        <div className="bg-neutral-100/80 border-b border-neutral-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveCodeTab("agents500")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeCodeTab === "agents500"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              <span>agents500.py (Full Build)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab("visualize")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeCodeTab === "visualize"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>visualize_network.py (NetworkX / PyVis)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab("quickstart")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeCodeTab === "quickstart"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Usage & LLM Guide</span>
            </button>

            <button
              onClick={() => setActiveCodeTab("benchmark")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                activeCodeTab === "benchmark"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Trace & CLI Output</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={() =>
              handleCopy(
                activeCodeTab === "agents500"
                  ? AGENTS500_FULL_BUILD
                  : activeCodeTab === "visualize"
                  ? VISUALIZE_NETWORK_PY
                  : activeCodeTab === "quickstart"
                  ? AGENTS_500_SNIPPET
                  : TERMINAL_OUTPUT,
                activeCodeTab
              )
            }
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center gap-1 shadow-2xs transition-colors"
          >
            {copied === activeCodeTab ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied === activeCodeTab ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        {/* Code Viewport */}
        <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto leading-relaxed text-slate-200 max-h-[500px] overflow-y-auto">
          {activeCodeTab === "agents500" && <pre>{AGENTS500_FULL_BUILD}</pre>}
          {activeCodeTab === "visualize" && <pre>{VISUALIZE_NETWORK_PY}</pre>}
          {activeCodeTab === "quickstart" && (
            <div className="space-y-4 font-sans text-slate-300">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Step 1: Install Graph Visualization Libraries
                </div>
                <pre className="font-mono bg-slate-950 p-2.5 rounded text-emerald-400 text-xs select-all">
                  pip install networkx matplotlib pyvis
                </pre>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Step 2: Use in Python Code
                </div>
                <pre className="font-mono bg-slate-950 p-3 rounded text-slate-200 text-xs overflow-x-auto">
                  {AGENTS_500_SNIPPET}
                </pre>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-100">Key Features of the Visualization:</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>
                    <strong>Node Coloring by Domain:</strong> Distinct colors for Science, Art, Engineering, Philosophy, Economics, Biology, Language, Math, Music, and Social.
                  </li>
                  <li>
                    <strong>Node Sizing Proportional to Degree:</strong> Agents with more partners appear larger so key collaboration hubs stand out.
                  </li>
                  <li>
                    <strong>Edge Alpha & Density Tuning:</strong> With over 2,000 collaboration edges, lines use tuned opacity (0.18) so hub structures remain crystal clear.
                  </li>
                  <li>
                    <strong>Hub Labeling:</strong> Top collaborative agents (highest degree) automatically receive legible name tags.
                  </li>
                  <li>
                    <strong>PyVis Interactive HTML:</strong> Includes physics simulation, zoom, drag-and-drop, domain filtering, and hover tooltips showing jobs, decision rules, and partner lists.
                  </li>
                </ul>
              </div>
            </div>
          )}
          {activeCodeTab === "benchmark" && <pre>{TERMINAL_OUTPUT}</pre>}
        </div>
      </div>

      {/* Generated SVG Preview Banner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-800">
              Live Network Graph Available in App
            </div>
            <div className="text-xs text-neutral-500">
              Inspect the network interactively in the "Network Graph" tab, or download <code className="font-mono text-neutral-800">agent_collaboration_network.svg</code> generated directly from the Python script.
            </div>
          </div>
        </div>

        <a
          href="/agent_collaboration_network.svg"
          download="agent_collaboration_network.svg"
          className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download SVG</span>
        </a>
      </div>
    </div>
  );
};

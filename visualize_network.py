"""
================================================================
 500-AGENT COLLABORATION NETWORK VISUALIZER
================================================================
 Visualizes the emergent collaboration network of 500 agents:
  - Input: List of agents with their 'partners' attribute
  - Supports:
      1. NetworkX + Matplotlib (Publication-quality static PNG/PDF)
      2. PyVis (Interactive zoomable HTML with tooltips & physics)
      3. Pure-Python SVG fallback (Zero external dependencies)
================================================================
 Requirements (optional for advanced rendering):
   pip install networkx matplotlib pyvis
================================================================
"""

import sys
import math
import json
from typing import List, Any, Optional, Dict

# Domain color mapping for consistent visual identity across domains
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


def get_agent_domain(agent: Any) -> str:
    """Extract domain string from agent object or dict."""
    if hasattr(agent, "domain"):
        dom = agent.domain
        return dom.value if hasattr(dom, "value") else str(dom).lower()
    if isinstance(agent, dict):
        d = agent.get("domain", "")
        return d.lower() if isinstance(d, str) else str(d)
    return "general"


def get_agent_partners(agent: Any) -> set:
    """Extract partners set from agent object or dict."""
    if hasattr(agent, "partners"):
        return set(agent.partners)
    if isinstance(agent, dict):
        return set(agent.get("partners", []))
    return set()


def get_agent_id(agent: Any) -> str:
    """Extract unique identifier from agent object or dict."""
    if hasattr(agent, "id"):
        return str(agent.id)
    if isinstance(agent, dict):
        return str(agent.get("id", ""))
    return str(agent)


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
    Builds and renders an agent collaboration graph using NetworkX and Matplotlib.

    Args:
        agents: List of agent objects having an 'id' and 'partners' attribute.
        output_file: Target path to save the generated figure (.png, .pdf, .svg).
        show: If True, calls plt.show() to display interactive window.
        min_degree: Minimum number of connections required for an agent to be shown.
        title: Custom chart title.
        dpi: Resolution for saved image.
        figsize: Dimensions of the figure in inches.

    Returns:
        The NetworkX Graph object (nx.Graph).
    """
    try:
        import networkx as nx
        import matplotlib.pyplot as plt
        import matplotlib.patches as mpatches
    except ImportError as e:
        print(f"[Warning] Missing dependencies for Matplotlib visualization: {e}")
        print("Install via:  pip install networkx matplotlib")
        return None

    G = nx.Graph()

    # Add all agent nodes with metadata
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

    # Filter by minimum degree if specified
    if min_degree > 0:
        filtered_nodes = [n for n, d in G.degree() if d >= min_degree]
        G = G.subgraph(filtered_nodes).copy()

    # Figure setup
    fig, ax = plt.subplots(figsize=figsize, facecolor="#0f172a")  # Deep slate aesthetic
    ax.set_facecolor("#0f172a")

    num_nodes = G.number_of_nodes()
    num_edges = G.number_of_edges()

    if num_nodes == 0:
        ax.text(0.5, 0.5, "No nodes to display (all filtered out).",
                color="white", ha="center", va="center", fontsize=16)
        plt.tight_layout()
        plt.savefig(output_file, dpi=dpi, facecolor=fig.get_facecolor())
        if show:
            plt.show()
        plt.close()
        return G

    # Compute node degree and sizing
    degrees = dict(G.degree())
    max_deg = max(degrees.values()) if degrees and max(degrees.values()) > 0 else 1

    # Dynamic node size proportional to degree: min 35, max 380
    node_sizes = [35 + (degrees[n] / max_deg) * 320 for n in G.nodes()]
    node_colors = [G.nodes[n].get("color", DEFAULT_NODE_COLOR) for n in G.nodes()]

    # Force-directed layout
    # k parameter scales inversely with sqrt of node count for optimal spacing
    k_val = 1.6 / math.sqrt(num_nodes) if num_nodes > 0 else 0.1
    pos = nx.spring_layout(G, k=k_val, iterations=75, seed=42)

    # Draw edges with low alpha to maintain high readability with 1,000+ edges
    nx.draw_networkx_edges(
        G,
        pos,
        ax=ax,
        edge_color="#94a3b8",
        alpha=0.18,
        width=0.75,
    )

    # Draw nodes
    nx.draw_networkx_nodes(
        G,
        pos,
        ax=ax,
        node_size=node_sizes,
        node_color=node_colors,
        alpha=0.92,
        linewidths=0.6,
        edgecolors="#ffffff",
    )

    # Label top collaborative hubs (top 15 highest degree nodes)
    top_nodes = sorted(degrees.items(), key=lambda item: item[1], reverse=True)[:15]
    top_labels = {n: f"{n.split('-')[0]}\n(d={deg})" for n, deg in top_nodes if deg > 0}

    nx.draw_networkx_labels(
        G,
        pos,
        labels=top_labels,
        ax=ax,
        font_size=7.5,
        font_color="#f8fafc",
        font_family="sans-serif",
        font_weight="bold",
        verticalalignment="bottom",
    )

    # Construct Domain Legend
    domain_patches = [
        mpatches.Patch(color=color, label=f"{dom.capitalize()}")
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

    # Header & Metrics Info Box
    plot_title = title or "500-Agent Emergent Collaboration Network"
    density = nx.density(G)
    avg_degree = (2 * num_edges / num_nodes) if num_nodes > 0 else 0

    plt.title(
        f"{plot_title}\n"
        f"Nodes: {num_nodes}  •  Collaboration Edges: {num_edges}  •  "
        f"Avg Degree: {avg_degree:.2f}  •  Density: {density:.4f}",
        fontsize=13,
        color="#f8fafc",
        fontweight="bold",
        pad=16,
    )

    ax.axis("off")
    plt.tight_layout()
    plt.savefig(output_file, dpi=dpi, facecolor=fig.get_facecolor(), bbox_inches="tight")
    print(f"✓ Network visualization saved to: {output_file}")

    if show:
        plt.show()

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
    Nodes can be dragged, zoomed, searched, and hovered to inspect agent metadata.

    Args:
        agents: List of agent objects having an 'id' and 'partners' attribute.
        output_file: Output HTML file path.
        open_browser: If True, opens the generated HTML in the default web browser.
        filter_isolates: If True, hides agents with 0 partners.

    Returns:
        The PyVis Network object.
    """
    try:
        from pyvis.network import Network
    except ImportError as e:
        print(f"[Warning] Missing pyvis library: {e}")
        print("Install via:  pip install pyvis")
        return None

    net = Network(
        height="900px",
        width="100%",
        bgcolor="#0f172a",
        font_color="#f8fafc",
        directed=False,
    )

    # Configure physics for smooth force-directed layout
    net.barnes_hut(
        gravity=-3500,
        central_gravity=0.25,
        spring_length=95,
        spring_strength=0.04,
        damping=0.09,
    )

    # Collect agent metadata
    agent_map = {}
    for a in agents:
        aid = get_agent_id(a)
        domain = get_agent_domain(a)
        job = getattr(a, "job", a.get("job", "")) if hasattr(a, "job") or isinstance(a, dict) else ""
        made = getattr(a, "made", a.get("made", 0)) if hasattr(a, "made") or isinstance(a, dict) else 0
        rule = getattr(a, "decision_name", a.get("decision_name", "")) if hasattr(a, "decision_name") or isinstance(a, dict) else ""
        partners = get_agent_partners(a)
        agent_map[aid] = {
            "id": aid,
            "domain": domain,
            "job": job,
            "made": made,
            "rule": rule,
            "partners": partners,
        }

    # Add Nodes
    for aid, data in agent_map.items():
        partner_count = len(data["partners"])
        if filter_isolates and partner_count == 0:
            continue

        domain = data["domain"]
        color = DOMAIN_COLORS.get(domain, DEFAULT_NODE_COLOR)
        size = 8 + min(partner_count * 2.5, 32)

        # HTML hover tooltip
        partner_preview = ", ".join(list(data["partners"])[:4])
        if partner_count > 4:
            partner_preview += f" ... (+{partner_count - 4} more)"

        tooltip_html = (
            f"<div style='font-family: sans-serif; font-size: 12px; line-height: 1.5; color: #1e293b; background: #ffffff; padding: 8px 12px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>"
            f"<b style='color: {color}; font-size: 14px;'>{aid}</b><br/>"
            f"<b>Domain:</b> {domain.capitalize()}<br/>"
            f"<b>Job:</b> <code>{data['job']}</code><br/>"
            f"<b>Rule:</b> {data['rule']}<br/>"
            f"<b>Artifacts Made:</b> {data['made']}<br/>"
            f"<b>Collaborators:</b> {partner_count}<br/>"
            f"<span style='color: #64748b; font-size: 11px;'>{partner_preview or 'None'}</span>"
            f"</div>"
        )

        net.add_node(
            aid,
            label=aid.split("-")[0],
            title=tooltip_html,
            color=color,
            size=size,
            shape="dot",
            borderWidth=1.5,
        )

    # Add Edges
    added_edges = set()
    for aid, data in agent_map.items():
        for p in data["partners"]:
            if p in agent_map:
                edge_pair = tuple(sorted((aid, p)))
                if edge_pair not in added_edges:
                    added_edges.add(edge_pair)
                    net.add_edge(
                        edge_pair[0],
                        edge_pair[1],
                        color="rgba(148, 163, 184, 0.25)",
                        width=1.0,
                    )

    # Add interactive search and filter bar
    net.set_options("""
    {
      "interaction": {
        "hover": true,
        "navigationButtons": true,
        "keyboard": true,
        "zoomView": true
      }
    }
    """)

    net.write_html(output_file)
    print(f"✓ Interactive network HTML saved to: {output_file}")

    if open_browser:
        import webbrowser
        webbrowser.open(output_file)

    return net


# ────────────────────────────────────────────────────────────────
# 3. PURE-PYTHON SVG VISUALIZATION (Zero External Dependencies)
# ────────────────────────────────────────────────────────────────

def visualize_network_svg(
    agents: List[Any],
    output_file: str = "agent_collaboration_network.svg",
    width: int = 1400,
    height: int = 1000,
) -> None:
    """
    Renders an agent network diagram to an SVG file using ONLY Python standard library.
    Works anywhere with zero pip dependencies.
    """
    agent_map = {}
    edges = set()

    for a in agents:
        aid = get_agent_id(a)
        domain = get_agent_domain(a)
        partners = get_agent_partners(a)
        agent_map[aid] = {
            "domain": domain,
            "partners": partners,
        }
        for p in partners:
            edges.add(tuple(sorted((aid, p))))

    n = len(agent_map)
    if n == 0:
        return

    # Compute circular domain cluster layout
    domain_order = list(DOMAIN_COLORS.keys())
    domain_indices = {d: i for i, d in enumerate(domain_order)}

    cx, cy = width / 2.0, height / 2.0
    r_cluster = min(width, height) * 0.38

    # Assign positions clustered by domain
    positions = {}
    domain_agents = {d: [] for d in domain_order}
    for aid, d in agent_map.items():
        dom = d["domain"]
        if dom in domain_agents:
            domain_agents[dom].append(aid)
        else:
            domain_agents.setdefault(dom, []).append(aid)

    for dom, aids in domain_agents.items():
        dom_idx = domain_indices.get(dom, 0)
        dom_angle = (dom_idx / len(domain_order)) * 2 * math.pi
        dom_cx = cx + r_cluster * math.cos(dom_angle)
        dom_cy = cy + r_cluster * math.sin(dom_angle)

        num_in_dom = len(aids)
        for j, aid in enumerate(aids):
            # Local spiral/ring layout within domain cluster
            sub_r = 25 + 70 * math.sqrt(j / max(1, num_in_dom))
            sub_angle = j * 2.39996  # Golden ratio angular distribution
            x = dom_cx + sub_r * math.cos(sub_angle)
            y = dom_cy + sub_r * math.sin(sub_angle)
            positions[aid] = (x, y)

    # Generate SVG XML
    svg_lines = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" '
        f'width="{width}" height="{height}" style="background-color: #0f172a; font-family: system-ui, sans-serif;">',
        '<defs>',
        '  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">',
        '    <feGaussianBlur stdDeviation="2" result="blur" />',
        '    <feComposite in="SourceGraphic" in2="blur" operator="over" />',
        '  </filter>',
        '</defs>',
        f'<text x="{cx}" y="45" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle">'
        f'500-Agent Emergent Collaboration Network ({len(edges)} Collaboration Edges)</text>',
    ]

    # Draw edges
    svg_lines.append('<g opacity="0.22" stroke="#94a3b8" stroke-width="0.8">')
    for u, v in edges:
        if u in positions and v in positions:
            x1, y1 = positions[u]
            x2, y2 = positions[v]
            svg_lines.append(f'  <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" />')
    svg_lines.append('</g>')

    # Draw nodes
    svg_lines.append('<g>')
    for aid, (x, y) in positions.items():
        data = agent_map[aid]
        deg = len(data["partners"])
        dom = data["domain"]
        color = DOMAIN_COLORS.get(dom, DEFAULT_NODE_COLOR)
        r = 3.0 + min(deg * 0.8, 10.0)
        svg_lines.append(
            f'  <circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{color}" '
            f'stroke="#ffffff" stroke-width="0.5"><title>{aid} ({dom}) - {deg} partners</title></circle>'
        )
    svg_lines.append('</g>')

    # Draw Domain Labels
    for dom in domain_order:
        dom_idx = domain_indices[dom]
        dom_angle = (dom_idx / len(domain_order)) * 2 * math.pi
        lbl_x = cx + (r_cluster + 110) * math.cos(dom_angle)
        lbl_y = cy + (r_cluster + 110) * math.sin(dom_angle)
        color = DOMAIN_COLORS.get(dom, DEFAULT_NODE_COLOR)
        svg_lines.append(
            f'<text x="{lbl_x:.1f}" y="{lbl_y:.1f}" fill="{color}" font-size="12" '
            f'font-weight="bold" text-anchor="middle" dominant-baseline="central">'
            f'{dom.upper()}</text>'
        )

    svg_lines.append('</svg>')

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(svg_lines))

    print(f"✓ Pure-Python SVG network saved to: {output_file}")


# ────────────────────────────────────────────────────────────────
# 4. UNIFIED CONVENIENCE FUNCTION
# ────────────────────────────────────────────────────────────────

def visualize_agent_network(
    agents: List[Any],
    method: str = "all",
    prefix: str = "agent_collaboration_network",
) -> Dict[str, str]:
    """
    Convenience wrapper to visualize an agent fleet using requested or all available methods.

    Args:
        agents: List of agent objects (each with .id and .partners attribute).
        method: "matplotlib", "pyvis", "svg", or "all".
        prefix: Filename prefix for outputs.

    Returns:
        Dictionary mapping method name to output file path.
    """
    outputs = {}

    if method in ("svg", "all"):
        svg_path = f"{prefix}.svg"
        visualize_network_svg(agents, output_file=svg_path)
        outputs["svg"] = svg_path

    if method in ("matplotlib", "all"):
        png_path = f"{prefix}.png"
        res = visualize_network_matplotlib(agents, output_file=png_path)
        if res is not None:
            outputs["matplotlib"] = png_path

    if method in ("pyvis", "all"):
        html_path = f"{prefix}.html"
        res = visualize_network_pyvis(agents, output_file=html_path)
        if res is not None:
            outputs["pyvis"] = html_path

    return outputs


# ────────────────────────────────────────────────────────────────
# 5. CLI ENTRYPOINT
# ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # If run directly, run simulation via agents500 to generate fleet, then visualize
    try:
        from agents500 import run
        print("Running 500-agent simulation to generate collaboration network...")
        agents, bus, artifacts = run(n_agents=500, ticks=30, verbose=False)
        print(f"Simulation completed. Visualizing {len(agents)} agents...")

        outputs = visualize_agent_network(agents, method="all")
        print("\nGenerated network visualizations:")
        for k, v in outputs.items():
            print(f"  [{k}] -> {v}")
    except Exception as err:
        print(f"Error running network visualization: {err}")

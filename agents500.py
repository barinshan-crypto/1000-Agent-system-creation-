"""
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


# ────────────────────────────────────────────────────────────────
# 0. CONFIG
# ────────────────────────────────────────────────────────────────

CONFIG = {
    "n_agents"      : 1000,
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


# ────────────────────────────────────────────────────────────────
# 1. DOMAINS & JOBS
# ────────────────────────────────────────────────────────────────

class Domain(Enum):
    SCIENCE="science"; ART="art"; ENGINEERING="engineering"
    PHILOSOPHY="philosophy"; ECONOMICS="economics"; BIOLOGY="biology"
    LANGUAGE="language"; MATH="math"; MUSIC="music"; SOCIAL="social"

VERBS = {
    Domain.SCIENCE:     ["hypothesize","measure","falsify","model","observe"],
    Domain.ART:         ["sketch","color","compose","remix","critique"],
    Domain.ENGINEERING: ["design","prototype","optimize","test","integrate"],
    Domain.PHILOSOPHY:  ["question","define","argue","synthesize","deconstruct"],
    Domain.ECONOMICS:   ["price","allocate","forecast","trade","audit"],
    Domain.BIOLOGY:     ["sequence","classify","simulate","culture","evolve"],
    Domain.LANGUAGE:    ["translate","parse","coin","summarize","rhyme"],
    Domain.MATH:        ["prove","conjecture","compute","generalize","bound"],
    Domain.MUSIC:       ["harmonize","rhythmize","sample","arrange","improvise"],
    Domain.SOCIAL:      ["mediate","poll","nudge","connect","narrate"],
}

DECISION_TEMPLATES = ["produce_first","respond_first","merge_first","explore"]


# ────────────────────────────────────────────────────────────────
# 2. MESSAGE BUS (with tracing)
# ────────────────────────────────────────────────────────────────

@dataclass
class Message:
    sender: str
    recipient: str
    topic: str
    content: Any
    msg_id: str = field(default_factory=lambda: uuid.uuid4().hex[:8])
    timestamp: int = 0


class MessageBus:
    def __init__(self):
        self.queues: dict[str, deque] = defaultdict(deque)
        self.broadcast_log: deque[Message] = deque(maxlen=20000)
        self.all_messages: list[Message] = []
        self.tick = 0
        # stats for inspection
        self.stats = collections.Counter()
        self.conversations: dict[tuple, list] = defaultdict(list)

    def register(self, aid: str): self.queues[aid]
    def send(self, msg: Message):
        msg.timestamp = self.tick
        self.all_messages.append(msg)
        kind = msg.topic.split(":")[0]
        self.stats[kind] += 1
        if msg.recipient != "broadcast":
            self.conversations[tuple(sorted((msg.sender,msg.recipient)))].append(msg)
        if msg.recipient == "broadcast":
            self.broadcast_log.append(msg)
            for aid in self.queues:
                if aid != msg.sender:
                    self.queues[aid].append(msg)
        else:
            self.queues[msg.recipient].append(msg)

    def receive(self, aid: str) -> Optional[Message]:
        q = self.queues[aid]; return q.popleft() if q else None
    def recent_broadcasts(self, n=6): return list(self.broadcast_log)[-n:]


class TraceBus(MessageBus):
    """MessageBus that prints a live sample of traffic."""
    def __init__(self, live=True, sample=0.03, max_print=250):
        super().__init__(); self.live=live; self.sample=sample
        self.max_print=max_print; self.printed=0

    def send(self, msg: Message):
        super().send(msg)
        if not self.live or self.printed >= self.max_print: return
        kind = msg.topic.split(":")[0]
        if kind == "proposal" and random.random() > self.sample: return
        arrow = "──▶ ALL" if msg.recipient == "broadcast" else f"──▶ {msg.recipient}"
        print(f"  [t{msg.timestamp:02d}] {msg.sender:26s} {arrow:34s} [{msg.topic}]")
        self.printed += 1


# ────────────────────────────────────────────────────────────────
# 3. LOCAL (procedural) PRODUCERS
# ────────────────────────────────────────────────────────────────

_NOUNS = ["field","vector","pattern","loop","signal","frame","token","lattice",
          "cycle","pulse","echo","seed","thread","node","wave","cell","glyph"]
_ADJS  = ["silent","recursive","fractured","luminous","sparse","dense","emergent",
          "topological","minimal","chaotic","harmonic","stochastic","balanced"]
def _p(rng, s): return rng.choice(s)

def local_produce(domain: Domain, verb: str, rng: random.Random) -> dict:
    n, a = _p(rng,_NOUNS), _p(rng,_ADJS)
    if domain==Domain.SCIENCE:
        return {"claim":f"{a} {n} causes {_p(rng,_NOUNS)} shift",
                "test":f"measure {n} over {rng.randint(3,50)} trials"}
    if domain==Domain.ART:
        return {"palette":[f"#{rng.randint(0,0xFFFFFF):06x}" for _ in range(3)],
                "mood":f"{a} {n}"}
    if domain==Domain.ENGINEERING:
        return {"spec":f"{a}-{n}-{rng.randint(1,99)}",
                "constraint":f"latency < {rng.randint(1,200)}ms"}
    if domain==Domain.PHILOSOPHY:
        return {"proposition":f"If {n} is {a}, then {_p(rng,_NOUNS)} is prior.",
                "stance":_p(rng,["realist","idealist","pragmatist"])}
    if domain==Domain.ECONOMICS:
        return {"rule":f"price {n} at {rng.randint(1,999)} credits",
                "effect":f"allocate {rng.randint(1,50)}% to {_p(rng,_NOUNS)}"}
    if domain==Domain.BIOLOGY:
        return {"sequence":"".join(_p(rng,"ACGT") for _ in range(12)),
                "trait":f"{a} {n}"}
    if domain==Domain.LANGUAGE:
        return {"phrase":f"{a} {n} speaks","grammar":_p(rng,["SVO","SOV","VSO"])}
    if domain==Domain.MATH:
        return {"formula":f"f({n}) = {rng.randint(1,9)}*{n} + {rng.randint(1,9)}",
                "property":_p(rng,["monotone","bounded","convex","periodic"])}
    if domain==Domain.MUSIC:
        return {"notes":[rng.choice(["C","D","E","F","G","A","B"]) for _ in range(4)],
                "tempo":rng.randint(60,180)}
    if domain==Domain.SOCIAL:
        return {"norm":f"{a} {n} protocol","reach":rng.randint(10,10000)}
    return {"value":rng.randint(0,1000)}


# ────────────────────────────────────────────────────────────────
# 4. LLM PRODUCERS (optional, cached, with fallback)
# ────────────────────────────────────────────────────────────────

_LLM_CACHE: dict[str, dict] = {}
def _load_cache():
    global _LLM_CACHE
    if os.path.exists(CONFIG["llm_cache"]):
        try:
            _LLM_CACHE = json.load(open(CONFIG["llm_cache"]))
        except Exception:
            _LLM_CACHE = {}
def _save_cache():
    try: json.dump(_LLM_CACHE, open(CONFIG["llm_cache"],"w"), indent=0)
    except Exception: pass

_LLM_SYSTEM = (
    "You are a specialized creative agent. You output EXACTLY one JSON object, "
    "no prose, no code fences. Keep it short (<= 60 tokens)."
)

def _llm_prompt(domain: str, verb: str) -> str:
    return (f"Domain: {domain}. Your single job: {verb}. "
            f"Produce one short, novel, concrete idea as a JSON object with "
            f"a 'headline' string and 1-2 supporting fields.")

def _llm_call(prompt: str) -> Optional[dict]:
    provider = CONFIG["llm_provider"]
    try:
        if provider == "openai":
            from openai import OpenAI
            client = OpenAI()
            r = client.chat.completions.create(
                model=CONFIG["llm_model"],
                messages=[{"role":"system","content":_LLM_SYSTEM},
                          {"role":"user","content":prompt}],
                temperature=0.9, max_tokens=120,
                response_format={"type":"json_object"},
            )
            return json.loads(r.choices[0].message.content)
        if provider == "anthropic":
            import anthropic
            client = anthropic.Anthropic()
            r = client.messages.create(
                model=CONFIG["llm_model"], max_tokens=150,
                system=_LLM_SYSTEM,
                messages=[{"role":"user","content":prompt}],
            )
            txt = r.content[0].text.strip()
            return json.loads(txt)
    except Exception as e:
        print(f"    ! LLM error ({e}); falling back to local producer")
    return None

def llm_produce(domain: Domain, verb: str, rng: random.Random) -> dict:
    prompt = _llm_prompt(domain.value, verb)
    key = hashlib.md5(prompt.encode()).hexdigest()
    if key in _LLM_CACHE: return _LLM_CACHE[key]
    out = _llm_call(prompt)
    if out is None: out = local_produce(domain, verb, rng)
    _LLM_CACHE[key] = out
    return out


# ────────────────────────────────────────────────────────────────
# 5. AGENT
# ────────────────────────────────────────────────────────────────

class Agent:
    def __init__(self, idx, domain, verb, bus, decision_rule, producer,
                 decision_name, rng):
        pad = 4 if idx >= 1000 else 3
        self.id  = f"A{idx:0{pad}d}-{domain.value[:3]}-{verb[:5]}"
        self.idx = idx; self.domain = domain; self.job = f"{verb}_{domain.value}"
        self.bus = bus; self.decide = decision_rule; self.produce = producer
        self.decision_name = decision_name; self.rng = rng
        self.memory: deque[Message] = deque(maxlen=25)
        self.partners: set[str] = set()
        self.made = 0

    def step(self):
        incoming = []
        while (m := self.bus.receive(self.id)) is not None:
            incoming.append(m); self.memory.append(m)
        broadcasts = self.bus.recent_broadcasts(6)
        action = self.decide(self, incoming, broadcasts)
        if   action == "produce": self._produce()
        elif action == "respond": self._respond(incoming)
        elif action == "merge":   self._merge(broadcasts)

    def _produce(self):
        thing = self.produce(self)
        self.bus.send(Message(self.id, "broadcast",
                              f"proposal:{self.domain.value}", thing))
        self.made += 1

    def _respond(self, incoming):
        if not incoming: return self._produce()
        tgt = incoming[0].sender
        self.bus.send(Message(self.id, tgt, f"accept:{self.domain.value}",
                              {"job": self.job, "note": "I can help"}))
        self.partners.add(tgt)

    def _merge(self, broadcasts):
        cands = [b for b in broadcasts if b.sender != self.id
                 and b.topic.split(":")[-1] != self.domain.value]
        if not cands: return self._produce()
        other = self.rng.choice(cands)
        art = {"kind":"synthesis",
               "domain_a": other.topic.split(":")[-1],
               "domain_b": self.domain.value,
               "pieces": [other.content, self.produce(self)],
               "job_b": self.job,
               "by": [other.sender, self.id]}
        self.bus.send(Message(self.id, "broadcast",
                              f"artifact:{self.domain.value}", art))
        self.partners.add(other.sender); self.made += 1


# ────────────────────────────────────────────────────────────────
# 6. BUILD ONE JOB + ONE DECISION PER AGENT
# ────────────────────────────────────────────────────────────────

def build_producer(domain, verb, seed):
    def produce(agent: Agent):
        if CONFIG["use_llm"]:
            return llm_produce(domain, verb, agent.rng)
        return local_produce(domain, verb, agent.rng)
    return produce

def build_decision(template, seed):
    rng = random.Random(seed)
    if template == "produce_first":
        def rule(a, inc, bc):
            return "respond" if (inc and rng.random()<0.25) else "produce"
        return rule
    if template == "respond_first":
        def rule(a, inc, bc): return "respond" if inc else "produce"
        return rule
    if template == "merge_first":
        def rule(a, inc, bc):
            cross = [b for b in bc if b.topic.split(":")[-1]!=a.domain.value]
            return "merge" if (cross and rng.random()<0.6) else "produce"
        return rule
    def rule(a, inc, bc):
        r = rng.random()
        if inc and r<0.30: return "respond"
        if bc  and r<0.55: return "merge"
        return "produce"
    return rule

def build_fleet(n):
    bus = TraceBus(live=CONFIG["live_trace"], sample=CONFIG["trace_sample"])
    agents = []; domains = list(Domain)
    for i in range(n):
        d = domains[i % len(domains)]
        verb = VERBS[d][i % len(VERBS[d])]
        dec  = DECISION_TEMPLATES[i % len(DECISION_TEMPLATES)]
        rng  = random.Random(i*7919 + 13)
        a = Agent(i, d, verb, bus, build_decision(dec, i),
                  build_producer(d, verb, i), dec, rng)
        bus.register(a.id); agents.append(a)
    return agents, bus


# ────────────────────────────────────────────────────────────────
# 7. ARTIFACT MINER
# ────────────────────────────────────────────────────────────────

def mine_artifacts(bus):
    seen, out = set(), []
    for m in bus.broadcast_log:
        if not m.topic.startswith("artifact:"): continue
        key = json.dumps(m.content, sort_keys=True, default=str)
        if key in seen: continue
        seen.add(key)
        da, db = m.content.get("domain_a"), m.content.get("domain_b")
        if da and db and da != db:
            out.append({"id":m.msg_id,"domains":sorted({da,db}),
                        "contributors":m.content["by"],"t":m.timestamp,
                        "content":m.content})
    return out


# ────────────────────────────────────────────────────────────────
# 8. CONVERSATION INSPECTOR
# ────────────────────────────────────────────────────────────────

def inspect_conversations(bus, agents, top_n=8):
    print("\n" + "═"*64); print("  WHO IS TALKING TO WHOM"); print("═"*64)

    print("\nMessage kinds on the bus:")
    for k,c in bus.stats.most_common(): print(f"  {k:12s}: {c}")

    print(f"\nTop {top_n} direct-message pairs:")
    pairs = sorted(bus.conversations.items(), key=lambda kv:-len(kv[1]))[:top_n]
    for (a,b), msgs in pairs:
        print(f"  {a}  ⇄  {b}   ({len(msgs)} messages)")
        for m in msgs[:2]:
            snip = json.dumps(m.content, default=str)[:80]
            print(f"      {m.sender} → {m.recipient}: [{m.topic}] {snip}")

    arts = [m for m in bus.broadcast_log if m.topic.startswith("artifact:")]
    if arts:
        a = arts[len(arts)//2]
        c = a.content
        print(f"\nLineage of one emergent artifact [{a.msg_id}] (tick {a.timestamp}):")
        print(f"  fused : {c['domain_a']}  +  {c['domain_b']}")
        print(f"  A     : {c['by'][0]}  → {json.dumps(c['pieces'][0])[:80]}")
        print(f"  B     : {c['by'][1]}  → {json.dumps(c['pieces'][1])[:80]}")

    sent = collections.Counter(m.sender for m in bus.all_messages)
    recv = collections.Counter(m.recipient for m in bus.all_messages
                               if m.recipient != "broadcast")
    print("\nTop 10 most social agents:")
    for aid,n in sent.most_common(10):
        print(f"  {aid:26s} sent={n:5d}  received={recv[aid]:5d}")


# ────────────────────────────────────────────────────────────────
# 9. GRAPH EXPORT (DOT + optional PNG, optional NetworkX)
# ────────────────────────────────────────────────────────────────

DOMAIN_COLOR = {
    "science":"#4C72B0","art":"#DD8452","engineering":"#55A868",
    "philosophy":"#C44E52","economics":"#8172B3","biology":"#937860",
    "language":"#DA8BC3","math":"#8C8C8C","music":"#CCB974","social":"#64B5CD",
}

def export_graph(agents, path_dot, path_png=None, min_degree=1):
    edges = set()
    for a in agents:
        for p in a.partners:
            edges.add(tuple(sorted((a.id, p))))
    # degree filter for readability
    deg = collections.Counter()
    for u,v in edges: deg[u]+=1; deg[v]+=1
    keep = {n for n,d in deg.items() if d >= min_degree}
    edges = {(u,v) for (u,v) in edges if u in keep and v in keep}

    node_meta = {a.id:(a.domain.value, a.made) for a in agents}

    with open(path_dot,"w") as f:
        f.write("digraph collab {\n")
        f.write('  graph [overlap=false, splines=true, bgcolor="#111111"];\n')
        f.write('  node  [shape=circle, style=filled, fontcolor=white,'
                ' fontname="Helvetica", penwidth=0];\n')
        f.write('  edge  [color="#88888888", arrowsize=0.4];\n')
        for nid in keep:
            dom, made = node_meta.get(nid, ("unknown",0))
            size = 0.15 + min(made,20)*0.03
            col  = DOMAIN_COLOR.get(dom, "#999999")
            label = nid.split("-")[0]
            f.write(f'  "{nid}" [label="{label}", fillcolor="{col}",'
                    f' width={size:.2f}, height={size:.2f}];\n')
        for u,v in edges:
            f.write(f'  "{u}" -> "{v}";\n')
        f.write("}\n")
    print(f"  ✓ DOT written : {path_dot}  ({len(keep)} nodes, {len(edges)} edges)")

    # try to render PNG if graphviz is installed
    if path_png:
        try:
            import subprocess
            subprocess.run(["dot","-Tpng",path_dot,"-o",path_png],
                           check=True, capture_output=True)
            print(f"  ✓ PNG rendered: {path_png}")
        except Exception as e:
            print(f"  · PNG skipped (install Graphviz 'dot' to render): {e}")

    # optional NetworkX analysis
    try:
        import networkx as nx
        G = nx.Graph(); G.add_edges_from(edges)
        if G.number_of_nodes():
            comps = list(nx.connected_components(G))
            print(f"  · NetworkX: {G.number_of_nodes()} nodes, "
                  f"{G.number_of_edges()} edges, {len(comps)} components, "
                  f"largest={max(len(c) for c in comps)}")
    except ImportError:
        pass

    return edges


# ────────────────────────────────────────────────────────────────
# 10. RUN
# ────────────────────────────────────────────────────────────────

def run():
    cfg = CONFIG
    if cfg["use_llm"]: _load_cache()

    print("═"*64); print("  500-AGENT EMERGENT CREATION SYSTEM"); print("═"*64)
    print(f"Agents     : {cfg['n_agents']}")
    print(f"Ticks      : {cfg['ticks']}")
    print(f"LLM mode   : {'ON  (' + cfg['llm_provider'] + '/' + cfg['llm_model'] + ')' if cfg['use_llm'] else 'OFF (local procedural producers)'}")
    print(f"Live trace : {'ON' if cfg['live_trace'] else 'OFF'}")
    print()

    t0 = time.time()
    agents, bus = build_fleet(cfg["n_agents"])
    print(f"Fleet built: {len(agents)} agents\n")

    for t in range(cfg["ticks"]):
        bus.tick = t
        for a in agents: a.step()
        if t % 5 == 0 or t == cfg["ticks"]-1:
            pending = sum(len(q) for q in bus.queues.values())
            print(f"  tick {t:3d} | broadcasts={len(bus.broadcast_log):5d} "
                  f"| pending={pending:6d} | messages={len(bus.all_messages):6d}")

    if cfg["use_llm"]: _save_cache()

    artifacts = mine_artifacts(bus)
    edges = export_graph(agents, cfg["export_dot"], cfg["export_png"])

    print("\n" + "═"*64); print("  EMERGENT RESULTS"); print("═"*64)
    print(f"Total messages            : {len(bus.all_messages)}")
    print(f"Proposals broadcast       : {bus.stats['proposal']}")
    print(f"Cross-domain artifacts    : {len(artifacts)}")
    print(f"Unique collaboration edges: {len(edges)}")

    if artifacts:
        print("\nSample artifacts:")
        for a in artifacts[:6]:
            print(f"  [{a['id']}]  {' + '.join(a['domains'])}")
            print(f"             {a['contributors']}")
            for p in a['content']['pieces']:
                print(f"               · {json.dumps(p)[:90]}")

    inspect_conversations(bus, agents)
    print(f"\nDone in {time.time()-t0:.2f}s")
    return agents, bus, artifacts


if __name__ == "__main__":
    run()

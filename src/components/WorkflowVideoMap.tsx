import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AgentData, EmergentArtifact, Domain } from '../types';
import { DOMAIN_COLORS } from '../engine/simulationEngine';
import swarmWorkflowImg from '../assets/images/swarm_workflow_map_1789685019887.jpg';
import agentFusionImg from '../assets/images/agent_fusion_diagram_1789685034394.jpg';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Video,
  Image as ImageIcon,
  Compass,
  Sparkles,
  ArrowRight,
  Layers,
  Network,
  Cpu,
  Share2,
  Radio,
  FileCode2,
  CheckCircle2,
  ZoomIn,
  Eye,
  Languages,
} from 'lucide-react';

interface WorkflowVideoMapProps {
  agents: AgentData[];
  artifacts: EmergentArtifact[];
  currentTick: number;
  onSelectAgent?: (agentId: string) => void;
}

interface WorkflowStage {
  id: number;
  timeStart: number;
  timeEnd: number;
  titleEn: string;
  titleKu: string;
  shortDescEn: string;
  shortDescKu: string;
  narrativeEn: string;
  narrativeKu: string;
  icon: any;
  color: string;
  bgColor: string;
  accentHex: string;
  technicalDetails: {
    inputEn: string;
    inputKu: string;
    processEn: string;
    processKu: string;
    outputEn: string;
    outputKu: string;
  };
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 15,
    titleEn: "1. Domain Ideation & Independent Synthesis",
    titleKu: "١. هزرین و بەرهەمهێنانی سەربەخۆی هەر بوارێک",
    shortDescEn: "Each agent independently synthesizes novel mathematical theorems, acoustic chords, or physical principles based on their specialized domain.",
    shortDescKu: "هەر کارمەندێک بە جیا دەست دەکات بە دروستکردنی بیرۆکەی نوێ لە بواری تایبەتی خۆیدا وەک بیرکاری، مۆسیقا یان فیزیک.",
    narrativeEn: "In the genesis phase, 1,000 autonomous agents distributed across 10 disciplines explore their domain spaces, formulating micro-theories and initial hypotheses.",
    narrativeKu: "لە دەستپێکی خولەکەدا، ١،٠٠٠ کارمەندی زیرەک بەسەر ١٠ بواری جیاوازدا دابەش دەبن و بیرۆکە و مۆدێلی زانستی تایبەت بەخۆیان بەرهەم دەهێنن.",
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    accentHex: "#2563eb",
    technicalDetails: {
      inputEn: "Domain primitives, algorithmic heuristics (e.g. topology metrics, acoustic intervals).",
      inputKu: "یاسا بنەڕەتییەکانی بوارەکە و ڕێکارە حسابییەکان (وەک پێکهاتەی تۆپۆلۆجی یان مەودای مۆسیقی).",
      processEn: "Autonomous local inference executing domain template rules and micro-discoveries.",
      processKu: "شیکاری سەربەخۆی لۆکاڵی بە بەکارهێنانی یاساکانی مۆدێلی بوارەکە.",
      outputEn: "Unpublished domain proposal pieces stored in agent's internal memory buffer.",
      outputKu: "پارچە و پێشنیازی سەرەتایی لە بیری ناوخۆیی کارمەندەکەدا.",
    },
  },
  {
    id: 2,
    timeStart: 15,
    timeEnd: 30,
    titleEn: "2. MessageBus Broadcast & Topic Gossip Protocol",
    titleKu: "٢. پەخشی سەر تۆڕی MessageBus و گەیاندنی پەیامەکان",
    shortDescEn: "Agents publish structured proposals across decentralized pub/sub gossip channels to advertise their findings to the entire collective.",
    shortDescKu: "کارمەندەکان بیرۆکە نوێیەکانیان بە شێوەیەکی ستاندارد و پۆلێنکراو بەسەر کەناڵەکانی تۆڕدا پەخش دەکەن بۆ ئاگادارکردنەوەی هەمووان.",
    narrativeEn: "Packets flow across the unified MessageBus. Agents continuously monitor topics of interest, buffering announcements from complementary fields.",
    narrativeKu: "پەیامەکان بەناو تۆڕی خێرای MessageBus دا هاتوچۆ دەکەن. کارمەندەکانی تر گوێ بۆ بوارە جیاوازەکان دەگرن تا هاوبەشێک بدۆزنەوە.",
    icon: Radio,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    accentHex: "#9333ea",
    technicalDetails: {
      inputEn: "Synthesized local piece with semantic tags (e.g., #topology, #harmony, #fractal).",
      inputKu: "پارچەی بەرهەمهێنراو لەگەڵ تاگی واتایی (#مۆسیقا، #تۆپۆلۆجی، #ئەندازە).",
      processEn: "O(1) pub/sub broadcast dispatching JSON packets to subscriber queues with domain filtering.",
      processKu: "پەخشی دەستبەجێ بۆ سەرجەم بەشداربووان بەپێی ئارەزوو و فلتەری بوارەکان.",
      outputEn: "Real-time message packets circulating in the collective swarm gossip channel.",
      outputKu: "پاکێجی پەیامەکان کە لە تەواوی سیستەمەکەدا دەستاودەست دەکرێن.",
    },
  },
  {
    id: 3,
    timeStart: 30,
    timeEnd: 45,
    titleEn: "3. Scale-Free Hub Detection & Cross-Domain Resonance",
    titleKu: "٣. دۆزینەوە و بەستنەوەی نێوان دوو بوار لە ڕێگەی ناوەندەکانەوە",
    shortDescEn: "Key bridging agents detect semantic resonance between two disparate disciplines (e.g., Quantum Physics & Architecture).",
    shortDescKu: "کارمەندە پەیوەندیبەستەکان پردی لێکچوون لەنێوان دوو بواری زۆر دوور لەیەک دەدۆزنەوە (وەک فیزیکی کوانتەم و تەلارسازی).",
    narrativeEn: "Scale-free hub agents evaluate cross-domain proposals. When compatibility thresholds are met, a direct bilateral negotiation channel opens.",
    narrativeKu: "ناوەندە سەرەکییەکان لێکۆڵینەوە لە پەیامە جیاوازەکان دەکەن و کاتێک خاڵی هاوبەش دەدۆزنەوە، کەناڵی پەیوەندی ڕاستەوخۆ دەکەنەوە.",
    icon: Share2,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    accentHex: "#d97706",
    technicalDetails: {
      inputEn: "Two complementary broadcasts from disparate domains (Domain A & Domain B).",
      inputKu: "دوو پەیامی جیاواز لە دوو بواری سەربەخۆ (بواری یەکەم و بواری دووەم).",
      processEn: "Topological graph matching, semantic overlap scoring, and hub degree prioritization.",
      processKu: "پێوانەکردنی خاڵە هاوبەشەکان و پەسەندکردنی هاوکاری نێوانیان.",
      outputEn: "Candidate partnership bond established between two specialized agents.",
      outputKu: "دروستبوونی پەیوەندی و ڕێککەوتنی سەرەتایی لەنێوان دوو کارمەندی دیاریکراو.",
    },
  },
  {
    id: 4,
    timeStart: 45,
    timeEnd: 60,
    titleEn: "4. Autonomous Peer Negotiation & Synthesis Engine",
    titleKu: "٤. وتووێژ و یەکگرتنی پارچەکان لە نێوان کارمەندەکان",
    shortDescEn: "The paired agents enter a dedicated fusion chamber, reconciling mathematical axioms with artistic or empirical models to forge a unified artifact.",
    shortDescKu: "دوو کارمەندەکە دەچنە ژووری یەکگرتن و بیرۆکەکانیان تێکەڵ دەکەن بۆ ئەوەی داهێنانێکی هاوبەش و پتەو پێکبهێنن.",
    narrativeEn: "A bidirectional handshake is executed. Both agents contribute their respective domain pieces, verifying coherence and structural integrity.",
    narrativeKu: "هەردوو کارمەندەکە زانیارییەکانیان ئاڵوگۆڕ دەکەن و بە تێکەڵکردنی تیۆرییەکان، داهێنانێکی نوێ لەدایک دەبێت.",
    icon: Layers,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    accentHex: "#059669",
    technicalDetails: {
      inputEn: "Two agent state vectors, distinct domain pieces, and collaborative objective prompt.",
      inputKu: "بارودۆخی دوو کارمەندەکە، پارچەی هەردوو بوارەکە و ئامانجی هاوبەش.",
      processEn: "Combinatorial synthesis, bidirectional validation, and compound artifact assembly.",
      processKu: "تێکەڵکردنی لۆژیکی و پشتڕاستکردنەوەی هاوئاهەنگی بیرۆکەکان.",
      outputEn: "Dual-domain compound hypothesis piece with verifiable cross-disciplinary utility.",
      outputKu: "پارچە و گریمانەیەکی بەهێز کە لە دوو زانستی جیاوازەوە دروست بووە.",
    },
  },
  {
    id: 5,
    timeStart: 60,
    timeEnd: 75,
    titleEn: "5. Breakthrough Emergence & Collective Phase Shift",
    titleKu: "٥. سەرهەڵدانی داهێنانی مەزن و گواستنەوەی فازی دەستەجەمعی",
    shortDescEn: "The new emergent artifact is registered to the collective knowledge base, accelerating swarm entropy and triggering supercritical phase transitions.",
    shortDescKu: "داهێنانە هاوبەشەکە لە سیستەمدا تۆمار دەکرێت، ئەمەش دەبێتە هۆی خێراتربوونی داهێنانی دواتر و گۆڕانی ئاستی زیرەکی گشتی.",
    narrativeEn: "Emergence completes! The breakthrough becomes a building block for future generations, creating a scale-free web of self-organizing innovation.",
    narrativeKu: "داهێنانەکە تەواو دەبێت و دەبێتە بەردی بناغە بۆ کارمەندەکانی تر، بەمەش تۆڕێکی فرە-تەوەرەی خود-ڕێکخەر پێکدێت.",
    icon: Sparkles,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-200",
    accentHex: "#e11d48",
    technicalDetails: {
      inputEn: "Validated compound artifact with dual contributor signatures and timestamp.",
      inputKu: "داهێنانی پشتڕاستکراو لەگەڵ مۆری هەردوو کارمەند و کاتی دروستبوون.",
      processEn: "Knowledge base indexing, percolation threshold evaluation, and global entropy recalculation.",
      processKu: "تۆمارکردن لە تۆماری زانیارییەکان و بەرزکردنەوەی ئاستی زانستی سەرجەم کارمەندەکان.",
      outputEn: "Permanent Emergent Artifact stimulating second-order evolutionary offspring.",
      outputKu: "داهێنانێکی نەمر کە نەوەکانی دواتری کارمەندەکان کەڵکی لێ وەردەگرن.",
    },
  },
];

export const WorkflowVideoMap: React.FC<WorkflowVideoMapProps> = ({
  agents,
  artifacts,
  currentTick,
  onSelectAgent,
}) => {
  // Video Player Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds (0 to 75s)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [language, setLanguage] = useState<"ku" | "en" | "bilingual">("ku");
  const [activeMediaView, setActiveMediaView] = useState<"video" | "drawings" | "interactive_flow">("video");
  const [selectedDrawing, setSelectedDrawing] = useState<"workflow" | "fusion">("workflow");
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isZoomedImg, setIsZoomedImg] = useState<boolean>(false);

  // Selected live pair to simulate
  const [selectedDomainA, setSelectedDomainA] = useState<Domain>(Domain.MATH);
  const [selectedDomainB, setSelectedDomainB] = useState<Domain>(Domain.MUSIC);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const totalDuration = 75; // 75 seconds total video sequence

  // Find active stage based on current time
  const activeStage = useMemo(() => {
    return (
      WORKFLOW_STAGES.find(
        (s) => currentTime >= s.timeStart && currentTime < s.timeEnd
      ) || WORKFLOW_STAGES[WORKFLOW_STAGES.length - 1]
    );
  }, [currentTime]);

  // Two representative agents for the live demonstration in the video
  const representativeAgents = useMemo(() => {
    const a1 = agents.find((a) => a.domain === selectedDomainA) || agents[0];
    const a2 = agents.find((a) => a.domain === selectedDomainB) || agents[1];
    return { a1, a2 };
  }, [agents, selectedDomainA, selectedDomainB]);

  // Video Timeline Timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = 50; // update every 50ms
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + (interval / 1000) * playbackSpeed;
        if (next >= totalDuration) {
          return 0; // loop seamlessly
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Canvas Animation for the Live Video Simulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particleT = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas with rich dark slate background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle tech grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Stage Pipelines
      const stageWidth = width / WORKFLOW_STAGES.length;
      const stageIdx = activeStage.id - 1;
      const stageProgress =
        (currentTime - activeStage.timeStart) /
        (activeStage.timeEnd - activeStage.timeStart);

      // Render Stage Zones
      WORKFLOW_STAGES.forEach((stage, idx) => {
        const x = idx * stageWidth;
        const isCurrent = idx === stageIdx;

        // Stage boundary column
        if (isCurrent) {
          const grad = ctx.createLinearGradient(x, 0, x + stageWidth, 0);
          grad.addColorStop(0, "rgba(124, 58, 237, 0.03)");
          grad.addColorStop(0.5, "rgba(124, 58, 237, 0.12)");
          grad.addColorStop(1, "rgba(124, 58, 237, 0.03)");
          ctx.fillStyle = grad;
          ctx.fillRect(x, 0, stageWidth, height);

          // Top highlight line
          ctx.fillStyle = stage.accentHex;
          ctx.fillRect(x, 0, stageWidth, 3);
        }

        // Connector line between stages
        if (idx < WORKFLOW_STAGES.length - 1) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(x + stageWidth, 40);
          ctx.lineTo(x + stageWidth, height - 40);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Animated Stage Main Visualization
      const centerY = height * 0.45;
      particleT += 0.03 * playbackSpeed;

      // Draw Main Data Conduit / Flow Line across stages
      const activeX =
        stageIdx * stageWidth + stageProgress * stageWidth;

      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(stageWidth * 0.5, centerY);
      ctx.lineTo(width - stageWidth * 0.5, centerY);
      ctx.stroke();

      // Glowing active conduit
      ctx.strokeStyle = activeStage.accentHex;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(stageWidth * 0.5, centerY);
      ctx.lineTo(activeX, centerY);
      ctx.stroke();

      // Moving Data Packets
      const packetCount = 12;
      for (let i = 0; i < packetCount; i++) {
        const pFrac = ((particleT * 0.15 + i / packetCount) % 1);
        const px = stageWidth * 0.5 + pFrac * (width - stageWidth);
        const py = centerY + Math.sin(particleT * 2 + i) * 6;

        ctx.fillStyle = activeStage.accentHex;
        ctx.shadowColor = activeStage.accentHex;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw 5 Stage Nexus Spheres
      WORKFLOW_STAGES.forEach((stage, idx) => {
        const cx = idx * stageWidth + stageWidth * 0.5;
        const cy = centerY;
        const isCurrent = idx === stageIdx;
        const isPast = idx < stageIdx;

        // Outer glow ripple if active
        if (isCurrent) {
          const ripple = (Math.sin(particleT * 4) + 1) * 8 + 24;
          ctx.strokeStyle = stage.accentHex;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, ripple, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Base sphere
        ctx.fillStyle = isCurrent ? stage.accentHex : isPast ? "#3b82f6" : "#1e293b";
        ctx.shadowColor = isCurrent ? stage.accentHex : "transparent";
        ctx.shadowBlur = isCurrent ? 20 : 0;
        ctx.beginPath();
        ctx.arc(cx, cy, isCurrent ? 20 : 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Stage number
        ctx.fillStyle = "#ffffff";
        ctx.font = isCurrent ? "bold 13px monospace" : "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stage.id.toString(), cx, cy);

        // Stage short label
        ctx.font = "11px sans-serif";
        ctx.fillStyle = isCurrent ? "#f8fafc" : "#64748b";
        const label = language === "ku" ? stage.titleKu.split(".")[1] : stage.titleEn.split(".")[1];
        ctx.fillText(label ? label.trim().slice(0, 22) : "", cx, cy + 42);
      });

      // Stage-Specific Visual Drama in the Spotlight area
      const stageCenterX = stageIdx * stageWidth + stageWidth * 0.5;
      const spotlightY = height * 0.72;

      // Draw Live Agent Avatars interacting
      const a1Color = DOMAIN_COLORS[selectedDomainA]?.badge || "bg-blue-100";
      const a2Color = DOMAIN_COLORS[selectedDomainB]?.badge || "bg-purple-100";

      // Agent 1 Avatar (Left)
      const a1X = stageCenterX - 80 + Math.sin(particleT) * 4;
      const a1Y = spotlightY;
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(a1X, a1Y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText(representativeAgents.a1 ? representativeAgents.a1.id.slice(0, 5) : "Ag-1", a1X, a1Y);
      ctx.fillStyle = "#93c5fd";
      ctx.font = "10px sans-serif";
      ctx.fillText(selectedDomainA.toUpperCase(), a1X, a1Y + 28);

      // Agent 2 Avatar (Right)
      const a2X = stageCenterX + 80 - Math.sin(particleT) * 4;
      const a2Y = spotlightY;
      ctx.fillStyle = "#9333ea";
      ctx.beginPath();
      ctx.arc(a2X, a2Y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText(representativeAgents.a2 ? representativeAgents.a2.id.slice(0, 5) : "Ag-2", a2X, a2Y);
      ctx.fillStyle = "#d8b4fe";
      ctx.font = "10px sans-serif";
      ctx.fillText(selectedDomainB.toUpperCase(), a2X, a2Y + 28);

      // Interactive Link between them depending on stage
      ctx.strokeStyle = activeStage.accentHex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (activeStage.id === 1) {
        // Disconnected, working independently
        ctx.setLineDash([2, 4]);
      } else if (activeStage.id === 2) {
        // Broadcasting out
        ctx.setLineDash([6, 6]);
      } else if (activeStage.id === 3) {
        // Resonance bridge forming
        ctx.setLineDash([4, 2]);
      } else if (activeStage.id >= 4) {
        // Solid fused connection
        ctx.setLineDash([]);
        ctx.lineWidth = 3;
      }
      ctx.moveTo(a1X + 16, a1Y);
      ctx.lineTo(a2X - 16, a2Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Central Fusion Chamber in Stage 4 & 5
      if (activeStage.id >= 4) {
        const midX = (a1X + a2X) / 2;
        const midY = (a1Y + a2Y) / 2;
        const chamberSize = 22 + Math.sin(particleT * 6) * 4;

        ctx.fillStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(midX, midY, chamberSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000000";
        ctx.font = "bold 10px monospace";
        ctx.fillText(activeStage.id === 5 ? "★ ⨁" : "FUSION", midX, midY);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    activeStage,
    currentTime,
    language,
    playbackSpeed,
    representativeAgents,
    selectedDomainA,
    selectedDomainB,
  ]);

  // Skip to specific stage
  const handleSeekToStage = (stage: WorkflowStage) => {
    setCurrentTime(stage.timeStart + 0.1);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Mode Selection & Language Switcher */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <span>نەخشەی کارەکان لە ڕێگەی ڕەسم و ڤیدیۆ</span>
                <span className="text-xs text-neutral-400 font-mono font-normal">
                  / Swarm Workflow & Video Map
                </span>
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                تێگەیشتن لە چۆنیەتی کارکردنی ١،٠٠٠ کارمەندە سەربەخۆکە و قۆناغەکانی پێکهێنانی داهێنان لە ڕێگەی ئەنیمەیشن، دیاگرام و وێنە.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Language Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveMediaView("video")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeMediaView === "video"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Video className="w-3.5 h-3.5 text-purple-600" />
              <span>ڤیدیۆی ئەنیمەیشن</span>
            </button>

            <button
              onClick={() => setActiveMediaView("drawings")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeMediaView === "drawings"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>ڕەسم و نەخشەسازی</span>
            </button>

            <button
              onClick={() => setActiveMediaView("interactive_flow")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeMediaView === "interactive_flow"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Network className="w-3.5 h-3.5 text-emerald-600" />
              <span>شیکاری ٥ قۆناغەکە</span>
            </button>
          </div>

          {/* Kurdish / English Toggle */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setLanguage("ku")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                language === "ku" ? "bg-purple-600 text-white font-bold" : "text-neutral-600"
              }`}
            >
              کوردی
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                language === "en" ? "bg-purple-600 text-white font-bold" : "text-neutral-600"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("bilingual")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                language === "bilingual" ? "bg-purple-600 text-white font-bold" : "text-neutral-600"
              }`}
            >
              هەردووکی
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: VIDEO ANIMATION SIMULATOR */}
      {activeMediaView === "video" && (
        <div className="space-y-4">
          {/* Main Video Cinema Container */}
          <div className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl relative">
            {/* Top Video Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 px-5 py-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-300">
                  LIVE WORKFLOW CINEMA • 1,000 AGENT SWARM
                </span>
              </div>

              {/* Current Active Stage Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-neutral-200 border border-white/10">
                  {language === "ku" ? activeStage.titleKu : activeStage.titleEn}
                </span>
              </div>
            </div>

            {/* Video Canvas Scene */}
            <canvas
              ref={canvasRef}
              width={1000}
              height={420}
              className="w-full h-[360px] sm:h-[420px] object-cover cursor-pointer select-none"
              onClick={() => setIsPlaying((prev) => !prev)}
            />

            {/* Subtitles Overlay Bar */}
            <div className="absolute bottom-16 left-4 right-4 z-10 pointer-events-none flex justify-center">
              <div className="bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10 text-center max-w-2xl shadow-xl">
                {language === "ku" && (
                  <p className="text-xs sm:text-sm font-medium text-amber-200 leading-relaxed font-sans">
                    {activeStage.narrativeKu}
                  </p>
                )}
                {language === "en" && (
                  <p className="text-xs sm:text-sm font-medium text-neutral-100 leading-relaxed font-sans">
                    {activeStage.narrativeEn}
                  </p>
                )}
                {language === "bilingual" && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-200">{activeStage.narrativeKu}</p>
                    <p className="text-[11px] text-neutral-300 font-mono">{activeStage.narrativeEn}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Video Controller Bar */}
            <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-3 flex flex-col gap-2">
              {/* Timeline Scrubber & Stage Markers */}
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-neutral-700 rounded-lg appearance-none"
                />

                {/* 5 Stage Markers on the timeline */}
                <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none px-1 -translate-y-2">
                  {WORKFLOW_STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSeekToStage(s)}
                      className="pointer-events-auto p-0.5 rounded-full bg-neutral-600 hover:bg-white transition-colors"
                      title={language === "ku" ? s.titleKu : s.titleEn}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activeStage.id === s.id ? "bg-amber-400 ring-2 ring-amber-300" : "bg-neutral-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Controls & Time Codes */}
              <div className="flex items-center justify-between text-neutral-300 text-xs">
                <div className="flex items-center gap-3">
                  {/* Play / Pause Button */}
                  <button
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Skip to Previous / Next Stage */}
                  <button
                    onClick={() => {
                      const prevIdx = Math.max(0, activeStage.id - 2);
                      handleSeekToStage(WORKFLOW_STAGES[prevIdx]);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    title="قۆناغی پێشوو"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const nextIdx = Math.min(WORKFLOW_STAGES.length - 1, activeStage.id);
                      handleSeekToStage(WORKFLOW_STAGES[nextIdx]);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    title="قۆناغی دواتر"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  {/* Reset Timeline */}
                  <button
                    onClick={() => setCurrentTime(0)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    title="دەستپێکردنەوە لە سەرەتاوە"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Time Display */}
                  <span className="font-mono text-neutral-400 text-xs ml-1">
                    <strong className="text-white">{formatSeconds(currentTime)}</strong> / {formatSeconds(totalDuration)}
                  </span>
                </div>

                {/* Right Controls: Speed and Pair Selection */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-0.5 text-[11px] font-mono">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          playbackSpeed === s ? "bg-purple-600 text-white font-bold" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Actors Configuration Bar */}
          <div className="bg-white rounded-xl border border-neutral-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-neutral-900">
                  {language === "ku"
                    ? "کارمەندە ئەکتەرەکانی ناو ڤیدیۆکە بگۆڕە:"
                    : "Live Actor Agents in the Video Demonstration:"}
                </h4>
                <p className="text-[11px] text-neutral-500">
                  {language === "ku"
                    ? "دوو بواری جیاواز هەڵبژێرە تا کارلێکی ڕاستەوخۆی نێوانیان لە ڤیدیۆکەدا دەربکەوێت."
                    : "Select two domains to observe their bilateral negotiation sequence inside the video animation."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedDomainA}
                onChange={(e) => setSelectedDomainA(e.target.value as Domain)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-mono text-neutral-800 focus:ring-2 focus:ring-purple-600 capitalize"
              >
                {Object.values(Domain).map((d) => (
                  <option key={d} value={d}>
                    {d} ({agents.filter((a) => a.domain === d).length} agents)
                  </option>
                ))}
              </select>

              <span className="text-neutral-400 font-mono text-xs font-bold">⨁</span>

              <select
                value={selectedDomainB}
                onChange={(e) => setSelectedDomainB(e.target.value as Domain)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-neutral-200 bg-neutral-50 font-mono text-neutral-800 focus:ring-2 focus:ring-purple-600 capitalize"
              >
                {Object.values(Domain)
                  .filter((d) => d !== selectedDomainA)
                  .map((d) => (
                    <option key={d} value={d}>
                      {d} ({agents.filter((a) => a.domain === d).length} agents)
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ARCHITECTURAL SCHEMATICS & DRAWINGS */}
      {activeMediaView === "drawings" && (
        <div className="space-y-6">
          {/* Drawing Switcher */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-neutral-200/80 p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDrawing("workflow")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  selectedDrawing === "workflow"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>
                  {language === "ku"
                    ? "نەخشەی گشتی پێکهاتەی پەیوەندی و خولی کارەکان"
                    : "1. Swarm Architecture & Multi-Stage Lifecycle"}
                </span>
              </button>

              <button
                onClick={() => setSelectedDrawing("fusion")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  selectedDrawing === "fusion"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {language === "ku"
                    ? "دیاگرامی شیکاریی پڕۆسەی وتووێژ و یەکگرتنی دوو کارمەند"
                    : "2. Peer Negotiation & Interdisciplinary Fusion Schematic"}
                </span>
              </button>
            </div>

            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              High-Resolution Blueprint
            </span>
          </div>

          {/* Displayed Image Frame with Zoom Capability */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm relative group overflow-hidden">
            <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200/40">
              <img
                src={selectedDrawing === "workflow" ? swarmWorkflowImg : agentFusionImg}
                alt="Swarm Architectural Blueprint"
                className="w-full h-auto object-cover max-h-[580px] rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Zoom Button Overlay */}
              <button
                onClick={() => setIsZoomedImg(true)}
                className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-neutral-700 shadow-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <ZoomIn className="w-4 h-4 text-purple-400" />
                <span>{language === "ku" ? "گەورەکردنی تەواوی ڕەسمەکە" : "View Full Size"}</span>
              </button>
            </div>

            {/* Drawing Caption & Explanations */}
            <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <h3 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-purple-600" />
                <span>
                  {selectedDrawing === "workflow"
                    ? language === "ku"
                      ? "ڕوونکردنەوەی نەخشەی گشتی: خولی ٥ قۆناغی کارمەندەکان"
                      : "Swarm Architecture Blueprint: The 5-Phase Innovation Pipeline"
                    : language === "ku"
                    ? "ڕوونکردنەوەی دیاگرامی دووەم: وتووێژی دوو کارمەند لە دوو بواری جیاواز"
                    : "Bilateral Negotiation Schematic: Pairwise Agent Synthesis"}
                </span>
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {selectedDrawing === "workflow"
                  ? language === "ku"
                    ? "ئەم نەخشەیە دەریدەخات کە چۆن بیرۆکە سەرەتاییەکان لە قۆناغی چەپەوە (دۆزینەوەی سەربەخۆ) دەستپێدەکەن، دواتر دەچنە سەر تۆڕی MessageBus، پاشان لەلایەن ناوەندەکانەوە خاڵی هاوبەش دەدۆزرێتەوە و لە قۆناغی کۆتاییدا دەگۆڕێن بۆ داهێنانی سەرهەڵداوی بێهاوتا."
                    : "This architectural diagram illustrates how domain-specific ideation flows through the decentralized MessageBus gossip protocol, clusters via scale-free hub connectors, and undergoes bilateral negotiation into emergent compound breakthroughs."
                  : language === "ku"
                  ? "لەم دیاگرامەدا، دوو کارمەند لە دوو بواری جیاواز (وەک بیرکاری و مۆسیقا) بیرۆکەکانیان ئاڵوگۆڕ دەکەن و لە ڕێگەی ژووری یەکگرتنەوە یاسا بیرکارییەکان لەگەڵ دەنگە مۆسیقییەکان تێکەڵ دەکەن."
                  : "This schematic visualizes two agents from contrasting disciplines (e.g. topology and acoustic harmony) reconciling domain representations across cryptographic negotiation channels into a validated synthesis artifact."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INTERACTIVE 5-PHASE FLOWCHART */}
      {activeMediaView === "interactive_flow" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {WORKFLOW_STAGES.map((stage) => {
              const Icon = stage.icon;
              const isSelected = activeStage.id === stage.id;
              return (
                <div
                  key={stage.id}
                  onClick={() => handleSeekToStage(stage)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${stage.bgColor} ring-2 ring-purple-600 shadow-md`
                      : "bg-white border-neutral-200/80 hover:border-neutral-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`p-2 rounded-lg ${stage.bgColor} ${stage.color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-400">
                        قۆناغی {stage.id}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-neutral-900 mb-1 leading-snug">
                      {language === "ku" ? stage.titleKu : stage.titleEn}
                    </h4>

                    <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-3">
                      {language === "ku" ? stage.shortDescKu : stage.shortDescEn}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-200/50 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>{stage.timeStart}s - {stage.timeEnd}s</span>
                    <span className="text-purple-600 font-bold">بڕۆ بۆ لێرە →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep-Dive Active Stage Spec Box */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl ${activeStage.bgColor} ${activeStage.color}`}>
                  <activeStage.icon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {language === "ku" ? activeStage.titleKu : activeStage.titleEn}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {language === "ku"
                      ? "وردەکارییە تەکنیکی و ئەلگۆریتمییەکانی ئەم قۆناغەی کارکردن"
                      : "Algorithmic inputs, internal transformations, and output structures"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                قۆناغی {activeStage.id} لە ٥
              </span>
            </div>

            {/* Input / Process / Output Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  {language === "ku" ? "دەروازەی پێشینە (INPUT)" : "STAGE INPUT"}
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                  {language === "ku"
                    ? activeStage.technicalDetails.inputKu
                    : activeStage.technicalDetails.inputEn}
                </p>
              </div>

              {/* Transformation */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
                  {language === "ku" ? "پڕۆسێس و ئەلگۆریتم (TRANSFORMATION)" : "ALGORITHMIC PROCESS"}
                </span>
                <p className="text-xs text-purple-950 leading-relaxed font-sans">
                  {language === "ku"
                    ? activeStage.technicalDetails.processKu
                    : activeStage.technicalDetails.processEn}
                </p>
              </div>

              {/* Output */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                  {language === "ku" ? "ئەنجامی بەدەستهاتوو (OUTPUT)" : "STAGE OUTPUT"}
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed font-sans">
                  {language === "ku"
                    ? activeStage.technicalDetails.outputKu
                    : activeStage.technicalDetails.outputEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Zooming Drawing */}
      {isZoomedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between text-white">
              <span className="text-xs font-mono font-bold text-neutral-300">
                {selectedDrawing === "workflow"
                  ? "FULL SWARM ARCHITECTURAL BLUEPRINT"
                  : "AGENT BILATERAL FUSION SCHEMATIC"}
              </span>
              <button
                onClick={() => setIsZoomedImg(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-semibold text-white transition-colors"
              >
                داخستن (Close ✕)
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-neutral-950 flex items-center justify-center">
              <img
                src={selectedDrawing === "workflow" ? swarmWorkflowImg : agentFusionImg}
                alt="Enlarged schematic"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

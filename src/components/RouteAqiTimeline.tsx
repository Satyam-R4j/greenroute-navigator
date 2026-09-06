import React, { useState, useRef } from "react";
import { RouteSegment } from "@/data/mockAqiData";
import { getAqiColor } from "@/services/waqiService";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldAlert, Sparkles, Navigation } from "lucide-react";

interface RouteAqiTimelineProps {
  segments?: RouteSegment[];
  onHoverSegment?: (segment: RouteSegment | null) => void;
}

export const RouteAqiTimeline: React.FC<RouteAqiTimelineProps> = ({
  segments = [],
  onHoverSegment
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!segments || segments.length === 0) return null;

  const currentSegment = hoveredIdx !== null && segments[hoveredIdx] ? segments[hoveredIdx] : null;

  // Handle continuous smooth mouse move across the entire track without gap flickers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || segments.length === 0) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.min(segments.length - 1, Math.floor(percent * segments.length));
    
    if (idx !== hoveredIdx) {
      setHoveredIdx(idx);
      onHoverSegment?.(segments[idx]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    onHoverSegment?.(null);
  };

  return (
    <div className="w-full bg-card/80 backdrop-blur-md rounded-2xl p-3.5 border border-border/60 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Route AQI Micro-Breakdown</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          Hover to inspect waypoints
        </span>
      </div>

      {/* Continuous Hover Track Container */}
      <div 
        ref={trackRef}
        className="relative h-6 w-full flex rounded-xl border border-border/40 p-0.5 bg-muted/40 cursor-pointer overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full h-full flex rounded-lg overflow-hidden gap-0.5">
          {segments.map((seg, idx) => {
            const colorInfo = getAqiColor(seg.aqi.toString());
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className={`flex-1 h-full transition-all duration-150 relative ${
                  isHovered ? "brightness-125 scale-y-110 z-10 shadow-md ring-2 ring-primary rounded-sm" : "opacity-90"
                }`}
                style={{ backgroundColor: colorInfo.bg }}
              />
            );
          })}
        </div>
      </div>

      {/* Fixed Height Smooth Info Box (Prevents Layout Shifting/Flicker) */}
      <div className="h-10 flex items-center w-full">
        <AnimatePresence mode="wait">
          {currentSegment ? (
            <motion.div
              key={hoveredIdx}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.12 }}
              className="w-full flex items-center justify-between text-xs bg-muted/50 px-3 py-2 rounded-xl border border-border/50"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: getAqiColor(currentSegment.aqi.toString()).bg }}
                />
                <span className="font-bold text-foreground shrink-0">AQI {currentSegment.aqi}</span>
                <span className="text-muted-foreground truncate text-[11px]">
                  {currentSegment.advice}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0 ml-2">
                <Navigation className="w-3 h-3" />
                <span>Waypoint #{hoveredIdx! + 1}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="w-full flex items-center justify-between text-[11px] text-muted-foreground px-1"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cleanest air windows highlighted in green</span>
              </span>
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Hotspots in orange/red</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React from "react";

export const AqiLegendOverlay: React.FC = () => {
  const levels = [
    { label: "Good", range: "0 - 50", bg: "#009966" },
    { label: "Moderate", range: "51 - 100", bg: "#ffde33", text: "#000" },
    { label: "Sensitive", range: "101 - 150", bg: "#ff9933", text: "#000" },
    { label: "Unhealthy", range: "151 - 200", bg: "#cc0033" },
    { label: "V. Unhealthy", range: "201 - 300", bg: "#660099" },
    { label: "Hazardous", range: "300+", bg: "#7e0023" },
  ];

  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-2.5 shadow-xl text-xs space-y-1.5 pointer-events-auto">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        EPA Air Quality Scale
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {levels.map((lvl, idx) => (
          <div
            key={idx}
            className="flex-1 px-2 py-1 rounded-lg text-center font-bold text-[10px] shadow-sm shrink-0 min-w-[50px]"
            style={{ backgroundColor: lvl.bg, color: lvl.text || "#ffffff" }}
          >
            <div>{lvl.label}</div>
            <div className="opacity-80 text-[8px]">{lvl.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

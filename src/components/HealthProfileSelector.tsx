import React from "react";
import { ShieldCheck, HeartPulse, Zap } from "lucide-react";

export type HealthProfileType = 'general' | 'sensitive' | 'athlete';

interface HealthProfileSelectorProps {
  value: HealthProfileType;
  onChange: (profile: HealthProfileType) => void;
}

export const HealthProfileSelector: React.FC<HealthProfileSelectorProps> = ({ value, onChange }) => {
  const profiles: { id: HealthProfileType; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'general', label: 'Standard', icon: ShieldCheck, description: 'Standard EPA AQI thresholds' },
    { id: 'sensitive', label: 'Sensitive / Asthma', icon: HeartPulse, description: 'Strict warnings & N95 alerts' },
    { id: 'athlete', label: 'Athlete / Runner', icon: Zap, description: 'High ventilation intake advisories' },
  ];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Personal Health Profile
      </label>
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/50">
        {profiles.map((p) => {
          const Icon = p.icon;
          const isActive = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all ${
                isActive
                  ? "bg-card text-emerald-600 font-bold shadow-sm border border-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? "text-emerald-500" : "text-muted-foreground"}`} />
              <span className="text-xs leading-none font-medium truncate w-full">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

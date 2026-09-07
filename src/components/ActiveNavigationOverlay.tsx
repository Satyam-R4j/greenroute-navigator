import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Crosshair,
  Square,
  Flame,
  Leaf,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Radio,
  Sparkles
} from "lucide-react";
import { type TurnStep } from "@/services/navigationEngine";
import { type RouteOption } from "@/data/mockAqiData";

interface ActiveNavigationOverlayProps {
  currentRoute: RouteOption;
  currentStep: TurnStep | null;
  nextStep: TurnStep | null;
  distanceToNextManeuver: number; // meters
  progressPercent: number; // 0 - 100
  remainingDistanceMeters: number;
  remainingDurationSeconds: number;
  currentSpeedKmh: number;
  currentAqi: number;
  
  // Navigation Controls
  isPaused: boolean;
  onTogglePause: () => void;
  speedMultiplier: number;
  onChangeSpeedMultiplier: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isCameraLocked: boolean;
  onToggleCameraLock: () => void;
  isLiveGps: boolean;
  onToggleLiveGps: () => void;
  onEndNavigation: () => void;

  // Realtime Accumulators
  co2SavedAccumulated: number;
  caloriesBurnedAccumulated: number;
  pm25AvoidedAccumulated: number;

  // State
  isDestinationReached: boolean;
}

export const ActiveNavigationOverlay: React.FC<ActiveNavigationOverlayProps> = ({
  currentRoute,
  currentStep,
  nextStep,
  distanceToNextManeuver,
  progressPercent,
  remainingDistanceMeters,
  remainingDurationSeconds,
  currentSpeedKmh,
  currentAqi,
  isPaused,
  onTogglePause,
  speedMultiplier,
  onChangeSpeedMultiplier,
  isMuted,
  onToggleMute,
  isCameraLocked,
  onToggleCameraLock,
  isLiveGps,
  onToggleLiveGps,
  onEndNavigation,
  co2SavedAccumulated,
  caloriesBurnedAccumulated,
  pm25AvoidedAccumulated,
  isDestinationReached
}) => {
  // Maneuver Icon Selection
  const renderTurnIcon = (type?: TurnStep['iconType']) => {
    switch (type) {
      case 'turn-left':
      case 'slight-left':
        return <CornerUpLeft className="w-8 h-8 text-emerald-400" />;
      case 'turn-right':
      case 'slight-right':
        return <CornerUpRight className="w-8 h-8 text-emerald-400" />;
      case 'u-turn':
        return <CornerUpLeft className="w-8 h-8 text-orange-400 transform rotate-180" />;
      case 'destination':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      default:
        return <ArrowUp className="w-8 h-8 text-emerald-400" />;
    }
  };

  const formatMeters = (m: number) => {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.max(1, Math.round(sec / 60));
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
    }
    return `${mins} min`;
  };

  const getAqiBadgeColor = (aqi: number) => {
    if (aqi <= 50) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (aqi <= 100) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (aqi <= 150) return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[450] flex flex-col justify-between p-4 md:p-6 overflow-hidden font-sans">
      
      {/* TOP BAR: Turn-by-Turn Instruction Card & Control Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-start justify-between w-full max-w-5xl mx-auto">
        
        {/* Turn-by-Turn HUD Card */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 text-white rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex items-center gap-4 w-full md:max-w-md"
        >
          <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-2xl shrink-0 flex items-center justify-center">
            {renderTurnIcon(currentStep?.iconType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl font-black text-emerald-400 tracking-tight">
                {formatMeters(distanceToNextManeuver)}
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getAqiBadgeColor(currentAqi)}`}>
                AQI {currentAqi}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-100 truncate">
              {currentStep?.instruction || "Proceeding along eco-route"}
            </p>
            {isLiveGps ? (
              <p className="text-[10px] text-emerald-400 font-semibold truncate mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live GPS Active (Stationary when you stay still)
              </p>
            ) : nextStep ? (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Then: {nextStep.instruction}
              </p>
            ) : null}
          </div>
        </motion.div>

        {/* Quick Controls Toolbar */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-2xl p-1.5 shadow-2xl pointer-events-auto flex items-center gap-1.5 self-end md:self-start"
        >
          {/* Live GPS vs Sim toggle */}
          <button
            onClick={onToggleLiveGps}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLiveGps
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
            title={isLiveGps ? "Using Live Device GPS" : "Switch to Live GPS"}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveGps ? "animate-pulse" : ""}`} />
            <span>{isLiveGps ? "Live GPS" : "Simulation"}</span>
          </button>

          {!isLiveGps && (
            <>
              {/* Play / Pause Toggle */}
              <button
                onClick={onTogglePause}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors border border-slate-800"
                title={isPaused ? "Resume Navigation" : "Pause Navigation"}
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />}
              </button>

              {/* Speed Control Selector */}
              <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => onChangeSpeedMultiplier(s)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      speedMultiplier === s
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Voice Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl transition-colors border ${
              isMuted
                ? "bg-slate-900 border-slate-800 text-slate-500"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
            }`}
            title={isMuted ? "Unmute Voice Announcements" : "Mute Voice"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Camera Auto-Follow Lock */}
          <button
            onClick={onToggleCameraLock}
            className={`p-2 rounded-xl transition-colors border ${
              isCameraLocked
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
            title={isCameraLocked ? "Camera Auto-Following Vehicle" : "Lock Camera to Vehicle"}
          >
            <Crosshair className={`w-4 h-4 ${isCameraLocked ? "animate-spin-slow" : ""}`} />
          </button>

          {/* End Navigation Button */}
          <button
            onClick={onEndNavigation}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 transition-colors ml-1"
            title="End Navigation"
          >
            <Square className="w-4 h-4 fill-rose-400" />
          </button>
        </motion.div>

      </div>

      {/* MID FLOATING ALERT: High Pollution Zone Warning */}
      <AnimatePresence>
        {currentAqi > 100 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="self-center bg-amber-950/90 border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3 max-w-md my-auto backdrop-blur-xl"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs font-extrabold text-amber-300">
                Moderate Pollution Segment Ahead (AQI {currentAqi})
              </p>
              <p className="text-[11px] text-amber-200/80">
                Consider closing car windows or putting on an N95 mask.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM BAR: Navigation HUD Stats & Progress Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mx-auto bg-slate-950/95 backdrop-blur-2xl border border-slate-800 text-white rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] pointer-events-auto space-y-3"
      >
        {/* Dynamic Route Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
            <span>Route Progress</span>
            <span className="text-emerald-400">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Realtime Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
          
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Remaining</p>
            <p className="text-base font-black text-slate-100 mt-0.5">
              {formatMeters(remainingDistanceMeters)}
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">ETA</p>
            <p className="text-base font-black text-emerald-400 mt-0.5">
              {formatSeconds(remainingDurationSeconds)}
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">Speed</p>
            <p className="text-base font-black text-slate-100 mt-0.5">
              {Math.round(currentSpeedKmh)} <span className="text-xs font-normal text-slate-400">km/h</span>
            </p>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80 flex items-center justify-center gap-2">
            {currentRoute.transportMode === 'cycling' || currentRoute.transportMode === 'walking' ? (
              <>
                <Flame className="w-5 h-5 text-orange-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-extrabold text-orange-400">
                    {Math.round(caloriesBurnedAccumulated)} kcal
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">Burned</p>
                </div>
              </>
            ) : (
              <>
                <Leaf className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-extrabold text-emerald-400">
                    -{co2SavedAccumulated.toFixed(2)} kg
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">CO₂ Saved</p>
                </div>
              </>
            )}
          </div>

        </div>
      </motion.div>

      {/* DESTINATION REACHED MODAL OVERLAY */}
      <AnimatePresence>
        {isDestinationReached && (
          <div className="fixed inset-0 z-[500] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 pointer-events-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-100">Destination Reached!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You successfully completed your eco route with optimal air quality exposure.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">CO₂ Saved</p>
                  <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                    {co2SavedAccumulated > 0 ? `${co2SavedAccumulated.toFixed(2)} kg` : '0.24 kg'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">PM2.5 Avoided</p>
                  <p className="text-sm font-extrabold text-blue-400 mt-0.5">
                    {pm25AvoidedAccumulated > 0 ? `${pm25AvoidedAccumulated} µg` : '18 µg'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Avg AQI</p>
                  <p className="text-sm font-extrabold text-amber-400 mt-0.5">
                    {currentRoute.avgAqi}
                  </p>
                </div>
              </div>

              <Button
                onClick={onEndNavigation}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30"
              >
                Return to Route Map
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

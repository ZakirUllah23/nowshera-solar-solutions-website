"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface OfferCountdownProps {
  endTime: string;
}

export default function OfferCountdown({ endTime }: OfferCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    function calculate() {
      const difference = new Date(endTime).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs font-mono text-slate-400">
        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>Syncing timer...</span>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs font-mono text-rose-400">
        <Clock className="w-3.5 h-3.5 text-rose-500" />
        <span>Offer Expired</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-amber-500/30 rounded-md text-xs font-mono text-amber-400 shadow-sm backdrop-blur-sm">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span className="font-semibold text-slate-200">EXPIRES IN:</span>
      <span className="tabular-nums font-bold">
        {String(timeLeft.days).padStart(2, "0")}d : {String(timeLeft.hours).padStart(2, "0")}h :{" "}
        {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}

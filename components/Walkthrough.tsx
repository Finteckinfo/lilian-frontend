"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type WalkStep = {
  id: string;
  title: string;
  body: string;
  action: string;
  selector: string;
  path?: string;
  switchTab?: string;
};

type Box = { top: number; left: number; width: number; height: number };

export function Walkthrough({
  storageKey,
  steps,
  active = true,
  onTabSwitch,
}: {
  storageKey: string;
  steps: WalkStep[];
  active?: boolean;
  onTabSwitch?: (tab: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [ready, setReady] = useState(false);

  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const switchRef = useRef(onTabSwitch);
  switchRef.current = onTabSwitch;

  const finish = useCallback(() => {
    localStorage.setItem(storageKey, "done");
    sessionStorage.removeItem(`${storageKey}:step`);
    setOpen(false);
  }, [storageKey]);

  const go = useCallback(
    (next: number) => {
      const s = stepsRef.current;
      if (next >= s.length) {
        finish();
        return;
      }
      if (next < 0) next = 0;
      sessionStorage.setItem(`${storageKey}:step`, String(next));
      setIndex(next);
      setOpen(true);
      const step = s[next];
      if (step?.switchTab && switchRef.current) {
        switchRef.current(step.switchTab);
      }
      if (step?.path && pathname !== step.path) {
        router.push(step.path);
      }
    },
    [finish, storageKey, pathname, router]
  );

  useEffect(() => {
    if (!active) return;
    if (localStorage.getItem(storageKey) === "done") {
      setOpen(false);
      setReady(true);
      return;
    }
    const saved = Number(sessionStorage.getItem(`${storageKey}:step`) || "0");
    const idx = Number.isFinite(saved) ? saved : 0;
    setIndex(idx);
    setOpen(true);
    setReady(true);
    const step = stepsRef.current[idx];
    if (step?.switchTab && switchRef.current) {
      switchRef.current(step.switchTab);
    }
  }, [active, storageKey]);

  useEffect(() => {
    function onRestart(e: Event) {
      const key = (e as CustomEvent<string>).detail;
      if (key && key !== storageKey) return;
      localStorage.removeItem(storageKey);
      go(0);
    }
    window.addEventListener("bl-tour-restart", onRestart);
    return () => window.removeEventListener("bl-tour-restart", onRestart);
  }, [go, storageKey]);

  const step = steps[index];

  useEffect(() => {
    if (!open || !step) return;
    if (step.path && pathname !== step.path) {
      setBox(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (!el) {
        setBox(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setBox({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };
    const target = document.querySelector(step.selector);
    if (target) {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    frame = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, pathname, step]);

  if (!ready || !open || !step) return null;

  const offRoute = Boolean(step.path && pathname !== step.path);
  const below = box ? box.top + box.height + 16 : 96;
  const above = box ? box.top - 260 : 96;
  const cardTop = box
    ? below + 260 < window.innerHeight
      ? below
      : Math.max(16, above)
    : 96;
  const cardLeft = box
    ? Math.min(window.innerWidth - 360, Math.max(16, box.left))
    : Math.max(16, (typeof window !== "undefined" ? window.innerWidth : 800) / 2 - 170);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Soft dim — does NOT capture clicks */}
      <div className="absolute inset-0 bg-ink/15 dark:bg-ink/25" />

      {/* Gold ring around target */}
      {box && !offRoute && (
        <div
          className="absolute rounded-sm"
          style={{
            top: box.top - 6,
            left: box.left - 6,
            width: box.width + 12,
            height: box.height + 12,
            boxShadow: "0 0 0 2px rgb(var(--color-gold) / 0.6), 0 0 24px 4px rgb(var(--color-gold) / 0.15)",
            background: "rgb(var(--color-paper) / 0.08)",
          }}
        />
      )}

      {/* Explanation card */}
      <div
        className="pointer-events-auto absolute w-[min(340px,calc(100vw-32px))] border border-gold/30 bg-paper text-ink p-6 shadow-soft"
        style={{ top: offRoute ? 96 : cardTop, left: offRoute ? 16 : cardLeft }}
      >
        <p className="text-[10px] uppercase tracking-[2px] text-gold mb-3">
          {index + 1} of {steps.length}
        </p>
        <h2 className="font-display text-[22px] mb-2">{step.title}</h2>
        <p className="text-[13px] font-light leading-relaxed text-muted mb-5">
          {step.body}
        </p>

        {offRoute && step.path && (
          <button
            type="button"
            className="btn-primary w-full mb-4 text-[12px]"
            onClick={() => router.push(step.path!)}
          >
            Go to this page
          </button>
        )}

        {!offRoute && (
          <p className="text-[11px] uppercase tracking-[1.5px] text-gold/80 mb-5">
            {step.action}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {index > 0 && (
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="text-[11px] uppercase tracking-[1.5px] text-muted hover:text-ink transition-colors"
              >
                Back
              </button>
            )}
            {index < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="text-[11px] uppercase tracking-[1.5px] text-ink hover:text-gold transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="text-[11px] uppercase tracking-[1.5px] text-gold hover:text-ink transition-colors"
              >
                Done
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={finish}
            className="text-[11px] uppercase tracking-[1.5px] text-muted hover:text-ink transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function restartWalkthrough(storageKey: string) {
  window.dispatchEvent(
    new CustomEvent("bl-tour-restart", { detail: storageKey })
  );
}

export const PUBLIC_TOUR = "bl-tour-public-v2";
export const ADMIN_TOUR = "bl-tour-admin-v2";

"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

const DISMISS_KEY = "fv_install_dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Register the service worker (required for install-to-home-screen).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Already installed / running full-screen → never show the banner.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);

    // Show the banner even if the native prompt event hasn't fired yet, so users
    // always have a path to add it to the home screen (with manual instructions).
    const t = setTimeout(() => setVisible(true), 1200);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(t);
    };
  }, []);

  if (!visible) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      setVisible(false);
      return;
    }
    // No native prompt available (e.g. iPhone) — show simple manual steps.
    setShowHelp((s) => !s);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-4">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-600 bg-panel/95 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
          </div>
          <div className="flex-1 text-sm text-slate-200">
            Add this app to your home screen for one-tap access.
          </div>
          <button
            onClick={install}
            className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Add
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full px-2 py-1 text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        {showHelp && (
          <p className="mt-3 text-xs text-slate-400">
            On your phone: open the browser menu (⋮) and tap <strong>“Add to Home screen”</strong>.
          </p>
        )}
      </div>
    </div>
  );
}

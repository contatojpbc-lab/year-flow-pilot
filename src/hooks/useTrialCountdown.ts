import { useMemo, useState, useCallback } from "react";
import { differenceInDays } from "date-fns";
import { useSubscription } from "@/contexts/SubscriptionContext";

const STORAGE_KEY = "upgradeModalLastSeenDate";
const THRESHOLD_DAYS = 3;

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function hasSeenModalToday(): boolean {
  try {
    const last = localStorage.getItem(STORAGE_KEY);
    return last === getTodayDateString();
  } catch {
    return false;
  }
}

function markModalSeenToday(): void {
  try {
    localStorage.setItem(STORAGE_KEY, getTodayDateString());
  } catch {
    // silently ignore storage errors
  }
}

export interface TrialCountdownResult {
  /** Dias restantes no trial (0 se expirado ou sem trial). */
  daysLeft: number;
  /** true quando status === 'trial' && daysLeft <= 3 && não foi visto hoje. */
  shouldShowUpgradeModal: boolean;
  /** Abre o modal manualmente (ex: clique no banner). */
  openUpgradeModal: () => void;
  /** Fecha o modal e registra "visto hoje". */
  closeUpgradeModal: () => void;
  /** Estado controlado do modal. */
  isModalOpen: boolean;
}

export function useTrialCountdown(): TrialCountdownResult {
  const { status, trialEndsAt } = useSubscription();

  const daysLeft = useMemo<number>(() => {
    if (status !== "trial" || !trialEndsAt) return 0;
    const diff = differenceInDays(trialEndsAt, new Date());
    return Math.max(0, diff);
  }, [status, trialEndsAt]);

  const shouldAutoOpen =
    status === "trial" && daysLeft <= THRESHOLD_DAYS && !hasSeenModalToday();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(shouldAutoOpen);

  const openUpgradeModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    markModalSeenToday();
    setIsModalOpen(false);
  }, []);

  return {
    daysLeft,
    shouldShowUpgradeModal: shouldAutoOpen,
    openUpgradeModal,
    closeUpgradeModal,
    isModalOpen,
  };
}

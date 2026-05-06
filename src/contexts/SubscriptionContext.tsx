import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus = "trial" | "active" | "expired";

interface SubscriptionContextValue {
  status: SubscriptionStatus | null;
  trialEndsAt: Date | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setTrialEndsAt(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let { data } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", user.id)
      .maybeSingle();

    // Safety net: create if missing
    if (!data) {
      const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const inserted = await supabase
        .from("subscriptions")
        .insert({ user_id: user.id, trial_ends_at: trialEnd, status: "trial" })
        .select("status, trial_ends_at")
        .maybeSingle();
      data = inserted.data ?? null;
    }

    if (data) {
      const ends = new Date(data.trial_ends_at);
      let s = data.status as SubscriptionStatus;
      if (s === "trial" && new Date() > ends) {
        await supabase.from("subscriptions").update({ status: "expired" }).eq("user_id", user.id);
        s = "expired";
      }
      setStatus(s);
      setTrialEndsAt(ends);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider value={{ status, trialEndsAt, loading, refresh: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}

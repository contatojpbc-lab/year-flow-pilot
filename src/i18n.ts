import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  pt: {
    translation: {
      // Sidebar nav
      dashboard: "Dashboard",
      goals: "Metas",
      dailyRoutine: "Rotina Diária",
      weeklyReview: "Revisão Semanal",
      minimumViableDay: "Mínimo Viável Diário",
      finances: "Finanças",
      journal: "Diário",
      reminders: "Lembretes",
      settings: "Configurações",

      // Sidebar labels
      sidebarCore: "Core",
      sidebarLife: "Life",

      // Dashboard
      goodMorning: "Bom dia!",
      dashboardSubtitle: "Aqui está seu resumo do Life OS para hoje.",
      activeGoals: "Metas Ativas",
      completedThisYear: "{{count}} concluídas este ano",
      currentStreak: "Sequência Atual",
      longestDays: "Melhor: {{count}} dias",
      weeklyReviews: "Revisões Semanais",
      reviewsCompleted: "revisões concluídas",
      goalsProgress: "Progresso das Metas",
      averageCompletion: "conclusão média",
      yearProgress: "Progresso {{year}}",
      complete: "Concluído",
      acrossAllGoals: "em todas as metas",
      mvdCompleted: "MVD Concluído!",
      streakDays: "Sequência: {{count}} dias 🔥",

      // Alerts
      mvdNotStarted: "Seu MVD ainda não foi iniciado hoje. Comece com o primeiro item!",
      stagnantGoalSingle: 'A meta "{{title}}" precisa de atenção ({{progress}}% de progresso).',
      stagnantGoalsMultiple: "{{count}} metas precisam de atenção (menos de 10% de progresso).",

      // Trial banner
      trialDaysMany: "Você está no teste gratuito. Restam {{days}} dias.",
      trialDaysFew: "Seu acesso termina em {{days}} {{unit}}. Garanta sua continuidade.",
      trialDaysWeek: "Seu teste termina em {{days}} dias. Não perca seus dados.",
      trialDay: "dia",
      trialDays: "dias",
      activateSubscription: "Ativar assinatura",

      // Upgrade modal
      upgradeTitle: "Seu acesso completo está acabando",
      upgradeBody:
        "Faltam apenas {{days}} {{unit}} para o fim do seu acesso total ao Life OS. Continue com metas, rotina, finanças, MVD e histórico sem interrupções.",
      upgradeActivate: "Ativar acesso completo",
      upgradeRemindLater: "Lembrar depois",
    },
  },
  en: {
    translation: {
      // Sidebar nav
      dashboard: "Dashboard",
      goals: "Goals",
      dailyRoutine: "Daily Routine",
      weeklyReview: "Weekly Review",
      minimumViableDay: "Minimum Viable Day",
      finances: "Finances",
      journal: "Journal",
      reminders: "Reminders",
      settings: "Settings",

      // Sidebar labels
      sidebarCore: "Core",
      sidebarLife: "Life",

      // Dashboard
      goodMorning: "Good morning!",
      dashboardSubtitle: "Here's your Life OS overview for today.",
      activeGoals: "Active Goals",
      completedThisYear: "{{count}} completed this year",
      currentStreak: "Current Streak",
      longestDays: "Longest: {{count}} days",
      weeklyReviews: "Weekly Reviews",
      reviewsCompleted: "reviews completed",
      goalsProgress: "Goals Progress",
      averageCompletion: "average completion",
      yearProgress: "{{year}} Progress",
      complete: "Complete",
      acrossAllGoals: "across all goals",
      mvdCompleted: "MVD Completed!",
      streakDays: "Streak: {{count}} days 🔥",

      // Alerts
      mvdNotStarted: "Your MVD hasn't started today. Start with the first item!",
      stagnantGoalSingle: 'Goal "{{title}}" needs attention ({{progress}}% progress).',
      stagnantGoalsMultiple: "{{count}} goals need attention (less than 10% progress).",

      // Trial banner
      trialDaysMany: "You're on a free trial. {{days}} days remaining.",
      trialDaysFew: "Your access ends in {{days}} {{unit}}. Secure your continuity.",
      trialDaysWeek: "Your trial ends in {{days}} days. Don't lose your data.",
      trialDay: "day",
      trialDays: "days",
      activateSubscription: "Activate subscription",

      // Upgrade modal
      upgradeTitle: "Your full access is ending soon",
      upgradeBody:
        "Only {{days}} {{unit}} left until the end of your full Life OS access. Keep your goals, routine, finances, MVD and history without interruption.",
      upgradeActivate: "Activate full access",
      upgradeRemindLater: "Remind me later",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "pt",
  fallbackLng: "pt",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useGoals } from '@/contexts/GoalsContext';
import { useMVD } from '@/contexts/MVDContext';
import { mockRoutineItems, mockLifeAreas } from '@/data/mockData';

export type MessageRole = 'user' | 'copilot';

export interface CopilotMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  category?: 'advice' | 'analysis' | 'reflection' | 'summary' | 'greeting';
}

export interface DailyAdvice {
  id: string;
  title: string;
  content: string;
  category: 'focus' | 'mindset' | 'action' | 'warning';
  icon: string;
}

export interface WeeklyAutoSummary {
  headline: string;
  wins: string[];
  challenges: string[];
  recommendations: string[];
  mentorMessage: string;
  performanceScore: number; // 0-100
}

const STORAGE_KEY = 'ai-copilot-conversation-v1';

// Simulated mentor response templates based on context
const generateMentorResponse = (
  userMessage: string,
  context: {
    avgGoalProgress: number;
    mvdStreak: number;
    activeGoalsCount: number;
    topArea?: string;
  }
): { content: string; category: CopilotMessage['category'] } => {
  const lower = userMessage.toLowerCase();

  // Decision / advice questions
  if (lower.includes('devo') || lower.includes('decisão') || lower.includes('decidir') || lower.includes('escolher')) {
    return {
      category: 'advice',
      content: `Boa pergunta. Antes de decidir, avalie 3 critérios: **impacto** (isso move uma meta importante?), **alinhamento** (combina com sua visão de longo prazo?) e **custo** (tempo/energia/dinheiro).\n\nCom base no seu contexto atual — ${context.activeGoalsCount} metas ativas e progresso médio de ${context.avgGoalProgress}% — minha sugestão é: priorize o que reforça suas metas que estão mais atrasadas. Distração estratégica neste momento custa caro.`,
    };
  }

  // Progress / how am I doing
  if (lower.includes('como estou') || lower.includes('progresso') || lower.includes('indo')) {
    const verdict = context.avgGoalProgress >= 70 
      ? 'Você está em ritmo excelente.' 
      : context.avgGoalProgress >= 50 
      ? 'Você está em ritmo saudável, mas há espaço para acelerar.'
      : 'Você está abaixo do ritmo ideal — é hora de recalibrar.';
    return {
      category: 'analysis',
      content: `${verdict}\n\n📊 **Progresso médio das metas:** ${context.avgGoalProgress}%\n🔥 **Streak MVD:** ${context.mvdStreak} dias\n🎯 **Metas ativas:** ${context.activeGoalsCount}\n\n${context.mvdStreak >= 7 ? 'Sua consistência diária está excelente — esse é o motor do crescimento.' : 'Foque em proteger seu MVD diário. Pequenas vitórias diárias compõem grandes resultados.'}`,
    };
  }

  // Motivation / feeling stuck
  if (lower.includes('cansado') || lower.includes('travado') || lower.includes('desmotivado') || lower.includes('difícil')) {
    return {
      category: 'reflection',
      content: `Entendo. Sentir-se travado faz parte do processo — não é falha, é sinal.\n\nQuando isso acontece, eu recomendo 3 movimentos:\n\n1. **Reduza a fricção** — escolha a menor versão possível da próxima ação (5 min).\n2. **Reconecte com o porquê** — releia uma de suas metas e o impacto que ela terá.\n3. **Mude o ambiente** — caminhe 10 minutos sem celular.\n\nSeu streak de ${context.mvdStreak} dias mostra que você tem disciplina. Use-a como prova de que consegue.`,
    };
  }

  // Planning
  if (lower.includes('planejar') || lower.includes('próxima semana') || lower.includes('plano')) {
    return {
      category: 'advice',
      content: `Excelente — planejar é o multiplicador de execução.\n\nPara a próxima semana, sugiro este framework:\n\n• **1 meta principal** que vai consumir 60% da sua energia\n• **3 ações específicas** vinculadas a ela\n• **1 hábito não-negociável** (proteja seu MVD)\n• **1 área de vida** que recebe atenção extra\n\nQual meta você escolheria como prioridade #1?`,
    };
  }

  // Habits
  if (lower.includes('hábito') || lower.includes('rotina') || lower.includes('disciplina')) {
    return {
      category: 'advice',
      content: `Hábitos são compostos. Pequenas ações repetidas = grandes mudanças.\n\nDuas observações sobre seu padrão atual:\n\n1. Seu streak de ${context.mvdStreak} dias é ${context.mvdStreak >= 14 ? 'sólido' : 'um bom começo'} — proteja ele acima de tudo.\n2. Hábitos vinculados a metas têm 3x mais aderência. Conecte cada novo hábito a um resultado claro.\n\nRegra prática: se um hábito demora mais de 5 minutos para iniciar, simplifique até caber em 2 minutos.`,
    };
  }

  // Finance
  if (lower.includes('dinheiro') || lower.includes('finança') || lower.includes('investir') || lower.includes('gastar')) {
    return {
      category: 'advice',
      content: `Finanças são reflexo de hábitos, não de renda.\n\nTrês perguntas que sempre faço antes de qualquer decisão financeira:\n\n• **Isso me aproxima da liberdade financeira?**\n• **Custo de oportunidade:** o que deixo de fazer com esse dinheiro?\n• **Se eu pudesse esperar 30 dias, ainda compraria?**\n\nUse o simulador da página de Revisões para ver o impacto de longo prazo de qualquer decisão.`,
    };
  }

  // Default reflective response
  const reflectivePrompts = [
    `Interessante. Conta mais — o que está te levando a pensar nisso agora?`,
    `Vamos destrinchar isso juntos. Qual seria o melhor cenário possível, e o que precisa ser verdade para chegar lá?`,
    `Boa reflexão. Em uma escala de 1-10, qual a urgência disso? E qual o impacto se você não agir nas próximas 2 semanas?`,
    `Posso te ajudar a estruturar isso. Você está buscando clareza, validação ou um plano de ação?`,
  ];

  return {
    category: 'reflection',
    content: reflectivePrompts[Math.floor(Math.random() * reflectivePrompts.length)],
  };
};

const dailyAdviceBank: DailyAdvice[] = [
  { id: 'a1', title: 'Energia antes de tarefas', content: 'Sua hora mais produtiva merece sua tarefa mais importante — não emails.', category: 'focus', icon: '⚡' },
  { id: 'a2', title: 'Regra dos 2 minutos', content: 'Se algo leva menos de 2 minutos e move uma meta, faça agora.', category: 'action', icon: '⏱️' },
  { id: 'a3', title: 'Foco no processo', content: 'Resultados são consequência. Confie no sistema diário, não no humor.', category: 'mindset', icon: '🧠' },
  { id: 'a4', title: 'Cuidado com a dispersão', content: 'Mais de 5 prioridades = nenhuma prioridade. Escolha 1-3 e proteja-as.', category: 'warning', icon: '⚠️' },
  { id: 'a5', title: 'Revisão semanal é alavanca', content: 'Quem revisa, ajusta. Quem ajusta, evolui. Reserve 30 min toda sexta.', category: 'mindset', icon: '🔄' },
  { id: 'a6', title: 'Sono como vantagem', content: 'Dormir bem não é luxo — é seu diferencial competitivo de longo prazo.', category: 'action', icon: '😴' },
  { id: 'a7', title: 'Decisões importantes pela manhã', content: 'Use a janela das 9h-11h para decisões estratégicas. À tarde, execute.', category: 'focus', icon: '🌅' },
];

export const useAICopilot = () => {
  const { goals } = useGoals();
  const { currentStreak } = useMVD();

  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch {}
    return [];
  });

  const [isThinking, setIsThinking] = useState(false);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Context computed from real data
  const context = useMemo(() => {
    const active = goals.filter(g => g.status === 'active');
    const avgProgress = active.length > 0
      ? Math.round(active.reduce((s, g) => s + g.progress, 0) / active.length)
      : 0;
    return {
      avgGoalProgress: avgProgress,
      mvdStreak: currentStreak,
      activeGoalsCount: active.length,
      topArea: mockLifeAreas[0]?.name,
    };
  }, [goals, currentStreak]);

  // Greeting on first load
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
      const initial: CopilotMessage = {
        id: `msg-${Date.now()}`,
        role: 'copilot',
        category: 'greeting',
        timestamp: new Date(),
        content: `${greeting}! Sou seu copiloto de vida 🧭\n\nEstou aqui para ajudar você a **pensar melhor**, **decidir com clareza** e **manter o ritmo**. Posso analisar seu progresso, sugerir próximos passos ou simplesmente ouvir.\n\nComo posso ajudar hoje? Algumas ideias para começar:\n\n• "Como estou indo nas minhas metas?"\n• "Devo focar em X ou Y esta semana?"\n• "Estou me sentindo travado"\n• "Me ajude a planejar a próxima semana"`,
      };
      setMessages([initial]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    // Simulated thinking delay
    setTimeout(() => {
      const response = generateMentorResponse(content, context);
      const aiMsg: CopilotMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'copilot',
        content: response.content,
        category: response.category,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 900 + Math.random() * 700);
  }, [context]);

  const clearConversation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  }, []);

  // Daily advice — deterministic per day
  const dailyAdvice = useMemo<DailyAdvice[]>(() => {
    const day = new Date().getDate();
    const start = day % dailyAdviceBank.length;
    return [
      dailyAdviceBank[start],
      dailyAdviceBank[(start + 2) % dailyAdviceBank.length],
      dailyAdviceBank[(start + 4) % dailyAdviceBank.length],
    ];
  }, []);

  // Weekly auto summary
  const weeklySummary = useMemo<WeeklyAutoSummary>(() => {
    const active = goals.filter(g => g.status === 'active');
    const avg = context.avgGoalProgress;
    const topGoals = [...active].sort((a, b) => b.progress - a.progress).slice(0, 2);
    const lagGoals = [...active].sort((a, b) => a.progress - b.progress).slice(0, 2);
    const topHabits = mockRoutineItems.filter(h => h.isActive).slice(0, 2);

    const performanceScore = Math.min(100, Math.round(avg * 0.6 + Math.min(currentStreak, 30) * 1.3));

    const headline = performanceScore >= 75
      ? 'Semana de alta performance — você está executando com consistência.'
      : performanceScore >= 50
      ? 'Semana sólida com pontos claros para acelerar.'
      : 'Semana de recalibração — pequenos ajustes vão destravar muita coisa.';

    const wins = [
      `Streak MVD ativo de ${currentStreak} dias — disciplina diária se transformando em resultado`,
      topGoals[0] ? `Avanço sólido em "${topGoals[0].title}" (${topGoals[0].progress}%)` : 'Metas mantidas em ritmo regular',
      topHabits[0] ? `Hábito "${topHabits[0].title}" mantido com consistência` : 'Rotina protegida ao longo da semana',
    ];

    const challenges = [
      lagGoals[0] ? `"${lagGoals[0].title}" precisa de atenção (${lagGoals[0].progress}%)` : 'Distribuição irregular de energia entre áreas',
      avg < 60 ? 'Progresso médio das metas abaixo do ideal — risco de atraso no trimestre' : 'Risco de complacência em áreas já consolidadas',
    ];

    const recommendations = [
      `Reserve ${avg < 50 ? '90' : '60'} minutos focados na meta mais atrasada esta semana`,
      'Faça uma revisão sexta-feira: o que cortar, o que dobrar?',
      currentStreak < 7 ? 'Proteja o MVD diário — é o motor de tudo' : 'Aumente em 1 a complexidade de um hábito-âncora',
    ];

    const mentorMessage = performanceScore >= 75
      ? 'Você está no caminho. Não confunda velocidade com pressa — sustente o ritmo.'
      : performanceScore >= 50
      ? 'Você tem a base. Agora é sobre escolher menos coisas e ir mais fundo.'
      : 'Reset estratégico: reduza o escopo, proteja o essencial, reconstrua o momentum.';

    return {
      headline,
      wins,
      challenges,
      recommendations,
      mentorMessage,
      performanceScore,
    };
  }, [goals, currentStreak, context.avgGoalProgress]);

  const suggestedPrompts = useMemo(() => [
    'Como estou indo nas minhas metas?',
    'Me ajude a planejar a próxima semana',
    'Estou me sentindo travado, o que faço?',
    'Devo focar mais em qual área agora?',
  ], []);

  return {
    messages,
    isThinking,
    sendMessage,
    clearConversation,
    dailyAdvice,
    weeklySummary,
    suggestedPrompts,
    context,
  };
};

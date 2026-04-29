import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, RotateCcw, Bot, User, Lightbulb, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react';
import { useAICopilot } from '@/hooks/useAICopilot';
import { cn } from '@/lib/utils';

const formatTime = (d: Date) =>
  new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const renderMarkdownLite = (text: string) => {
  // Lightweight: bold **text** and bullet lists
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      const content = line.replace(/^\s*[•\-]\s*/, '');
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
          {renderInline(content)}
        </li>
      );
    }
    if (/^\d+\.\s/.test(line.trim())) {
      const content = line.replace(/^\s*\d+\.\s*/, '');
      return (
        <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">
          {renderInline(content)}
        </li>
      );
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });
};

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const adviceCategoryStyle: Record<string, string> = {
  focus: 'border-primary/30 bg-primary/5',
  mindset: 'border-success/30 bg-success/5',
  action: 'border-warning/30 bg-warning/5',
  warning: 'border-destructive/30 bg-destructive/5',
};

export const AICopilotPanel = () => {
  const {
    messages,
    isThinking,
    sendMessage,
    clearConversation,
    dailyAdvice,
    weeklySummary,
    suggestedPrompts,
    context,
  } = useAICopilot();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header / Mentor Intro */}
      <Card variant="glow" className="overflow-hidden">
        <div className="h-1 gradient-primary" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Copiloto de Vida</h2>
                <Badge variant="outline" className="text-xs">IA Mentora</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Conversa diária, conselhos estratégicos e análise contínua do seu progresso.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" /> {context.activeGoalsCount} metas ativas
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {context.avgGoalProgress}% progresso médio
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {context.mvdStreak} dias de streak
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col" style={{ minHeight: '600px' }}>
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Conversa</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="text-xs text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Nova conversa
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback
                      className={cn(
                        msg.role === 'copilot'
                          ? 'gradient-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {msg.role === 'copilot' ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'flex-1 max-w-[80%] space-y-1',
                      msg.role === 'user' ? 'items-end text-right' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'inline-block rounded-2xl px-4 py-3 text-left',
                        msg.role === 'copilot'
                          ? 'bg-muted/50 border border-border/50'
                          : 'bg-primary/10 border border-primary/20'
                      )}
                    >
                      <div className="space-y-1">{renderMarkdownLite(msg.content)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                      <span>{formatTime(msg.timestamp)}</span>
                      {msg.category && msg.role === 'copilot' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {msg.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="gradient-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-muted/50 border border-border/50 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Pensando...
                  </div>
                </div>
              )}
            </div>

            {/* Suggested prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    disabled={isThinking}
                    className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-primary/40 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border/50 p-3">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte algo, peça um conselho, ou desabafe..."
                  rows={2}
                  className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isThinking}
                  variant="glow"
                  size="icon"
                  className="self-end h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side panel: Daily advice + Weekly summary */}
        <div className="space-y-6">
          {/* Weekly Auto Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Resumo Semanal Automático</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Performance</span>
                  <span className="text-sm font-semibold text-foreground">
                    {weeklySummary.performanceScore}/100
                  </span>
                </div>
                <Progress value={weeklySummary.performanceScore} className="h-2" />
              </div>

              <p className="text-sm text-foreground leading-relaxed">{weeklySummary.headline}</p>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-success uppercase tracking-wider">Vitórias</div>
                <ul className="space-y-1">
                  {weeklySummary.wins.map((w, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-success">✓</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-warning uppercase tracking-wider">Atenção</div>
                <ul className="space-y-1">
                  {weeklySummary.challenges.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-warning">!</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-primary uppercase tracking-wider">Recomendações</div>
                <ul className="space-y-1">
                  {weeklySummary.recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs italic text-foreground leading-relaxed">
                    "{weeklySummary.mentorMessage}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Advice */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-warning" />
                <CardTitle className="text-sm">Conselhos do Dia</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {dailyAdvice.map((advice) => (
                <div
                  key={advice.id}
                  className={cn(
                    'rounded-lg border p-3 transition-colors',
                    adviceCategoryStyle[advice.category]
                  )}
                >
                  <div className="flex gap-2">
                    <span className="text-lg leading-none">{advice.icon}</span>
                    <div className="flex-1 space-y-1">
                      <div className="text-xs font-semibold text-foreground">{advice.title}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {advice.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

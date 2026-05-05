import { Link, Navigate } from "react-router-dom";
import { Sparkles, Target, Calendar, TrendingUp, Wallet, BookOpen, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Target, title: "Metas SMART", desc: "Defina objetivos claros e acompanhe o progresso real ao longo do ano." },
  { icon: Calendar, title: "Rotina diária", desc: "Construa hábitos consistentes ligados às suas metas." },
  { icon: TrendingUp, title: "Mínimo Viável Diário", desc: "Garanta consistência mesmo nos dias difíceis." },
  { icon: Wallet, title: "Finanças no controle", desc: "Planejado vs realizado, metas de poupança e investimentos." },
  { icon: BookOpen, title: "Diário de evolução", desc: "Reflita, registre humor e acompanhe seu crescimento." },
  { icon: Brain, title: "Inteligência integrada", desc: "Recomendações e análises baseadas nos seus dados reais." },
];

const Landing = () => {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Life OS</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Seu sistema operacional pessoal
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Organize sua vida em um só lugar
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Life OS reúne metas, rotinas, finanças e reflexões em uma plataforma única —
          desenhada para acompanhar sua evolução de verdade, mês após mês.
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button asChild size="lg">
            <Link to="/auth">Criar minha conta</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Life OS · Seus dados, sua evolução.
      </footer>
    </div>
  );
};

export default Landing;

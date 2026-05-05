import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.string().trim().email({ message: "Email inválido" }).max(255);
const passwordSchema = z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Nome obrigatório" }).max(80);

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  // Sign in
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // Sign up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(siEmail);
      passwordSchema.parse(siPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Verifique os campos", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPassword });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase().includes("invalid") ? "Email ou senha incorretos." : "Não foi possível entrar agora. Tente novamente.";
      toast({ title: "Erro ao entrar", description: msg, variant: "destructive" });
      return;
    }
    navigate("/", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(suName);
      emailSchema.parse(suEmail);
      passwordSchema.parse(suPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({ title: "Verifique os campos", description: err.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setBusy(true);
    const { error, data } = await supabase.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { display_name: suName },
      },
    });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase().includes("registered") || error.message.toLowerCase().includes("already")
        ? "Este email já está cadastrado. Tente entrar."
        : "Não foi possível criar a conta. Verifique os dados e tente novamente.";
      toast({ title: "Erro no cadastro", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "Conta criada", description: "Vamos te mostrar como começar." });
    if (data.session) navigate("/onboarding", { replace: true });
    else navigate("/", { replace: true });
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast({ title: "Erro com Google", description: "Não foi possível entrar com o Google. Tente novamente.", variant: "destructive" });
      return;
    }
    if (result.redirected) return;
    navigate("/", { replace: true });
  };

  const handleForgot = async () => {
    if (!siEmail) {
      toast({ title: "Informe o email", description: "Digite seu email no campo acima primeiro." });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(siEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Erro", description: "Não foi possível enviar o link. Tente novamente em instantes.", variant: "destructive" });
      return;
    }
    toast({ title: "Verifique seu email", description: "Enviamos um link para redefinir sua senha." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Life OS</h1>
            <p className="text-sm text-muted-foreground">Seu sistema operacional pessoal</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Entre ou crie uma conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" autoComplete="email" value={siEmail} onChange={e => setSiEmail(e.target.value)} disabled={busy} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="si-password">Senha</Label>
                    <Input id="si-password" type="password" autoComplete="current-password" value={siPassword} onChange={e => setSiPassword(e.target.value)} disabled={busy} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>Entrar</Button>
                  <button type="button" onClick={handleForgot} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                    Esqueceu a senha?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Nome</Label>
                    <Input id="su-name" value={suName} onChange={e => setSuName(e.target.value)} disabled={busy} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" autoComplete="email" value={suEmail} onChange={e => setSuEmail(e.target.value)} disabled={busy} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-password">Senha</Label>
                    <Input id="su-password" type="password" autoComplete="new-password" value={suPassword} onChange={e => setSuPassword(e.target.value)} disabled={busy} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>Criar conta</Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
              Continuar com Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Ao entrar você concorda em ter seus dados isolados por usuário.{" "}
          <Link to="/" className="underline hover:text-foreground">Voltar</Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;

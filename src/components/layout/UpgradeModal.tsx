import { Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Constante mockada — substituir pela URL real da Hotmart depois ───────────
const HOTMART_LINK = "https://hotmart.com/product/seu-produto";
// ─────────────────────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  daysLeft: number;
}

export function UpgradeModal({ open, onClose, daysLeft }: UpgradeModalProps) {
  function handleActivate() {
    window.open(HOTMART_LINK, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="max-w-md text-center gap-6"
        onInteractOutside={(e) => e.preventDefault()} // força fechar só pelo botão
      >
        {/* Ícone decorativo */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>

        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold leading-tight">
            Seu acesso completo está acabando
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Faltam apenas{" "}
            <span className="font-semibold text-foreground">
              {daysLeft} {daysLeft === 1 ? "dia" : "dias"}
            </span>{" "}
            para o fim do seu acesso total ao Life OS.{" "}
            Continue com metas, rotina, finanças, MVD e histórico sem
            interrupções.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full gap-2 font-semibold"
            onClick={handleActivate}
          >
            <Zap className="h-4 w-4" />
            Ativar acesso completo
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
          >
            Lembrar depois
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

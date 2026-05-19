import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  function switchTo(lang: string) {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchTo("pt")}
        className={`h-7 px-2 text-sm transition-opacity ${
          current === "pt"
            ? "opacity-100 font-semibold"
            : "opacity-40 hover:opacity-70"
        }`}
        title="Português"
      >
        🇧🇷
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => switchTo("en")}
        className={`h-7 px-2 text-sm transition-opacity ${
          current === "en"
            ? "opacity-100 font-semibold"
            : "opacity-40 hover:opacity-70"
        }`}
        title="English"
      >
        🇺🇸
      </Button>
    </div>
  );
}

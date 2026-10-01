import { RefObject } from "react";
import { Palette, Check, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { THEMES, ThemeOption } from "@/lib/theme";

interface WatchlistHeaderProps {
  activeTheme: string;
  isThemeOpen: boolean;
  setIsThemeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  themePopoverRef: RefObject<HTMLDivElement | null>;
  handleSelectTheme: (themeId: string) => Promise<void>;
  is18PlusEnabled: boolean;
  toggle18Plus: (checked: boolean) => void;
  onLogoutClick: () => void;
}

export function WatchlistHeader({
  activeTheme,
  isThemeOpen,
  setIsThemeOpen,
  themePopoverRef,
  handleSelectTheme,
  is18PlusEnabled,
  toggle18Plus,
  onLogoutClick,
}: WatchlistHeaderProps) {
  return (
    <header className="sticky top-2 sm:top-4 z-40 rounded-2xl border border-border/40 bg-[#0c0e17]/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-neon animate-ping" />
          <span className="font-display text-sm sm:text-base font-bold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-foreground drop-shadow-[0_0_15px_var(--neon)]">
            ANIME ON
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* THEMES BUTTON & POPOVER */}
          <div className="relative" ref={themePopoverRef}>
            <button
              type="button"
              onClick={() => setIsThemeOpen((prev) => !prev)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] rounded-xl border border-border/40 bg-secondary/30 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground transition-all hover:border-border hover:bg-secondary/60 hover:text-foreground active:scale-95"
              aria-label="Select Theme"
              aria-expanded={isThemeOpen}
            >
              <Palette className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Themes</span>
            </button>

            {/* Theme Selector Popover */}
            {isThemeOpen && (
              <div
                className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/40 bg-[#0c0e17]/95 p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 animate-in fade-in zoom-in-95"
                role="menu"
              >
                <div className="px-3 py-1.5 border-b border-border/20 mb-1 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Theme Library
                  </p>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-neon font-semibold">
                    {THEMES.length} Themes
                  </span>
                </div>
                <div className="space-y-1 max-h-60 sm:max-h-72 overflow-y-auto pr-1 scrollbar-none">
                  {THEMES.map((t: ThemeOption) => {
                    const isActive = activeTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => void handleSelectTheme(t.id)}
                        className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all min-h-[40px] ${
                          isActive
                            ? "bg-secondary/60 text-foreground border border-neon/40 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                        }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {t.colorSecondaryHex ? (
                            <div className="relative h-3.5 w-3.5 shrink-0">
                              <span
                                className="absolute left-0 top-0 h-3 w-3 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: t.colorHex }}
                              />
                              <span
                                className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-black/40 shadow-sm"
                                style={{ backgroundColor: t.colorSecondaryHex }}
                              />
                            </div>
                          ) : (
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/40 shadow-sm shrink-0"
                              style={{ backgroundColor: t.colorHex }}
                            />
                          )}
                          <span className="truncate">{t.name}</span>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-neon shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 py-3 border-t border-border/20 mt-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-foreground">
                    18+ Content
                  </p>
                  <Switch checked={is18PlusEnabled} onCheckedChange={toggle18Plus} />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onLogoutClick}
            className="inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] rounded-xl border border-border/40 bg-secondary/30 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] sm:tracking-[0.18em] text-muted-foreground transition-all hover:border-border hover:bg-secondary/60 hover:text-foreground active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

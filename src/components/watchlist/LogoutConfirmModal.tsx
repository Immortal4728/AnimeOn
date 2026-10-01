import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  isOpen,
  isLoggingOut,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-[#07090e]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-border/50 bg-[#0c0e17]/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-10 space-y-6 text-center animate-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neon/40 bg-neon/10 text-neon shadow-[0_0_20px_rgba(236,72,153,0.25)]">
          <LogOut className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-[0.16em] text-foreground">
            LOGOUT CONFIRMATION
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed tracking-[0.05em]">
            Are you sure you want to sign out of your personal archive?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-neon/60 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:bg-primary/90 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

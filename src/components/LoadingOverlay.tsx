export function LoadingOverlay({ open, message }: { open: boolean; message: string }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
      role="alertdialog"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="rounded-2xl bg-card p-10 text-center shadow-card">
        <img src="/bcare-logo.svg" alt="" className="mx-auto mb-5 w-[120px]" />
        <p className="mb-5 text-base font-semibold text-foreground">{message}</p>
        <div className="mx-auto h-[50px] w-[50px] animate-spin-slow rounded-full border-4 border-border border-t-accent" />
      </div>
    </div>
  )
}

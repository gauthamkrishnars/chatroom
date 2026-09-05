export default function Footer({ onOpenLegal }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800/80 bg-[#08090e] py-4 px-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real Time Operational</span>
          </div>
          <span className="text-slate-700">•</span>
          <span>&copy; {currentYear} PulseChat</span>
        </div>

        {/* Center: Tech stack indicator */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>Powered by</span>
          <span className="font-semibold text-slate-400">React</span>
          <span>&amp;</span>
          <span className="font-semibold text-slate-400">Firebase Firestore</span>
        </div>

        {/* Right: Functional Legal Links (opens Modals) */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </footer>
  )
}

export default function Footer({ onOpenLegal }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2.5 text-xs text-slate-500 sm:flex-row">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Systems Operational</span>
          </div>
          <span className="text-slate-300">•</span>
          <span>&copy; {currentYear} PulseChat</span>
        </div>

        {/* Center: Tech stack indicator */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>Powered by</span>
          <span className="font-semibold text-slate-700">React</span>
          <span>&amp;</span>
          <span className="font-semibold text-slate-700">Firebase Firestore</span>
        </div>

        {/* Right: Functional Legal Links (opens Modals) */}
        <div className="flex items-center gap-4 text-slate-500">
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </footer>
  )
}

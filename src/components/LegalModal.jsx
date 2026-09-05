import { X, ShieldCheck, FileText } from 'lucide-react'

export default function LegalModal({ type, isOpen, onClose }) {
  if (!isOpen) return null

  const isTerms = type === 'terms'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-800 bg-[#0f121d] shadow-2xl shadow-black/90 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {isTerms ? <FileText className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isTerms ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <p className="text-xs text-slate-400">
                Effective Date: September 5, 2026 • PulseChat Technologies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs leading-relaxed text-slate-300 space-y-5">
          {isTerms ? (
            <>
              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">1. Acceptance of Terms</h3>
                <p>
                  By accessing or using PulseChat, you agree to comply with and be bound by these Terms of Service. If you do not agree to all terms and conditions stated here, you must cease using the application immediately.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">2. User Accounts and Authentication</h3>
                <p>
                  To post messages in public or private chat rooms, you may authenticate via Google OAuth or provide an email and password. You are solely responsible for maintaining the confidentiality of your login credentials and for all actions taken under your account. You agree to notify us immediately if you suspect unauthorized access.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">3. Acceptable Community Conduct</h3>
                <p>
                  PulseChat exists to foster open collaboration and community discussions. You agree not to transmit, publish, or share content that:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li>Violates applicable local, national, or international laws.</li>
                  <li>Harasses, stalks, threatens, or infringes upon the personal rights of other users.</li>
                  <li>Distributes malicious software, scripts, phishing URLs, or automated spam bots.</li>
                  <li>Attempts to disrupt Firebase server operations or Firestore query quotas.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">4. Content Ownership and License</h3>
                <p>
                  You retain ownership of the messages and media you transmit across PulseChat rooms. By posting messages to public chat rooms, you grant PulseChat a non exclusive, royalty free license to store, sync, and display that content to active room participants in real time.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">5. Disclaimer and Limitation of Liability</h3>
                <p>
                  PulseChat is provided on an "as is" and "as available" basis without warranties of any kind. Under no circumstances will PulseChat Technologies or its operators be liable for indirect, incidental, or consequential damages resulting from data loss, network outages, or unauthorized account tampering.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">1. Information We Collect</h3>
                <p>
                  We collect information necessary to operate real time chat functionality across our network:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li><strong>Account Data:</strong> Display name, email address, and profile photo URL supplied during Google Sign In or email registration.</li>
                  <li><strong>Message Data:</strong> Chat messages, reaction counts, room identifiers, and creation timestamps stored inside Google Cloud Firestore.</li>
                  <li><strong>Technical Telemetry:</strong> Device user agent and network connection status used for live presence synchronization.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">2. How We Use Your Data</h3>
                <p>
                  Collected data is used strictly to authenticate members, broadcast real time room messages to active subscribers, and maintain network reliability. We do not sell, rent, or trade your personal information to third party advertisers.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">3. Third Party Cloud Infrastructure</h3>
                <p>
                  PulseChat relies on Google Firebase (Authentication and Cloud Firestore) to handle identity verification and real time database streaming. Your interactions comply with Google Cloud privacy and compliance certifications.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">4. Data Retention and Deletion</h3>
                <p>
                  You may request the deletion of your account and associated messages at any time. When an account is terminated, your authentication token is revoked immediately and your profile data is purged from the database.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-white mb-1.5">5. Contact and Privacy Inquiries</h3>
                <p>
                  If you have questions regarding this Privacy Policy or your personal records, contact our privacy team directly at <span className="text-indigo-400 font-mono">privacy@pulsechat.app</span>.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 p-4 bg-slate-950/40">
          <span className="text-[11px] text-slate-500 font-mono">Document v2.4</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}

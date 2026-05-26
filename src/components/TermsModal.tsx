"use client";

import { useState, useEffect } from "react";

const TERMS_ACCEPTED_KEY = "advocate_terms_accepted";

export function TermsModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (!accepted) {
      setShowModal(true);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    setShowModal(false);
    document.body.style.overflow = "";
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60">
      <div className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6">
        <div className="mx-auto my-4 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:my-8 sm:p-6">
          {/* Header */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">⚖️</span>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Terms of Use</h1>
          </div>

          {/* Content */}
          <div className="text-sm text-gray-700 sm:text-base">
            <p className="font-medium">
              Please read and accept the following terms before using this application.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">1. Research Purpose Only</h3>
            <p className="mt-1">
              This application is designed solely for legal research and informational purposes. 
              The information provided should not be construed as legal advice.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">2. No Attorney-Client Relationship</h3>
            <p className="mt-1">
              Use of this application does not create an attorney-client relationship. 
              The responses are generated using artificial intelligence.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">3. Accuracy Disclaimer</h3>
            <p className="mt-1">
              We do not guarantee that the information provided is complete, accurate, or up-to-date. 
              Always verify information from official sources.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">4. AI-Generated Content</h3>
            <p className="mt-1">
              Responses are generated using AI technology and may contain errors. 
              Case citations must be independently verified.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">5. Limitation of Liability</h3>
            <p className="mt-1">
              To the fullest extent permitted by law, we shall not be liable for any damages 
              arising from your use of this application or actions taken based on the information provided.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">6. Data Privacy</h3>
            <p className="mt-1">
              Your queries may be processed by third-party AI services. Do not enter 
              sensitive client information or confidential case details.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">7. Governing Law</h3>
            <p className="mt-1">
              These terms shall be governed by the laws of India.
            </p>
          </div>

          {/* Accept Button */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleAccept}
              className="w-full rounded-full bg-[var(--primary)] py-3.5 text-base font-semibold text-white transition-all hover:bg-[var(--primary-dark)] active:scale-[0.98]"
            >
              I Accept the Terms of Use
            </button>
            <p className="text-center text-xs text-gray-500">
              By clicking &quot;I Accept&quot;, you agree to be bound by these Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

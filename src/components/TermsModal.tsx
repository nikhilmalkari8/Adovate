"use client";

import { useState, useEffect } from "react";

const TERMS_ACCEPTED_KEY = "advocate_terms_accepted";

export function TermsModal() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY);
    if (!accepted) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <h1 className="text-2xl font-bold text-gray-900">Terms of Use</h1>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="font-medium">
            Please read and accept the following terms before using Advocate.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">1. Research Purpose Only</h3>
          <p>
            This application is designed solely for legal research and informational purposes. 
            The information provided should not be construed as legal advice, and should not 
            be relied upon as a substitute for consultation with a qualified legal professional.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">2. No Attorney-Client Relationship</h3>
          <p>
            Use of this application does not create an attorney-client relationship. 
            The information and responses provided are generated using artificial intelligence 
            and publicly available legal texts.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">3. Accuracy Disclaimer</h3>
          <p>
            While we strive for accuracy, we do not guarantee that the information provided 
            is complete, accurate, or up-to-date. Laws and legal interpretations change 
            frequently. Always verify information from official sources such as:
          </p>
          <ul className="list-disc pl-5">
            <li>India Code (indiacode.nic.in)</li>
            <li>Supreme Court of India (sci.gov.in)</li>
            <li>Official Gazettes and Court Records</li>
          </ul>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">4. AI-Generated Content</h3>
          <p>
            Responses are generated using artificial intelligence (AI) technology. 
            AI-generated content may contain errors, omissions, or inaccuracies. 
            Case citations and legal references must be independently verified before 
            use in any legal proceeding or official document.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">5. Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, Advocate and its creators, operators, 
            and affiliates shall not be liable for any direct, indirect, incidental, 
            consequential, or punitive damages arising from:
          </p>
          <ul className="list-disc pl-5">
            <li>Your use of or inability to use this application</li>
            <li>Any errors or omissions in the content provided</li>
            <li>Any actions taken based on the information provided</li>
            <li>Any unauthorized access to your data</li>
          </ul>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">6. User Responsibility</h3>
          <p>
            You are solely responsible for verifying all legal information before relying 
            on it. You agree to use this application at your own risk and acknowledge that 
            legal matters require professional advice tailored to specific circumstances.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">7. Data Privacy</h3>
          <p>
            Your queries may be processed by third-party AI services. Do not enter 
            sensitive client information, privileged communications, or confidential 
            case details into this application.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">8. Modifications</h3>
          <p>
            We reserve the right to modify these terms at any time. Continued use of 
            the application constitutes acceptance of any modified terms.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">9. Governing Law</h3>
          <p>
            These terms shall be governed by and construed in accordance with the laws 
            of India. Any disputes shall be subject to the exclusive jurisdiction of 
            the courts in India.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleAccept}
            className="w-full rounded-full bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            I Accept the Terms of Use
          </button>
          <p className="text-center text-xs text-gray-500">
            By clicking &quot;I Accept&quot;, you acknowledge that you have read, understood, 
            and agree to be bound by these Terms of Use.
          </p>
        </div>
      </div>
    </div>
  );
}

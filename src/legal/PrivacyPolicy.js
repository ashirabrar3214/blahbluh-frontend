import React from 'react';
import Navbar from '../marketing/Navbar';
import Footer from './Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0e0e0f] text-zinc-100 flex flex-col font-sans pt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-6 text-white">Blahbluh Privacy Policy</h1>
        <p className="mb-4 text-zinc-400">Last updated: February 22, 2026</p>
        <p className="text-zinc-300 mb-8">Blahbluh, an independently operated online service ("we", "us", "our"), operates the Service. This Privacy Policy describes our collection, use, and handling of information.</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Information We Collect</h2>
          <ul className="list-disc ml-6 text-zinc-300 mb-2">
            <li><strong>Account data:</strong> email address (limited access), Google account ID and basic profile info (name, email, profile picture) when signing in with Google.</li>
            <li><strong>Usage data:</strong> IP address, device identifiers, browser type, OS, timestamps, interaction logs, match history, ratings given/received, prompts viewed/responded to.</li>
            <li><strong>Content data:</strong> text messages, shared GIFs/Reels (from whitelisted sources), friend connections.</li>
          </ul>
          <p className="text-zinc-300 mb-2">We may store and log user messages and interaction history for moderation, abuse prevention, and legal compliance.</p>
          <p className="text-zinc-300">No direct image/video uploads; no camera/microphone access required. No precise geolocation or payment data (service currently free).</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Legal Basis for Processing</h2>
          <p className="text-zinc-300 mb-2">We process personal data based on:</p>
          <ul className="list-disc ml-6 text-zinc-300">
            <li>Legitimate interests (operating, securing, and improving the Service, preventing abuse).</li>
            <li>Consent (when you create an account or provide information).</li>
            <li>Compliance with legal obligations.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">3. How We Use Information</h2>
          <ul className="list-disc ml-6 text-zinc-300 mb-2">
            <li>Operate and improve the Service (matching, prompts, friends system).</li>
            <li>Moderate content, enforce rules, detect and prevent abuse.</li>
            <li>Adjust visibility/match priority using anonymized/aggregated ratings.</li>
            <li>Comply with law, respond to legal requests, protect safety.</li>
            <li>Internal analytics.</li>
          </ul>
          <p className="text-zinc-300">We do not use data for targeted advertising currently. Future changes will be notified.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Sharing & Disclosure</h2>
          <p className="text-zinc-300 mb-2">We share data only:</p>
          <ul className="list-disc ml-6 text-zinc-300 mb-2">
            <li>With service providers (Google authentication, hosting, moderation tools) under strict contracts.</li>
            <li>To comply with law, court orders, subpoenas, or to protect rights/safety (including imminent harm or child exploitation reporting).</li>
            <li>In aggregated/anonymized form for analytics.</li>
          </ul>
          <p className="text-zinc-300">We do not sell or share personal information for cross-context behavioral advertising.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">5. Cookies and Tracking Technologies</h2>
          <p className="text-zinc-300">We use cookies and similar technologies for authentication, session management, security, and analytics. You may control cookies through your browser settings.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">6. Data Retention</h2>
          <ul className="list-disc ml-6 text-zinc-300 mb-2">
            <li><strong>Account data:</strong> while account active + 90 days after deletion.</li>
            <li><strong>Interaction logs, messages, ratings:</strong> up to 2 years or longer for abuse prevention/legal compliance.</li>
            <li><strong>IP/device logs:</strong> up to 1 year for moderation/legal purposes.</li>
          </ul>
          <p className="text-zinc-300">Deleted content may remain in backups for a limited time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">7. Your Rights and Account Deletion</h2>
          <p className="text-zinc-300 mb-2">You may access, correct, or delete your data, request restriction or portability (where applicable), or withdraw consent.</p>
          <p className="text-zinc-300 mb-2">You may delete your account at any time through account settings or by contacting hello@blahbluh.com.</p>
          <p className="text-zinc-300">Email hello@blahbluh.com to exercise rights. We may verify identity before responding.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">8. Security</h2>
          <p className="text-zinc-300">We use reasonable technical and organizational measures to protect data. However, no system is completely secure, and we cannot guarantee absolute security. You use the Service at your own risk.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">9. International Transfers</h2>
          <p className="text-zinc-300">Data may be processed in the United States or other countries. By using the Service you consent to transfer to the US.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">10. Children's Privacy</h2>
          <p className="text-zinc-300">The Service is strictly for users 18+. We do not knowingly collect data from anyone under 18.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">11. Third-Party Links Disclaimer</h2>
          <p className="text-zinc-300">Third-party content and platforms (e.g., whitelisted GIF/Reel sources) may have their own privacy practices. We are not responsible for their policies or practices.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">12. Changes to Policy</h2>
          <p className="text-zinc-300">We may update this Policy. Continued use after changes constitutes acceptance.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">13. Contact</h2>
          <p className="text-zinc-300">hello@blahbluh.com</p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

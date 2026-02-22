import React from 'react';
import Navbar from '../marketing/Navbar';
import Footer from './Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#0e0e0f] text-zinc-100 flex flex-col font-sans pt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <h1 className="text-3xl font-bold mb-6 text-white">Blahbluh Terms of Service</h1>
        <p className="mb-4 text-zinc-400">Last updated: February 22, 2026</p>
        <p className="text-zinc-300 mb-8">These Terms of Service ("Terms") form a legally binding agreement between you ("you", "User", "your") and Blahbluh, an independently operated online service ("we", "us", "our"), governing your access to and use of the Blahbluh website and any associated mobile applications when released, together with all related features, AI-generated prompts, messaging, media sharing, reputation systems, friend connections, and other functionalities (collectively, the "Service").</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
          <p className="text-zinc-300">Accessing, browsing, registering for, or using the Service means you agree to these Terms and our Privacy Policy (incorporated by reference). If you do not agree, stop using the Service immediately. Continued use after changes constitutes acceptance.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Eligibility</h2>
          <p className="text-zinc-300">You must be at least eighteen (18) years old to access or use the Service. No minors are permitted under any circumstances. We do not allow users under 18. Accounts of users under 18 will be terminated.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Accounts and Registration</h2>
          <ul className="list-disc ml-6 text-zinc-300 mb-2">
            <li>Email-only signup: limited to 5 matches per day.</li>
            <li>Google authentication (required for full features and mobile app when released): up to 50 matches per day.</li>
          </ul>
          <p className="text-zinc-300">Additional login methods may be added. You must provide accurate information and keep it current. You are fully responsible for account security and all activity under your account. Accounts are non-transferable.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">4. Description of Service</h2>
          <p className="text-zinc-300">Blahbluh is a text-first random stranger-chat platform using AI-generated prompts for structured conversation. It is <strong>not</strong> a dating service, hookup platform, or romantic tool. The Service is strictly non-romantic and non-sexual. Any use for dating, sexual solicitation, romantic pursuit, or related purposes is expressly prohibited and grounds for immediate permanent suspension.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">5. User Conduct and Prohibited Activities</h2>
          <p className="text-zinc-300 mb-2">You must not:</p>
          <ul className="list-disc ml-6 text-zinc-300 mb-2">
            <li>harass, threaten, groom, solicit sexually, exploit, discriminate, spam, or abuse others;</li>
            <li>post illegal, obscene, pornographic, explicit, violent, defamatory, infringing, or harmful content;</li>
            <li>impersonate others or misrepresent identity;</li>
            <li>bypass safety, moderation, rating, or matching systems;</li>
            <li>share links outside whitelisted domains or attempt non-permitted media uploads;</li>
            <li>use automation, bots, or scripts to access the Service;</li>
            <li>solicit personal/financial information or advertise without permission;</li>
            <li>violate laws or third-party rights.</li>
          </ul>
          <p className="text-zinc-300">We may suspend, terminate, reduce visibility, or ban users for violations.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">6. Section 230 Protection</h2>
          <p className="text-zinc-300">Blahbluh is an interactive computer service provider under 47 U.S.C. § 230. We are not the publisher or speaker of user-generated content and are not responsible or liable for any content created or posted by users.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">7. Content and Licenses</h2>
          <p className="text-zinc-300">You retain ownership of your content but grant us a worldwide, non-exclusive, royalty-free, sublicensable license to host, display, reproduce, and distribute it as needed to operate the Service. This license ends when you delete your content or terminate your account, except for residual backups and legal retention requirements. We own all platform elements, AI prompts, software, and trademarks.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">8. Ratings and Reputation</h2>
          <p className="text-zinc-300">Post-match ratings are mandatory and used internally for matchmaking and visibility. Low ratings may reduce access or visibility. Ratings are private to you.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">9. Media and Links</h2>
          <p className="text-zinc-300">Sharing restricted to whitelisted GIFs/Reels only. Direct uploads and non-whitelisted links prohibited. We may block or remove any content at our discretion.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">10. Assumption of Risk</h2>
          <p className="text-zinc-300">You understand that you will interact with other users and that we cannot control or guarantee their conduct. You assume all risks associated with communicating with strangers online.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">11. No Duty to Monitor</h2>
          <p className="text-zinc-300">We are not obligated to monitor all user activity or communications, but we reserve the right to do so.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">12. Monitoring and Disclosure</h2>
          <p className="text-zinc-300">We reserve the right to monitor, log, and disclose user activity, communications, and data when required by law, subpoena, court order, or when necessary to protect safety, prevent harm, or comply with legal obligations.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">13. Data Retention</h2>
          <p className="text-zinc-300">We may retain IP addresses, device identifiers, interaction logs, ratings, and other data for moderation, safety, fraud prevention, and legal compliance purposes.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">14. No Special Relationship</h2>
          <p className="text-zinc-300">Nothing in these Terms creates any partnership, agency, fiduciary, or special relationship between you and us.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">15. No Warranties</h2>
          <p className="text-zinc-300">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM MERCHANTABILITY, FITNESS, NON-INFRINGEMENT, ACCURACY, AND UNINTERRUPTED/ERROR-FREE OPERATION.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">16. Limitation of Liability</h2>
          <p className="text-zinc-300">TO THE FULLEST EXTENT PERMITTED BY LAW, OUR LIABILITY IS LIMITED TO USD $100 OR AMOUNTS YOU PAID US IN THE PRIOR 12 MONTHS, WHICHEVER IS GREATER. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">17. Indemnification</h2>
          <p className="text-zinc-300">You agree to indemnify and hold us harmless from claims, damages, losses, and expenses (including attorneys' fees) arising from your use of the Service, your content, or violation of these Terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">18. Termination</h2>
          <p className="text-zinc-300">We may suspend or terminate your access at any time, without notice, for any reason or no reason. Upon termination, access ends and data may be deleted subject to legal retention requirements.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">19. Governing Law and Arbitration</h2>
          <p className="text-zinc-300">Governed by Mississippi law. This arbitration agreement is governed by the Federal Arbitration Act. Disputes resolved by binding arbitration under AAA Consumer Rules in Oxford, Mississippi. No class actions or jury trials. You may opt out within 30 days by emailing hello@blahbluh.com with subject "Arbitration Opt-Out".</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">20. Changes to Terms</h2>
          <p className="text-zinc-300">We may update these Terms. Continued use after changes means acceptance.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">21. Contact</h2>
          <p className="text-zinc-300">hello@blahbluh.com</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3 text-white">22. Miscellaneous</h2>
          <p className="text-zinc-300">Entire agreement. Invalid provisions do not affect remainder. No waiver of breach waives future breaches. We may assign these Terms; you may not. Sections regarding ownership, disclaimers, limitation of liability, indemnification, arbitration, and any provisions which by their nature should survive termination shall survive termination.</p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;

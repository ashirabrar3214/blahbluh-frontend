import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p className="text-gray-700">By accessing or using Blahbluh, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">2. User Conduct</h2>
        <p className="text-gray-700 mb-2">You agree not to engage in any of the following prohibited activities:</p>
        <ul className="list-disc ml-6 text-gray-700">
            <li>Using the service for any illegal purpose or in violation of any local, state, national, or international law.</li>
            <li>Harassing, threatening, or defrauding other users.</li>
            <li>Posting content that is hate speech, threatening, or pornographic.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">3. Content Ownership</h2>
        <p className="text-gray-700">You retain ownership of the content you post on Blahbluh, but you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.</p>
      </section>

    </div>
  );
};

export default TermsOfService;
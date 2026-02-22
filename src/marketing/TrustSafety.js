import React from 'react';

const TrustSafety = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Trust & Safety</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
        <p className="text-gray-700">We are committed to creating a safe, inclusive, and respectful environment for all users. We believe that text-based communication should be fun and engaging, not harmful.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Moderation Policies</h2>
        <p className="text-gray-700 mb-2">We employ a combination of automated tools and human moderation to review content. Our core safety pillars include:</p>
        <ul className="list-disc ml-6 text-gray-700">
            <li><strong>Zero Tolerance for Hate Speech:</strong> We do not tolerate harassment, bullying, or hate speech based on race, ethnicity, religion, gender, or sexual orientation.</li>
            <li><strong>Privacy Protection:</strong> Doxing or sharing private information of others is strictly prohibited.</li>
            <li><strong>Spam Prevention:</strong> We actively work to keep the platform free of spam and malicious bots.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Reporting</h2>
        <p className="text-gray-700">If you see something that violates our policies, please report it using the in-app reporting tools found on every post and profile, or contact our support team directly.</p>
      </section>
    </div>
  );
};

export default TrustSafety;
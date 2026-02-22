import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
        <p className="text-gray-700">Welcome to Blahbluh. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">2. Data We Collect</h2>
        <p className="text-gray-700 mb-2">We collect data to provide better services to all our users. This includes:</p>
        <ul className="list-disc ml-6 text-gray-700">
            <li><strong>Identity Data:</strong> Username, or similar identifier.</li>
            <li><strong>Contact Data:</strong> Email address.</li>
            <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, products, and services (e.g., Yapping Cards, Fire Chats).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">3. Cookies</h2>
        <p className="text-gray-700">We use cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.</p>
      </section>
      
      {/* Add more sections as needed for AdSense compliance */}
    </div>
  );
};

export default PrivacyPolicy;
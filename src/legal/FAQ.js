import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: "What is a Yapping Card?",
      answer: "A Yapping Card is a short text post where you can share quick updates, thoughts, or jokes. Think of it as a digital sticky note for your followers."
    },
    {
      question: "How do Fire Chats work?",
      answer: "Fire Chats are real-time discussion rooms focused on specific trending topics. They are designed for fast-paced, live interaction."
    },
    {
      question: "Is Blahbluh free to use?",
      answer: "Yes, Blahbluh is completely free to join and use. We may introduce optional premium features in the future."
    },
    {
      question: "How do I report inappropriate content?",
      answer: "You can report any post or user by clicking the three dots (...) menu associated with the content and selecting 'Report'."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account at any time from the Settings page. This action is permanent."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-medium text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
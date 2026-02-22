import React from 'react';

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">About Blahbluh</h1>
      
      <div className="text-lg text-gray-700 space-y-6 leading-relaxed">
        <p>
          Blahbluh was born from a simple idea: social media has become too performative. 
          Video and image-based platforms create immense pressure to look perfect, curate every moment, and compete for visual attention.
        </p>
        <p>
          We believe in the power of text. Text lowers the social risk. It allows you to express 
          ideas, jokes, and thoughts without worrying about lighting, angles, or your appearance.
        </p>
        <p>
          Our mission is to bring back authentic connection through low-friction, text-first interactions. 
          Whether you're "yapping" about your day or engaging in a "fire chat" about a hot topic, 
          Blahbluh is your space to be heard, not just seen.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
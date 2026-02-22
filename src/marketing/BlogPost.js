import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../legal/Footer';

const BlogPost = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#0e0e0f] text-zinc-100 flex flex-col font-sans pt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-3xl flex-1">
        <h1 className="text-3xl font-bold text-white mb-6">Blog Post {id}</h1>
        <div className="prose prose-lg prose-invert text-zinc-400">
          <p>This is a placeholder page for blog post #{id}. Content coming soon.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
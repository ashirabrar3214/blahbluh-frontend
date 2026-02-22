import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../legal/Footer';

const Blog = () => {
  // Placeholder data - in a real app, this would come from an API or CMS
  const posts = [
    {
      id: 1,
      title: "How to Make International Friends Online",
      excerpt: "Connecting with people from different cultures is easier than ever with text-based platforms. Here are 5 tips to get started...",
      date: "October 15, 2023",
      category: "Community"
    },
    {
      id: 2,
      title: "The Rise of Text-Based Social Media",
      excerpt: "Why users are shifting away from video fatigue and back to the written word. The psychology behind low-stakes interaction.",
      date: "November 2, 2023",
      category: "Trends"
    },
    {
      id: 3,
      title: "Community Guidelines Update: Keeping Blahbluh Safe",
      excerpt: "We've updated our guidelines to ensure a safer space for everyone. Read about the new moderation tools we're implementing.",
      date: "November 20, 2023",
      category: "Announcements"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0e0e0f] text-zinc-100 flex flex-col font-sans pt-20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Blahbluh Blog</h1>
        <p className="text-center text-zinc-400 mb-10">Resources, updates, and stories from the community.</p>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/20 transition-all flex flex-col">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">{post.category}</span>
                  <span className="text-xs text-zinc-500">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-3 text-white">{post.title}</h2>
                <p className="text-zinc-400 mb-4 flex-1 text-sm leading-relaxed">{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} className="text-amber-500 hover:text-amber-400 font-bold text-sm inline-flex items-center mt-auto">
                  Read more 
                  <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
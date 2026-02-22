import React from 'react';
import { Link } from 'react-router-dom';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Blahbluh Blog</h1>
      <p className="text-center text-gray-600 mb-10">Resources, updates, and stories from the community.</p>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{post.category}</span>
                <span className="text-xs text-gray-500">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900">{post.title}</h2>
              <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
              <Link to={`/blog/${post.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center mt-auto">
                Read more 
                <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
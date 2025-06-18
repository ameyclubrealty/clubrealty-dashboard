'use client'
import React, { useEffect, useState } from 'react';
import { deleteBlogPost, getBlogPosts } from '../../../lib/firebase/blog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isPublished: boolean;
  category: string,
}

const BlogList = () => {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState('all');
  const [uniqueCategoryCount, setUniqueCategoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // State to track loading

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setIsLoading(true); // Set loading to true when starting to fetch
      const { success, blogPosts } = await getBlogPosts();
      if (success && blogPosts) {
        setBlogPosts(blogPosts);
      } else {
        setBlogPosts([]);
      }
      setIsLoading(false); // Set loading to false after fetching
    };
    fetchBlogPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      const { success } = await deleteBlogPost(id);
      if (success) {
        alert('Blog post deleted successfully');
        setBlogPosts((prev) => prev.filter((post) => post.id !== id));
      } else {
        alert('Failed to delete the blog post');
      }
    }
  };

  const filteredBlogPosts = blogPosts.filter((post) => {
    if (filter === 'all') return true;
    // Add more filter conditions as needed
    return false;
  });

  // Calculate the number of published blogs
  const publishedBlogsCount = blogPosts.filter(post => post.isPublished).length;

  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = new Set(blogPosts.map(post => post.category || 'Uncategorized'));
    setUniqueCategoryCount(uniqueCategories.size);
  }, [blogPosts]);

  const handleRefresh = () => {
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Blogs</h1>
          <div className="flex space-x-4">
            <button onClick={handleRefresh} className="flex items-center px-4 py-2 bg-white rounded-lg shadow text-gray-700 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1.001 1.001 0 002.684-.114A7.002 7.002 0 0119 8.101V18a1 1 0 01-1 1H4a1 1 0 01-1-1V2zm5 13a1 1 0 01-1-1h8a1 1 0 011 1h-8zM3 3a1 1 0 011-1h12a1 1 0 011 1v3H3V3z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            <Link href="/dashboard/blog/create">
              <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create Blog
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Total Blogs</p>
                <p className="text-3xl font-bold">{blogPosts.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Draft Blogs</p>
                <p className="text-3xl font-bold">{blogPosts.length - publishedBlogsCount}</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Published Blogs</p>
                <p className="text-3xl font-bold">{publishedBlogsCount}</p>
              </div>

              <div className="bg-red-100 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500">Category</p>
                <p className="text-3xl font-bold">{uniqueCategoryCount}</p>
              </div>

              <div className="bg-green-100 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1h.01a1 1 0 011 1h3a1 1 0 001-1v-3.01M4 16h12a1 1 0 001-1V4a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 001 1z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between my-2">
          <h1 className="text-2xl font-bold mb-6">Blog Lists :</h1>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading blog posts...</div>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className='flex flex-col items-center'>
              <div className="text-xl text-gray-600 mb-2">No blog posts available.</div>
              <p className="text-gray-500">Start by creating a new blog post.</p>
            </div>
          ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBlogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  {post.images && post.images.length > 0 && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-grow">
                    <h2 className="text-xl font-semibold text-gray-800 cursor-pointer hover:underline">
                      <Link href={`/dashboard/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-gray-600">{post.content.substring(0, 100)} ...</p>
                  </div>
                  <div className="p-4 flex justify-between">
                    <Link href={`/dashboard/blog/${post.id}`} className="w-1/2 mr-2">
                      <button className="w-full px-4 border py-1 border-[#F28C26] text-sm hover:bg-[#ee963e] text-[#ef9337] hover:text-white rounded">
                        Read More
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="w-1/2 ml-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogList;

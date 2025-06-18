'use client'
import React, { useEffect, useState } from 'react';
import { deleteBlogPost, getBlogPosts } from '../../../lib/firebase/blog';
// import CreateBlogPost from './create-blog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  images?: string[]; // Array of image URLs
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogList = () => {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const { success, blogPosts } = await getBlogPosts();
      if (success && blogPosts) {
        setBlogPosts(blogPosts);
      } else {
        setBlogPosts([]);
      }
    };
    fetchBlogPosts();
  }, []);

  const handleClick = () => {
    router.push('/dashboard/blog/create');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      const { success } = await deleteBlogPost(id);
      if (success) {
        alert('Blog post deleted successfully');
        // Optionally, remove the deleted post from state instead of reloading
        setBlogPosts((prev) => prev.filter((post) => post.id !== id));
        // router.push('/dashboard/blog'); // Optionally redirect
      } else {
        alert('Failed to delete the blog post');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">

      <div className='flex justify-between mx-8 my-2 '>
        <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
        <button onClick={handleClick} className='bg-[#F28C26] text-white rounded-xl w-[10rem]'>
          Create Blog Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mx-8 my-1 lg:grid-cols-4 gap-6">
        {blogPosts.map((post) => (
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
              <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
              <p className="mt-2 text-gray-600">{post.content.substring(0, 100)}...</p>
            </div>
            <div className="p-4 flex justify-between">
              <Link href={`/dashboard/blog/${post.id}`} className="w-1/2 mr-2">
                <button className="w-full px-4 py-2  bg-[#F28C26] hover:bg-[#f19e4c] text-white rounded ">
                  Read More
                </button>
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                className="w-1/2 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogList;

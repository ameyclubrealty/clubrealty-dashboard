'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { deleteBlogPost, getBlogPostBySlug } from '../../../../lib/firebase/blog';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import DOMPurify from 'dompurify';

type BlogPostType = {
  id: string;
  title: string;
  content: string;
  images?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  createdAt?: string; 
  updatedAt?: string;
  slug: string;
};

const BlogPost = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;
  const [blogPost, setBlogPost] = useState<BlogPostType | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchBlogPost = async () => {
        const { success, blogPost } = await getBlogPostBySlug(slug);
        if (success) {
          // Convert Date objects to strings if they are not already
          if (blogPost.createdAt instanceof Date) {
            blogPost.createdAt = blogPost.createdAt.toLocaleDateString();
          }
          if (blogPost.updatedAt instanceof Date) {
            blogPost.updatedAt = blogPost.updatedAt.toLocaleDateString();
          }
          setBlogPost(blogPost);
        }
      };
      fetchBlogPost();
    }
  }, [slug]);

  if (!blogPost) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!blogPost) return;
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      const { success } = await deleteBlogPost(blogPost.id);
      if (success) {
        alert('Blog post deleted successfully');
        router.push(`/dashboard/blog/`);
      } else {
        alert('Failed to delete the blog post');
      }
    }
  };

  return (
    <>
      <Head>
        <title>{blogPost.metaTitle || blogPost.title}</title>
        <meta name="description" content={blogPost.metaDescription || blogPost.content.slice(0, 150)} />
        <meta name="keywords" content={blogPost.metaKeywords || ''} />
        <meta property="og:title" content={blogPost.metaTitle || blogPost.title} />
        <meta property="og:description" content={blogPost.metaDescription || blogPost.content.slice(0, 150)} />
        {blogPost.images && blogPost.images.length > 0 && (
          <meta property="og:image" content={blogPost.images[0]} />
        )}
        <meta property="og:type" content="article" />
      </Head>

      <div className="min-h-screen bg-white">
        <div className='flex justify-between mt-6 mx-6'>
          <div className='flex'>
            <button
              onClick={() => router.back()}
              className="text-sm border border-[#F28C26] px-2 mt-2 rounded-md text-[#F28C26] hover:underline"
            >
              ← Back
            </button>
            <h1 className="text-4xl ml-4 font-bold text-gray-800">Blog/{blogPost.title}</h1>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/blog/edit/${blogPost.slug}`}
              className="px-3 py-3 bg-[#F28C26] text-white rounded h-12 w-[6rem] hover:bg-[#f1b374] transition duration-300"
            >
              Edit Blog
            </Link>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded h-12 hover:bg-red-400 transition duration-300">
              Delete
            </button>
          </div>
        </div>


        <div className="container mx-auto px-6 py-8">

          <div className="bg-white rounded-lg  overflow-hidden">


            <div className='grid grid-cols-1 mb-4 md:grid-cols-3 md:grid-rows-2 gap-4'>


              <div className="row-span-2 col-span-2 p-4 border rounded-lg">

                <div className="flex justify-between items-center mb-4 border-b-2">
                  <h1 className="text-3xl font-bold text-gray-800 my-4">{blogPost.title}</h1>
                </div>

                <h1 className="text-2xl font-semibold mb-4">Blog Description:</h1>
                <div className="mb-4">
                  <div
                    className="text-gray-700 whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blogPost.content) }}
                  />
                </div>
              </div>

              <div className=" border rounded-lg bg-gray-50 p-4">
                <h2 className="text-xl font-semibold mb-4">Blog Summary</h2>
                <div className="mb-2">
                  <p className="text-gray-600"><span className="font-semibold">ID:</span> {blogPost.id}</p>
                </div>
                <div className="mb-2">
                  <p className="text-gray-600"><span className="font-semibold">Created:</span> {blogPost.createdAt || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <p className="text-gray-600"><span className="font-semibold">Last Updated:</span> {blogPost.updatedAt || 'N/A'}</p>
                </div>
                <div className="mb-2">
                  <p className="text-gray-600"><span className="font-semibold">Published:</span> {blogPost.isPublished ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Featured Images</h3>
                <div className="flex flex-wrap gap-4">
                  {blogPost.images && blogPost.images.length > 0 ? (
                    blogPost.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Blog Image ${index}`}
                        className="w-48 h-48 object-cover rounded"
                      />
                    ))
                  ) : (
                    <p className="text-gray-400">No images available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>


    </>
  );
};

export default BlogPost;

'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlogPost } from '../../../../lib/firebase/blog';
import Link from 'next/link';
import Head from 'next/head';

type BlogPostType = {
  id: string;
  title: string;
  content: string;
  images?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

const BlogPost = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [blogPost, setBlogPost] = useState<BlogPostType | null>(null);

  useEffect(() => {
    if (id) {
      const fetchBlogPost = async () => {
        const { success, blogPost } = await getBlogPost(id);
        if (success) {
          setBlogPost(blogPost);
        }
      };
      fetchBlogPost();
    }
  }, [id]);

  if (!blogPost) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl ml-1 font-bold text-gray-800">Blog Post / {blogPost.title}</h1>
            <Link
              href={`/dashboard/blog/edit/${blogPost.id}`}
              className="px-4 py-2 bg-[#F28C26] hover:bg-[#f19e4c] text-white rounded transition duration-300"
            >
              Edit Content
            </Link>
          </header>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{blogPost.title}</h2>

            {/* Metadata Display */}
            <div className="mb-6 text-sm text-gray-600 space-y-1">
              {blogPost.metaTitle && (
                <div>
                  <span className="font-semibold">Meta Title:</span> {blogPost.metaTitle}
                </div>
              )}
              {blogPost.metaDescription && (
                <div>
                  <span className="font-semibold">Meta Description:</span> {blogPost.metaDescription}
                </div>
              )}
              {blogPost.metaKeywords && (
                <div>
                  <span className="font-semibold">Meta Keywords:</span> {blogPost.metaKeywords}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:justify-between gap-6">
              {/* Content */}
              <div className="md:w-2/3 rounded">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{blogPost.content}</p>
              </div>

              {/* Images */}
              <div className="md:w-1/4 p-4 rounded flex flex-wrap items-start justify-start">
                {blogPost.images && blogPost.images.length > 0 ? (
                  blogPost.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Blog Image ${index}`}
                      className="w-32 h-32 object-cover m-2 rounded"
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
    </>
  );
};

export default BlogPost;

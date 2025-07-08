'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addBlogPost, uploadBlogImage, updateBlogPost } from '../../../../lib/firebase/blog';
import Editor from '../editor';

const CreateBlogPost = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [slug, setSlug] = useState('');

  const predefinedCategories = [
    "Buying Guides",
    "Selling Tips",
    "Investment Advice",
    "Market Trends",
  ];

  useEffect(() => {
    const previews = images.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    // Auto-generate slug from title if slug is empty or matches previous title
    setSlug(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    );
  }, [title]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setImages((prevImages) => [...prevImages, ...Array.from(selectedFiles) as File[]]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const selectedCategory = useCustomCategory ? customCategory : category;

      // First, create the blog post to get the ID
      const { success, id, error } = await addBlogPost({
        title,
        content,
        metaTitle,
        metaDescription,
        metaKeywords,
        isPublished,
        category: selectedCategory,
        slug,
      });

      if (!success || !id) {
        console.error('Failed to create blog post:', error);
        alert('Failed to create blog post.');
        return;
      }

      // Then upload images if any
      if (images.length > 0) {
        console.log('Uploading', images.length, 'images for blog post:', id);
        
        const imageUrls = await Promise.all(
          images.map(async (image, index) => {
            console.log(`Uploading image ${index + 1}/${images.length}:`, image.name);
            const { success, url, error } = await uploadBlogImage(image, id);
            if (!success) {
              console.error(`Failed to upload image ${image.name}:`, error);
              alert(`Failed to upload image: ${image.name}. ${error}`);
              return null;
            }
            console.log(`Successfully uploaded image ${index + 1}:`, url);
            return url;
          })
        );

        const validImageUrls = imageUrls.filter((url) => url !== null);

        if (validImageUrls.length > 0) {
          console.log('Updating blog post with', validImageUrls.length, 'images');
          await updateBlogPost(id, { images: validImageUrls });
        }
      }

      alert(`Blog post created successfully with ID: ${id}`);
      router.push('/dashboard/blog');
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while creating the blog post.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="m-8">
        <div className="rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Blog Post</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={useCustomCategory ? "custom" : category}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setUseCustomCategory(true);
                  } else {
                    setUseCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="" disabled>Select a category</option>
                {predefinedCategories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="custom">Add Custom Category</option>
              </select>
            </div>

            {/* Custom Category Input */}
            {useCustomCategory && (
              <div className="md:col-span-2">
                <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">
                  Custom Category Name
                </label>
                <input
                  id="customCategory"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            )}

            {/* Meta Description */}
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-24"
              />
            </div>

            {/* Meta Title */}
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Meta Keywords */}
            <div className="md:col-span-2">
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
                Meta Keywords (comma-separated)
              </label>
              <input
                type="text"
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Slug Input */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={e => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. best-real-estate-agent-andheri-west"
              />
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Content
              </label>
              <Editor
                value={content}
                onChange={setContent}
                placeholder="Write your blog content here..."
              />
            </div>

            {/* Published Toggle */}
            <div className="md:col-span-2 flex items-center space-x-2">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isPublished}
                    onChange={() => setIsPublished(!isPublished)}
                  />
                  <div className={`block w-14 h-8 rounded-full ${isPublished ? 'bg-[#F28C26]' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isPublished ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div>
                  <div className="ml-3 text-gray-700 font-medium">
                    Published
                  </div>
                  <span className="ml-3 text-gray-600">Make this blog visible on the website</span>
                </div>
              </label>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Add Images(size: 517 × 291 px)</label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-[15rem] flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F28C26] hover:bg-[#f19e4c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Blog Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPost;

'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBlogPost, updateBlogPost, uploadBlogImage } from '../../../../../lib/firebase/blog';

const EditBlogPost = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      const fetchBlogPost = async () => {
        const { success, blogPost } = await getBlogPost(id);
        if (success) {
          setTitle(blogPost.title);
          setContent(blogPost.content);
          setMetaTitle(blogPost.metaTitle || '');
          setMetaDescription(blogPost.metaDescription || '');
          setMetaKeywords(blogPost.metaKeywords || '');
          setExistingImages(blogPost.images || []);
        }
      };
      fetchBlogPost();
    }
  }, [id]);

  useEffect(() => {
    const previews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setNewImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let updatedImageUrls = [...existingImages];

      if (newImages.length > 0) {
        const uploadedImageUrls = await Promise.all(
          newImages.map(async (image) => {
            const { success, url } = await uploadBlogImage(image, id);
            return success ? url : null;
          })
        );
        const validUrls = uploadedImageUrls.filter((url) => url !== null) as string[];
        updatedImageUrls = [...updatedImageUrls, ...validUrls];
      }

      const { success } = await updateBlogPost(id, {
        title,
        content,
        images: updatedImageUrls,
        metaTitle,
        metaDescription,
        metaKeywords,
      });

      if (success) {
        alert('Blog post updated successfully');
        router.push(`/dashboard/blog/${id}`);
      } else {
        alert('Failed to update the blog post');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while updating the blog post.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Blog Post</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm h-40"
            />
          </div>

          {/* Meta Title */}
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              id="metaTitle"
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Meta Keywords */}
          <div>
            <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">Meta Keywords</label>
            <input
              id="metaKeywords"
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="e.g. fitness, health tips, workouts"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Add Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <div key={`new-${i}`} className="relative">
                  <img src={src} className="w-20 h-20 object-cover rounded" alt={`New ${i}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ))}
              {existingImages.map((src, i) => (
                <div key={`existing-${i}`} className="relative">
                  <img src={src} className="w-20 h-20 object-cover rounded" alt={`Existing ${i}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-[15rem] flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F28C26] hover:bg-[#f19e4c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Blog Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlogPost;

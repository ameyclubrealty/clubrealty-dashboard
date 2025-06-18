'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addBlogPost, uploadBlogImage, updateBlogPost } from '../../../../lib/firebase/blog';

const CreateBlogPost = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeyword, setMetaKeyword] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const previews = images.map((image) => URL.createObjectURL(image));
    setImagePreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setImages((prevImages) => [...prevImages, ...Array.from(selectedFiles)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { success, id, error } = await addBlogPost({
        title,
        content,
        metaTitle,
        metaDescription,
        metaKeyword,
      });

      if (!success || !id) {
        console.error('Failed to create blog post:', error);
        alert('Failed to create blog post.');
        return;
      }

      if (images.length > 0) {
        const imageUrls = await Promise.all(
          images.map(async (image) => {
            const { success, url } = await uploadBlogImage(image, id);
            return success ? url : null;
          })
        );

        const validImageUrls = imageUrls.filter((url) => url !== null);

        if (validImageUrls.length > 0) {
          await updateBlogPost(id, { images: validImageUrls });
        }
      }

      alert(`Blog post created with ID: ${id}`);
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
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

            {/* Meta Keyword */}
            <div>
              <label htmlFor="metaKeyword" className="block text-sm font-medium text-gray-700">
                Meta Keywords (comma-separated)
              </label>
              <input
                type="text"
                id="metaKeyword"
                value={metaKeyword}
                onChange={(e) => setMetaKeyword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

              {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Blog Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-40"
                required
              ></textarea>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {imagePreviews.length > 0 ? (
                  imagePreviews.map((preview, index) => (
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
                  ))
                ) : (
                  <p>No images selected</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div>
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

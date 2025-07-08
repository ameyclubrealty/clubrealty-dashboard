'use client'
import React, { useEffect, useState } from 'react';
import { deleteBlogPost, getBlogPosts } from '../../../lib/firebase/blog';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { DateRangeFilter } from './dateFilter';
import { CombinedFilterButton } from './filterData';
import { Menu } from '@headlessui/react';
import { EllipsisVerticalIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';

interface BlogPost {
  id: string;
  slug:string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);


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
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && post.isPublished) ||
      (statusFilter === 'draft' && !post.isPublished);

    const matchCategory = categoryFilter === '' || post.category === categoryFilter;

    const matchTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());

    const createdAt = post.createdAt ? new Date(post.createdAt) : null;
    const withinRange =
      !dateRange?.from ||
      (!dateRange?.to && createdAt !== null && createdAt >= dateRange.from) ||
      (createdAt && dateRange.from && dateRange.to && createdAt >= dateRange.from && createdAt <= dateRange.to);

    return matchStatus && matchCategory && matchTitle && withinRange;
  });




  // Calculate the number of published blogs
  const publishedBlogsCount = blogPosts.filter(post => post.isPublished).length;

  useEffect(() => {
    const uniqueCategories = Array.from(new Set(blogPosts.map(post => post.category || 'Uncategorized')));
    setCategoryOptions(uniqueCategories);
    setUniqueCategoryCount(uniqueCategories.length);
  }, [blogPosts]);

  const handleRefresh = () => {
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className='ml-3'>
            <h2 className="text-3xl font-bold tracking-tight">Blog</h2>
            <p className="text-muted-foreground mt-1">Manage and track your blog</p>
          </div>
          <div className="flex space-x-4">
            <button onClick={handleRefresh} className="flex items-center border px-3 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1.001 1.001 0 002.684-.114A7.002 7.002 0 0119 8.101V18a1 1 0 01-1 1H4a1 1 0 01-1-1V2zm5 13a1 1 0 01-1-1h8a1 1 0 011 1h-8zM3 3a1 1 0 011-1h12a1 1 0 011 1v3H3V3z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            <Link href="/dashboard/blog/create">
              <button className="flex items-center px-3 py-2 bg-[#F28C26] border text-white rounded-lg hover:bg-[#ffb66d]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create Blog
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 ml-3 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-4">
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
          <div className="bg-white rounded-lg border p-4">
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
          <div className="bg-white rounded-lg border p-4">
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
          <div className="bg-white rounded-lg border p-4">
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

        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6 ml-3 items-end">
          <div className='w-[49rem] h-[2.5rem]'>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title..."
              className=" border w-full px-3 py-3 h-full rounded text-sm "
            />
          </div>

          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />


          <CombinedFilterButton
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categoryOptions={categoryOptions}
          />
        </div>

        <div className="container mx-auto px-4 py-8 border bg-white rounded-lg">

          <div className="flex justify-between border-b-2 mb-2 ">
            <h1 className="text-2xl font-bold mb-4">Blog Lists :</h1>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-gray-600">Loading blog posts...</div>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className='flex flex-col items-center'>
              <div className="text-xl text-gray-600 mb-2">No blog posts available.</div>
              <p className="text-gray-500">Start by creating a new blog post.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
              {filteredBlogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  {/* Image + Top Overlay */}
                  {post.images && post.images.length > 0 && (
                    <div className="relative w-full h-48">
                      <img
                        src={post.images[0]}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 ease-in-out hover:scale-105"
                      />

                      {/* Bottom Left: Status */}
                      <div className="absolute bottom-2 left-2 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-lg shadow">
                        {post.isPublished ? 'Published' : 'Draft'}
                      </div>

                      {/* Bottom Right: Dropdown */}
                      <div className="absolute bottom-2 right-2">
                        <Menu as="div" className="relative inline-block text-left">
                          <Menu.Button className="bg-white p-1.5 rounded-lg shadow hover:bg-gray-100">
                            <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
                          </Menu.Button>

                          <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="p-1 text-sm">
                              <div className="px-3 py-1 text-gray-500 font-semibold">Actions</div>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link href={`/dashboard/blog/${post.id}`}>
                                    <button
                                      className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-3 py-2 text-sm text-gray-700`}
                                    >
                                      <EyeIcon className="w-4 h-4 mr-2" /> View
                                    </button>
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link href={`/dashboard/blog/edit/${post.id}`}>
                                    <button
                                      className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-3 py-2 text-sm text-gray-700`}
                                    >
                                      <PencilIcon className="w-4 h-4 mr-2" /> Edit
                                    </button>
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDelete(post.id)}
                                    className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} flex items-center w-full px-3 py-2 text-sm`}
                                  >
                                    <TrashIcon className="w-4 h-4 mr-2" /> Delete
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Menu>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 flex-grow flex flex-col">
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-800 cursor-pointer hover:underline border-b pb-1">
                      <Link href={`/dashboard/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Except */}

                    <div className="mt-2 text-gray-600 text-sm" >
                      <div
                        className="text-gray-700 whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.substring(0,100)) }}
                      />.....
                    </div>

                    {/* Read More Button */}  
                    <div className="flex justify-start mt-2">
                      <Link href={`/dashboard/blog/${post.slug}`}>
                        <button className="underline underline-offset-2 text-sm text-[#ef9337] hover:text-[#ba7632]">
                          Read More
                        </button>
                      </Link>
                    </div>

                    {/* Category & Publish Status */}
                    <div className="mt-4 space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Category:</span>{' '}
                        <span className="text-gray-400">{post.category || 'N/A'}</span>
                      </p>
                      <p>
                        <span className="font-medium">Published:</span>{' '}
                        <span className="text-gray-400">{post.isPublished ? 'Yes' : 'No'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center px-4 py-2 border-t text-xs text-gray-500">
                    <span>ID: <span className="text-gray-400">{post.id.substring(0, 10)}...</span></span>
                    <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
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

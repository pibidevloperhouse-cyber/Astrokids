"use client";

import BlogFormatContent from "@/components/BlogFormatContent";
import { useBlog } from "@/context/BlogContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BlogPage() {
  const [blogData, setBlogData] = useState(null);
  const pathname = usePathname();
  const { Blogs, isLoading, fetchBlogs } = useBlog();

  useEffect(() => {
    if (Blogs) {
      fetchBlogData();
    } else {
      fetchBlogs();
      fetchBlogData();
    }
  }, []);

  const fetchBlogData = () => {
    const slug = pathname.split("/blogs/")[1];

    try {
      console.log(Blogs, slug);
      const blog = Blogs?.find((b) => b.slug === slug);
      console.log(blog);
      setBlogData(blog?.content);
    } catch (error) {
      console.log("Error fetching blog data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!blogData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <BlogFormatContent content={blogData} />
    </div>
  );
}

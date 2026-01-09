"use client";

import BlogFormatContent from "@/components/BlogFormatContent";
import { useBlog } from "@/context/BlogContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BlogPage() {
  const [blogData, setBlogData] = useState(null);
  const pathname = usePathname();
  const { Blogs, isLoading } = useBlog();

  useEffect(() => {
    const fetchBlogData = () => {
      const slug = pathname.split("/blogs/")[1];
      try {
        const blog = Blogs.find((b) => b.slug === slug).content;
        setBlogData(blog);
      } catch (error) {
        console.log("Error fetching blog data:", error);
      }
    };

    fetchBlogData();
  }, []);

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

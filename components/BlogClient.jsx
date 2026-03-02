"use client";

import BlogFormatContent from "@/components/BlogFormatContent";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BlogClient = () => {
  const [blogData, setBlogData] = useState(null);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    setIsLoading(true);
    const slug = pathname.split("/blogs/")[1];

    try {
      const res = await fetch(`/api/getPost?slug=${slug}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setBlogData(data.content);
      } else {
        console.log("Blog not found");
      }
    } catch (error) {
      console.log("Error fetching blog data:", error);
    }
    setIsLoading(false);
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
};

export default BlogClient;

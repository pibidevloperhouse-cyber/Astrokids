"use client";

import BlogFormatContent from "@/components/BlogFormatContent";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function BlogPage() {
  const [blogData, setBlogData] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
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

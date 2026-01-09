"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { sampleBlogs } from "@/constant/constant";

const BlogContext = createContext({
  blogs: sampleBlogs,
  isLoading: true,
});

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState(sampleBlogs);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/getAllPosts", {
        cache: "no-store",
      });
      const data = await res.json();
      setBlogs(data || []);
    } catch (e) {
      setBlogs(sampleBlogs || []);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlogContext.Provider value={{ blogs, isLoading, fetchBlogs }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);

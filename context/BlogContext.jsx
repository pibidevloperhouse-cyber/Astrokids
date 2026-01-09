"use client";

import { sampleBlogs } from "@/constant/constant";
import { createContext, useContext, useEffect, useState } from "react";

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [Blogs, setBlogs] = useState(sampleBlogs);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/getAllPosts", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log(res);

      if (res.status === 200) {
        const data = await res.json();
        setBlogs(data);
      } else {
        console.log("Failed to fetch blogs");
      }
    } catch (error) {
      console.log("Error fetching blogs:", error);
    }
    setIsLoading(false);
  };

  return (
    <BlogContext.Provider value={{ Blogs, isLoading, fetchBlogs }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);

"use client";

import { blogs } from "@/constant/constant";
import { createContext, useContext, useEffect, useState } from "react";

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [Blogs, setBlogs] = useState(blogs);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/getAllPosts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

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

    fetchBlogs();
  }, []);

  return (
    <BlogContext.Provider value={{ Blogs, isLoading }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);

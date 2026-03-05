import BlogsClientComponent from "@/components/BlogsClientComponent";
import React from "react";

const BlogsPage = () => {
  return <BlogsClientComponent />;
};

export const metadata = {
  title: "Parenting Insights & Child Astrology Guides",
  description:
    "Read AstroKids blogs for parenting insights, emotional development tips and child astrology guidance to understand your child better.",
  alternates: {
    canonical: "/blogs",
  },
};

export default BlogsPage;

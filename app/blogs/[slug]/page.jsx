import BlogClient from "@/components/BlogClient";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const res = await fetch(`https://www.astrokids.ai/api/getPost?slug=${slug}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const post = await res.json();

  return {
    title: post.metaTitle || "Default Title",
    description: post.metaDescription || "Default Description",
    openGraph: {
      title: post.metaTitle || "Default Title",
      description: post.metaDescription || "Default Description",
    },
  };
}

export default function BlogPage() {
  return <BlogClient />;
}

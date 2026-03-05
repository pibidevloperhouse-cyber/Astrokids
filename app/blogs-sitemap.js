async function getBlogs() {
  const res = await fetch("https://www.astrokids.ai/api/getAllPosts", {
    next: { revalidate: 3600 },
  });

  return res.json();
}

export default async function sitemap() {
  const blogs = await getBlogs();

  return blogs.map((blog) => ({
    url: `https://www.astrokids.ai/blogs/${blog.slug}`,
    lastModified: new Date(blog.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}

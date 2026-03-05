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
    alternates: {
      canonical: `/blogs/${slug}`,
    },
  };
}

export default function BlogPage({ params }) {
  const { slug } = params;
  const title = slug.replace(/-/g, " ");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description:
      "AstroKids parenting insights to help parents understand their child's emotional development.",
    author: {
      "@type": "Organization",
      name: "AstroKids",
    },
    publisher: {
      "@type": "Organization",
      name: "AstroKids",
      logo: {
        "@type": "ImageObject",
        url: "https://www.astrokids.ai/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.astrokids.ai/blogs/${slug}`,
    },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.astrokids.ai",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: "https://www.astrokids.ai/blogs",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
                item: `https://www.astrokids.ai/blogs/${slug}`,
              },
            ],
          }),
        }}
      />

      <BlogClient />
    </div>
  );
}

import BlogClient from "@/components/BlogClient";
import { getBaseUrl } from "@/lib/baseUrl";

export async function generateMetadata({ params }) {
  const { slug } = params;
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/getPost?slug=${slug}`, {
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
  const baseUrl = getBaseUrl();
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
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blogs/${slug}`,
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
                item: baseUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: `${baseUrl}/blogs`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: title,
                item: `${baseUrl}/blogs/${slug}`,
              },
            ],
          }),
        }}
      />

      <BlogClient />
    </div>
  );
}

"use client";
import Image from "next/image";
import Header from "./Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBlog } from "@/context/BlogContext";

const BlogFormatContent = ({ content }) => {
  const [recentPosts, setRecentPosts] = useState([]);
  const router = useRouter();
  const { Blogs } = useBlog();
  const buttons = [
    "Recents",
    "Parenting Tips",
    "Astrology Basics",
    "Ayurveda",
    "Wellness",
    "Success Stories",
  ];

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch("/api/getAllPosts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 200) {
          const data = await res.json();
          const sortedPosts = data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          setRecentPosts(sortedPosts);
        } else {
          console.log("Failed to fetch posts");
        }
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    fetchRecentPosts();
  }, []);

  const BlogFormatContent = (text, index) => {
    text = text.replace("<a herf=", "<a href=");
    let link = text.match(/<a href="([^"]+)">([^<]+)<\/a>/);
    let bold = text.match(/<b>(.*?)<\/b>/);
    if (link) {
      return (
        <p
          key={index}
          className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-4"
        >
          {text.split(link[0])[0]}
          <button
            onClick={() => {
              let blog = Blogs.find(
                (b) => b.slug === link[1].split("/blogs/")[1]
              );

              localStorage.setItem("currentBlog", JSON.stringify(blog));
              router.push(`/blogs/${blog.slug}`);
            }}
            className="text-[#2DB787] hover:underline"
          >
            {link[2]}
          </button>
          {text.split(link[0])[1]}
        </p>
      );
    } else if (bold) {
      return (
        <p
          key={index}
          className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-4"
        >
          {text.split(bold[0])[0]}
          <strong className="font-bold">{bold[1]}</strong>
          {text.split(bold[0])[1]}
        </p>
      );
    } else {
      return (
        <p
          key={index}
          className="text-[#6F6C90] text-[16px] md:text-[18px] leading-relaxed mb-4"
        >
          {text}
        </p>
      );
    }
  };

  return (
    <div className="w-screen h-full">
      <Header />
      <div className="px-5 mt-12 flex flex-col md:flex-row gap-10">
        <div className="md:px-10 flex-2/3 w-full">
          {content.map((block, index) => {
            switch (block.type) {
              case "title":
                return (
                  <h1
                    key={index}
                    className="text-3xl md:text-4xl font-bold text-[#02030B] mb-6 leading-[1.2] text-center capitalize"
                  >
                    <span className="text-[#2DB787]">
                      {block.content.split(" ")[0]}
                    </span>{" "}
                    {block.content.split(" ").slice(1).join(" ")}
                  </h1>
                );
              case "subtitle":
                return (
                  <h2
                    key={index}
                    className="text-2xl font-semibold text-[#2DB787] mt-8 mb-4 leading-[1.2] italic"
                  >
                    {block.content}
                  </h2>
                );
              case "subtitle1":
                return (
                  <h2
                    key={index}
                    className="text-xl font-semibold mt-8 mb-4 leading-[1.2]"
                  >
                    {block.content}
                  </h2>
                );
              case "para":
                return BlogFormatContent(block.content, index);
              case "cta":
                return (
                  <div
                    className="bg-[#2DB787] w-[90%] rounded-xl mx-auto p-2 md:p-4"
                    key={index}
                  >
                    <p className="text-white text-center mt-2 text-[16px] md:text-[18px]">
                      {block?.content}
                    </p>
                    <p className="text-white text-center mt-2 text-[16px] md:text-[18px]">
                      <Link href={block?.link}>
                        <div className="text-white font-bold text-center underline cursor-pointer">
                          {block?.buttonText}
                        </div>
                      </Link>{" "}
                      - {block?.content2}
                    </p>
                  </div>
                );
              case "image":
                return (
                  <div key={index} className="my-6">
                    <div className="w-[80%] mx-auto aspect-video relative rounded-xl overflow-hidden">
                      <Image
                        src={`https://drive.usercontent.google.com/download?id=${block.image.trim()}`}
                        alt={block.content}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <p className="text-xl text-[#2DB787] mt-2 italic text-center">
                      {block?.content}
                    </p>
                  </div>
                );
              case "numbered-list":
                return (
                  <ol
                    key={index}
                    className="pl-6 mb-6 space-y-4 text-[#6F6C90] list-decimal"
                  >
                    {block.items.map((item, i) => (
                      <li key={i} className="text-[16px] md:text-[18px]">
                        <span className="text-black">{item}</span>
                      </li>
                    ))}
                  </ol>
                );
              case "summary":
                return (
                  <div
                    key={index}
                    className="my-6 p-4 bg-[#F7F7F7] border-l-4 border-[#2DB787] text-[#6F6C90] text-[16px] md:text-[18px]"
                  >
                    <h3 className="text-lg font-semibold text-[#2DB787] mb-2">
                      In Summary:
                    </h3>
                    <p>{block.content}</p>
                  </div>
                );
              case "faq":
                return (
                  <div key={index} className="my-6">
                    <h3 className="text-xl font-semibold text-[#2DB787] mb-4">
                      Frequently Asked Questions
                    </h3>
                    <ul className="space-y-4 text-[#6F6C90]">
                      {block.items.map((item, i) => (
                        <li key={i} className="text-[16px] md:text-[18px]">
                          <span className="font-semibold text-[#02030B]">
                            {item.question}
                          </span>
                          <p className="mt-1">{item.answer}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              case "checklist":
                return (
                  <ul
                    key={index}
                    className="pl-6 mb-6 space-y-4 text-[#6F6C90] list-none"
                  >
                    {block.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start text-[16px] md:text-[18px]"
                      >
                        <span className="text-[#2DB787] mr-2">✔</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              case "highlight-list":
                return (
                  <div key={index} className="my-6">
                    {block.items.map((item, i) => (
                      <div key={i} className="mb-4">
                        <h4 className="text-lg font-semibold">{item.title}</h4>
                        <p className="text-[#6F6C90] text-[16px] md:text-[18px] mt-1">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              case "points":
                return (
                  <ul
                    key={index}
                    className="pl-6 mb-6 space-y-4 text-[#6F6C90]"
                  >
                    {block.points.map((point, i) => (
                      <li key={i} className="text-[16px] md:text-[18px]">
                        <span className="font-semibold text-[#2DB787]">
                          {point.title}:
                        </span>{" "}
                        {point.content}
                      </li>
                    ))}
                  </ul>
                );
              case "points-points":
                return (
                  <div key={index} className="my-8">
                    {block.content.map((item, index) => (
                      <div key={index} className="mb-6 relative">
                        <h3 className="text-xl font-semibold text-[#02030B] mb-2 leading-[1.2]">
                          {item.title}
                        </h3>

                        <p className="text-[#6F6C90] indent-10 text-justify leading-relaxed mb-3 text-[16px] md:text-[18px]">
                          {item.content}
                        </p>

                        <h4 className="text-lg font-medium text-[#2DB787] mt-4 mb-2 italic">
                          {item.subtitle}
                        </h4>

                        <ul className="list-disc pl-6 space-y-2 text-[#6F6C90]">
                          {item.points.map((point, i) => (
                            <li key={i} className="text-[16px] md:text-[18px]">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              case "points-points-with-image":
                return (
                  <div key={index} className="my-8">
                    {block.content.map((item, index) => (
                      <div key={index} className="mb-6 relative">
                        <h3 className="text-xl font-semibold text-[#02030B] mb-2 leading-[1.2]">
                          {item.title}
                        </h3>

                        {item.image !== "none" && (
                          <div className="w-[60%] mx-auto mt-2 aspect-video relative mb-4 rounded-xl overflow-hidden">
                            <Image
                              src={`https://drive.usercontent.google.com/download?id=${item.image}`}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                        )}

                        <p className="text-[#6F6C90] indent-10 text-justify leading-relaxed mb-3 text-[16px] md:text-[18px]">
                          {item.content}
                        </p>

                        <h4 className="text-lg font-medium text-[#2DB787] mt-4 mb-2 italic">
                          {item.subtitle}
                        </h4>

                        <ul className="list-disc pl-6 space-y-2 text-[#6F6C90]">
                          {item.points.map((point, i) => (
                            <li key={i}>
                              <p className="text-[16px] md:text-[18px] leading-relaxed">
                                {point}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              case "table":
                return (
                  <div key={index} className="my-8 overflow-x-auto">
                    <table className="w-full border-collapse border border-[#2DB787] shadow-md">
                      <thead>
                        <tr className="bg-[#F7F7F7]">
                          {block.headers.map((header, i) => (
                            <th
                              key={i}
                              className="border border-[#2DB787] p-3 text-[#02030B] font-semibold text-[16px] md:text-[18px]"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className={
                              rowIndex % 2 === 0 ? "bg-white" : "bg-[#F7F7F7]"
                            }
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="border border-[#2DB787] p-3 text-[#6F6C90] text-[16px] md:text-[18px]"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
        <div className="w-full md:w-1/3 md:px-5">
          <h2 className="text-2xl font-semibold text-[#2DB787] mb-6 leading-[1.2] capitalize">
            Recent <span className="text-[#FFEB3B]">Posts</span>
          </h2>
          <div className="flex flex-col gap-5">
            {recentPosts.length > 0 ? (
              recentPosts.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => {
                    localStorage.setItem("currentBlog", JSON.stringify(blog));
                    router.push(`/blogs/${blog.slug}`);
                  }}
                  className="w-full cursor-pointer"
                >
                  <div className="w-full h-full bg-[#F7F7F7] rounded-xl flex flex-col justify-center items-center">
                    <div className="w-full aspect-video relative rounded-t-xl">
                      <Image
                        src={`https://drive.usercontent.google.com/download?id=${blog.image}`}
                        alt={blog.title}
                        fill
                        className="object-cover rounded-t-xl"
                      />
                    </div>
                    <div className="bg-[#F2F2F2] px-3 py-2 rounded-b-xl w-full">
                      <h1 className="text-[18px] font-normal leading-[1.2] text-start text-[#9396A3]">
                        {buttons.find((_, idx) => blog.type === idx) ||
                          "Topic Of Interest"}
                      </h1>
                      <h1 className="text-[#02030B] font-semibold leading-[1.2] text-start my-3 text-[18px]">
                        {blog.title}
                      </h1>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#6F6C90] text-[16px]">
                Loading recent posts...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogFormatContent;

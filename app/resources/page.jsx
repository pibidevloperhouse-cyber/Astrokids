"use client";
import Header from "@/components/Header";
import NewFooter from "@/components/NewFooter";
import { useBlog } from "@/context/BlogContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BlogsPage = () => {
  const buttons = [
    "Recents",
    "Parenting Tips",
    "Astrology Basics",
    "Ayurveda",
    "Wellness",
    "Success Stories",
  ];
  const [isSelect, setIsSelect] = useState(0);
  const router = useRouter();
  const { blogs } = useBlog();
  const [displayBlogs, setDisplayBlogs] = useState(blogs);

  const getBlogImage = (content) => {
    const imageSection = content.find((section) => section.type === "image");
    return imageSection ? imageSection.image : "/images/new/blog.png";
  };

  return (
    <div>
      <Header />
      <div className="px-5 md:px-16 pt-28 md:pt-32 text-center">
        <h1 className="text-2xl md:text-[40px] font-bold leading-tight capitalize">
          Freebie for better parenting
        </h1>
        <h2 className="text-lg md:text-xl max-w-3xl mx-auto text-[#5E5E5E] mt-4 font-medium leading-[1.4]">
          Discover actionable tips, ancient secrets, and heartwarming stories to
          nurture your child’s brightest potential.
        </h2>

        <div className="flex justify-start md:justify-center mt-8 gap-4 overflow-x-auto whitespace-nowrap px-2 md:px-0">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => {
                setIsSelect(index);
                if (index === 0) {
                  setDisplayBlogs(blogs);
                } else {
                  const filteredBlogs = blogs.filter(
                    (blog) => blog.type === index
                  );
                  setDisplayBlogs(filteredBlogs);
                }
              }}
              className={`px-4 md:px-6 py-2 font-semibold rounded-3xl ${
                isSelect === index
                  ? "bg-[#02030B] text-white"
                  : "text-[#5E5E5E] border border-gray-300 md:border-none"
              }`}
            >
              {button}
            </button>
          ))}
        </div>

        <div>
          {displayBlogs?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 place-items-center mt-5">
              {displayBlogs.map((blog) => (
                <div
                  key={blog._id}
                  onClick={() => {
                    localStorage.setItem("currentBlog", JSON.stringify(blog));
                    router.push(`/blogs/${blog.slug}`);
                  }}
                  className="w-full cursor-pointer"
                >
                  <div className="w-full h-full bg-[#F7F7F7] rounded-xl p-5 flex flex-col justify-center items-center">
                    <div className="w-full aspect-video relative rounded-t-xl">
                      <Image
                        src={`https://drive.usercontent.google.com/download?id=${getBlogImage(
                          blog.content
                        )}`}
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
              ))}
            </div>
          ) : (
            <h1 className="w-full text-gray-500 text-lg mt-5 font-semibold text-center">
              No blogs available for this category.
            </h1>
          )}
        </div>
      </div>
      <div className="mb-8"></div> <NewFooter />
    </div>
  );
};

export default BlogsPage;

"use client";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa6";

const NewFooter = () => {
  const pathName = usePathname().split("/")[1];
  const footerItems = [
    {
      title: "home",
      items: ["why-astroKids", "how-it-works", "choose-your-plan", "blog"],
    },
    {
      title: "about",
      items: ["our-mission", "trust-us", "our-team"],
    },
    {
      title: "plans",
      items: ["choose-your-plan", "FAQ"],//plan-benefits remove 
    },
    {
      title: "resources",
      items: ["recent-articles", "featured-stories"],
    },
  ];

  const media = [
    {
      media: <FaLinkedin />,
      link: "https://www.linkedin.com/company/astrokids/",
    },
    {
      media: <FaFacebook />,
      link: "https://www.facebook.com/profile.php?id=61568876184036",
    },
    {
      media: <FaYoutube />,
      link: "https://www.youtube.com/@astrokids_ai",
    },
    {
      media: <FaInstagram />,
      link: "https://www.instagram.com/astrokids_ai/",
    },
  ];

  const router = useRouter();
  return (
    <div>
      <div className="bg-[#02030B] p-5 md:p-20 flex flex-col md:flex-row text-white gap-5">
        <div className="w-full md:w-2/5 flex flex-col justify-between items-start">
          <Link href="/">
            <div className="relative w-[150px] md:w-[200px] aspect-square">
              <Image
                fill
                src={"/images/new/logo1.png"}
                alt="logo"
                className="object-cover"
              />
            </div>
          </Link>
          <div
            className="w-[150px] md:w-[200px] text-[16px] flex justify-center items-center cursor-pointer font-[550] mt-5 relative"
            onClick={() => router.push("contact")}
          >
            <div className="w-max flex justify-center items-center gap-2 relative">
              <p>Contact Us</p>
              <ArrowUpRight />
              <div className="absolute w-full h-0.5 rounded-full bg-white bottom-0"></div>
            </div>
          </div>
        </div>
        <div className="flex-3/5 flex flex-wrap w-full justify-between gap-5">
          {footerItems.map((item, index) => (
            <div key={index} className="flex-1/4 flex flex-col gap-3 md:gap-5">
              <h1
                className={`text-[18px] font-[550] cursor-pointer capitalize ${
                  pathName === item.title ||
                  (pathName === "" && item.title == "home")
                    ? "text-[#2DB787]"
                    : "text-[#9396A3]"
                } hover:text-[#FFEB3B]`}
                onClick={() =>
                  router.push(`${item.title === "home" ? "/" : item.title}`)
                }
              >
                {item.title}
              </h1>
              {item.items.map((i, ind) => (
                <p
                  key={ind}
                  onClick={() =>
                    router.push(
                      `${
                        item.title === "home" ? "/" : item.title
                      }#${i.toLowerCase()}`
                    )
                  }
                  className="text-[16px] cursor-pointer font-[500] capitalize hover:text-[#FFEB3B] transition-colors"
                >
                  {i.split("-").join(" ")}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#02030B] flex flex-col md:flex-row justify-center items-center gap-5 text-white p-5 md:px-20 py-5">
        <div className="flex gap-5 flex-1">
          <p>© 2024 Astrokids ai</p>
          <p>Terms & Conditions</p>
        </div>
        <div className="flex gap-3">
          {media.map((m, index) => (
            <a
              key={index}
              href={m.link}
              className="hover:text-[#FFEB3B] bg-white/20 p-2 rounded-full text-[22px] transition-all"
            >
              {m.media}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewFooter;

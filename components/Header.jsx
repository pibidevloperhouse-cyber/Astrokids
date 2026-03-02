"use client";
import { heroComponent } from "@/constant/constant";
import { useCart } from "@/context/CardContext";
import { ChevronDown, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const Header = ({ status = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const navItems = [
  //   "home",
  //   "about",
  //   "plans",
  //   "remedial services",
  //   "resources",
  //   "contact",
  // ];
  const navItems = ["home", "about", "plans", "resources", "contact"];
  const pathName = usePathname().split("/")[1];
  const router = useRouter();
  // const { cart } = useCart();

  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        isMobileMenuOpen
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div>
      <div className="w-screen fixed top-0 z-[999] bg-transparent xl:bg-[#02030B] px-3 md:px-14 py-4">
        <div className="flex max-xl:bg-[#0E0C15] p-2 xl:p-0 rounded-xl items-center justify-between w-full">
          <Link href={"/"} className="font-bold text-white text-2xl">
            astrokids<span className="text-xs px-0.5 text-[#5DF2CF]">✦</span>ai
          </Link>

          <div className="hidden xl:flex flex-1 items-center justify-center gap-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={`${
                  item === "home"
                    ? "/"
                    : item === "remedial services"
                      ? "/remedial-services"
                      : item == "resources"
                        ? "/blogs"
                        : `/${item}`
                }`}
                className={`${
                  pathName === item ||
                  (pathName == "" && item == "home") ||
                  (item === "remedial services" &&
                    pathName === "remedial-services")
                    ? "text-[#2DB787]"
                    : "text-white"
                } cursor-pointer border-b-0 hover:border-b-2 capitalize border-[#5DF2CF] font-semibold px-4`}
              >
                {item}
              </Link>
            ))}
          </div>

          <button
            className="xl:hidden text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  color="#2DB787"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <button
            className="hidden xl:block px-6 py-1 font-bold rounded-lg new-gradient hover:brightness-110 transition-all"
            onClick={() => router.push("/plans")}
          >
            Get Started
          </button>
        </div>

        <div className="xl:hidden">
          {isMobileMenuOpen && (
            <div
              ref={menuRef}
              className="mt-3 rounded-xl w-full bg-[#0E0C15] px-5 py-4 flex flex-col gap-4"
            >
              {navItems.map((item, index) => (
                <>
                  <Link
                    key={index}
                    href={`/${item == "home" ? "" : item}`}
                    className={`${
                      pathName === "" && item === "home"
                        ? "text-[#2DB787]"
                        : pathName === item
                          ? "text-[#2DB787]"
                          : "text-white"
                    } cursor-pointer text-[16px] capitalize font-bold text-center py-2`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                </>
              ))}
            </div>
          )}
        </div>
      </div>
      {status && (
        <div className="w-full hidden xl:flex items-center py-2 bg-black fixed z-[999]">
          {heroComponent.map((item, index) => (
            <div key={index} className="w-full group relative">
              <div className="flex justify-center items-center">
                <h1 className="text-white text-xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded">
                  {item.title}
                </h1>
                {item.subContent && (
                  <ChevronDown className="ml-2 group-hover:rotate-180 transition-transform duration-200 group-hover:text-[#2DB787] hidden md:block text-white" />
                )}
              </div>
              {item.subContent && (
                <div className="mt-2 w-full bg-white z-[100] -translate-y-5 p-2 rounded-xl shadow-xl border border-black hidden group-hover:flex flex-col gap-1 absolute top-[110%] left-0">
                  {item.subContent.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={`/remedial-services/${subItem.toLocaleLowerCase()}`}
                      className="text-sm text-gray-600 text-center"
                    >
                      {subItem}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* <div
            className="text-white relative cursor-pointer ml-auto mr-10"
            onClick={() => router.push("/cart")}
          >
            <ShoppingBag />
            <span className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Header;

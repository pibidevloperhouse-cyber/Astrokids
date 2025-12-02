"use client";
import { pricing } from "@/constant/constant";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const PaymentSuccess = () => {
  const orderIndex = useSearchParams().get("productIndex") || 0;
  const orderId = useSearchParams().get("orderId") || 0;

  const router = useRouter();
  useEffect(() => {
    if (orderId == 0) {
      router.push("/child-details");
    }
  }, []);

  return (
    <div className="bg-white flex flex-col min-h-screen">
      <div className="p-5 absolute">
        <ArrowLeft
          className="w-9 h-9 p-2 text-white bg-[#02030B] rounded-full cursor-pointer"
          onClick={() => router.push("/")}
        />
      </div>
      <div className="flex pb-16 justify-center items-center flex-col">
        <img
          src="/images/new/success.gif"
          alt="Success Celebration"
          className="w-[100px] h-[100px] object-contain mt-4"
        />
        <h1 className="text-[40px] leading-[1.2] font-bold text-[#2DB787]">
          Order Successful!
        </h1>
        <p className="text-[24px] font-medium text-[#02030B] mt-2">
          Thank you for your purchase.
        </p>
      </div>
      <div className="flex flex-col pb-10 relative justify-end items-center flex-1 h-full bg-gradient-to-b from-[#2DB787]/20 to-[#FFEB3B]/20">
        <div className="w-[80%] md:w-[35%] absolute -top-[5%] md:-top-[10%] bg-white rounded-2xl custom-shadow2 py-8">
          <h1 className="text-[24px] text-center font-bold leading-[1.2]">
            Purchased {pricing[orderIndex].title} Report
          </h1>
          <p className="text-[#344054] text-[16px] font-medium leading-[1.2] text-center mt-2">
            Order ID : {orderId}
          </p>
          <div className="bg-[#2DB787] w-[65%] mx-auto rounded-xl mt-4 pb-1">
            <div className="w-[120px] aspect-[9/16] mx-auto relative">
              <Image
                src={`/images/book-cover${orderIndex}.png`}
                alt={`book-cover`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <p className="text-center text-[16px] text-[#344054] font-medium leading-[1.2]">
          Report sent to you’re email
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

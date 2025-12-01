"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { cn } from "@/lib/utils";

const PriceCarousel = ({ features, icons, index }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!api) return;

    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api, currentIndex]);

  return (
    <>
      <Carousel
        className="cursor-pointer"
        opts={{
          align: "center",
          loop: true,
        }}
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
          }),
        ]}
      >
        <CarouselContent className="py-2">
          {features.map((feature, fInd) => (
            <CarouselItem
              key={fInd}
              className="flex justify-center items-center"
            >
              <div className="w-full flex justify-center">
                <div className="h-full min-h-[160px] flex flex-col justify-center items-center text-center rounded-2xl border border-black/20 bg-white/40 backdrop-blur-md shadow-lg px-6 py-6 transition-all duration-300">
                  <div className="w-[60px] h-[60px] flex items-center justify-center rounded-full bg-[#2DB787] text-[#FFEB3B] text-[28px] mb-4 shadow-md">
                    {icons[index * 3 + fInd]}
                  </div>

                  <h1 className="text-[18px] font-semibold leading-snug">
                    {feature}
                  </h1>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex justify-center py-3 gap-2">
        {features.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              currentIndex === i ? "bg-[#2DB787]" : "bg-white"
            )}
          />
        ))}
      </div>
    </>
  );
};

export default PriceCarousel;

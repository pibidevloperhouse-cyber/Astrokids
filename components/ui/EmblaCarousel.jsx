import React from "react";
import { DotButton, useDotButton } from "./EmblaCarouselDotButtons";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "./EmblaCarouselArrowButtons";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

const EmblaCarousel = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const router = useRouter();

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div
              className="embla__slide max-md:px-3 max-md:pt-3 md:p-5 relative rounded-xl bg-[#2DB787] max-md:w-[90%] w-[80%]"
              key={index}
            >
              <div className="embla__slide__number w-full h-full">
                <div className="hidden md:block relative w-full h-full">
                  <div className="flex flex-col md:flex-row md:gap-10 max-md:mb-4">
                    <div className="w-[260px] max-md:mt-8 aspect-square relative rounded-t-2xl rounded-b-none">
                      <Image
                        fill
                        src={slide.image}
                        alt={slide.title}
                        className="object-cover rounded-t-2xl rounded-b-none"
                      />
                    </div>
                    <div className="flex flex-col justify-start items-start">
                      <h3 className="text-[30px] font-bold text-white">
                        {slide.title}
                      </h3>
                      <p className="text-[20px] h-max font-bold bg-[#FFEB3B] leading-[1.3] max-md:py-2 text-black px-3 my-2 rounded-lg">
                        Concern: {slide.concern}
                      </p>
                      <p className="capitalize text-[20px] font-bold text-white mt-2">
                        <span className="text-[#FFEB3B]">
                          Pro Parenting Plan{" "}
                        </span>
                        report revealed:
                      </p>
                      <ul className="list-disc list-inside marker:text-[#FFEB3B]">
                        {slide.points.map((bullet, index) => (
                          <li
                            key={index}
                            className="text-white text-[20px] leading-[1.5] font-normal"
                          >
                            <span className="text-[#FFEB3B] font-semibold">
                              {bullet.hilight}
                            </span>{" "}
                            {bullet.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-[#FFEB3B] flex flex-col md:flex-row leading-[1.3] text-[20px] justify-end items-end p-3 md:rounded-b-xl md:rounded-tr-xl max-md:rounded-xl">
                    <p className="w-full md:w-[80%] font-[500]">
                      {slide.parent}
                    </p>
                    <p className="w-full md:w-[20%] max-md:mt-3 text-end font-semibold">
                      -{slide.parentName}
                    </p>
                  </div>
                  <div
                    className="absolute -top-[7%] -right-[2%] new-gradient py-1 cursor-pointer px-3 rounded-tr-xl text-xl rounded-bl-xl"
                    onClick={() => router.push("/child-details")}
                  >
                    Try {slide.title.split("-")[0]} Plan
                  </div>
                </div>
                <div className="w-full h-full flex flex-col md:hidden">
                  <div className="flex flex-1 w-full md:gap-10 relative">
                    <div className="w-[50%] aspect-square relative rounded-t-2xl rounded-b-none">
                      <Image
                        fill
                        src={slide.image}
                        alt={slide.title}
                        className="object-cover rounded-t-2xl rounded-b-none"
                      />
                    </div>
                    <div className="flex w-[50%] flex-col justify-start items-start">
                      <h3 className="text-[16px] text-center py-3 w-full md:text-[30px] font-bold text-white leading-[1.2]">
                        {slide.title}
                      </h3>
                      <p className="text-[14px] md:text-[20px] w-full flex-1 flex flex-col justify-center items-start font-semibold bg-white leading-[1.3] max-md:py-2 text-black px-3 rounded-tr-lg">
                        <span className="font-bold inline text-start">
                          Concern:
                        </span>{" "}
                        {slide.concern}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#FFEB3B] flex-1 h-full flex flex-col md:flex-row leading-[1.3] text-[13px] md:text-[20px] p-3 rounded-b-xl md:rounded-tr-xl">
                    <p className="w-full md:w-[80%] flex-1 font-[500]">
                      {slide.parent}
                    </p>
                    <p className="w-full md:w-[20%] max-md:mt-3 text-end font-semibold">
                      -{slide.parentName}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/child-details")}
                    className="new-gradient self-end w-[90%] mx-auto flex mt-5 justify-center cursor-pointer items-center gap-4 py-3 text-sm font-semibold rounded-t-2xl"
                  >
                    Try {slide.title.split("-")[0]} Plan
                    <ArrowUpRight size={25} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>

        <div className="embla__dots">
          {slides.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`embla__dot
                ${index === selectedIndex ? " embla__dot--selected" : ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;

"use client";
import { ArrowLeft, ArrowRight, CheckIcon, ChevronsUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { currency, NO_DECIMAL_CURRENCIES, pricing } from "@/constant/constant";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import PhoneInput from "./PhoneInput";
import LocationInput from "./LocationInput";
import { Country } from "country-state-city";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { ScrollArea } from "./ui/scroll-area";
import flags from "react-phone-number-input/flags";
import { Label } from "./ui/label";
import { getSymbolFromCode } from "currency-code-symbol-map";

const NewChildDetails = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [gender, setGender] = useState("");
  const [number, setNumber] = useState("");
  const [latLon, setLatLon] = useState({
    lat: 0,
    lon: 0,
    timezone: "",
    currency: "",
  });
  const router = useRouter();
  const paymentEdit = useSearchParams().get("paymentEdit") || false;
  const orderId = useSearchParams().get("orderId");
  const [locationInput, setLocationInput] = useState("");
  const formRef = useRef(null);
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [paymentCountry, setPaymentCountry] = useState({
    name: "India",
    isoCode: "IN",
    flag: "🇮🇳",
    phonecode: "91",
    currency: "INR",
    latitude: "20.00000000",
    longitude: "77.00000000",
    timezones: [
      {
        zoneName: "Asia/Kolkata",
        gmtOffset: 19800,
        gmtOffsetName: "UTC+05:30",
        abbreviation: "IST",
        tzName: "Indian Standard Time",
      },
    ],
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedIndex = localStorage.getItem("orderIndex");
    const paymentCountryData = localStorage.getItem("paymentCountryData");
    if (paymentCountryData) {
      setPaymentCountry(JSON.parse(paymentCountryData));
    }
    if (savedIndex) {
      setCurrentIndex(Number(savedIndex));
    }
  }, []);

  const paymentFunction = async () => {
    try {
      let res;
      let amount = parseInt(pricing[currentIndex].price);

      if (paymentCountry.currency !== "INR") {
        const rate = currency[paymentCountry.name];
        if (!rate) {
          toast.error("Currency not supported for payment", {
            position: "top-right",
            autoClose: 3000,
          });
          setLoading(false);
          return;
        }
        amount = NO_DECIMAL_CURRENCIES.includes(paymentCountry.currency)
          ? Math.ceil(amount * rate)
          : (amount * rate).toFixed(2);
      }

      res = await fetch("/api/createOrder", {
        method: "POST",
        body: JSON.stringify({
          amount: NO_DECIMAL_CURRENCIES.includes(paymentCountry.currency)
            ? amount
            : amount * 100,
          currency: paymentCountry.currency,
        }),
      });

      if (res.status === 200) {
        const dataId = await res.json();
        const paymentData = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: dataId.id,

          handler: async function (response) {
            setLoading(true);
            const res = await fetch("/api/verifyOrder", {
              method: "POST",
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            console.log(res);

            const res1 = await fetch("/api/addChildDetails", {
              method: "POST",
              body: JSON.stringify({
                email: session.user.email,
                name: name,
                dob: dob,
                time: time,
                place: place,
                gender: gender,
                number: number,
                lat: latLon.lat,
                lon: latLon.lon,
                timezone: latLon.timezone,
                orderId: dataId.id,
                plan: pricing[currentIndex].title,
              }),
            });

            if (res1.status === 200) {
              localStorage.removeItem("childDetails");
              toast.success("Payment Success Check Mail For Updates", {
                position: "top-right",
                autoClose: 3000,
              });
              router.push(
                `/payment-success?productIndex=${currentIndex}&orderId=${dataId.id}`
              );
            } else {
              toast.error("Error. Try Again", {
                position: "top-right",
                autoClose: 3000,
              });
            }
          },

          prefill: {
            name: name,
            email: session.user.email,
            contact: number,
          },
        };

        const payment = new window.Razorpay(paymentData);
        payment.open();
      } else {
        toast.error("We are unable to process your payment at the moment.", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const createOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !name.trim() ||
      !dob.trim() ||
      !time.trim() ||
      !gender.trim() ||
      !number.trim()
    ) {
      toast.error("Please fill all fields", { position: "top-right" });
      setLoading(false);
      return;
    }
    if (!place.trim()) {
      toast.error("Select Place From the Dropdown", {
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    if (paymentEdit) {
      const res = await fetch("/api/updateChild", {
        method: "POST",
        body: JSON.stringify({
          email: session.user.email,
          name,
          dob,
          time,
          place,
          gender,
          number,
          lat: latLon.lat,
          lon: latLon.lon,
          timezone: latLon.timezone,
          orderId,
          plan: pricing[currentIndex].title,
        }),
      });
      if (res.status === 200) {
        toast.success("Child Details Updated", { position: "top-right" });
        router.push("/");
      } else {
        toast.error("Error Updating Child Details", {
          position: "top-right",
        });
      }
    } else {
      localStorage.setItem(
        "childDetails",
        JSON.stringify({
          name,
          dob,
          time,
          place,
          gender,
          number,
          lat: latLon.lat,
          lon: latLon.lon,
          timezone: latLon.timezone,
        })
      );

      await fetch("/api/checkChildDetails", {
        method: "POST",
        body: JSON.stringify({
          email: session.user.email,
          name,
          dob,
          time,
          place,
          gender,
          number,
        }),
      });

      if (currentIndex != 0) {
        paymentFunction();
      } else {
        localStorage.setItem(
          "childDetails",
          JSON.stringify({
            name,
            dob,
            time,
            place,
            gender,
            number,
            lat: latLon.lat,
            lon: latLon.lon,
            timezone: latLon.timezone,
          })
        );
        router.push("/free-report");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!api) return;

    const initialIndex = parseInt(currentIndex);
    if (
      !isNaN(initialIndex) &&
      initialIndex >= 0 &&
      initialIndex < pricing.length
    ) {
      setCurrentIndex(initialIndex);
      api.scrollTo(initialIndex);
    }
    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api, currentIndex]);

  const handleSlideChange = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (paymentEdit) {
      setLoading(true);
      const fetchDetails = async () => {
        const res = await fetch("/api/getUser", {
          method: "POST",
          body: JSON.stringify({ orderId }),
        });
        setLoading(false);
        if (res.status === 200) {
          const data = await res.json();
          setName(data.childDetails.name);
          setDob(data.childDetails.dob);
          setTime(data.childDetails.time);
          setPlace(data.childDetails.place);
          setGender(data.childDetails.gender);
          setNumber(data.childDetails.number);
          setLocationInput(data.childDetails.place);
        } else if (res.status === 400) {
          const data = await res.json();
          toast.error(data.message, { position: "top-right" });
          router.push("/");
        }
      };
      fetchDetails();
    }
  }, [paymentEdit, router]);

  const ConvertPrice = (price) => {
    let curr = price * currency[paymentCountry.name];
    curr = NO_DECIMAL_CURRENCIES.includes(paymentCountry.currency)
      ? Math.ceil(curr)
      : curr.toFixed(2);
    return getSymbolFromCode(paymentCountry.currency)
      ? getSymbolFromCode(paymentCountry.currency) + " " + curr
      : paymentCountry.currency + " " + curr;
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="p-5 md:absolute">
            <ArrowLeft
              className="w-9 h-9 p-2 text-black bg-white rounded-full cursor-pointer"
              onClick={() => router.back()}
            />
          </div>
          <div className="w-screen min-h-screen flex flex-col-reverse items-center justify-center md:flex-row md:justify-between">
            <div className="w-full py-5 md:w-2/3 min-h-screen bg-gradient-to-b from-[#2DB787]/20 to-[#FFEB3B]/20 p-5 md:p-8 flex flex-col items-end justify-end">
              <div className="flex-1 w-[90%] mx-auto flex flex-col justify-center gap-4">
                <h1 className="mt-0 md:mt-5 text-[24px] font-bold leading-[1.2]">
                  Join our community of 10,000+ super parents
                </h1>
                <form
                  id="child-details"
                  ref={formRef}
                  onSubmit={createOrder}
                  className="w-full flex flex-col"
                >
                  <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="w-full">
                      <label className="block text-[14px] font-normal mb-1">
                        Child Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        placeholder="Child's Name"
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border text-gray-700 bg-white outline-none border-gray-300 rounded focus:ring focus:ring-purple-300 transition-all placeholder:text-black"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-[14px] font-normal mb-1">
                        Child Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full p-2 border text-gray-700 bg-white outline-none border-gray-300 rounded focus:ring focus:ring-purple-300 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="w-full">
                      <label className="block text-[14px] font-normal mb-1">
                        Child Birth Time
                      </label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full p-2 border text-gray-700 bg-white outline-none border-gray-300 rounded focus:ring focus:ring-purple-300 transition-all"
                        required
                      />
                    </div>
                    <div className="w-full relative">
                      <label className="block text-[14px] font-normal mb-1">
                        Birth Location
                      </label>
                      <LocationInput
                        locationInput={locationInput}
                        setLocationInput={setLocationInput}
                        setPlace={setPlace}
                        setLatLon={setLatLon}
                        paymentCountry={paymentCountry}
                      />
                    </div>
                  </div>
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="w-full">
                      <label className="block text-[14px] font-normal mb-1">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full py-3 px-2 border text-gray-700 bg-white placeholder:text-black outline-none border-gray-300 rounded focus:ring focus:ring-purple-300 transition-all"
                        required
                      >
                        <option value="" disabled>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="w-full">
                      <label className="block text-[14px] font-normal mb-1">
                        Phone Number
                      </label>
                      <PhoneInput
                        value={number}
                        onChange={(value) => setNumber(value)}
                        className="bg-white dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        placeholder="Enter phone number"
                        defaultCountry={paymentCountry.isoCode}
                      />
                    </div>
                  </div>

                  <div
                    className={`grid grid-cols-1 w-full gap-5 mb-4 place-items-end ${
                      currentIndex != null && currentIndex > 0
                        ? "md:grid-cols-2"
                        : "mb-6"
                    }`}
                  >
                    {currentIndex != null && currentIndex > 0 && (
                      <div className="w-full relative">
                        <div className="w-full">
                          <label className="block text-[14px] font-normal mb-1">
                            Payment Country
                          </label>
                          <div
                            className="flex items-center bg-white rounded-lg"
                            onClick={() => setOpen(!open)}
                          >
                            <CountrySelect
                              paymentCountry={paymentCountry}
                              setpaymentCountry={setPaymentCountry}
                              open={open}
                              setOpen={setOpen}
                            />
                            <Label className="px-4 bg-white block text-[16px] font-semibold">
                              {paymentCountry.name}
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="w-full">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 w-full flex-1 mx-auto py-1 font-bold rounded-lg flex justify-center items-center gap-2 new-gradient hover:brightness-110 transition-all capitalize"
                      >
                        {loading
                          ? "Loading..."
                          : paymentEdit
                          ? "Update Details"
                          : currentIndex == 0
                          ? "Unlock Free Report"
                          : "Proceed to Pay"}
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-auto md:mt-0 flex justify-center items-center">
              <div className="w-[70%]">
                <h1 className="text-[rgb(17,23,41)] font-semibold text-[24px] leading-[1.2]">
                  Your Order
                </h1>
                <div className="bg-[#2DB787] rounded-xl mt-4 pb-1">
                  <Carousel
                    opts={{ align: "start", loop: true }}
                    setApi={setApi}
                  >
                    <CarouselContent>
                      {pricing.map((_, index) => (
                        <CarouselItem
                          key={index}
                          className="w-full h-full relative"
                        >
                          <div className="w-[120px] aspect-[9/16] mx-auto relative">
                            <Image
                              src={`/images/book-cover${index}.png`}
                              alt={`book-cover`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {index == 0 && (
                            <p
                              className={`absolute ${
                                currentIndex == index ? "block" : "hidden"
                              } px-3 rounded-bl-xl rounded-tr-xl top-0 w-max font-medium right-0 new-gradient text-white text-[12px]`}
                            >
                              Free
                            </p>
                          )}
                          {index == 1 && (
                            <p
                              className={`absolute ${
                                currentIndex == index ? "block" : "hidden"
                              } px-3 rounded-bl-xl rounded-tr-xl top-0 w-max font-medium right-0 new-gradient text-white text-[12px]`}
                            >
                              Popular
                            </p>
                          )}
                          {index == 2 && (
                            <p
                              className={`absolute ${
                                currentIndex == index ? "block" : "hidden"
                              } px-3 rounded-bl-xl rounded-tr-xl top-0 w-max font-medium right-0 new-gradient text-white text-[12px]`}
                            >
                              Parents' Choice
                            </p>
                          )}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="translate-x-[80%]" />
                    <CarouselNext className="-translate-x-[80%]" />
                  </Carousel>
                  <div className="flex justify-center my-2 space-x-2">
                    {pricing.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentIndex ? "bg-white" : "bg-white/50"
                        }`}
                        onClick={() => handleSlideChange(index)}
                      />
                    ))}
                  </div>
                </div>
                {currentIndex != null && (
                  <>
                    <h1 className="text-[16px] font-bold leading-[1.2] text-[#111729] my-5">
                      {pricing[currentIndex].title}
                    </h1>
                    <div className="bg-[#E3E8EF] w-full h-[1px]"></div>
                    <div className="my-5 flex flex-col gap-3">
                      <div className="flex w-full justify-between">
                        <h1 className="text-[16px] font-normal text-[#677489]">
                          Subtotal
                        </h1>
                        <p className="text-[16px] text-[#111729] font-normal">
                          {ConvertPrice(
                            parseInt(pricing[currentIndex].price) + 200
                          )}
                        </p>
                      </div>
                      <div className="flex w-full justify-between">
                        <h1 className="text-[16px] font-normal text-[#677489]">
                          Flat Discount
                        </h1>
                        <p className="text-[16px] text-red-400 font-normal">
                          -
                          {currentIndex === 0
                            ? `${ConvertPrice(399)}`
                            : `${ConvertPrice(200)}`}
                        </p>
                      </div>
                    </div>
                    <div className="bg-[#E3E8EF] w-full h-[1px]"></div>
                    <div className="flex w-full mt-4 justify-between">
                      <h1 className="text-[16px] font-bold text-[#111729]">
                        Total
                      </h1>
                      <p className="text-[16px] text-[#111729] font-semibold">
                        {currentIndex === 0
                          ? "Free"
                          : `${ConvertPrice(
                              parseInt(pricing[currentIndex].price)
                            )}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewChildDetails;

export const CountrySelect = ({
  paymentCountry,
  setpaymentCountry,
  open,
  setOpen,
  isBordered = true,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const scrollAreaRef = useRef(null);
  const countries = Country.getAllCountries();

  const handleSelect = (country) => {
    setpaymentCountry(country);
    localStorage.setItem("paymentCountryData", JSON.stringify(country));
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setSearchValue("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={isBordered ? "outline" : "default"}
          className={`flex justify-between bg-white hover:bg-white h-11 w-max py-2 rounded-none text-left ${
            isBordered
              ? "border"
              : "outline-none ring-0 focus-visible:border-0 focus-visible:ring-0"
          }`}
        >
          {paymentCountry ? (
            <div className="flex items-center gap-2">
              <FlagComponent
                country={paymentCountry.isoCode}
                countryName={paymentCountry.name}
              />
            </div>
          ) : (
            <></>
          )}
          {isBordered && <ChevronsUpDown className="size-4 opacity-50" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search country..."
            value={searchValue}
            onValueChange={(v) => {
              setSearchValue(v);
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    "[data-radix-scroll-area-viewport]"
                  );
                  if (viewportElement) viewportElement.scrollTop = 0;
                }
              }, 0);
            }}
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.isoCode}
                    className="gap-2"
                    onSelect={() => handleSelect(country)}
                  >
                    <FlagComponent
                      country={country.isoCode}
                      countryName={country.name}
                    />
                    <span className="flex-1 text-sm">{country.name}</span>
                    <CheckIcon
                      className={`ml-auto size-4 ${
                        paymentCountry?.isoCode === country.isoCode
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }) => {
  const Flag = flags[country];
  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};

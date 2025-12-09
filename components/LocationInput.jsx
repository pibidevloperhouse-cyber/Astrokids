"use client";

import React, { useState, useRef, useEffect } from "react";
import { Country, City } from "country-state-city";
import flags from "react-phone-number-input/flags";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import tz_lookup from "tz-lookup";

export default function LocationInput({
  locationInput,
  setLocationInput,
  setPlace,
  setLatLon,
  paymentCountry,
}) {
  const [selectedCountry, setSelectedCountry] = useState(paymentCountry);
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    if (paymentCountry && paymentCountry.isoCode) {
      setSelectedCountry(paymentCountry);
      setFilteredCities([]);
      setLocationInput("");
    }
  }, [paymentCountry]);

  const handleCitySearch = (value) => {
    setLocationInput(value);
    if (!selectedCountry || value.length < 2) {
      setFilteredCities([]);
      return;
    }
    const cities = City.getCitiesOfCountry(selectedCountry.isoCode);
    const results = cities.filter((city) =>
      city.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCities(results.slice(0, 50));
  };

  const handleCitySelect = (city) => {
    const fullLocation = `${city.name}, ${selectedCountry.name}`;

    const timezone = tz_lookup(city.latitude, city.longitude);

    setLocationInput(fullLocation);
    setPlace(fullLocation);
    setLatLon({
      lat: city.latitude,
      lon: city.longitude,
      timezone: timezone,
      currency: selectedCountry.currency,
    });

    setFilteredCities([]);
  };

  useEffect(() => {
    if (locationInput) {
      const country = locationInput.split(", ").pop();
      const countryData = Country.getAllCountries().find(
        (c) => c.name.toLowerCase() === country.toLowerCase()
      );
      if (countryData) {
        setSelectedCountry(countryData);
      }
      const cityName = locationInput.split(", ")[0];
      const cities = City.getCitiesOfCountry(countryData?.isoCode || "");
      const matchedCity = cities.find(
        (city) => city.name.toLowerCase() === cityName.toLowerCase()
      );

      if (matchedCity) {
        setPlace(matchedCity.name + ", " + countryData.name);
        const timezone = tz_lookup(matchedCity.latitude, matchedCity.longitude);

        setLatLon({
          lat: matchedCity.latitude,
          lon: matchedCity.longitude,
          timezone: timezone,
          currency: countryData.currency,
        });
      }
    }
  }, []);

  return (
    <div className="flex w-full relative">
      <CountrySelect
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        setFilteredCities={setFilteredCities}
        setLocationInput={setLocationInput}
        className="h-full"
      />
      <div className="flex-1">
        <Command className="w-full flex-1 border text-gray-700 bg-white placeholder:text-gray-500 rounded focus:ring focus:ring-purple-300">
          <CommandInput
            type="text"
            value={locationInput}
            isSearching={false}
            placeholder={`Search city in ${selectedCountry.name}`}
            onInput={(e) => handleCitySearch(e.target.value)}
          />

          {filteredCities.length > 0 && (
            <CommandList className="absolute top-[100%] left-0 z-10 w-full bg-gray-200 border-gray-300 rounded shadow-md max-h-60 overflow-auto">
              <CommandEmpty>No city found.</CommandEmpty>
              <CommandGroup>
                {filteredCities.map((city, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleCitySelect(city)}
                    value={city.name}
                  >
                    {city.name}, {selectedCountry.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </div>
    </div>
  );
}

const CountrySelect = ({
  selectedCountry,
  setSelectedCountry,
  setFilteredCities,
  setLocationInput,
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const scrollAreaRef = useRef(null);
  const countries = Country.getAllCountries();

  const handleSelect = (country) => {
    setSelectedCountry(country);
    setFilteredCities([]);
    setLocationInput("");
    setFilteredCities([]);
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
          variant="outline"
          className="flex justify-between h-11 w-max py-2 rounded-none text-left"
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <FlagComponent
                country={selectedCountry.isoCode}
                countryName={selectedCountry.name}
              />
            </div>
          ) : (
            <></>
          )}
          <ChevronsUpDown className="size-4 opacity-50" />
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
                        selectedCountry?.isoCode === country.isoCode
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

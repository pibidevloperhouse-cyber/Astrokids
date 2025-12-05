import {
  Body,
  Ecliptic,
  GeoVector,
  AstroTime,
  SiderealTime,
  Observer,
  SearchRiseSet,
} from "astronomy-engine";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage, registerFont } from "canvas";
import { zodiac } from "@/constant/constant";

const LAHIRI_AYANAMSHA = 23.933393;

const SIGNS = [
  ["Aries", 0, 30],
  ["Taurus", 30, 60],
  ["Gemini", 60, 90],
  ["Cancer", 90, 120],
  ["Leo", 120, 150],
  ["Virgo", 150, 180],
  ["Libra", 180, 210],
  ["Scorpio", 210, 240],
  ["Sagittarius", 240, 270],
  ["Capricorn", 270, 300],
  ["Aquarius", 300, 330],
  ["Pisces", 330, 360],
];

const SIGN_LORDS = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const NAKSHATRAS = [
  ["Ashwini", 0, 13.333333, "Ketu"],
  ["Bharani", 13.333333, 26.666667, "Venus"],
  ["Krittika", 26.666667, 40, "Sun"],
  ["Rohini", 40, 53.333333, "Moon"],
  ["Mrigashira", 53.333333, 66.666667, "Mars"],
  ["Ardra", 66.666667, 80, "Rahu"],
  ["Punarvasu", 80, 93.333333, "Jupiter"],
  ["Pushya", 93.333333, 106.666667, "Saturn"],
  ["Ashlesha", 106.666667, 120, "Mercury"],
  ["Magha", 120, 133.333333, "Ketu"],
  ["Purva Phalguni", 133.333333, 146.666667, "Venus"],
  ["Uttara Phalguni", 146.666667, 160, "Sun"],
  ["Hasta", 160, 173.333333, "Moon"],
  ["Chitra", 173.333333, 186.666667, "Mars"],
  ["Swati", 186.666667, 200, "Rahu"],
  ["Vishakha", 200, 213.333333, "Jupiter"],
  ["Anuradha", 213.333333, 226.666667, "Saturn"],
  ["Jyeshtha", 226.666667, 240, "Mercury"],
  ["Mula", 240, 253.333333, "Ketu"],
  ["Purva Ashadha", 253.333333, 266.666667, "Venus"],
  ["Uttara Ashadha", 266.666667, 280, "Sun"],
  ["Shravana", 280, 293.333333, "Moon"],
  ["Dhanishta", 293.333333, 306.666667, "Mars"],
  ["Shatabhisha", 306.666667, 320, "Rahu"],
  ["Purva Bhadrapada", 320, 333.333333, "Jupiter"],
  ["Uttara Bhadrapada", 333.333333, 346.666667, "Saturn"],
  ["Revati", 346.666667, 360, "Mercury"],
];

const BODY_NAMES = {
  [Body.Sun]: "Sun",
  [Body.Moon]: "Moon",
  [Body.Mercury]: "Mercury",
  [Body.Venus]: "Venus",
  [Body.Mars]: "Mars",
  [Body.Jupiter]: "Jupiter",
  [Body.Saturn]: "Saturn",
};

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

function toDateWithISTFallback(dateStr, timezone) {
  if (!dateStr) return new Date();

  const hasTZ = /[Zz]|[+\-]\d{2}:\d{2}$/.test(dateStr);
  if (hasTZ) return new Date(dateStr);

  const istMoment = moment.tz(
    dateStr,
    "YYYY-MM-DD HH:mm:ss",
    timezone || "Asia/Kolkata"
  );

  return istMoment.toDate();
}

function astroTimeFromDate(dateObj) {
  return new AstroTime(dateObj);
}

function tropicalToSidereal(deg) {
  return (deg - LAHIRI_AYANAMSHA + 720) % 360;
}

function degreeToSign(tropicalDeg) {
  const deg = tropicalToSidereal(tropicalDeg);
  for (const [sign, start, end] of SIGNS) {
    if (deg >= start && deg < end) {
      return { sign, norm_degree: deg - start, zodiac_lord: SIGN_LORDS[sign] };
    }
  }
  return { sign: "Unknown", norm_degree: deg, zodiac_lord: "Unknown" };
}

function getNakshatra(tropicalDeg) {
  const deg = tropicalToSidereal(tropicalDeg);
  for (const [name, start, end, lord] of NAKSHATRAS) {
    if (deg >= start && deg < end) {
      const pada = Math.floor(((deg - start) / (end - start)) * 4) + 1;
      return { nakshatra: name, nakshatra_lord: lord, pada };
    }
  }
  return { nakshatra: "Unknown", nakshatra_lord: "Unknown", pada: 0 };
}

function isRetrograde(planet, astroTime) {
  if (planet === Body.Sun || planet === Body.Moon) return false;
  const dtDays = 0.1;
  const time2 = new AstroTime(
    new Date(astroTime.date.getTime() + dtDays * 24 * 3600 * 1000)
  );
  const lon1 = Ecliptic(GeoVector(planet, astroTime, true)).elon;
  const lon2 = Ecliptic(GeoVector(planet, time2, true)).elon;
  const dLon = ((lon2 - lon1 + 540) % 360) - 180;
  return dLon < 0;
}

function calculateAscendantTropical(dateObjUTC, lat, lon) {
  const time = new AstroTime(dateObjUTC);

  let gmst = SiderealTime(time);
  let lmst = gmst + lon / 15;
  lmst = (lmst + 24) % 24;
  const ramc = lmst * 15;

  const obl = 23.4393 - 0.0000004 * ((time.tt - 2451545.0) / 36525.0);

  const latRad = (lat * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;
  const oblRad = (obl * Math.PI) / 180;

  const num = -Math.cos(ramcRad);
  const den =
    Math.sin(ramcRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);
  let asc = Math.atan2(num, den) * (180 / Math.PI);

  asc = (asc + 360) % 360;
  asc += 180;
  asc = (asc + 360) % 360;

  if (Math.sin(ramcRad) > 0) asc += 3;

  return asc;
}

function calculateAscendant(dateObjUTC, lat, lon) {
  const tropicalAsc = calculateAscendantTropical(dateObjUTC, lat, lon);
  return { ascTrop: tropicalAsc, ascSid: tropicalToSidereal(tropicalAsc) };
}

function getJulianDay(date) {
  return 2440587.5 + date.getTime() / 86400000;
}

function meanNodeLongitude(date) {
  const jd = getJulianDay(date);
  const T = (jd - 2451545.0) / 36525.0;

  let meanNode =
    125.044555 -
    1934.1361849 * T +
    0.0020762 * T * T +
    (T * T * T) / 467410 -
    (T * T * T * T) / 60616000;

  return normalize(meanNode);
}

function getPlanetaryPositions(dateObj) {
  const time = astroTimeFromDate(dateObj);
  const planets = [
    Body.Sun,
    Body.Moon,
    Body.Mercury,
    Body.Venus,
    Body.Mars,
    Body.Jupiter,
    Body.Saturn,
  ];

  const results = [];

  planets.map((planet) => {
    const vec = GeoVector(planet, time, true);
    const ecl = Ecliptic(vec);
    const tropicalLon = (ecl.elon + 360) % 360;
    const siderealLon = tropicalToSidereal(tropicalLon);
    const signInfo = degreeToSign(tropicalLon);
    const nakInfo = getNakshatra(tropicalLon);
    results.push({
      Name: BODY_NAMES[planet],
      full_degree: siderealLon,
      norm_degree: signInfo.norm_degree,
      sign: signInfo.sign,
      zodiac_lord: signInfo.zodiac_lord,
      isRetro: isRetrograde(planet, time),
      nakshatra: nakInfo.nakshatra,
      nakshatra_lord: nakInfo.nakshatra_lord,
      pada: nakInfo.pada,
    });
  });

  const meanRahuTropical = meanNodeLongitude(time.date);
  const meanKetuTropical = normalize(meanRahuTropical + 180);

  const rahuSidereal = tropicalToSidereal(meanRahuTropical);
  const ketuSidereal = tropicalToSidereal(meanKetuTropical);
  const rahuSign = degreeToSign(meanRahuTropical);
  const ketuSign = degreeToSign(meanKetuTropical);
  const rahuNak = getNakshatra(meanRahuTropical);
  const ketuNak = getNakshatra(meanKetuTropical);

  results.push({
    Name: "Rahu",
    full_degree: rahuSidereal,
    norm_degree: rahuSign.norm_degree,
    sign: rahuSign.sign,
    zodiac_lord: rahuSign.zodiac_lord,
    isRetro: true,
    nakshatra: rahuNak.nakshatra,
    nakshatra_lord: rahuNak.nakshatra_lord,
    pada: rahuNak.pada,
  });

  results.push({
    Name: "Ketu",
    full_degree: ketuSidereal,
    norm_degree: ketuSign.norm_degree,
    sign: ketuSign.sign,
    zodiac_lord: ketuSign.zodiac_lord,
    isRetro: true,
    nakshatra: ketuNak.nakshatra,
    nakshatra_lord: ketuNak.nakshatra_lord,
    pada: ketuNak.pada,
  });

  return results;
}

function getSunriseSunset(dateObj, lat, lon, timezone) {
  const obs = new Observer(lat, lon, 0);
  const rise = SearchRiseSet(Body.Sun, obs, +1, dateObj, 300);
  const set = SearchRiseSet(Body.Sun, obs, -1, dateObj, 300);

  return {
    sunrise: rise.date,
    sunset: set.date,
  };
}

const TITHIS = [
  "Pratipada",
  "Ditiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
];
const YOGAS = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarman",
  "Dhriti",
  "Shoola",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harsana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
];

const KARANAS = [
  ["Kinstughna", "Bava"],
  ["Balava", "Kaulava"],
  ["Taitila", "Garaja"],
  ["Vanija", "Vishti"],
  ["Bava", "Balava"],
  ["Kaulava", "Taitila"],
  ["Garaja", "Vanija"],
  ["Vishti", "Bava"],
  ["Balava", "Kaulava"],
  ["Taitila", "Garaja"],
  ["Vanija", "Vishti"],
  ["Bava", "Balava"],
  ["Kaulava", "Taitila"],
  ["Garaja", "Vanija"],
  ["Vishti", "Shakuni"],
  ["Balava", "Kaulava"],
  ["Taitila", "Garaja"],
  ["Vanija", "Vishti"],
  ["Bava", "Balava"],
  ["Kaulava", "Taitila"],
  ["Garaja", "Vanija"],
  ["Vishti", "Bava"],
  ["Balava", "Kaulava"],
  ["Taitila", "Garaja"],
  ["Vanija", "Vishti"],
  ["Bava", "Balava"],
  ["Kaulava", "Taitila"],
  ["Garaja", "Vanija"],
  ["Vishti", "Shakuni"],
  ["Chatushpada", "Nagava"],
];

const ganam_nakshatras = {
  Deva_Ganam: [
    "Ashwini",
    "Mrigashira",
    "Punarvasu",
    "Pushya",
    "Hasta",
    "Swati",
    "Anuradha",
    "Shravana",
    "Revati",
  ],
  Manushya_Ganam: [
    "Bharani",
    "Rohini",
    "Ardra",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
  ],
  Rakshasa_Ganam: [
    "Krittika",
    "Ashlesha",
    "Magha",
    "Chitra",
    "Vishakha",
    "Jyeshtha",
    "Mula",
    "Dhanishta",
    "Shatabhisha",
  ],
};

const nakshatra_yoni = {
  Ashwini: "Horse",
  Bharani: "Elephant",
  Krittika: "Sheep",
  Rohini: "Snake",
  Mrigashira: "Snake",
  Ardra: "Dog",
  Punarvasu: "Cat",
  Pushya: "Sheep",
  Ashlesha: "Cat",
  Magha: "Rat",
  "Purva Phalguni": "Rat",
  "Uttara Phalguni": "Cow",
  Hasta: "Buffalo",
  Chitra: "Tiger",
  Swati: "Buffalo",
  Vishakha: "Tiger",
  Anuradha: "Deer",
  Jyeshtha: "Deer",
  Mula: "Dog",
  "Purva Ashadha": "Monkey",
  "Uttara Ashadha": "Mongoose",
  Shravana: "Monkey",
  Dhanishta: "Lion",
  Shatabhisha: "Horse",
  "Purva Bhadrapada": "Lion",
  "Uttara Bhadrapada": "Cow",
  Revati: "Elephant",
};
function calculateTithi(sunLon, moonLon) {
  let diff = normalize(moonLon - sunLon);
  let tithiNum = Math.ceil(diff / 12);
  if (tithiNum === 30) return ["Amavasya", 30, "Krishna Paksha"];
  if (tithiNum === 15) return ["Purnima", 15, "Shukla Paksha"];
  const name = TITHIS[(tithiNum % 15) - 1];
  const paksha = tithiNum <= 15 ? "Shukla Paksha" : "Krishna Paksha";
  return [name, tithiNum, paksha];
}
function calculateNakshatra(moonLon) {
  const index = Math.floor(normalize(moonLon) / 13.3333333) % 27;
  return [NAKSHATRAS[index][0], index];
}
function calculateYoga(sunLon, moonLon) {
  const sum = normalize(sunLon + moonLon);
  const index = Math.floor(sum / 13.3333333) % 27;
  return [YOGAS[index], index + 1];
}
function calculateKarana(tithiNumber, sunLon, moonLon) {
  let diff = normalize(moonLon - sunLon);
  const value = diff / 12.0;
  const roundedValue = Math.round(value * 100) / 100;
  const decimalPart = Math.round((roundedValue * 100) % 100);
  const pair = KARANAS[tithiNumber - 1] || KARANAS[0];
  if (decimalPart > 50) {
    return [pair[1], tithiNumber * 2];
  } else {
    return [pair[0], tithiNumber * 2 - 1];
  }
}
function calculateGanam(nakshatraName) {
  if (ganam_nakshatras.Deva_Ganam.includes(nakshatraName)) return "Deva";
  if (ganam_nakshatras.Manushya_Ganam.includes(nakshatraName))
    return "Manushya";
  return "Rakshasa";
}
function calculatePanchang(sunLon, moonLon, sunrise, sunset, weekday) {
  const [tithi, tithiNumber, paksha] = calculateTithi(sunLon, moonLon);
  const [nakshatra, nakIndex] = calculateNakshatra(moonLon);
  const [yoga, yogaIndex] = calculateYoga(sunLon, moonLon);
  const [karana, karanaIndex] = calculateKarana(tithiNumber, sunLon, moonLon);
  const panchang = {
    tithi,
    tithi_number: tithiNumber,
    paksha,
    nakshatra,
    nakshatra_number: nakIndex + 1,
    yoga,
    yoga_index: yogaIndex,
    karana,
    karana_number: karanaIndex,
    sunrise: sunrise,
    sunset: sunset,
    ganam: calculateGanam(nakshatra),
    yoni: nakshatra_yoni[nakshatra] || null,
    week_day: weekday,
  };

  return panchang;
}

function getMandiPosition(mandiTime) {
  const time = astroTimeFromDate(mandiTime);
  const vec = GeoVector(Body.Saturn, time, true);
  const ecl = Ecliptic(vec);

  const tropicalLon = (ecl.elon + 360) % 360;
  const siderealLon = tropicalToSidereal(tropicalLon);

  const signInfo = degreeToSign(tropicalLon);
  const nakInfo = getNakshatra(tropicalLon);

  return {
    Name: "Manthi",
    full_degree: siderealLon,
    norm_degree: signInfo.norm_degree,
    sign: signInfo.sign,
    zodiac_lord: signInfo.zodiac_lord,
    isRetro: false,
    nakshatra: nakInfo.nakshatra,
    nakshatra_lord: nakInfo.nakshatra_lord,
    pada: nakInfo.pada,
  };
}

function getMandiTime(dateObj, sunrise, sunset) {
  const weekday = dateObj.getDay();

  const nextSunrise = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);

  const dayDuration = (sunset - sunrise) / 60000;
  const nightDuration = (nextSunrise - sunset) / 60000;

  const daySegment = dayDuration / 8;
  const nightSegment = nightDuration / 8;

  const daySegments = [7, 6, 5, 4, 3, 2, 1];
  const nightSegments = [1, 7, 6, 5, 4, 3, 2];

  const isDay = dateObj >= sunrise && dateObj <= sunset;

  let mandiSegment;
  if (isDay) mandiSegment = daySegments[weekday];
  else mandiSegment = nightSegments[weekday];

  let mandiTime;
  if (isDay) {
    mandiTime = new Date(
      sunrise.getTime() + (mandiSegment - 1) * daySegment * 60000
    );
  } else {
    mandiTime = new Date(
      sunset.getTime() + (mandiSegment - 1) * nightSegment * 60000
    );
  }

  return mandiTime;
}

export const getDetails = async (date, lat, lon, timezone, name, location) => {
  try {
    const dateObj = toDateWithISTFallback(date, timezone);
    const { ascTrop, ascSid } = calculateAscendant(dateObj, lat, lon);
    const ascSign = degreeToSign(ascTrop);
    const ascNak = getNakshatra(ascTrop);

    const ascendant = {
      Name: "Ascendant",
      full_degree: ascSid,
      norm_degree: ascSign.norm_degree,
      sign: ascSign.sign,
      zodiac_lord: ascSign.zodiac_lord,
      isRetro: false,
      nakshatra: ascNak.nakshatra,
      nakshatra_lord: ascNak.nakshatra_lord,
      pada: ascNak.pada,
    };

    const planets = getPlanetaryPositions(dateObj);

    const { sunrise, sunset } = getSunriseSunset(dateObj, lat, lon, timezone);
    const sunSid = planets.find((p) => p.Name === "Sun").full_degree;
    const moonSid = planets.find((p) => p.Name === "Moon").full_degree;

    const mandiTime = getMandiTime(dateObj, sunrise, sunset);
    const mandi = getMandiPosition(mandiTime);

    const all = [ascendant, ...planets, mandi];

    let sortedZodiac = zodiac
      .slice(zodiac.indexOf(ascSign.sign))
      .concat(zodiac.slice(0, zodiac.indexOf(ascSign.sign)));

    all.forEach((p) => (p.pos_from_asc = sortedZodiac.indexOf(p.sign) + 1));

    const unSortedPlanets = all.slice();

    all.sort((a, b) => b.norm_degree - a.norm_degree);

    const output = unSortedPlanets.map((planet) => {
      const index = all.findIndex((p) => p.Name === planet.Name);
      return {
        ...planet,
        order: index + 1,
      };
    });

    const toISTString = (d) =>
      d
        ? new Date(d).toLocaleTimeString("en-GB", {
            timeZone: timezone || "Asia/Kolkata",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : null;

    const panchang = calculatePanchang(
      sunSid,
      moonSid,
      toISTString(sunrise),
      toISTString(sunset),
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][dateObj.getDay()]
    );

    const mainPath = path.join(process.cwd(), "public");

    const images = await generateBirthNavamsaChart(
      all,
      mainPath,
      date,
      location,
      name
    );

    return { planets: output, panchang, images };
  } catch (err) {
    console.log("Error in getDetails:", err);
  }
};

const signDegree = {
  Aries: 30,
  Taurus: 60,
  Gemini: 90,
  Cancer: 120,
  Leo: 150,
  Virgo: 180,
  Libra: 210,
  Scorpio: 240,
  Sagittarius: 270,
  Capricorn: 300,
  Aquarius: 330,
  Pisces: 360,
};

const navamsaMap = [
  ["Aries", "Taurus", "Gemini", "Cancer"],
  ["Leo", "Virgo", "Libra", "Scorpio"],
  ["Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  ["Aries", "Taurus", "Gemini", "Cancer"],
  ["Leo", "Virgo", "Libra", "Scorpio"],
  ["Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  ["Aries", "Taurus", "Gemini", "Cancer"],
  ["Leo", "Virgo", "Libra", "Scorpio"],
  ["Sagittarius", "Capricorn", "Aquarius", "Pisces"],
];

function findPlanets(planets) {
  const navamsaPlanets = [];
  let array = NAKSHATRAS.map((n) => n[0]);

  for (const planet of planets) {
    navamsaPlanets.push({
      Name: planet.Name,
      full_degree:
        signDegree[
          navamsaMap[array.indexOf(planet.nakshatra) % 9][planet.pada - 1]
        ] - 10,
    });
  }

  return [planets, navamsaPlanets];
}

function drawWrappedText(ctx, text, maxWidth, x, y, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (let w of words) {
    let testLine = line + w + " ";
    let testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth) {
      lines.push(line.trim());
      line = w + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });

  return lines.length;
}

async function drawBirthChart(
  positions,
  filename,
  chartPath,
  name = "",
  dob = "",
  location = ""
) {
  let backgroundImage;
  let canvasSize = { width: 800, height: 800 };

  try {
    backgroundImage = await loadImage(
      path.join(chartPath, "static", "image.png")
    );
    canvasSize = {
      width: backgroundImage.width,
      height: backgroundImage.height,
    };
  } catch (err) {
    console.log("Background image not found, using white canvas");
  }

  const canvas = createCanvas(canvasSize.width, canvasSize.height);
  const ctx = canvas.getContext("2d");

  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0);
  } else {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const blue = "#03045e";
  const black = "#000000";

  const largeSquareSize = canvasSize.width;
  const smallSquareSize = largeSquareSize / 4;
  const largeSquareOffset = 0;

  let font = "24px sans-serif";
  try {
    registerFont(path.join(chartPath, "static", "Linotte-SemiBold.otf"), {
      family: "Linotte",
    });
    font = "24px Linotte";
  } catch (err) {
    console.log("Font not found, using default");
  }

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.font = "25px Linotte";
  ctx.fillStyle = black;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxWidth = 400;
  const lineHeight = 30;

  let nameLines = 1;
  if (ctx.measureText(name).width > maxWidth) {
    nameLines = drawWrappedText(
      ctx,
      name,
      maxWidth,
      centerX,
      centerY - 40,
      lineHeight
    );
  } else {
    ctx.fillText(name, centerX, centerY - 40);
  }

  ctx.fillText(dob, centerX, centerY - 40 + nameLines * lineHeight);

  const locationYStart = centerY - 40 + nameLines * lineHeight + 40;
  if (ctx.measureText(location).width > maxWidth) {
    drawWrappedText(
      ctx,
      location,
      maxWidth,
      centerX,
      locationYStart,
      lineHeight
    );
  } else {
    ctx.fillText(location, centerX, locationYStart);
  }

  const smallSquares = [
    { x: largeSquareOffset, y: largeSquareOffset },
    { x: largeSquareOffset + smallSquareSize, y: largeSquareOffset },
    { x: largeSquareOffset + 2 * smallSquareSize, y: largeSquareOffset },
    { x: largeSquareOffset + 3 * smallSquareSize, y: largeSquareOffset },
    {
      x: largeSquareOffset + 3 * smallSquareSize,
      y: largeSquareOffset + smallSquareSize,
    },
    {
      x: largeSquareOffset + 3 * smallSquareSize,
      y: largeSquareOffset + 2 * smallSquareSize,
    },
    {
      x: largeSquareOffset + 3 * smallSquareSize,
      y: largeSquareOffset + 3 * smallSquareSize,
    },
    {
      x: largeSquareOffset + 2 * smallSquareSize,
      y: largeSquareOffset + 3 * smallSquareSize,
    },
    {
      x: largeSquareOffset + smallSquareSize,
      y: largeSquareOffset + 3 * smallSquareSize,
    },
    { x: largeSquareOffset, y: largeSquareOffset + 3 * smallSquareSize },
    { x: largeSquareOffset, y: largeSquareOffset + 2 * smallSquareSize },
    { x: largeSquareOffset, y: largeSquareOffset + smallSquareSize },
  ];

  const rashiLabels = [
    "Pisces",
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
  ];

  const zodiacBoundaries = {
    Pisces: [330, 360],
    Aries: [0, 30],
    Taurus: [30, 60],
    Gemini: [60, 90],
    Cancer: [90, 120],
    Leo: [120, 150],
    Virgo: [150, 180],
    Libra: [180, 210],
    Scorpio: [210, 240],
    Sagittarius: [240, 270],
    Capricorn: [270, 300],
    Aquarius: [300, 330],
  };

  if (positions && positions.length > 0) {
    const planetsInCells = Array(12)
      .fill()
      .map(() => []);

    for (const planet of positions) {
      const planetName = planet.Name;
      const planetDegree = planet.full_degree;

      for (const [label, [start, end]] of Object.entries(zodiacBoundaries)) {
        if (start <= planetDegree && planetDegree < end) {
          const cellIndex = rashiLabels.indexOf(label);
          let shortName = planetName === "Ascendant" ? "Asc" : planetName;
          shortName = planet.isRetro ? shortName + " (R)" : shortName;
          planetsInCells[cellIndex].push([shortName, planetDegree]);
          break;
        }
      }
    }

    ctx.font = font;
    ctx.fillStyle = blue;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let index = 0; index < planetsInCells.length; index++) {
      const planets = planetsInCells[index];
      if (planets.length === 0) continue;

      const cell = smallSquares[index];
      const cellCenterX = cell.x + smallSquareSize / 2;
      const cellCenterY = cell.y + smallSquareSize / 2;

      if (planets.length > 1) {
        const radius = smallSquareSize * 0.3;
        const angleStep = (2 * Math.PI) / planets.length;
        planets.forEach(([planetName], i) => {
          const angle = i * angleStep;
          const x = cellCenterX + radius * Math.cos(angle);
          const y = cellCenterY + radius * Math.sin(angle) + 20;
          ctx.fillText(planetName, x, y);
        });
      } else {
        const [planetName] = planets[0];
        ctx.fillText(planetName, cellCenterX, cellCenterY + 20);
      }
    }
  }

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(filename, buffer);
}

export const generateBirthNavamsaChart = (
  planets,
  chartPath,
  dob,
  location,
  name
) => {
  return new Promise(async (resolve) => {
    const [positions, navamsa] = findPlanets(planets);
    const number = Math.floor(Math.random() * 100000000) + 1;
    const number2 = Math.floor(Math.random() * 10000000) + 1;

    const outputDir = path.join("/tmp", "charts");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    } else {
      if (fs.readdirSync(outputDir).length > 10) {
        fs.readdirSync(outputDir).forEach((file) => {
          const filePath = path.join(outputDir, file);
          if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          }
        });
      }
    }

    const birthChartFile = path.join(outputDir, `${number}.png`);
    const navamsaFile = path.join(outputDir, `${number2}.png`);

    await drawBirthChart(
      positions,
      birthChartFile,
      chartPath,
      name,
      dob,
      location
    );
    await drawBirthChart(navamsa, navamsaFile, chartPath, name, dob, location);

    resolve({
      birth_chart: `${number}.png`,
      navamsa_chart: `${number2}.png`,
    });
  });
};

const nakshatraData = [
  {
    name: "Ashwini",
    start_degree: 0,
    end_degree: 13.3333,
    ruler: "Ketu",
    dasa_years: 7,
  },
  {
    name: "Bharani",
    start_degree: 13.3333,
    end_degree: 26.6667,
    ruler: "Venus",
    dasa_years: 20,
  },
  {
    name: "Krittika",
    start_degree: 26.6667,
    end_degree: 40,
    ruler: "Sun",
    dasa_years: 6,
  },
  {
    name: "Rohini",
    start_degree: 40,
    end_degree: 53.3333,
    ruler: "Moon",
    dasa_years: 10,
  },
  {
    name: "Mrigashira",
    start_degree: 53.3333,
    end_degree: 66.6667,
    ruler: "Mars",
    dasa_years: 7,
  },
  {
    name: "Ardra",
    start_degree: 66.6667,
    end_degree: 80,
    ruler: "Rahu",
    dasa_years: 18,
  },
  {
    name: "Punarvasu",
    start_degree: 80,
    end_degree: 93.3333,
    ruler: "Jupiter",
    dasa_years: 16,
  },
  {
    name: "Pushya",
    start_degree: 93.3333,
    end_degree: 106.6667,
    ruler: "Saturn",
    dasa_years: 19,
  },
  {
    name: "Ashlesha",
    start_degree: 106.6667,
    end_degree: 120,
    ruler: "Mercury",
    dasa_years: 17,
  },
  {
    name: "Magha",
    start_degree: 120,
    end_degree: 133.3333,
    ruler: "Ketu",
    dasa_years: 7,
  },
  {
    name: "Purva Phalguni",
    start_degree: 133.3333,
    end_degree: 146.6667,
    ruler: "Venus",
    dasa_years: 20,
  },
  {
    name: "Uttara Phalguni",
    start_degree: 146.6667,
    end_degree: 160,
    ruler: "Sun",
    dasa_years: 6,
  },
  {
    name: "Hasta",
    start_degree: 160,
    end_degree: 173.3333,
    ruler: "Moon",
    dasa_years: 10,
  },
  {
    name: "Chitra",
    start_degree: 173.3333,
    end_degree: 186.6667,
    ruler: "Mars",
    dasa_years: 7,
  },
  {
    name: "Swati",
    start_degree: 186.6667,
    end_degree: 200,
    ruler: "Rahu",
    dasa_years: 18,
  },
  {
    name: "Vishakha",
    start_degree: 200,
    end_degree: 213.3333,
    ruler: "Jupiter",
    dasa_years: 16,
  },
  {
    name: "Anuradha",
    start_degree: 213.3333,
    end_degree: 226.6667,
    ruler: "Saturn",
    dasa_years: 19,
  },
  {
    name: "Jyeshtha",
    start_degree: 226.6667,
    end_degree: 240,
    ruler: "Mercury",
    dasa_years: 17,
  },
  {
    name: "Moola",
    start_degree: 240,
    end_degree: 253.3333,
    ruler: "Ketu",
    dasa_years: 7,
  },
  {
    name: "Purva Ashadha",
    start_degree: 253.3333,
    end_degree: 266.6667,
    ruler: "Venus",
    dasa_years: 20,
  },
  {
    name: "Uttara Ashadha",
    start_degree: 266.6667,
    end_degree: 280,
    ruler: "Sun",
    dasa_years: 6,
  },
  {
    name: "Shravana",
    start_degree: 280,
    end_degree: 293.3333,
    ruler: "Moon",
    dasa_years: 10,
  },
  {
    name: "Dhanishta",
    start_degree: 293.3333,
    end_degree: 306.6667,
    ruler: "Mars",
    dasa_years: 7,
  },
  {
    name: "Shatabhisha",
    start_degree: 306.6667,
    end_degree: 320,
    ruler: "Rahu",
    dasa_years: 18,
  },
  {
    name: "Purva Bhadrapada",
    start_degree: 320,
    end_degree: 333.3333,
    ruler: "Jupiter",
    dasa_years: 16,
  },
  {
    name: "Uttara Bhadrapada",
    start_degree: 333.3333,
    end_degree: 346.6667,
    ruler: "Saturn",
    dasa_years: 19,
  },
  {
    name: "Revati",
    start_degree: 346.6667,
    end_degree: 360,
    ruler: "Mercury",
    dasa_years: 17,
  },
];

const dasaPeriods = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const dasaOrder = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

function addYear(startYear, startMonth, year, month) {
  let newYear = startYear + year;
  let newMonth = startMonth + month;

  if (newMonth >= 12) {
    newMonth = Math.abs(12 - newMonth) + 1;
    newYear += 1;
  }

  return [newYear, newMonth];
}

function decimalToYears(yearDecimal) {
  const years = Math.floor(yearDecimal);
  const months = Math.floor((yearDecimal - years) * 12);
  return [years, months];
}

function remainingDasaBirth(year, completed) {
  const remaining = parseInt(year) - completed;
  return decimalToYears(remaining);
}

function reoderRemainingDasas(startDasa) {
  const startIndex = dasaOrder.indexOf(startDasa);
  const reordered = [];
  for (let i = startIndex; i < startIndex + dasaOrder.length; i++) {
    reordered.push(dasaOrder[i % dasaOrder.length]);
  }
  return reordered;
}

function allDasa(bhuktiPeriods, dasa, stopDasa, startYear, startMonth) {
  if (stopDasa === dasa) return;

  const dasaReorder = reoderRemainingDasas(dasa);
  const index = dasaOrder.indexOf(dasa);

  for (const bhukti of dasaReorder) {
    const bhuktiYears = dasaPeriods[dasa] * (dasaPeriods[bhukti] / 120);
    const [bhuktiYear, bhuktiMonth] = decimalToYears(bhuktiYears);
    const [endYear, endMonth] = addYear(
      startYear,
      startMonth,
      bhuktiYear,
      bhuktiMonth
    );

    if (!bhuktiPeriods[dasa]) bhuktiPeriods[dasa] = [];
    bhuktiPeriods[dasa].push({
      bhukti,
      start_year: startYear,
      end_year: endYear,
      start_month: startMonth,
      end_month: endMonth,
    });

    startYear = endYear;
    startMonth = endMonth;
  }

  if (index === dasaOrder.length - 1) {
    return allDasa(
      bhuktiPeriods,
      dasaOrder[0],
      stopDasa,
      startYear,
      startMonth
    );
  } else {
    return allDasa(
      bhuktiPeriods,
      dasaOrder[index + 1],
      stopDasa,
      startYear,
      startMonth
    );
  }
}

export const calculateDasa = (dateStr, planet) => {
  const year = dateStr.slice(0, 4);

  for (const nakshatra of nakshatraData) {
    if (
      planet.full_degree > nakshatra.start_degree &&
      planet.full_degree <= nakshatra.end_degree
    ) {
      planet.nakshatra = nakshatra.name;
      planet.nakshatra_lord = nakshatra.ruler;
      const nakshatraSpan = nakshatra.end_degree - nakshatra.start_degree;
      planet.dasa =
        (planet.full_degree - nakshatra.start_degree) / nakshatraSpan;
    }
  }

  const fractionCovered = planet.dasa;
  const remainingDasa =
    dasaPeriods[planet.nakshatra_lord] * (1 - fractionCovered);
  const completedDasa = dasaPeriods[planet.nakshatra_lord] - remainingDasa;
  let [startYear, startMonth] = remainingDasaBirth(year, completedDasa);

  const bhuktiPeriods = {};
  const dasaReorder = reoderRemainingDasas(planet.nakshatra_lord);

  for (const dasa of dasaReorder) {
    const bhuktiYears =
      dasaPeriods[planet.nakshatra_lord] * (dasaPeriods[dasa] / 120);
    const [bhuktiYear, bhuktiMonth] = decimalToYears(bhuktiYears);
    const [endYear, endMonth] = addYear(
      startYear,
      startMonth,
      bhuktiYear,
      bhuktiMonth
    );

    if (!bhuktiPeriods[planet.nakshatra_lord])
      bhuktiPeriods[planet.nakshatra_lord] = [];
    bhuktiPeriods[planet.nakshatra_lord].push({
      bhukti: dasa,
      start_year: startYear,
      end_year: endYear,
      start_month: startMonth,
      end_month: endMonth,
    });

    startYear = endYear;
    startMonth = endMonth;
  }

  const index = dasaOrder.indexOf(planet.nakshatra_lord);
  const nextDasa = dasaOrder[(index + 1) % dasaOrder.length];
  allDasa(
    bhuktiPeriods,
    nextDasa,
    planet.nakshatra_lord,
    startYear,
    startMonth
  );

  return bhuktiPeriods;
};

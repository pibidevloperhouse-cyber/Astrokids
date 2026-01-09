import { NextResponse } from "next/server";
import { calculateDasa, getDetails } from "@/lib/details";
import fs from "fs";

export async function POST(req) {
  try {
    const { date, lat, lon, timezone, name, location } = await req.json();

    const { planets, panchang, images } = await getDetails(
      date,
      lat,
      lon,
      timezone,
      name,
      location
    );

    const birthChartBase64 = fs
      .readFileSync("/tmp/charts/" + images.birth_chart)
      .toString("base64");
    const navamsaChartBase64 = fs
      .readFileSync("/tmp/charts/" + images.navamsa_chart)
      .toString("base64");

    const charts = {
      birth_chart: "data:image/png;base64," + birthChartBase64,
      navamsa_chart: "data:image/png;base64," + navamsaChartBase64,
    };

    const dasa = calculateDasa(date, planets[2]);

    console.log(planets, panchang, dasa);

    return NextResponse.json(
      { planets, panchang, charts, dasa },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error calculating free report:", err);
    return NextResponse.json(
      { message: "Error calculating free report", error: String(err) },
      { status: 500 }
    );
  }
}

import {
  atma_names,
  ista_devatas,
  nakshatraNumber,
  nakshatras,
  zodiac,
  zodiac_lord,
} from "@/constant/constant";
import {
  athmakaraka,
  carrer,
  chakra_desc,
  chakras,
  Constitution,
  constitutionRatio,
  context,
  dasa_status_table,
  education,
  elements_content,
  elements_data,
  exaltation,
  healthContent,
  healthInsights,
  ista_devata_desc,
  karagan,
  KaranaLord,
  karanamContent,
  lagnaIdentity,
  moonIdentity,
  nakshatraColor,
  nakshatraContent,
  Planet_Gemstone_Desc,
  planetDesc,
  planetTable,
  saturn_pos,
  subContent,
  sunIdentity,
  thithiContent,
  thithiLord,
  weekPlanet,
  weekPlanetContent,
  yogamLord,
} from "@/constant/report";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import {
  chapterPrompt,
  dasaPrompt,
  panchangPrompt,
  physical,
} from "@/lib/prompt";
import nodemailer from "nodemailer";
import { createCanvas } from "canvas";

const DesignColors = [
  "#BDE0FE",
  "#FEFAE0",
  "#FFC8DD",
  "#CAF0F8",
  "#FBE0CE",
  "#C2BCFF",
  "#9DE3DB",
  "#EDBBA3",
  "#EDF2F4",
  "#FFD6A5",
  "#CBF3DB",
  "#94D8FD",
  "#DEE2FF",
  "#FEEAFA",
  "#D7AEFF",
  "#EEE4E1",
];

let pageNo = 1;
let pages = [];

const randomeColor = () => {
  return DesignColors[Math.floor(Math.random() * DesignColors.length)];
};

function get_current_saturn_sign(saturn_pos) {
  let current_date = new Date();
  for (let pos of saturn_pos) {
    let start_date = new Date(pos["Start Date"]);
    let end_date = new Date(pos["End Date"]);
    if (start_date <= current_date && current_date <= end_date) {
      return pos;
    }
  }
  return null;
}

function get_next_sade_sati(saturn_pos, moon_sign) {
  for (let pos of saturn_pos) {
    if (pos["Sign"] == moon_sign) {
      let start_date = new Date(pos["Start Date"]);
      if (start_date > new Date()) {
        return pos;
      }
    }
  }
  return null;
}

function findStatus(planet, lord, sign) {
  if (sign in exaltation[planet]) {
    return exaltation[planet].index(sign) == 0 ? "Exalted" : "Debilitated";
  }

  return lord in planetTable[planet][0]
    ? "Friend"
    : lord in planetTable[planet][1]
    ? "Enemy"
    : "Neutral";
}

function lineBreak(doc, content, basePath, color) {
  const cell_width = doc.page.width - 120;
  let line_height = doc.heightOfString(`        ${content}`, {
    width: cell_width,
    lineGap: 4,
  });
  const max_y = doc.page.height - 70;

  let current_y = doc.y;

  if (current_y + line_height < max_y) {
    doc
      .save()
      .fillColor(color)
      .roundedRect(50, current_y, doc.page.width - 100, line_height + 10, 10)
      .fill();
    doc.restore();
    doc.text(`        ${content}`, 60, current_y + 5, {
      width: doc.page.width - 120,
      align: "justify",
      lineGap: 4,
    });
  } else {
    let content_lines = [];
    const words = content.split(" ");
    let current_line = "";
    for (const word of words) {
      if (doc.widthOfString(current_line + word + " ") <= cell_width - 2.5) {
        current_line += word + " ";
      } else {
        content_lines.push(current_line.trim());
        current_line = word + " ";
      }
    }
    content_lines.push(current_line.trim());
    for (const line of content_lines) {
      line_height = doc.heightOfString(line, {
        width: cell_width,
        lineGap: 4,
      });
      if (doc.y + line_height >= max_y) {
        newPage(doc, basePath);
        doc.y += 80;
      }
      let extra =
        content_lines.indexOf(line) === content_lines.length - 2 ? 15 : 10;
      doc
        .save()
        .fillColor(color)
        .roundedRect(
          50,
          doc.y,
          doc.page.width - 100,
          line_height + extra,
          content_lines.indexOf(line) === content_lines.length - 1 ? 10 : 0
        )
        .fill();
      doc.restore();
      doc.text(line, 60, doc.y + 5, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }
  }
}

function ContentDesign(
  doc,
  color,
  title,
  content,
  basePath,
  name,
  image = null
) {
  const ContentImages = {
    "Physical Attributes": "pg 19_physical.png",
    "Outer Personality": "pg 19_character.png",
    Character: "pg 19_outer.png",
    "Positive Behavior": "pg 19_behaviour.png",
    "Behavior Challenges": "pg 19_impact.png",
    [`Parenting Tips For ${name}'s Behaviour Challenges`]:
      "pg 35_parenting.png",
    [`${name}'s Emotional State Insights`]: "pg 22_emotional.png",
    [`${name}'s Emotions`]: "pg 22_inner worlds.png",
    [`${name}'s Personality`]: "pg 14_child.png",
    [`${name}'s Core Identity`]: "pg 15_core identity.png",
    [`${name}'s Feelings`]: "pg 24_desire.png",
    [`${name}'s Reactions`]: "pg 14_emotional.png",
    [`${name}'s Emotional Imbalance Challenges`]: "pg 25_build.png",
    [`Parenting Tips`]: "pg 35_parenting.png",
    [`${name}'s Soul Desire`]: "pg 24_soul.png",
    [`Seek For Recognition`]: "pg 45_physical.png",
    [`Core Identity`]: "pg 15_core identity.png",
    [`Parenting Tips For Self Identity Challenges`]: "pg 26_challenges.png",
    [`Education and Intellectual Insights`]: "pg 32_unique.png",
    [`Higher Education Preferences`]: "pg 31.png",
    [`Learning Approaches`]: "pg 31_education.png",
    [`How To Do It:`]: "pg 84_assesment.png",
    [`${name}'s Approaches for Forming Relationships`]: "pg 35_challenges.png",
    [`Parenting Support for Improve ${name}'s Social Developments`]:
      "pg_34.png",
    [`${name}'s Successful Career Path & Suitable Professions`]: "pg 37.png",
    [`Business & Entrepreneurial Potentials`]: "pg 38_business.png",
    [`Saturn's Life Lesson`]: "pg 47_saturn.png",
    [`Rahu's Life Lesson`]: "pg 47_rahu.png",
    [`Ketu's Life Lesson`]: "pg 47_ketu.png",
    [`Unique Talents in Academics`]: "pg 55.png",
    [`Unique Talents in Arts & Creativity`]: "pg 44_art.png",
    [`Unique Talents in Physical Activity`]: "pg 45_physical.png",
  };

  if (ContentImages[title]) image = ContentImages[title];

  let y = doc.y + 35;
  doc.fillColor("black");
  let textHeight = 0;
  doc.y += 10;

  if (title) {
    if (title.includes("_")) {
      let words = title.split("_");
      words = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
      title = words.join(" ");
    } else {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    doc.font("Linotte-SemiBold").fontSize(16);
    textHeight = doc.heightOfString(title, { width: doc.page.width - 120 });

    if (image) {
      doc
        .save()
        .fillColor(color)
        .roundedRect(50, y, doc.page.width - 100, textHeight + 80, 10)
        .fill();
      doc.restore();
      doc.image(path.join(basePath, image), doc.page.width / 2 - 20, y + 10, {
        width: 40,
        height: 40,
      });

      y += 55;

      doc.text(title, 60, y + 10, {
        width: doc.page.width - 120,
        align: "center",
      });
    } else {
      doc
        .save()
        .fillColor(color)
        .roundedRect(50, doc.y + 10, doc.page.width - 100, textHeight + 40, 10)
        .fill();
      doc.restore();
    }
    if (!image) {
      doc.text(title, 60, y + 5, {
        width: doc.page.width - 120,
        align: "center",
      });
    }

    y = doc.y + 2.5;
  }

  if (typeof content === "string") {
    content = content.replace(/child/g, name).replace(/Child/g, name);
    doc.font("Linotte-Regular").fontSize(14);
    textHeight = doc.heightOfString(content, {
      width: doc.page.width - 120,
      lineGap: 4,
    });

    if (title === "") {
      doc
        .save()
        .fillColor(color)
        .roundedRect(50, y, doc.page.width - 100, textHeight + 10, 10)
        .fill();
      doc.restore();
      doc.text(content, 60, y + 10, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    } else {
      lineBreak(doc, content, basePath, color);
    }
  } else if (typeof content === "object" && !Array.isArray(content)) {
    for (const [k, v] of Object.entries(content)) {
      doc.font("Linotte-SemiBold").fontSize(14);
      if (k === "name" || k === "field") {
        y += 10;
        doc.fillColor("black");
        doc.text(`${k.charAt(0).toUpperCase() + k.slice(1)} : ${v}`, {
          align: "center",
        });
      } else {
        const replaced = v.replace(/child/g, name).replace(/Child/g, name);
        y += 10;
        const keyHeight = doc.heightOfString(k, {
          width: doc.page.width - 120,
          lineGap: 4,
        });
        const valueHeight = doc
          .font("Linotte-Regular")
          .fontSize(14)
          .heightOfString(`        ${replaced}`, {
            width: doc.page.width - 120,
            lineGap: 4,
          });
        doc
          .roundedRect(
            50,
            y,
            doc.page.width - 100,
            keyHeight + valueHeight + 20,
            10
          )
          .fill(color);
        doc.fillColor("black");
        doc.text(k.charAt(0).toUpperCase() + k.slice(1), 60, y + 2.5, {
          width: doc.page.width - 120,
          align: "center",
        });
        doc.font("Linotte-Regular").fontSize(14);
        doc.text(`        ${replaced}`, 60, doc.y, {
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        });
      }
    }
  } else if (Array.isArray(content)) {
    for (let i = 0; i < content.length; i++) {
      const v1 = content[i];
      if (typeof v1 === "string") {
        let replaced = v1.replace(/child/g, name).replace(/Child/g, name);
        const height =
          doc.heightOfString(`      ${replaced}`, {
            width: doc.page.width - 120,
            lineGap: 4,
          }) + 15;

        if (doc.y + height >= doc.page.height - 50) {
          newPage(doc, basePath);
          doc.y = 60;
        }

        if (i !== content.length - 1) {
          doc
            .rect(50, doc.y - 5, doc.page.width - 100, height + 10)
            .fill(color);
        } else {
          doc
            .roundedRect(50, doc.y - 10, doc.page.width - 100, height + 10, 10)
            .fill(color);
        }
        doc.fillColor("black").font("Linotte-Regular").fontSize(14);
        doc.text(`      ${replaced}`, 60, doc.y + 5, {
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        });
      } else if (typeof v1 === "object") {
        v1.content = String(v1.content)
          .replace(/child/g, name)
          .replace(/Child/g, name);
        const titleHeight = doc.heightOfString(v1.title, {
          width: doc.page.width - 120,
        });
        const contentHeight =
          doc.heightOfString(`      ${v1.content}`, {
            width: doc.page.width - 120,
            lineGap: 4,
          }) + 10;
        const totalHeight = titleHeight + contentHeight + 15;

        if (doc.y + totalHeight >= doc.page.height - 50) {
          newPage(doc, basePath);
          doc.y = 60;
        }

        doc
          .roundedRect(50, doc.y - 5, doc.page.width - 100, totalHeight, 10)
          .fill(color);

        doc.fillColor("black");
        doc.font("Linotte-SemiBold").fontSize(16);
        doc.text(v1.title, 60, doc.y + 5, {
          width: doc.page.width - 120,
          align: "left",
        });

        doc.font("Linotte-Regular").fontSize(14);
        doc.text(`      ${v1.content}`, 60, doc.y + 5, {
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        });
      }
    }
  }
  doc.moveDown(0.5);
}

function panchangTable(doc, data) {
  let x_start = 60;
  let y_start = doc.y + 5;
  doc.x = x_start;
  doc.y = y_start;

  for (let index = 0; index < data.length; index++) {
    const row = data[index];
    const col_width = (doc.page.width - 120) / 2;

    doc.font("Linotte-Regular").fontSize(13);

    const content = Math.max(
      doc.heightOfString(`${index}) ${row[0]}`, {
        width: col_width - 5,
        lineGap: 4,
      }),
      doc.heightOfString(`${index}) ${row[1]}`, {
        width: col_width - 5,
        lineGap: 4,
      })
    );

    if (index === 0) {
      doc.roundedRect(60, doc.y, col_width, content + 5, 5).fill("#DAFFDC");
      doc
        .roundedRect(doc.page.width / 2, doc.y, col_width, content + 5, 5)
        .fill("#FFDADA");

      doc.rect(doc.page.width / 2 - 10, doc.y, 10, 10).fill("#DAFFDC");
      doc.rect(doc.page.width / 2, doc.y, 10, 10).fill("#FFDADA");
    } else if (index !== data.length - 1) {
      doc.rect(60, doc.y, col_width, content + 5).fill("#DAFFDC");
      doc
        .rect(doc.page.width / 2, doc.y, col_width, content + 5)
        .fill("#FFDADA");
    } else {
      doc.roundedRect(60, doc.y, col_width, content + 2, 5).fill("#DAFFDC");
      doc
        .roundedRect(doc.page.width / 2, doc.y, col_width, content + 2, 5)
        .fill("#FFDADA");

      doc
        .rect(doc.page.width / 2 - 10, doc.y + content - 8, 10, 10)
        .fill("#DAFFDC");
      doc.rect(doc.page.width / 2, doc.y + content - 8, 10, 10).fill("#FFDADA");
    }

    doc.fillColor("black");
    y_start = doc.y + 5;
    if (index === 0) {
      doc.text(row[0], x_start + 2.5, y_start, {
        width: col_width - 5,
        align: "center",
      });
      doc.text(row[1], x_start + col_width + 2.5, y_start, {
        width: col_width - 5,
        align: "center",
      });
    } else {
      doc.text(`${index}) ${row[0]}`, x_start + 2.5, y_start, {
        width: col_width - 5,
        align: "left",
      });
      doc.text(`${index}) ${row[1]}`, x_start + col_width + 2.5, y_start, {
        width: col_width - 5,
        align: "left",
      });
    }
  }
}

const monthsDict = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

let favourableDasa = "";

function no_of_lines(doc, text, cell_width) {
  const words = text.split(" ");
  let current_line = "";
  let lines = 0;

  words.forEach((word) => {
    const test_line = current_line + word + " ";
    const test_line_width = doc.widthOfString(test_line);

    if (test_line_width <= cell_width) {
      current_line = test_line;
    } else {
      lines += 1;
      current_line = word + " ";
    }
  });

  if (current_line) {
    lines += 1;
  }

  return lines;
}

function draw_bar(doc, x, y, width, height, color) {
  doc
    .save()
    .fillColor(color)
    .rect(x, y - height, width, height)
    .fill()
    .restore();
}

function draw_bar_chart(
  doc,
  x_start,
  y_base,
  bar_width,
  bar_spacing,
  data,
  colors,
  max_height,
  path
) {
  const values = Object.values(data);
  const max_value = Math.max(...values);

  let x = x_start;

  for (const [i, label] of Object.keys(data).entries()) {
    const value = data[label];
    const bar_height = (value / max_value) * max_height;
    const color = colors[i % colors.length];
    doc.font("Linotte-SemiBold").fontSize(12).fillColor("#000");
    doc.text(label, x, y_base + 10, { width: bar_width, align: "center" });
    draw_bar(doc, x, y_base, bar_width, bar_height, color);
    draw_labels(doc, x, y_base - bar_height - 15, label, path);
    x += bar_width + bar_spacing;
  }
}

function draw_labels(doc, x, y, label, imagePath) {
  if (label == "Vadha" || label == "Kapha" || label == "Pitta") {
    doc.image(path.join(imagePath, `${label}.png`), x - 5 / 2, y - 20, {
      width: 60,
      height: 25,
    });
  } else {
    doc.fillColor("#FFE6CC");
    doc.circle(x + 25, y - 15, 22.5).fill();
    doc.image(path.join(imagePath, `${label}.png`), x + 12.5, y - 27.5, {
      width: 25,
      height: 25,
    });
  }
}

const drawDasa = (doc, dasa, bhukthi, x, y, start, end, imagePath) => {
  const lineColor = "#BF4229";
  const boxWidth = 160;
  const boxHeight = 330;

  doc
    .save()
    .strokeColor(lineColor)
    .roundedRect(x - 2.5, y + 10, boxWidth, boxHeight, 5)
    .stroke()
    .restore();

  const dasaImg = path.join(imagePath, `${dasa}.png`);
  if (fs.existsSync(dasaImg)) {
    doc.image(dasaImg, x + 20, y + 15, { width: 40, height: 40 });
  }

  doc
    .font("Linotte-Heavy")
    .fontSize(16)
    .fillColor("#000")
    .text(`${dasa}`, x + 25, y + 17.5, { width: boxWidth, align: "center" });

  doc
    .font("Linotte-Regular")
    .fontSize(12)
    .text(`(${start}-${end})Age`, x + 25, doc.y, {
      width: boxWidth,
      align: "center",
    });

  doc
    .save()
    .strokeColor(lineColor)
    .moveTo(x + 30, doc.y + 27.5)
    .lineTo(x + boxWidth - 30, doc.y + 27.5)
    .stroke()
    .restore();

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text(
      `${monthsDict[bhukthi[0].start_month + 1]} ${bhukthi[0].start_year}`,
      x,
      doc.y + 32.5,
      { width: boxWidth, align: "center" }
    );
  doc.text(
    `${monthsDict[bhukthi[bhukthi.length - 1].end_month + 1]} ${
      bhukthi[bhukthi.length - 1].end_year
    }`,
    x,
    doc.y + 5,
    { width: boxWidth, align: "center" }
  );

  doc
    .save()
    .strokeColor(lineColor)
    .moveTo(x + 30, doc.y + 2.5)
    .lineTo(x + boxWidth - 30, doc.y + 2.5)
    .stroke()
    .restore();

  let currentY = doc.y + 14.5;
  const time = new Date().getFullYear();
  const subBoxHeight = 22.5;
  bhukthi.forEach((b, index) => {
    let fillColor;
    if (dasa_status_table[dasa]?.[0]?.includes(b.bhukti)) {
      fillColor = "#DAFFDC";
      if (favourableDasa === "" && b.start_year > time) {
        favourableDasa = `${b.start_year} to ${b.end_year}`;
      }
    } else if (dasa_status_table[dasa]?.[1]?.includes(b.bhukti)) {
      fillColor = "#FFDADA";
    } else {
      fillColor = "#DAE7FF";
    }

    doc
      .save()
      .fillColor(fillColor)
      .roundedRect(
        x - 2,
        currentY,
        boxWidth - 1,
        subBoxHeight,
        index === bhukthi.length - 1 ? 3 : 0
      )
      .fill()
      .restore();

    doc
      .font("Linotte-Regular")
      .fontSize(12)
      .fillColor("#000")
      .text(`${b.bhukti}`, x + 4, currentY + 5, {
        width: 60,
        align: "left",
        height: subBoxHeight,
      })
      .text(
        `upto ${monthsDict[b.end_month + 1]} ${b.end_year}`,
        doc.x + 55,
        currentY + 5,
        {
          width: boxWidth - 65,
          align: "right",
          height: subBoxHeight,
        }
      );

    currentY += subBoxHeight;
  });
};

const drawPlanetTable = (doc, planet, x, y, color, imagePath) => {
  const boxWidth = 185;
  const boxHeight = 185;

  doc
    .save()
    .fillColor(color)
    .roundedRect(x - 5, y - 5, boxWidth, boxHeight, 5)
    .fill()
    .restore();

  const imgPath =
    planet.Name !== "Ascendant"
      ? path.join(imagePath, `${planet.Name}.png`)
      : path.join(imagePath, `${planet.sign}.png`);

  if (fs.existsSync(imgPath)) {
    doc.image(imgPath, x - 20, y - 32.5, { width: 55, height: 55 });
  }

  doc.text(
    planet.Name === "Ascendant"
      ? `${planet.Name} (Lagna)`
      : `Planet: ${planet.Name}`,
    x,
    y,
    {
      width: boxWidth,
      align: "center",
    }
  );
  doc.text(`Full Degree: ${planet.full_degree.toFixed(5)}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });
  doc.text(`Sign: ${planet.sign}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });
  doc.text(`Sign Lord: ${planet.zodiac_lord}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });
  doc.text(`Retrograde: ${planet.isRetro}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });
  doc.text(`Nakshatra: ${planet.nakshatra}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });
  doc.text(`Karagan: ${karagan[planet.Name]}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });

  const status =
    planet.Name === "Ascendant"
      ? "Ubayam"
      : findStatus(planet.Name, planet.zodiac_lord, planet.sign);
  doc.text(`Status: ${status}`, x, doc.y + 9, {
    width: boxWidth,
    align: "center",
  });
};

function makeGradientPNG(
  width,
  height,
  color1,
  color2,
  direction = "vertical"
) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  let grad;
  if (direction === "vertical") {
    grad = ctx.createLinearGradient(0, 0, 0, height);
  } else {
    grad = ctx.createLinearGradient(0, 0, width, 0);
  }
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  return canvas.toBuffer("image/png");
}

const roundedBoxBorder = (
  doc,
  color,
  borderColor,
  x,
  y,
  planet,
  sign,
  imagePath
) => {
  doc.fillColor(color);
  doc.strokeColor(borderColor);
  doc.roundedRect(x, y, 140, 140, 30).fillAndStroke();
  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
  doc.text(`${planet}`, x, y + 10, { width: 140, align: "center" });
  doc.image(path.join(imagePath, `${sign}.png`), x + 35, y + 35, {
    width: 70,
    height: 70,
  });
  doc.text(`${sign}`, x, y + 115, { width: 140, align: "center" });
};

const newPage = (doc, IMAGES, title = null) => {
  doc.addPage();
  pageNo++;
  doc.addNamedDestination("page" + pageNo);
  doc.image(path.join(IMAGES, "border.png"), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
  if (title) {
    doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
    doc.text(title, 50, 80, {
      align: "center",
      width: doc.page.width - 100,
      lineGap: 4,
    });
  }
};

async function ProReport(
  doc,
  reportPath,
  planets,
  panchang,
  dasa,
  charts,
  formatted_date,
  formatted_time,
  location,
  year,
  month,
  name,
  gender,
  outputDir
) {
  const IMAGES = path.join(reportPath, "report", "images");
  const ICONS = path.join(reportPath, "report", "icons");

  doc.image(path.join(IMAGES, "book-cover1.png"), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
  newPage(doc, IMAGES);
  doc.font("Linotte-SemiBold").fontSize(38).fillColor("#040606");
  doc.text(`${name.split(" ")[0]}'s First Astrology Report`, 60, 120, {
    align: "center",
    width: doc.page.width - 120,
  });
  doc.image(
    path.join(IMAGES, "starting.png"),
    doc.page.width / 2 - 150,
    doc.page.height / 2 - 150,
    { width: 300, height: 300 }
  );

  const paragraphWidth = doc.page.width - 120;
  const yLimit = doc.page.height - 100;

  doc.font("Linotte-SemiBold").fontSize(22).fillColor("#000");
  doc.text(
    `The Precious Child Born on the auspicious day ${formatted_date} at ${formatted_time.toUpperCase()}. Place of birth is ${location}.`,
    60,
    doc.y + 400,
    { width: paragraphWidth, align: "justify" }
  );

  newPage(doc, IMAGES);

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(36).fillColor("#000");

  const widthString = doc.widthOfString(`${name}'s Astrology Details`);
  let yPosition = doc.page.height / 2 - 18;

  if (widthString > doc.page.width - 300) {
    yPosition += 18;
  }
  pages.push(pageNo);
  doc.text(`${name}'s Astrology Details`, 150, yPosition, {
    align: "center",
    width: doc.page.width - 300,
  });

  newPage(doc, IMAGES, name + "'s True Self");
  pages.push(pageNo);

  doc.fillColor("#000").fontSize(18);

  doc.text(
    `Let's take a look at the three most influential and important signs for ${name}!`,
    80,
    doc.y + 30,
    {
      align: "center",
      width: doc.page.width - 160,
    }
  );

  doc
    .font("Linotte-SemiBold")
    .text(`As per ${name}'s kundli,`, 60, doc.y + 10, {
      align: "left",
      width: doc.page.width - 120,
    });

  let y = doc.y + 20;
  roundedBoxBorder(
    doc,
    "#FFE769",
    "#C5A200",
    60,
    y,
    planets[1]["Name"],
    planets[1]["sign"],
    IMAGES
  );
  roundedBoxBorder(
    doc,
    "#D1C4E9",
    "#A394C6",
    230,
    y,
    planets[0]["Name"],
    planets[0]["sign"],
    IMAGES
  );
  roundedBoxBorder(
    doc,
    "#B3E5FC",
    "#82B3C9",
    400,
    y,
    planets[2]["Name"],
    planets[2]["sign"],
    IMAGES
  );

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(42).fillColor("#E85D2B");
  doc.text(`Horoscope Details`, 50, 90, {
    align: "center",
    width: doc.page.width - 100,
  });

  let asc = planets.find((p) => p.Name === "Ascendant");

  const ascIndex = asc ? Math.max(0, zodiac.indexOf(asc.sign)) : 0;

  const wrapIndex = (i) => ((i % 12) + 12) % 12;

  const ninthHouseLord = zodiac_lord[wrapIndex(((ascIndex + 9) % 12) - 1)];
  const signLord = planets.find((p) => p.Name === ninthHouseLord) || {};
  const isthadevathaLord = signLord.nakshatra_lord;
  const isthaDeva = ista_devatas?.[isthadevathaLord] || [];

  let atma = planets.find((p) => p.order === 1) || planets[0];
  if (atma && atma.Name === "Ascendant") {
    atma = planets.find((p) => p.order === 2) || atma;
  }

  let moon = planets.find((p) => p.Name === "Moon") || {};

  const start = Math.max(0, nakshatras.indexOf(moon.nakshatra));
  const nakshatrasOrder = nakshatras
    .slice(start)
    .concat(nakshatras.slice(0, start));

  const favourableNakshatraList = [];
  nakshatrasOrder.forEach((nk, idx) => {
    if (idx % 9 === 1) favourableNakshatraList.push(nk);
  });
  let favourableNakshatra =
    favourableNakshatraList.join(", ") +
    (favourableNakshatraList.length ? ", " : "");

  const luckyNumber = nakshatraNumber?.[panchang.nakshatra] || [];

  const fiveHouseLord = zodiac_lord[wrapIndex(((ascIndex + 5) % 12) - 1)];
  const ninthHouseLord2 = zodiac_lord[wrapIndex(((ascIndex + 9) % 12) - 1)];

  const stones = [
    Planet_Gemstone_Desc?.[asc?.zodiac_lord] || {},
    Planet_Gemstone_Desc?.[fiveHouseLord] || {},
    Planet_Gemstone_Desc?.[ninthHouseLord2] || {},
  ];

  const left_column_text = [
    "Name :",
    "Date Of Birth :",
    "Time Of Birth :",
    "Place Of Birth :",
    "Birth Nakshatra, Lord :",
    "Birth Rasi, Lord :",
    "Birth Lagnam, Lord :",
    "Tithi :",
    "Nithya Yogam :",
    "Karanam :",
    "Birth Week Day :",
    "Atma Karagam, Lord : ",
    "Ishta Devata :",
    "Benefic Stars :",
    "Benefic Number :",
    "Life Stone :",
    "Benefictical Stone :",
    "Lucky Stone :",
  ];

  const right_column_text = [
    `${name}`,
    `${formatted_date}`,
    `${formatted_time}`,
    `${location}`,
    `${panchang.nakshatra}, ${planets[2]?.nakshatra_lord}`,
    `${planets[2]?.sign}, ${planets[2]?.zodiac_lord}`,
    `${planets[0]?.sign}, ${planets[0]?.zodiac_lord}`,
    `${panchang.tithi}`,
    `${panchang.yoga}`,
    `${panchang.karana}`,
    `${panchang.week_day}`,
    `${atma?.Name}, ${atma_names?.[atma?.Name] ?? ""}`,
    `${isthaDeva ?? ""}`,
    `${favourableNakshatra}`,
    `${luckyNumber[0] ?? ""}, ${luckyNumber[1] ?? ""}`,
    `${stones[0]?.Gemstone ?? ""}`,
    `${stones[1]?.Gemstone ?? ""}`,
    `${stones[2]?.Gemstone ?? ""}`,
  ];

  const left_x = 80;
  const right_x = doc.page.width / 2 - 10;
  let start_y = 150;
  for (let i = 0; i < left_column_text.length; i++) {
    doc.font("Linotte-SemiBold").fontSize(16).fillColor("#000");
    doc.text(left_column_text[i], left_x, start_y, {
      width: doc.page.width / 2 - 100,
      align: "right",
    });
    doc.font("Linotte-Regular").fontSize(16).fillColor("#000");
    doc.text(right_column_text[i], right_x, start_y, {
      width: doc.page.width / 2 - 100,
      align: "left",
      lineGap: 2,
    });
    start_y = doc.y + 10;
  }

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#000");
  doc.text("Birth Chart", 0, 80, {
    align: "center",
    width: doc.page.width,
  });

  doc.image(
    path.join("/tmp", "charts", charts.birth_chart),
    doc.page.width / 2 - 125,
    doc.y + 20,
    {
      width: 250,
    }
  );
  doc.text("Navamsa Chart", 0, doc.y + 300, {
    align: "center",
    width: doc.page.width,
  });
  doc.image(
    path.join("/tmp", "charts", charts.navamsa_chart),
    doc.page.width / 2 - 125,
    doc.y + 20,
    {
      width: 250,
    }
  );

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(32).fillColor("#000");
  doc.text("Planetary Positions", 0, 70, {
    align: "center",
    width: doc.page.width,
  });

  let colors = [
    "#FFFDAC",
    "#EAECE8",
    "#FFAF7B",
    "#C6B9A9",
    "#FFE8B2",
    "#FDD29D",
    "#C3B3AA",
    "#A4EDFF",
    "#C5FFB5",
    "#FFF6F6",
  ];

  const startX = 65;
  const startY = doc.y + 36;
  const spacingX = 240;
  const spacingY = 230;
  doc.font("Linotte-Regular").fontSize(12).fillColor("#000");

  planets.forEach((planet, i) => {
    let x, y;
    if (i === 6) {
      newPage(doc, IMAGES);
      x = startX + 30;
      y = 90;
    } else if (i === 7) {
      x = startX + spacingX + 30;
      y = 90;
    } else if (i === 8) {
      x = startX + 30;
      y = 90 + spacingY;
    } else if (i === 9) {
      x = startX + spacingX + 30;
      y = 90 + spacingY;
    } else {
      x = startX + (i % 2) * spacingX + 30;
      y = startY + Math.floor(i / 2) * spacingY;
    }

    drawPlanetTable(doc, planet, x, y, colors[i % colors.length], IMAGES);
  });

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(32).fillColor("#000");
  doc.text(`${name}'s Favorable Times`, 0, 50, {
    align: "center",
    width: doc.page.width,
  });

  let i = 0;
  for (const [d, b] of Object.entries(dasa)) {
    let x, y;
    if (i < 6) {
      x = 50 + (i % 3) * 170;
      y = 90 + Math.floor(i / 3) * 340;
    } else {
      if (i === 6) {
        newPage(doc, IMAGES);
      }
      x = 50 + ((i - 6) % 3) * 170;
      y = 80 + Math.floor((i - 6) / 3) * 340;
    }

    const start_age = i === 0 ? 0 : parseInt(b[0].end_year) - year;
    const end_age = parseInt(b[b.length - 1].end_year) - year;

    drawDasa(doc, d, b, x, y, start_age, end_age, IMAGES);
    i++;
  }

  const noteColors = {
    Favourable: "#DAFFDC",
    Unfavourable: "#FFDADA",
    Moderate: "#DAE7FF",
  };

  doc
    .font("Linotte-Heavy")
    .fontSize(22)
    .text("Note:", 60, doc.y + 30);

  Object.entries(noteColors).forEach(([label, color]) => {
    doc
      .save()
      .fillColor(color)
      .roundedRect(100, doc.y + 20, 25, 25, 5)
      .fill()
      .restore();

    doc
      .font("Linotte-SemiBold")
      .fontSize(16)
      .fillColor("#000")
      .text(label, 140, doc.y + 25);
  });

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
  doc.text(`${name}'s Five Natural Elements`, 0, 55, {
    align: "center",
    width: doc.page.width,
  });

  const elements = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  planets.forEach((pla) => {
    for (const [d, k] of Object.entries(elements)) {
      if (
        pla["Name"] == "Ascendant" ||
        pla["Name"] == "Rahu" ||
        pla["Name"] == "Ketu"
      ) {
        continue;
      }
      if (elements_data[d].includes(pla["sign"])) {
        elements[d] = elements[d] + 1;
      }
    }
  });

  for (const [d, k] of Object.entries(elements)) {
    elements[d] = (elements[d] / 7) * 100;
  }

  const max_key1 = Object.keys(elements).reduce((a, b) =>
    elements[a] > elements[b] ? a : b
  );

  let max_value2 = 0;
  let max_key2 = "";
  for (const [k, v] of Object.entries(elements)) {
    if (k === max_key1) {
      continue;
    }
    if (v > max_value2) {
      max_value2 = v;
      max_key2 = k;
    }
  }

  const dominantElementData = elements_content[max_key1];

  doc
    .save()
    .fillColor("#BAF596")
    .roundedRect(60, doc.y + 15, doc.page.width - 120, 40, 10)
    .strokeColor("#06FF4C")
    .fillAndStroke()
    .restore();

  doc.fontSize(14).fillColor("#04650D");
  const textHeight = doc.currentLineHeight();
  doc.text(
    `${name}'s Dominant Element are ${max_key1} and ${max_key2}`,
    0,
    doc.y + 15 + (40 - textHeight) / 2,
    {
      align: "center",
      width: doc.page.width,
    }
  );

  doc.font("Linotte-Regular").fontSize(16).fillColor("#000");

  doc
    .save()
    .fillColor("#FFF2D7")
    .roundedRect(
      50,
      doc.y + 25,
      doc.page.width - 100,
      no_of_lines(doc, dominantElementData[0], doc.page.width - 120) *
        (doc.currentLineHeight() + 4) +
        20,
      10
    )
    .fill()
    .restore();

  doc.text(dominantElementData[0], 60, doc.y + 32.5, {
    align: "justify",
    width: doc.page.width - 120,
    lineGap: 4,
  });

  const elementsColors = ["#FF0000", "#43A458", "#B1DC36", "#4399FF"];

  draw_bar_chart(
    doc,
    60,
    doc.y + 230,
    55,
    30,
    elements,
    elementsColors,
    160,
    IMAGES
  );

  y = doc.y - 200;
  let x = doc.x + 100;
  for (const [i, [label, value]] of Object.entries(Object.entries(elements))) {
    doc.font("Linotte-SemiBold").fontSize(18).fillColor(elementsColors[i]);
    doc.text(`${label}: ${value.toFixed(2)}%`, x, y);
    y += 50;
  }

  doc.y += 40;
  doc.fillColor("#000");
  doc.text("Impacts on Personality", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Strength : ", 60, doc.y + 10, {
      continued: true,
      width: doc.page.width - 120,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[1].join(", "));

  doc
    .font("Linotte-SemiBold")
    .text("Challenges : ", 60, doc.y + 10, {
      continued: true,
      width: doc.page.width - 120,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[2].join(", "));

  doc
    .font("Linotte-SemiBold")
    .fontSize(16)
    .text(`Parenting Tips to Balance ${max_key1} Element`, 0, doc.y + 15, {
      align: "center",
      width: doc.page.width,
    });

  doc
    .font("Linotte-SemiBold")
    .text(dominantElementData[3].title + " : ", 60, doc.y + 15, {
      continued: true,
      width: doc.page.width - 120,
      indent: 10,
      lineGap: 5,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[3].desc);

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
  doc.text(`${name}'s Ayurvedic Body Type`, 0, 55, {
    align: "center",
    width: doc.page.width,
  });

  const lagna = planets.find((p) => p.Name === "Ascendant");
  const data = {
    Pitta:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Pitta) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Pitta)) /
        200) *
      100,
    Kapha:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Kapha) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Kapha)) /
        200) *
      100,
    Vadha:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Vata) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Vata)) /
        200) *
      100,
  };

  const max_value = Object.keys(data).reduce((a, b) =>
    data[a] > data[b] ? a : b
  );
  const constitutionMax = Constitution[max_value];

  doc
    .save()
    .fillColor("#BAF596")
    .roundedRect(60, doc.y + 15, doc.page.width - 120, 40, 10)
    .strokeColor("#06FF4C")
    .fillAndStroke()
    .restore();

  doc.fontSize(14).fillColor("#04650D");

  doc.text(
    `${name}'s Body is Dominated by ${max_value} Nature`,
    0,
    doc.y + 15 + (40 - doc.currentLineHeight()) / 2,
    {
      align: "center",
      width: doc.page.width,
    }
  );

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc
    .save()
    .fillColor("#D7ECFF")
    .roundedRect(
      50,
      doc.y + 25,
      doc.page.width - 100,
      no_of_lines(doc, constitutionMax[0], doc.page.width - 120) *
        (doc.currentLineHeight() + 4) +
        20,
      10
    )
    .fill()
    .restore();

  doc.text(constitutionMax[0], 60, doc.y + 32.5, {
    align: "justify",
    width: doc.page.width - 120,
    lineGap: 4,
  });

  const bodyTypeColors = ["#E34B4B", "#43C316", "#4BDAE3"];
  draw_bar_chart(
    doc,
    120,
    doc.y + 170,
    55,
    30,
    data,
    bodyTypeColors,
    120,
    IMAGES
  );

  y = doc.y - 150;
  x = doc.x + 100;
  Object.entries(data).forEach(([label, value], i) => {
    doc.font("Linotte-SemiBold").fontSize(18).fillColor(bodyTypeColors[i]);
    doc.text(`(${label}: ${value.toFixed(2)}%)`, x, y);
    y += 50;
  });

  doc.y += 20;
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text("Impacts on Body Type, Emotions, and Health", 0, doc.y + 30, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Body Type : ", 60, doc.y + 10, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[1], 60, doc.y);

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Emotions: ", 60, doc.y + 5, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[2], 60, doc.y);

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Health : ", 60, doc.y + 5, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[3], 60, doc.y);

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(`Parenting Tips to Balance ${max_key1} Dosha`, 0, doc.y + 15, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text(`${constitutionMax[4].title} : `, 60, doc.y + 15, {
      continued: true,
      indent: 10,
      lineGap: 5,
      width: doc.page.width - 120,
    });

  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .text(constitutionMax[4].desc, 60, doc.y);

  newPage(doc, IMAGES, name + "'s Chakras");
  pages.push(pageNo);

  const chakrasOrder = [
    "Root Chakra",
    "Sacral Chakra",
    "Solar Plexus Chakra",
    "Heart Chakra",
    "Throat Chakra",
    "Third Eye Chakra",
    "Crown Chakra",
  ];

  const childChakras = chakras[planets[0].sign][0];
  const chakrasContent = chakra_desc[childChakras];

  doc.font("Linotte-Heavy").fontSize(18).fillColor("#000");
  doc.text(`${name}'s Dominant Chakra is ${childChakras}`, 0, doc.y + 25, {
    align: "center",
    width: doc.page.width,
  });

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc.text(chakrasContent[0], 60, doc.y + 30, {
    align: "justify",
    width: doc.page.width - 130,
    indent: 20,
    lineGap: 4,
  });

  doc.font("Linotte-Heavy").fontSize(16);
  doc.text(chakrasContent[1], 60, doc.y + 20, {
    align: "center",
    width: doc.page.width - 120,
  });

  const chakraIndex = chakrasOrder.indexOf(childChakras);

  if ([5, 6].includes(chakraIndex)) {
    doc.image(
      path.join(IMAGES, `chakra_${chakraIndex + 1}.png`),
      doc.page.width / 2 - 50,
      doc.y + 20,
      { width: 100 }
    );
  } else {
    doc.image(
      path.join(IMAGES, `chakra_${chakraIndex + 1}.png`),
      doc.page.width / 2 - 40,
      doc.y + 20,
      { width: 80 }
    );
  }

  doc.y += 90;
  doc.font("Linotte-Heavy").fontSize(22).fillColor("#000");
  doc.text(childChakras, 0, doc.y + 30, {
    align: "center",
    width: doc.page.width,
  });

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    `Parenting Tips to Increase ${name}'s Aura and Energy Level`,
    0,
    doc.y + 30,
    { align: "center", width: doc.page.width }
  );

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text(`${chakrasContent[2].title} : `, 60, doc.y + 25, {
    width: doc.page.width - 120,
    continued: true,
    indent: 10,
    align: "justify",
    lineGap: 4,
  });

  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .text(chakrasContent[2].desc, 60, doc.y);

  let content = {
    child_personality: lagnaIdentity[planets[0]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
    emotional_needs: moonIdentity[planets[2]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
    core_identity: sunIdentity[planets[1]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
  };

  let trueTitle = {
    child_personality: `${name}'s Personality`,
    emotional_needs: `${name}'s Emotions`,
    core_identity: `${name}'s Core Identity`,
  };

  for (const [key, value] of Object.entries(content)) {
    if (doc.y > doc.page.height - 200) {
      newPage(doc, IMAGES);
    }
    ContentDesign(
      doc,
      DesignColors[Math.floor(Math.random() * DesignColors.length)],
      trueTitle[key],
      value,
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES, `Panchangam: A Guide to ${name}'s Flourishing Future`);
  pages.push(pageNo);
  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .fillColor("#000")
    .text(
      "Activating the Panchangam elements (Thithi, Vaaram, Nakshatra, Yogam, Karanam) can potentially bring balance to child's life, fostering positive energies and promoting growth.",
      60,
      doc.y + 15,
      {
        align: "justify",
        width: doc.page.width - 120,
        lineGap: 4,
      }
    );

  doc.y -= 20;

  ContentDesign(
    doc,
    "#BAF596",
    "",
    `${name} was born on ${formatted_date}, ${panchang["week_day"]} (Vaaram), under ${panchang["nakshatra"]} Nakshatra, ${panchang["paksha"]} Paksha ${panchang["thithi"]} Thithi, ${panchang["karanam"]} Karanam, and ${panchang["yoga"]} Yogam`,
    IMAGES,
    name
  );

  colors = ["#E5FFB5", "#94FFD2", "#B2E4FF", "#D6C8FF", "#FFDECA"];
  let titles = [
    `Tithi Represents ${name}'s Emotions, Mental Well-being`,
    `Vaaram Represents ${name}'s Energy & Behaviour`,
    `Nakshatra Represents ${name}'s Personality and Life Path`,
    `Yogam Represents ${name}'s Prosperity and Life Transformation`,
    `Karanam Represents ${name}'s Work and Actions`,
  ];

  let titleImages = [
    panchang.thithi_number <= 15 ? "waningMoon.png" : "waxingMoon.png",
    "week.png",
    "nakshatra.png",
    "yogam.png",
    "karanam.png",
  ];

  let panchangContent = [
    "",
    "",
    "Guru, born under the Rohini Nakshatra, possesses a charismatic and creative personality. He is known for his nurturing and caring nature, often acting as a source of comfort and security for those around him. With a strong sense of determination and ambition, Guru is likely to excel in creative fields such as art, music, or writing. His life path is guided by a desire for stability and prosperity, leading him to focus on building a secure and harmonious environment for himself and his loved ones.",
    "Guru was born under the Shubha Yogam, which bestows him with blessings of auspiciousness and prosperity. Guided by this Yogam, Guru is destined to reach great heights in his endeavors, focusing on creating a positive impact in the world and nurturing spiritual growth. His goals are aligned with serving others and spreading positivity, bringing about a sense of harmony and abundance wherever he goes. The Shubha Yogam empowers Guru to lead a fulfilling life, radiating positivity and making a significant positive impact on those around him.",
  ];

  for (let i = 0; i < titles.length; i++) {
    if (doc.y > doc.page.height - 200) {
      newPage(doc, IMAGES);
      doc.y = 40;
    }

    doc.image(
      path.join(IMAGES, titleImages[i]),
      doc.page.width / 2 - 20,
      doc.y + 10,
      {
        width: 50,
        height: 50,
      }
    );

    doc.y += 20;

    if (i === 0) {
      let positive = thithiContent[panchang.tithi][0];
      let negative = thithiContent[panchang.tithi][1];
      let tips = thithiContent[panchang.tithi][2];

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born under ${panchang.paksha} ${panchang.tithi}, and the following are Thithi impacts on ${name}'s Life`,
        60,
        doc.y + 20,
        {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.fontSize(14);
      let totalWidth =
        doc.widthOfString("Thithi Lord: ") +
        doc.font("Linotte-SemiBold").widthOfString(thithiLord[panchang.tithi]);

      doc
        .rect(
          100,
          doc.y + 20,
          doc.page.width - 200,
          doc.currentLineHeight() + 10
        )
        .fill(DesignColors[Math.floor(Math.random() * DesignColors.length)])
        .restore();

      doc.fillColor("#000").font("Linotte-Regular");

      doc
        .text(
          "Thithi Lord: ",
          doc.page.width / 2 - totalWidth / 2 - 10,
          doc.y + 25,
          {
            width: totalWidth + 20,
            continued: true,
          }
        )
        .font("Linotte-SemiBold")
        .text(thithiLord[panchang.tithi]);

      doc
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Description + " " + tips.Execution);
    } else if (i == 1) {
      let positive = weekPlanetContent[panchang["week_day"]][0];
      let negative = weekPlanetContent[panchang["week_day"]][1];
      let tips = weekPlanetContent[panchang["week_day"]][2];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born on ${panchang["week_day"]}, and the following are its impacts on ${name}'s life:`,
        60,
        doc.y + 20,
        {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.fontSize(14);
      let totalWidth =
        doc.widthOfString("Rulling Planet: ") +
        doc
          .font("Linotte-SemiBold")
          .widthOfString(weekPlanet[panchang["week_day"]]);

      doc
        .rect(
          100,
          doc.y + 20,
          doc.page.width - 200,
          doc.currentLineHeight() + 10
        )
        .fill(DesignColors[Math.floor(Math.random() * DesignColors.length)])
        .restore();

      doc.fillColor("#000").font("Linotte-Regular");

      doc
        .text(
          "Rulling Planet: ",
          doc.page.width / 2 - totalWidth / 2 - 10,
          doc.y + 25,
          {
            width: totalWidth + 20,
            continued: true,
          }
        )
        .font("Linotte-SemiBold")
        .text(weekPlanet[panchang["week_day"]]);

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 40;
      }

      doc
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Execution);
    } else if (i == 4) {
      let positive = karanamContent[panchang["karana"]][0];
      let negative = karanamContent[panchang["karana"]][1];
      let tips = karanamContent[panchang["karana"]][2];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 0;
      }

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born under ${panchang["karana"]}, and the following are Karanam impacts on ${name}'s life:`,
        60,
        doc.y + 20,
        {
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 50;
      }

      doc
        .fontSize(14)
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Execution);
    } else {
      let con = await panchangPrompt(panchang, i, name, gender);
      doc.y += 30;
      ContentDesign(doc, randomeColor(), titles[i], con, IMAGES, name);
    }

    doc.y += 30;
  }

  newPage(
    doc,
    IMAGES,
    "Potential Health Challenges and Holistic Wellness Solutions"
  );
  pages.push(pageNo);

  let shifted = zodiac
    .slice(zodiac.indexOf(asc["sign"]))
    .concat(zodiac.slice(0, zodiac.indexOf(asc["sign"])));

  let con = healthContent[shifted[5]];
  let insights = healthInsights[shifted[5]];

  doc.y += 10;

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  lineBreak(doc, insights, IMAGES, randomeColor());

  doc
    .font("Linotte-SemiBold")
    .fontSize(18)
    .text("Health Issues Based on", 0, doc.y + 20, {
      align: "center",
      width: doc.page.width,
    });
  let color1 = randomeColor();
  let color2 = randomeColor();
  let colwidth = (doc.page.width - 50) / 2 - 10;
  let set_y = doc.y;

  doc.roundedRect(30, doc.y + 10, colwidth, 45, 10).fill(color1);

  doc
    .fontSize(15)
    .fillColor("#000")
    .text("Common Health Issues", 30, doc.y + 15, {
      align: "center",
      width: colwidth,
    });

  doc.y += 5;

  con[0].forEach((issue, index) => {
    let texts = issue.split(" (");

    let height =
      doc.fontSize(14).heightOfString(index + ") " + texts[0], {
        width: colwidth,
        lineGap: 4,
      }) +
      doc.font("Linotte-Regular").heightOfString(" (" + texts[1], {
        width: colwidth,
        lineGap: 4,
      });

    doc
      .roundedRect(
        30,
        doc.y,
        colwidth,
        height + (con[0].indexOf(issue) === con[0].length - 1 ? 8 : 15),
        10
      )
      .fill(color1);

    doc.fillColor("#000").font("Linotte-SemiBold").fontSize(14);
    doc
      .text(index + 1 + ") " + texts[0], 40, doc.y, {
        continued: true,
        width: colwidth,
        lineGap: 4,
      })
      .font("Linotte-Regular")
      .text(texts[1]);
  });

  let current_y = doc.y;
  doc
    .roundedRect(30 + colwidth + 15, set_y + 10, colwidth, 45, 10)
    .fill(color2);

  doc
    .fontSize(15)
    .fillColor("#000")
    .text("Dosha Constitution Issues", 30 + colwidth + 10, set_y + 15, {
      align: "center",
      width: colwidth,
    });

  set_y += 5;

  con[1].forEach((issue, index) => {
    let texts = issue.split(" (");

    let height =
      doc.fontSize(14).heightOfString(index + ") " + texts[0], {
        width: colwidth,
        lineGap: 4,
      }) +
      doc.font("Linotte-Regular").heightOfString(" (" + texts[1], {
        width: colwidth,
        lineGap: 4,
      });

    doc
      .roundedRect(
        30 + colwidth + 15,
        doc.y,
        colwidth,
        height + (con[1].indexOf(issue) === con[1].length - 1 ? 8 : 15),
        10
      )
      .fill(color2);

    doc.fillColor("#000").font("Linotte-SemiBold").fontSize(14);
    doc
      .text(index + 1 + ") " + texts[0], 40 + colwidth + 10, doc.y, {
        continued: true,
        width: colwidth,
        lineGap: 4,
      })
      .font("Linotte-Regular")
      .text(texts[1]);
  });

  current_y = Math.max(current_y, doc.y);
  doc.y = current_y + 10;

  doc
    .font("Linotte-Heavy")
    .fontSize(18)
    .text("Remedial Practices", 0, doc.y + 20, {
      align: "center",
      width: doc.page.width,
    });

  colors = ["#CBF3DB", "#FFD6A5", "#DEE2FF"];
  let title = [
    "Natural Ayurvedic Remedy",
    "Mudra Practice Remedy",
    "Mindful Food & Diet Remedy",
  ];

  title.forEach((t, i) => {
    doc
      .roundedRect(doc.page.width / 2 - 150, doc.y + 10, 300, 30, 10)
      .fill(colors[i]);
    doc
      .fontSize(16)
      .fillColor("#000")
      .text(t, doc.page.width / 2 - 150, doc.y + 20, {
        align: "center",
        width: 300,
      });

    doc.y += 10;
  });

  newPage(doc, IMAGES);
  doc.y = 70;
  let color = colors[0];
  doc.roundedRect(60, doc.y + 7.5, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "ayur.png"),
    doc.page.width / 2 - 30,
    doc.y + 10,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Natural Ayurvedic", 0, doc.y + 80, {
    align: "center",
  });

  content = con[3]["natural"];

  doc.font("Linotte-Regular").fontSize(14);
  doc.rect(60, doc.y, doc.page.width - 120, 50).fill(color);
  doc.fillColor("#000");
  doc.text(content[0], 70, doc.y + 10, {
    align: "center",
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  let height =
    doc.font("Linotte-SemiBold").heightOfString("Ingredients: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[1], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.rect(60, doc.y, doc.page.width - 120, height).fill(color);
  doc.fillColor("#000");
  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Ingredients: ", 70, doc.y, {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    });
  doc.font("Linotte-Regular").fontSize(14).text(content[1], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("How to Make: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[2], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.rect(60, doc.y, doc.page.width - 120, height).fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("How to Make: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(60, doc.y, doc.page.width - 120, height + 5, 10).fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  doc.y += 50;

  color = colors[1];
  doc.roundedRect(60, doc.y + 10, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "mudra.png"),
    doc.page.width / 2 - 30,
    doc.y + 20,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Mudra Practice Remedy", 0, doc.y + 90, {
    align: "center",
  });

  content = con[3]["mudra"];

  doc.font("Linotte-Regular").fontSize(14);
  doc.rect(60, doc.y, doc.page.width - 120, 50).fill(color);
  doc.fillColor("#000");
  doc.text(content[0], 70, doc.y + 10, {
    align: "center",
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  height = doc.font("Linotte-SemiBold").fontSize(16).currentLineHeight() + 10;

  doc.rect(60, doc.y, doc.page.width - 120, height + 10).fill(color);
  doc.fillColor("#000");
  doc.text("Steps: ", 70, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  content[1].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 10;

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[2], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc
    .roundedRect(60, doc.y - 10, doc.page.width - 120, height + 20, 10)
    .fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  newPage(doc, IMAGES);
  doc.y = 70;
  color = colors[2];
  doc.roundedRect(60, doc.y + 7.5, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "food.png"),
    doc.page.width / 2 - 30,
    doc.y + 10,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Mindful Food & Diet Remedy", 0, doc.y + 80, {
    align: "center",
  });

  content = con[3]["foods"];

  doc.y += 10;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y, doc.page.width - 120, doc.currentLineHeight() + 30)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "tick.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Food to Include", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[0].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 20;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y - 20, doc.page.width - 120, doc.currentLineHeight() + 50)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "cancel.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Food to Avoid", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[1].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 20;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y - 20, doc.page.width - 120, doc.currentLineHeight() + 50)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "guide.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Execution Guide", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[2].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 10;

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc
    .roundedRect(60, doc.y - 10, doc.page.width - 120, height + 20, 10)
    .fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  let content2 = await physical(planets, 2, name, gender);
  let content3 = await physical(planets, 3, name, gender);
  let content4 = await physical(planets, 4, name, gender);

  let totalContents = [content2, content3, content4];

  titles = [
    {
      physical_attributes: "Physical Attributes",
      personality: "Outer Personality",
      character: "Character",
      positive_behavior: "Positive Behavior",
      negative_behavior: "Behavior Challenges",
      parenting_tips: `Parenting Tips For ${name}'s Behaviour Challenges`,
    },
    {
      emotional_state: `${name}'s Emotional State Insights`,
      emotions: `${name}'s Emotions`,
      feelings: `${name}'s Feelings`,
      reactions: `${name}'s Reactions`,
      negative_imbalance: `${name}'s Emotional Imbalance Challenges`,
      parenting_tips: `Parenting Tips`,
    },
    {
      core_insights: `${name}'s Soul Desire`,
      recognitions: `Seek For Recognition`,
      core_identity: `Core Identity`,
      ego: `${name}'s Soul Ego`,
      negative_ego: `${name}'s Ego Challenges`,
      parenting_tips: `Parenting Tips For Self Identity Challenges`,
    },
  ];

  newPage(
    doc,
    IMAGES,
    "Outer World - Physical Attributes, Personality, and Behavior"
  );
  pages.push(pageNo);
  doc.fillColor("#000");

  totalContents.forEach((content, index) => {
    if (index === 1) {
      newPage(doc, IMAGES, "Inner World - Emotional Needs and Soul Desire");
      pages.push(pageNo);
      doc.fillColor("#000");
    }

    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    doc.fillColor("#000");

    if (typeof content === "string") {
      doc.font("Linotte-SemiBold").fontSize(18);
      doc.text(titles[index], 60, doc.y + 10, {
        align: "center",
        width: doc.page.width - 120,
        lineGap: 4,
      });

      doc
        .font("Linotte-Regular")
        .fontSize(14)
        .text(content, 60, doc.y + 10, {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
        });
    } else {
      for (let key in content) {
        if (doc.y + 80 > doc.page.height - 100) {
          newPage(doc, IMAGES);
          doc.y = 60;
        }
        ContentDesign(
          doc,
          randomeColor(),
          titles[index][key],
          content[key],
          ICONS,
          name
        );
      }
    }
  });

  newPage(doc, IMAGES, `${name}'s Education and Intellect`);
  pages.push(pageNo);

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    `Insights about ${name}'s education and intelligence`,
    60,
    doc.y + 10,
    {
      align: "center",
      width: doc.page.width - 120,
      lineGap: 4,
    }
  );

  let educationTitle = {
    insights: "Education and Intellectual Insights",
    suitable_educational: "Higher Education Preferences",
    cognitive_abilities: "Learning Approaches",
    recommendations: "How To Do It:",
  };

  content = education[moon["sign"]];

  con = {
    insights: content[0],
    suitable_educational: content[1],
    cognitive_abilities: content[2],
    recommendations: content[4],
  };

  doc.fillColor("#000");

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    if (key === "recommendations") {
      if (doc.y + 80 > doc.page.height - 100) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.image(
        path.join(ICONS, "pg 33_personalized.png"),
        doc.page.width / 2 - 20,
        doc.y + 10,
        {
          width: 40,
          height: 40,
        }
      );

      doc.font("Linotte-SemiBold").fontSize(18);
      doc.text("Parenting Tip for Academic Excellence:", 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
        lineGap: 4,
      });

      doc.fontSize(15);

      doc.text(content[3], 60, doc.y + 10, {
        align: "center",
        width: doc.page.width - 120,
        lineGap: 4,
      });
    }

    ContentDesign(
      doc,
      randomeColor(),
      educationTitle[key],
      con[key],
      ICONS,
      name
    );
  }

  let planetMain = {
    Sun: "Soul, Vitality, & Leadership Qualities",
    Moon: "Emotions, Intuition, Nurturing  Mind.",
    Mars: "Energy, Courage, Passion, and Assertiveness.",
    Mercury: "Communications, Intelligence, Adaptability.",
    Jupiter: "Wisdom, Expansion, Knowledge, Spirituality.",
    Venus: "Love, Relationships, Beauty, Art, Comforts.",
    Saturn: "Discipline, Responsibility, Challenges.",
    Rahu: "Desires, Ambitions, Worldly Attachment.",
    Ketu: "Spirituality, Detachment, Past Life Influence.",
  };

  planets.forEach((planet) => {
    if (planet.Name === "Ascendant") return;
    let planet_table = planetTable[planet.Name];

    if (planet_table[0].includes(planet["zodiac_lord"])) {
      planet["status"] = "Favourable";
    } else if (planet_table[1].includes(planet["zodiac_lord"])) {
      planet["status"] = "Unfavourable";
    } else {
      planet["status"] = "Moderate";
    }

    newPage(doc, IMAGES);
    if (planet.Name === "Sun") {
      pages.push(pageNo);
    }
    doc.font("Linotte-Heavy");
    doc.y = 40;

    if (planet.Name === "Sun") {
      doc.fontSize(26);
      doc.fillColor("#966A2F");
      doc.text(
        `${name}'s Planetary Energy and Lifestyle Modification`,
        80,
        doc.y,
        {
          width: doc.page.width - 160,
          align: "center",
        }
      );
      doc.y += 10;
    }

    doc.fontSize(20);
    doc.fillColor("#000");
    doc.text(`${planet.Name} - ${planetMain[planet.Name]}`, 80, doc.y, {
      width: doc.page.width - 160,
      align: "center",
    });

    if (planet.Name === "Ketu") doc.y -= 10;

    doc.image(
      path.join(IMAGES, `${planet.Name.toLowerCase()}.png`),
      110,
      doc.y + (planet["Name"] === "Ketu" ? 40 : 30),
      {
        width: 80,
        height: 80,
      }
    );

    doc.font("Linotte-Regular").fontSize(12);

    content = planetDesc[planet["Name"]];

    height = doc.heightOfString(content[0], {
      width: doc.page.width / 2 - (planet["Name"] === "Ketu" ? 0 : 30),
      lineGap: 4,
    });

    doc
      .roundedRect(
        doc.page.width / 2 - (planet["Name"] === "Ketu" ? 50 : 20),
        doc.y + 30,
        doc.page.width / 2 - (planet["Name"] === "Ketu" ? -10 : 20),
        height + 10,
        10
      )
      .fill(randomeColor());

    doc.fillColor("#000");

    doc.text(
      content[0],
      doc.page.width / 2 - (planet["Name"] === "Ketu" ? 42.5 : 15),
      doc.y + 40,
      {
        width: doc.page.width / 2 - (planet["Name"] === "Ketu" ? 0 : 30),
        align: "justify",
        lineGap: 4,
      }
    );

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    if (planet.Name !== "Ketu") doc.y += 20;

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Discipline : " + content[1][0], 0, doc.y + 40, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    let smallTitle = {
      1: `${planet["Name"]} Guide to ${name}: `,
      2: "",
      3: `Say to ${name}: `,
    };

    for (let i = 1; i < content[1].length; i++) {
      content[1][i] = content[1][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[1][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[1].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[1][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Life Lesson : " + content[2][0], 0, doc.y + 45, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    for (let i = 1; i < content[2].length; i++) {
      content[2][i] = content[2][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[2][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[2].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[2][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Food & Diet : " + content[4][0], 0, doc.y + 40, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    smallTitle = {
      1: `${planet["Name"]} Guide to ${name}: `,
      2: "",
      3: `Say to ${name}: `,
    };

    for (let i = 1; i < content[4].length; i++) {
      content[4][i] = content[4][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[4][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[4].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[4][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }
  });

  newPage(doc, IMAGES);
  doc.fillColor("#000").font("Linotte-Heavy").fontSize(32);
  doc.text("Thank You!", 0, doc.y + 80, {
    width: doc.page.width,
    align: "center",
    lineGap: 4,
  });

  doc.image(
    path.join(IMAGES, "logo.png"),
    doc.page.width / 2 - 50,
    doc.y + 20,
    {
      width: 100,
      align: "center",
    }
  );

  doc.image(path.join(IMAGES, "ending.png"), 150, doc.page.height / 2 - 100, {
    width: doc.page.width - 300,
  });

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageHeight = doc.page.height;

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(i + 1, 0, pageHeight - 30, {
        align: "center",
      });
  }

  doc.switchToPage(2);
  doc
    .font("Linotte-SemiBold")
    .fontSize(22)
    .fillColor("#000")
    .text(`Contents`, 60, 50, {
      align: "center",
      width: doc.page.width - 120,
    });

  doc.fontSize(16);
  y = doc.y + 20;

  context[1].forEach((item, index) => {
    if (doc.y > doc.page.height - 120) {
      doc.switchToPage(3);
      y = 60;
      doc.fontSize(16).fillColor("#000").font("Linotte-SemiBold");
    }

    const text = `${index + 1}. ${item}`
      .replace(/child/g, name)
      .replace(/Child/g, name);
    const pageNum = pages[index];
    let numberHeight = doc.widthOfString(pageNum.toString());
    height = doc.heightOfString(`${index + 1}. ${item}`, {
      width: doc.page.width - 170 - numberHeight,
      lineGap: 4,
    });

    doc.text(text, 80, y, {
      width: doc.page.width - 170 - numberHeight,
      align: "left",
      goTo: "page" + pages[index],
      lineGap: 4,
    });

    doc.text(pageNum.toString(), doc.page.width - 80 - numberHeight, y, {
      align: "right",
      width: numberHeight,
    });

    y = Math.max(doc.y, y + height) + 15;
  });

  await doc.end();
}

async function UltimateReport(
  doc,
  reportPath,
  planets,
  panchang,
  dasa,
  charts,
  formatted_date,
  formatted_time,
  location,
  year,
  month,
  name,
  gender,
  outputDir
) {
  const IMAGES = path.join(reportPath, "report", "images");
  const ICONS = path.join(reportPath, "report", "icons");

  doc.image(path.join(IMAGES, "book-cover2.png"), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
  newPage(doc, IMAGES);
  doc.font("Linotte-SemiBold").fontSize(38).fillColor("#040606");
  doc.text(`${name.split(" ")[0]}'s First Astrology Report`, 60, 120, {
    align: "center",
    width: doc.page.width - 120,
  });
  doc.image(
    path.join(IMAGES, "starting.png"),
    doc.page.width / 2 - 150,
    doc.page.height / 2 - 150,
    { width: 300, height: 300 }
  );

  const paragraphWidth = doc.page.width - 120;

  doc.font("Linotte-SemiBold").fontSize(22).fillColor("#000");
  doc.text(
    `The Precious Child Born on the auspicious day ${formatted_date} at ${formatted_time.toUpperCase()}. Place of birth is ${location}.`,
    60,
    doc.y + 400,
    { width: paragraphWidth, align: "justify" }
  );

  newPage(doc, IMAGES);
  newPage(doc, IMAGES);

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(36).fillColor("#000");

  const widthString = doc.widthOfString(`${name}'s Astrology Details`);
  let yPosition = doc.page.height / 2 - 18;

  if (widthString > doc.page.width - 300) {
    yPosition += 18;
  }
  pages.push(pageNo);
  doc.text(`${name}'s Astrology Details`, 150, yPosition, {
    align: "center",
    width: doc.page.width - 300,
  });

  newPage(doc, IMAGES, name + "'s True Self");
  pages.push(pageNo);

  doc.fillColor("#000").fontSize(18);

  doc.text(
    `Let's take a look at the three most influential and important signs for ${name}!`,
    80,
    doc.y + 30,
    {
      align: "center",
      width: doc.page.width - 160,
    }
  );

  doc
    .font("Linotte-SemiBold")
    .text(`As per ${name}'s kundli,`, 60, doc.y + 10, {
      align: "left",
      width: doc.page.width - 120,
    });

  let y = doc.y + 20;
  roundedBoxBorder(
    doc,
    "#FFE769",
    "#C5A200",
    60,
    y,
    planets[1]["Name"],
    planets[1]["sign"],
    IMAGES
  );
  roundedBoxBorder(
    doc,
    "#D1C4E9",
    "#A394C6",
    230,
    y,
    planets[0]["Name"],
    planets[0]["sign"],
    IMAGES
  );
  roundedBoxBorder(
    doc,
    "#B3E5FC",
    "#82B3C9",
    400,
    y,
    planets[2]["Name"],
    planets[2]["sign"],
    IMAGES
  );

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(42).fillColor("#E85D2B");
  doc.text(`Horoscope Details`, 50, 90, {
    align: "center",
    width: doc.page.width - 100,
  });

  let asc = planets.find((p) => p.Name === "Ascendant");

  const ascIndex = asc ? Math.max(0, zodiac.indexOf(asc.sign)) : 0;

  const wrapIndex = (i) => ((i % 12) + 12) % 12;

  const ninthHouseLord = zodiac_lord[wrapIndex(((ascIndex + 9) % 12) - 1)];
  const signLord = planets.find((p) => p.Name === ninthHouseLord) || {};
  const isthadevathaLord = signLord.nakshatra_lord;
  const isthaDeva = ista_devatas?.[isthadevathaLord] || [];

  let atma = planets.find((p) => p.order === 1) || planets[0];
  if (atma && atma.Name === "Ascendant") {
    atma = planets.find((p) => p.order === 2) || atma;
  }

  let moon = planets.find((p) => p.Name === "Moon") || {};

  const start = Math.max(0, nakshatras.indexOf(moon.nakshatra));
  const nakshatrasOrder = nakshatras
    .slice(start)
    .concat(nakshatras.slice(0, start));

  const favourableNakshatraList = [];
  nakshatrasOrder.forEach((nk, idx) => {
    if (idx % 9 === 1) favourableNakshatraList.push(nk);
  });
  let favourableNakshatra =
    favourableNakshatraList.join(", ") +
    (favourableNakshatraList.length ? ", " : "");

  const luckyNumber = nakshatraNumber?.[panchang.nakshatra] || [];

  const fiveHouseLord = zodiac_lord[wrapIndex(((ascIndex + 5) % 12) - 1)];
  const ninthHouseLord2 = zodiac_lord[wrapIndex(((ascIndex + 9) % 12) - 1)];

  const stones = [
    Planet_Gemstone_Desc?.[asc?.zodiac_lord] || {},
    Planet_Gemstone_Desc?.[fiveHouseLord] || {},
    Planet_Gemstone_Desc?.[ninthHouseLord2] || {},
  ];

  const left_column_text = [
    "Name :",
    "Date Of Birth :",
    "Time Of Birth :",
    "Place Of Birth :",
    "Birth Nakshatra, Lord :",
    "Birth Rasi, Lord :",
    "Birth Lagnam, Lord :",
    "Tithi :",
    "Nithya Yogam :",
    "Karanam :",
    "Birth Week Day :",
    "Atma Karagam, Lord : ",
    "Ishta Devata :",
    "Benefic Stars :",
    "Benefic Number :",
    "Life Stone :",
    "Benefictical Stone :",
    "Lucky Stone :",
  ];

  const right_column_text = [
    `${name}`,
    `${formatted_date}`,
    `${formatted_time}`,
    `${location}`,
    `${panchang.nakshatra}, ${planets[2]?.nakshatra_lord}`,
    `${planets[2]?.sign}, ${planets[2]?.zodiac_lord}`,
    `${planets[0]?.sign}, ${planets[0]?.zodiac_lord}`,
    `${panchang.tithi}`,
    `${panchang.yoga}`,
    `${panchang.karana}`,
    `${panchang.week_day}`,
    `${atma?.Name}, ${atma_names?.[atma?.Name] ?? ""}`,
    `${isthaDeva ?? ""}`,
    `${favourableNakshatra}`,
    `${luckyNumber[0] ?? ""}, ${luckyNumber[1] ?? ""}`,
    `${stones[0]?.Gemstone ?? ""}`,
    `${stones[1]?.Gemstone ?? ""}`,
    `${stones[2]?.Gemstone ?? ""}`,
  ];

  const left_x = 80;
  const right_x = doc.page.width / 2 - 10;
  let start_y = 150;
  for (let i = 0; i < left_column_text.length; i++) {
    doc.font("Linotte-SemiBold").fontSize(16).fillColor("#000");
    doc.text(left_column_text[i], left_x, start_y, {
      width: doc.page.width / 2 - 100,
      align: "right",
    });
    doc.font("Linotte-Regular").fontSize(16).fillColor("#000");
    doc.text(right_column_text[i], right_x, start_y, {
      width: doc.page.width / 2 - 100,
      align: "left",
      lineGap: 2,
    });
    start_y = doc.y + 10;
  }

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#000");
  doc.text("Birth Chart", 0, 80, {
    align: "center",
    width: doc.page.width,
  });

  doc.image(
    path.join("/tmp", "charts", charts.birth_chart),
    doc.page.width / 2 - 125,
    doc.y + 20,
    {
      width: 250,
    }
  );
  doc.text("Navamsa Chart", 0, doc.y + 300, {
    align: "center",
    width: doc.page.width,
  });
  doc.image(
    path.join("/tmp", "charts", charts.navamsa_chart),
    doc.page.width / 2 - 125,
    doc.y + 20,
    {
      width: 250,
    }
  );

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(32).fillColor("#000");
  doc.text("Planetary Positions", 0, 70, {
    align: "center",
    width: doc.page.width,
  });

  let colors = [
    "#FFFDAC",
    "#EAECE8",
    "#FFAF7B",
    "#C6B9A9",
    "#FFE8B2",
    "#FDD29D",
    "#C3B3AA",
    "#A4EDFF",
    "#C5FFB5",
    "#FFF6F6",
  ];

  const startX = 65;
  const startY = doc.y + 36;
  const spacingX = 240;
  const spacingY = 230;
  doc.font("Linotte-Regular").fontSize(12).fillColor("#000");

  planets.forEach((planet, i) => {
    let x, y;
    if (i === 6) {
      newPage(doc, IMAGES);
      x = startX + 30;
      y = 90;
    } else if (i === 7) {
      x = startX + spacingX + 30;
      y = 90;
    } else if (i === 8) {
      x = startX + 30;
      y = 90 + spacingY;
    } else if (i === 9) {
      x = startX + spacingX + 30;
      y = 90 + spacingY;
    } else {
      x = startX + (i % 2) * spacingX + 30;
      y = startY + Math.floor(i / 2) * spacingY;
    }

    drawPlanetTable(doc, planet, x, y, colors[i % colors.length], IMAGES);
  });

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(32).fillColor("#000");
  doc.text(`${name}'s Favorable Times`, 0, 50, {
    align: "center",
    width: doc.page.width,
  });

  let i = 0;
  for (const [d, b] of Object.entries(dasa)) {
    let x, y;
    if (i < 6) {
      x = 50 + (i % 3) * 170;
      y = 90 + Math.floor(i / 3) * 340;
    } else {
      if (i === 6) {
        newPage(doc, IMAGES);
      }
      x = 50 + ((i - 6) % 3) * 170;
      y = 80 + Math.floor((i - 6) / 3) * 340;
    }

    const start_age = i === 0 ? 0 : parseInt(b[0].end_year) - year;
    const end_age = parseInt(b[b.length - 1].end_year) - year;

    drawDasa(doc, d, b, x, y, start_age, end_age, IMAGES);
    i++;
  }

  const noteColors = {
    Favourable: "#DAFFDC",
    Unfavourable: "#FFDADA",
    Moderate: "#DAE7FF",
  };

  doc
    .font("Linotte-Heavy")
    .fontSize(22)
    .text("Note:", 60, doc.y + 30);

  Object.entries(noteColors).forEach(([label, color]) => {
    doc
      .save()
      .fillColor(color)
      .roundedRect(100, doc.y + 20, 25, 25, 5)
      .fill()
      .restore();

    doc
      .font("Linotte-SemiBold")
      .fontSize(16)
      .fillColor("#000")
      .text(label, 140, doc.y + 25);
  });

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
  doc.text(`${name}'s Five Natural Elements`, 0, 55, {
    align: "center",
    width: doc.page.width,
  });

  const elements = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  planets.forEach((pla) => {
    for (const [d, k] of Object.entries(elements)) {
      if (
        pla["Name"] == "Ascendant" ||
        pla["Name"] == "Rahu" ||
        pla["Name"] == "Ketu"
      ) {
        continue;
      }
      if (elements_data[d].includes(pla["sign"])) {
        elements[d] = elements[d] + 1;
      }
    }
  });

  for (const [d, k] of Object.entries(elements)) {
    elements[d] = (elements[d] / 7) * 100;
  }

  const max_key1 = Object.keys(elements).reduce((a, b) =>
    elements[a] > elements[b] ? a : b
  );

  let max_value2 = 0;
  let max_key2 = "";
  for (const [k, v] of Object.entries(elements)) {
    if (k === max_key1) {
      continue;
    }
    if (v > max_value2) {
      max_value2 = v;
      max_key2 = k;
    }
  }

  const dominantElementData = elements_content[max_key1];

  doc
    .save()
    .fillColor("#BAF596")
    .roundedRect(60, doc.y + 15, doc.page.width - 120, 40, 10)
    .strokeColor("#06FF4C")
    .fillAndStroke()
    .restore();

  doc.fontSize(14).fillColor("#04650D");
  const textHeight = doc.currentLineHeight();
  doc.text(
    `${name}'s Dominant Element are ${max_key1} and ${max_key2}`,
    0,
    doc.y + 15 + (40 - textHeight) / 2,
    {
      align: "center",
      width: doc.page.width,
    }
  );

  doc.font("Linotte-Regular").fontSize(16).fillColor("#000");

  doc
    .save()
    .fillColor("#FFF2D7")
    .roundedRect(
      50,
      doc.y + 25,
      doc.page.width - 100,
      no_of_lines(doc, dominantElementData[0], doc.page.width - 120) *
        (doc.currentLineHeight() + 4) +
        20,
      10
    )
    .fill()
    .restore();

  doc.text(dominantElementData[0], 60, doc.y + 32.5, {
    align: "justify",
    width: doc.page.width - 120,
    lineGap: 4,
  });

  const elementsColors = ["#FF0000", "#43A458", "#B1DC36", "#4399FF"];

  draw_bar_chart(
    doc,
    60,
    doc.y + 230,
    55,
    30,
    elements,
    elementsColors,
    160,
    IMAGES
  );

  y = doc.y - 200;
  let x = doc.x + 100;
  for (const [i, [label, value]] of Object.entries(Object.entries(elements))) {
    doc.font("Linotte-SemiBold").fontSize(18).fillColor(elementsColors[i]);
    doc.text(`${label}: ${value.toFixed(2)}%`, x, y);
    y += 50;
  }

  doc.y += 40;
  doc.fillColor("#000");
  doc.text("Impacts on Personality", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Strength : ", 60, doc.y + 10, {
      continued: true,
      width: doc.page.width - 120,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[1].join(", "));

  doc
    .font("Linotte-SemiBold")
    .text("Challenges : ", 60, doc.y + 10, {
      continued: true,
      width: doc.page.width - 120,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[2].join(", "));

  doc
    .font("Linotte-SemiBold")
    .fontSize(16)
    .text(`Parenting Tips to Balance ${max_key1} Element`, 0, doc.y + 15, {
      align: "center",
      width: doc.page.width,
    });

  doc
    .font("Linotte-SemiBold")
    .text(dominantElementData[3].title + " : ", 60, doc.y + 15, {
      continued: true,
      width: doc.page.width - 120,
      indent: 10,
      lineGap: 5,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[3].desc);

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
  doc.text(`${name}'s Ayurvedic Body Type`, 0, 55, {
    align: "center",
    width: doc.page.width,
  });

  const lagna = planets.find((p) => p.Name === "Ascendant");
  const data = {
    Pitta:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Pitta) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Pitta)) /
        200) *
      100,
    Kapha:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Kapha) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Kapha)) /
        200) *
      100,
    Vadha:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Vata) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Vata)) /
        200) *
      100,
  };

  const max_value = Object.keys(data).reduce((a, b) =>
    data[a] > data[b] ? a : b
  );
  const constitutionMax = Constitution[max_value];

  doc
    .save()
    .fillColor("#BAF596")
    .roundedRect(60, doc.y + 15, doc.page.width - 120, 40, 10)
    .strokeColor("#06FF4C")
    .fillAndStroke()
    .restore();

  doc.fontSize(14).fillColor("#04650D");

  doc.text(
    `${name}'s Body is Dominated by ${max_value} Nature`,
    0,
    doc.y + 15 + (40 - doc.currentLineHeight()) / 2,
    {
      align: "center",
      width: doc.page.width,
    }
  );

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc
    .save()
    .fillColor("#D7ECFF")
    .roundedRect(
      50,
      doc.y + 25,
      doc.page.width - 100,
      no_of_lines(doc, constitutionMax[0], doc.page.width - 120) *
        (doc.currentLineHeight() + 4) +
        20,
      10
    )
    .fill()
    .restore();

  doc.text(constitutionMax[0], 60, doc.y + 32.5, {
    align: "justify",
    width: doc.page.width - 120,
    lineGap: 4,
  });

  const bodyTypeColors = ["#E34B4B", "#43C316", "#4BDAE3"];
  draw_bar_chart(
    doc,
    120,
    doc.y + 170,
    55,
    30,
    data,
    bodyTypeColors,
    120,
    IMAGES
  );

  y = doc.y - 150;
  x = doc.x + 100;
  Object.entries(data).forEach(([label, value], i) => {
    doc.font("Linotte-SemiBold").fontSize(18).fillColor(bodyTypeColors[i]);
    doc.text(`(${label}: ${value.toFixed(2)}%)`, x, y);
    y += 50;
  });

  doc.y += 20;
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text("Impacts on Body Type, Emotions, and Health", 0, doc.y + 30, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Body Type : ", 60, doc.y + 10, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[1], 60, doc.y);

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Emotions: ", 60, doc.y + 5, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[2], 60, doc.y);

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Health : ", 60, doc.y + 5, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[3], 60, doc.y);

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(`Parenting Tips to Balance ${max_key1} Dosha`, 0, doc.y + 15, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text(`${constitutionMax[4].title} : `, 60, doc.y + 15, {
      continued: true,
      indent: 10,
      lineGap: 5,
      width: doc.page.width - 120,
    });

  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .text(constitutionMax[4].desc, 60, doc.y);

  newPage(doc, IMAGES, name + "'s Chakras");
  pages.push(pageNo);

  const chakrasOrder = [
    "Root Chakra",
    "Sacral Chakra",
    "Solar Plexus Chakra",
    "Heart Chakra",
    "Throat Chakra",
    "Third Eye Chakra",
    "Crown Chakra",
  ];

  const childChakras = chakras[planets[0].sign][0];
  const chakrasContent = chakra_desc[childChakras];

  doc.font("Linotte-Heavy").fontSize(18).fillColor("#000");
  doc.text(`${name}'s Dominant Chakra is ${childChakras}`, 0, doc.y + 25, {
    align: "center",
    width: doc.page.width,
  });

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc.text(chakrasContent[0], 60, doc.y + 30, {
    align: "justify",
    width: doc.page.width - 130,
    indent: 20,
    lineGap: 4,
  });

  doc.font("Linotte-Heavy").fontSize(16);
  doc.text(chakrasContent[1], 60, doc.y + 20, {
    align: "center",
    width: doc.page.width - 120,
  });

  const chakraIndex = chakrasOrder.indexOf(childChakras);

  if ([5, 6].includes(chakraIndex)) {
    doc.image(
      path.join(IMAGES, `chakra_${chakraIndex + 1}.png`),
      doc.page.width / 2 - 50,
      doc.y + 20,
      { width: 100 }
    );
  } else {
    doc.image(
      path.join(IMAGES, `chakra_${chakraIndex + 1}.png`),
      doc.page.width / 2 - 40,
      doc.y + 20,
      { width: 80 }
    );
  }

  doc.y += 90;
  doc.font("Linotte-Heavy").fontSize(22).fillColor("#000");
  doc.text(childChakras, 0, doc.y + 30, {
    align: "center",
    width: doc.page.width,
  });

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    `Parenting Tips to Increase ${name}'s Aura and Energy Level`,
    0,
    doc.y + 30,
    { align: "center", width: doc.page.width }
  );

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text(`${chakrasContent[2].title} : `, 60, doc.y + 25, {
    width: doc.page.width - 120,
    continued: true,
    indent: 10,
    align: "justify",
    lineGap: 4,
  });

  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .text(chakrasContent[2].desc, 60, doc.y);

  let content = {
    child_personality: lagnaIdentity[planets[0]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
    emotional_needs: moonIdentity[planets[2]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
    core_identity: sunIdentity[planets[1]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
  };

  let trueTitle = {
    child_personality: `${name}'s Personality`,
    emotional_needs: `${name}'s Emotions`,
    core_identity: `${name}'s Core Identity`,
  };

  for (const [key, value] of Object.entries(content)) {
    if (doc.y > doc.page.height - 200) {
      newPage(doc, IMAGES);
    }
    ContentDesign(
      doc,
      DesignColors[Math.floor(Math.random() * DesignColors.length)],
      trueTitle[key],
      value,
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES, `Panchangam: A Guide to ${name}'s Flourishing Future`);
  pages.push(pageNo);
  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .fillColor("#000")
    .text(
      "Activating the Panchangam elements (Thithi, Vaaram, Nakshatra, Yogam, Karanam) can potentially bring balance to child's life, fostering positive energies and promoting growth.",
      60,
      doc.y + 15,
      {
        align: "justify",
        width: doc.page.width - 120,
        lineGap: 4,
      }
    );

  doc.y -= 20;

  ContentDesign(
    doc,
    "#BAF596",
    "",
    `${name} was born on ${formatted_date}, ${panchang["week_day"]} (Vaaram), under ${panchang["nakshatra"]} Nakshatra, ${panchang["paksha"]} Paksha ${panchang["thithi"]} Thithi, ${panchang["karanam"]} Karanam, and ${panchang["yoga"]} Yogam`,
    IMAGES,
    name
  );

  colors = ["#E5FFB5", "#94FFD2", "#B2E4FF", "#D6C8FF", "#FFDECA"];
  let titles = [
    `Tithi Represents ${name}'s Emotions, Mental Well-being`,
    `Vaaram Represents ${name}'s Energy & Behaviour`,
    `Nakshatra Represents ${name}'s Personality and Life Path`,
    `Yogam Represents ${name}'s Prosperity and Life Transformation`,
    `Karanam Represents ${name}'s Work and Actions`,
  ];

  let titleImages = [
    panchang.thithi_number <= 15 ? "waningMoon.png" : "waxingMoon.png",
    "week.png",
    "nakshatra.png",
    "yogam.png",
    "karanam.png",
  ];

  let panchangContent = [
    "",
    "",
    "Guru, born under the Rohini Nakshatra, possesses a charismatic and creative personality. He is known for his nurturing and caring nature, often acting as a source of comfort and security for those around him. With a strong sense of determination and ambition, Guru is likely to excel in creative fields such as art, music, or writing. His life path is guided by a desire for stability and prosperity, leading him to focus on building a secure and harmonious environment for himself and his loved ones.",
    "Guru was born under the Shubha Yogam, which bestows him with blessings of auspiciousness and prosperity. Guided by this Yogam, Guru is destined to reach great heights in his endeavors, focusing on creating a positive impact in the world and nurturing spiritual growth. His goals are aligned with serving others and spreading positivity, bringing about a sense of harmony and abundance wherever he goes. The Shubha Yogam empowers Guru to lead a fulfilling life, radiating positivity and making a significant positive impact on those around him.",
  ];

  for (let i = 0; i < titles.length; i++) {
    if (doc.y > doc.page.height - 200) {
      newPage(doc, IMAGES);
      doc.y = 40;
    }

    doc.image(
      path.join(IMAGES, titleImages[i]),
      doc.page.width / 2 - 20,
      doc.y + 10,
      {
        width: 50,
        height: 50,
      }
    );

    doc.y += 20;

    if (i === 0) {
      let positive = thithiContent[panchang.tithi][0];
      let negative = thithiContent[panchang.tithi][1];
      let tips = thithiContent[panchang.tithi][2];

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born under ${panchang.paksha} ${panchang.tithi}, and the following are Thithi impacts on ${name}'s Life`,
        60,
        doc.y + 20,
        {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.fontSize(14);
      let totalWidth =
        doc.widthOfString("Thithi Lord: ") +
        doc.font("Linotte-SemiBold").widthOfString(thithiLord[panchang.tithi]);

      doc
        .rect(
          100,
          doc.y + 20,
          doc.page.width - 200,
          doc.currentLineHeight() + 10
        )
        .fill(DesignColors[Math.floor(Math.random() * DesignColors.length)])
        .restore();

      doc.fillColor("#000").font("Linotte-Regular");

      doc
        .text(
          "Thithi Lord: ",
          doc.page.width / 2 - totalWidth / 2 - 10,
          doc.y + 25,
          {
            width: totalWidth + 20,
            continued: true,
          }
        )
        .font("Linotte-SemiBold")
        .text(thithiLord[panchang.tithi]);

      doc
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Description + " " + tips.Execution);
    } else if (i == 1) {
      let positive = weekPlanetContent[panchang["week_day"]][0];
      let negative = weekPlanetContent[panchang["week_day"]][1];
      let tips = weekPlanetContent[panchang["week_day"]][2];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born on ${panchang["week_day"]}, and the following are its impacts on ${name}'s life:`,
        60,
        doc.y + 20,
        {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.fontSize(14);
      let totalWidth =
        doc.widthOfString("Rulling Planet: ") +
        doc
          .font("Linotte-SemiBold")
          .widthOfString(weekPlanet[panchang["week_day"]]);

      doc
        .rect(
          100,
          doc.y + 20,
          doc.page.width - 200,
          doc.currentLineHeight() + 10
        )
        .fill(DesignColors[Math.floor(Math.random() * DesignColors.length)])
        .restore();

      doc.fillColor("#000").font("Linotte-Regular");

      doc
        .text(
          "Rulling Planet: ",
          doc.page.width / 2 - totalWidth / 2 - 10,
          doc.y + 25,
          {
            width: totalWidth + 20,
            continued: true,
          }
        )
        .font("Linotte-SemiBold")
        .text(weekPlanet[panchang["week_day"]]);

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 40;
      }

      doc
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Execution);
    } else if (i == 4) {
      let positive = karanamContent[panchang["karana"]][0];
      let negative = karanamContent[panchang["karana"]][1];
      let tips = karanamContent[panchang["karana"]][2];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 0;
      }

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born under ${panchang["karana"]}, and the following are Karanam impacts on ${name}'s life:`,
        60,
        doc.y + 20,
        {
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 50;
      }

      doc
        .fontSize(14)
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Execution);
    } else {
      let con = await panchangPrompt(panchang, i, name, gender);
      doc.y += 30;
      ContentDesign(doc, randomeColor(), titles[i], con, IMAGES, name);
    }

    doc.y += 30;
  }

  newPage(
    doc,
    IMAGES,
    "Potential Health Challenges and Holistic Wellness Solutions"
  );
  pages.push(pageNo);

  let shifted = zodiac
    .slice(zodiac.indexOf(asc["sign"]))
    .concat(zodiac.slice(0, zodiac.indexOf(asc["sign"])));

  let con = healthContent[shifted[5]];
  let insights = healthInsights[shifted[5]];

  doc.y += 10;

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  lineBreak(doc, insights, IMAGES, randomeColor());

  doc
    .font("Linotte-SemiBold")
    .fontSize(18)
    .text("Health Issues Based on", 0, doc.y + 20, {
      align: "center",
      width: doc.page.width,
    });
  let color1 = randomeColor();
  let color2 = randomeColor();
  let colwidth = (doc.page.width - 50) / 2 - 10;
  let set_y = doc.y;

  doc.roundedRect(30, doc.y + 10, colwidth, 45, 10).fill(color1);

  doc
    .fontSize(15)
    .fillColor("#000")
    .text("Common Health Issues", 30, doc.y + 15, {
      align: "center",
      width: colwidth,
    });

  doc.y += 5;

  con[0].forEach((issue, index) => {
    let texts = issue.split(" (");

    let height =
      doc.fontSize(14).heightOfString(index + ") " + texts[0], {
        width: colwidth,
        lineGap: 4,
      }) +
      doc.font("Linotte-Regular").heightOfString(" (" + texts[1], {
        width: colwidth,
        lineGap: 4,
      });

    doc
      .roundedRect(
        30,
        doc.y,
        colwidth,
        height + (con[0].indexOf(issue) === con[0].length - 1 ? 8 : 15),
        10
      )
      .fill(color1);

    doc.fillColor("#000").font("Linotte-SemiBold").fontSize(14);
    doc
      .text(index + 1 + ") " + texts[0], 40, doc.y, {
        continued: true,
        width: colwidth,
        lineGap: 4,
      })
      .font("Linotte-Regular")
      .text(texts[1]);
  });

  let current_y = doc.y;
  doc
    .roundedRect(30 + colwidth + 15, set_y + 10, colwidth, 45, 10)
    .fill(color2);

  doc
    .fontSize(15)
    .fillColor("#000")
    .text("Dosha Constitution Issues", 30 + colwidth + 10, set_y + 15, {
      align: "center",
      width: colwidth,
    });

  set_y += 5;

  con[1].forEach((issue, index) => {
    let texts = issue.split(" (");

    let height =
      doc.fontSize(14).heightOfString(index + ") " + texts[0], {
        width: colwidth,
        lineGap: 4,
      }) +
      doc.font("Linotte-Regular").heightOfString(" (" + texts[1], {
        width: colwidth,
        lineGap: 4,
      });

    doc
      .roundedRect(
        30 + colwidth + 15,
        doc.y,
        colwidth,
        height + (con[1].indexOf(issue) === con[1].length - 1 ? 8 : 15),
        10
      )
      .fill(color2);

    doc.fillColor("#000").font("Linotte-SemiBold").fontSize(14);
    doc
      .text(index + 1 + ") " + texts[0], 40 + colwidth + 10, doc.y, {
        continued: true,
        width: colwidth,
        lineGap: 4,
      })
      .font("Linotte-Regular")
      .text(texts[1]);
  });

  current_y = Math.max(current_y, doc.y);
  doc.y = current_y + 10;

  doc
    .font("Linotte-Heavy")
    .fontSize(18)
    .text("Remedial Practices", 0, doc.y + 20, {
      align: "center",
      width: doc.page.width,
    });

  colors = ["#CBF3DB", "#FFD6A5", "#DEE2FF"];
  let title = [
    "Natural Ayurvedic Remedy",
    "Mudra Practice Remedy",
    "Mindful Food & Diet Remedy",
  ];

  title.forEach((t, i) => {
    doc
      .roundedRect(doc.page.width / 2 - 150, doc.y + 10, 300, 30, 10)
      .fill(colors[i]);
    doc
      .fontSize(16)
      .fillColor("#000")
      .text(t, doc.page.width / 2 - 150, doc.y + 20, {
        align: "center",
        width: 300,
      });

    doc.y += 10;
  });

  newPage(doc, IMAGES);
  doc.y = 70;
  let color = colors[0];
  doc.roundedRect(60, doc.y + 7.5, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "ayur.png"),
    doc.page.width / 2 - 30,
    doc.y + 10,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Natural Ayurvedic", 0, doc.y + 80, {
    align: "center",
  });

  content = con[3]["natural"];

  doc.font("Linotte-Regular").fontSize(14);
  doc.rect(60, doc.y, doc.page.width - 120, 50).fill(color);
  doc.fillColor("#000");
  doc.text(content[0], 70, doc.y + 10, {
    align: "center",
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  let height =
    doc.font("Linotte-SemiBold").heightOfString("Ingredients: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[1], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.rect(60, doc.y, doc.page.width - 120, height).fill(color);
  doc.fillColor("#000");
  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Ingredients: ", 70, doc.y, {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    });
  doc.font("Linotte-Regular").fontSize(14).text(content[1], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("How to Make: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[2], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.rect(60, doc.y, doc.page.width - 120, height).fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("How to Make: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(60, doc.y, doc.page.width - 120, height + 5, 10).fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  doc.y += 50;

  color = colors[1];
  doc.roundedRect(60, doc.y + 10, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "mudra.png"),
    doc.page.width / 2 - 30,
    doc.y + 20,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Mudra Practice Remedy", 0, doc.y + 90, {
    align: "center",
  });

  content = con[3]["mudra"];

  doc.font("Linotte-Regular").fontSize(14);
  doc.rect(60, doc.y, doc.page.width - 120, 50).fill(color);
  doc.fillColor("#000");
  doc.text(content[0], 70, doc.y + 10, {
    align: "center",
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  height = doc.font("Linotte-SemiBold").fontSize(16).currentLineHeight() + 10;

  doc.rect(60, doc.y, doc.page.width - 120, height + 10).fill(color);
  doc.fillColor("#000");
  doc.text("Steps: ", 70, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  content[1].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 10;

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[2], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc
    .roundedRect(60, doc.y - 10, doc.page.width - 120, height + 20, 10)
    .fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  newPage(doc, IMAGES);
  doc.y = 70;
  color = colors[2];
  doc.roundedRect(60, doc.y + 7.5, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "food.png"),
    doc.page.width / 2 - 30,
    doc.y + 10,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Mindful Food & Diet Remedy", 0, doc.y + 80, {
    align: "center",
  });

  content = con[3]["foods"];

  doc.y += 10;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y, doc.page.width - 120, doc.currentLineHeight() + 30)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "tick.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Food to Include", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[0].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 20;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y - 20, doc.page.width - 120, doc.currentLineHeight() + 50)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "cancel.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Food to Avoid", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[1].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 20;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y - 20, doc.page.width - 120, doc.currentLineHeight() + 50)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "guide.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Execution Guide", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[2].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 10;

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc
    .roundedRect(60, doc.y - 10, doc.page.width - 120, height + 20, 10)
    .fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  let content2 = await physical(planets, 2, name, gender);
  let content3 = await physical(planets, 3, name, gender);
  let content4 = await physical(planets, 4, name, gender);

  let totalContents = [content2, content3, content4];

  titles = [
    {
      physical_attributes: "Physical Attributes",
      personality: "Outer Personality",
      character: "Character",
      positive_behavior: "Positive Behavior",
      negative_behavior: "Behavior Challenges",
      parenting_tips: `Parenting Tips For ${name}'s Behaviour Challenges`,
    },
    {
      emotional_state: `${name}'s Emotional State Insights`,
      emotions: `${name}'s Emotions`,
      feelings: `${name}'s Feelings`,
      reactions: `${name}'s Reactions`,
      negative_imbalance: `${name}'s Emotional Imbalance Challenges`,
      parenting_tips: `Parenting Tips`,
    },
    {
      core_insights: `${name}'s Soul Desire`,
      recognitions: `Seek For Recognition`,
      core_identity: `Core Identity`,
      ego: `${name}'s Soul Ego`,
      negative_ego: `${name}'s Ego Challenges`,
      parenting_tips: `Parenting Tips For Self Identity Challenges`,
    },
  ];

  newPage(
    doc,
    IMAGES,
    "Outer World - Physical Attributes, Personality, and Behavior"
  );
  pages.push(pageNo);
  doc.fillColor("#000");

  totalContents.forEach((content, index) => {
    if (index === 1) {
      newPage(doc, IMAGES, "Inner World - Emotional Needs and Soul Desire");
      pages.push(pageNo);
      doc.fillColor("#000");
    }

    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    doc.fillColor("#000");

    if (typeof content === "string") {
      doc.font("Linotte-SemiBold").fontSize(18);
      doc.text(titles[index], 60, doc.y + 10, {
        align: "center",
        width: doc.page.width - 120,
        lineGap: 4,
      });

      doc
        .font("Linotte-Regular")
        .fontSize(14)
        .text(content, 60, doc.y + 10, {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
        });
    } else {
      for (let key in content) {
        if (doc.y + 80 > doc.page.height - 100) {
          newPage(doc, IMAGES);
          doc.y = 60;
        }
        ContentDesign(
          doc,
          randomeColor(),
          titles[index][key],
          content[key],
          ICONS,
          name
        );
      }
    }
  });

  newPage(doc, IMAGES, `${name}'s Education and Intellect`);
  pages.push(pageNo);

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    `Insights about ${name}'s education and intelligence`,
    60,
    doc.y + 10,
    {
      align: "center",
      width: doc.page.width - 120,
      lineGap: 4,
    }
  );

  let educationTitle = {
    insights: "Education and Intellectual Insights",
    suitable_educational: "Higher Education Preferences",
    cognitive_abilities: "Learning Approaches",
    recommendations: "How To Do It:",
  };

  content = education[moon["sign"]];

  con = {
    insights: content[0],
    suitable_educational: content[1],
    cognitive_abilities: content[2],
    recommendations: content[4],
  };

  doc.fillColor("#000");

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    if (key === "recommendations") {
      if (doc.y + 80 > doc.page.height - 100) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.image(
        path.join(ICONS, "pg 33_personalized.png"),
        doc.page.width / 2 - 20,
        doc.y + 10,
        {
          width: 40,
          height: 40,
        }
      );

      doc.font("Linotte-SemiBold").fontSize(18);
      doc.text("Parenting Tip for Academic Excellence:", 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
        lineGap: 4,
      });

      doc.fontSize(15);

      doc.text(content[3], 60, doc.y + 10, {
        align: "center",
        width: doc.page.width - 120,
        lineGap: 4,
      });
    }

    ContentDesign(
      doc,
      randomeColor(),
      educationTitle[key],
      con[key],
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES, "Family and Relationships");
  pages.push(pageNo);
  con = await physical(planets, 5, name, gender);

  let familyTitle = {
    family_relationship: "",
    approaches: `${name}'s Approaches for Forming Relationships`,
    parenting_support: `Parenting Support for Improve ${name}'s Social Developments`,
  };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    ContentDesign(doc, randomeColor(), familyTitle[key], con[key], ICONS, name);
  }

  newPage(doc, IMAGES, `${name}'s Career and Professions`);
  pages.push(pageNo);
  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    "Wondering what the future holds for your child's career journey?",
    60,
    doc.y + 10,
    {
      align: "center",
      width: doc.page.width - 120,
      lineGap: 4,
    }
  );

  let contents = carrer[shifted[9]];
  let prof = [];

  for (let key in contents[1]) {
    prof.push({
      title: key,
      content: contents[1][key],
    });
  }

  let CarrerTitle = {
    suitable_professions: `${name}'s Successful Career Path & Suitable Professions`,
    business: "Business & Entrepreneurial Potentials",
  };

  con = { career_path: contents[0], suitable_professions: prof };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    ContentDesign(
      doc,
      randomeColor(),
      CarrerTitle[key] || "",
      con[key],
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES, "Subconscious Mind Analysis");
  pages.push(pageNo);
  doc.font("Linotte-Regular").fontSize(14);
  con = subContent[shifted[7]];

  ContentDesign(
    doc,
    randomeColor(),
    "",
    String(con[0]).replace(/child/g, name).replace(/Child/g, name),
    ICONS,
    name
  );

  ContentDesign(
    doc,
    randomeColor(),
    `${name}'s Hidden Challenges`,
    con[1],
    ICONS,
    name
  );

  content = con[2]["manifestation"];
  newPage(doc, IMAGES);
  doc.y = 60;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "mani.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Manifestation Practices", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 140, doc.y + 10, {
    width: doc.page.width - 280,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  content = con[2]["quantum"];
  doc.y += 30;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "atom.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Quantum Physics Concept Remedy", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 120, doc.y + 10, {
    width: doc.page.width - 270,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  content = con[2]["healing"];
  newPage(doc, IMAGES);
  doc.y = shifted[7] === "Scorpio" ? 40 : 60;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "heart.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Healing Remedy", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 140, doc.y + 10, {
    width: doc.page.width - 280,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  content = con[2]["mudra"];
  doc.y += shifted[7] === "Scorpio" ? 20 : 30;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "mudra.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Mudra Remedy", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 140, doc.y + 10, {
    width: doc.page.width - 280,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  if (shifted[7] === "Scorpio") height -= 25;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  newPage(doc, IMAGES, "Unique Talents and Natural Skills");
  pages.push(pageNo);
  con = await chapterPrompt(planets, 0, name, gender);

  let uniqueTitle = {
    insights: "",
    education: "Unique Talents in Academics",
    arts_creative: "Unique Talents in Arts & Creativity",
    physical_activity: "Unique Talents in Physical Activity",
  };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }
    ContentDesign(doc, randomeColor(), uniqueTitle[key], con[key], ICONS, name);
  }

  newPage(doc, IMAGES, "Atma Karga & Ishta Devata");
  pages.push(pageNo);
  doc
    .roundedRect(50, doc.y + 10, doc.page.width - 100, 120, 10)
    .fill("#FFD7D7");

  doc.font("Linotte-SemiBold").fontSize(20).fillColor("#000");
  doc.text("AtmaKaraka", 60, doc.y + 20, {
    align: "center",
    width: doc.page.width - 120,
  });

  doc.font("Linotte-Regular").fontSize(12).fillColor("#940000");
  doc.text(
    "Atmakaraka, a Sanskrit term for 'soul indicator' is the planet with the highest degree in your birth chart. It reveals your deepest desires and key strengths and weaknesses. Understanding your Atmakaraka can guide you toward your true purpose and inspire meaningful changes in your life.",
    60,
    doc.y + 5,
    {
      width: doc.page.width - 120,
      align: "justify",
      lineGap: 4,
    }
  );

  doc.image(
    path.join(IMAGES, `atma_${atma["Name"].toLowerCase()}.jpeg`),
    doc.page.width / 2 - 65,
    doc.y + 20,
    {
      width: 130,
    }
  );

  doc.font("Linotte-SemiBold").fontSize(20);

  doc
    .roundedRect(
      100,
      doc.y + 260,
      doc.page.width - 200,
      doc.currentLineHeight() + 10,
      20
    )
    .fill("#FFF1F1");

  doc.fillColor("#940000");

  doc.text(`AtmaKaraka Planet: ${atma["Name"]}`, 60, doc.y + 265, {
    width: doc.page.width - 120,
    align: "center",
  });

  doc.fillColor("#000").font("Linotte-Regular").fontSize(18);

  doc.text(athmakaraka[atma["Name"]], 60, doc.y + 30, {
    width: doc.page.width - 120,
    align: "justify",
    lineGap: 4,
    indent: 15,
  });

  newPage(doc, IMAGES, name + "'s Favourable God");
  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 90, 10).fill("#D7FFEA");

  doc.font("Linotte-Regular").fontSize(14).fillColor("#365600");
  doc.text(
    "         According to the scriptures, worshiping your Ishta Dev gives desired results. Determination of the Ishta Dev or Devi is determined by our past life karmas. There are many methods of determining the deity in astrology. Here, We have used the Jaimini Atmakaraka for Ishta Dev decision.",
    60,
    doc.y + 20,
    {
      width: doc.page.width - 120,
      align: "justify",
      lineGap: 4,
    }
  );

  doc.image(
    path.join(IMAGES, `${isthaDeva}.jpeg`),
    doc.page.width / 2 - 65,
    doc.y + 20,
    {
      width: 130,
    }
  );

  doc.font("Linotte-SemiBold").fontSize(20);

  doc.fillColor("#000");

  doc.text(isthaDeva, 60, doc.y + 265, {
    width: doc.page.width - 120,
    align: "center",
  });

  doc.fillColor("#000").font("Linotte-Regular").fontSize(12);

  doc.text(ista_devata_desc[isthadevathaLord], 60, doc.y + 20, {
    width: doc.page.width - 120,
    align: "justify",
    lineGap: 4,
    indent: 15,
  });

  let planetMain = {
    Sun: "Soul, Vitality, & Leadership Qualities",
    Moon: "Emotions, Intuition, Nurturing  Mind.",
    Mars: "Energy, Courage, Passion, and Assertiveness.",
    Mercury: "Communications, Intelligence, Adaptability.",
    Jupiter: "Wisdom, Expansion, Knowledge, Spirituality.",
    Venus: "Love, Relationships, Beauty, Art, Comforts.",
    Saturn: "Discipline, Responsibility, Challenges.",
    Rahu: "Desires, Ambitions, Worldly Attachment.",
    Ketu: "Spirituality, Detachment, Past Life Influence.",
  };

  planets.forEach((planet) => {
    if (planet.Name === "Ascendant") return;
    let planet_table = planetTable[planet.Name];

    if (planet_table[0].includes(planet["zodiac_lord"])) {
      planet["status"] = "Favourable";
    } else if (planet_table[1].includes(planet["zodiac_lord"])) {
      planet["status"] = "Unfavourable";
    } else {
      planet["status"] = "Moderate";
    }

    newPage(doc, IMAGES);
    if (planet.Name === "Sun") {
      pages.push(pageNo);
    }
    doc.font("Linotte-Heavy");
    doc.y = 40;

    if (planet.Name === "Sun") {
      doc.fontSize(26);
      doc.fillColor("#966A2F");
      doc.text(
        `${name}'s Planetary Energy and Lifestyle Modification`,
        80,
        doc.y,
        {
          width: doc.page.width - 160,
          align: "center",
        }
      );
      doc.y += 10;
    }

    doc.fontSize(20);
    doc.fillColor("#000");
    doc.text(`${planet.Name} - ${planetMain[planet.Name]}`, 80, doc.y, {
      width: doc.page.width - 160,
      align: "center",
    });

    if (planet.Name === "Ketu") doc.y -= 10;

    doc.image(
      path.join(IMAGES, `${planet.Name.toLowerCase()}.png`),
      110,
      doc.y + (planet["Name"] === "Ketu" ? 40 : 30),
      {
        width: 80,
        height: 80,
      }
    );

    doc.font("Linotte-Regular").fontSize(12);

    content = planetDesc[planet["Name"]];

    height = doc.heightOfString(content[0], {
      width: doc.page.width / 2 - (planet["Name"] === "Ketu" ? 0 : 30),
      lineGap: 4,
    });

    doc
      .roundedRect(
        doc.page.width / 2 - (planet["Name"] === "Ketu" ? 50 : 20),
        doc.y + 30,
        doc.page.width / 2 - (planet["Name"] === "Ketu" ? -10 : 20),
        height + 10,
        10
      )
      .fill(randomeColor());

    doc.fillColor("#000");

    doc.text(
      content[0],
      doc.page.width / 2 - (planet["Name"] === "Ketu" ? 42.5 : 15),
      doc.y + 40,
      {
        width: doc.page.width / 2 - (planet["Name"] === "Ketu" ? 0 : 30),
        align: "justify",
        lineGap: 4,
      }
    );

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    if (planet.Name !== "Ketu") doc.y += 20;

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Discipline : " + content[1][0], 0, doc.y + 40, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    let smallTitle = {
      1: `${planet["Name"]} Guide to ${name}: `,
      2: "",
      3: `Say to ${name}: `,
    };

    for (let i = 1; i < content[1].length; i++) {
      content[1][i] = content[1][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[1][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[1].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[1][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Life Lesson : " + content[2][0], 0, doc.y + 45, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    for (let i = 1; i < content[2].length; i++) {
      content[2][i] = content[2][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[2][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[2].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[2][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Food & Diet : " + content[4][0], 0, doc.y + 40, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    smallTitle = {
      1: `${planet["Name"]} Guide to ${name}: `,
      2: "",
      3: `Say to ${name}: `,
    };

    for (let i = 1; i < content[4].length; i++) {
      content[4][i] = content[4][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[4][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[4].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[4][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }
  });

  newPage(doc, IMAGES);
  doc.fillColor("#000").font("Linotte-Heavy").fontSize(32);
  doc.text("Thank You!", 0, doc.y + 80, {
    width: doc.page.width,
    align: "center",
    lineGap: 4,
  });

  doc.image(
    path.join(IMAGES, "logo.png"),
    doc.page.width / 2 - 50,
    doc.y + 20,
    {
      width: 100,
      align: "center",
    }
  );

  doc.image(path.join(IMAGES, "ending.png"), 150, doc.page.height / 2 - 100, {
    width: doc.page.width - 300,
  });

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageHeight = doc.page.height;

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(i + 1, 0, pageHeight - 30, {
        align: "center",
      });
  }

  doc.switchToPage(2);
  doc
    .font("Linotte-SemiBold")
    .fontSize(22)
    .fillColor("#000")
    .text(`Contents`, 60, 50, {
      align: "center",
      width: doc.page.width - 120,
    });

  doc.fontSize(16);
  y = doc.y + 20;

  context[2].forEach((item, index) => {
    if (doc.y > doc.page.height - 120) {
      doc.switchToPage(3);
      y = 60;
      doc.fontSize(16).fillColor("#000").font("Linotte-SemiBold");
    }

    const text = `${index + 1}. ${item}`
      .replace(/child/g, name)
      .replace(/Child/g, name);
    const pageNum = pages[index];
    let numberHeight = doc.widthOfString(pageNum.toString());
    height = doc.heightOfString(`${index + 1}. ${item}`, {
      width: doc.page.width - 170 - numberHeight,
      lineGap: 4,
    });

    doc.text(text, 80, y, {
      width: doc.page.width - 170 - numberHeight,
      align: "left",
      goTo: "page" + pages[index],
      lineGap: 4,
    });

    doc.text(pageNum.toString(), doc.page.width - 80 - numberHeight, y, {
      align: "right",
      width: numberHeight,
    });

    y = Math.max(doc.y, y + height) + 15;
  });

  await doc.end();
  return;
}

async function MasterReport(
  doc,
  reportPath,
  planets,
  panchang,
  dasa,
  charts,
  formatted_date,
  formatted_time,
  location,
  year,
  month,
  name,
  gender,
  outputDir
) {
  const IMAGES = path.join(reportPath, "report", "images");
  const ICONS = path.join(reportPath, "report", "icons");

  doc.image(path.join(IMAGES, "book-cover3.png"), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });
  newPage(doc, IMAGES);
  doc.font("Linotte-SemiBold").fontSize(38).fillColor("#040606");
  doc.text(`${name.split(" ")[0]}'s First Astrology Report`, 60, 120, {
    align: "center",
    width: doc.page.width - 120,
  });
  doc.image(
    path.join(IMAGES, "starting.png"),
    doc.page.width / 2 - 150,
    doc.page.height / 2 - 150,
    { width: 300, height: 300 }
  );

  const paragraphWidth = doc.page.width - 120;

  doc.font("Linotte-SemiBold").fontSize(22).fillColor("#000");
  doc.text(
    `The Precious Child Born on the auspicious day ${formatted_date} at ${formatted_time.toUpperCase()}. Place of birth is ${location}.`,
    60,
    doc.y + 400,
    { width: paragraphWidth, align: "justify" }
  );

  newPage(doc, IMAGES);
  newPage(doc, IMAGES);

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(36).fillColor("#000");

  const widthString = doc.widthOfString(`${name}'s Astrology Details`);
  let yPosition = doc.page.height / 2 - 18;

  if (widthString > doc.page.width - 300) {
    yPosition += 18;
  }
  pages.push(pageNo);
  doc.text(`${name}'s Astrology Details`, 150, yPosition, {
    align: "center",
    width: doc.page.width - 300,
  });

  newPage(doc, IMAGES, name + "'s True Self");
  pages.push(pageNo);

  doc.fillColor("#000").fontSize(18);

  doc.text(
    `Let's take a look at the three most influential and important signs for ${name}!`,
    80,
    doc.y + 30,
    {
      align: "center",
      width: doc.page.width - 160,
    }
  );

  doc
    .font("Linotte-SemiBold")
    .text(`As per ${name}'s kundli,`, 60, doc.y + 10, {
      align: "left",
      width: doc.page.width - 120,
    });

  let y = doc.y + 20;
  roundedBoxBorder(
    doc,
    "#FFE769",
    "#C5A200",
    60,
    y,
    planets[1]["Name"],
    planets[1]["sign"],
    IMAGES
  );
  roundedBoxBorder(
    doc,
    "#D1C4E9",
    "#A394C6",
    230,
    y,
    planets[0]["Name"],
    planets[0]["sign"],
    IMAGES
  );
  roundedBoxBorder(
    doc,
    "#B3E5FC",
    "#82B3C9",
    400,
    y,
    planets[2]["Name"],
    planets[2]["sign"],
    IMAGES
  );

  let content = {
    child_personality: lagnaIdentity[planets[0]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
    emotional_needs: moonIdentity[planets[2]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
    core_identity: sunIdentity[planets[1]["sign"]]
      .replace(/child/g, name)
      .replace(/Child/g, name),
  };

  let trueTitle = {
    child_personality: `${name}'s Personality`,
    emotional_needs: `${name}'s Emotions`,
    core_identity: `${name}'s Core Identity`,
  };

  for (const [key, value] of Object.entries(content)) {
    if (doc.y > doc.page.height - 200) {
      newPage(doc, IMAGES);
    }
    ContentDesign(
      doc,
      DesignColors[Math.floor(Math.random() * DesignColors.length)],
      trueTitle[key],
      value,
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(42).fillColor("#E85D2B");
  doc.text(`Horoscope Details`, 50, 90, {
    align: "center",
    width: doc.page.width - 100,
  });

  let asc = planets.find((p) => p.Name === "Ascendant");

  const ascIndex = asc ? Math.max(0, zodiac.indexOf(asc.sign)) : 0;

  const wrapIndex = (i) => ((i % 12) + 12) % 12;

  const ninthHouseLord = zodiac_lord[wrapIndex(((ascIndex + 9) % 12) - 1)];
  const signLord = planets.find((p) => p.Name === ninthHouseLord) || {};
  const isthadevathaLord = signLord.nakshatra_lord;
  const isthaDeva = ista_devatas?.[isthadevathaLord] || [];

  let atma = planets.find((p) => p.order === 1) || planets[0];
  if (atma && atma.Name === "Ascendant") {
    atma = planets.find((p) => p.order === 2) || atma;
  }

  let moon = planets.find((p) => p.Name === "Moon") || {};

  const start = Math.max(0, nakshatras.indexOf(moon.nakshatra));
  const nakshatrasOrder = nakshatras
    .slice(start)
    .concat(nakshatras.slice(0, start));

  const favourableNakshatraList = [];
  nakshatrasOrder.forEach((nk, idx) => {
    if (idx % 9 === 1) favourableNakshatraList.push(nk);
  });
  let favourableNakshatra =
    favourableNakshatraList.join(", ") +
    (favourableNakshatraList.length ? ", " : "");

  const luckyNumber = nakshatraNumber?.[panchang.nakshatra] || [];

  const fiveHouseLord = zodiac_lord[wrapIndex(((ascIndex + 5) % 12) - 1)];
  const ninthHouseLord2 = zodiac_lord[wrapIndex(((ascIndex + 9) % 12) - 1)];

  const stones = [
    Planet_Gemstone_Desc?.[asc?.zodiac_lord] || {},
    Planet_Gemstone_Desc?.[fiveHouseLord] || {},
    Planet_Gemstone_Desc?.[ninthHouseLord2] || {},
  ];

  const left_column_text = [
    "Name :",
    "Date Of Birth :",
    "Time Of Birth :",
    "Place Of Birth :",
    "Birth Nakshatra, Lord :",
    "Birth Rasi, Lord :",
    "Birth Lagnam, Lord :",
    "Tithi :",
    "Nithya Yogam :",
    "Karanam :",
    "Birth Week Day :",
    "Atma Karagam, Lord : ",
    "Ishta Devata :",
    "Benefic Stars :",
    "Benefic Number :",
    "Life Stone :",
    "Benefictical Stone :",
    "Lucky Stone :",
  ];

  const right_column_text = [
    `${name}`,
    `${formatted_date}`,
    `${formatted_time}`,
    `${location}`,
    `${panchang.nakshatra}, ${planets[2]?.nakshatra_lord}`,
    `${planets[2]?.sign}, ${planets[2]?.zodiac_lord}`,
    `${planets[0]?.sign}, ${planets[0]?.zodiac_lord}`,
    `${panchang.tithi} (${panchang.paksha})`,
    `${panchang.yoga}`,
    `${panchang.karana}`,
    `${panchang.week_day}`,
    `${atma?.Name}, ${atma_names?.[atma?.Name] ?? ""}`,
    `${isthaDeva ?? ""}`,
    `${favourableNakshatra}`,
    `${luckyNumber[0] ?? ""}, ${luckyNumber[1] ?? ""}`,
    `${stones[0]?.Gemstone ?? ""}`,
    `${stones[1]?.Gemstone ?? ""}`,
    `${stones[2]?.Gemstone ?? ""}`,
  ];

  const left_x = 80;
  const right_x = doc.page.width / 2 - 10;
  let start_y = 150;
  for (let i = 0; i < left_column_text.length; i++) {
    doc.font("Linotte-SemiBold").fontSize(16).fillColor("#000");
    doc.text(left_column_text[i], left_x, start_y, {
      width: doc.page.width / 2 - 100,
      align: "right",
    });
    doc.font("Linotte-Regular").fontSize(16).fillColor("#000");
    doc.text(right_column_text[i], right_x, start_y, {
      width: doc.page.width / 2 - 100,
      align: "left",
      lineGap: 2,
    });
    start_y = doc.y + 10;
  }

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#000");
  doc.text("Birth Chart", 0, 80, {
    align: "center",
    width: doc.page.width,
  });

  doc.image(
    path.join("/tmp", "charts", charts.birth_chart),
    doc.page.width / 2 - 125,
    doc.y + 20,
    {
      width: 250,
    }
  );
  doc.text("Navamsa Chart", 0, doc.y + 300, {
    align: "center",
    width: doc.page.width,
  });
  doc.image(
    path.join("/tmp", "charts", charts.navamsa_chart),
    doc.page.width / 2 - 125,
    doc.y + 20,
    {
      width: 250,
    }
  );

  newPage(doc, IMAGES);
  doc.font("Linotte-Heavy").fontSize(32).fillColor("#000");
  doc.text("Planetary Positions", 0, 70, {
    align: "center",
    width: doc.page.width,
  });

  let colors = [
    "#FFFDAC",
    "#EAECE8",
    "#FFAF7B",
    "#C6B9A9",
    "#FFE8B2",
    "#FDD29D",
    "#C3B3AA",
    "#A4EDFF",
    "#C5FFB5",
    "#FFF6F6",
  ];

  const startX = 65;
  const startY = doc.y + 36;
  const spacingX = 240;
  const spacingY = 230;
  doc.font("Linotte-Regular").fontSize(12).fillColor("#000");

  planets.forEach((planet, i) => {
    let x, y;
    if (i === 6) {
      newPage(doc, IMAGES);
      x = startX + 30;
      y = 90;
    } else if (i === 7) {
      x = startX + spacingX + 30;
      y = 90;
    } else if (i === 8) {
      x = startX + 30;
      y = 90 + spacingY;
    } else if (i === 9) {
      x = startX + spacingX + 30;
      y = 90 + spacingY;
    } else {
      x = startX + (i % 2) * spacingX + 30;
      y = startY + Math.floor(i / 2) * spacingY;
    }

    drawPlanetTable(doc, planet, x, y, colors[i % colors.length], IMAGES);
  });

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(32).fillColor("#000");
  doc.text(`${name}'s Favorable Times`, 0, 50, {
    align: "center",
    width: doc.page.width,
  });

  let i = 0;
  for (const [d, b] of Object.entries(dasa)) {
    let x, y;
    if (i < 6) {
      x = 50 + (i % 3) * 170;
      y = 90 + Math.floor(i / 3) * 340;
    } else {
      if (i === 6) {
        newPage(doc, IMAGES);
      }
      x = 50 + ((i - 6) % 3) * 170;
      y = 80 + Math.floor((i - 6) / 3) * 340;
    }

    const start_age = i === 0 ? 0 : parseInt(b[0].end_year) - year;
    const end_age = parseInt(b[b.length - 1].end_year) - year;

    drawDasa(doc, d, b, x, y, start_age, end_age, IMAGES);
    i++;
  }

  const noteColors = {
    Favourable: "#DAFFDC",
    Unfavourable: "#FFDADA",
    Moderate: "#DAE7FF",
  };

  doc
    .font("Linotte-Heavy")
    .fontSize(22)
    .text("Note:", 60, doc.y + 30);

  Object.entries(noteColors).forEach(([label, color]) => {
    doc
      .save()
      .fillColor(color)
      .roundedRect(100, doc.y + 20, 25, 25, 5)
      .fill()
      .restore();

    doc
      .font("Linotte-SemiBold")
      .fontSize(16)
      .fillColor("#000")
      .text(label, 140, doc.y + 25);
  });

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
  doc.text(`${name}'s Five Natural Elements`, 0, 55, {
    align: "center",
    width: doc.page.width,
  });

  const elements = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  planets.forEach((pla) => {
    for (const [d, k] of Object.entries(elements)) {
      if (
        pla["Name"] == "Ascendant" ||
        pla["Name"] == "Rahu" ||
        pla["Name"] == "Ketu"
      ) {
        continue;
      }
      if (elements_data[d].includes(pla["sign"])) {
        elements[d] = elements[d] + 1;
      }
    }
  });

  for (const [d, k] of Object.entries(elements)) {
    elements[d] = (elements[d] / 7) * 100;
  }

  const max_key1 = Object.keys(elements).reduce((a, b) =>
    elements[a] > elements[b] ? a : b
  );

  let max_value2 = 0;
  let max_key2 = "";
  for (const [k, v] of Object.entries(elements)) {
    if (k === max_key1) {
      continue;
    }
    if (v > max_value2) {
      max_value2 = v;
      max_key2 = k;
    }
  }

  const dominantElementData = elements_content[max_key1];

  doc
    .save()
    .fillColor("#BAF596")
    .roundedRect(60, doc.y + 15, doc.page.width - 120, 40, 10)
    .strokeColor("#06FF4C")
    .fillAndStroke()
    .restore();

  doc.fontSize(14).fillColor("#04650D");
  const textHeight = doc.currentLineHeight();
  doc.text(
    `${name}'s Dominant Element are ${max_key1} and ${max_key2}`,
    0,
    doc.y + 15 + (40 - textHeight) / 2,
    {
      align: "center",
      width: doc.page.width,
    }
  );

  doc.font("Linotte-Regular").fontSize(16).fillColor("#000");

  doc
    .save()
    .fillColor("#FFF2D7")
    .roundedRect(
      50,
      doc.y + 25,
      doc.page.width - 100,
      no_of_lines(doc, dominantElementData[0], doc.page.width - 120) *
        (doc.currentLineHeight() + 4) +
        20,
      10
    )
    .fill()
    .restore();

  doc.text(dominantElementData[0], 60, doc.y + 32.5, {
    align: "justify",
    width: doc.page.width - 120,
    lineGap: 4,
  });

  const elementsColors = ["#FF0000", "#43A458", "#B1DC36", "#4399FF"];

  draw_bar_chart(
    doc,
    60,
    doc.y + 230,
    55,
    30,
    elements,
    elementsColors,
    160,
    IMAGES
  );

  y = doc.y - 200;
  let x = doc.x + 100;
  for (const [i, [label, value]] of Object.entries(Object.entries(elements))) {
    doc.font("Linotte-SemiBold").fontSize(18).fillColor(elementsColors[i]);
    doc.text(`${label}: ${value.toFixed(2)}%`, x, y);
    y += 50;
  }

  doc.y += 40;
  doc.fillColor("#000");
  doc.text("Impacts on Personality", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Strength : ", 60, doc.y + 10, {
      continued: true,
      width: doc.page.width - 120,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[1].join(", "));

  doc
    .font("Linotte-SemiBold")
    .text("Challenges : ", 60, doc.y + 10, {
      continued: true,
      width: doc.page.width - 120,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[2].join(", "));

  doc
    .font("Linotte-SemiBold")
    .fontSize(16)
    .text(`Parenting Tips to Balance ${max_key1} Element`, 0, doc.y + 15, {
      align: "center",
      width: doc.page.width,
    });

  doc
    .font("Linotte-SemiBold")
    .text(dominantElementData[3].title + " : ", 60, doc.y + 15, {
      continued: true,
      width: doc.page.width - 120,
      indent: 10,
      lineGap: 5,
    })
    .font("Linotte-Regular")
    .text(dominantElementData[3].desc);

  newPage(doc, IMAGES);
  pages.push(pageNo);
  doc.font("Linotte-Heavy").fontSize(26).fillColor("#966A2F");
  doc.text(`${name}'s Ayurvedic Body Type`, 0, 55, {
    align: "center",
    width: doc.page.width,
  });

  const lagna = planets.find((p) => p.Name === "Ascendant");
  const data = {
    Pitta:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Pitta) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Pitta)) /
        200) *
      100,
    Kapha:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Kapha) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Kapha)) /
        200) *
      100,
    Vadha:
      ((parseInt(constitutionRatio[moon.zodiac_lord].Vata) +
        parseInt(constitutionRatio[lagna.zodiac_lord].Vata)) /
        200) *
      100,
  };

  const max_value = Object.keys(data).reduce((a, b) =>
    data[a] > data[b] ? a : b
  );
  const constitutionMax = Constitution[max_value];

  doc
    .save()
    .fillColor("#BAF596")
    .roundedRect(60, doc.y + 15, doc.page.width - 120, 40, 10)
    .strokeColor("#06FF4C")
    .fillAndStroke()
    .restore();

  doc.fontSize(14).fillColor("#04650D");

  doc.text(
    `${name}'s Body is Dominated by ${max_value} Nature`,
    0,
    doc.y + 15 + (40 - doc.currentLineHeight()) / 2,
    {
      align: "center",
      width: doc.page.width,
    }
  );

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc
    .save()
    .fillColor("#D7ECFF")
    .roundedRect(
      50,
      doc.y + 25,
      doc.page.width - 100,
      no_of_lines(doc, constitutionMax[0], doc.page.width - 120) *
        (doc.currentLineHeight() + 4) +
        20,
      10
    )
    .fill()
    .restore();

  doc.text(constitutionMax[0], 60, doc.y + 32.5, {
    align: "justify",
    width: doc.page.width - 120,
    lineGap: 4,
  });

  const bodyTypeColors = ["#E34B4B", "#43C316", "#4BDAE3"];
  draw_bar_chart(
    doc,
    120,
    doc.y + 170,
    55,
    30,
    data,
    bodyTypeColors,
    120,
    IMAGES
  );

  y = doc.y - 150;
  x = doc.x + 100;
  Object.entries(data).forEach(([label, value], i) => {
    doc.font("Linotte-SemiBold").fontSize(18).fillColor(bodyTypeColors[i]);
    doc.text(`(${label}: ${value.toFixed(2)}%)`, x, y);
    y += 50;
  });

  doc.y += 20;
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text("Impacts on Body Type, Emotions, and Health", 0, doc.y + 30, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Body Type : ", 60, doc.y + 10, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[1], 60, doc.y);

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Emotions: ", 60, doc.y + 5, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[2], 60, doc.y);

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Health : ", 60, doc.y + 5, {
      continued: true,
      lineGap: 2,
      width: doc.page.width - 120,
    });

  doc.font("Linotte-Regular").fontSize(14).text(constitutionMax[3], 60, doc.y);

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(`Parenting Tips to Balance ${max_key1} Dosha`, 0, doc.y + 15, {
    align: "center",
    width: doc.page.width,
  });

  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text(`${constitutionMax[4].title} : `, 60, doc.y + 15, {
      continued: true,
      indent: 10,
      lineGap: 5,
      width: doc.page.width - 120,
    });

  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .text(constitutionMax[4].desc, 60, doc.y);

  newPage(doc, IMAGES, name + "'s Chakras");
  pages.push(pageNo);

  const chakrasOrder = [
    "Root Chakra",
    "Sacral Chakra",
    "Solar Plexus Chakra",
    "Heart Chakra",
    "Throat Chakra",
    "Third Eye Chakra",
    "Crown Chakra",
  ];

  const childChakras = chakras[planets[0].sign][0];
  const chakrasContent = chakra_desc[childChakras];

  doc.font("Linotte-Heavy").fontSize(18).fillColor("#000");
  doc.text(`${name}'s Dominant Chakra is ${childChakras}`, 0, doc.y + 25, {
    align: "center",
    width: doc.page.width,
  });

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc.text(chakrasContent[0], 60, doc.y + 30, {
    align: "justify",
    width: doc.page.width - 130,
    indent: 20,
    lineGap: 4,
  });

  doc.font("Linotte-Heavy").fontSize(16);
  doc.text(chakrasContent[1], 60, doc.y + 20, {
    align: "center",
    width: doc.page.width - 120,
  });

  const chakraIndex = chakrasOrder.indexOf(childChakras);

  if ([5, 6].includes(chakraIndex)) {
    doc.image(
      path.join(IMAGES, `chakra_${chakraIndex + 1}.png`),
      doc.page.width / 2 - 50,
      doc.y + 20,
      { width: 100 }
    );
  } else {
    doc.image(
      path.join(IMAGES, `chakra_${chakraIndex + 1}.png`),
      doc.page.width / 2 - 40,
      doc.y + 20,
      { width: 80 }
    );
  }

  doc.y += 90;
  doc.font("Linotte-Heavy").fontSize(22).fillColor("#000");
  doc.text(childChakras, 0, doc.y + 30, {
    align: "center",
    width: doc.page.width,
  });

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    `Parenting Tips to Increase ${name}'s Aura and Energy Level`,
    0,
    doc.y + 30,
    { align: "center", width: doc.page.width }
  );

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text(`${chakrasContent[2].title} : `, 60, doc.y + 25, {
    width: doc.page.width - 120,
    continued: true,
    indent: 10,
    align: "justify",
    lineGap: 4,
  });

  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .text(chakrasContent[2].desc, 60, doc.y);

  newPage(doc, IMAGES, `Panchangam: A Guide to ${name}'s Flourishing Future`);
  pages.push(pageNo);
  doc
    .font("Linotte-Regular")
    .fontSize(14)
    .fillColor("#000")
    .text(
      "Activating the Panchangam elements (Thithi, Vaaram, Nakshatra, Yogam, Karanam) can potentially bring balance to child's life, fostering positive energies and promoting growth.",
      60,
      doc.y + 15,
      {
        align: "justify",
        width: doc.page.width - 120,
        lineGap: 4,
      }
    );

  doc.y -= 20;

  ContentDesign(
    doc,
    "#BAF596",
    "",
    `${name} was born on ${formatted_date}, ${panchang["week_day"]} (Vaaram), under ${panchang["nakshatra"]} Nakshatra, ${panchang["paksha"]} Paksha ${panchang["thithi"]} Thithi, ${panchang["karanam"]} Karanam, and ${panchang["yoga"]} Yogam`,
    IMAGES,
    name
  );

  colors = ["#E5FFB5", "#94FFD2", "#B2E4FF", "#D6C8FF", "#FFDECA"];
  let titles = [
    `Tithi Represents ${name}'s Emotions, Mental Well-being`,
    `Vaaram Represents ${name}'s Energy & Behaviour`,
    `Nakshatra Represents ${name}'s Personality and Life Path`,
    `Yogam Represents ${name}'s Prosperity and Life Transformation`,
    `Karanam Represents ${name}'s Work and Actions`,
  ];

  let titleImages = [
    panchang.thithi_number <= 15 ? "waningMoon.png" : "waxingMoon.png",
    "week.png",
    "nakshatra.png",
    "yogam.png",
    "karanam.png",
  ];

  let panchangContent = [
    "",
    "",
    "Guru, born under the Rohini Nakshatra, possesses a charismatic and creative personality. He is known for his nurturing and caring nature, often acting as a source of comfort and security for those around him. With a strong sense of determination and ambition, Guru is likely to excel in creative fields such as art, music, or writing. His life path is guided by a desire for stability and prosperity, leading him to focus on building a secure and harmonious environment for himself and his loved ones.",
    "Guru was born under the Shubha Yogam, which bestows him with blessings of auspiciousness and prosperity. Guided by this Yogam, Guru is destined to reach great heights in his endeavors, focusing on creating a positive impact in the world and nurturing spiritual growth. His goals are aligned with serving others and spreading positivity, bringing about a sense of harmony and abundance wherever he goes. The Shubha Yogam empowers Guru to lead a fulfilling life, radiating positivity and making a significant positive impact on those around him.",
  ];

  for (let i = 0; i < titles.length; i++) {
    if (doc.y > doc.page.height - 200) {
      newPage(doc, IMAGES);
      doc.y = 40;
    }

    doc.image(
      path.join(IMAGES, titleImages[i]),
      doc.page.width / 2 - 20,
      doc.y + 10,
      {
        width: 50,
        height: 50,
      }
    );

    doc.y += 20;

    if (i === 0) {
      let positive = thithiContent[panchang.tithi][0];
      let negative = thithiContent[panchang.tithi][1];
      let tips = thithiContent[panchang.tithi][2];

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born under ${panchang.paksha} ${panchang.tithi}, and the following are Thithi impacts on ${name}'s Life`,
        60,
        doc.y + 20,
        {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.fontSize(14);
      let totalWidth =
        doc.widthOfString("Thithi Lord: ") +
        doc.font("Linotte-SemiBold").widthOfString(thithiLord[panchang.tithi]);

      doc
        .rect(
          100,
          doc.y + 20,
          doc.page.width - 200,
          doc.currentLineHeight() + 10
        )
        .fill(DesignColors[Math.floor(Math.random() * DesignColors.length)])
        .restore();

      doc.fillColor("#000").font("Linotte-Regular");

      doc
        .text(
          "Thithi Lord: ",
          doc.page.width / 2 - totalWidth / 2 - 10,
          doc.y + 25,
          {
            width: totalWidth + 20,
            continued: true,
          }
        )
        .font("Linotte-SemiBold")
        .text(thithiLord[panchang.tithi]);

      doc
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Description + " " + tips.Execution);
    } else if (i == 1) {
      let positive = weekPlanetContent[panchang["week_day"]][0];
      let negative = weekPlanetContent[panchang["week_day"]][1];
      let tips = weekPlanetContent[panchang["week_day"]][2];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born on ${panchang["week_day"]}, and the following are its impacts on ${name}'s life:`,
        60,
        doc.y + 20,
        {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.fontSize(14);
      let totalWidth =
        doc.widthOfString("Rulling Planet: ") +
        doc
          .font("Linotte-SemiBold")
          .widthOfString(weekPlanet[panchang["week_day"]]);

      doc
        .rect(
          100,
          doc.y + 20,
          doc.page.width - 200,
          doc.currentLineHeight() + 10
        )
        .fill(DesignColors[Math.floor(Math.random() * DesignColors.length)])
        .restore();

      doc.fillColor("#000").font("Linotte-Regular");

      doc
        .text(
          "Rulling Planet: ",
          doc.page.width / 2 - totalWidth / 2 - 10,
          doc.y + 25,
          {
            width: totalWidth + 20,
            continued: true,
          }
        )
        .font("Linotte-SemiBold")
        .text(weekPlanet[panchang["week_day"]]);

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 40;
      }

      doc
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Execution);
    } else if (i == 4) {
      let positive = karanamContent[panchang["karana"]][0];
      let negative = karanamContent[panchang["karana"]][1];
      let tips = karanamContent[panchang["karana"]][2];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 0;
      }

      doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
      doc.text(titles[i], 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
      });

      doc.font("Linotte-Regular").fontSize(14);
      doc.text(
        `${name} was born under ${panchang["karana"]}, and the following are Karanam impacts on ${name}'s life:`,
        60,
        doc.y + 20,
        {
          width: doc.page.width - 120,
          lineGap: 4,
          align: "center",
        }
      );

      doc.y += 20;

      let data = [
        ["Strength", "Challenges"],
        [positive[0], negative[0]],
        [positive[1], negative[1]],
        [positive[2], negative[2]],
      ];

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      panchangTable(doc, data);
      doc.y += 20;

      if (doc.y > doc.page.height - 200) {
        newPage(doc, IMAGES);
        doc.y = 50;
      }

      doc
        .fontSize(14)
        .text("Parenting Tips: ", 60, doc.y + 25, {
          continued: true,
          width: doc.page.width - 120,
          align: "left",
          lineGap: 4,
        })
        .font("Linotte-Regular")
        .text(tips.Name + " " + tips.Execution);
    } else {
      let con = await panchangPrompt(panchang, i, name, gender);
      doc.y += 30;
      ContentDesign(doc, randomeColor(), titles[i], con, IMAGES, name);
    }

    doc.y += 30;
  }

  newPage(
    doc,
    IMAGES,
    "Potential Health Challenges and Holistic Wellness Solutions"
  );
  pages.push(pageNo);

  let shifted = zodiac
    .slice(zodiac.indexOf(asc["sign"]))
    .concat(zodiac.slice(0, zodiac.indexOf(asc["sign"])));

  let con = healthContent[shifted[5]];
  let insights = healthInsights[shifted[5]];

  doc.y += 10;

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  lineBreak(doc, insights, IMAGES, randomeColor());

  doc
    .font("Linotte-SemiBold")
    .fontSize(18)
    .text("Health Issues Based on", 0, doc.y + 20, {
      align: "center",
      width: doc.page.width,
    });
  let color1 = randomeColor();
  let color2 = randomeColor();
  let colwidth = (doc.page.width - 50) / 2 - 10;
  let set_y = doc.y;

  doc.roundedRect(30, doc.y + 10, colwidth, 45, 10).fill(color1);

  doc
    .fontSize(15)
    .fillColor("#000")
    .text("Common Health Issues", 30, doc.y + 15, {
      align: "center",
      width: colwidth,
    });

  doc.y += 5;

  con[0].forEach((issue, index) => {
    let texts = issue.split(" (");

    let height =
      doc.fontSize(14).heightOfString(index + ") " + texts[0], {
        width: colwidth,
        lineGap: 4,
      }) +
      doc.font("Linotte-Regular").heightOfString(" (" + texts[1], {
        width: colwidth,
        lineGap: 4,
      });

    doc
      .roundedRect(
        30,
        doc.y,
        colwidth,
        height + (con[0].indexOf(issue) === con[0].length - 1 ? 8 : 15),
        10
      )
      .fill(color1);

    doc.fillColor("#000").font("Linotte-SemiBold").fontSize(14);
    doc
      .text(index + 1 + ") " + texts[0], 40, doc.y, {
        continued: true,
        width: colwidth,
        lineGap: 4,
      })
      .font("Linotte-Regular")
      .text(texts[1]);
  });

  let current_y = doc.y;
  doc
    .roundedRect(30 + colwidth + 15, set_y + 10, colwidth, 45, 10)
    .fill(color2);

  doc
    .fontSize(15)
    .fillColor("#000")
    .text("Dosha Constitution Issues", 30 + colwidth + 10, set_y + 15, {
      align: "center",
      width: colwidth,
    });

  set_y += 5;

  con[1].forEach((issue, index) => {
    let texts = issue.split(" (");

    let height =
      doc.fontSize(14).heightOfString(index + ") " + texts[0], {
        width: colwidth,
        lineGap: 4,
      }) +
      doc.font("Linotte-Regular").heightOfString(" (" + texts[1], {
        width: colwidth,
        lineGap: 4,
      });

    doc
      .roundedRect(
        30 + colwidth + 15,
        doc.y,
        colwidth,
        height + (con[1].indexOf(issue) === con[1].length - 1 ? 8 : 15),
        10
      )
      .fill(color2);

    doc.fillColor("#000").font("Linotte-SemiBold").fontSize(14);
    doc
      .text(index + 1 + ") " + texts[0], 40 + colwidth + 10, doc.y, {
        continued: true,
        width: colwidth,
        lineGap: 4,
      })
      .font("Linotte-Regular")
      .text(texts[1]);
  });

  current_y = Math.max(current_y, doc.y);
  doc.y = current_y + 10;

  doc
    .font("Linotte-Heavy")
    .fontSize(18)
    .text("Remedial Practices", 0, doc.y + 20, {
      align: "center",
      width: doc.page.width,
    });

  colors = ["#CBF3DB", "#FFD6A5", "#DEE2FF"];
  let title = [
    "Natural Ayurvedic Remedy",
    "Mudra Practice Remedy",
    "Mindful Food & Diet Remedy",
  ];

  title.forEach((t, i) => {
    doc
      .roundedRect(doc.page.width / 2 - 150, doc.y + 10, 300, 30, 10)
      .fill(colors[i]);
    doc
      .fontSize(16)
      .fillColor("#000")
      .text(t, doc.page.width / 2 - 150, doc.y + 20, {
        align: "center",
        width: 300,
      });

    doc.y += 10;
  });

  newPage(doc, IMAGES);
  doc.y = 70;
  let color = colors[0];
  doc.roundedRect(60, doc.y + 7.5, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "ayur.png"),
    doc.page.width / 2 - 30,
    doc.y + 10,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Natural Ayurvedic", 0, doc.y + 80, {
    align: "center",
  });

  content = con[3]["natural"];

  doc.font("Linotte-Regular").fontSize(14);
  doc.rect(60, doc.y, doc.page.width - 120, 50).fill(color);
  doc.fillColor("#000");
  doc.text(content[0], 70, doc.y + 10, {
    align: "center",
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  let height =
    doc.font("Linotte-SemiBold").heightOfString("Ingredients: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[1], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.rect(60, doc.y, doc.page.width - 120, height).fill(color);
  doc.fillColor("#000");
  doc
    .font("Linotte-SemiBold")
    .fontSize(14)
    .text("Ingredients: ", 70, doc.y, {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    });
  doc.font("Linotte-Regular").fontSize(14).text(content[1], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("How to Make: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[2], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.rect(60, doc.y, doc.page.width - 120, height).fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("How to Make: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(60, doc.y, doc.page.width - 120, height + 5, 10).fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  doc.y += 50;

  color = colors[1];
  doc.roundedRect(60, doc.y + 10, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "mudra.png"),
    doc.page.width / 2 - 30,
    doc.y + 20,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Mudra Practice Remedy", 0, doc.y + 90, {
    align: "center",
  });

  content = con[3]["mudra"];

  doc.font("Linotte-Regular").fontSize(14);
  doc.rect(60, doc.y, doc.page.width - 120, 50).fill(color);
  doc.fillColor("#000");
  doc.text(content[0], 70, doc.y + 10, {
    align: "center",
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  height = doc.font("Linotte-SemiBold").fontSize(16).currentLineHeight() + 10;

  doc.rect(60, doc.y, doc.page.width - 120, height + 10).fill(color);
  doc.fillColor("#000");
  doc.text("Steps: ", 70, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 10;

  content[1].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 10;

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[2], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc
    .roundedRect(60, doc.y - 10, doc.page.width - 120, height + 20, 10)
    .fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  newPage(doc, IMAGES);
  doc.y = 70;
  color = colors[2];
  doc.roundedRect(60, doc.y + 7.5, doc.page.width - 120, 120, 10).fill(color);
  doc.image(
    path.join(IMAGES, "food.png"),
    doc.page.width / 2 - 30,
    doc.y + 10,
    {
      width: 60,
      height: 60,
    }
  );
  doc.fillColor("#000");
  doc.font("Linotte-Heavy").fontSize(16);
  doc.text("Mindful Food & Diet Remedy", 0, doc.y + 80, {
    align: "center",
  });

  content = con[3]["foods"];

  doc.y += 10;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y, doc.page.width - 120, doc.currentLineHeight() + 30)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "tick.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Food to Include", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[0].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 20;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y - 20, doc.page.width - 120, doc.currentLineHeight() + 50)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "cancel.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Food to Avoid", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[1].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 20;

  doc.font("Linotte-SemiBold").fontSize(16);

  doc
    .rect(60, doc.y - 20, doc.page.width - 120, doc.currentLineHeight() + 50)
    .fill(color);
  doc.fillColor("#000");

  doc.image(path.join(IMAGES, "guide.png"), 65, doc.y - 10, {
    width: 30,
    height: 30,
  });

  doc.text("Execution Guide", 100, doc.y, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  doc.y += 5;

  content[2].forEach((step, index) => {
    height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(60, doc.y, doc.page.width - 120, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 160,
        lineGap: 4,
      });
  });

  doc.y += 10;

  height =
    doc.font("Linotte-SemiBold").heightOfString("Benefits: ", {
      width: doc.page.width - 140,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 140,
      lineGap: 4,
    }) +
    10;

  doc
    .roundedRect(60, doc.y - 10, doc.page.width - 120, height + 20, 10)
    .fill(color);
  doc.fillColor("#000");
  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Benefits: ", 70, doc.y, {
    continued: true,
    width: doc.page.width - 140,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[2], 70, doc.y);

  let content2 = await physical(planets, 2, name, gender);
  let content3 = await physical(planets, 3, name, gender);
  let content4 = await physical(planets, 4, name, gender);

  let totalContents = [content2, content3, content4];

  titles = [
    {
      physical_attributes: "Physical Attributes",
      personality: "Outer Personality",
      character: "Character",
      positive_behavior: "Positive Behavior",
      negative_behavior: "Behavior Challenges",
      parenting_tips: `Parenting Tips For ${name}'s Behaviour Challenges`,
    },
    {
      emotional_state: `${name}'s Emotional State Insights`,
      emotions: `${name}'s Emotions`,
      feelings: `${name}'s Feelings`,
      reactions: `${name}'s Reactions`,
      negative_imbalance: `${name}'s Emotional Imbalance Challenges`,
      parenting_tips: `Parenting Tips`,
    },
    {
      core_insights: `${name}'s Soul Desire`,
      recognitions: `Seek For Recognition`,
      core_identity: `Core Identity`,
      ego: `${name}'s Soul Ego`,
      negative_ego: `${name}'s Ego Challenges`,
      parenting_tips: `Parenting Tips For Self Identity Challenges`,
    },
  ];

  newPage(
    doc,
    IMAGES,
    "Outer World - Physical Attributes, Personality, and Behavior"
  );
  pages.push(pageNo);
  doc.fillColor("#000");

  totalContents.forEach((content, index) => {
    if (index === 1) {
      newPage(doc, IMAGES, "Inner World - Emotional Needs and Soul Desire");
      pages.push(pageNo);
      doc.fillColor("#000");
    }

    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    doc.fillColor("#000");

    if (typeof content === "string") {
      doc.font("Linotte-SemiBold").fontSize(18);
      doc.text(titles[index], 60, doc.y + 10, {
        align: "center",
        width: doc.page.width - 120,
        lineGap: 4,
      });

      doc
        .font("Linotte-Regular")
        .fontSize(14)
        .text(content, 60, doc.y + 10, {
          align: "justify",
          width: doc.page.width - 120,
          lineGap: 4,
        });
    } else {
      for (let key in content) {
        if (doc.y + 80 > doc.page.height - 100) {
          newPage(doc, IMAGES);
          doc.y = 60;
        }
        ContentDesign(
          doc,
          randomeColor(),
          titles[index][key],
          content[key],
          ICONS,
          name
        );
      }
    }
  });

  newPage(doc, IMAGES, `${name}'s Education and Intellect`);
  pages.push(pageNo);

  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    `Insights about ${name}'s education and intelligence`,
    60,
    doc.y + 10,
    {
      align: "center",
      width: doc.page.width - 120,
      lineGap: 4,
    }
  );

  let educationTitle = {
    insights: "Education and Intellectual Insights",
    suitable_educational: "Higher Education Preferences",
    cognitive_abilities: "Learning Approaches",
    recommendations: "How To Do It:",
  };

  content = education[moon["sign"]];

  con = {
    insights: content[0],
    suitable_educational: content[1],
    cognitive_abilities: content[2],
    recommendations: content[4],
  };

  doc.fillColor("#000");

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    if (key === "recommendations") {
      if (doc.y + 80 > doc.page.height - 100) {
        newPage(doc, IMAGES);
        doc.y = 60;
      }

      doc.image(
        path.join(ICONS, "pg 33_personalized.png"),
        doc.page.width / 2 - 20,
        doc.y + 10,
        {
          width: 40,
          height: 40,
        }
      );

      doc.font("Linotte-SemiBold").fontSize(18);
      doc.text("Parenting Tip for Academic Excellence:", 0, doc.y + 60, {
        align: "center",
        width: doc.page.width,
        lineGap: 4,
      });

      doc.fontSize(15);

      doc.text(content[3], 60, doc.y + 10, {
        align: "center",
        width: doc.page.width - 120,
        lineGap: 4,
      });
    }

    ContentDesign(
      doc,
      randomeColor(),
      educationTitle[key],
      con[key],
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES, "Family and Relationships");
  pages.push(pageNo);
  con = await physical(planets, 5, name, gender);

  let familyTitle = {
    family_relationship: "",
    approaches: `${name}'s Approaches for Forming Relationships`,
    parenting_support: `Parenting Support for Improve ${name}'s Social Developments`,
  };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    ContentDesign(doc, randomeColor(), familyTitle[key], con[key], ICONS, name);
  }

  newPage(doc, IMAGES, `${name}'s Career and Professions`);
  pages.push(pageNo);
  doc.font("Linotte-SemiBold").fontSize(16);
  doc.text(
    "Wondering what the future holds for your child's career journey?",
    60,
    doc.y + 10,
    {
      align: "center",
      width: doc.page.width - 120,
      lineGap: 4,
    }
  );

  let contents = carrer[shifted[9]];
  let prof = [];

  for (let key in contents[1]) {
    prof.push({
      title: key,
      content: contents[1][key],
    });
  }

  let CarrerTitle = {
    suitable_professions: `${name}'s Successful Career Path & Suitable Professions`,
    business: "Business & Entrepreneurial Potentials",
  };

  con = { career_path: contents[0], suitable_professions: prof };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }

    ContentDesign(
      doc,
      randomeColor(),
      CarrerTitle[key] || "",
      con[key],
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES, "Subconscious Mind Analysis");
  pages.push(pageNo);
  doc.font("Linotte-Regular").fontSize(14);
  con = subContent[shifted[7]];

  ContentDesign(
    doc,
    randomeColor(),
    "",
    String(con[0]).replace(/child/g, name).replace(/Child/g, name),
    ICONS,
    name
  );

  ContentDesign(
    doc,
    randomeColor(),
    `${name}'s Hidden Challenges`,
    con[1],
    ICONS,
    name
  );

  content = con[2]["manifestation"];
  newPage(doc, IMAGES);
  doc.y = 60;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "mani.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Manifestation Practices", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 140, doc.y + 10, {
    width: doc.page.width - 280,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  content = con[2]["quantum"];
  doc.y += 30;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "atom.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Quantum Physics Concept Remedy", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 120, doc.y + 10, {
    width: doc.page.width - 270,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  content = con[2]["healing"];
  newPage(doc, IMAGES);
  doc.y = shifted[7] === "Scorpio" ? 40 : 60;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "heart.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Healing Remedy", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 140, doc.y + 10, {
    width: doc.page.width - 280,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  content = con[2]["mudra"];
  doc.y += shifted[7] === "Scorpio" ? 20 : 30;
  color = randomeColor();

  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 160, 10).fill(color);
  doc.image(path.join(IMAGES, "mudra.png"), 60, doc.y + 20, {
    width: 50,
    height: 50,
  });

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");

  doc.text("Mudra Remedy", 0, doc.y + 20, {
    align: "center",
    width: doc.page.width,
  });

  doc.fontSize(13);

  doc.text(content[0], 80, doc.y + 20, {
    width: doc.page.width - 140,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-Regular").fontSize(12);

  doc.text(content[1], 140, doc.y + 10, {
    width: doc.page.width - 280,
    lineGap: 4,
    align: "center",
  });

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("How To Do It:", 60, doc.y + 10, {
    width: doc.page.width - 140,
    lineGap: 4,
  });

  content[2].forEach((step, index) => {
    step = step.replace(/child/g, name).replace(/Child/g, name);
    let height = doc
      .font("Linotte-Regular")
      .fontSize(14)
      .heightOfString(index + 1 + ") " + step, {
        width: doc.page.width - 160,
        lineGap: 4,
      });

    doc.rect(50, doc.y, doc.page.width - 100, height + 8).fill(color);
    doc
      .font("Linotte-Regular")
      .fillColor("#000")
      .fontSize(14)
      .text(index + 1 + ") " + step, 90, doc.y + 2, {
        width: doc.page.width - 140,
        lineGap: 4,
      });
  });

  height =
    doc.font("Linotte-SemiBold").heightOfString("Counts: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[3], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);
  doc.text("Counts: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[3], 70, doc.y);

  height =
    doc.font("Linotte-SemiBold").heightOfString("Why it works: ", {
      width: doc.page.width - 160,
      lineGap: 4,
      continued: true,
    }) +
    doc.font("Linotte-Regular").heightOfString(content[4], {
      width: doc.page.width - 160,
      lineGap: 4,
    }) +
    10;

  if (shifted[7] === "Scorpio") height -= 25;

  doc.roundedRect(50, doc.y, doc.page.width - 100, height, 10).fill(color);

  doc.fillColor("#000");

  doc.font("Linotte-SemiBold").fontSize(14);

  doc.text("Why it works: ", 60, doc.y, {
    continued: true,
    width: doc.page.width - 120,
    lineGap: 4,
  });
  doc.font("Linotte-Regular").fontSize(14).text(content[4], 70, doc.y);

  newPage(doc, IMAGES, "Unique Talents and Natural Skills");
  pages.push(pageNo);
  con = await chapterPrompt(planets, 0, name, gender);

  let uniqueTitle = {
    insights: "",
    education: "Unique Talents in Academics",
    arts_creative: "Unique Talents in Arts & Creativity",
    physical_activity: "Unique Talents in Physical Activity",
  };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 60;
    }
    ContentDesign(doc, randomeColor(), uniqueTitle[key], con[key], ICONS, name);
  }

  newPage(doc, IMAGES, "Karmic Life Lessons");
  pages.push(pageNo);
  con = await chapterPrompt(planets, 7, name, gender);

  let karmicTitle = {
    child_responsibility_discipline: "Saturn's Life Lesson",
    child_desire_ambition: "Rahu's Life Lesson",
    child_spiritual_wisdom: "Ketu's Life Lesson",
  };

  for (let key in con) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 50;
    }
    ContentDesign(doc, randomeColor(), karmicTitle[key], con[key], ICONS, name);
  }

  newPage(doc, IMAGES, "Sade Sati Analysis");
  pages.push(pageNo);
  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  doc
    .save()
    .fillColor("#D2CEFF")
    .roundedRect(
      50,
      doc.y + 15,
      doc.page.width - 100,
      doc.heightOfString(
        "Sadhe Sati refers to the seven-and-a-half-year period in which Saturn moves through three signs — the moon sign, one before the moon and the one after it. Sadhe Sati starts when Saturn (Shani) enters the 12th sign from the birth Moon sign and ends when Saturn leaves the 2nd sign from the birth Moon sign.",
        {
          width: doc.page.width - 120,
          lineGap: 3,
        }
      ) + 15,
      10
    )
    .fill()
    .restore();

  doc.text(
    "Sadhe Sati refers to the seven-and-a-half-year period in which Saturn moves through three signs — the moon sign, one before the moon and the one after it. Sadhe Sati starts when Saturn (Shani) enters the 12th sign from the birth Moon sign and ends when Saturn leaves the 2nd sign from the birth Moon sign.",
    60,
    doc.y + 25,
    {
      align: "justify",
      width: doc.page.width - 120,
      lineGap: 3,
    }
  );

  const current_saturn = get_current_saturn_sign(saturn_pos);
  const current_zodiac_signs = [
    ...zodiac.slice(zodiac.indexOf(current_saturn.Sign)),
    ...zodiac.slice(0, zodiac.indexOf(current_saturn.Sign)),
  ];

  const moon_index = current_zodiac_signs.indexOf(moon.sign);
  const previous_sign = current_zodiac_signs[moon_index - 1];
  const next_sign =
    current_zodiac_signs[(moon_index + 1) % current_zodiac_signs.length];

  let sadhesati_status = "not";
  let start_time = "";
  let end_time = "";

  if (current_saturn.Sign === moon.sign) {
    sadhesati_status = "yes";
    start_time = current_saturn["Start Date"];
    end_time = current_saturn["End Date"];
  } else if (previous_sign === current_saturn.Sign) {
    sadhesati_status = "yes";
    const prev = saturn_pos[saturn_pos.indexOf(current_saturn) + 1];
    start_time = prev["Start Date"];
    end_time = prev["End Date"];

    const endDate = new Date(end_time);
    if (endDate < new Date()) {
      sadhesati_status = "not";
      saturn_pos.splice(saturn_pos.indexOf(current_saturn) + 1, 1);
      const next_saturn = get_next_sade_sati(saturn_pos, moon.sign);
      start_time = next_saturn["Start Date"];
      end_time = next_saturn["End Date"];
    }
  } else if (next_sign === current_saturn.Sign) {
    sadhesati_status = "yes";
    const nextSat = saturn_pos[saturn_pos.indexOf(current_saturn) - 1];
    start_time = nextSat["Start Date"];
    end_time = nextSat["End Date"];

    const endDate = new Date(end_time);
    if (endDate < new Date()) {
      sadhesati_status = "not";
      saturn_pos.splice(saturn_pos.indexOf(current_saturn) - 1, 1);
      const next_saturn = get_next_sade_sati(saturn_pos, moon.sign);
      start_time = next_saturn["Start Date"];
      end_time = next_saturn["End Date"];
    }
  } else {
    const next_saturn_pos = saturn_pos.slice(
      saturn_pos.indexOf(current_saturn)
    );
    const next_saturn = get_next_sade_sati(next_saturn_pos, moon.sign);
    start_time = next_saturn["Start Date"];
    end_time = next_saturn["End Date"];
  }

  doc.moveDown(2);
  doc.font("Linotte-Heavy").fontSize(24).fillColor("#000");
  doc.text(`Presence of Sadhesati in ${name}`, 0, doc.y, {
    align: "center",
    width: doc.page.width,
  });

  doc.moveDown(1);
  doc
    .save()
    .fillColor("#F5E7D2")
    .strokeColor("#B26F0B")
    .roundedRect(50, doc.y, doc.page.width - 100, 185, 10)
    .fillAndStroke()
    .restore();

  doc.image(path.join(IMAGES, `${sadhesati_status}.png`), 60, doc.y + 50, {
    width: 80,
    height: 80,
  });

  const x_start = 160;
  let y_start = doc.y + 40;

  const statusDetails = {
    not: `${name} is not undergoing`,
    yes: `${name} is currently undergoing`,
  };

  let table_data = [
    ["Sadhesati Status:", statusDetails[sadhesati_status]],
    ["Current Sign:", current_saturn.Sign],
    ["Child Moon Sign:", moon.sign],
    ["Expect Date:", `${start_time} - ${end_time}`],
  ];

  doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
  table_data.forEach(([label, value]) => {
    doc.text(label, x_start, y_start, { width: 120 });
    doc.text(value, x_start + 130, y_start, {
      width: doc.page.width - 260,
      align: "left",
    });
    y_start += 30;
  });

  doc
    .save()
    .fillColor("#FFCEE0")
    .roundedRect(50, doc.y + 70, doc.page.width - 100, 215, 10)
    .fill()
    .restore();

  doc.font("Linotte-SemiBold").fontSize(18).fillColor("#000");
  doc.text("Sadhesati Overview and Effects", 60, doc.y + 90, {
    width: doc.page.width - 120,
    align: "left",
  });

  doc.font("Linotte-Regular").fontSize(12);
  doc.text(
    "Sade Sati is a significant astrological period lasting seven and a half years, during which Saturn transits over the Moon's position and the two adjacent houses in a birth chart. This phase often brings challenges, including emotional stress, financial instability, and personal setbacks. The impact of Sade Sati can vary based on Saturn's placement and other planetary influences in the birth chart. Remedies such as performing Saturn-related pujas, wearing specific gemstones, and engaging in charitable activities can help alleviate the negative effects and provide support during this period.",
    60,
    doc.y + 15,
    {
      width: doc.page.width - 120,
      align: "justify",
      lineGap: 5,
      indent: 15,
    }
  );

  newPage(doc, IMAGES, "Life Stones and Benefic/Lucky Stones");
  pages.push(pageNo);
  const stoneName = ["Life Stone", "Benefictical Stone", "Lucky Stone"];

  content = [
    {
      "Why Life Stone":
        "The Ascendant, or LAGNA, represents the self and all aspects tied to it, such as health, vitality, status, identity, and life direction. It embodies the core essence of existence. The gemstone associated with the LAGNESH, the ruling planet of the Ascendant, is known as the LIFE STONE. Wearing this stone throughout one’s life ensures access to its profound benefits and transformative energies.",
      Description: stones[0].Description,
    },
    {
      "Why Benefictical Stone":
        "The Fifth House in the birth chart is a highly favorable domain. It governs intellect, advanced learning, children, unexpected fortunes, and more. This house also represents the STHANA of PURVA PUNYA KARMAS, signifying rewards from past virtuous actions. Thus, it is regarded as a house of blessings. The gemstone linked to the lord of the Fifth House is known as the BENEFIC STONE.",
      Description: stones[1].Description,
    },
    {
      "Why Lucky Stone":
        "The Ninth House in a birth chart, known as the BHAGYA STHAANA or the House of Luck, symbolizes destiny and fortune. It governs success, achievements, wisdom, and the blessings earned through good deeds in past lives. This house reveals the rewards one is destined to enjoy. The gemstone associated with the lord of the Ninth House is aptly called the LUCKY STONE.",
      Description: stones[2].Description,
    },
  ];

  doc.y += 10;

  content.forEach((stone, index) => {
    if (index !== 0) {
      newPage(doc, IMAGES);
      doc.y = 50;
    }

    const gem = stones[index].Gemstone;
    const gemstonePath = path.join(IMAGES, `${gem}.png`);
    const bgPath = path.join(IMAGES, `stone_bg.png`);

    if (["Ruby", "Red Coral", "Emerald"].includes(gem)) {
      doc.image(bgPath, doc.page.width / 2 - 60, doc.y + 120, { width: 120 });
    } else {
      doc.image(bgPath, doc.page.width / 2 - 50, doc.y + 90, { width: 100 });
    }

    doc.image(gemstonePath, doc.page.width / 2 - 50, doc.y + 40, {
      width: 100,
    });

    if (["Ruby", "Red Coral", "Emerald"].includes(gem)) {
      doc.y += 40;
    }

    doc.font("Linotte-Heavy").fontSize(26).fillColor("#000000");
    doc.y += 155;
    doc.text(`${stoneName[index]} : ${gem}`, { align: "center" });

    Object.entries(stone).forEach(([key, value]) => {
      ContentDesign(
        doc,
        DesignColors[Math.floor(Math.random() * DesignColors.length)],
        key,
        value,
        IMAGES,
        name
      );
      doc.y += 20;
    });
  });

  doc.image(path.join(IMAGES, "end.png"), doc.page.width / 2 - 40, doc.y + 40, {
    width: 80,
  });

  newPage(doc, IMAGES, "Atma Karga & Ishta Devata");
  pages.push(pageNo);
  doc
    .roundedRect(50, doc.y + 10, doc.page.width - 100, 120, 10)
    .fill("#FFD7D7");

  doc.font("Linotte-SemiBold").fontSize(20).fillColor("#000");
  doc.text("AtmaKaraka", 60, doc.y + 20, {
    align: "center",
    width: doc.page.width - 120,
  });

  doc.font("Linotte-Regular").fontSize(12).fillColor("#940000");
  doc.text(
    "Atmakaraka, a Sanskrit term for 'soul indicator' is the planet with the highest degree in your birth chart. It reveals your deepest desires and key strengths and weaknesses. Understanding your Atmakaraka can guide you toward your true purpose and inspire meaningful changes in your life.",
    60,
    doc.y + 5,
    {
      width: doc.page.width - 120,
      align: "justify",
      lineGap: 4,
    }
  );

  doc.image(
    path.join(IMAGES, `atma_${atma["Name"].toLowerCase()}.jpeg`),
    doc.page.width / 2 - 65,
    doc.y + 20,
    {
      width: 130,
    }
  );

  doc.font("Linotte-SemiBold").fontSize(20);

  doc
    .roundedRect(
      100,
      doc.y + 260,
      doc.page.width - 200,
      doc.currentLineHeight() + 10,
      20
    )
    .fill("#FFF1F1");

  doc.fillColor("#940000");

  doc.text(`AtmaKaraka Planet: ${atma["Name"]}`, 60, doc.y + 265, {
    width: doc.page.width - 120,
    align: "center",
  });

  doc.fillColor("#000").font("Linotte-Regular").fontSize(18);

  doc.text(athmakaraka[atma["Name"]], 60, doc.y + 30, {
    width: doc.page.width - 120,
    align: "justify",
    lineGap: 4,
    indent: 15,
  });

  newPage(doc, IMAGES, name + "'s Favourable God");
  doc.roundedRect(50, doc.y + 10, doc.page.width - 100, 90, 10).fill("#D7FFEA");

  doc.font("Linotte-Regular").fontSize(14).fillColor("#365600");
  doc.text(
    "         According to the scriptures, worshiping your Ishta Dev gives desired results. Determination of the Ishta Dev or Devi is determined by our past life karmas. There are many methods of determining the deity in astrology. Here, We have used the Jaimini Atmakaraka for Ishta Dev decision.",
    60,
    doc.y + 20,
    {
      width: doc.page.width - 120,
      align: "justify",
      lineGap: 4,
    }
  );

  doc.image(
    path.join(IMAGES, `${isthaDeva}.jpeg`),
    doc.page.width / 2 - 65,
    doc.y + 20,
    {
      width: 130,
    }
  );

  doc.font("Linotte-SemiBold").fontSize(20);

  doc.fillColor("#000");

  doc.text(isthaDeva, 60, doc.y + 265, {
    width: doc.page.width - 120,
    align: "center",
  });

  doc.fillColor("#000").font("Linotte-Regular").fontSize(12);

  doc.text(ista_devata_desc[isthadevathaLord], 60, doc.y + 20, {
    width: doc.page.width - 120,
    align: "justify",
    lineGap: 4,
    indent: 15,
  });
  doc.addPage();
  pageNo++;
  pages.push(pageNo);
  doc.addNamedDestination("page" + pageNo);
  doc.image(path.join(IMAGES, "bg1.png"), 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });

  let w = doc.page.width;
  let h = 180;
  const pngBuffer = makeGradientPNG(w, h, "#9D9CF9", "#ffffff", "vertical");

  doc.image(pngBuffer, 0, 0, { width: w, height: h });

  doc.fillColor("#168457").font("Linotte-Heavy").fontSize(40);
  doc.text(name + "'s Development \nMile Stones", 30, 30, {
    lineGap: -1,
  });

  doc.image(path.join(IMAGES, "dasa.png"), doc.page.width - 290, 65, {
    width: 260,
  });

  let dasaOut = await dasaPrompt(year, planets, dasa, name, gender);

  colors = ["#9D9CF9", "#E8CEFF", "#FFDCC3", "#C3DBFF", "#FFCEE0"];

  doc.y += 40;

  dasaOut.forEach((dasa, index) => {
    doc.fillColor("#966A2F");
    if (index !== 0) {
      newPage(doc, IMAGES);
      doc.y = 50;
      doc.fillColor("#000");
    }

    doc.font("Linotte-Heavy").fontSize(24);
    doc.text(dasa["age"], 80, doc.y, {
      width: doc.page.width - 160,
      align: "center",
    });
    let status;
    if (dasa_status_table[dasa["dasa"]][0].includes(dasa["bhukthi"])) {
      status = "Favourable";
    } else if (dasa_status_table[dasa["dasa"]][1].includes(dasa["bhukthi"])) {
      status = "Unfavourable";
    } else {
      status = "Moderate";
    }

    doc.text(`(${status})`, 0, doc.y, {
      width: doc.page.width,
      align: "center",
    });

    y = doc.y + 10;

    doc.roundedRect(doc.page.width / 2 - 100, y, 200, 120, 10).fill("#FFEED7");
    doc.fillColor("#000");
    doc.font("Linotte-SemiBold").fontSize(14);
    doc.text("Dasa", doc.page.width / 2 - 100, y + 8, {
      width: 100,
      align: "center",
    });
    doc.text("Bhukti", doc.page.width / 2, y + 8, {
      width: 100,
      align: "center",
    });

    doc.image(
      path.join(IMAGES, `${dasa["dasa"].toLowerCase()}.png`),
      doc.page.width / 2 - 80,
      y + 28,
      {
        width: 60,
      }
    );

    doc.image(
      path.join(IMAGES, `${dasa["bhukthi"].toLowerCase()}.png`),
      doc.page.width / 2 + 20,
      y + 28,
      {
        width: 60,
      }
    );

    doc.text(dasa["dasa"], doc.page.width / 2 - 100, y + 95, {
      width: 100,
      align: "center",
    });
    doc.text(dasa["bhukthi"], doc.page.width / 2, y + 95, {
      width: 100,
      align: "center",
    });

    doc.fillColor("#000").font("Linotte-Regular").fontSize(14);

    let dasaContent = dasa["prediction"];

    for (let key in dasaContent) {
      if (doc.y + 80 > doc.page.height - 100) {
        newPage(doc, IMAGES);
        doc.y = 50;
      }
      ContentDesign(doc, randomeColor(), key, dasaContent[key], ICONS, name);
    }
  });

  let planetMain = {
    Sun: "Soul, Vitality, & Leadership Qualities",
    Moon: "Emotions, Intuition, Nurturing  Mind.",
    Mars: "Energy, Courage, Passion, and Assertiveness.",
    Mercury: "Communications, Intelligence, Adaptability.",
    Jupiter: "Wisdom, Expansion, Knowledge, Spirituality.",
    Venus: "Love, Relationships, Beauty, Art, Comforts.",
    Saturn: "Discipline, Responsibility, Challenges.",
    Rahu: "Desires, Ambitions, Worldly Attachment.",
    Ketu: "Spirituality, Detachment, Past Life Influence.",
  };

  planets.forEach((planet) => {
    if (planet.Name === "Ascendant") return;
    let planet_table = planetTable[planet.Name];

    if (planet_table[0].includes(planet["zodiac_lord"])) {
      planet["status"] = "Favourable";
    } else if (planet_table[1].includes(planet["zodiac_lord"])) {
      planet["status"] = "Unfavourable";
    } else {
      planet["status"] = "Moderate";
    }

    newPage(doc, IMAGES);
    if (planet.Name === "Sun") {
      pages.push(pageNo);
    }
    doc.font("Linotte-Heavy");
    doc.y = 40;

    if (planet.Name === "Sun") {
      doc.fontSize(26);
      doc.fillColor("#966A2F");
      doc.text(
        `${name}'s Planetary Energy and Lifestyle Modification`,
        80,
        doc.y,
        {
          width: doc.page.width - 160,
          align: "center",
        }
      );
      doc.y += 10;
    }

    doc.fontSize(20);
    doc.fillColor("#000");
    doc.text(`${planet.Name} - ${planetMain[planet.Name]}`, 80, doc.y, {
      width: doc.page.width - 160,
      align: "center",
    });

    if (planet.Name === "Ketu") doc.y -= 10;

    doc.image(
      path.join(IMAGES, `${planet.Name.toLowerCase()}.png`),
      110,
      doc.y + (planet["Name"] === "Ketu" ? 40 : 30),
      {
        width: 80,
        height: 80,
      }
    );

    doc.font("Linotte-Regular").fontSize(12);

    content = planetDesc[planet["Name"]];

    height = doc.heightOfString(content[0], {
      width: doc.page.width / 2 - (planet["Name"] === "Ketu" ? 0 : 30),
      lineGap: 4,
    });

    doc
      .roundedRect(
        doc.page.width / 2 - (planet["Name"] === "Ketu" ? 50 : 20),
        doc.y + 30,
        doc.page.width / 2 - (planet["Name"] === "Ketu" ? -10 : 20),
        height + 10,
        10
      )
      .fill(randomeColor());

    doc.fillColor("#000");

    doc.text(
      content[0],
      doc.page.width / 2 - (planet["Name"] === "Ketu" ? 42.5 : 15),
      doc.y + 40,
      {
        width: doc.page.width / 2 - (planet["Name"] === "Ketu" ? 0 : 30),
        align: "justify",
        lineGap: 4,
      }
    );

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    if (planet.Name !== "Ketu") doc.y += 20;

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Discipline : " + content[1][0], 0, doc.y + 40, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    let smallTitle = {
      1: `${planet["Name"]} Guide to ${name}: `,
      2: "",
      3: `Say to ${name}: `,
    };

    for (let i = 1; i < content[1].length; i++) {
      content[1][i] = content[1][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[1][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[1].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[1][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Life Lesson : " + content[2][0], 0, doc.y + 45, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    for (let i = 1; i < content[2].length; i++) {
      content[2][i] = content[2][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[2][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[2].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[2][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }

    color = randomeColor();

    doc.font("Linotte-SemiBold").fontSize(16);

    doc.roundedRect(50, doc.y + 30, doc.page.width - 100, 50, 10).fill(color);

    doc.fillColor("#000");
    doc.text("Teach Food & Diet : " + content[4][0], 0, doc.y + 40, {
      width: doc.page.width,
      align: "center",
    });

    doc.y += 10;
    doc.font("Linotte-Regular").fontSize(14);

    smallTitle = {
      1: `${planet["Name"]} Guide to ${name}: `,
      2: "",
      3: `Say to ${name}: `,
    };

    for (let i = 1; i < content[4].length; i++) {
      content[4][i] = content[4][i]
        .replace(/child/g, name)
        .replace(/Child/g, name);
      height = doc.heightOfString(smallTitle[i] + content[4][i], {
        width: doc.page.width - 120,
        lineGap: 4,
      });

      if (i != content[4].length - 1) {
        doc.rect(50, doc.y, doc.page.width - 100, height + 10).fill(color);
      } else {
        doc
          .roundedRect(50, doc.y, doc.page.width - 100, height + 10, 10)
          .fill(color);
      }

      doc.fillColor("#000");
      doc.text(smallTitle[i] + content[4][i], 60, doc.y, {
        width: doc.page.width - 120,
        align: "justify",
        lineGap: 4,
      });
    }
  });

  newPage(doc, IMAGES, "Important Checklist for Parents");
  pages.push(pageNo);
  doc
    .roundedRect(50, doc.y + 30, doc.page.width - 100, 500, 10)
    .fillColor(randomeColor())
    .strokeColor("black")
    .fillAndStroke();

  let nakshatrasList = nakshatrasOrder
    .slice(nakshatrasOrder.indexOf(moon.nakshatra))
    .concat(nakshatrasOrder.slice(0, nakshatrasOrder.indexOf(moon.nakshatra)));

  favourableNakshatra = [];

  nakshatrasList.forEach((nakshatra, index) => {
    if ([1, 3, 9].includes(index % 9)) {
      favourableNakshatra.push(nakshatra);
    }
  });

  let luckyColor = nakshatraColor[moon.nakshatra];

  table_data = [
    ["Nakshatra:", `${moon["nakshatra"]}`],
    ["Rasi:", `${moon["sign"]}`],
    ["Lagnam:", `${asc["sign"]}`],
    ["Favorable Stars:", favourableNakshatra.join(", ")],
    ["Fortune Planets & Lord:", `${ninthHouseLord}, ${isthaDeva}`],
    [
      "Dopamine:",
      `${panchang["karana"]} - ${
        KaranaLord[panchang["karana"]]
      } for Achieve Goal`,
    ],
    [
      "Serotonin:",
      `${panchang["tithi"]} - ${
        thithiLord[panchang["tithi"]]
      } for Emotional Intelligence`,
    ],
    [
      "Oxytocin:",
      `${panchang["yoga"]} - ${
        yogamLord[panchang["yoga_index"]]
      } for Body, Mind, Soul  Transformations `,
    ],
    ["Favourable Times:", `${favourableDasa}`],
    [
      "Favourable Gem Stone:",
      `${stones[0]["Gemstone"]}, ${stones[1]["Gemstone"]}, ${stones[2]["Gemstone"]}`,
    ],
    ["Lucky Color:", luckyColor.join(", ")],
    ["Lucky Number:", luckyNumber.join(", ")],
  ];

  x = 80;
  let x1 = doc.page.width / 2 - 10;
  y = doc.y + 50;
  for (let i = 0; i < table_data.length; i++) {
    doc.font("Linotte-SemiBold").fontSize(14).fillColor("#000");
    doc.text(table_data[i][0], x, y, {
      width: doc.page.width / 2 - 80,
      align: "left",
      lineGap: 2,
    });
    doc.font("Linotte-Regular").fontSize(14).fillColor("#000");
    doc.text(table_data[i][1], x1, y, {
      width: doc.page.width / 2 - 80,
      align: "left",
      lineGap: 2,
    });
    y = doc.y + 10;
  }

  newPage(doc, IMAGES, "Famous Celebrity Comparisons");
  pages.push(pageNo);
  content = nakshatraContent[moon.nakshatra];

  x = 60;
  y = doc.y + 30;

  table_data = [["Name", "Fields", "Characteristics"]];

  for (let con of content) {
    table_data.push([
      `${con["name"]}`,
      `${con["famous"]}`,
      `${con["nakshatra"]}`,
    ]);
  }

  let width = (doc.page.width - 120) / 3;

  color = randomeColor();

  for (let index = 0; index < table_data.length; index++) {
    let row = table_data[index];
    height = doc.heightOfString(row[2], {
      width: width,
      lineGap: 4,
    });
    doc.fillColor(color).strokeColor("black");
    if (index == 0) {
      doc.roundedRect(50, y, doc.page.width - 100, 40, 10).fillAndStroke();
    } else if (index != table_data.length - 1) {
      doc.rect(50, y, doc.page.width - 100, height + 15).fillAndStroke();
    } else {
      doc
        .roundedRect(50, y, doc.page.width - 100, height + 5, 10)
        .fillAndStroke();
    }
    doc.fillColor("#000");
    doc.font("Linotte-Regular").fontSize(14);
    doc.text(row[0], x, y + 5, {
      width: width,
      align: "center",
      lineGap: 4,
    });
    x += width;
    doc.font("Linotte-Regular").fontSize(14);
    doc.text(row[1], x, y + 5, {
      width: width,
      align: "center",
      lineGap: 4,
    });
    x += width;
    doc.font("Linotte-Regular").fontSize(14);
    doc.text(row[2], x, y + 5, {
      width: width,
      align: "left",
      lineGap: 4,
    });
    x = 60;
    y = doc.y;
  }

  newPage(doc, IMAGES, `Summary Insights for Parents and ${name}`);
  pages.push(pageNo);

  content = await chapterPrompt(planets, 9, name, gender);

  let summaryTitle = {
    overall: `${name}'s Overall Astrology Summary`,
    strength: `${name}'s Strengths`,
    weakness: `${name}'s Weakness`,
    recommendations: "Recommendations for Parents",
    action: "Actions for Parents",
  };

  for (let key in content) {
    if (doc.y + 80 > doc.page.height - 100) {
      newPage(doc, IMAGES);
      doc.y = 50;
    }

    ContentDesign(
      doc,
      randomeColor(),
      summaryTitle[key],
      content[key],
      ICONS,
      name
    );
  }

  newPage(doc, IMAGES);
  doc.fillColor("#000").font("Linotte-Heavy").fontSize(32);
  doc.text("Thank You!", 0, doc.y + 80, {
    width: doc.page.width,
    align: "center",
    lineGap: 4,
  });

  doc.image(
    path.join(IMAGES, "logo.png"),
    doc.page.width / 2 - 50,
    doc.y + 20,
    {
      width: 100,
      align: "center",
    }
  );

  doc.image(path.join(IMAGES, "ending.png"), 150, doc.page.height / 2 - 100, {
    width: doc.page.width - 300,
  });

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const pageHeight = doc.page.height;

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(i + 1, 0, pageHeight - 30, {
        align: "center",
      });
  }

  doc.switchToPage(2);
  doc
    .font("Linotte-SemiBold")
    .fontSize(22)
    .fillColor("#000")
    .text(`Contents`, 60, 50, {
      align: "center",
      width: doc.page.width - 120,
    });

  doc.fontSize(16);
  y = doc.y + 20;

  context[3].forEach((item, index) => {
    if (doc.y > doc.page.height - 120) {
      doc.switchToPage(3);
      y = 60;
      doc.fontSize(16).fillColor("#000").font("Linotte-SemiBold");
    }

    const text = `${index + 1}. ${item}`
      .replace(/child/g, name)
      .replace(/Child/g, name);
    const pageNum = pages[index];
    let numberHeight = doc.widthOfString(pageNum.toString());
    height = doc.heightOfString(`${index + 1}. ${item}`, {
      width: doc.page.width - 170 - numberHeight,
      lineGap: 4,
    });

    doc.text(text, 80, y, {
      width: doc.page.width - 170 - numberHeight,
      align: "left",
      goTo: "page" + pages[index],
      lineGap: 4,
    });

    doc.text(pageNum.toString(), doc.page.width - 80 - numberHeight, y, {
      align: "right",
      width: numberHeight,
    });

    y = Math.max(doc.y, y + height) + 15;
  });

  await doc.end();
  return;
}

export const generateReport = async (
  reportPath,
  planets,
  panchang,
  dasa,
  charts,
  date,
  location,
  name,
  gender,
  input,
  email
) => {
  const outputDir = path.join(reportPath, "generated", "reports");
  try {
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

    const formatted_date = new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formatted_time = new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;
    let formatted_name = name.trim().split(" ");
    if (formatted_name.length > 1) {
      if (formatted_name[0].length <= 1) {
        formatted_name = formatted_name[1];
      } else {
        formatted_name = formatted_name[0];
      }
    } else {
      formatted_name = name;
    }

    const FONTS = path.join(reportPath, "report", "fonts");

    const font = {
      regular: path.join(FONTS, "Linotte-Regular.otf"),
      semi: path.join(FONTS, "Linotte-SemiBold.otf"),
      heavy: path.join(FONTS, "Linotte-Heavy.ttf"),
    };

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      font: path.join(FONTS, "Linotte-Regular.otf"),
      bufferPages: true,
    });

    doc.registerFont("Linotte-Regular", font.regular);
    doc.registerFont("Linotte-SemiBold", font.semi);
    doc.registerFont("Linotte-Heavy", font.heavy);
    doc.font("Linotte-Regular");

    const reports = [
      "Basic Report",
      "Pro Report",
      "Ultimate Report",
      "Master Report",
    ];

    const pdfFilename = `${name} - ${reports[input - 1]}.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);

    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.font(font.regular);
    doc.registerFont("Linotte-Regular", font.regular);
    doc.registerFont("Linotte-SemiBold", font.semi);
    doc.registerFont("Linotte-Heavy", font.heavy);

    if (input == 2) {
      await ProReport(
        doc,
        reportPath,
        planets,
        panchang,
        dasa,
        charts,
        formatted_date,
        formatted_time,
        location,
        year,
        month,
        formatted_name,
        gender,
        outputDir
      );
    } else if (input == 3) {
      await UltimateReport(
        doc,
        reportPath,
        planets,
        panchang,
        dasa,
        charts,
        formatted_date,
        formatted_time,
        location,
        year,
        month,
        formatted_name,
        gender,
        outputDir
      );
    } else if (input == 4) {
      await MasterReport(
        doc,
        reportPath,
        planets,
        panchang,
        dasa,
        charts,
        formatted_date,
        formatted_time,
        location,
        year,
        month,
        formatted_name,
        gender,
        outputDir
      );
    }

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const reportBuffer = fs.readFileSync(pdfPath);
    console.log("PDF generated size:", reportBuffer.length);

    if (reportBuffer.length < 5 * 1024 * 1024) {
      console.log("Report < 5 MB, waiting 1 minute before email...");
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    const logo = fs.readFileSync(
      path.join("public", "images", "new", "logo1.png")
    );
    const signature = fs.readFileSync(
      path.join("public", "images", "new", "logo.png")
    );

    await transporter.sendMail({
      from: {
        name: "admin@AstroKids",
        address: process.env.USER,
      },
      to: email,
      subject: `${name}'s AstroKids Report`,
      text: `Dear Parent,\n\nPlease find attached the AstroKids report for your child, ${name}.\n\nBest regards,\nAstroKids Team`,
      attachments: [
        {
          filename: `${name}_AstroKids_Report.pdf`,
          content: fs.readFileSync(pdfPath),
          contentType: "application/pdf",
        },
        {
          filename: "logo.png",
          content: logo,
          cid: "logo",
        },
        {
          filename: "signature.png",
          content: signature,
          cid: "signature",
        },
      ],
      html: `<html>
  <head>
    <meta charset="UTF-8" />
    <title>AstroKids Report</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 10px">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width: 600px;
              background-color: #ffffff;
              position: relative;
              overflow: hidden;
            "
          >
            <tr>
              <td
                style="
                  background: #ffffff;
                  padding: 30px 0;
                "
              >
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td
                      style="background-color: #210535; padding: 20px"
                    >
                      <img
                        src="cid:logo"
                        alt="Astrokids Logo"
                        style="
                          width: 180px;
                          max-width: 100%;
                          height: auto;
                          display: block;
                        "
                      />
                    </td>
                  </tr>
                </table>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="padding: 25px 20px"
                >
                  <tr>
                    <td>
                      <h1
                        style="
                          margin: 0 0 15px 0;
                          color: #000;
                          font-size: 22px;
                        "
                      >
                        Dear Parents,
                      </h1>

                      <p
                        style="
                          color: #000;
                          font-size: 15px;
                          line-height: 1.7;
                          margin-bottom: 20px;
                        "
                      >
                        We are excited to share
                        <strong>${name}</strong>'s personalized report.
                        AstroKids ensures that you receive insights with
                        accuracy and care.
                      </p>

                      <p
                        style="
                          color: #210535;
                          font-size: 15px;
                          line-height: 1.7;
                          margin-bottom: 25px;
                        "
                      >
                        Your child's report is now available. 
                      </p>

                      <p
                        style="
                          color: #210535;
                          font-size: 15px;
                          line-height: 1.7;
                          margin-top: 25px;
                        "
                      >
                        If you did not request this report or need assistance,
                        please contact our customer support immediately.
                        <br /><br />
                        Thank You,<br />
                        AstroKids Team
                      </p>
                    </td>
                  </tr>
                </table>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="padding: 25px 20px"
                >
                  <tr>
                    <td>
                      <p style="font-size: 16px; margin: 0 0 10px 0">
                        Warm Regards,
                      </p>

                      <img
                        src="cid:signature"
                        alt="Signature"
                        width="100"
                        style="display: block; margin-bottom: 10px"
                      />

                      <p style="margin: 0 0 5px 0">The AstroKids Team</p>

                      <a
                        href="mailto:support@astrokids.ai"
                        style="
                          display: block;
                          color: #210535;
                          text-decoration: none;
                          margin-bottom: 5px;
                        "
                      >
                        support@astrokids.ai
                      </a>

                      <a
                        href="https://astrokids.ai/"
                        style="
                          display: block;
                          color: #000000;
                          text-decoration: none;
                        "
                      >
                        astrokids.ai
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    });

    console.log("✔ Report sent successfully!");

    return null;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let number_words = {
  1: "First",
  2: "Second",
  3: "Third",
  4: "Fourth",
  5: "Fifth",
  6: "Sixth",
  7: "Seventh",
  8: "Eighth",
  9: "Ninth",
  10: "Tenth",
  11: "Eleventh",
  12: "Twelfth",
};

let zodiac = [
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
  "Pisces",
];

let zodiac_lord = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
];

function secondHouse(planets, shifted_signs, house) {
  let HousePLanet = planets.filter((x) => x["pos_from_asc"] == house);
  let HouseLord = planets.filter(
    (x) => x["Name"] == zodiac_lord[zodiac.indexOf(shifted_signs[house - 1])]
  )[0];
  let HouseLordPLanet = planets.filter(
    (x) => x["pos_from_asc"] == HouseLord["pos_from_asc"]
  );

  let prompt = `Child's ${number_words[house]} house is ${
    shifted_signs[house - 1]
  } `;

  if (HousePLanet.length == 1) {
    prompt += `Planet ${HousePLanet[0]["Name"]} placed in ${number_words[house]} house `;
  } else if (HousePLanet.length > 1) {
    prompt += "Planets ";
    for (let pl of HousePLanet) {
      prompt += `${pl["Name"]} `;

      if (HousePLanet.indexOf(pl) != HousePLanet.length - 1) {
        prompt += "and ";
      }
    }
    prompt += "and ";
  } else {
    prompt += "";

    prompt += `and ${number_words[house]} house Lord ${
      zodiac_lord[zodiac.indexOf(shifted_signs[house - 1])]
    } placed in ${HouseLord["pos_from_asc"]} House of ${HouseLord["sign"]} `;

    HouseLordPLanet = HouseLordPLanet.filter(
      (x) => x["Name"] != HouseLord["Name"]
    );

    if (HouseLordPLanet.length == 1) {
      prompt += `along with Planet ${HouseLordPLanet[0]["Name"]} placed in ${HouseLord["pos_from_asc"]} House of ${HouseLord["sign"]} `;
    }

    if (HouseLordPLanet.length > 1) {
      prompt += "along with Planets ";
      for (let pl of HouseLordPLanet) {
        prompt += `${pl["Name"]} `;
        if (HouseLordPLanet.indexOf(pl) != HouseLordPLanet.length - 1) {
          prompt += "and ";
        }
      }
    }
  }
  return prompt;
}

function lagnaPrompt(planets) {
  let asc = planets.filter((x) => x["Name"] == "Ascendant")[0];
  let ascLord = planets.filter((x) => x["Name"] == asc["zodiac_lord"])[0];
  let firstHousePLanet = planets.filter((x) => x["pos_from_asc"] == 1);
  let ascLordHousePLanet = planets.filter(
    (x) => x["pos_from_asc"] == ascLord["pos_from_asc"]
  );
  let prompt = `Child's lagna is ${asc["sign"]} `;

  if (firstHousePLanet.length == 2) {
    prompt += `Planet ${firstHousePLanet[0]["Name"]} placed in lagna `;
  } else if (firstHousePLanet.length > 1) {
    prompt += "Planets ";
    for (let pl of firstHousePLanet) {
      if (pl["Name"] == "Ascendant") {
        prompt += "Placed in Lagna ";
        continue;
      }
      prompt += `${pl["Name"]} `;

      if (
        firstHousePLanet.length > 2 &&
        firstHousePLanet.indexOf(pl) != firstHousePLanet.length - 1
      ) {
        prompt += "and ";
      }
    }
    prompt += "and ";

    for (let pl of firstHousePLanet) {
      if (pl["Name"] == "Ascendant") {
        continue;
      }
      prompt += `Planet ${pl["Name"]} placed in lagna `;
      if (
        firstHousePLanet.length > 2 &&
        firstHousePLanet.indexOf(pl) != firstHousePLanet.length - 1
      ) {
        prompt += "and ";
      }
    }
  } else {
    prompt += "";

    prompt += `and Lagna Lord ${ascLord["Name"]} placed in ${ascLord["pos_from_asc"]} House of ${ascLord["sign"]} in ${ascLord["nakshatra"]} Nakshatra `;

    ascLordHousePLanet = ascLordHousePLanet.filter(
      (x) => x["Name"] != ascLord["Name"]
    );

    if (ascLordHousePLanet.length == 1) {
      prompt += `along with Planet ${ascLordHousePLanet[0]["Name"]} `;
    }

    if (ascLordHousePLanet.length > 1) {
      prompt += "along with Planets ";
      for (let pl of ascLordHousePLanet) {
        if (pl["Name"] == ascLord["Name"]) {
          continue;
        }
        prompt += `${pl["Name"]} `;
        if (
          ascLordHousePLanet.length > 2 &&
          ascLordHousePLanet.indexOf(pl) != ascLordHousePLanet.length - 1
        ) {
          prompt += "and ";
        }
      }
    }
  }
  return prompt;
}

function planetPrompt(name) {
  let prompt = `The ${name["Name"]} positioned in the ${name["pos_from_asc"]} house of ${name["sign"]} in ${name["nakshatra"]} nakshatra`;

  return prompt;
}

function planetPromptWithPlanet(name, planets) {
  let planet = planets.filter(
    (x) =>
      x["pos_from_asc"] == name["pos_from_asc"] && x["Name"] != name["Name"]
  );
  let prompt = `The ${name["Name"]} positioned in the ${name["pos_from_asc"]} house of ${name["sign"]} in ${name["nakshatra"]} nakshatra`;

  if (planet.length == 0) {
    return prompt;
  } else if (planet.length == 1) {
    prompt += ` along with ${planet[0]["Name"]} `;
    return prompt;
  } else {
    prompt += " along with Planets ";
    for (let pl of planet) {
      prompt += `${pl["Name"]} `;
      if (planet.indexOf(pl) != planet.length - 1) {
        prompt += "and ";
      }
    }
    return prompt;
  }
}

function firstHouse(planets) {
  let sun = planets.filter((x) => x["Name"] == "Sun")[0];
  let moon = planets.filter((x) => x["Name"] == "Moon")[0];

  let prompt = lagnaPrompt(planets);

  prompt += ",";

  prompt += planetPrompt(sun);

  prompt += ", ";

  prompt += planetPrompt(moon);

  return prompt;
}

export async function panchangPrompt(panchang, index, name, gender) {
  let prompt = "";

  if (index == 2) {
    prompt = `${name}, who was born under the ${panchang["nakshatra"]} Nakshatra.use ${name} and ${gender} pronouns all over the content. Provide insights into ${name}'s Nakshatra characteristics, including personality traits and life path, in a short single paragraph.`;
  }

  if (index == 3) {
    prompt = `${name}, who was born under the ${panchang["yoga"]} Yogam.use ${name} and ${gender} pronouns all over the content. Provide insights into ${name}'s Yogam characteristics, including goals, spiritual growth, and overall impact, in a short single paragraph.`;
  }

  let completion = await client.responses.create({
    model: "gpt-3.5-turbo",
    max_output_tokens: 4096,
    input: prompt,
  });

  let res = completion.output_text;
  console.log(res);
  return res;
}

export async function physical(planets, index, name, gender) {
  let content;
  let functions;
  let function_call;

  if (index == 2) {
    content = `Write ${name} Physical Attributes Paragraph Insights Including ${name}'s Body Built, Face Type , Eyes, Physical Appearance, Aura ,  and write 3 Personality List ,  3 Character List , 3 behavior List Based on lagna and Lagna Lord Placements and Planet Placed in the Lagna and Write 3  Negative behavior list and explain How this Affects ${name}'s Growth ${name} ${lagnaPrompt(
      planets
    )} and Write  Practical Parenting Tips for Change  ${name}  Negative Behaviors and Support ${name} Growth Use ${name} name and ${gender} pronoun all over the content."`;

    functions = [
      {
        name: "generate_child_outer_personality_report",
        type: "function",
        description: `Generate a detailed report on Physical Attributes Paragraph Insights Including ${name}'s Body Built, Face Type , Eyes, Physical Appearance, Aura ,  and write 3 Personality List,3 Character List , 3 behavior List Based on lagna and Lagna Lord Placements and Planet Placed in the Lagna and Write 3  Negative behavior list and explain How this Affects ${name}'s Growth based on the ${name}'s lagna position.`,
        parameters: {
          type: "object",
          properties: {
            physical_attributes: {
              type: "string",
              description: `Provide insights into the ${name}'s physical attributes, including body built, face type, eyes, physical appearance, and aura, based on the ${name}'s astrological details (Lagna and Lagna Lord placements).`,
            },
            personality: {
              type: "array",
              description: `Provide 3 personality traits insights of ${name} based on Lagna and lagna lord placements and Planet Placed in the Lagna.`,
              items: {
                type: "string",
                description: `The personality trait of the ${name} based on the astrological placements in two lines.`,
              },
            },
            character: {
              type: "array",
              description: `Provide 3 character traits insights of ${name} based on Lagna and lagna lord  placements and Planet Placed in the Lagna.`,
              items: {
                type: "string",
                description: `The character trait of the ${name} based on the astrological placements in two lines.`,
              },
            },
            positive_behavior: {
              type: "array",
              description: `Provide 3 positive behavior traits insights of ${name} on Lagna and lagna lord  placements and Planet Placed in the Lagna.`,
              items: {
                type: "string",
                description: `The positive behavior trait of the ${name} based on the astrological placements in two lines.`,
              },
            },
            negative_behavior: {
              type: "array",
              description: `Provide 3 negative behavior traits insights of ${name} based on Lagna and lagna lord placements and Planet Placed in the Lagna.`,
              items: {
                type: "string",
                description: `The negative behavior trait of the ${name} based on the astrological placements in two lines.`,
              },
            },
            parenting_tips: {
              type: "string",
              description: `Write 1 Modern Result oriented Practical Parenting Tips for ${name}'s Negative Behavior Challenges and explain Parenting Tips in Detail with how to do it with Detailed guided Execution steps and write Content in simple Easy to Understand English Format.`,
            },
          },
          required: [
            "physical_attributes",
            "personality",
            "character",
            "positive_behavior",
            "negative_behavior",
            "parenting_tips",
          ],
        },
      },
    ];
    function_call = {
      name: "generate_child_outer_personality_report",
      type: "function",
    };
  } else if (index == 3) {
    let moon = planets.filter((x) => x["Name"] === "Moon")[0];
    content = `write ${name} Emotional State Insights Paragraph Including Thoughts, beliefs, Emotions  based on Moon Placements Sign and write 3 emotions,3 Feelings,3 reactions List Based on Planet Moon Placement Sign and Write 3 Negative Emotional Imbalance  and explain How this Affects ${name}'s Growth.${planetPromptWithPlanet(
      moon,
      planets
    )} and Write Ancient Result Oriented Parenting Tips for Change ${name} Negative Emotional Imbalance and Support ${name} Growth in simple Easy to Understand English Format Use ${name} and ${gender} pronouns all over the content.`;

    functions = [
      {
        name: "generate_child_inner_personality_report",
        type: "function",
        description: `Generate a detailed report on ${name} Emotional State Insights Paragraph Including Thoughts, beliefs, Emotions  based on Moon Placements Sign and write 3 emotions,3 Feelings,3 reactions List Based on Planet Moon Placement Sign and Write 3 Negative Emotional Imbalance and explain How this Affects ${name}'s Growth.`,
        parameters: {
          type: "object",
          properties: {
            emotional_state: {
              type: "string",
              description: `Write a Short paragraph detailing ${name}'s emotional state, including thoughts, beliefs, and emotions based on the Moon's placement.`,
            },
            emotions: {
              type: "array",
              description: `Provide 3 emotions traits insights experienced by based on ${name}'s Moon Sign and position.`,
              items: {
                type: "string",
                description: `The emotion trait insights experienced by the ${name} based on the Moon's placement in two lines.`,
              },
            },
            feelings: {
              type: "array",
              description: `Provide 3 feelings traits insights experienced by based on ${name} Moon Sign and position.`,
              items: {
                type: "string",
                description: `The feeling trait insights experienced by the ${name} based on the Moon's placement in two lines.`,
              },
            },
            reactions: {
              type: "array",
              description: `Provide 3 reactions traits insights experienced by based on ${name} Moon Sign and position.`,
              items: {
                type: "string",
                description: `The reaction trait insights experienced by the ${name} based on the Moon's placement in two lines.`,
              },
            },
            negative_imbalance: {
              type: "array",
              description: `Provide 3 negative emotional imbalance traits insights experienced by based on ${name} Moon Sign and position.`,
              items: {
                type: "string",
                description: `The negative emotional imbalance trait insights experienced by the ${name} based on the Moon's placement in two lines.`,
              },
            },
            parenting_tips: {
              type: "string",
              description: `Write Modern Result Oriented Practical Parenting Tips for ${name} Emotional Imbalance Challanegs Explain Parenting Tips in Detail how to do it with Detailed guided Execution steps and write Content in simple Easy to Understand English Format in single paragraph.`,
            },
          },
          required: [
            "emotional_state",
            "emotions",
            "feelings",
            "reactions",
            "negative_imbalance",
            "parenting_tips",
          ],
        },
      },
    ];

    function_call = {
      name: "generate_child_inner_personality_report",
      type: "function",
    };
  } else if (index == 4) {
    let sun = planets.filter((x) => x["Name"] === "Sun")[0];
    content = `Write ${name} Core Identity Motivations Inner Strength Ego Insights in Short Paragraph based on ${name}'s Sun Sign Placement ${planetPrompt(
      sun
    )} Write ${name}'s 3 Seek for recognitions, 3 Core Identity Based on Planet Sun Placement Sign and Write 1 Practical Parenting Tip to Change ${name}'s Core Identity Challenges for ${name} growth write parenting Tip Name How to do with Guide Write Content in Simple Easy English format Use ${name} and ${gender} Pronouns all over the content. don't change the key`;

    functions = [
      {
        name: "generate_child_core_identity_report",
        type: "function",
        description: `Generate a Detailed report on ${name}'s 3 Seek for recognitions, 3 Core Identity and write How Negative Ego Impacts child Growth Based on Planet Sun Placement Sign`,
        parameters: {
          type: "object",
          properties: {
            core_insights: {
              type: "string",
              description: `Write a short paragraph describing ${name}'s core identity, motivations, and inner strength based on the ${name}'s Sun sign and placement.`,
            },
            recognitions: {
              type: "array",
              description: `Provide 3 ${name}'s seeks for recognition, based on the ${name}'s Sun sign and placement. Write the contents in an array format.`,
              items: {
                type: "string",
                description: `Seek for recognition the based on the ${name}'s Sun placement in two lines.`,
              },
            },
            core_identity: {
              type: "array",
              description: `Provide 3 ${name}'s core identity insights, based on the ${name}'s Sun sign and placement. Write the contents in an array format.`,
              items: {
                type: "string",
                description: `The core identity insights based on the ${name}'s Sun placement in two lines.`,
              },
            },
            parenting_tips: {
              type: "string",
              description: `Write 1 Modern Practical Parenting Tip for ${name}'s Core Identity Challenges and Explain parenting Tip in Detail with how to do it with  Detailed guided Execution steps and write Content in simple Easy to Understand English Format.`,
            },
          },
        },
        required: [
          "core_insights",
          "recognitions",
          "core_identity",
          "parenting_tips",
        ],
      },
    ];

    function_call = {
      name: "generate_child_core_identity_report",
      type: "function",
    };
  }
  if (index == 5) {
    let moon = planets.filter((x) => x["Name"] === "Moon")[0];
    let nakshatraLord = planets.filter(
      (x) => x["Name"] === moon["nakshatra_lord"]
    )[0];
    let rasiLord = planets.filter((x) => x["Name"] === moon["zodiac_lord"])[0];
    let asc = planets.filter((x) => x["Name"] === "Ascendant")[0];
    let asc_index = zodiac.indexOf(asc["sign"]);
    let shifted_signs = zodiac
      .slice(asc_index)
      .concat(zodiac.slice(0, asc_index));
    content = `Create a detailed ${name}'s Family Relationships and Social Development report for a ${name} whose Child's Astrology Details: Child's Janma Nakshatra is  ${
      moon["nakshatra"]
    } Nakshatra and  Nakshatra Lord ${nakshatraLord["Name"]} placed in the ${
      nakshatraLord["pos_from_asc"]
    } House of ${nakshatraLord["sign"]} in ${
      nakshatraLord["nakshatra"]
    } Nakshatra. Child's Janma Rashi is ${
      moon["sign"]
    } Rashi and the Rashi Lord ${rasiLord["Name"]} placed in the ${
      rasiLord["pos_from_asc"]
    } House of ${rasiLord["sign"]} in ${
      rasiLord["nakshatra"]
    } Nakshatra. ${lagnaPrompt(planets)} ${secondHouse(
      planets,
      shifted_signs,
      2
    )} ${secondHouse(planets, shifted_signs, 3)} ${secondHouse(
      planets,
      shifted_signs,
      4
    )} ${secondHouse(planets, shifted_signs, 5)} ${secondHouse(
      planets,
      shifted_signs,
      6
    )} ${secondHouse(planets, shifted_signs, 7)} ${secondHouse(
      planets,
      shifted_signs,
      8
    )} ${secondHouse(planets, shifted_signs, 9)} ${secondHouse(
      planets,
      shifted_signs,
      10
    )} ${secondHouse(planets, shifted_signs, 11)} ${secondHouse(
      planets,
      shifted_signs,
      12
    )}.Use ${name} and ${gender} pronouns all over the content.`;

    functions = [
      {
        name: "generate_family_and_social_report",
        type: "function",
        description: `Write insights about the ${name}'s social development, friendship dynamics, peer interaction, and family dynamics (relationships with parents and siblings) based on the ${name}'s 11th House, 7th House, Sun (for Father), Moon (for Mother), and Venus planetary positions. Write the contents in an abstract paragraph format.`,
        parameters: {
          type: "object",
          properties: {
            family_relationship: {
              type: "string",
              description: `Write ${name}'s approaches for social development, friendship, relationship, peer interaction, and family dynamics like relationships with father, mother, siblings. based on the ${name}'s 11th House, 7th House, Sun Positions for father , Moon Position for mother , Venus for social development ). Write the content in an abstract paragraph format.`,
            },
            approaches: {
              type: "array",
              description: `Write 3 ${name}'s approaches for building relationship and social development, bonding with father based on sun Sign , bonding  mother based on moon Sign, bonding with siblings, Bonding with friends . These should be based on social development and relationship astrology (11th House, 7th House, Sun, Moon, Venus planetary placements). Write the contents in array format.`,
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the approach.",
                  },
                  content: {
                    type: "string",
                    description: "The explanation of the approach.",
                  },
                },
                required: ["title", "content"],
              },
            },
            parenting_support: {
              type: "array",
              description: `Write 3 personalized parenting support Techniques Including life skills Teachings , Nurturing Parenting Strategies, Mindful habit building that address the ${name}'s social and family relationship development challenges. Write Parenting support Technique name and How to Implement them with guided execution steps. Write the content related to parenting support.`,
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the parenting support.",
                  },
                  content: {
                    type: "string",
                    description: "The explanation of the parenting support.",
                  },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["family_relationship", "approaches", "parenting_support"],
        },
      },
    ];

    function_call = {
      name: "generate_family_and_social_report",
      type: "function",
    };
  }

  let response = await client.responses.create({
    model: "gpt-3.5-turbo",
    input: content,
    tools: functions,
    tool_choice: function_call,
  });

  let function_response = response.output[0].arguments;

  let res_json = JSON.parse(function_response);
  console.log(res_json, "\n_________________________________\n");

  return res_json;
}

export async function chapterPrompt(planets, index, name, gender) {
  let asc = planets.filter((x) => x["Name"] == "Ascendant")[0];
  let asc_index = zodiac.indexOf(asc["sign"]);
  let shifted_signs = zodiac
    .slice(asc_index)
    .concat(zodiac.slice(0, asc_index));
  let content;
  let functions;
  let function_call;

  if (index == 0) {
    let venus = planets.filter((x) => x["Name"] == "Venus")[0];
    let mars = planets.filter((x) => x["Name"] == "Mars")[0];
    let mercury = planets.filter((x) => x["Name"] == "Mercury")[0];
    content = `Create a Unique Talents Insights detailed report for a ${name}'s Astrology Details : ${planetPrompt(
      mercury
    )} ${planetPrompt(venus)} ${planetPrompt(mars)}`;

    functions = [
      {
        name: "generate_unique_talents_report",
        type: "function",
        description: `Generate a report on the ${name}'s unique strengths, highlighting natural inherent talents and abilities. The report is based on Mars, Venus, Mercury Planet Positions, house placement. Provide strategies to nurture these talents effectively, including practical suggestions for areas of growth and improvement, tailored to the ${name}'s Mars, Venus, Mercury Positions. Use ${name} and ${gender} pronouns throughout the content.`,
        parameters: {
          type: "object",
          properties: {
            education: {
              type: "array",
              description: `Identify 3 unique talents related to the ${name}'s  Mercury Positions Potential Talents along with Parenting Tips  to nurture these talents effectively . These should align with the ${name}'s Planet mercury placements . Include how these talents manifest in the ${name}'s mercury related  Natural Talents.`,
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description:
                      "The title of the talent in education and intellect.",
                  },
                  content: {
                    type: "string",
                    description: `A description of the ${name}'s natural educational talents and intellectual strengths, based on Planet Mercury Placements.`,
                  },
                },
                required: ["title", "content"],
              },
            },
            arts_creative: {
              type: "array",
              description: `Identify 3 unique talents related to the ${name}'s Venus Placements Unique Talents Natural Skills  Potentials along with Parenting Tips  to nurture these talents effectively . These should be aligned with the ${name}'s Venus  placements, particularly those involving Venus and creative house placements. Explain how these talents influence the ${name}'s Venus related Natural Talents.`,
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the creative talent.",
                  },
                  content: {
                    type: "string",
                    description: `A description of the ${name}’s natural artistic talents and creative strengths, based on Venus placements.`,
                  },
                },
                required: ["title", "content"],
              },
            },
            physical_activity: {
              type: "array",
              description: `Identify 3 unique talents related to Planet Mars Positions .These should align with the ${name}'s planet Mars placements Unique Talents & Skills  along with Parenting Tips  to nurture these talents effectively. Explain how these talents manifest in the ${name}'s Mars related natural talents.`,
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "The title of the physical talent.",
                  },
                  content: {
                    type: "string",
                    description: `A description of the ${name}’s natural physical abilities and hobbies, based on astrology.`,
                  },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["education", "arts_creative", "physical_activity"],
        },
      },
    ];
    function_call = {
      name: "generate_unique_talents_report",
      type: "function",
    };
  }

  if (index == 7) {
    let rahu = planets.filter((x) => x["Name"] == "Rahu", planets)[0];
    let ketu = planets.filter((x) => x["Name"] == "Ketu", planets)[0];
    let saturn = planets.filter((x) => x["Name"] == "Saturn", planets)[0];
    content = `Create a detailed Child's Karmic Life Lesson report for ${name} based on Saturn, Rahu, and Ketu placements in their birth chart. Saturn is placed in the ${
      number_words[saturn["pos_from_asc"]]
    } house of ${saturn["sign"]}, Rahu is placed in the ${
      number_words[rahu["pos_from_asc"]]
    } house of ${rahu["sign"]}, and Ketu is placed in the ${
      ketu["pos_from_asc"]
    } house of ${
      ketu["sign"]
    }. Use ${name} and ${gender} pronouns all over the content.`;

    functions = [
      {
        name: "generate_child_karmic_life_pattern_report",
        type: "function",
        description: `Generate a detailed report explaining ${name}'s karmic life lesson based on the placements of Saturn, Rahu, and Ketu in their birth chart, considering the house placements and their significance.`,
        parameters: {
          type: "object",
          properties: {
            child_responsibility_discipline: {
              type: "string",
              description: `Explain ${name}'s karmic life lessons Based on Saturn and Saturn Placement in the ${
                number_words[saturn["pos_from_asc"]]
              } house of ${
                saturn["sign"]
              } Sign.Explain what ${name} should avoid in life based on satrun’s karmic lessons.Write in a short paragraph.`,
            },
            child_desire_ambition: {
              type: "string",
              description: `Explain ${name}'s karmic life lessons Based on Rahu and Rahu placement in the ${
                number_words[rahu["pos_from_asc"]]
              } house of ${
                rahu["sign"]
              } Sign.Explain what ${name} should avoid in life based on Rahu's karmic lessons. Also explain ${name} purpose of life based on rahu placements. Write in a short paragraph.`,
            },
            child_spiritual_wisdom: {
              type: "string",
              description: `Explain ${name}'s karmic life lessons Based on Ketu and Ketu Placement in the ${ketu["pos_from_asc"]} house of ${ketu["sign"]} Sign.Explain what ${name} should avoid in life based on ketu’s karmic Lessons. Also explain ${name} Destiny based on ketu Placements Write in a short paragraph.`,
            },
          },
          required: [
            "child_responsibility_discipline",
            "child_desire_ambition",
            "child_spiritual_wisdom",
          ],
        },
      },
    ];

    function_call = {
      name: "generate_child_karmic_life_pattern_report",
      type: "function",
    };
  }
  if (index == 9) {
    content = `${name}'s Planetary positions : ${lagnaPrompt(
      planets
    )} ${secondHouse(planets, shifted_signs, 2)} ${secondHouse(
      planets,
      shifted_signs,
      3
    )} ${secondHouse(planets, shifted_signs, 4)} ${secondHouse(
      planets,
      shifted_signs,
      5
    )} ${secondHouse(planets, shifted_signs, 6)} ${secondHouse(
      planets,
      shifted_signs,
      7
    )} ${secondHouse(planets, shifted_signs, 8)} ${secondHouse(
      planets,
      shifted_signs,
      9
    )} ${secondHouse(planets, shifted_signs, 10)} ${secondHouse(
      planets,
      shifted_signs,
      11
    )} ${secondHouse(
      planets,
      shifted_signs,
      12
    )} Write ${name} Based on the above ${name}'s planetary Position and Horoscope Detail  Provide ${name}'s Overall  detail Life Insights and Parenting Suggestions for Nurturing ${name} with their Strength and do not give disclaimer message like i am not an astrologer Consult with professional astrologer provide only astrology Insights Contents for Parenting Suggestions use ${name} and ${gender} pronouns all over the content.`;
    functions = [
      {
        name: "generate_life_insights_report",
        type: "function",
        description: `Generate a ${name}'s detailed report providing ${name}'s overall life insights and parenting suggestions based on their planetary positions and horoscope details.`,
        parameters: {
          type: "object",
          properties: {
            overall: {
              type: "string",
              description: `Provide ${name}'s Life Insights Parenting Suggestions based on the above planetary Position and Horoscope Detail.`,
            },
            recommendations: {
              type: "string",
              description: `Provide Nurturing Child Parenting recommendations for ${name} based on the above planetary Position and Horoscope Detail.`,
            },
            action: {
              type: "string",
              description: `Provide Parenting Action Plan for ${name} based on the above planetary Position and Horoscope Detail in single paragraph.`,
            },
          },
          required: ["overall", "recommendations", "action"],
        },
      },
    ];

    function_call = { name: "generate_life_insights_report", type: "function" };
  }

  let response = await client.responses.create({
    model: "gpt-3.5-turbo",
    input: content,
    tools: functions,
    tool_choice: function_call,
  });

  let function_response = response.output[0].arguments;

  let res_json = JSON.parse(function_response);
  console.log(res_json, "\n_________________________________\n");

  return res_json;
}

export async function dasaPrompt(dateStr, planets, dasa, name, gender) {
  const year = dateStr;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const AgeDasa = [];

  let start, end;

  if (currentYear - year <= 3) {
    start = currentYear;
    end = currentYear + 5;
  } else {
    start = currentYear - 2;
    end = currentYear + 3;
  }

  for (const [dasaName, bhukthiList] of Object.entries(dasa)) {
    for (const c of bhukthiList) {
      const { start_year, end_year, end_month, bhukti } = c;

      if (
        (start <= start_year && start_year <= end) ||
        (start <= end_year && end_year <= end)
      ) {
        if (start === end_year) {
          if (end_month >= currentMonth) {
            AgeDasa.push({
              Dasa: dasaName,
              Bhukthi: bhukti,
              Age: `At ${name}'s age, Between ${start_year - dateStr} to ${
                end_year - dateStr
              }`,
            });
          }
        } else {
          AgeDasa.push({
            Dasa: dasaName,
            Bhukthi: bhukti,
            Age: `At ${name}'s age, Between ${start_year - dateStr} to ${
              end_year - dateStr
            }`,
          });
        }
      }
    }
  }

  let dataOut = [];

  for (const d of AgeDasa) {
    const dasa = planets.find((x) => x["Name"] === d["Dasa"]);
    const bhukthi = planets.find((x) => x["Name"] === d["Bhukthi"]);
    const moon = planets.find((x) => x["Name"] === "Moon");

    const content = `Write ${name}'s Dasa & Bhukti Predictions Results  Insights in Short Paragraph based on Dasa lord and Bhukthi Lord and Moon Sign ${name}'s Dasa is ${
      dasa["Name"]
    } and Bhukti is ${bhukthi["Name"]} ${planetPrompt(dasa)} and ${planetPrompt(
      bhukthi
    )} and ${name}'s Moon Sign ${
      moon["sign"]
    } Write Dasa Bhukti Prediction Insights and Write 3 Favourable Prediction and their Impacts on ${name} Life and 3 Unfavourable Predictions results and Its Impacts on ${name}'s Life  based on Dasa Lord Bhukthi Lord.Practical Parenting Strategy to Navigate ${name}'s Dasa Bukthi Unfavourable results Add Parenting Strategy name How to do it with detailed Guided Execution Steps for ${name} Unfavourable results. Use ${name} name and ${gender} pronouns all over the content.`;

    const functions = [
      {
        name: "generate_dasa_report",
        type: "function",
        description: `Generate detailed insights for the ${d["Dasa"]} Dasa and ${d["Bhukthi"]} Bhukti period based on the ${name}'s Lagna sign, Moon sign, Nakshatra, Dasa lord's position, and Bhukti lord's position in the ${name}'s birth chart.`,
        parameters: {
          type: "object",
          properties: {
            insights: {
              type: "string",
              description: `Provide short insights into ${name}'s Dasa and Bhukti predictions based on the Dasa Lord (${d["Dasa"]}), Bhukthi Lord (${d["Bhukthi"]}), and Moon sign (${moon["sign"]}).`,
            },
            favourable: {
              type: "array",
              description: `List 3 favorable predictions and explain how each will positively impact ${name}'s life`,
              items: {
                type: "string",
                description: `The favorable prediction and its impact on the ${name}'s life.`,
              },
            },
            unfavourable: {
              type: "array",
              description: `List 3 unfavorable predictions and explain how each will positively impact ${name}'s life`,
              items: {
                type: "string",
                description: `The unfavorable prediction and its impact on the ${name}'s life.`,
              },
            },
            parenting_tips: {
              type: "string",
              description: `Provide Practical Parenting Strategy to Navigate ${name}'s Dasa Bukthi Unfavourable results Add Parenting Strategy name How to do it with detailed Guided Execution Steps for ${name} Unfavourable results.in a single paragraph`,
            },
          },
          required: [
            "insights",
            "favourable",
            "unfavourable",
            "parenting_tips",
          ],
        },
      },
    ];

    const function_call = {
      name: "generate_dasa_report",
      type: "function",
    };

    let response = await client.responses.create({
      model: "gpt-3.5-turbo",
      input: content,
      tools: functions,
      tool_choice: function_call,
    });

    let function_response = response.output[0].arguments;

    let res_json = JSON.parse(function_response);

    dataOut.push({
      dasa: d["Dasa"],
      bhukthi: d["Bhukthi"],
      age: d["Age"],
      prediction: res_json,
    });
  }

  console.log(JSON.stringify(dataOut, null, 2), "\n");
  return dataOut;
}

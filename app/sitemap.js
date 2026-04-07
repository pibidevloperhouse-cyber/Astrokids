export default function sitemap() {
  const baseUrl = "https://www.astrokids.ai";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/plans`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
     // BLOG PAGES (ALL UNIQUE – CLEANED)

    { 
      url: `${baseUrl}/blogs/yoga-for-balancing-child-planetary-energy`, 
    lastModified: new Date(), 
    changeFrequency: "weekly", 
    priority: 0.9 
    },
    { 
      url: `${baseUrl}/blogs/vedic-astrology-for-child-mental-health`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/blogs/child-astrology-career-success`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/blogs/revati-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/uttara-bhadrapada-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/purva-bhadrapada-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/child-astrology-report`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.95 
    },
    { 
      url: `${baseUrl}/blogs/shatabhisha-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },

    { 
      url: `${baseUrl}/blogs/dhanishta-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/parenting-tips-for-shravana-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/uttara-ashadha-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/ardra-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/jyeshtha-child-parenting-tips`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },

    // FIXED URL (removed %20)
    { 
      url: `${baseUrl}/blogs/how-the-seven-chakras-benefit-your-childs-growth-energy`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.85 
    },

    { 
      url: `${baseUrl}/blogs/ayurvedic-remedies-for-hyperactive-kids`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/blogs/pancha-bhoota-diet-cheat-sheet`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/astrology-and-ayurveda`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/blogs/astrology-and-yoga`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.85 
    },
    { 
      url: `${baseUrl}/blogs/astrology-and-healing`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.85 
    },

    { 
      url: `${baseUrl}/blogs/krittika-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/support-child-emotions-with-astrology`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.95 
    },
    { 
      url: `${baseUrl}/blogs/astrological-tips-for-better-parenting`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.9 
    },

    { 
      url: `${baseUrl}/blogs/rohini-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/barani-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/mrigashir-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/punarvasu-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/magha-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/ashlesha-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/pushya-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/vishakha-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/mula-nakshatra-child-parenting-tips`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/anuradha-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/purva-ashadha-nakshatra-child-parenting-tips`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/chitra-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/vedic-astrology-parenting`, 
      lastModified: new Date(), 
      changeFrequency: "monthly", 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/blogs/swati-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/hasta-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/uttara-phalguni-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/blogs/purva-phalguni-nakshatra-child`, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 0.8 
    },

  ];
}

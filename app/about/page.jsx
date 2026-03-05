import AboutClientComponent from "@/components/AboutClientComponent";

const AboutPage = () => {
  return <AboutClientComponent />;
};

export const metadata = {
  title: "About AstroKids | AI-Powered Child Astrology for Parenting",
  description:
    "AstroKids combines Vedic astrology and AI technology to help parents understand their child's personality, emotional patterns and natural strengths.",
  alternates: {
    canonical: "/about",
  },
};

export default AboutPage;

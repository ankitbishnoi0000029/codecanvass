
import FinancialToolsWelcome from "@/components/calculators/list";

export async function generateMetadata() {
  return {
    title: {
      default: "AI Financial Calculators Online – EMI, SIP, GST, Tax & Loan Tools",
      template: "%s | AI Online Tools",
    },

    description:
      "Use AI-powered financial calculators online including EMI, SIP, GST, tax, and loan calculators. Get fast, accurate, and free results for smarter financial planning.",

    keywords: [
      "AI calculators",
      "financial calculator",
      "EMI calculator",
      "SIP calculator",
      "GST calculator",
      "loan calculator",
      "tax calculator",
      "online calculator tools",
      "free calculators",
    ],

    alternates: {
      canonical: "https://aionlinetoolss.com/calculators",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: "AI Financial Calculators Online – Free & Accurate Tools",
      description:
        "Calculate EMI, SIP, GST, tax, and loans instantly using AI-powered tools. Fast, free, and accurate online calculators.",
      url: "https://aionlinetoolss.com/calculators",
      siteName: "AI Online Tools",
      locale: "en_US",
      type: "website",
    }
  };
}

const page = () => {
    return (
        <FinancialToolsWelcome />
    );
}

export default page
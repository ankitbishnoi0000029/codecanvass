import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - AI Online Tools",
  description:
    "Read the privacy policy of AI Online Tools to understand how we collect and protect user data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-gray-600 mb-6">
        At AI Online Tools, we respect your privacy and are committed to
        protecting your personal information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Information We Collect
      </h2>

      <p className="text-gray-600">
        We may collect basic information such as browser type, device
        information, and anonymous usage statistics to improve our services.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Cookies
      </h2>

      <p className="text-gray-600">
        Our website may use cookies to improve user experience and analyze site
        traffic. Third-party services such as Google AdSense may also use
        cookies.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Third-Party Advertising
      </h2>

      <p className="text-gray-600">
        We may display advertisements through Google AdSense. Google may use
        cookies to show relevant ads to users based on their visits to this and
        other websites.
      </p>

    </div>
  );
}
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - AI Online Tools",
  description:
    "Contact AI Online Tools for feedback, support, or questions regarding our online developer tools.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

      <p className="text-gray-600 mb-8">
        If you have any questions, suggestions, or feedback regarding AI Online
        Tools, feel free to contact us. We are always happy to hear from users
        and improve our platform.
      </p>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Email Support</h2>

        <p className="text-gray-600">
          For inquiries or support requests, please email us at:
        </p>

        <p className="text-purple-600 font-medium mt-2">
          support@aionlinetoolss.com
        </p>
      </div>

    </div>
  );
}
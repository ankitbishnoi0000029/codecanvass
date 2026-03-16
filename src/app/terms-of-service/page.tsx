import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - AI Online Tools",
  description:
    "Terms and conditions for using AI Online Tools and its free developer utilities.",
};

export default function TermsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>

      <p className="text-gray-600 mb-6">
        By accessing and using AI Online Tools, you agree to comply with the
        following terms and conditions.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Use of Tools
      </h2>

      <p className="text-gray-600">
        Our tools are provided for general use and educational purposes. Users
        are responsible for how they use the tools and any resulting output.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Limitation of Liability
      </h2>

      <p className="text-gray-600">
        AI Online Tools will not be held responsible for any loss or damage
        resulting from the use of our services.
      </p>

    </div>
  );
}
"use client";

type QA = {
  question: string;
  answer: string;
};

interface FAQProps {
  data: QA[];
  title?: string;
}

export default function FAQList({ data }: any) {
    // console.log('FAQList data:', data);
  return (
    <section className="max-w-4xl mx-auto">


  {/* FAQ List */}
  <div className="space-y-1 py-2 bg-gray-700 px-2 rounded-xl">
    {data?.map((item :any, index:number) => (
      <div
        key={index}
        className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition"
      >
        {/* Question */}
        <h3 className="text-xs font-semibold mb-3 text-red-700 ">
          {index + 1}. {item.question}
        </h3>

        {/* Answer */}
        <p className="text-green-700 dark:text-green-800 leading-relaxed text-xs">
          {item.answer}
        </p>
      </div>
    ))}
  </div>

</section>
  );
}
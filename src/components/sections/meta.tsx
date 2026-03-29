'use client';

import React from 'react';

const Meta = ({ selectedData }: any) => {
  if (!selectedData) return null;

  /* ---------------- PARSE JSON ---------------- */
  const faq =
    typeof selectedData?.FAQ === 'string'
      ? JSON.parse(selectedData.FAQ || '[]')
      : selectedData?.FAQ || [];

  const content =
    typeof selectedData?.content === 'string'
      ? JSON.parse(selectedData.content || '[]')
      : selectedData?.content || [];

  const code =
    typeof selectedData?.code === 'string'
      ? JSON.parse(selectedData.code || '[]')
      : selectedData?.code || [];

  const description =
    selectedData?.des || '';

  const bottomDes =
    selectedData?.bottom_des || '';

  const keywords = selectedData?.keyword
    ? selectedData.keyword.split(',')
    : [];

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">

        {/* BOTTOM DESCRIPTION */}
      {bottomDes && (
        <div className="bg-gray-50 border rounded-2xl p-6 text-gray-600 leading-relaxed shadow-inner">
          {bottomDes}
        </div>
      )}


      {/* CONTENT SECTIONS */}
      <div className="grid md:grid-cols-2 gap-6">
        {content.map((item: any, i: number) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white border shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg mb-3 text-indigo-600">
              {item.heading}
            </h2>

            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              {item.content.split('\n').map((line: string, idx: number) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CODE BLOCK */}
      {code.length > 0 && (
        <div className="bg-black text-green-400 p-6 rounded-2xl shadow-lg overflow-x-auto">
          <h3 className="text-white mb-3 font-semibold">Example</h3>
          <pre className="text-sm whitespace-pre-wrap">
            {code.map((c: any) => c.code).join('\n\n')}
          </pre>
        </div>
      )}

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold mb-6">FAQs</h2>

        <div className="space-y-4">
          {faq.map((item: any, i: number) => (
            <details
              key={i}
              className="group border rounded-xl p-4 bg-white shadow"
            >
              <summary className="cursor-pointer font-medium text-gray-800 group-open:text-indigo-600">
                {item.question}
              </summary>

              <p className="mt-2 text-gray-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

    
      {/* KEYWORDS */}
      {keywords.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Keywords</h3>

          <div className="flex flex-wrap gap-2">
            {keywords.map((kw: string, i: number) => (
              <span
                key={i}
                className="rounded-full text-xs"
              >
                {kw.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Meta;
'use client';
import React, { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

interface PageData {
  tags: string;
  faqs: string;
  content: string;
  excerpt: string;
}

interface Props {
  data: PageData;
}

const ContentSection: React.FC<Props> = ({ data }) => {
  const tags: string[] = data?.tags ? JSON.parse(data.tags) : [];
  const faqs: FAQ[] = data?.faqs ? JSON.parse(data.faqs) : [];
  const [active, setActive] = useState<number | null>(0);
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Excerpt */}
      {data?.excerpt && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-[1px] shadow-xl">
          <div className="bg-white rounded-3xl p-4">
            <p className="text-md text-gray-700 leading-relaxed font-medium">{data.excerpt}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {data?.content && (
        <div className="bg-blue-100 rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
          <div
            className="
        text-gray-700 leading-relaxed text-[15px]

        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3

        [&_p]:mb-4

        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
        [&_li]:mb-1

        /* TABLE */
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
        [&_table]:overflow-hidden
        [&_th]:bg-gradient-to-r [&_th]:from-gray-50 [&_th]:to-gray-100
        [&_th]:text-left [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide
        [&_th]:font-semibold [&_th]:p-3 [&_th]:border-b

        [&_td]:p-3 [&_td]:border-b [&_td]:text-sm
        [&_tr:hover]:bg-gray-50

        /* TABLE SCROLL (mobile fix) */
        [&_table]:block [&_table]:overflow-x-auto

        /* CODE BLOCK */
        [&_pre]:bg-[#0f172a] 
        [&_pre]:text-gray-100 
        [&_pre]:p-5 
        [&_pre]:rounded-2xl 
        [&_pre]:overflow-x-auto 
        [&_pre]:my-6
        [&_pre]:shadow-lg

        /* INLINE CODE */
        [&_code]:text-[13px] 
        [&_code]:bg-gray-100 
        [&_code]:px-1.5 
        [&_code]:py-0.5 
        [&_code]:rounded-md

        /* PRE CODE (inside block) */
        [&_pre_code]:bg-transparent 
        [&_pre_code]:p-0 
        [&_pre_code]:text-gray-100
      "
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      )}

     

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h3>
            <p className="text-gray-500 mt-2 text-sm">
              Everything you need to know about this tool
            </p>
          </div>

          {/* FAQ List */}
          {faqs.length > 0 && (
            <div className="max-w-3xl mx-auto py-12">
              {/* Outer Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6 px-2">FAQs</h2>

                <div className="space-y-4">
                  {faqs.map((faq, i) => {
                    const isOpen = active === i;

                    return (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all"
                      >
                        {/* Question */}
                        <button
                          onClick={() => setActive(isOpen ? null : i)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                          <span className="text-base md:text-md font-medium text-gray-900">
                            {faq.question}
                          </span>

                          <span
                            className={`ml-4 transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-indigo-600' : 'text-gray-400'
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        {/* Inner Card (Answer) */}
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="px-4 pb-4">
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-600 text-sm md:text-base leading-relaxed">
                                {faq.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
       {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border">
          <h3 className="text-xl font-semibold mb-5 text-gray-800">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-indigo-100 hover:to-purple-100 text-gray-700 rounded-full transition-all cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSection;

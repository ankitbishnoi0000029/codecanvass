'use client';

import { ArrowDownUp } from 'lucide-react';
import React from 'react';

interface PageRendererProps {
  data: any;
}

const isEmpty = (val: any) => {
  return (
    val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)
  );
};

// ✅ IMAGE HANDLER (BASE64 + URL + FALLBACK)
const getImageSrc = (img: string) => {
  if (!img) return '/no-image.png';

  if (typeof img !== 'string') return '/no-image.png';

  // ✅ base64 image
  if (img.startsWith('data:image')) return img;

  // ✅ valid URL
  if (img.startsWith('http') || img.startsWith('/')) return img;

  // ❌ invalid
  return '/no-image.png';
};

const Card = ({ children }: any) => (
  <div className="bg-white dark:bg-zinc-900 shadow-md rounded-2xl p-5 border border-gray-100 dark:border-zinc-800">
    {children}
  </div>
);

const PageRenderer: React.FC<PageRendererProps> = ({ data} ) => {
  const [listedData, setListedData] = React.useState(data.data);
  console.log('Rendering page with listedData => ', listedData);
  if (!listedData) {
    return <div className="text-center py-10 text-gray-500">No listedData found 🚫</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* 📝 Title */}
      {!isEmpty(listedData.title) && (
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          {listedData.title}
        </h2>
      )}
      {/* 📌 Excerpt */}
      {!isEmpty(listedData.excerpt) && (
        <Card>
          <p className="text-gray-600 dark:text-gray-300 italic">{listedData.excerpt}</p>
        </Card>
      )}
      {/* 🖼️ Featured Image */}
      {!isEmpty(listedData.featured_image) && (
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={getImageSrc(listedData.featured_image)}
            alt={listedData.title || 'featured image'}
            className="w-full object-cover hover:scale-105 transition duration-300"
            onError={(e: any) => {
              e.target.src = '/no-image.png';
            }}
          />
        </div>
      )}

      {/* 📄 Content */}
      {!isEmpty(listedData.content) && (
        <Card>
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: listedData.content }}
          />
        </Card>
      )}

      {/* 🏷️ Tags */}
      {!isEmpty(listedData.tags) && (
        <Card>
          <div className="flex flex-wrap gap-2">
            {(() => {
              let tagsArray: string[] = [];

              if (typeof listedData.tags === 'string') {
                try {
                  // ✅ अगर JSON string है
                  if (listedData.tags.startsWith('[')) {
                    tagsArray = JSON.parse(listedData.tags);
                  } else {
                    // ✅ normal comma string
                    tagsArray = listedData.tags.split(',');
                  }
                } catch (err) {
                  // fallback
                  tagsArray = listedData.tags.split(',');
                }
              } else if (Array.isArray(listedData.tags)) {
                tagsArray = listedData.tags;
              }

              return tagsArray
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs  text-gray-700 rounded-full hover:scale-105 transition"
                  >
                    {tag}
                  </span>
                ));
            })()}
          </div>
        </Card>
      )}
      {/* ❓ FAQs */}
      {/* ❓ FAQs */}
      {/* ❓ FAQs */}
      {!isEmpty(listedData.faqs) && (
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {(() => {
              let faqArray: any[] = [];

              try {
                if (typeof listedData.faqs === 'string') {
                  faqArray = JSON.parse(listedData.faqs);
                } else if (Array.isArray(listedData.faqs)) {
                  faqArray = listedData.faqs;
                }
              } catch (err) {
                console.error('FAQ parse error:', err);
                return null;
              }

              return faqArray
                .filter((faq) => faq?.question && faq?.answer)
                .map((faq, index) => (
                  <details
                    key={index}
                    className="group border border-gray-200 dark:border-zinc-700 rounded-xl p-4 cursor-pointer transition hover:shadow-md"
                  >
                    <summary className="font-medium text-gray-800 dark:text-white flex justify-between items-center">
                      {faq.question}
                      <span className="ml-2 transition group-open:rotate-180">
                        <ArrowDownUp size={18} className="text-gray-500" />
                      </span>
                    </summary>

                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </details>
                ));
            })()}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PageRenderer;

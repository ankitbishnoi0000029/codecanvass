import React from "react";

const posts = [
  {
    id: 1,
    title: "How to Learn Next.js Fast",
    desc: "A beginner-friendly guide to mastering Next.js quickly.",
    image: "https://source.unsplash.com/600x400/?coding",
    date: "March 10, 2026",
  },
  {
    id: 2,
    title: "Top 10 JavaScript Tips",
    desc: "Boost your JS skills with these powerful tips.",
    image: "https://source.unsplash.com/600x400/?javascript",
    date: "March 12, 2026",
  },
  {
    id: 3,
    title: "React vs Next.js",
    desc: "Understand the difference and when to use each.",
    image: "https://source.unsplash.com/600x400/?reactjs",
    date: "March 15, 2026",
  },
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Blog</h1>
        <p className="text-gray-600 mt-2">
          Latest articles and updates
        </p>
      </div>

      {/* Blog Grid */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 sm:grid-cols-2 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-5">
              <p className="text-sm text-gray-400">{post.date}</p>
              <h2 className="text-xl font-semibold mt-2 text-gray-800">
                {post.title}
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                {post.desc}
              </p>

              <button className="mt-4 text-blue-600 font-medium hover:underline">
                Read More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
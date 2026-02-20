"use client";

import { useState } from "react";

export default function Home() {
    const [url, setUrl] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleFetch = async () => {
        if (!url) return alert("Enter video URL");

        setLoading(true);

        const res = await fetch("/api/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
        });

        const data = await res.json();
        setResult(data);
        setLoading(false);
        console.log(res)
    };


    return (
        <div className="min-h-screen bg-gradient-to-r from-teal-500 to-blue-600 p-6">
            <h1 className="text-3xl text-white text-center font-bold mb-6">
                Free Online All Video Downloader
            </h1>

            <div className="flex justify-center mb-6">
                <input
                    className="w-1/2 p-3 rounded-l-lg"
                    placeholder="Paste YouTube / Instagram / TikTok / Facebook URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    onClick={handleFetch}
                    className="bg-green-500 text-white px-6 rounded-r-lg"
                >
                    {loading ? "Loading..." : "Download"}
                </button>
            </div>

            {result && (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                    <img src={result.thumbnail} className="w-full rounded mb-4" />
                    <h2 className="font-bold mb-2">{result.title}</h2>

                    {result && result.formats && result.formats.length > 0 && (
                        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                            <img src={result.thumbnail} className="w-full rounded mb-4" />
                            <h2 className="font-bold mb-2">{result.title}</h2>

                            {result.formats.map((f: any, i: number) => (
                                <div key={i} className="flex justify-between border p-3 mb-2 rounded">
                                    <span>{f.quality}</span>
                                    <a
                                        href={f.url}
                                        target="_blank"
                                        className="bg-green-500 text-white px-4 py-1 rounded"
                                    >
                                        Download
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

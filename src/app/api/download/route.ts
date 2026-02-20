import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req: Request) {
    const { url } = await req.json();

    console.log("URL:", url);

    return new Promise<Response>((resolve) => {
        const yt = spawn("yt-dlp", ["-J", url]);

        let output = "";
        let errorOutput = "";

        yt.stdout.on("data", (data) => {
            output += data.toString();
        });

        yt.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        yt.on("close", (code) => {
            if (code !== 0) {
                console.log("YT ERROR:", errorOutput);
                resolve(
                    NextResponse.json({
                        error: errorOutput || "yt-dlp failed",
                    })
                );
                return;
            }

            try {
                const json = JSON.parse(output);

                resolve(
                    NextResponse.json({
                        title: json.title,
                        thumbnail: json.thumbnail,
                        formats: json.formats
                            ?.filter((f: any) => f.ext === "mp4")
                            ?.slice(0, 5)
                            ?.map((f: any) => ({
                                quality: f.format_note || f.format,
                                url: f.url,
                            })),
                    })
                );
            } catch (err) {
                console.log("PARSE ERROR:", err);
                resolve(
                    NextResponse.json({ error: "JSON parse error" })
                );
            }
        });
    });
}

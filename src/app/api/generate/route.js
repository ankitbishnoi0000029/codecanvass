import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return Response.json({
      result: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}
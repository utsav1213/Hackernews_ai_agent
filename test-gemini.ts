import * as dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

(async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Write a tweet about JavaScript" }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 256,
        },
      }),
    });
    const text = await res.text();
    console.log(text);
})();

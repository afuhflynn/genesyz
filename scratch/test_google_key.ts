import "dotenv/config";

async function testKey() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log(`Testing Gemini API key: ${key ? key.substring(0, 10) + "..." : "undefined"}`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }],
      }),
    });
    
    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Fetch failed:", err.message || err);
  }
}

testKey();

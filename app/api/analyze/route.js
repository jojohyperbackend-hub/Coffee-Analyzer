

import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, image_url, coffee_type, brew_method } = body;

    if (!user_id || !image_url || !coffee_type || !brew_method) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1️⃣ Vision API
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { source: { imageUri: image_url } },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
            },
          ],
        }),
      }
    );

    const visionData = await visionRes.json();
    const labels =
      visionData.responses?.[0]?.labelAnnotations?.map((l) => l.description) ||
      [];

    // 2️⃣ Combine & analyze with AI
    const prompt = `
      Gambar ini berisi label: ${labels.join(", ")}.
      Jenis kopi: ${coffee_type}.
      Metode seduh: ${brew_method}.
      Perkirakan kadar kafein (mg per 100ml) berdasarkan data umum kopi.
      Berikan hasil numerik dan ringkasan singkat.
    `;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const aiText = aiData?.choices?.[0]?.message?.content || "No response";

    const match = aiText.match(/(\d+(\.\d+)?)\s*mg/i);
    const caffeine_mg_per_100ml = match ? parseFloat(match[1]) : null;

    // Simpan hasil ke Supabase
    const { error } = await supabase.from("coffee_estimations").insert([
      {
        user_id,
        image_url,
        coffee_type,
        brew_method,
        vision_result: labels.join(", "),
        ai_analysis: aiText,
        caffeine_mg_per_100ml,
      },
    ]);

    if (error) throw error;

    return Response.json({
      success: true,
      caffeine_mg_per_100ml,
      ai_analysis: aiText,
      vision_result: labels,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

//test
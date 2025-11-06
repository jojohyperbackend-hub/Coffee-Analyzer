"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CameraScan() {
  const [imageFile, setImageFile] = useState(null);
  const [jenisKopi, setJenisKopi] = useState("");
  const [caraSeduh, setCaraSeduh] = useState("");
  const [deskripsiManual, setDeskripsiManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [coffeeMemory, setCoffeeMemory] = useState([]); // 🧠 memory RAG

  // 🧠 Ambil histori kopi dari Supabase (context learning)
  useEffect(() => {
    const fetchCoffeeMemory = async () => {
      const { data, error } = await supabase
        .from("coffee_estimations")
        .select("jenis_kopi, cara_seduh, hasil_analisis")
        .order("id", { ascending: false })
        .limit(5); // ambil 5 terakhir aja biar gak terlalu panjang
      if (!error && data) setCoffeeMemory(data);
    };
    fetchCoffeeMemory();
  }, []);

  // ✅ File handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageFile(file);
      setMessage("");
    } else {
      setMessage("Format file harus .jpg, .png, atau .webp");
    }
  };

  // ✅ Kirim ke GPT-4o-mini dengan konteks memory
  const analyzeWithAI = async (promptText) => {
    try {
      const contextKnowledge = coffeeMemory
        .map(
          (c, i) => `# Data Kopi Sebelumnya #${i + 1}
☕ Jenis: ${c.jenis_kopi}
🧾 Seduh: ${c.cara_seduh}
📋 Analisis: ${c.hasil_analisis}`
        )
        .join("\n\n");

      const finalPrompt = `
Kamu adalah "Coffee Expert AI" yang sudah mempelajari berbagai hasil analisis kopi dari database pengguna.

Gunakan informasi historis di bawah ini untuk memperkaya pemahamanmu, tapi tetap analisis kopi baru secara mandiri.

${contextKnowledge}

---
# Data Kopi Baru
${promptText}
---

Buat jawaban dengan format elegan markdown seperti ChatGPT, penuh empati, gaya coffee professional:
- Gunakan heading (##)
- Gunakan emoji sesuai konteks
- Beri saran alat, rasio, suhu, dan grind size terbaik
- Tutup dengan insight reflektif yang berkelas ☕✨
`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: "Kamu adalah Coffee Expert AI profesional." },
            { role: "user", content: finalPrompt },
          ],
        }),
      });

      const data = await res.json();
      const result =
        data?.choices?.[0]?.message?.content ||
        "❌ Tidak ada respons dari model.";
      setAiOutput(result);
    } catch (err) {
      console.error("AI Error:", err);
      setAiOutput("❌ Gagal memproses analisis AI.");
    }
  };

  // ✅ Upload + Analisis
  const handleUpload = async () => {
    try {
      if (!jenisKopi.trim() && !caraSeduh.trim() && !deskripsiManual.trim()) {
        return setMessage("Isi minimal salah satu field sebelum analisis!");
      }

      setLoading(true);
      setMessage("☕ Sedang memproses... harap tunggu...");

      let publicUrl = null;

      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("coffee-uploads")
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("coffee-uploads")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;

        await supabase.from("coffee_estimations").insert([
          {
            image_url: publicUrl,
            jenis_kopi: jenisKopi,
            cara_seduh: caraSeduh,
            hasil_analisis: "Menunggu hasil AI...",
          },
        ]);
      }

      const promptText = `
📸 Gambar: ${publicUrl || "Tidak ada"}
☕ Jenis Kopi: ${jenisKopi || "Tidak diisi"}
🧾 Cara Seduh: ${caraSeduh || "Tidak diisi"}
📝 Catatan Manual: ${deskripsiManual || "Tidak ada"}
`;

      await analyzeWithAI(promptText);
      setMessage("✅ Analisis selesai!");
    } catch (err) {
      console.error("Upload Error:", err);
      setMessage(`❌ Gagal upload: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const bubbles = aiOutput
    ? aiOutput.split(/\n{2,}/).map((section, i) => (
        <div
          key={i}
          className={`relative mb-3 p-4 rounded-2xl max-w-[90%] ${
            i % 2 === 0
              ? "bg-gradient-to-br from-amber-50 via-white to-amber-100 self-start shadow-[0_4px_15px_rgba(255,193,7,0.25)]"
              : "bg-gradient-to-br from-white via-amber-50 to-white self-end shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
          } border border-amber-100 backdrop-blur-md transition-transform transform hover:scale-[1.02]`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {section.trim()}
          </ReactMarkdown>
        </div>
      ))
    : null;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#fffaf0] via-[#fff7ed] to-[#fdfdfd] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] w-full max-w-2xl mx-auto mt-10 border border-amber-100 backdrop-blur-md">
      <h2 className="text-3xl font-extrabold mb-6 text-amber-800 drop-shadow-sm">
        Coffee Expert AI ☕
      </h2>

      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={handleFileChange}
        className="mb-4 text-sm w-full border border-amber-200 rounded-xl p-2 bg-white/80 shadow-inner"
      />

      <input
        type="text"
        placeholder="Jenis Kopi (misal: Arabika Gayo)"
        value={jenisKopi}
        onChange={(e) => setJenisKopi(e.target.value)}
        className="w-full mb-3 p-3 border border-amber-200 rounded-xl shadow-inner focus:ring-2 focus:ring-amber-400"
      />

      <input
        type="text"
        placeholder="Cara Seduh (misal: V60, Tubruk, Espresso)"
        value={caraSeduh}
        onChange={(e) => setCaraSeduh(e.target.value)}
        className="w-full mb-3 p-3 border border-amber-200 rounded-xl shadow-inner focus:ring-2 focus:ring-amber-400"
      />

      <textarea
        placeholder="Deskripsi manual kopi (opsional)..."
        value={deskripsiManual}
        onChange={(e) => setDeskripsiManual(e.target.value)}
        className="w-full mb-4 p-3 border border-amber-200 rounded-xl shadow-inner h-32 resize-none focus:ring-2 focus:ring-amber-400"
      ></textarea>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
      >
        {loading ? "☕ Sedang menganalisis..." : "Analisis Sekarang"}
      </button>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-700 font-medium">
          {message}
        </p>
      )}

      {aiOutput && (
        <div className="mt-8 w-full flex flex-col gap-2 items-stretch overflow-y-auto max-h-[500px] p-4 bg-white/60 border border-amber-100 rounded-3xl shadow-inner backdrop-blur-sm">
          <div className="sticky top-0 bg-amber-600 text-white text-sm px-4 py-1 rounded-full shadow-md self-center mb-3">
            ☕ AI Response
          </div>
          {bubbles}
        </div>
      )}
    </div>
  );
}

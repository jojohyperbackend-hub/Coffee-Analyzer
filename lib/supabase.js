// lib/supabase.js
// Supabase helpers: init client, upload, insert, and fetch user data

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image to Supabase bucket.
 * Returns public URL of uploaded file.
 */
export async function uploadImage(file, userId) {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("coffee-uploads")
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("coffee-uploads")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

/**
 * Save caffeine analysis result to DB.
 */
export async function saveCaffeineResult({
  user_id,
  image_url,
  coffee_type,
  brew_method,
  vision_result,
  ai_analysis,
  caffeine_mg_per_100ml,
}) {
  const { error } = await supabase.from("coffee_estimations").insert([
    {
      user_id,
      image_url,
      coffee_type,
      brew_method,
      vision_result,
      ai_analysis,
      caffeine_mg_per_100ml,
    },
  ]);

  if (error) throw error;
  return true;
}

/**
 * Fetch caffeine history by Firebase UID.
 */
export async function getUserHistory(user_id) {
  const { data, error } = await supabase
    .from("coffee_estimations")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

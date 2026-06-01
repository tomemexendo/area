import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  console.log("CHEGOU NA API")

  console.log("ENV TEST:", {
    url: process.env.SUPABASE_URL,
    key: !!process.env.SUPABASE_ANON_KEY
  })

  return res.status(200).json({ ok: true })
}

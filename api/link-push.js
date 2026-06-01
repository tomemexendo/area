import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { user_id, player_id } = req.body

    console.log("RECEBIDO:", { user_id, player_id })

    if (!user_id || !player_id) {
      return res.status(400).json({ error: "Missing data" })
    }

    const { error } = await supabase
      .from("user_devices")
      .upsert({
        user_id,
        onesignal_player_id: player_id,
        status: "active",
        updated_at: new Date()
      })

    if (error) {
      console.error("SUPABASE ERROR:", error)
      return res.status(500).json(error)
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("API ERROR:", err)
    return res.status(500).json({ error: "Internal error" })
  }
}

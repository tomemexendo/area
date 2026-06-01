export default function handler(req, res) {
  console.log("API OK - SEM SUPABASE")

  return res.status(200).json({
    ok: true
  })
}

export default function handler(req, res) {
  console.log("API FUNCIONOU")

  return res.status(200).json({
    ok: true,
    message: "API rodando"
  })
}

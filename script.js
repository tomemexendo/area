import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://pxpojetrshxvtaznkxkj.supabase.co/rest/v1/"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cG9qZXRyc2h4dnRhem5reGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODgxMDYsImV4cCI6MjA5MzE2NDEwNn0.ClFcL_dtAvdBQdrqZUlDi2CnhGEH_wbATrmxjJhpYYs"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
async function login() {
  const nome = document.getElementById("nome").value.toLowerCase().trim()
  const codigo = document.getElementById("codigo").value

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("name", nome)
    .eq("phone", codigo)
    .single()

  if (error || !data) {
    alert("Usuário não encontrado")
    return
  }

  localStorage.setItem("user", JSON.stringify(data))

  document.getElementById("login").style.display = "none"
  document.getElementById("app").classList.remove("hidden")

  document.getElementById("userName").innerText = data.name
  document.getElementById("userName2").innerText = data.name

  loadContent()
}

function logout() {
  location.reload()
}
async function loadContent() {
  const { data, error } = await supabase.from("contents").select("*")

  if (error) {
    console.log(error)
    return
  }

  data.forEach(item => {
    const buttons = document.querySelectorAll("button")

    buttons.forEach(btn => {
      if (btn.innerText.toLowerCase().includes(item.title?.toLowerCase())) {
        btn.onclick = () => window.open(item.link, "_blank")
      }
    })
  })
}
async function loadContent() {
  const { data, error } = await supabase
    .from('content')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  // transforma em mapa rápido
  const contentMap = {}
  data.forEach(item => {
    contentMap[item.type] = item
  })

  return contentMap
}

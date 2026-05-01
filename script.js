console.log("SCRIPT CARREGOU")
console.log("LOGIN EXISTE?", typeof login)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = "https://pxpojetrshxvtaznkxkj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cG9qZXRyc2h4dnRhem5reGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODgxMDYsImV4cCI6MjA5MzE2NDEwNn0.ClFcL_dtAvdBQdrqZUlDi2CnhGEH_wbATrmxjJhpYYs"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acento
}

let contentData = {}

async function login() {
  const nome = document.getElementById("nome").value.trim()
  const codigo = document.getElementById("codigo").value.trim()

  const { data, error } = await supabase
    .from("users")
    .select("*")
   const { data, error } = await supabase
  .from("users")
  .select("*")

const user = data?.find(u =>
  normalizeText(u.name) === nome &&
  u.phone === codigo
)

  console.log("LOGIN RESULT:", data, error)

  if (error || !data) {
    alert("Usuário não encontrado")
    return
  }

  if (!data.name) {
    alert("Erro no usuário")
    return
  }

  localStorage.setItem("user", JSON.stringify(data))

  document.getElementById("login").style.display = "none"
  document.getElementById("app").classList.remove("hidden")

  document.getElementById("userName").innerText = data.name
  document.getElementById("userName2").innerText = data.name

  await loadContent()
  renderDashboard()
}

function logout() {
  location.reload()
}

async function loadContent() {
  const { data, error } = await supabase
    .from("content")
    .select("*")

  if (error) {
    console.error(error)
    return {}
  }

  const map = {}

  data.forEach(item => {
    map[item.type] = item
  })

  contentData = map
}

function renderDashboard() {
  const bind = (id, key) => {
    const el = document.getElementById(id)
    if (!el) return

    el.onclick = () => {
      if (contentData[key]?.link) {
        window.open(contentData[key].link, "_blank")
      }
    }
  }

  bind("diet_60", "diet_60")
  bind("diet_90", "diet_90")
  bind("diet_120", "diet_120")
  bind("diet_plus", "diet_plus")
  bind("home_workout", "home_workout")
  bind("gym_workout", "gym_workout")
  bind("challenge", "challenge")
  bind("ranking", "ranking")
  bind("rotine", "rotine")
  bind("whatsapp", "whatsapp")
}

/* expor funções */
window.login = login
window.logout = logout

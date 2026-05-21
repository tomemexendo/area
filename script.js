import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = "https://pxpojetrshxvtaznkxkj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cG9qZXRyc2h4dnRhem5reGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODgxMDYsImV4cCI6MjA5MzE2NDEwNn0.ClFcL_dtAvdBQdrqZUlDi2CnhGEH_wbATrmxjJhpYYs"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/* ---------------- NORMALIZAÇÃO ---------------- */
function normalizeText(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/* ---------------- ESTADO ---------------- */
let contentData = {}

/* ---------------- LOGIN ---------------- */
async function login() {
  const nome = normalizeText(document.getElementById("nome").value)
  const codigo = document.getElementById("codigo").value.trim()

  const { data, error } = await supabase
    .from("users")
    .select("*")

  console.log("USERS:", data)

  const user = data?.find(u =>
    normalizeText(u.name) === nome &&
    String(u.phone).trim() === codigo
  )

  console.log("USER FOUND:", user)

  if (error || !user) {
    alert("Usuário não encontrado")
    return
  }

  localStorage.setItem("user", JSON.stringify(user))

  document.getElementById("login").style.display = "none"
  document.getElementById("app").classList.remove("hidden")

  document.getElementById("userName").innerText = user.name
  document.getElementById("userName2").innerText = user.name

  await loadContent()
  renderDashboard()
}

/* ---------------- LOGOUT ---------------- */
function logout() {
  localStorage.removeItem("user")
  location.reload()
}

/* ---------------- CONTENT ---------------- */
async function loadContent() {
  const { data, error } = await supabase
    .from("content")
    .select("*")

  if (error) {
    console.error(error)
    return
  }

  const map = {}

  data.forEach(item => {
    map[item.type] = item
  })

  contentData = map
}

/* ---------------- DASHBOARD ---------------- */
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
  bind("diario", "diario")
  bind("whatsapp", "whatsapp")
}

/* ---------------- EXPOR FUNÇÕES PRO HTML ---------------- */
window.login = login
window.logout = logout

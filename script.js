import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://pxpojetrshxvtaznkxkj.supabase.co"
const SUPABASE_ANON_KEY = "SUA_CHAVE_AQUI"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let contentData = {}

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

  const contentMap = {}

  data.forEach(item => {
    contentMap[item.type] = item
  })

  contentData = contentMap
}

async function renderDashboard() {
  document.getElementById("diet_60").onclick = () => {
    if (contentData.diet_60?.link) {
      window.open(contentData.diet_60.link, "_blank")
    }
  }

  document.getElementById("diet_90").onclick = () => {
    if (contentData.diet_90?.link) {
      window.open(contentData.diet_90.link, "_blank")
    }
  }

  document.getElementById("diet_120").onclick = () => {
    if (contentData.diet_120?.link) {
      window.open(contentData.diet_120.link, "_blank")
    }
  }

  document.getElementById("diet_plus").onclick = () => {
    if (contentData.diet_plus?.link) {
      window.open(contentData.diet_plus.link, "_blank")
    }
  }

  document.getElementById("home_workout").onclick = () => {
    if (contentData.home_workout?.link) {
      window.open(contentData.home_workout.link, "_blank")
    }
  }

  document.getElementById("gym_workout").onclick = () => {
    if (contentData.gym_workout?.link) {
      window.open(contentData.gym_workout.link, "_blank")
    }
  }

  document.getElementById("challenge").onclick = () => {
    if (contentData.challenge?.link) {
      window.open(contentData.challenge.link, "_blank")
    }
  }

  document.getElementById("ranking").onclick = () => {
    if (contentData.ranking?.link) {
      window.open(contentData.ranking.link, "_blank")
    }
  }

  document.getElementById("rotine").onclick = () => {
    if (contentData.rotine?.link) {
      window.open(contentData.rotine.link, "_blank")
    }
  }

  document.getElementById("whatsapp").onclick = () => {
    if (contentData.whatsapp?.link) {
      window.open(contentData.whatsapp.link, "_blank")
    }
  }
}

/* 🔥 ESSENCIAL: expor funções pro HTML */
window.login = login
window.logout = logout

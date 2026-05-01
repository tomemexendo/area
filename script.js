import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const SUPABASE_URL = "https://pxpojetrshxvtaznkxkj.supabase.co/rest/v1/"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cG9qZXRyc2h4dnRhem5reGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODgxMDYsImV4cCI6MjA5MzE2NDEwNn0.ClFcL_dtAvdBQdrqZUlDi2CnhGEH_wbATrmxjJhpYYs"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
function login() {
  const nome = document.getElementById("nome").value
  const codigo = document.getElementById("codigo").value

  if (!nome || codigo.length !== 4) {
    alert("Preencha corretamente")
    return
  }

  document.getElementById("login").classList.add("hidden")
  document.getElementById("app").classList.remove("hidden")

  document.getElementById("userName").innerText = nome
  document.getElementById("userName2").innerText = nome
}

function logout() {
  location.reload()
}

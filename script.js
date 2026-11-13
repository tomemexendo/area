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


/* ---------------- ONESIGNAL ---------------- */

async function syncOneSignal(user) {

  try {

    if (!window.OneSignal) return

    const playerId = OneSignal.User.PushSubscription.id
    const notificationsEnabled =
      OneSignal.User.PushSubscription.optedIn

    if (!playerId) return

    const { error } = await supabase
      .from("user_devices")
      .upsert({
        user_id: user.id,
        onesignal_player_id: playerId,
        status: "active",
        notifications_enabled: notificationsEnabled,
        updated_at: new Date()
      })

    if (error) {
      console.log("Erro sync OneSignal:", error)
    }

  } catch (e) {

    console.log("Erro sync:", e)

  }

}


/* ---------------- LOGIN ---------------- */

async function login() {

  const nome = normalizeText(
    document.getElementById("nome").value
  )

  const codigo =
    document.getElementById("codigo").value.trim()


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


  localStorage.setItem(
    "user",
    JSON.stringify(user)
  )


  /* ONE SIGNAL */

  try {

    if (window.OneSignal && user?.id) {

      OneSignal.login(String(user.id))

      syncNotifications(user)

    }

  } catch (e) {

    console.log("OneSignal erro:", e)

  }


  /* REGISTRA ACESSO */

  await supabase
    .from("access_logs")
    .insert([{
      user_name: user.name,
      user_phone: user.phone
    }])


  console.log("Acesso registrado")


  /* MOSTRA APP */

  document.getElementById("login").style.display = "none"

  document
    .getElementById("app")
    .classList
    .remove("hidden")


  document
    .getElementById("userName")
    .innerText = user.name


  document
    .getElementById("userName2")
    .innerText = user.name


  /* CARREGA CONTEÚDO */

  await loadContent()

  renderDashboard()

  setupNavigation()

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

    const el =
      document.getElementById(id)


    if (!el) return


    el.onclick = () => {

      if (contentData[key]?.link) {

        window.open(
          contentData[key].link,
          "_blank"
        )

      } else {

        console.log(
          "Link não configurado:",
          key
        )

      }

    }

  }


  /* ========================= */
  /* DIETA */
  /* ========================= */

  bind("diet_60", "diet_60")
  bind("diet_90", "diet_90")
  bind("diet_120", "diet_120")
  bind("diet_plus", "diet_plus")

  bind("breakfast", "breakfast")
  bind("lunch", "lunch")
  bind("dessert", "dessert")
  bind("afternoon_snack", "afternoon_snack")
  bind("dinner", "dinner")

  bind("binge_eating", "binge_eating")
  bind("rotine","rotine")

  bind("diet_help", "whatsapp")


  /* ========================= */
  /* TREINO */
  /* ========================= */

  bind("home_workout", "home_workout")
  bind("gym_workout", "gym_workout")
  bind("quick_workouts", "quick_workouts")
  bind("extra_classes", "extra_classes")

  bind("workout_help", "whatsapp")


  /* ========================= */
  /* DESAFIO */
  /* ========================= */

  bind("explication", "explication")
  bind("incentive_group2", "incentive_group")
  bind("challenge", "challenge")
  bind("ranking", "ranking")
  bind("metas", "metas")
  bind("diario", "diario")
  bind("support2", "whatsapp")


  /* ========================= */
  /* EXTRAS */
  /* ========================= */

  bind("incentive_group", "incentive_group")
  bind("notice_group", "notice_group")
  bind("influencer", "influencer")
  bind("support", "whatsapp")
  bind("sac", "sac")


  /* ========================= */
  /* ACESSO RÁPIDO DA HOME */
  /* ========================= */

  bind("home_diario", "diario")
  bind("home_whatsapp", "whatsapp")


  /* ========================= */
  /* NOTIFICAÇÕES */
  /* ========================= */

  const pushBtn =
    document.getElementById("enablePush")


  if (pushBtn) {

    pushBtn.onclick = enablePush

  }

}


/* ---------------- NAVEGAÇÃO ---------------- */

function setupNavigation() {

  const sections = [

    "homeSection",
    "dietaSection",
    "treinoSection",
    "desafioSection",
    "extrasSection"

  ]


  function showSection(sectionId) {

    sections.forEach(id => {

      const section =
        document.getElementById(id)


      if (!section) return


      if (id === sectionId) {

        section
          .classList
          .remove("hidden")

      } else {

        section
          .classList
          .add("hidden")

      }

    })


    window.scrollTo({

      top: 0,
      behavior: "smooth"

    })

  }


  /* ========================= */
  /* MENU PRINCIPAL */
  /* ========================= */

  document
    .getElementById("menu_dieta")
    ?.addEventListener("click", () => {

      showSection("dietaSection")

    })


  document
    .getElementById("menu_treino")
    ?.addEventListener("click", () => {

      showSection("treinoSection")

    })


  document
    .getElementById("menu_desafio")
    ?.addEventListener("click", () => {

      showSection("desafioSection")

    })


  document
    .getElementById("menu_extras")
    ?.addEventListener("click", () => {

      showSection("extrasSection")

    })


  /* ========================= */
  /* VOLTAR */
  /* ========================= */

  document
    .getElementById("backFromDieta")
    ?.addEventListener("click", () => {

      showSection("homeSection")

    })


  document
    .getElementById("backFromTreino")
    ?.addEventListener("click", () => {

      showSection("homeSection")

    })


  document
    .getElementById("backFromDesafio")
    ?.addEventListener("click", () => {

      showSection("homeSection")

    })


  document
    .getElementById("backFromExtras")
    ?.addEventListener("click", () => {

      showSection("homeSection")

    })


  /* ========================= */
  /* COMEÇA NA HOME */
  /* ========================= */

  showSection("homeSection")

}


/* ---------------- ONE SIGNAL ---------------- */

async function syncNotifications(user) {

  try {

    if (!window.OneSignal || !user?.id) {

      return

    }


    let playerId = null

    let tentativas = 0


    while (!playerId && tentativas < 5) {

      playerId =
        OneSignal.User.PushSubscription.id


      if (!playerId) {

        await new Promise(
          resolve => setTimeout(resolve, 500)
        )

      }


      tentativas++

    }


    const notificationsEnabled =
      OneSignal.User.PushSubscription.optedIn


    console.log(
      "SYNC PLAYER:",
      playerId
    )


    console.log(
      "SYNC NOTIFICAÇÃO:",
      notificationsEnabled
    )


    if (!playerId) {

      return

    }


    const { error } = await supabase
      .from("user_devices")
      .upsert({

        user_id: user.id,

        onesignal_player_id:
          playerId,

        status: "active",

        notifications_enabled:
          notificationsEnabled,

        updated_at:
          new Date()

      })


    if (error) {

      console.log(
        "Erro sync:",
        error
      )

    }


  } catch (err) {

    console.log(
      "Erro sincronização:",
      err
    )

  }

}


/* ---------------- ATIVAR NOTIFICAÇÕES ---------------- */

async function enablePush() {

  try {

    console.log(
      "BOTÃO CLICADO"
    )


    const permission =
      await OneSignal
        .Notifications
        .requestPermission()


    console.log(
      "PERMISSÃO:",
      permission
    )


    if (
      permission === "denied" ||
      Notification.permission === "denied"
    ) {

      showBlockedMessage()

      return

    }


    /* espera OneSignal registrar */

    setTimeout(async () => {


      const playerId =
        OneSignal
          .User
          .PushSubscription
          .id


      const notificationsEnabled =
        OneSignal
          .User
          .PushSubscription
          .optedIn


      console.log(
        "NOTIFICAÇÕES ATIVAS:",
        notificationsEnabled
      )


      console.log(
        "PLAYER ID:",
        playerId
      )


      if (!playerId) {

        console.log(
          "Ainda não gerou playerId"
        )

        return

      }


      /* salva local */

      localStorage.setItem(
        "onesignal_player_id",
        playerId
      )


      const user =
        JSON.parse(
          localStorage.getItem("user")
        )


      if (!user) {

        console.log(
          "Usuário não encontrado"
        )

        return

      }


      /* salva no Supabase */

      const { error } =
        await supabase
          .from("user_devices")
          .upsert({

            user_id:
              user.id,

            onesignal_player_id:
              playerId,

            status:
              "active",

            notifications_enabled:
              notificationsEnabled,

            updated_at:
              new Date()

          })


      if (error) {

        console.log(
          "Erro Supabase:",
          error
        )

        return

      }


      alert(
        "INCENTIVO ATIVADO 🔔"
      )


    }, 1500)


  } catch (err) {

    console.error(
      "Erro push:",
      err
    )

  }

}


/* ---------------- BLOQUEIO DE NOTIFICAÇÕES ---------------- */

function showBlockedMessage() {

  const msg =
    document.getElementById(
      "pushBlockedMsg"
    )


  if (msg) {

    msg
      .classList
      .remove("hidden")

  }

}


/* ---------------- EXPOR FUNÇÕES PRO HTML ---------------- */

window.login = login
window.logout = logout

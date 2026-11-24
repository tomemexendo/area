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

  await carregarEscadaConstancia(user)

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
    "extrasSection",
    "aulasBibliotecaSection",
    "bibliotecaExtrasSection",
    "escadaSection"
  ]

  function showSection(sectionId) {
    sections.forEach(id => {
      const section = document.getElementById(id)
      if (!section) return

      if (id === sectionId) {
        section.classList.remove("hidden")
      } else {
        section.classList.add("hidden")
      }
    })

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  /* MENU PRINCIPAL */

  document.getElementById("menu_dieta")?.addEventListener("click", () => {
    showSection("dietaSection")
  })

  document.getElementById("menu_treino")?.addEventListener("click", () => {
    showSection("treinoSection")
  })

  document.getElementById("menu_desafio")?.addEventListener("click", () => {
    showSection("desafioSection")
  })

  document.getElementById("menu_extras")?.addEventListener("click", () => {
    showSection("extrasSection")
  })

  /* AULAS EXTRAS (PLANILHA) */

  document.getElementById("extra_classes")?.addEventListener("click", async () => {
    showSection("aulasBibliotecaSection")
    await carregarPlanilhaAulas()
    renderizarModalidades()
  })

  document.getElementById("backFromBiblioteca")?.addEventListener("click", () => {
    document.getElementById("searchAulasInput").value = ""
    if (modalidadeSelecionada) {
      renderizarModalidades()
    } else {
      showSection("treinoSection")
    }
  })

  document.getElementById("searchAulasInput")?.addEventListener("input", (e) => {
    if (modalidadeSelecionada) {
      renderizarListaAulas(e.target.value)
    } else {
      renderizarModalidades(e.target.value)
    }
  })

  document.getElementById("btn_biblioteca_extras")?.addEventListener("click", async () => {
    showSection("bibliotecaExtrasSection");
    await carregarPlanilhaExtras();
    renderizarBibliotecaExtras();
  });

  document.getElementById("backFromBibliotecaExtras")?.addEventListener("click", () => {
    document.getElementById("searchBibliotecaExtrasInput").value = "";
    showSection("extrasSection");
  });

  document.getElementById("searchBibliotecaExtrasInput")?.addEventListener("input", (e) => {
    renderizarBibliotecaExtras(e.target.value);
  });

  document.getElementById("btn_abrir_escada")?.addEventListener("click", () => {
    showSection("escadaSection");
  });

  document.getElementById("backFromEscada")?.addEventListener("click", () => {
    showSection("extrasSection");
  });

  /* VOLTAR */

  document.getElementById("backFromDieta")?.addEventListener("click", () => {
    showSection("homeSection")
  })

  document.getElementById("backFromTreino")?.addEventListener("click", () => {
    showSection("homeSection")
  })

  document.getElementById("backFromDesafio")?.addEventListener("click", () => {
    showSection("homeSection")
  })

  document.getElementById("backFromExtras")?.addEventListener("click", () => {
    showSection("homeSection")
  })

  /* COMEÇA NA HOME */

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



const PLANILHA_AULAS_CSV_URL = "https://docs.google.com/spreadsheets/d/1Zl8fF-3FM-ONv4wEVUmAYPqynrouOX5AoOKwTws6cBo/gviz/tq?tqx=out:csv&sheet=BASE_APP";

const ICONES_MODALIDADES = {
  "GLOBAL": "🔥", "SEM IMPACTO": "👟", "HIIT": "⚡", "PERNA+GLUTEO": "🍑",
  "SUPERIORES": "💪", "GAP": "🦵", "CARDIO": "❤️‍🔥", "RITBOX": "👊",
  "ABDÔMEN": "🧱", "ALONGAMENTO": "🧘‍♀️", "PILATES": "🌿", "ZUMBA": "💃",
  "FITDANCE": "🎶", "VACUUM": "🌬️", "YOGA": "🕉️", "STEP": "🪜",
  "GLOBAL MOVE": "🏃‍♀️", "SUPRA MOVE": "🚀", "BALLET FIT": "🩰"
};

let modalidadesData = [];
let modalidadeSelecionada = null;

async function carregarPlanilhaAulas() {
  if (modalidadesData.length > 0) return;
  const container = document.getElementById("modalidadesContainer");
  container.innerHTML = `<p style="grid-column:1/-1; text-align:center;">Carregando aulas...</p>`;

  try {
    const res = await fetch(PLANILHA_AULAS_CSV_URL);
    const csv = await res.text();

    // Se o Google devolveu HTML (planilha restrita), avisa na tela
    if (csv.trim().startsWith("<!DOCTYPE") || csv.trim().startsWith("<html")) {
      container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#dc2626;">A planilha ainda está restrita. Mude o compartilhamento para "Qualquer pessoa com o link".</p>`;
      return;
    }

    const linhas = csv.split(/\r?\n/).map(l =>
      l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, "").trim())
    );

    // Encontra automaticamente a linha onde começa "GLOBAL"
    const linhaCabecalhoIdx = linhas.findIndex(l =>
      l.some(cel => cel.toUpperCase() === "GLOBAL")
    );

    if (linhaCabecalhoIdx === -1) {
      container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#dc2626;">Não encontrei a coluna GLOBAL na aba BASE_APP.</p>`;
      return;
    }

    const cabecalho = linhas[linhaCabecalhoIdx];
    const resultado = [];

    for (let col = 0; col < cabecalho.length; col += 2) {
      const nome = cabecalho[col];
      if (!nome) continue;

      const aulas = [];
      for (let row = linhaCabecalhoIdx + 1; row < linhas.length; row++) {
        const codigo = linhas[row][col] || "";
        const link = linhas[row][col + 1] || "";
        if (codigo && link.startsWith("http")) {
          aulas.push({ codigo, link });
        }
      }

      resultado.push({
        nome,
        icone: ICONES_MODALIDADES[nome.toUpperCase()] || "🏋️‍♀️",
        aulas
      });
    }

    modalidadesData = resultado;
  } catch (err) {
    console.error("Erro planilha:", err);
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#dc2626;">Erro de conexão ao carregar aulas.</p>`;
  }
}

function renderizarModalidades(filtro = "") {
  modalidadeSelecionada = null;
  document.getElementById("bibliotecaMainTitle").innerText = "💃🏻🧘🏻 AULAS EXTRAS";
  document.getElementById("backFromBiblioteca").innerText = "← VOLTAR";
  const search = document.getElementById("searchAulasInput");
  search.placeholder = "Buscar modalidade (ex: HIIT, Pilates, Zumba)...";

  const modContainer = document.getElementById("modalidadesContainer");
  const aulasContainer = document.getElementById("aulasListaContainer");
  modContainer.classList.remove("hidden");
  aulasContainer.classList.add("hidden");

  const filtradas = modalidadesData.filter(m =>
    normalizeText(m.nome).includes(normalizeText(filtro))
  );

  modContainer.innerHTML = filtradas.map(m => `
    <button class="modalidade-card" onclick="abrirModalidade('${m.nome}')">
      <span class="modalidade-icon">${m.icone}</span>
      <span class="modalidade-nome">${m.nome}</span>
      <span class="modalidade-count">${m.aulas.length} aulas</span>
    </button>
  `).join("");
}

function abrirModalidade(nome) {
  const mod = modalidadesData.find(m => m.nome === nome);
  if (!mod) return;
  modalidadeSelecionada = mod;
  document.getElementById("bibliotecaMainTitle").innerText = `${mod.icone} ${mod.nome}`;
  document.getElementById("backFromBiblioteca").innerText = "← VOLTAR PARA MODALIDADES";
  const search = document.getElementById("searchAulasInput");
  search.value = "";
  search.placeholder = `Buscar aula em ${mod.nome}...`;

  document.getElementById("modalidadesContainer").classList.add("hidden");
  document.getElementById("aulasListaContainer").classList.remove("hidden");
  renderizarListaAulas();
}

function renderizarListaAulas(filtro = "") {
  if (!modalidadeSelecionada) return;
  const aulasContainer = document.getElementById("aulasListaContainer");
  const filtradas = modalidadeSelecionada.aulas.filter(a =>
    normalizeText(a.codigo).includes(normalizeText(filtro))
  );

  aulasContainer.innerHTML = filtradas.length
    ? filtradas.map(a => `
        <div class="aula-row">
          <div class="aula-row-info">
            <span class="aula-row-code">Aula ${a.codigo}</span>
            <span class="aula-row-mod">${modalidadeSelecionada.nome}</span>
          </div>
          <a href="${a.link}" target="_blank" rel="noopener noreferrer" class="btn-assistir-aula">▶ ASSISTIR</a>
        </div>
      `).join("")
    : `<p style="text-align:center;">Nenhuma aula com link cadastrado nesta modalidade ainda.</p>`;
}

window.abrirModalidade = abrirModalidade;



const PLANILHA_EXTRAS_CSV_URL = "https://docs.google.com/spreadsheets/d/1Zl8fF-3FM-ONv4wEVUmAYPqynrouOX5AoOKwTws6cBo/gviz/tq?tqx=out:csv&sheet=BIBLIOTECA_EXTRAS";

let bibliotecaExtrasData = [];

async function carregarPlanilhaExtras() {
  if (bibliotecaExtrasData.length > 0) return;
  const container = document.getElementById("bibliotecaExtrasListaContainer");
  container.innerHTML = `<p style="text-align:center;">Carregando conteúdos...</p>`;

  try {
    const res = await fetch(PLANILHA_EXTRAS_CSV_URL);
    const csv = await res.text();

    if (csv.trim().startsWith("<!DOCTYPE") || csv.trim().startsWith("<html")) {
      container.innerHTML = `<p style="text-align:center; color:#dc2626;">A planilha está restrita. Mude o compartilhamento para "Qualquer pessoa com o link".</p>`;
      return;
    }

    const linhas = csv.split(/\r?\n/).map(l =>
      l.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, "").trim())
    );

    const resultado = [];
    // Começa na linha 1 (pula o cabeçalho NOME / LINK)
    for (let row = 1; row < linhas.length; row++) {
      const nome = linhas[row][0] || "";
      const link = linhas[row][1] || "";
      if (nome && link.startsWith("http")) {
        resultado.push({ nome, link });
      }
    }

    bibliotecaExtrasData = resultado;
  } catch (err) {
    console.error("Erro planilha extras:", err);
    container.innerHTML = `<p style="text-align:center; color:#dc2626;">Erro ao carregar conteúdos.</p>`;
  }
}

function renderizarBibliotecaExtras(filtro = "") {
  const container = document.getElementById("bibliotecaExtrasListaContainer");
  const filtrados = bibliotecaExtrasData.filter(item =>
    normalizeText(item.nome).includes(normalizeText(filtro))
  );

  container.innerHTML = filtrados.length
    ? filtrados.map(item => `
        <div class="aula-row">
          <div class="aula-row-info">
            <span class="aula-row-code">${item.nome}</span>
          </div>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="btn-assistir-aula">ver vídeo ▶️</a>
        </div>
      `).join("")
    : `<p style="text-align:center;">Nenhum conteúdo encontrado.</p>`;
}



/* ---------------- INSTALAR APP (IPHONE / ANDROID) ---------------- */

function detectarSistemaOperacional() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    return "iphone";
  }
  return "android";
}

function selecionarAbaSO(so) {
  const tabIphone = document.getElementById("tabIphone");
  const tabAndroid = document.getElementById("tabAndroid");
  const instIphone = document.getElementById("instrucoesIphone");
  const instAndroid = document.getElementById("instrucoesAndroid");

  if (so === "iphone") {
    tabIphone.classList.add("active");
    tabAndroid.classList.remove("active");
    instIphone.classList.remove("hidden");
    instAndroid.classList.add("hidden");
  } else {
    tabAndroid.classList.add("active");
    tabIphone.classList.remove("active");
    instAndroid.classList.remove("hidden");
    instIphone.classList.add("hidden");
  }
}

function abrirModalInstalarApp() {
  selecionarAbaSO(detectarSistemaOperacional());
  document.getElementById("modalInstalarApp")?.classList.remove("hidden");
}

function fecharModalInstalarApp() {
  document.getElementById("modalInstalarApp")?.classList.add("hidden");
}

// Esconde o botão flutuante se a aluna já abriu pelo app instalado na tela inicial
if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
  document.getElementById("btnInstalarAppFloat")?.classList.add("hidden");
}

window.abrirModalInstalarApp = abrirModalInstalarApp;
window.fecharModalInstalarApp = fecharModalInstalarApp;
window.selecionarAbaSO = selecionarAbaSO;


/* =========================================================
   ESCADA DA CONSTÂNCIA (EDITÁVEL ATÉ 23H59)
========================================================= */

const ESCADA_NIVEIS = [
  { nivel: 1, titulo: "Degrau 1", metaTexto: "1 refeição do cardápio por dia", refeicoesReq: 1, treinosSemReq: 0, proxMeta: "2 refeições do cardápio/dia" },
  { nivel: 2, titulo: "Degrau 2", metaTexto: "2 refeições do cardápio por dia", refeicoesReq: 2, treinosSemReq: 0, proxMeta: "3 refeições do cardápio/dia" },
  { nivel: 3, titulo: "Degrau 3", metaTexto: "3 refeições do cardápio por dia", refeicoesReq: 3, treinosSemReq: 0, proxMeta: "4 refeições do cardápio/dia" },
  { nivel: 4, titulo: "Degrau 4", metaTexto: "4 refeições do cardápio por dia", refeicoesReq: 4, treinosSemReq: 0, proxMeta: "4 refeições/dia + 1 treino/semana" },
  { nivel: 5, titulo: "Degrau 5", metaTexto: "4 refeições/dia + 1 treino na semana", refeicoesReq: 4, treinosSemReq: 1, proxMeta: "4 refeições/dia + 2 treinos/semana" },
  { nivel: 6, titulo: "Degrau 6", metaTexto: "4 refeições/dia + 2 treinos na semana", refeicoesReq: 4, treinosSemReq: 2, proxMeta: "Constância Master concluída! 🏆" }
];

let escadaEstado = null;

function getDataHojeISO() {
  const agora = new Date();
  const offset = agora.getTimezoneOffset() * 60000;
  return new Date(agora - offset).toISOString().split("T")[0];
}

function formatarDataBR(isoStr) {
  const [ano, mes, dia] = isoStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function calcularDiffDias(dataInicioStr, dataFimStr) {
  const d1 = new Date(dataInicioStr + "T00:00:00");
  const d2 = new Date(dataFimStr + "T00:00:00");
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

async function carregarEscadaConstancia(user) {
  if (!user?.id) return;
  const hojeStr = getDataHojeISO();

  let { data, error } = await supabase
    .from("escada_constancia")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data && !error) {
    const novo = {
      user_id: user.id,
      nivel_atual: 1,
      data_inicio_nivel: hojeStr,
      data_inicio_ciclo: hojeStr,
      dias_validos_ciclo: 0,
      treinos_semana_1: 0,
      treinos_semana_2: 0,
      historico_checkins: []
    };
    const res = await supabase.from("escada_constancia").insert(novo).select().single();
    data = res.data;
  }

  if (!data) return;

  let mudou = false;
  let feedback = "";

  // 1. Regra de 90 dias (3 meses estagnada -> desce 1 degrau)
  const diasNoNivel = calcularDiffDias(data.data_inicio_nivel, hojeStr);
  if (diasNoNivel >= 90 && data.nivel_atual > 1) {
    data.nivel_atual -= 1;
    data.data_inicio_nivel = hojeStr;
    data.data_inicio_ciclo = hojeStr;
    data.dias_validos_ciclo = 0;
    data.treinos_semana_1 = 0;
    data.treinos_semana_2 = 0;
    feedback = "Voltamos 1 degrau para você retomar no seu ritmo com leveza! 💜";
    mudou = true;
  }

  // 2. Fechamento do ciclo de 14 dias
  const diasNoCiclo = calcularDiffDias(data.data_inicio_ciclo, hojeStr);
  const infoNivel = ESCADA_NIVEIS[data.nivel_atual - 1];
  const bateuTreinos =
    data.treinos_semana_1 >= infoNivel.treinosSemReq &&
    data.treinos_semana_2 >= infoNivel.treinosSemReq;

  if (diasNoCiclo >= 14) {
    if (data.dias_validos_ciclo >= 11 && bateuTreinos) {
      if (data.nivel_atual < 6) {
        data.nivel_atual += 1;
        data.data_inicio_nivel = hojeStr;
        feedback = `🎉 Parabéns! Você subiu para o Degrau ${data.nivel_atual}!`;
      } else {
        feedback = "🏆 Você manteve a Constância Master por mais 2 semanas!";
      }
    } else {
      feedback = "Você manteve seu degrau! Vamos repetir essas 2 semanas para consolidar.";
    }
    data.data_inicio_ciclo = hojeStr;
    data.dias_validos_ciclo = 0;
    data.treinos_semana_1 = 0;
    data.treinos_semana_2 = 0;
    mudou = true;
  }

  if (mudou) {
    await supabase.from("escada_constancia").update(data).eq("user_id", user.id);
  }

  escadaEstado = data;

  const btnSalvar = document.getElementById("btnSalvarEscada");
  if (btnSalvar) {
    btnSalvar.onclick = () => salvarCheckinEscada(user);
  }

  
function renderizarEscadaUI(feedback = "") {
  if (!escadaEstado) return;

  const hojeStr = getDataHojeISO();
  const infoNivel = ESCADA_NIVEIS[escadaEstado.nivel_atual - 1];
  const diaAtualCiclo = Math.min(14, calcularDiffDias(escadaEstado.data_inicio_ciclo, hojeStr) + 1);
  const diasRestantesCiclo = Math.max(0, 14 - diaAtualCiclo);
  const diasFaltamSubir = Math.max(0, 11 - escadaEstado.dias_validos_ciclo);

  document.getElementById("escadaDataHoje").innerText = `📅 Hoje: ${formatarDataBR(hojeStr)}`;
  document.getElementById("escadaCicloInfo").innerText = `Dia ${diaAtualCiclo} de 14 • Restam ${diasRestantesCiclo} dia(s) neste ciclo`;
  document.getElementById("escadaBadgeNivel").innerText = `Degrau ${escadaEstado.nivel_atual}/6`;

  // 1. Desenha os 6 degraus gráficos
  const degrausContainer = document.getElementById("escadaDegrausVisual");
  degrausContainer.innerHTML = ESCADA_NIVEIS.map(item => {
    const isAtual = item.nivel === escadaEstado.nivel_atual;
    const isConcluido = item.nivel < escadaEstado.nivel_atual;
    const classe = isAtual ? "atual" : isConcluido ? "concluido" : "futuro";
    const altura = item.nivel * 13 + 14;

    return `
      <div class="escada-degrau-col">
        ${isAtual ? `<span class="escada-voce-tag">VOCÊ</span>` : ""}
        <div class="escada-degrau-bar ${classe}" style="height:${altura}px;">
          ${item.nivel}
        </div>
      </div>
    `;
  }).join("");

  // 2. Meta atual em super destaque
  document.getElementById("escadaMetaAtualTexto").innerText = infoNivel.metaTexto;

  const faltamEl = document.getElementById("escadaFaltamTexto");
  if (diasFaltamSubir > 0) {
    faltamEl.innerText = `⏳ Faltam ${diasFaltamSubir} dia(s) válido(s) para subir de degrau`;
  } else {
    faltamEl.innerText = `🔥 Meta de 11 dias atingida! Continue firme até fechar o ciclo`;
  }

  let progTexto = `Concluídos neste ciclo: ${escadaEstado.dias_validos_ciclo}/11 dias válidos`;
  if (infoNivel.treinosSemReq > 0) {
    progTexto += ` • Treinos: Sem 1 (${escadaEstado.treinos_semana_1}/${infoNivel.treinosSemReq}) | Sem 2 (${escadaEstado.treinos_semana_2}/${infoNivel.treinosSemReq})`;
  }
  document.getElementById("escadaProgressoTexto").innerText = progTexto;
  document.getElementById("escadaProxMetaTexto").innerHTML = `Próximo degrau: <strong>${infoNivel.proxMeta}</strong>`;

  // 3. Garante caixinhas limpas (ou preenche SOMENTE o que já foi salvo hoje)
  const registroHoje = (escadaEstado.historico_checkins || []).find(item => item.data === hojeStr);
  document.getElementById("chkCafe").checked = registroHoje ? Boolean(registroHoje.cafe) : false;
  document.getElementById("chkAlmoco").checked = registroHoje ? Boolean(registroHoje.almoco) : false;
  document.getElementById("chkLanche").checked = registroHoje ? Boolean(registroHoje.lanche) : false;
  document.getElementById("chkJantar").checked = registroHoje ? Boolean(registroHoje.jantar) : false;
  document.getElementById("escadaTreinouHoje").checked = registroHoje ? Boolean(registroHoje.treino) : false;

  const btnSalvar = document.getElementById("btnSalvarEscada");
  btnSalvar.innerText = registroHoje ? "ATUALIZAR CHECK-IN DE HOJE" : "SALVAR CHECK-IN DE HOJE";

  // 4. Mapa de todos os 6 níveis
  const mapaContainer = document.getElementById("escadaMapaNiveis");
  if (mapaContainer) {
    mapaContainer.innerHTML = ESCADA_NIVEIS.map(item => {
      const isAtual = item.nivel === escadaEstado.nivel_atual;
      const isConcluido = item.nivel < escadaEstado.nivel_atual;
      const classe = isAtual ? "atual" : isConcluido ? "concluido" : "";
      const statusHtml = isAtual
        ? `<span class="escada-mapa-status" style="color:#ff1493;">📍 ATUAL</span>`
        : isConcluido
          ? `<span class="escada-mapa-status" style="color:#39ff14;">✅ FEITO</span>`
          : `<span class="escada-mapa-status" style="color:#64748b;">🔒 Sem. ${(item.nivel - 1) * 2 + 1}-${item.nivel * 2}</span>`;

      return `
        <div class="escada-mapa-item ${classe}">
          <div class="escada-mapa-info">
            <strong>Degrau ${item.nivel}</strong>
            <span>${item.metaTexto}</span>
          </div>
          ${statusHtml}
        </div>
      `;
    }).join("");
  }

  // 5. Histórico dos últimos 7 dias registrados
  const histContainer = document.getElementById("escadaHistoricoLista");
  if (histContainer) {
    const ultimos = [...(escadaEstado.historico_checkins || [])].reverse().slice(0, 7);
    histContainer.innerHTML = ultimos.length
      ? ultimos.map(h => `
          <div class="escada-hist-row">
            <span>
              <strong>${formatarDataBR(h.data)}</strong> • ${h.refeicoes}/4 refeições ${h.treino ? "• 💪 Treinou" : ""}
            </span>
            <span class="escada-hist-badge ${h.valido ? "ok" : "parcial"}">
              ${h.valido ? "✅ Meta batida" : "Parcial"}
            </span>
          </div>
        `).join("")
      : `<p style="font-size:12px; color:#94a3b8; margin:0; text-align:center;">Nenhum dia registrado ainda. Comece marcando hoje acima!</p>`;
  }

  const feedbackEl = document.getElementById("escadaFeedbackMsg");
  if (feedback) {
    feedbackEl.innerText = feedback;
    feedbackEl.classList.remove("hidden");
  }
}

async function salvarCheckinEscada(user) {
  const hojeStr = getDataHojeISO();
  if (!escadaEstado) return;

  const infoNivel = ESCADA_NIVEIS[escadaEstado.nivel_atual - 1];
  const cafe = document.getElementById("chkCafe").checked;
  const almoco = document.getElementById("chkAlmoco").checked;
  const lanche = document.getElementById("chkLanche").checked;
  const jantar = document.getElementById("chkJantar").checked;
  const treinouHoje = document.getElementById("escadaTreinouHoje").checked;

  const totalRefeicoes = [cafe, almoco, lanche, jantar].filter(Boolean).length;
  const diaValido = totalRefeicoes >= infoNivel.refeicoesReq;
  const diaDoCiclo = calcularDiffDias(escadaEstado.data_inicio_ciclo, hojeStr);

  // Verifica se já havia um registro de hoje para recalcular sem duplicar
  const historicoSemHoje = (escadaEstado.historico_checkins || []).filter(item => item.data !== hojeStr);
  const registroAnteriorHoje = (escadaEstado.historico_checkins || []).find(item => item.data === hojeStr);

  let diasValidos = escadaEstado.dias_validos_ciclo;
  if (registroAnteriorHoje?.valido) diasValidos -= 1;
  if (diaValido) diasValidos += 1;

  let tSem1 = escadaEstado.treinos_semana_1;
  let tSem2 = escadaEstado.treinos_semana_2;

  if (registroAnteriorHoje?.treino) {
    if (diaDoCiclo < 7) tSem1 = Math.max(0, tSem1 - 1);
    else tSem2 = Math.max(0, tSem2 - 1);
  }
  if (treinouHoje) {
    if (diaDoCiclo < 7) tSem1 += 1;
    else tSem2 += 1;
  }

  const bateuTreinos = tSem1 >= infoNivel.treinosSemReq && tSem2 >= infoNivel.treinosSemReq;

  let novoNivel = escadaEstado.nivel_atual;
  let novaDataNivel = escadaEstado.data_inicio_nivel;
  let novaDataCiclo = escadaEstado.data_inicio_ciclo;
  let msg = "";

  // Sobe na hora se já atingiu 11+ dias válidos e os treinos semanais a partir do 11º dia
  if (diasValidos >= 11 && bateuTreinos && diaDoCiclo >= 10) {
    if (novoNivel < 6) {
      novoNivel += 1;
      novaDataNivel = hojeStr;
      msg = `🎉 Meta batida! Você subiu para o Degrau ${novoNivel}!`;
    } else {
      msg = "🏆 Constância Master mantida!";
    }
    novaDataCiclo = hojeStr;
    diasValidos = 0;
    tSem1 = 0;
    tSem2 = 0;
  } else {
    msg = diaValido
      ? `✅ Salvo! (${totalRefeicoes}/4 refeições) — Dia válido contado na escada!`
      : `✅ Salvo! (${totalRefeicoes}/4 refeições) — Você pode atualizar até 23h59 se fizer mais refeições hoje.`;
  }

  const novoHistoricoCompleto = [...historicoSemHoje, novoRegistroHoje].sort((a, b) =>
    a.data.localeCompare(b.data)
  );

  const payload = {
    nivel_atual: novoNivel,
    data_inicio_nivel: novaDataNivel,
    data_inicio_ciclo: novaDataCiclo,
    dias_validos_ciclo: diasValidos,
    treinos_semana_1: tSem1,
    treinos_semana_2: tSem2,
    ultimo_checkin: hojeStr,
    historico_checkins: novoHistoricoCompleto
  };

  const { data, error } = await supabase
    .from("escada_constancia")
    .update(payload)
    .eq("user_id", user.id)
    .select()
    .single();

  if (!error && data) {
    escadaEstado = {
      ...data,
      historico_checkins: novoHistoricoCompleto
    };
    renderizarEscadaUI(msg);
  } else {
    alert("Erro ao salvar check-in. Tente novamente.");
  }
}

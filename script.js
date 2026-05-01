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

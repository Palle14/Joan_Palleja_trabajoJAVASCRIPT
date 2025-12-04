// main.js
// JS común para todo el sitio TiempoPerfecto

document.addEventListener("DOMContentLoaded", () => {
  initNews();
  initGallery();
  initBudgetForm();
  initMap();
});

/* ==========================
   1. NOTICIAS INDEX (JSON)
   ========================== */

function initNews() {
  const newsContainer = document.getElementById("news-container");
  if (!newsContainer) return; // no estamos en index

  fetch("/js/news.json")
    .then((resp) => resp.json())
    .then((news) => {
      newsContainer.innerHTML = "";
      news.forEach((item) => {
        const article = document.createElement("article");
        article.classList.add("news-item");

        article.innerHTML = `
          <h3>${item.title}</h3>
          <p><small>${item.date}</small></p>
          <p>${item.summary}</p>
        `;
        newsContainer.appendChild(article);
      });
    })
    .catch(() => {
      newsContainer.innerHTML =
        "<p>No se han podido cargar las noticias en este momento.</p>";
    });
}

/* ==========================
   2. GALERÍA DINÁMICA
   ========================== */

function initGallery() {
  const thumbsContainer = document.getElementById("gallery-thumbs");
  const mainImg = document.getElementById("gallery-main-image");
  const mainTitle = document.getElementById("gallery-main-title");

  if (!thumbsContainer || !mainImg || !mainTitle) return; // no estamos en galería

  // Relojes de ejemplo
  const watches = [
    {
      title: "Clásico Elegante",
      src: "../images/reloj1.jpg"
    },
    {
      title: "Deportivo Pro",
      src: "../images/reloj2.jpg"
    },
    {
      title: "Smart Urbano",
      src: "../images/reloj3.jpg"
    },
    {
      title: "Edición Oro Rosa",
      src: "../images/reloj4.jpeg"
    },
    {
      title: "Minimalista Acero",
      src: "../images/reloj5.jpg"
    }
  ];

  // Crear miniaturas
  watches.forEach((watch, index) => {
    const thumb = document.createElement("div");
    thumb.classList.add("gallery-thumb");
    if (index === 0) thumb.classList.add("active");
    thumb.innerHTML = `<img src="${watch.src}" alt="${watch.title}" />`;

    thumb.addEventListener("click", () => {
      mainImg.src = watch.src;
      mainImg.alt = watch.title;
      mainTitle.textContent = watch.title;

      document
        .querySelectorAll(".gallery-thumb")
        .forEach((el) => el.classList.remove("active"));
      thumb.classList.add("active");
    });

    thumbsContainer.appendChild(thumb);
  });
}

/* ==========================
   3. FORMULARIO PRESUPUESTO
   ========================== */

function initBudgetForm() {
  const form = document.getElementById("budget-form");
  if (!form) return; // no estamos en presupuesto

  const nombre = document.getElementById("nombre");
  const apellidos = document.getElementById("apellidos");
  const telefono = document.getElementById("telefono");
  const email = document.getElementById("email");
  const producto = document.getElementById("producto");
  const plazo = document.getElementById("plazo");
  const extras = document.querySelectorAll(".extra");
  const presupuesto = document.getElementById("presupuesto");
  const condiciones = document.getElementById("condiciones");

  // Validaciones básicas con expresiones regulares
  function validarNombre() {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,15}$/;
    const valido = regex.test(nombre.value.trim());
    mostrarError("error-nombre", valido, "Introduce un nombre válido (máx. 15 letras)");
    return valido;
  }

  function validarApellidos() {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,40}$/;
    const valido = regex.test(apellidos.value.trim());
    mostrarError(
      "error-apellidos",
      valido,
      "Introduce apellidos válidos (máx. 40 letras)"
    );
    return valido;
  }

  function validarTelefono() {
    const regex = /^[0-9]{9}$/;
    const valido = regex.test(telefono.value.trim());
    mostrarError(
      "error-telefono",
      valido,
      "Introduce un teléfono de 9 dígitos"
    );
    return valido;
  }

  function validarEmail() {
    const regex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
    const valido = regex.test(email.value.trim());
    mostrarError("error-email", valido, "Introduce un correo válido");
    return valido;
  }

  function validarProducto() {
    const valido = producto.value !== "";
    mostrarError(
      "error-producto",
      valido,
      "Selecciona un producto para continuar"
    );
    return valido;
  }

  function validarCondiciones() {
    const valido = condiciones.checked;
    mostrarError(
      "error-condiciones",
      valido,
      "Debes aceptar la política de privacidad"
    );
    return valido;
  }

  function mostrarError(id, esValido, mensaje) {
    const span = document.getElementById(id);
    if (!span) return;
    if (esValido) {
      span.textContent = "";
    } else {
      span.textContent = mensaje;
    }
  }

  // Cálculo del presupuesto en tiempo real
  function calcularPresupuesto() {
    if (!validarProducto()) {
      presupuesto.value = "0 €";
      return;
    }

    const selectedOption = producto.options[producto.selectedIndex];
    const basePrice = Number(selectedOption.getAttribute("data-precio")) || 0;

    // Extras seleccionados
    let extrasTotal = 0;
    extras.forEach((extra) => {
      if (extra.checked) {
        extrasTotal += Number(extra.value);
      }
    });

    // Plazo: recargos / descuentos
    const days = Number(plazo.value) || 0;
    let factor = 1;
    if (days > 0 && days < 15) {
      factor = 1.15; // urgente
    } else if (days > 30) {
      factor = 0.9; // descuento por espera
    }

    let total = (basePrice + extrasTotal) * factor;
    presupuesto.value = total.toFixed(2) + " €";
  }

  // Escuchar cambios en producto, plazo y extras
  producto.addEventListener("change", calcularPresupuesto);
  plazo.addEventListener("input", calcularPresupuesto);
  extras.forEach((extra) =>
    extra.addEventListener("change", calcularPresupuesto)
  );

  // Validar campos al salir de ellos
  nombre.addEventListener("blur", validarNombre);
  apellidos.addEventListener("blur", validarApellidos);
  telefono.addEventListener("blur", validarTelefono);
  email.addEventListener("blur", validarEmail);

  // Cálculo inicial
  calcularPresupuesto();

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valido =
      validarNombre() &&
      validarApellidos() &&
      validarTelefono() &&
      validarEmail() &&
      validarProducto() &&
      validarCondiciones();

    if (!valido) {
      alert("Por favor, corrige los errores antes de enviar el formulario.");
      return;
    }

    alert("Formulario enviado correctamente. Te contactaremos con los detalles.");
    form.reset();
    calcularPresupuesto(); // vuelve a 0
  });
}

/* ==========================
   4. MAPA CONTACTO
   ========================== */

function initMap() {
  const mapDiv = document.getElementById("map");
  if (!mapDiv || typeof L === "undefined") return; // no estamos en contacto

  // Coordenadas de la tienda (ejemplo: Barcelona)
  const shopLat = 41.3874;
  const shopLng = 2.1686;

  const map = L.map("map").setView([shopLat, shopLng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  L.marker([shopLat, shopLng])
    .addTo(map)
    .bindPopup("TiempoPerfecto<br>C/ Relojeros 123")
    .openPopup();

  // Intentar obtener ubicación del cliente y mostrar ruta
  if (navigator.geolocation && L.Routing) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        L.Routing.control({
          waypoints: [L.latLng(userLat, userLng), L.latLng(shopLat, shopLng)],
          routeWhileDragging: false,
          show: false
        }).addTo(map);
      },
      () => {
        console.log("No se pudo obtener la ubicación del usuario");
      }
    );
  }
}



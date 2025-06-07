let db;

const request = indexedDB.open("FormularioDB", 1);

request.onerror = () => {
  console.error("Error al abrir IndexedDB");
};

request.onsuccess = (event) => {
  db = event.target.result;
  console.log("IndexedDB abierta correctamente");
  habilitarBotones();
};

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true });
};

document.getElementById("registroForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nombres = document.getElementById("nombres").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const anio = parseInt(document.getElementById("anioNacimiento").value);
  const mes = parseInt(document.getElementById("mesNacimiento").value);

  const esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
  const esMesPar = mes % 2 === 0;

  const resultado = document.getElementById("resultado");

  const transaccion = db.transaction(["usuarios"], "readwrite");
  const store = transaccion.objectStore("usuarios");

  const datos = {
    nombres,
    apellidos,
    anioNacimiento: anio,
    mesNacimiento: mes,
    esBisiesto,
    esMesPar
  };

  const agregar = store.add(datos);

  agregar.onsuccess = () => {
    if (esBisiesto) {
      resultado.textContent = `Datos guardados. Año bisiesto. Mes ${esMesPar ? "par" : "impar"}.`;
    } else {
      resultado.textContent = `Datos guardados. Año no bisiesto. Mes ${esMesPar ? "par" : "impar"}.`;
    }
  };

  agregar.onerror = () => {
    resultado.textContent = "Error al guardar en IndexedDB.";
  };
});

function habilitarBotones() {
  document.getElementById("verRegistros").addEventListener("click", mostrarRegistros);
  document.getElementById("borrarRegistros").addEventListener("click", borrarRegistros);
}

function mostrarRegistros() {
  const lista = document.getElementById("listaRegistros");
  lista.innerHTML = "";

  const transaccion = db.transaction(["usuarios"], "readonly");
  const store = transaccion.objectStore("usuarios");
  const cursor = store.openCursor();

  cursor.onsuccess = (event) => {
    const puntero = event.target.result;
    if (puntero) {
      const data = puntero.value;
      const item = document.createElement("li");
      item.textContent = `${data.nombres} ${data.apellidos} - Año: ${data.anioNacimiento} (${data.esBisiesto ? "bisiesto" : "no bisiesto"}) - Mes: ${data.mesNacimiento} (${data.esMesPar ? "par" : "impar"})`;
      lista.appendChild(item);
      puntero.continue();
    } else {
      if (lista.children.length === 0) {
        const vacio = document.createElement("li");
        vacio.textContent = "No hay registros guardados.";
        lista.appendChild(vacio);
      }
    }
  };

  cursor.onerror = () => {
    document.getElementById("resultado").textContent = "Error al leer los registros.";
  };
}

function borrarRegistros() {
  const transaccion = db.transaction(["usuarios"], "readwrite");
  const store = transaccion.objectStore("usuarios");

  const solicitud = store.clear();

  solicitud.onsuccess = () => {
    document.getElementById("resultado").textContent = "Todos los registros han sido borrados.";
    document.getElementById("listaRegistros").innerHTML = "";
  };

  solicitud.onerror = () => {
    document.getElementById("resultado").textContent = "Error al borrar los registros.";
  };
}

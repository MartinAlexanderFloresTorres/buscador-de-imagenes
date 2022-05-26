import {
    menuBtn,
    overlay,
    tipoModal,
    body,
    links,
    resultados,
    formulario,
    subir,
    modal,
    paginacionDiv,
    inicioBanner,
} from "./variables.js";
const key = "27369194-e1326f92c0966fa4cdd731f8a";

let contador = 1;
const registroPagina = 15;
let totalPaginas;
let iterador;
let paginaActual = 1;

export function cargarListenes() {
    menuBtn.addEventListener("click", () => {
        body.classList.toggle("active");
    });
    overlay.addEventListener("click", () => {
        body.classList.remove("active");
    });
    links.forEach((link) => {
        link.addEventListener("click", () => {
            body.classList.remove("active");
        });
    });
}

// cargar documento
export function cargarDocumento(video) {
    window.onload = () => {
        paginaRamdom();
        descargarImagenes();
        if (video) {
            consultarApiVideo("colores");
            formulario.addEventListener("submit", validarFomularioVideo);
        } else {
            consultarApi("colores");
            formulario.addEventListener("submit", validarDatos);

            // animar banner
            setInterval(() => {
                contador++;
                animarBanner();
            }, 4000);

            // evento de icono de subir
            window.addEventListener("scroll", (e) => {
                const valor = window.scrollY;
                if (valor > 1000) {
                    subir.classList.add("active");
                } else {
                    subir.classList.remove("active");
                }
            });
        }
    };
}

// validar el formulario
function validarDatos(e) {
    e.preventDefault();
    const termino = document.querySelector("#busqueda");

    if (termino.value === "") {
        termino.classList.add("active");
        setTimeout(() => {
            termino.classList.remove("active");
        }, 3000);
    } else {
        formulario.classList.add("active");
        paginaActual = 1;
        consultarApi(termino.value);
    }
}

function consultarApi(termino) {
    const url = `https://pixabay.com/api/?key=${key}&q=${termino}&image_type=photo&per_page=${registroPagina}&page=${paginaActual}&lang=es`;
    eliminarResultados(resultados);
    eliminarResultados(paginacionDiv);
    spiner();
    fetch(url)
        .then((resultados) => resultados.json())
        .then((data) => {
            formulario.classList.remove("active");
            if (data.hits.length === 0) {
                eliminarResultados(resultados);
                eliminarResultados(paginacionDiv);
                mostrarAlerta("No se encontraron resultados");
            } else {
                totalPaginas = calcularPaginas(data.totalHits);
                mostrarHtml(data);
                imprimirIterador(termino);
            }
        })
        .catch((error) => console.log(error));
}
function calcularPaginas(total) {
    return Math.ceil(total / registroPagina);
}
// generador que va a registrar la paginacion
function* crearPaginador(total) {
    for (let i = 1; i <= total; i++) {
        yield i;
    }
}
// imprime el iterador
function imprimirIterador(termino, video) {
    eliminarResultados(paginacionDiv);
    iterador = crearPaginador(totalPaginas);
    while (true) {
        const { value, done } = iterador.next();
        if (done) return;

        // genera un boton por cada elemento del generador
        const boton = document.createElement("a");
        boton.href = "#";
        boton.dataset.pagina = value;
        boton.textContent = value;
        boton.classList.add("Botonsiguiente");
        boton.onclick = () => {
            paginaActual = Number(value);
            if (video) {
                consultarApiVideo(termino);
            } else {
                consultarApi(termino);
            }
        };
        paginacionDiv.appendChild(boton);
    }
}
// eliminar hmtl previo
function eliminarResultados(contenedor) {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
}

// descargar imagenes
function downloadImage(url, name) {
    fetch(url)
        .then((resp) => resp.blob())
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            // the filename you want
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert("Error al descargar Imagen"));
}

// mostrar los resultados en el html
function mostrarHtml(data) {
    eliminarResultados(resultados);
    data.hits.forEach((imagen) => {
        const {
            largeImageURL,
            user,
            userImageURL,
            id,
            user_id,
            comments,
            downloads,
            likes,
            tags,
        } = imagen;

        const divItem = document.createElement("div");
        divItem.classList.add("contenedor__item");
        divItem.dataset.id = id;

        if (!userImageURL) {
            divItem.innerHTML = `
                <img width="100" heght="100" class="contenedor__img" data-userText="${user}" data-comentario="${comments}" data-descargas="${downloads}" data-likes="${likes}" data-tags="${tags}" data-imgHD="${largeImageURL}" data-user="img/userDefault.webp" src="${largeImageURL}" alt="imagen">

                <div class="contenedor__description">
                    <a class="contenedor__descargarLink" href="${largeImageURL}" download></a>
                    <button class="contenedor__descargar" title="Descargar imagen"><i class='bx bxs-download ico'></i></button>
                    <div class="contenedor__user">
                        <img width="100" heght="100" class="contenedor__userImg" src="img/userDefault.webp" alt="user${user_id}">
                        <p class="contendor__userText">${user}</p>
                    </div>
                </div>
                    `;
        } else {
            divItem.innerHTML = `
                <img width="100" heght="100" class="contenedor__img" data-userText="${user}" data-comentario="${comments}" data-descargas="${downloads}" data-likes="${likes}" data-tags="${tags}" data-imgHD="${largeImageURL}" data-user="img/userDefault.webp" src="${largeImageURL}" alt="imagen">
                
                <div class="contenedor__description">
                    <a class="contenedor__descargarLink" href="${largeImageURL}" download></a>
                    <button class="contenedor__descargar" title="Descargar imagen"><i class='bx bxs-download ico'></i></button>
                    <div class="contenedor__user">
                        <img width="100" heght="100" class="contenedor__userImg" src="${userImageURL}" alt="user${user_id}">
                        <p class="contendor__userText">${user}</p>
                    </div>
                </div>
                `;
        }

        resultados.appendChild(divItem);
    });
    tipoModal.innerHTML = `<img width="100" heght="100" id="imagenModal" src="" alt="imagen">`;
    mostrarModal();
}

// descargar imagenes
function descargarImagenes() {
    resultados.addEventListener("click", (e) => {
        if (e.target.classList.contains("contenedor__descargar")) {
            let url = e.target.parentElement.parentElement
                .querySelector(".contenedor__img")
                .getAttribute("data-imgHD");

            downloadImage(url, "imagen");
        }
    });
}

// modal de imagenes
function mostrarModal(duracion) {
    let url;
    if (duracion) {
        document.querySelector(".duracionDisplay").style.display = "block";
    } else {
        document.querySelector(".duracionDisplay").style.display = "none";
    }
    resultados.addEventListener("click", (e) => {
        if (e.target.classList.contains("contenedor__img")) {
            url = e.target.getAttribute("data-imgHD");
            document.querySelector("#modal__link").href = url;
            document.querySelector("#imagenModal").src = url;
            document.querySelector("#modalUsuarioImg").src =
                e.target.getAttribute("data-user");
            document.querySelector(".modal__userText").textContent =
                e.target.getAttribute("data-userText");
            document.querySelector(
                ".modal__arroba"
            ).textContent = `@${e.target.getAttribute("data-userText")}`;
            document.querySelector("#coment").textContent =
                e.target.getAttribute("data-comentario");
            document.querySelector("#descargas").textContent =
                e.target.getAttribute("data-descargas");
            document.querySelector("#likes").textContent =
                e.target.getAttribute("data-likes");
            document.querySelector("#tags").textContent =
                e.target.getAttribute("data-tags");
            const duracion = document.querySelector("#duracion");
            if (duracion) {
                duracion.textContent = `${e.target.getAttribute(
                    "data-duracion"
                )}s`;
            }

            modal.classList.add("active");
            body.classList.add("hidden");
        }
    });
    modal.addEventListener("click", (e) => {
        const imagen = document.querySelector(".modal__image");

        if (e.target.classList.contains("modal")) {
            modal.classList.remove("active");
            body.classList.remove("hidden");
        }
        if (e.target.id === "descargarBoton") {
            downloadImage(url, "imagen");
        }
        if (e.target.id === "fullScreen") {
            imagen.requestFullscreen();
            imagen.classList.add("active");
        }
        if (e.target.id === "exit-fullScreen") {
            document.exitFullscreen();
            imagen.classList.remove("active");
        }

        if (e.target.classList.contains("modal__close")) {
            modal.classList.remove("active");
            body.classList.remove("hidden");
        }
    });
}

// mostrar alerta
function mostrarAlerta(mensaje, video) {
    const alertas = document.querySelector(".alerta");
    if (!alertas) {
        const alerta = document.createElement("div");
        alerta.classList.add("alerta");
        alerta.textContent = mensaje;
        resultados.appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
            formulario.reset();
            paginaRamdom();
            if (video) {
                consultarApiVideo("colores");
            } else {
                consultarApi("colores");
            }
        }, 3000);
    }
}

// mostrar spiner
function spiner() {
    const spiner = document.createElement("span");
    spiner.classList.add("spiner");
    spiner.innerHTML = `
        <i class="bx bx-loader bx-spin ico"></i>
    `;
    resultados.appendChild(spiner);
}

// animar el banner
function animarBanner() {
    if (contador === 2) {
        inicioBanner.style.backgroundImage = "url(./img/bg1.avif)";
    } else if (contador === 3) {
        inicioBanner.style.backgroundImage = "url(./img/bg2.avif)";
    } else if (contador === 4) {
        inicioBanner.style.backgroundImage = "url(./img/bg3.avif)";
    } else {
        inicioBanner.style.backgroundImage = "url(./img/bg.avif)";
        contador = 1;
    }
}
function paginaRamdom() {
    paginaActual = Math.ceil(Math.random() * 10);
}
// api video
function validarFomularioVideo(e) {
    e.preventDefault();
    const terminoVideo = document.querySelector("#busqueda");
    if (terminoVideo.value === "") {
        terminoVideo.classList.add("active");
        setTimeout(() => {
            terminoVideo.classList.remove("active");
        }, 3000);
    } else {
        formulario.classList.add("active");
        paginaActual = 1;
        consultarApiVideo(terminoVideo.value);
    }
}
function consultarApiVideo(terminoVideo) {
    const url = `https://pixabay.com/api/videos/?key=${key}&q=${terminoVideo}&per_page=${registroPagina}&page=${paginaActual}&lang=es`;
    eliminarResultados(resultados);
    eliminarResultados(paginacionDiv);
    spiner();
    fetch(url)
        .then((resultado) => resultado.json())
        .then((data) => {
            formulario.classList.remove("active");
            if (data.hits.length === 0) {
                eliminarResultados(resultados);
                eliminarResultados(paginacionDiv);
                mostrarAlerta("No se encontraron resultados", true);
            } else {
                totalPaginas = calcularPaginas(data.totalHits);
                mostrarHtmlVideo(data);
                imprimirIterador(terminoVideo, true);
            }
        });
}
function mostrarHtmlVideo(data) {
    eliminarResultados(resultados);
    data.hits.forEach((video) => {
        const {
            userImageURL,
            picture_id,
            user,
            user_id,
            comments,
            downloads,
            duration,
            likes,
            tags,
            videos: {
                tiny: { url },
            },
            id,
        } = video;

        const divItem = document.createElement("div");
        divItem.classList.add("contenedor__item");
        divItem.dataset.id = id;

        if (!userImageURL) {
            divItem.innerHTML = `
            <img width="100" heght="100" class="contenedor__img" data-userText="${user}" data-duracion="${duration}" data-comentario="${comments}" data-descargas="${downloads}" data-likes="${likes}" data-tags="${tags}" data-imgHD="${url}" data-user="img/userDefault.webp" src="https://i.vimeocdn.com/video/${picture_id}_200x150.jpg" alt="video post">

            <div class="contenedor__description">
                <button class="verVideo boton" title="Ver Video"><i class='bx bxs-movie-play ico'></i> </button>
                <div class="contenedor__user">
                    <img width="100" heght="100" class="contenedor__userImg" src="img/userDefault.webp" alt="user${user_id}">
                    <p class="contendor__userText">${user}</p>
                </div>
            </div>
                `;
        } else {
            divItem.innerHTML = `
            <img width="100" heght="100" class="contenedor__img" data-userText="${user}" data-duracion="${duration}" data-comentario="${comments}" data-descargas="${downloads}" data-likes="${likes}" data-tags="${tags}" data-imgHD="${url}" data-user="img/userDefault.webp" src="https://i.vimeocdn.com/video/${picture_id}_200x150.jpg" alt="video post">
            
            <div class="contenedor__description">
                <button class="verVideo boton" title="Ver Video"><i class='bx bxs-movie-play ico'></i> </button>
                <div class="contenedor__user">
                    <img width="100" heght="100" class="contenedor__userImg" src="${userImageURL}" alt="user${user_id}">
                    <p class="contendor__userText">${user}</p>
                </div>
            </div>
            `;
        }

        resultados.appendChild(divItem);
    });
    tipoModal.innerHTML = `<video width="100" heght="100" id="imagenModal" src="" alt="video" controls></video>`;
    document.querySelector(".moda__fullScreen").style.display = "none";
    document.querySelector(".modal .boton").style.display = "none";
    mostrarModal(true);
}

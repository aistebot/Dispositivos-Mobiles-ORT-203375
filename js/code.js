const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const ACTIVIDADES = document.querySelector("#pantalla-actividades");
const ADDACTIVIDADES = document.querySelector("#pantalla-addactividades");
const MAPA = document.querySelector("#pantalla-mapa");
const NAV = document.querySelector("ion-nav");
const URL_BASE = "https://movetrack.develotion.com/";


// VARIABLES GLOBALES

let listaActividades = [];
let listaPaises =[];
let map = null;

// FUNCIONES INICIALES

Inicio();
GuardarListaPaises();


async function Inicio() {
    Eventos();
    ArmarMenu();
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    if(apikey != null){
        await GuardarListaActividades();
    }
}

async function GuardarListaPaises(){
    await fetch(`${URL_BASE}paises.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        }).then(function (response){
            return response.json();
        })
        .then(function (response){
            listaPaises = response.paises;
        })
};

// GUARGAR LISTA DE ACTIVIDADES

async function GuardarListaActividades(){
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    await fetch(`${URL_BASE}actividades.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey' : apikey,
            'iduser' : idUser
        },
        }).then(function (response){
            return response.json();
        })
        .then(function (response){
            if(listAct.codigo === 401){
                MostrarToast("Sesion expirada", 'La sesion ha expirado. Vueldo a iniciar sesion.',3000);
                CerrarSesion();
            }else{
                listaActividades = response.actividades;
            }
        })
}

// MENU

function ArmarMenu() {

    let apikey = localStorage.getItem("apiKey");

    let cadena = `<ion-item href="/" onclick="CerrarMenu()">HOME</ion-item>`

    if (apikey) {
        cadena += `
                    <ion-item href="/actividades" onclick="CerrarMenu()">Ver actividades</ion-item>
                    <ion-item href="/addactividades" onclick="CerrarMenu()">Agregar actividades</ion-item>
                    <ion-item href="/mapa" onclick="CerrarMenu()">Mapa de Usuarios</ion-item>
                    <ion-item onclick="CerrarSesion()">Cerrar Sesion</ion-item>
                    `
    } else {
        cadena += `
                  <ion-item href="/login" onclick="CerrarMenu()">Iniciar Sesion</ion-item>
                  <ion-item href="/registro" onclick="CerrarMenu()">Registrarse</ion-item>
                 `
    }

    document.querySelector("#menu-opciones").innerHTML = cadena;
}

function Eventos() {

    ROUTER.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnRegistro").addEventListener('click', TomarDatosRegistro);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
    document.querySelector("#btnListar").addEventListener('click', ListarPorFecha);
    document.querySelector("#btnAddActividad").addEventListener('click', AgregarActividad);
}

async function Navegar(evt) {
    OcultarPantallas();

    let ruta = evt.detail.to;

    if (ruta == "/") {
        HOME.style.display = "block";
    } else if (ruta == "/login") {
        LOGIN.style.display = "block";
    } else if (ruta == "/registro") {
        REGISTRO.style.display = "block";
        SelectPaises();
    } else if (ruta == "/actividades") {
        ACTIVIDADES.style.display = "block";
        DatosGenerales();
        await GuardarListaActividades();
    }else if (ruta == "/addactividades") {
        ADDACTIVIDADES.style.display = "block";
        SelectActividades();
        await GuardarListaActividades();
    }else if (ruta == "/mapa") {
        MAPA.style.display = "block";
        MostrarMapa();
    }

}


function OcultarPantallas() {

    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    ACTIVIDADES.style.display = "none";
    ADDACTIVIDADES.style.display = "none";
    MAPA.style.display = "none";

}


function CerrarMenu() {
    MENU.close();
}


const loading = document.createElement('ion-loading');

function PrenderLoading(texto) {

    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoading() {

    loading.dismiss();

}



// CERRAR SESION

function CerrarSesion() {
    localStorage.clear();
    ArmarMenu();
    CerrarMenu();
    NAV.push("page-home");
}


// LOGIN

function TomarDatosLogin() {

    let user = document.querySelector("#inputUser").value;
    let pass = document.querySelector("#inputPassword").value;


    let usuario = new Object();
    usuario.usuario = user;
    usuario.password = pass;
    PrenderLoading("Iniciando Sesión")
    fetch(`${URL_BASE}login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario),
    }).then(function (response) {
        return response.json();

    }).then(function (data) {
        if (data.codigo == "200") {
            localStorage.setItem("apiKey", data.apiKey);
            localStorage.setItem("idUser", data.id);
            ArmarMenu();
            NAV.push("page-home");
        } else {
            document.querySelector("#label-respuesta-login").innerHTML = data.mensaje;
        }
        ApagarLoading();
    })
}


// REGISTRO

function TomarDatosRegistro() {

    let user = document.querySelector("#inputRegUser").value;
    let pass = document.querySelector("#inputRegPass").value;
    let idPais = Number(document.querySelector("#inputRegIdP").value);
    if(user.length < 1 || user.length < 1 || idPais == NaN) {
        MostrarToast("ERROR! Verifica que el usuario, contraseña y País no esten vacios", 3000);
    }else{

        let usuario = new Object();
        usuario.usuario = user;
        usuario.password = pass;
        usuario.idPais = idPais;

        PrenderLoading("Registrando usuario")
        fetch(`${URL_BASE}usuarios.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario),
        }).then(function (response) {
            return response.json();


        }).then(function (data) {

            ApagarLoading();
            if (data.codigo == "200") {
                MostrarToast("Usuario registrado correctamente, inicie sesion para ingresar en el sistema", 3000);
            }
            else if (data.codigo == "409") {
                MostrarToast("Usuario ya se encuentra registrado, intente iniciar sesion o contactese con el adminitrador.", 3000);
            }
            else {
                MostrarToast("Error", "Uppss.. ha sucedido un error inesperado, espere un momento o contactese con el administrador del sitio", data.error);
            }

        })

    }
}

//SELECT DINAMICO PAISES PARA REGISTRO

function SelectPaises(){
    let select = '';
    for(l of listaPaises) {
        select += `<ion-select-option value="${l.id}">${l.name}</ion-select-option>`
    }
    document.querySelector("#inputRegIdP").innerHTML = select;
}




// MENSAJE DE ALERTA

function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;
    document.body.appendChild(toast);
    toast.present();
}


// ACTIVIDADES
// DATOS GENERALES

function DatosGenerales(){
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    //TABLA FINAL
    let tabla = ``;
    //FECHAS
    let priFechaActividad = new Date();
    let hoy = new Date(); //FECHA COMPARATIVA
    
    let cantActividades = 0;
    //TIEMPO
    let cantTiempoActividad = 0; //TIEMPO TOTAL
    let promedioPorDia = 0;

    fetch(`${URL_BASE}registros.php?idUsuario=${localStorage.idUser}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey' : apikey,
            'iduser' : idUser
        },
    }).then(function (response){
            return response.json();
        })
        .then(function (listAct){
            if(listAct.codigo === 401){
                MostrarToast("Sesion expirada", 'La sesion ha expirado. Vueldo a iniciar sesion.',3000);
                CerrarSesion();
            }else{
                    for(let l of listAct.registros) {
                        cantActividades ++;
                        cantTiempoActividad += l.tiempo;
                        const fechaActividad = new Date(l.fecha);
                        if(priFechaActividad > fechaActividad){
                            priFechaActividad = fechaActividad;
                        }
                    }
                    let inicioEjercicio = Math.floor((hoy - priFechaActividad) / (1000 * 60 * 60 * 24));
                    promedioPorDia = cantTiempoActividad / (inicioEjercicio);

                    tabla += `<ion-row>
                    <ion-col>${cantTiempoActividad}</ion-col>
                    <ion-col>${promedioPorDia} segundos/dia</ion-col>
                    <ion-col>${cantActividades}</ion-col>
                    </ion-row>
                    `

                    document.querySelector("#tablaTiemposGeneral").innerHTML = tabla;
                
            }
        })
}

// LISTAR POR FECHA

function ListarPorFecha() {

    let fecha = document.querySelector("#filtroFecha").value;
    let tabla = '';
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    const hoy = new Date(); // Fecha actual
    const sieteDias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const treintaDias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    fetch(`${URL_BASE}registros.php?idUsuario=${localStorage.idUser}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey' : apikey,
            'iduser' : idUser
        },
    }).then(function (response){
            return response.json();
        })
        .then(function (listAct){
            if(listAct.codigo === 401){
                MostrarToast("Sesion expirada", 'La sesion ha expirado. Vueldo a iniciar sesion.',3000);
                CerrarSesion();
            }else{
                if(fecha === 'all'){
                    for(let l of listAct.registros) {
                        let nombreAct = TraerNombreActividad(l.idActividad);
                        let imagen = TraerImagenActividad(l.idActividad);
                        tabla += `<ion-row>
                        <ion-col> <img src="https://movetrack.develotion.com/imgs/${imagen}.png" width="40"> ${nombreAct}</ion-col>
                        <ion-col>${l.tiempo} segundos</ion-col>
                        <ion-col>${l.fecha}</ion-col>
                        <ion-col><ion-button expand="full" onclick="EliminarActividad('${l.id}')"><ion-icon slot="icon-only" name="trash"></ion-icon></ion-button></ion-col></ion-row>
                        `
                    }

                    document.querySelector("#listAct").innerHTML = tabla;
                } else if(fecha ==="week") {
                    for(let l of listAct.registros) {
                        let fecha = new Date(l.fecha);
                        if(fecha >= sieteDias && fecha <= hoy ){
                            let nombreAct = TraerNombreActividad(l.idActividad);
                            let imagen = TraerImagenActividad(l.idActividad);
                            tabla += `<ion-row>
                            <ion-col> <img src="https://movetrack.develotion.com/imgs/${imagen}.png" width="40"> ${nombreAct}</ion-col>
                            <ion-col>${l.tiempo} segundos</ion-col>
                            <ion-col>${l.fecha}</ion-col>
                            <ion-col><ion-button expand="full" onclick="EliminarActividad('${l.id}')">Eliminar</ion-button></ion-col></ion-row>
                            `
                        }
                    }
                    document.querySelector("#listAct").innerHTML = tabla;
                } else if(fecha ==="mounth") {
                    for(let l of listAct.registros) {
                        let fecha = new Date(l.fecha);
                        if(fecha >= treintaDias && fecha <= hoy ){
                            let nombreAct = TraerNombreActividad(l.idActividad);
                            let imagen = TraerImagenActividad(l.idActividad);
                            tabla += `<ion-row>
                            <ion-col> <img src="https://movetrack.develotion.com/imgs/${imagen}.png" width="40"> ${nombreAct}</ion-col>
                            <ion-col>${l.tiempo} segundos</ion-col>
                            <ion-col>${l.fecha}</ion-col>
                            <ion-col><ion-button expand="full" onclick="EliminarActividad('${l.id}')">Eliminar</ion-button></ion-col></ion-row>
                            `
                        }
                    }
                    document.querySelector("#listAct").innerHTML = tabla;
                }
            }
        })
    

}

//ELIMINAR ACTIVIDAD

function EliminarActividad(id){
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");

    fetch(`${URL_BASE}/registros.php?idRegistro=${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apikey,
            'iduser': idUser
        },
    })
    .then(response => response.json())
    .then(data => {
        MostrarToast("Eliminando... ",3000);
        window.location.reload();
    })
    .catch(error => console.error("Error al eliminar:", error, "Intente recargar la pantalla."));
}

//AGREGAR ACTIVIDAD

function AgregarActividad(){
    let idActividad = Number(document.querySelector("#selectActividad").value);
    let tiempo = Number(document.querySelector("#inputSegundos").value);
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    let fechaInput = document.querySelector("#inputFecha").value;
    let fecha = new Date(fechaInput); // Convertir el valor del input a objeto Date
    const hoy = new Date(); 
    hoy.setHours(0, 0, 0, 0); 

    if(idActividad === NaN || tiempo < 1 || fechaInput ===""){
        MostrarToast("ERROR! CAMPOS VACIOS",3000);
    }else{
        if (fecha > hoy) {
            MostrarToast("No puedes hacer actividades en el futuro / Tiempo no puede ser negativo",3000);
        } else {
            let actividad = new Object();
            actividad.idActividad = idActividad;
            actividad.idUsuario = idUser;
            actividad.tiempo = tiempo;
            actividad.fecha = fechaInput;

            fetch(`${URL_BASE}registros.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey' : apikey,
                    'iduser' : idUser
                },
                body: JSON.stringify(actividad),
            }).then(function (response){
                    return response.json();
                })
                .then(function (listAct){
                    if(listAct.codigo === 401){
                        MostrarToast("Sesion expirada", 'La sesion ha expirado. Vueldo a iniciar sesion.',3000);
                        CerrarSesion();
                    }else{
                        MostrarToast("Producto agregado correctamente",3000);
                    }})
        }
    }

}

//SELECT ACTIVIDADES PARA FORM DE AGREGAR ACTIVIDADES

function SelectActividades(){
    let select = '';
    for(l of listaActividades) {
        select += `<ion-select-option value="${l.id}">${l.nombre}</ion-select-option>`
    }
    document.querySelector("#selectActividad").innerHTML = select;
}


//MAPA

async function MostrarMapa() {
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    let usuariosPorPais;
    await fetch(`${URL_BASE}/usuariosPorPais.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey' : apikey,
            'iduser' : idUser
        },
    }).then(function (response){
            return response.json();
        })
        .then(function (userPorPais){
            if(listAct.codigo === 401){
                MostrarToast("Sesion expirada", 'La sesion ha expirado. Vueldo a iniciar sesion.',3000);
                CerrarSesion();
            }else{
                usuariosPorPais = userPorPais.paises;
            }
        })

    if (map) {
        map.remove();
        map = null;
    }
    map = L.map('map').setView([-12.505, -67.009], 4);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize();
    }, 100); // Da tiempo a Leaflet para ajustarse

    for(let l of usuariosPorPais) {
        let latitud = ObtenerLatitud(l.id);
        let longitud = ObtenerLongitud(l.id);
        if(latitud != null || longitud != null){
            var marker = L.marker([latitud, longitud]).addTo(map).bindPopup(`<b>${l.name}</b><br>Cantidad de Usuarios: ${l.cantidadDeUsuarios}`);
        }
    }

}

function ObtenerLatitud(id){
    for(let l of listaPaises){
        if(l.id === id) {
            return l.latitude;
        }
    }
    return null; // Devolver un valor manejable en caso de no encontrar
}

function ObtenerLongitud(id){
    for(let l of listaPaises){
        if(l.id === id) {
            return l.longitude;
        }
    }
    return null;
}

//FUNCIONES GENERALES ACTIVIDES

function TraerNombreActividad (id){
    for (l of listaActividades) {
        if(id===Number(l.id)){
            return l.nombre;
        }
    }
}

function TraerTiempoAcrividad (id){
    for (l of listaActividades) {
        if(id===Number(l.id)){
            return l.tiempo;
        }
    }
}

function TraerFechaActividad (id){
    for (l of listaActividades) {
        if(id===Number(l.id)){
            return l.fecha;
        }
    }
}

function TraerImagenActividad (id){
    for (l of listaActividades) {
        if(id===l.id){
            return l.imagen;
        }
    }
}


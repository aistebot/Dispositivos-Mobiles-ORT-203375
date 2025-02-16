const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const ACTIVIDADES = document.querySelector("#pantalla-actividades");
const NAV = document.querySelector("ion-nav");
const URL_BASE = "https://movetrack.develotion.com/";

Inicio();


function Inicio() {
    Eventos();
    ArmarMenu();
}

function ArmarMenu() {

    let hayToken = localStorage.getItem("apiKey");

    let cadena = `<ion-item href="/" onclick="CerrarMenu()">HOME</ion-item>`

    if (hayToken) {
        cadena += `
                    <ion-item href="/actividades" onclick="CerrarMenu()">Ver actividades</ion-item>
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

function CerrarSesion() {
    localStorage.clear();
    ArmarMenu();
    CerrarMenu();
    NAV.push("page-home");
}


function Eventos() {

    ROUTER.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnRegistro").addEventListener('click', TomarDatosRegistro);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
    document.querySelector("#btnListar").addEventListener('click', ListarPorFecha);

}

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

        console.log(response);
        return response.json();

    }).then(function (data) {
        console.log(data);
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




function TomarDatosRegistro() {

    let user = document.querySelector("#inputRegUser").value;
    let pass = document.querySelector("#inputRegPass").value;
    let idPais = Number(document.querySelector("#inputRegIdP").value);


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
        console.log(response);

        return response.json();


    }).then(function (data) {

        ApagarLoading();
        console.log(data);
        if (data.codigo == "200") {
            MostrarToast("Usuario registrado correctamente, inicie sesion para ingresar en el sistema", 3000);
        }
        else if (data.codigo == "409") {
            MostrarToast("Usuario ya se encuentra registrado, intente iniciar sesion o contactese con el adminitrador.", 3000);
        }
        else {
            Alertar("Error", "Uppss.. ha sucedido un error inesperado, espere un momento o contactese con el administrador del sitio", data.error);
        }

    })




}

function Navegar(evt) {
    console.log(evt);
    OcultarPantallas();

    let ruta = evt.detail.to;

    if (ruta == "/") {
        HOME.style.display = "block";
    } else if (ruta == "/login") {
        LOGIN.style.display = "block";
    } else if (ruta == "/registro") {

        REGISTRO.style.display = "block";

    } else if (ruta == "/actividades") {
        ACTIVIDADES.style.display = "block";
        ListarProductosEnPantalla();

    }

}

function OcultarPantallas() {

    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    ACTIVIDADES.style.display = "none";

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




function Alertar(titulo, subtitulo, mensaje) {
    const alert = document.createElement('ion-alert');
    alert.cssClass = 'my-custom-class';
    alert.header = titulo;
    alert.subHeader = subtitulo;
    alert.message = mensaje;
    alert.buttons = ['OK'];
    document.body.appendChild(alert);
    alert.present();
}



function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;
    document.body.appendChild(toast);
    toast.present();
}


function ListarPorFecha() {

    let fecha = document.querySelector("#filtroFecha").value;
    let tabla = '';
    let apikey = localStorage.getItem("apiKey");
    let idUser = localStorage.getItem("idUser");
    console.log(fecha);
    console.log(localStorage.idUser);
    fetch(`${URL_BASE}registros.php?idUsuario=${localStorage.idUser}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey' : apikey,
            'iduser' : idUser
        },
    }).then(function (response){
            console.log(response);
            return response.json();
        })
        .then(function (listAct){
            console.log(listAct);
            if(fecha === 'all'){
                for(let l of listAct.registros) {
                    tabla += `<ion-row>
                      <ion-col> <img src="https://movetrack.develotion.com/imgs/${l.idActividad}.png" width="40"> FALTA NOMBRE ACTIVIDAD</ion-col>
                      <ion-col>${l.tiempo} segundos</ion-col>
                      <ion-col>${l.fecha}</ion-col>
                      <ion-col><ion-button expand="full" id="eliminarActividad${l.id}">Eliminar</ion-button></ion-col></ion-row>
                      `
                }

                document.querySelector("#listAct").innerHTML = tabla;
                console.log(tabla);
            }
        })
    

}
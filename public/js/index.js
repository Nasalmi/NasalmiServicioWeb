// vamos a cargar los 4 primeros puntuaciones en la carga de la pagina
$(document).ready(function(){
    initializeUserSession();
    //cargar las 4 primeras puntuaciones sacandolas de un servicio web montado en node
    $.ajax({
        url: "http://52.3.170.212:8080/api/games/recent",
        type: "GET",
        datatype: "json",
        success: function(response){
            partidas = response;
            
            $(".ranking-list").empty();
            
            for (var i = 0; i < partidas.length; i++) { 
                html = "<div class='ranking-item'>" + 
                    "<img src='https://picsum.photos/240/120' alt='User Avatar' class='user-avatar rounded'>" +
                    "<div class='user-info'>" +
                    "<h3 class='user-name'>" + partidas[i].user_id + "</h3>" +
                    "<div class='user-stats'>" +
                    "<span class='user-level'><i class='fas fa-chart-line'></i> " + partidas[i].level + "</span>" +
                    "<span class='user-wave'><i class='fas fa-water'></i> " + partidas[i].wave + "</span>" +
                    "</div>" +
                    "</div>" +
                    "</div>";

                $(".ranking-list").append(html);
                
            }
        }
    });
});

async function initializeUserSession() {
    var token = localStorage.getItem('token');
    if (token) {
        try {
            const sessionResponse = await $.ajax({
                url: "http://nasalmi.duckdns.org/api/verificar-sesion", // Usar el dominio
                type: "GET",
                headers: { 'Authorization': 'Bearer ' + token },
                xhrFields: {
                    withCredentials: true // Importante para enviar cookies cross-domain
                },
                crossDomain: true // Especificar explícitamente para claridad
            });

            console.log("Sesión activa:", sessionResponse.userId);
            localStorage.setItem('userId', sessionResponse.userId);
            $("#logoutButton").show();
            $("#loginButton").hide();
            $("#userButton").show();

        } catch (xhr) {
            console.log("Sesión no activa:", xhr.responseText);
            localStorage.removeItem('token');
            alert("Tu sesión ha expirado, por favor inicia sesión nuevamente.");
        }
    } else {
        console.log("No hay token almacenado, usuario no logueado.");
    }
}


/*async function initializeUserSession() {
    var token = localStorage.getItem('token');
    if (token) {
        try {
            const sessionResponse = await $.ajax({
                url: "http://52.3.170.212:8080/api/verificar-sesion",
                type: "GET",
                headers: { 'Authorization': 'Bearer ' + token },
            });

            console.log("Sesión activa:", sessionResponse.userId);
            localStorage.setItem('userId', sessionResponse.userId);
            $("#logoutButton").show();
            $("#loginButton").hide();
            $("#userButton").show();

        } catch (xhr) {
            console.log("Sesión no activa:", xhr.responseText);
            localStorage.removeItem('token');
            alert("Tu sesión ha expirado, por favor inicia sesión nuevamente.");
        }
    } else {
        console.log("No hay token almacenado, usuario no logueado.");
    }
}*/

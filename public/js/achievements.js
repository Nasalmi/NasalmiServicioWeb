$(document).ready(function () {
    initializeUserSession();
    // cargamos todos los logros
    parametros = {
        sortIndex: 1
    };
    $.ajax({
        url: "http://52.3.170.212:8080/api/achievements",
        type: "GET",
        datatype: "json",
        data: parametros,
        success: function (response) {

            $(".logros").empty();
            var numLogros = 0;
            for (var i = 0; i < response.length; i++) {
                html = "<tr>" +
                    "<td><img src='" +  response[i].icon +"' alt='Logro' class='achievement-icon'></td>" +
                    "<td>" + response[i].name + "</td>" +
                    "<td>" + response[i].description + "</td>";
                var puntos = response[i].points ? response[i].points : 0;
                var obtenido = response[i].obtenido ? response[i].obtenido : 0;
                html += "<td>" + puntos + "</td>" +
                    "<td>" + obtenido + "</td>" +
                    "</tr>";


                $(".logros").append(html);
                numLogros++;

            }
            $(".textoAchievements").text(numLogros + " Achievements");
        }
    });

    $(".tipoLogro").change(function () {
        parametros = {
            sortIndex: $(".tipoLogro").val()
        };
        $.ajax({
            url: "http://52.3.170.212:8080/api/achievements",
            type: "GET",
            datatype: "json",
            data: parametros,
            success: function (response) {
    
                $(".logros").empty();
    
                for (var i = 0; i < response.length; i++) {
                    html = "<tr>" +
                        "<td><img src='" +  response[i].icon +"' alt='Logro' class='achievement-icon'></td>" +
                        "<td>" + response[i].name + "</td>" +
                        "<td>" + response[i].description + "</td>";
                    var puntos = response[i].points ? response[i].points : 0;
                    var obtenido = response[i].obtenido ? response[i].obtenido : 0;
                    html += "<td>" + puntos + "</td>" +
                        "<td>" + obtenido + "</td>" +
                        "</tr>";
    
    
                    $(".logros").append(html);
    
                }
            }
        });
            
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

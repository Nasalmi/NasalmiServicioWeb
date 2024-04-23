$(document).ready(function () {
    var token = localStorage.getItem('token');
    if (token) {
        $.ajax({
            url: "http://52.3.170.212:8080/api/verificar-sesion",
            type: "GET",
            headers: { 'Authorization': 'Bearer ' + token },
            success: function(response) {
                console.log("Sesión activa:", response);
                // Aquí puedes realizar acciones adicionales ahora que sabes que el usuario está logueado.
            },
            error: function(xhr, status, error) {
                console.log("Sesión no activa:", xhr.responseText);
                // Manejo en caso de que la sesión no sea válida o haya expirado el token.
                localStorage.removeItem('token');  // Limpiar el token almacenado
                alert("Tu sesión ha expirado, por favor inicia sesión nuevamente."); // Redireccionar a la página de login
            }
        });
    } else {
        console.log("No hay token almacenado, usuario no logueado.");
        // Opcional: Redireccionar al login o manejar usuarios no logueados. // Redireccionar a la página de login
    }
    

    $('#loginModal form').on('submit', function(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario (recarga de página)

        var email = $('#email').val(); // Capturar el email ingresado
        var password = $('#password').val(); // Capturar la contraseña ingresada

        $.ajax({
            url: "http://52.3.170.212:8080/api/login",  // URL del endpoint de login
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ username: email, password: password }),  // Enviar datos como JSON
            success: function(response) {
                console.log("Login exitoso:", response);
                localStorage.setItem('token', response.token);  // Guardar el token en localStorage
                $('#loginModal').modal('hide');  // Ocultar el modal de login
                // Aquí puedes redirigir al usuario o recargar la página para mostrar contenido protegido
                window.location.reload();
            },
            error: function(xhr, status, error) {
                console.log("Error en el login:", xhr.responseText);
                // Mostrar mensaje de error al usuario
                alert("Error de autenticación: " + xhr.responseText);
            }
        });
    });
    

    // cargamos todos los logros
    $.ajax({
        url: "http://52.3.170.212:8080/api/users/" + "6626431c3cc725f6220deaf5",
        type: "GET",
        datatype: "json",
        success: function (response) {

            $(".userInfo").empty();

            html = '<img src="' + response.profile_image + '" alt="User" class="img-fluid rounded-circle mr-3">' +
                '<div>' +
                '<h2 class="title-line">' + response.username + '</h2>' +
                '<p>Email ' + response.email + '</p>' +
                '<p>El mejor usuario de la historia</p>' +
                '</div>';

            $(".userInfo").append(html);

            $(".userAchievements").empty();

            for (var i = 0; i < response.achievements.length; i++) {
                html = '<div class="d-flex align-items-center my-2">' +
                    '<img src="" alt="A" class="img-fluid mr-2">' +
                    '<span>' + response.achievements[i] + '</span>' +
                    '</div>';

                $(".userAchievements").append(html);
            }
        }
    });

    $.ajax({
        url: "http://52.3.170.212:8080/api/games/user/" + "6626431c3cc725f6220deaf5",
        type: "GET",
        datatype: "json",
        success: function (response) {

            $(".userGames").empty();
            var contador = 0;
            for (var j = 0; j<15; j++) {
            for(var i = 0; i < response.length; i++) {
                
                
                html = '<a href="#" class="list-group-item list-group-item-action bg-dark text-light my-2">' + 
                response[i].user_id + " - Level " + response[i].level + ", Wave " + response[i].wave + " - " + 
                '<small>' + response[i].date + '</small></a>';
                $(".userGames").append(html);
                contador++;
                if (contador >=10) {
                    return;
                }
            }}
            

        }
    });




});
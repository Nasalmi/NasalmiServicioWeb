$(document).ready(function () {
    initializeUserSession();
    $('#toggleUserInfo').click(function () {
        if ($(this).text() == "Modify My Info") {
            // Hacer una llamada AJAX para obtener los datos del usuario
            $.ajax({
                url: 'http://52.3.170.212:8080/api/users/' + localStorage.getItem("userId"),
                type: 'GET',
                success: function (response) {
                    // Reemplazar el contenido del div 'userStats' con el formulario
                    $('#toggleUserInfo').text("Hide User Info");
                    $('.userStats').fadeOut('slow', function() {
                        $('.userModify').fadeIn('slow');
                    });
                },
                error: function (error) {
                    console.error('Failed to fetch user info:', error);
                }
            });
        } else {
            $('#toggleUserInfo').text("Modify My Info");
            $('.userModify').fadeOut('slow', function() {
                $('.userStats').fadeIn('slow');
            });
        }
    });

    $(document).on('click', '#updateUserInfo', function() {
        var parametros = $('#userInfoForm').serialize(); // Serializa los datos del formulario
        $.ajax({
            url: 'http://52.3.170.212:8080/api/users/' + localStorage.getItem("userId"),
            type: 'PUT',
            data: parametros,
            success: function(response) {
                alert('User info updated successfully!');
            },
            error: function(error) {
                console.error('Error updating user info:', error);
            }
        });
    });
    
    $(document).on('click', '#deleteAccount', function() {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: 'http://52.3.170.212:8080/api/users/' + localStorage.getItem("userId"),
                    type: 'DELETE',
                    success: function(response) {
                        Swal.fire(
                            'Deleted!',
                            'Your account has been deleted.',
                            'success'
                          );
                          localStorage.removeItem('token');
                        window.location.href = '/index.html'; // Redirect to login page or home page
                    },
                    error: function(error) {
                        console.error('Failed to delete account:', error);
                    }
                });
            }
          });
    });

});

// Envolver todo el código en una función asíncrona para poder usar await
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
            // Una vez guardado el userId, realizar las otras llamadas
            await loadUserInfo(sessionResponse.userId);
            await loadUserGames(sessionResponse.userId);

        } catch (xhr) {
            console.log("Sesión no activa:", xhr.responseText);
            localStorage.removeItem('token');
            alert("Tu sesión ha expirado, por favor inicia sesión nuevamente.");
        }
    } else {
        console.log("No hay token almacenado, usuario no logueado.");
        window.location.href = '/index.html';
    }
}

// Función para cargar la información del usuario
function loadUserInfo(userId) {
    return $.ajax({
        url: "http://52.3.170.212:8080/api/users/" + userId,
        type: "GET",
        datatype: "json",
        success: function (response) {
            $(".userInfo").empty();

            var html = '<img src="' + response.profile_image + '" alt="User" class="img-fluid rounded-circle mr-3">' +
                '<div>' +
                '<h2 class="title-line">' + response.username + '</h2>' +
                '<p>Email ' + response.email + '</p>' +
                '<p>El mejor usuario de la historia</p>' +
                '</div>';

            $(".userInfo").append(html);

            $(".userAchievements").empty();
            response.achievements.forEach(achievement => {
                var html = '<div class="d-flex align-items-center my-2">' +
                    '<img src="" alt="A" class="img-fluid mr-2">' +
                    '<span>' + achievement + '</span>' +
                    '</div>';

                $(".userAchievements").append(html);
            });
        }
    });
}

// Función para cargar los juegos del usuario
function loadUserGames(userId) {
    return $.ajax({
        url: "http://52.3.170.212:8080/api/games/user/" + userId,
        type: "GET",
        datatype: "json",
        success: function (response) {
            $(".userGames").empty();
            var contador = 0;
            response.forEach((game, index) => {
                if (index < 10) { // Asumiendo que solo queremos mostrar los primeros 10
                    var html = '<a href="#" class="list-group-item list-group-item-action bg-dark text-light my-2">' +
                        game.user_id + " - Level " + game.level + ", Wave " + game.wave + " - " +
                        '<small>' + game.date + '</small></a>';
                    $(".userGames").append(html);
                }
            });
        }
    });
}




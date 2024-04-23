$(document).ready(function () {
    initializeUserSession();
    //cargar el top 15 en la tabla
    $.ajax({
        url: "http://52.3.170.212:8080/api/games/top15",
        type: "GET",
        datatype: "json",
        success: function (response) {

            $(".list-group").empty();

            for (var i = 0; i < response.length; i++) {
                html = '<a href="#"' +
                    'class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">' +
                    '<div class="left-side d-flex align-items-center">' +
                    '<h5 class="mb-0">1</h5>' +
                    '<img src="' + response[i].profile_image + '" alt="Logo" class="img-fluid rounded-circle mr-2">' +
                    '<h5 class="mb-0">' + response[i].username + '</h5>' +
                    '</div>';
                puntuacion = (response[i].level * 1000 + response[i].wave * 100);
                html += '<small class="score">' + parseFloat(puntuacion).toFixed(2) + '</small>' +
                    '</a>';

                $(".list-group").append(html);

            }
        }
    });

    $(".buscadorbtn").click(function () {
        $(".list-group").empty();
        var parametros = {
            searchQuery: $(".buscador").val()
        };
        $.ajax({
            url: "http://52.3.170.212:8080/api/users/search",
            type: "GET",
            datatype: "json",
            data: parametros,
            success: function (response) {
                response.forEach(function(user) {
                    $.ajax({
                        url: "http://52.3.170.212:8080/api/games/user/" + user._id,
                        type: "GET",
                        datatype: "json",
                        success: function (games) {
                            games.forEach(function(game) {
                                var html = '<a href="#" class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">';
                                html += '<div class="left-side d-flex align-items-center">';
                                html += '<h5 class="mb-0">1</h5>'; // Asignar un número apropiado si es necesario
                                html += '<img src="' + user.profile_image + '" alt="Logo" class="img-fluid rounded-circle mr-2">';
                                html += '<h5 class="mb-0">' + user.username + '</h5>';
                                html += '</div>';
                                var puntuacion = (game.level * 1000 + game.wave * 100);
                                html += '<small class="score">' + parseFloat(puntuacion).toFixed(2) + '</small>';
                                html += '</a>';
                                $(".list-group").append(html);
                            });
                        }
                    });
                });
            }
        });
    });
    


});

async function initializeUserSession() {
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

            await loadUserRank(sessionResponse.userId);

        } catch (xhr) {
            console.log("Sesión no activa:", xhr.responseText);
            localStorage.removeItem('token');
            alert("Tu sesión ha expirado, por favor inicia sesión nuevamente.");
        }
    } else {
        console.log("No hay token almacenado, usuario no logueado.");
    }
}

async function loadUserRank(userId) {
    try {
        /*const rankResponse = await $.ajax({
            url: "http://52.3.170.212:8080/api/user-rank/" + userId,
            type: "GET"
        });*/

        // Supongamos que quieres reemplazar un div con clase 'rank-display' con la nueva información del rango
        $('#signInAlert').html(
        '<a href="#" class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">'+
            '<div class="left-side d-flex align-items-center">'+
                '<h5 class="mb-0">1</h5>'+
                '<img src="https://picsum.photos/40/40" alt="Logo" class="img-fluid rounded-circle mr-2">'+
                '<h5 class="mb-0">GH 9 ALI</h5>'+
            '</div>'+
            '<small class="score">1234</small>'+
        '</a>'
    );
    } catch (error) {

    }
}

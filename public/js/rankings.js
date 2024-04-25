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
                    '<img src="' + response[i].profile_image.replace("public/", "") + '" alt="Logo" class="img-fluid rounded-circle mr-2">' +
                    '<h5 class="mb-0">' + response[i].username + '</h5>' +
                    '</div>';
                puntuacion = (response[i].level * 1000 + response[i].wave * 100);
                html += '<small class="score">' + puntuacion + '</small>' +
                    '</a>';

                $(".list-group").append(html);

            }
        }
    });

    $("#rankUsers").on("change", function () {
        $(".list-group").empty();
        $(".buscador").val("");
        var parametros = {
            monsterIndex: $("#rankUsers").val() - 2
        };
        if (parametros.monsterIndex >= 0) {
            $.ajax({
                url: "http://52.3.170.212:8080/api/users/searchMonster",
                type: "GET",
                datatype: "json",
                data: parametros,
                success: function (response) {
                    response.forEach(function (user) {
                        var html = '<a href="#" class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">';
                        html += '<div class="left-side d-flex align-items-center">';
                        html += '<h5 class="mb-0">1</h5>'; // Asignar un número apropiado si es necesario
                        html += '<img src="' + user.profile_image.replace("public/", "") + '" alt="Logo" class="img-fluid rounded-circle mr-2">';
                        html += '<h5 class="mb-0">' + user.username + '</h5>';
                        html += '</div>';
                        html += '<small class="score">' + user.monsters_killed[parametros.monsterIndex] + '</small>';
                        html += '</a>';
                        $(".list-group").append(html);
                    });
                }
            });
        } else {
            var parametros = {
                searchQuery: ""
            };
            $.ajax({
                url: "http://52.3.170.212:8080/api/users/search",
                type: "GET",
                datatype: "json",
                data: parametros,
                success: function (response) {
                    response.forEach(function (user) {
                        var html = '<a href="#" class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">';
                        html += '<div class="left-side d-flex align-items-center">';
                        html += '<h5 class="mb-0">1</h5>'; // Asignar un número apropiado si es necesario
                        html += '<img src="' + user.profile_image.replace("public/", "") + '" alt="Logo" class="img-fluid rounded-circle mr-2">';
                        html += '<h5 class="mb-0">' + user.username + '</h5>';
                        html += '</div>';
                        html += '<small class="score">' + user.points + '</small>';
                        html += '</a>';
                        $(".list-group").append(html);
                    });
                }
            });
        }
    });

    $("#rankGames").on("change", function () {
        if ($("#rankGames").val() == 0){
            return;
        }
        $(".list-group").empty();
        $(".buscador").val("");
        var parametros = {
            sortIndex: $("#rankGames").val()
        };

        $.ajax({
            url: "http://52.3.170.212:8080/api/games/top15",
            type: "GET",
            datatype: "json",
            data: parametros,
            success: function (response) {

                for (var i = 0; i < response.length; i++) {
                    html = '<a href="#"' +
                        'class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">' +
                        '<div class="left-side d-flex align-items-center">' +
                        '<h5 class="mb-0">1</h5>' +
                        '<img src="' + response[i].profile_image.replace("public/", "") + '" alt="Logo" class="img-fluid rounded-circle mr-2">' +
                        '<h5 class="mb-0">' + response[i].username + '</h5>' +
                        '</div>';
                    var valor;
                    switch (parametros.sortIndex - 1) {
                        case 0:
                            valor = (response[i].level * 1000 + response[i].wave * 100);
                            break;
                        case 1:
                            valor = response[i].total_gold ? response[i].total_gold : 0;
                            break;
                        case 2:
                            valor = response[i].total_hearts ? response[i].total_hearts : 0;
                            break;
                        case 3:
                            valor = response[i].time_spent;
                            break;
                    }
                    valor =
                        html += '<small class="score">' + valor + '</small>' +
                        '</a>';

                    $(".list-group").append(html);

                }
            }
        });

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
                response.forEach(function (user) {
                    $.ajax({
                        url: "http://52.3.170.212:8080/api/games/user/" + user._id,
                        type: "GET",
                        datatype: "json",
                        success: function (games) {
                            games.forEach(function (game) {
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
    return $.ajax({
        url: "http://52.3.170.212:8080/api/games/user/" + userId,
        type: "GET",
        datatype: "json",
        success: function (response) {
            $("#signInAlert").empty();
            if (response.length == 0) {
                html = '<a href="#"' +
                'class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">' +
                '<div class="left-side d-flex align-items-center">' +
                '<h5 class="mb-0">You dont have any Games</h5>' +
                '</div>' +
                '</a>';
                 $("#signInAlert").append(html);
            } else {
                html = '<a href="#"' +
                'class="list-group-item list-group-item-action bg-secondary text-white d-flex justify-content-between align-items-center">' +
                '<div class="left-side d-flex align-items-center">' +
                '<img src="' + response[0].profile_image + '" alt="Logo" class="img-fluid rounded-circle mr-2">' +
                '<h5 class="mb-0">Your Last Game</h5>' +
                '</div>' +
                '<small class="score">' + (response[0].level * 1000 + response[0].wave * 100) + '</small>' +
                '</a>';
                 $("#signInAlert").append(html);
            }
            

            
        }
    });
}

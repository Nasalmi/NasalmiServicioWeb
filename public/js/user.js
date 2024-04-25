$(document).ready(function () {
    var profileImage = null;

    var profileImageDropzone = new Dropzone("#profileImageDropzone", {
        url: "#",
        autoProcessQueue: false,
        clickable: true,
        addRemoveLinks: true,
        maxFiles: 1,
        dictDefaultMessage: "Click here and select your image",
        acceptedFiles: "image/*",
        previewTemplate: document.querySelector('#preview-template').innerHTML,
    
        // Eventos
        init: function() {
            this.on("addedfile", function(file) {
                profileImage = file;
                if (this.files.length > 1) {
                    this.removeFile(this.files[0]);
                    
                }
                document.getElementById('profileImage').value = file.name;
            });
            this.on("removedfile", function(file) {
                document.getElementById('profileImage').value = '';
            });
        },
    });

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
                    fecha = new Date(response.birth_date).toISOString().split('T')[0];
                    $('#userInfoForm input[name="dateOfBirth"]').val(fecha);
                    $('#userInfoForm input[name="country"]').val(response.country);
                    $('#userInfoForm input[name="profileImage"]').val(response.profile_image);
                    $('#userInfoForm input[name="alias"]').val(response.nickname);
                    $('#userInfoForm textarea[name="description"]').val(response.desc);
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
        //var parametros = $('#userInfoForm').serialize(); // Serializa los datos del formulario
        var formData = new FormData();

        formData.append('profile_image', profileImage);

        // Crear una solicitud AJAX para cargar la imagen
        $.ajax({
            url: 'http://52.3.170.212:8080/api/upload',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                console.log('Ruta de la imagen subida:', response.filePath);
    
                // Ahora que la imagen se ha subido con éxito, podemos enviar los otros datos del formulario
                var parametros = {
                    birth_date: $('#userInfoForm input[name="dateOfBirth"]').val(),
                    country: $('#userInfoForm input[name="country"]').val(),
                    profile_image: response.filePath, // Utilizamos la ruta de la imagen subida
                    nickname: $('#userInfoForm input[name="alias"]').val(),
                    desc: $('#userInfoForm textarea[name="description"]').val()
                };
    
                // Realizar la solicitud AJAX para actualizar la información del usuario
                $.ajax({
                    url: 'http://52.3.170.212:8080/api/users/' + localStorage.getItem("userId"),
                    type: 'PUT',
                    data: parametros,
                    success: function(response) {
                        alert('User info updated successfully!');
                        window.location.reload();

                    },
                    error: function(error) {
                        console.error('Error updating user info:', error);
                    }
                });
            },
            error: function(error) {
                console.error('Error al subir la imagen:', error);
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
            var desc = response.desc ? response.desc : "You dont have a description";
            var html = '<img src="http://nasalmi.duckdns.org/' + response.profile_image.replace("public/", "") + '" alt="User" class="img-fluid rounded-circle mr-3 img-thumbnail">' +
                '<div>' +
                '<h2 class="title-line">' + response.username + '</h2>' +
                '<p>' + response.email + '</p>' +
                '<p>' + desc + '</p>' +
                '</div>';

            $(".userInfo").append(html);

            $(".userStats").empty();
            var monstersKilled = 0;
            for (var i = 0; i < 5; i++) {
                try {
                    monstersKilled += response.monsters_killed[i];
                } catch (error) {
                    monstersKilled += 0;
                }
            }
            var score = response.points ? response.points : 0;
            var html = '<h4 class="title-line">User Stats</h4>' +
                '<div class="row">' +
                '<div class="col-md-6">' +
                '<p>Nickname: ' + response.nickname + '</p>' +
                '<p>Monsters killed: ' + monstersKilled + '</p>' +
                '</div>' +
                '<div class="col-md-6">' +
                '<p>Achievements unlocked: ' + response.achievements.length + '</p>' +
                '<p>Achievements Score: ' + score + '</p>' +
                '</div>' +
                '</div>';
            $(".userStats").append(html);

            $(".userAchievements").empty();
            response.achievements.forEach(achievement => {
                var html = '<div class="d-flex justify-content-between align-items-center my-2">' +
                            '<div>' + // Añadido un div para agrupar el img y el primer span
                                '<img src="' + achievement.icon + '" alt="A" class="img-fluid mr-2">' +
                                '<span>' + achievement.name + '</span>' +
                            '</div>' +
                            '<span>' + achievement.points + '</span>' +
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




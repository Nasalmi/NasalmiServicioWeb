$(document).ready(function() {
    $('#logoutButton').on('click', function() {
        $.ajax({
            url: '/api/logout',
            type: 'GET',
            success: function(response) {
                console.log(response.message);
                // Limpiar localStorage o cualquier otro almacenamiento en el cliente
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                // Redirigir al usuario a la página de inicio de sesión o a la página principal
                window.location.reload();
            },
            error: function(xhr) {
                console.error("Error al cerrar la sesión:", xhr.responseText);
            }
        });
    });

    
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
                  // Guardar el token en localStorage
                localStorage.setItem('token', response.token);
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

    $('#registerEmail').on('keypress', function(e) {
        if (e.which == 13) {  // 13 es el código de tecla para 'Enter'
            e.preventDefault();  // Prevenir el comportamiento por defecto del formulario

            var email = $(this).val();
            var email = $(this).val();
            if (!validateEmail(email)) {
                $(this).addClass('is-invalid');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please enter a valid email address.'
                  });
                return;
            }
            $(this).removeClass('is-invalid');
            if (email) {  // Verifica que el campo no esté vacío
                $.ajax({
                    url: 'http://52.3.170.212:8080/api/validMail',
                    type: 'POST',
                    data: { email: email },
                    success: function(response) {
                        if (response.exists) {
                            $('#registerEmail').addClass('is-invalid');
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Email already exists!'
                              });
                        } else {
                            $('#registerEmail').removeClass('is-invalid');
                            $('#usernameGroup').removeClass('d-none');
                            $('#usernameGroup input').focus();
                            animateElement('#usernameGroup input');
                        }
                    },
                    error: function() {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Error checking email!'
                          });
                    }
                });
            }
        }
    });

    $('#username').on('keypress', function(e) {
        if (e.which == 13) {
            e.preventDefault();
    
            var username = $(this).val();
            if (username) {
                $.ajax({
                    url: 'http://52.3.170.212:8080/api/validName',
                    type: 'POST',
                    data: { username: username },
                    success: function(response) {
                        if (response.exists) {
                            $('#username').addClass('is-invalid');
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Username already exists!'
                              });
                        } else {
                            $('#username').removeClass('is-invalid');
                            $('#passwordGroup').removeClass('d-none');
                            $('#passwordGroup input').focus();
                            animateElement('#passwordGroup input');
                            
                        }
                    },
                    error: function() {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Error checking username!'
                          });
                    }
                });
            }
        }
    });

    $('#registerEmail, #username').on('input', function() {
        if (this.id === 'registerEmail') {
            $('#usernameGroup, #passwordGroup, #confirmPasswordGroup, #btnRegister').addClass('d-none');
        } else if (this.id === 'username') {
            $('#passwordGroup, #confirmPasswordGroup, #btnRegister').addClass('d-none');
        }
    });
    
    
    $('#registerPassword').on('keypress', function(e) {
        if (e.which == 13) {  // Presionar 'Enter'
            e.preventDefault();  // Prevenir cualquier acción predeterminada
            var password = $(this).val();
            if (isValidPassword(password)) {
                $(this).removeClass('is-invalid');
                $('#confirmPasswordGroup').removeClass('d-none').focus();
                $('#confirmPasswordGroup input').focus();
                animateElement('#confirmPasswordGroup input');
            } else {
                $(this).addClass('is-invalid');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Your password must include at least one number, one uppercase letter, and be at least 6 characters long.'
                  });
            }
        }
    });

    $('#confirmPassword').on('keypress', function(e) {
        if (e.which == 13) {  // Presionar 'Enter'
            e.preventDefault();
            var confirmPassword = $(this).val();
            var originalPassword = $('#registerPassword').val();
            if (confirmPassword === originalPassword) {
                $(this).removeClass('is-invalid');
                $('#btnRegister').removeClass('d-none');  // Mostrar el botón de registro
            } else {
                $(this).addClass('is-invalid');
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Passwords do not match.'
                  });
            }
        }
    });
    
});

$('#btnRegister button').click(function(e) {
    e.preventDefault();
    var email = $('#registerEmail').val();
    var username = $('#username').val();
    var password = $('#registerPassword').val();
    var confirmPassword = $('#confirmPassword').val();

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    $.ajax({
        url: 'http://52.3.170.212:8080/api/users',  // Asegúrate de que la URL es correcta
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            email: email,
            username: username,
            password: password,
            profile_image: "",
            achievements: [],
            settings: {}
        }),
        success: function(response) {
            // Suponiendo que el servidor también autentica al usuario y devuelve un token
            localStorage.setItem('token', response.token);  // Guardar el token en localStorage
            window.location.reload();  // Redireccionar a una página segura
        },
        error: function(xhr, status, error) {
            console.error('Registration failed:', xhr.responseText);
            alert(xhr.responseText);  // Mostrar error al usuario
        }
    });
});


function validateForm() {
    var isValid = true;
    $('.form-control').each(function() {
        if ($(this).is(':visible') && !$(this).val()) isValid = false;
    });
    return isValid;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function isValidPassword(password) {
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return re.test(password);
}

function animateElement(selector) {
    $(selector).css({
        width: 0,   // Comienza desde 0
        opacity: 0  // Comienza completamente transparente
    });

    anime({
        targets: selector,
        width: ['0%', '100%'],  // Anima desde 0% al ancho original
        opacity: [0, 1],        // Anima la opacidad de 0 a 1
        backgroundColor: ['#fff0', '#fff'], // Anima el color de fondo desde transparente a blanco
        boxShadow: ['0px 0px 0px rgba(0,0,0,0)', '10px 15px 25px rgba(0,0,0,0.5)'], // Anima la sombra
        duration: 1200,
        easing: 'easeOutExpo',
        update: function(anim) {
            var progress = Math.round(anim.progress);
            $(selector).css('bakground-color', `rgba(255, ${progress * 2.55}, 0, 1)`);  // Cambia de negro a rojo brillante según el progreso
        }
        ,
        complete: function(anim) {
            // Esto se ejecuta después de completar la animación
            // Útil para desencadenar otras acciones después
        }
    });
}

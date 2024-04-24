$(document).ready(function() {
    initializeUserSession();
    $('.btn-prev').click(function() {
        // Navega hacia arriba en el DOM para encontrar el contenedor de la sección específica
        var $section = $(this).closest('.game-section');
        var $currentImg = $section.find('.section-image.active');
        var $prevImg = $currentImg.prev('.section-image').length ? $currentImg.prev('.section-image') : $section.find('.section-image').last();
        
        $currentImg.fadeOut(300, function() {
          $currentImg.removeClass('active');
          $prevImg.fadeIn(300).addClass('active');
        });
      });
    
      $('.btn-next').click(function() {
        // Navega hacia arriba en el DOM para encontrar el contenedor de la sección específica
        var $section = $(this).closest('.game-section');
        var $currentImg = $section.find('.section-image.active');
        var $nextImg = $currentImg.next('.section-image').length ? $currentImg.next('.section-image') : $section.find('.section-image').first();
        
        $currentImg.fadeOut(300, function() {
          $currentImg.removeClass('active');
          $nextImg.fadeIn(300).addClass('active');
        });
      });

  
    // Vinculamos el botón con la función scrollToNextSection
    $('.btnSeccion1').click(function() {
        scrollToNextSection('#seccion2');
    });
    $('.btnSeccion2').click(function() {
        scrollToNextSection('#seccion3');
    });
    $('.btnSeccion3').click(function() {
        scrollToNextSection('#seccion4');
    });
    $('.btnSeccion4').click(function() {
        scrollToNextSection('#seccion5');
    });
    $('.btnSeccion5').click(function() {
        scrollToNextSection('#seccion1');
    });
  

  });

function scrollToNextSection(siguiente) {
    var $nextSection = $(siguiente);
    if ($nextSection.length) {
        
        $('html, body').animate({ 
            scrollTop: $nextSection.offset().top
        }, 500);
    }
}

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
  

// vamos a cargar los 4 primeros puntuaciones en la carga de la pagina
$(document).ready(function(){
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
$(document).ready(function () {
    // cargamos todos los logros
    $.ajax({
        url: "http://52.3.170.212:8080/api/achievements",
        type: "GET",
        datatype: "json",
        success: function (response) {

            $(".logros").empty();

            for (var i = 0; i < response.length; i++) {
                html = "<tr>" +
                    "<td><img src='" +  response[i].icon +"' alt='Logro' class='achievement-icon'></td>" +
                    "<td>" + response[i].name + "</td>" +
                    "<td>" + response[i].description + "</td>";
                    var numbers = [5, 10, 15];
                    var randomNum = numbers[Math.floor(Math.random() * numbers.length)];

                html += "<td>" + randomNum + "</td>" +
                    "<td>" + "90%" + "</td>" +
                    "</tr>";


                $(".logros").append(html);

            }
        }
    });

    $(".tipoLogro").change(function () {
        if ($(".tipoLogro").val() == 1) {
            // Recorremos todos los tr de la tabla logros y ocultamos todos los que no contengan la palabra zombie o fantasma
            $(".logros tr").each(function () {
                if ($(this).text().toLowerCase().indexOf("zombie") == -1 && $(this).text().toLowerCase().indexOf("fantasma") == -1) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        } else if ($(".tipoLogro").val() == 2) {
            // Recorremos todos los tr de la tabla logros y ocultamos todos los que no contengan la palabra zombie o fantasma
            $(".logros tr").each(function () {
                if ($(this).text().toLowerCase().indexOf("zombie") >= 0 || $(this).text().toLowerCase().indexOf("fantasma") >= 0) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        } else {
            $(".logros tr").show();
        }
            
    });

});
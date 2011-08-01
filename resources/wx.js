function getwx() {

    var station_id = 'KDCA'

    var query = "select temp_f, weather from xml where url='http://www.weather.gov/xml/current_obs/"+station_id+".xml'";

    var url = "http://query.yahooapis.com/v1/public/yql?q="+encodeURI(query)+"&format=json&callback=?";

    $.getJSON(url, function(data) {
        console.log(data);
        $("#wx span.obs").html(data.query.results.current_observation.weather);
        var temp_string = data.query.results.current_observation.temp_f.substring(0,2) + " ºF"
        $("#wx span.temp").html(temp_string);

    });

}
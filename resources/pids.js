function updatePredictions(apikey, rtu, numtrains) {
    $.getJSON("http://api.wmata.com/StationPrediction.svc/json/GetPrediction/"+ rtu +"?callback=?&api_key=" + apikey,
              function(data) {
                  $("#predictions tbody").children().remove();
                  $.each(data['Trains'].slice(0, numtrains),
                         function(key, val) {
                             if (val['Line'] != "" && val['Car'] != "" && val['DestinationName'] != "" && val['Min'] != "") {

                                 var lnclass, minclass;

                                 if (val['Line'] != "--") {
                                     lnclass = " class=\""+val['Line'].toLowerCase()+"\"";
                                 } else {
                                     lnclass = "";
                                 }

                                 if (val['Min'] == 'BRD' || val['Min'] == 'ARR') {
                                     minclass = " class=\"flash\"";
                                 } else {
                                     minclass = "";
                                 }

                                 $("#predictions tbody").append("<tr><td"+lnclass+">"+val['Line']+"</td><td>"+val['Car']+
                                                                "</td><td><span class='dest'>"+val['DestinationName']+
                                                                "</span></td><td"+minclass+">"+
                                                                val['Min']+"</td></tr>");

                             }
                         });
              });
}

function updateIncidents(apikey) {
    var url = "http://api.wmata.com/Incidents.svc/json/Incidents" +"?callback=?&api_key=" + apikey;
    $.getJSON(url,
              function(data) {
                  $("#incidents").marquee("pause");
                  $("#incidents").children().remove();
                  $.each(data['Incidents'], function(key, value) {
                      var lines, linespans;
                      lines = value['LinesAffected'].split(';');
                      linespans = [];
                      $.each(lines, function(key, value) {
                          if (value != ' ') {
                              linespans.push("<span class=\""+value.toLowerCase()+"\">"+value+"</span>");
                          }
                      });
                      $("#incidents").append("<li><span class=\"lines\">"+linespans.join(',')+" Alert:</span>"+value['Description']+"</li>");
                  });
                  $("#incidents").marquee("update");
                  $("#incidents").marquee("resume");
              });

}

function initializeDisplay(apikey, rtu, numtrains) {
    var url = "http://api.wmata.com/Rail.svc/json/JStationInfo?StationCode=" + rtu + "&callback=?&api_key=" + apikey;

    $.getJSON(url,
              function(data) {
                  var rtus, SECOND, doUpdatePred, doUpdateIncidents, intervalIDPred, intervalIDIncidents;
                  SECOND = 1000;

                  rtus = [rtu];

                  $('#stationname').text(data['Name']);
                  if (data['StationTogether1'] != '') {
                      rtus.push(data['StationTogether1']);
                  }

                  doUpdatePred = function(){updatePredictions(apikey, rtus.join(','), numtrains);};
                  doUpdatePred();
                  intervalIDPred = setInterval(doUpdatePred, 20*SECOND);

	          $("#incidents").marquee({yScroll: "bottom", pauseSpeed: 1500, scrollSpeed: 10, pauseOnHover: false,
                                           beforeshow: function ($marquee, $li) {
                                               var lines = $li.find(".lines");
				               $("#lines").html(lines.html()).fadeIn(1000);
			                   },
                                          aftershow: function ($marquee, $li) {
                                              $("#lines").hide();
                                           }
                                          });

                  doUpdateIncidents = function(){updateIncidents(apikey);};
                  doUpdateIncidents();
                  intervalIDIncidents = setInterval(doUpdateIncidents, 120*SECOND);
              });
}

$(document).ready(function(){
    var newsize, dh, oneRow, empx, estCrawlHeight, availableSpace, numTrains, error;

    newsize = ((($(window).width()*62.5)/$('#predictions').outerWidth()) * 0.95);
    $('body').css('font-size', newsize + '%');
    
    dh = $($('#predictions thead tr').children()[2]);
    dh.css('width', dh.innerWidth());
    
    oneRow = $('#predictions tbody tr').outerHeight();
    empx = (10*newsize)/62.5;
    estCrawlHeight = 6 * empx;
    availableSpace = ($(window).height()-$('#stationname').outerHeight()-$('#predictions').outerHeight()+oneRow-estCrawlHeight);
    
    numTrains = Math.floor(availableSpace/oneRow);

    error = false;
    
    if (typeof apikey === 'undefined') {
        $('#predictions tbody').append('<tr class="flash"><td colspan="4">Error: API key not defined.</td></tr>');
        error = true;
    }

    if (typeof rtu === 'undefined') {
        $('#predictions tbody').append('<tr class="flash"><td colspan="4">Error: Station RTU not defined.</td></tr>');
        error = true;
    }
        
    if (!error) {
        initializeDisplay(apikey, rtu, numTrains);
    }
});
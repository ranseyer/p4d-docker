/*
 *  list.js
 *
 *  (c) 2020 Jörg Wendel
 *
 * This code is distributed under the terms and conditions of the
 * GNU GENERAL PUBLIC LICENSE. See the file COPYING for details.
 *
 */

function initList(widgets, root)
{
   if (!widgets)
   {
      console.log("Fatal: Missing payload!");
      return;
   }

   root.innerHTML = "";
   var elem = document.createElement("div");
   elem.className = "chartTitle rounded-border";
   elem.innerHTML = "<center id=\"refreshTime\">Messwerte von " + lastUpdate + "</center>";
   root.appendChild(elem);

   // build page content

   for (var i = 0; i < widgets.length; i++) {
      var html = "";
      var widget = widgets[i];
      var id = "id=\"widget" + widget.type + widget.address + "\"";

      if (widget.widgettype == 1 || widget.widgettype == 3) {      // 1 Gauge or 3 Value
         html += "<span class=\"listFirstCol\"" + id + ">" + widget.value.toFixed(2) + "&nbsp;" + widget.unit;
         html += "&nbsp; <p style=\"display:inline;font-size:12px;font-style:italic;\">(" + widget.peakmin.toFixed(2) + "/" + widget.peak.toFixed(2) + ")</p>";
         html += "</span>";
      }
      else if (widget.widgettype == 0) {   // 0 Symbol
         html += "   <div class=\"listFirstCol\" onclick=\"toggleIo(" + widget.address + ",'" + widget.type + "')\"><img " + id + "/></div>\n";
      }
      else {   // 2 Text
         html += "<div class=\"listFirstCol\"" + id + "></div>";
      }

      html += "<span class=\"listSecondCol listText\" >" + widget.title + "</span>";

      var elem = document.createElement("div");
      elem.className = "listRow";
      elem.innerHTML = html;
      root.appendChild(elem);
   }
}

function updateList(sensors)
{
   var refreshTime = document.getElementById("refreshTime");

   if (refreshTime != null)
      refreshTime.innerHTML = "Messwerte von " + lastUpdate;

   // heating state

   var rootStateS3200 = document.getElementById("stateContainerS3200");

   switch (s3200State.state) {
      case 0:  style = "aStateFail";     break;
      case 3:  style = "aStateHeating";  break;
      case 19: style = "aStateOk";       break;
      default: style = "aStateOther"
   }

   d = new Date(s3200State.time * 1000);

   html = '<div><span id="' + style + '">' + s3200State.stateinfo + '</span></div>\n';
   html += '<br/>\n';
   html += '<div style="display:flex;"><span style="width:30%;display:inline-block;">Uhrzeit:</span><span>' + d.toLocaleTimeString() + '</span></div>\n';
   html += '<div style="display:flex;"><span style="width:30%;display:inline-block;">Betriebsmodus: </span><span>' + s3200State.modeinfo + '</span></div>\n';

   rootStateS3200.innerHTML = html;

   // state image
   var rootStateImage = document.getElementById("stateContainerImage");

   html = '<img src="' + s3200State.image + '">\n';

   rootStateImage.innerHTML = html;

   // daemon state
   var rootStateP4 = document.getElementById("stateContainerP4");

   if (daemonState.state != null && daemonState.state == 0)
   {
      html =  '<div id="aStateOk"><span style="text-align: center;">Heating Control ONLINE</span></div>';
      html +=  '<br/>\n';
      html +=  '<div style="display:flex;"><span style="width:30%;display:inline-block;">Läuft seit:</span><span display="inline-block">' + daemonState.runningsince + '</span></div>\n';
      html +=  '<div style="display:flex;"><span style="width:30%;display:inline-block;">Version:</span> <span display="inline-block">' + daemonState.version + '</span></div>\n';
      html +=  '<div style="display:flex;"><span style="width:30%;display:inline-block;">CPU-Last:</span><span display="inline-block">' + daemonState.average0 + " " + daemonState.average1 + ' '  + daemonState.average2 + ' ' + '</span></div>\n';
   }
   else
   {
      html = '<div id="aStateFail">ACHTUNG:<br/>Heating Control OFFLINE</div>\n';
   }

   rootStateP4.innerHTML = html;


   for (var i = 0; i < sensors.length; i++)
   {
      var sensor = sensors[i];
      var id = "#widget" + sensor.type + sensor.address;

      if (sensor.widgettype == 1 || sensor.widgettype == 3) {
         $(id).html(sensor.value.toFixed(2) + "&nbsp;" + sensor.unit +
                    "&nbsp; <p style=\"display:inline;font-size:12px;font-style:italic;\">(" + sensor.peakmin.toFixed(2) + "/" + sensor.peak.toFixed(2) + ")</p>");
      }
      else if (sensor.widgettype == 0)    // Symbol
         $(id).attr("src", sensor.image);
      else if (sensor.widgettype == 2)    // Text
         $(id).html(sensor.text);
      else
         $(id).html(sensor.value.toFixed(0));

      // console.log(i + ") " + sensor.widgettype + " : " + sensor.title + " / " + sensor.value + "(" + id + ")");
   }
}

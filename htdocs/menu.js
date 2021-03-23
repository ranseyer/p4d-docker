/*
 *  menu.js
 *
 *  (c) 2020 Jörg Wendel
 *
 * This code is distributed under the terms and conditions of the
 * GNU GENERAL PUBLIC LICENSE. See the file COPYING for details.
 *
 */

var actualParent = 1;   // the current parent of the menu items (the level of the menu)

function initMenu(menu, root)
{
   // console.log(JSON.stringify(menu, undefined, 4));

   var menuButtons = root.querySelector("#menuButtons");

   menuButtons.innerHTML = "";

   if (menu.last > 0) {
      var elem = document.createElement("div");
      elem.innerHTML = menu.title;
      elem.className = "menuButtonCaption rounded-border";
      elem.setAttribute("onclick", "menuSelected(" + menu.last + ")");
      menuButtons.appendChild(elem);
   }

   for (var i = 0; i < menu.items.length; i++) {
      var html = "";
      var item = menu.items[i];
      var elem = document.createElement("div");
      var val = item.value;

      actualParent = item.parent;   // all items in the loop should have the same parent !!
      html = '<div style="display:flex;">' + item.title;

      if (item.child) {
         elem.setAttribute("onclick", "menuSelected(" + item.child + ")");
         elem.className = "menuButton rounded-border";
      }
      else if (item.value != null) {
         if (item.type == 0x08) {
            html += '<input id="chkState_' + item.address + '" class="input rounded-border" type="checkbox"'
               + (parseBool(item.value) ? 'checked' : '') + ' disabled><label for="chkState_' + item.address + '"></label>';
         }
         else {
            html += ": " + val + " " + item.unit;
         }
         elem.className = "menuButtonValue rounded-border";
      }
      else {
         elem.className = "menuButtonHead rounded-border";
      }

      html += '</div>';
      elem.innerHTML += html;

      if (item.editable) {
         elem.setAttribute("onclick", "menuEditRequest(" + item.id + "," + item.address + "," + item.range + "," + actualParent + ")");
         elem.className = "menuButtonValue menuButtonValueEditable rounded-border";
      }

      menuButtons.appendChild(elem);
   }
}

function editMenuParameter(parameter, root)
{
   console.log(JSON.stringify(parameter, undefined, 4));

   var inpStep = 'step="0.1"';
   var info = '<div style="font-size:smaller;padding-left: 30px;">(' +
       (parameter.def != null ? 'Default ' + parameter.def + ' ' + parameter.unit + ', ' : '') +
       'Adresse 0x' + parameter.address.toString(16) +
       ', Typ 0x' + parameter.type.toString(16) + ')</div>';

   var timeRange = null;
   var form = '<form id="dlgForm">';

   if (parameter.type == 0x0a) {
      timeRange = parameter.value.split("-");
      form +=
         '<div id=timepicker class="timerangepicker">' +
         '  <div class="timepicker" id="timeFrom">';
      if (timeRange.length > 1) {
         form += '</div>  <div style="align-self:center;width:90px;">' + ' bis ' + '</div>' +
            '  <div class="timepicker" id="timeTo">';
      }
      form += '  </div><div style="align-self:center;width:50px;">' + parameter.unit + '</div>' + info +
         '</div>';
   }
   else {
      form += '<div>' + 'Bereich: ' + parameter.min + ' - ' + parameter.max + parameter.unit + '<br/>' + '</div><br/>';
      form += '<div style="display:flex;justify-content:center;align-items:center;">';
      if (parameter.type == 0x07) {
         var step = 1 / Math.pow(10, parameter.digits);
         var value = parseFloat(parameter.value.replace(',', '.')).toFixed(parameter.digits);
         form += '<input class="input rounded-border" type="number" min="' + parameter.min + '" max="'
            + parameter.max + '" step="' + step + '" value="' + value + '" name="input"/>';
      }
      else if (parameter.type == 0x08) {
         form += '<input id="input" class="input rounded-border" type="checkbox" name="input"' + (parseBool(parameter.value) ? 'checked' : '') + '><label for="input"></label>';
      }
      else {
         form += '<input class="input rounded-border" type="text" value="' + parameter.value + '" name="input"/>';
      }
      form += parameter.unit + info;
      form += '</div><br/>';
   }

   form += '</form>';

   $(form).dialog( {
      modal: true,
      width: (parameter.type == 0x0a ? "40%" : "60%"),
      title: parameter.title,
      buttons: {
         'Speichern': function () {
            var value = $('input[name="input"]').val();
            if (parameter.type == 0x0a) {
               var from = $("#timeFrom").picktim('val');
               if (timeRange.length > 1) {
                  var to = $("#timeTo").picktim('val');
                  if (from.length == 5 && to.length == 5)
                     value = from + " - " + to;
               }
               else {
                  value = from;
               }
            }
            if (parameter.type == 0x08) {
               value = $('input[name="input"]').is(':checked') ? "ja" : "nein";
            }
            else if (parameter.type == 0x07) {
               value = value.replace('.', ',');
            }
            storeParameter(parameter.id, value, parameter.address, parameter.range, parameter.parent);
            $(this).dialog('close');
         },
         'Abbrechen': function () {
            $(this).dialog('close');
         }
      },
      open: function() {
         if (parameter.type == 0x0a) {
            $("#timeFrom").picktim({
               mode: 'h24',
               width: '180px',
               position: 'fixed',
               appendTo: '#timepicker',
               orientation: 'topLeft',
               defaultValue: timeRange[0].trim()
            });
            if (timeRange.length > 1) {
               $("#timeTo").picktim({
                  mode: 'h24',
                  width: '180px',
                  position: 'fixed',
                  appendTo: '#timepicker',
                  orientation: 'topLeft',
                  defaultValue: timeRange[1].trim()
               });
            }
         }
      },
      close: function() { $(this).dialog('destroy').remove(); }
   });

   function storeParameter(id, value, address, range, parent) {
      console.log("storing '" + value + "' to address 0x" + address.toString(16)  + " timeN: " + range);
      socket.send({ "event" : "parstore", "object" :
                    { "id"  : id,
                      "value" : value,
                      "address" : address,
                      "range" : range,
                      "parent" : parent
                    }});
   }
}

function updateTimeRanges()
{
   console.log("updateTimeRanges");
   showProgressDialog();
   socket.send({ "event" : "updatetimeranges", "object" : { "parent" : actualParent } });
}

window.menuSelected = function(child)
{
   showProgressDialog();
   socket.send({ "event" : "menu", "object" : { "parent"  : child }});
}

window.menuEditRequest = function(id, address, range, parent)
{
   console.log("menuEdit " + id);
   socket.send({ "event" : "pareditrequest", "object" :
                 { "id"  : id,
                   "address" : address,
                   "range" : range,
                   "parent" : parent
                 }});
}

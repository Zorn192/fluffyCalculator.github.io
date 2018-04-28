// ==UserScript==
// @name         Map at zone visible
// @namespace    bhad#0931
// @version      0.1
// @description  move the map at zone
// @require  http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @author       bhad#0931
// @match        trimps.github.io/
// @grant        none
// ==/UserScript==

document.body.onload = addElement;

var addtext = `<div class="battleSideBtnContainer" style="display: block;" >
Map At Zone: <input style="width:40px" id='mapAtZoneInput' onkeyup="saveMapAtZone()"/>
</div>`;

function addElement () {
    $("#battleBtnsColumn").append (addtext);
    $("#mapAtZoneInput").val(game.options.menu.mapAtZone.setZone);
}

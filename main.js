/* jshint esversion: 6 */
function handle_paste(ev) {
  var save_string = ev.clipboardData.getData("text/plain").replace(/\s/g, '');
  game = JSON.parse(LZString.decompressFromBase64(save_string));
  $("#error").hide();
  fillOnce();
  update();
  charts();
  if ($("#hiddenText").is(":visible")) stealth(true);
}
$(document).ready(function() {
  correctLocalStorage();
  getLocalStorage();
  changeTheme(fluffyCalculator.theme);
});
// Runs all functions (try to stay in order)
function fall() {
  update();
  charts();
}
// Makes charts
function charts() {
  getRunsToLevelUp();
  getZoneToLevelUp();
}
//Vars
var avgDailyNPure = avgDaily(500);
var avgDailyN = avgDailyNPure;
var prestigeEM = 5;
var firstLevel = 1000;
var growth = 4;
var expGrowth = 1.015;
var specialBonus = 1;
var dailyBonus = 1;
var heirloomBonus = 1;
var zoneYP = 0;
var maxEvolution = 9;
var startToEarn = 301;
var buffsToExp;
var fluffyCalculator = {
  spireBonus: "",
  minutesPerRun: 0,
  theme: "light",
  instantUpdating: false,
};
//Get fluffy level
function calculateLevel() {
  var level = Math.floor(Math.log(((game.global.fluffyExp / getFirstLevel()) * (growth - 1)) + 1) / Math.log(growth));
  var capableLevels = game.portal.Capable.level;
  // if (level > capableLevels) level = capableLevels;
  currentLevel = level;
  return level;
}
// Gets 1000xPrestigeGrowth
function getFirstLevel() {
  var prestigeRequire = Math.pow(prestigeEM, game.global.fluffyPrestige);
  return firstLevel * prestigeRequire;
}
//removeExp input E/L and returns the right xp to remove
function removeExp(e, l) {
  if (l == 10) return 0;
  return Math.floor(firstLevel * Math.pow(prestigeEM, e) * ((Math.pow(growth, l) - 1) / (growth - 1)));
}
//evaluates how much xp is needed to level
function upgrade(e, l) {
  return Math.floor(firstLevel * Math.pow(prestigeEM, e) * ((Math.pow(growth, l + 1) - 1) / (growth - 1)) - removeExp(e, l));
}

function zoneXP(start, end) {
  // So if you start at zone 0, it wouldn't count you're gaining xp at there.
  if (start < startToEarn) {
    start = startToEarn;
  }
  var mcalc1 = (Math.pow(expGrowth, (end - startToEarn)) - 1) / (expGrowth - 1);
  var mcalc2 = (50 + (game.portal.Curious.level * 30)) * (1 + (game.portal.Cunning.level * 0.25)) * buffsToExp;
  // Starting spire bonus information
  zones = [];
  addSpireBonus = 0;
  if (fluffyCalculator.spireBonus != "") {
    var spires = fluffyCalculator.spireBonus.split(",");
    for (var s in spires) {
      zones[s] = (parseInt(spires[s]) + 1) * 100;
    }
    for (var z in zones) {
      if (start < zones[z] && zones[z] < end) {
        addSpireBonus += zoneXP(zones[z], zones[z] + 1) * 2;
      }
    }
  }
  if (start > startToEarn) {
    return (((mcalc1 * mcalc2) + addSpireBonus) - zoneXP(0, (start)));
  } else {
    return ((mcalc1 * mcalc2) + addSpireBonus);
  }
}
// fills stuff from your save
var currentExp;
var neededExp;

function fillOnce() {
  getLocalStorage();
  updateValuesFromSave();
  currentExp = Math.ceil(game.global.fluffyExp - removeExp(game.global.fluffyPrestige, calculateLevel()));
  neededExp = upgrade(game.global.fluffyPrestige, calculateLevel());
}

function update() {
  avgDailyN = avgDailyNPure + (isRewardActive("dailies") * 100);
  // mins per run
  if ($("#MPR").val()) $("#showTime").show();
  if (!$("#MPR").val() || $("#MPR").val() <= 0) $("#showTime").hide();
  buffsToExp = getExpBonus();
  check = (zoneYP > startToEarn) ? ($("#ZoneYP").removeClass("has-error")) : ($("#ZoneYP").addClass("has-error"));
  // top title bar
  document.getElementById("fluffyHelium").innerHTML ="<span title ='% of helium spent on fluffy \n " + countHelium("title") + "'>" + countHelium("percent") + "  <span  class ='noselect astext' onclick='stealth(false)'>%</span> spent" + "</span>";
  document.getElementById("fluffyLevel").innerHTML = "<span title='This is your current fluffy evolution and level'> E<span contenteditable id='inputE'>" + game.global.fluffyPrestige + "</span>L<span contenteditable id='inputL'>" + calculateLevel() + "</span>";
  document.getElementById("xpTA").innerHTML = "<span id='inputXP' title = " + numberWithCommas(currentExp) + ">" + prettify(currentExp) + "</span> <span title = 'Need " + numberWithCommas(neededExp - currentExp) + " Exp'" + "> / </span> <span title =" + numberWithCommas(neededExp) + ">" + prettify(upgrade(game.global.fluffyPrestige, calculateLevel())) + " exp</span";
  document.getElementById("fluffyDamage").innerHTML = "<span title='This is your current damage %'> +" + prettify(((getDamageModifier(calculateLevel(), currentExp, neededExp, game.global.fluffyPrestige)) - 1) * 100) + "% damage" + "</span>";
  document.getElementById("currentZone").innerHTML = game.global.world;
  // right column
  var xpPerRun = zoneXP(0, zoneYP); // So you only do a function once.
  document.getElementById("yourHelium").innerHTML = "Helium: " + prettify(game.global.totalHeliumEarned);
  document.getElementById("xpPerRun").innerHTML = "XP Per Run: " + numberWithCommas(Math.ceil(xpPerRun));
  document.getElementById("dailyPToLevel").innerHTML = "Needed Daily: " + getneededPercent();
  document.getElementById("percentOfLevel").innerHTML = "You have " + prettify((currentExp / neededExp) * 100) + "% of level";
  document.getElementById("currentZone").innerHTML = "Current Zone: " + game.global.world;
  document.getElementById("bonesToLevel").innerHTML = "Bones To Level: " + bonestolevel();
  if (fluffyCalculator.minutesPerRun > 0) document.getElementById("fluffyHR").innerHTML = "Fluffy XP/hr: " + numberWithCommas(Math.ceil(((xpPerRun / fluffyCalculator.minutesPerRun) * 60)));
  else document.getElementById("fluffyHR").innerHTML = "";
  saveLocalStorage();
}

function bonestolevel() {
  if (game.stats.bestFluffyExp.valueTotal == 0) {
    return "N/A";
  } else {
    return prettify(Math.ceil(((neededExp - currentExp) / game.stats.bestFluffyExp.valueTotal)) * 100);
  }
}

function graphNextLevel() {
  game.global.world = 0;
  dailyBonus = 1;
  $("#DailyModifier").val("0");
  fall();
}
//getTime
function sformat(s) {
  var fm = [
    Math.floor(s / 60 / 60 / 24), // DAYS
    Math.floor(s / 60 / 60) % 24, // HOURS
    Math.floor(s / 60) % 60, // MINUTES
    Math.floor(s % 60) // SECONDS
  ];
  return $.map(fm, function(v, i) {
    return ((v < 10) ? '0' : '') + v;
  }).join(':');
}
// Count fluffy spent
function countHelium(type) {
  var output = "";
  allHelium = game.global.totalHeliumEarned;
  var capableCost = game.portal.Capable.heliumSpent;
  var cunningCost = game.portal.Cunning.heliumSpent;
  var curiousCost = game.portal.Curious.heliumSpent;
  var classyCost = game.portal.Classy.heliumSpent;
  if (type == "title") {
    output += "Capable: " + prettify(capableCost / allHelium * 100) + "%";
    output += "\n Cunning: " + prettify(cunningCost / allHelium * 100) + "%";
    output += "\n Curious: " + prettify(curiousCost / allHelium * 100) + "%";
    output += "\n Classy: " + prettify(classyCost / allHelium * 100) + "%";
  }
  if (type == "percent") {
    output += prettify((capableCost + cunningCost + curiousCost + classyCost) / allHelium * 100);
  }
  return output;
}
//number with commas do numberWithCommas(number) and make numbers look good
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
// Makes both tables
function getRunsToLevelUp() {
  $("#levelUpTable").empty();
  $("#timeLevelUpTable").empty();
  $(".levelUpHeader1").html("E" + game.global.fluffyPrestige);
  $(".levelUpHeader2").html("E" + (game.global.fluffyPrestige + 1));
  $(".timeLevelUpHeader1").html("E" + game.global.fluffyPrestige);
  $(".timeLevelUpHeader2").html("E" + (game.global.fluffyPrestige + 1));
  var xpToLevel = neededExp - currentExp;
  var thenLevel = calculateLevel();
  var thenEvolution = game.global.fluffyPrestige;
  var xpPerRun = zoneXP(0, zoneYP);
  var timesToLoop = 20 - thenLevel;
  var seconds = (fluffyCalculator.minutesPerRun * 60);
  runs = 0;
  levelUpData = "";
  timeToLevelData = "";
  for (var i = 0; i < 10; i++) {
    $("#levelUpTable").append("<tr> <td> Runs to L" + (i + 1) + "</td><td id='R" + i + "'></td> <td id='D" + i + "'</td> <td id='ER" + i + "' </td> <td id='ED" + i + "' </td> </tr> ");
    $("#timeLevelUpTable").append("<tr> <td> Time to L" + (i + 1) + "</td><td id='Rt" + i + "'></td> <td id='Et" + i + "' </td></tr> ");
  }
  for (var x = 0; 20 >= x; x++) {
    if (x <= 10) {
      l = x - 1;
      e = thenEvolution;
    }
    if (x > 10) {
      l = (x == 20) ? 9 : (x % 10) - 1; // x == 20 because  20 % 10 = 0 :P
      e = thenEvolution + 1;
    }
    xpToLevel = upgrade(e, l);
    if (l <= thenLevel - 1 && e == thenEvolution) { // if level is lower then the one "l" just put blank
      $("#R" + l).add("#Rt" + l).append("");
      // $("#D" + l).append("");
    } else if (l == thenLevel && e == thenEvolution) { // if level is the same as the one you are trying to upgrade from, calcualte from - currentXP
      runs += (xpToLevel - currentExp) / xpPerRun;
      $("#R" + l).append(Number((runs).toFixed(2)));
      $("#Rt" + l).append(sformat(runs * seconds));
    } else if (e > maxEvolution) { // If evolution is above the max, put nothing for everything on the last column.
      $("#ER" + l).add("#ED" + l).append("");
    } else if (e == thenEvolution) { // If you are calculating the rest of your evolution, put data on the first columns
      runs += xpToLevel / xpPerRun;
      $("#R" + l).append(Number((runs).toFixed(2)));
      $("#D" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
      $("#Rt" + l).append(sformat(runs * seconds));
    } else if (e > thenEvolution || (e > thenEvolution && l == thenLevel)) { // If you are above the evolution, new data goes to the last columns
      runs += xpToLevel / xpPerRun;
      $("#ER" + l).append(Number((runs).toFixed(2)));
      $("#ED" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
      $("#Et" + l).append(sformat(runs * seconds));
    }
  }
}
var prestigeDamageModifier = 5;
var damageModifiers = [1, 1.1, 1.3, 1.6, 2, 2.5, 3.1, 3.8, 4.6, 5.5, 6.5];

function getDamageModifier(level, current, total, e) {
  var prestigeBonus = Math.pow(prestigeDamageModifier, e);
  var bonus = damageModifiers[level];
  if (level + 1 >= damageModifiers.length) return 1 + ((bonus - 1) * prestigeBonus);
  var remaining = (damageModifiers[[level + 1]] - bonus);
  bonus += ((current / total) * remaining);
  return 1 + ((bonus - 1) * prestigeBonus);
}
// Makes scatter plot
var zoneToLevelData = "";

function getZoneToLevelUp() {
  // Might be able to do 50 above your HZE? if not then oh well :P
  var maxZone = game.global.highestLevelCleared + 50;
  var nowZone = game.global.world;
  var thenZone = game.global.world;
  var thenLevel = calculateLevel();
  var thenEvolution = game.global.fluffyPrestige;
  var xpToLevel = (neededExp - currentExp);
  var lastLeveled = nowZone;
  zoneToLevelData = "";
  rekt: for (var x = nowZone; x < maxZone; x++) {
    if (zoneXP(lastLeveled, x) >= xpToLevel) {
      do {
        zoneToLevelData += "<tr> <td>" + x + "</td>";
        zoneToLevelData += "<td> E" + thenEvolution + "L" + (thenLevel + 1) + "</td> </tr>";
        if (thenLevel == 9) {
          thenEvolution++;
          thenLevel = 0;
        } else {
          thenLevel++;
        }
        if (thenEvolution > maxEvolution) {
          break;
        }
        xpToLevel = upgrade(thenEvolution, (thenLevel));
        lastLeveled = x;
      } while (zoneXP(lastLeveled, x) >= xpToLevel);
    }
  }
  if (zoneToLevelData != "") {
    $("#showZoneYL").show();
    $("#zoneYL").html(zoneToLevelData);
  } else {
    $("#showZoneYL").hide();
  }
}

function getHeirloomValue() {
  var b = (game.heirlooms.Staff.FluffyExp.currentBonus / 100) + 1;
  if (b > 1) {
    return b;
  } else if (b == 1) {
    return 1;
  }
}
// hidden menu
function stealth(update) {
  if (!update) $("#hidden").toggle();
  $("#hiddenText").empty();
  $("#hiddenText").append("Current Exp <input id='changeExp' class='hiddenPadding' value = '" + numberWithCommas(currentExp) + "''>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick='changeXP()'>Change Vars</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick='stealth(true)'>Update this</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick='stealthUnlock()'>Unlock Spire Perks</button>");
}
var fluffyhr = [];
var result;

function changeXP() {
  if (($('#changeExp').val().replace(/,/g, '') != currentExp)) {
    console.log("inchangeXp");
    currentExp = parseFloat($('#changeExp').val().replace(/,/g, ''));
  }
  if ($("#inputE").text() != game.global.fluffyPrestige || $("#inputL").text() != calculateLevel()) {
    game.global.fluffyPrestige = Number($("#inputE").text());
    game.global.fluffyExp = removeExp(game.global.fluffyPrestige, $("#inputL").text());
  }
  update();
  charts();
}

function stealthUnlock(what) {
  game.portal.Cunning.locked = false;
  game.portal.Curious.locked = false;
  game.portal.Classy.locked = false;
  stealthCall();
}

function stealthCall() {
  fillOnce();
  update();
  charts();
  stealth(true);
}
// gets what % daily you need to level up
function getneededPercent() {
  var needed = (neededExp - currentExp);
  var xpgain = (zoneXP(0, zoneYP));
  var percentFromDays = 0;
  var days = 0;
  var tod = "days";
  xpgain = zoneXP(0, zoneYP) / (dailyBonus);
  dailyNeeded = (Math.ceil((needed / xpgain) * 100) - 100);
  days = dailyNeeded / avgDailyN;
  // do {
  //   percentFromDays += getDailyHeliumValue(countDailyWeight(getDailyChallenge(days, true)));
  //   days++;
  // } while (dailyNeeded >= percentFromDays);
  // console.log(percentFromDays / days);
  if (days <= 1) {
    tod = "day";
  }
  return (dailyNeeded + "% | <span title ='How many days until you get this cumulative %'> " + Math.round(days) + " " + tod + "</span>");
}

function getLocalStorage() {
  if (localStorage.getItem("fluffyCalculator") == null) {
    localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
  } else {
    fluffyCalculator = JSON.parse(localStorage.getItem("fluffyCalculator"));
    document.getElementById("spireBonus").value = fluffyCalculator.spireBonus;
    document.getElementById("MPR").value = fluffyCalculator.minutesPerRun;
    document.getElementById("instantUpdating").checked = fluffyCalculator.instantUpdating;
  }
}

function saveLocalStorage() {
  fluffyCalculator.spireBonus = $("#spireBonus").val();
  fluffyCalculator.minutesPerRun = Number($("#MPR").val());
  localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
}

function getExpBonus() {
  returnN = 1;
  //dailyBonus
  if (dailyBonus > 1) {
    returnN *= dailyBonus;
  }
  // specialBonus
  if (specialBonus > 1) {
    returnN *= specialBonus;
  }
  //expGrowth
  returnN *= expGrowth;
  // heirloomBonus
  if (heirloomBonus > 1) {
    returnN *= heirloomBonus;
  }
  //evolutionXP
  if (game.talents.fluffyExp.purchased) {
    returnN *= (0.25 * game.global.fluffyPrestige) + 1;
  }
  //knowledgeBonus
  if ((game.playerSpire != null)) {
    if (game.playerSpire.traps.Knowledge.owned > 0) {
      returnN *= ((0.15 + ((game.playerSpire.traps.Knowledge.level - 1) * 0.075)) * game.playerSpire.traps.Knowledge.owned + 1);
    }
  }
  return returnN;
}

function changeVars(type, data) {
  data = Number(data);
  switch (type) {
    case "capable":
      game.portal.Capable.level = (data);
      game.portal.Capable.heliumSpent = 100000000 * (1 - Math.pow(10, data)) / (1 - 10);
      break;
    case "cunning":
      game.portal.Cunning.level = (data);
      game.portal.Cunning.heliumSpent = 100000000000 * (1 - (Math.pow(1.3, data))) / (1 - 1.3);
      break;
    case "curious":
      game.portal.Curious.level = (data);
      game.portal.Curious.heliumSpent = 100000000000000 * (1 - (Math.pow(1.3, data))) / (1 - 1.3);
      break;
    case "classy":
      game.portal.Classy.level = (data);
      game.portal.Classy.heliumSpent = 100000000000000000 * (1 - (Math.pow(1.3, data))) / (1 - 1.3);
      if ((data > 1)) startToEarn = 301 - (data * 2);
      break;
    case "ZoneYP":
      zoneYP = (data);
      check = (zoneYP > startToEarn) ? ($("#ZoneYP").removeClass("has-error")) : ($("#ZoneYP").addClass("has-error"));
      break;
    case "DailyModifier":
      dailyBonus = (data / 100) + 1;
      break;
    case "heirloom":
      heirloomBonus = (data / 100) + 1;
      break;
    case "SpecialBonus":
      specialBonus = (data);
      break;
    case "instantUpdating":
      fluffyCalculator.instantUpdating = data;
      saveLocalStorage();
      break;
    case "spireBonus":
      fluffyCalculator.spireBonus = $("#spireBonus").val();
      saveLocalStorage();
      break;
    case "MPR":
      fluffyCalculator.minutesPerRun = Number($("#MPR").val());
      saveLocalStorage();
      break;
      case "knowledgeTowers":
      game.playerSpire.traps.Knowledge.owned = data;
      break;
    case "knowledgeLevel":
      game.playerSpire.traps.Knowledge.level = data;
      break;
  }
  if (fluffyCalculator.instantUpdating && type != "instantUpdating") {
    fall();
  }
}

function updateValuesFromSave() {
  check = (!game.portal.Capable.locked) ? $("#showCapable").show() : $("#showCapable").hide();
  document.getElementById("capable").value = game.portal.Capable.level;
  check = (!game.portal.Cunning.locked) ? $("#showCunning").show() : $("#showCunning").hide();
  document.getElementById("cunning").value = game.portal.Cunning.level;
  check = (!game.portal.Curious.locked) ? $("#showCurious").show() : $("#showCurious").hide();
  document.getElementById("curious").value = game.portal.Curious.level;
  check = (!game.portal.Classy.locked) ? $("#showClassy").show() : $("#showClassy").hide();
  document.getElementById("classy").value = game.portal.Classy.level;
  if ((game.portal.Classy.level > 0)) startToEarn = 301 - (game.portal.Classy.level * 2);
  document.getElementById("ZoneYP").value = game.global.lastPortal;
  zoneYP = game.global.lastPortal;
  if (game.global.dailyChallenge.seed) {
    document.getElementById("DailyModifier").value = Math.round(getDailyHeliumValue(countDailyWeight()));
    dailyBonus = (Math.round(getDailyHeliumValue(countDailyWeight())) / 100) - 1;
  } else {
    document.getElementById("DailyModifier").value = 0;
    dailyBonus = 1;
  }
  heirloomBonus = getHeirloomValue();
  check = (heirloomBonus > 1) ? $("#showHeirloom").show() : $("#showHeirloom").hide();
  document.getElementById("heirloom").value = prettify(heirloomBonus * 100 - 100);

  document.getElementById("knowledgeTowers").value = game.playerSpire.traps.Knowledge.owned;
  document.getElementById("knowledgeLevel").value = game.playerSpire.traps.Knowledge.level;
}

function changeTheme(flip) {
  currentTheme = fluffyCalculator.theme;
  if (currentTheme == "light") {
    if (flip == true) {
      document.getElementById("darktheme").disabled = false;
      fluffyCalculator.theme = "dark";
    }
  } else {
    document.getElementById("darktheme").disabled = true;
  }
  if (currentTheme == "dark") {
    if (flip == true) {
      fluffyCalculator.theme = "light";
      document.getElementById("darktheme").disabled = true;
    } else {
      document.getElementById("darktheme").disabled = false;
    }
  }
}

function correctLocalStorage() {
  try{
    JSON.parse(localStorage.getItem("fluffyCalculator"));
  }
  catch(err){
    console.log("couldn't JSON.parse (1)");
    localStorage.removeItem("fluffyCalculator");
    localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
    return;
  }
  if(typeof JSON.parse(localStorage.getItem("fluffyCalculator")) == "string"){
    console.log("couldn't JSON.parse (2)");
    localStorage.removeItem("fluffyCalculator");
    localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
    return;
  }
  if(localStorage.getItem("fluffyCalculator") == null){
    console.log("localStorage was null (3)");
    localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
  }
  var localStorageSave = JSON.parse(localStorage.getItem("fluffyCalculator"));
  var accurateStorageSave = fluffyCalculator;
  for (var x in accurateStorageSave) {
    if (localStorageSave.hasOwnProperty(x) == false) {
      console.log("you didn't have " + x);
      localStorageSave[x] = accurateStorageSave[x];
      localStorage.setItem("fluffyCalculator", JSON.stringify(localStorageSave));
    }
  }
}

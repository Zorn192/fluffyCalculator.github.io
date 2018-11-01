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
var prestigeEM = 5;
var firstLevel = 1000;
var growth = 4;
var expGrowth = 1.015;
var specialBonus = 1;
var dailyBonus = 1;
var heirloomBonus = 1;
var zoneYP = 0;
var plotX = [];
var plotY = [];
var maxEvolution = 7;
var evolutionXP = 1;
var startToEarn = 301;

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
  var mcalc2 = (50 + (game.portal.Curious.level * 30)) * (1 + (game.portal.Cunning.level * 0.25)) * dailyBonus * specialBonus * expGrowth * heirloomBonus * evolutionXP;

  // Starting spire bonus information
  zones = [];
  addSpireBonus = 0;
  if (spireBonus != "") {
    var spires = spireBonus.split(",");
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

  heirloomBonus = getHeirloomValue();

  check = (!game.portal.Capable.locked) ? $("#showCapable").show() : $("#showCapable").hide();
  check = (!game.portal.Cunning.locked) ? $("#showCunning").show() : $("#showCunning").hide();
  check = (!game.portal.Curious.locked) ? $("#showCurious").show() : $("#showCurious").hide();
  check = (!game.portal.Classy.locked) ? $("#showClassy").show() : $("#showClassy").hide();
  check = (heirloomBonus > 1) ? $("#showHeirloom").show() : $("#showHeirloom").hide();

  $("#SpecialBonus").val(1);
  $("#capable").val(game.portal.Capable.level);
  $("#cunning").val(game.portal.Cunning.level);
  $("#curious").val(game.portal.Curious.level);
  $("#classy").val(game.portal.Classy.level);
  $("#heirloom").val(prettify(((heirloomBonus) * 100) - 100));
  $("#ZoneYP").val(game.global.lastPortal);
  if (game.global.dailyChallenge.seed) $("#DailyModifier").val(Math.round(getDailyHeliumValue(countDailyWeight())));
  if (!game.global.dailyChallenge.seed) $("#DailyModifier").val('');
  currentExp = Math.ceil(game.global.fluffyExp - removeExp(game.global.fluffyPrestige, calculateLevel()));
  neededExp = upgrade(game.global.fluffyPrestige, calculateLevel());

}

function update() {

  if (game.talents.fluffyExp.purchased) {
    evolutionXP = 1 + (0.25 * game.global.fluffyPrestige);
  } else {
    evolutionXP = 1;
  }

  if (game.portal.Classy.level > 0) {
    startToEarn = 301 - (game.portal.Classy.level * 2);
  }

  // mins per run
  if ($("#MPR").val()) $("#showTime").show();
  if (!$("#MPR").val() || $("#MPR").val() <= 0) $("#showTime").hide();

  // updates values based on input
  game.portal.Capable.level = Number($("#capable").val());
  game.portal.Cunning.level = Number($("#cunning").val());
  game.portal.Curious.level = Number($("#curious").val());
  game.portal.Classy.level = Number($("#classy").val());
  game.global.lastPortal = Number($("#ZoneYP").val());
  zoneYP = Number($("#ZoneYP").val());
  dailyBonus = Number(($("#DailyModifier").val() / 100) + 1);
  heirloomBonus = Number(($("#heirloom").val() / 100) + 1);
  specialBonus = Number($("#SpecialBonus").val());

  check = (zoneYP > startToEarn) ? ($("#ZoneYP").removeClass("has-error")) : ($("#ZoneYP").addClass("has-error"));

  // left column tooltips
  $("#capableTooltip").html("Capable Level");
  $("#cunningTooltip").html("Cunning Level");
  $("#curiousTooltip").html("Curious Level");
  $("#classyTooltip").html("Classy Level");
  $("#zoneYPTooltop").attr("title", ("The last zone you don't complete \n Xp per run " + prettify(zoneXP(0, zoneYP))));

  // top title bar
  $("#fluffyHelium").html("<span title ='% of helium spent on fluffy \n " + countHelium("title") + "'>" + countHelium("percent") + "  <span  class ='noselect astext' onclick='stealth(false)'>%</span> spent" + "</span>");
  $("#fluffyLevel").html("<span title='This is your current fluffy evolution and level'> E<span contenteditable id='inputE'>" + game.global.fluffyPrestige + "</span>L<span contenteditable id='inputL'>" + calculateLevel() + "</span>");
  $("#xpTA").html("<span id='inputXP' title = " + numberWithCommas(currentExp) + ">" + prettify(currentExp) + "</span> <span title = 'Need " + numberWithCommas(neededExp - currentExp) + " Exp'" + "> / </span> <span title =" + numberWithCommas(neededExp) + ">" + prettify(upgrade(game.global.fluffyPrestige, calculateLevel())) + " exp</span");
  $("#fluffyDamage").html("<span title='This is your current damage %'> +" + prettify(((getDamageModifier(calculateLevel(), currentExp, neededExp, game.global.fluffyPrestige)) - 1) * 100) + "% damage" + "</span>");
  $("#xpto1").html(upgrade(game.global.fluffyPrestige, calculateLevel()) - Math.ceil(game.global.fluffyExp - removeExp(game.global.fluffyPrestige, calculateLevel())));
  $("#currentZone").html(game.global.world);

  // right column
  $(".moreInfo").empty();

  $(".moreInfo").append("<tr><td><span title='Your helium' > Helium: </span>" + prettify(game.global.totalHeliumEarned) + "</td></tr>");
  $(".moreInfo").append("<tr><td>Xp per run: " + numberWithCommas(Math.ceil(zoneXP(0, zoneYP))) + "</td></tr>");
  $(".moreInfo").append("<tr><td><span title='To level up' > Needed daily: </span>" + getneededPercent() + "</td></tr>");
  $(".moreInfo").append("<tr><td>You have " + prettify((currentExp / neededExp) * 100) + "% <span title='% of xp to level' >of  level </span></td></tr>");
  $(".moreInfo").append("<tr><td>Current Zone: " + game.global.world + "</td></tr>");
  $(".moreInfo").append("<tr><td>Bones to level up: " + bonestolevel() + "</td></tr>");
  if ($("#MPR").val()) $(".moreInfo").append("<tr><td>Fluffy/hr: " + numberWithCommas(Math.ceil(((zoneXP(0, zoneYP) / $("#MPR").val()) * 60))) + "</td></tr>");

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

  var minutesPerRun = Number($("#MPR").val());
  var seconds = (minutesPerRun * 60);

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

  do {
    percentFromDays += getDailyHeliumValue(countDailyWeight(getDailyChallenge(days, true)));
    days++;
  } while (dailyNeeded >= percentFromDays);

  // console.log(days + " " + percentFromDays);
  if (days <= 1) {
    tod = "day";
  }
  return (dailyNeeded + "% | <span title ='How many days until you get this cumulative %'> " + days + " " + tod + "</span>");
}

var spireBonus = "";

function getLocalStorage() {
  if (localStorage.getItem("fluffyCalculator") == null) {
    localStorage.setItem("fluffyCalculator", "");
  } else {
    $("#spireBonuss").val(localStorage.getItem("fluffyCalculator"));
  }

}

function saveLocalStorage() {
  localStorage.setItem("fluffyCalculator", $("#spireBonuss").val());
  spireBonus = $("#spireBonuss").val();
}

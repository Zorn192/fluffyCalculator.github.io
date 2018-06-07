/* jshint esversion: 6 */
function handle_paste(ev) {

  var save_string = ev.clipboardData.getData("text/plain").replace(/\s/g, '');
  game = JSON.parse(LZString.decompressFromBase64(save_string));

  $("#error").hide();

  if (game.global.version > 4.801) $("#error").show().empty().append("This calculator is updated for Trimps 4.801, values might be inaccurate.");

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
  tableValues();
  scatterValues();
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
var maxEvolution = 5;

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

// Gets XP earned from all your zones based on ZoneYP

function ozoneXP(min, x) {
  var allGathered = 0;
  for (var z = min; z < (x); z++) {
    var zoneGathered = (50 + (game.portal.Curious.level * 30)) * Math.pow(expGrowth, z - 300) * (1 + (game.portal.Cunning.level * 0.25)) * dailyBonus * specialBonus * heirloomBonus;
    allGathered += zoneGathered;
  }
  return allGathered;
}

function zoneXP(zone, middle) {
  addcalc = 0;
  if (middle) {
    var mcalc1 = (Math.pow(expGrowth, (zone - 301)) - 1) / (expGrowth - 1);
    var mcalc2 = (50 + (game.portal.Curious.level * 30)) * (1 + (game.portal.Cunning.level * 0.25)) * dailyBonus * specialBonus * expGrowth * heirloomBonus;

    return (mcalc1 * mcalc2) - zoneXP(game.global.world, false);

  }
  if (!middle) {
    var calc1 = (Math.pow(expGrowth, (zone - 301)) - 1) / (expGrowth - 1);
    var calc2 = (50 + (game.portal.Curious.level * 30)) * (1 + (game.portal.Cunning.level * 0.25)) * dailyBonus * specialBonus * expGrowth * heirloomBonus;

    if (zone > 300) {
      for (var x in spireBonus) {
        var spirezone = (spireBonus[x] * 100 + 100);
        if (spirezone > ZoneYP) {
          return;
        } else {
          addcalc += ((50 + (game.portal.Curious.level * 30)) * Math.pow(expGrowth, (spirezone) - 300) * (1 + (game.portal.Cunning.level * 0.25)) * dailyBonus * specialBonus * heirloomBonus) * 2;
        }
      }
    }
    return ((calc1 * calc2) + addcalc);
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
  check = (heirloomBonus > 1) ? $("#showHeirloom").show() : $("#showHeirloom").hide();

  $("#SpecialBonus").val(1);
  $("#capable").val(game.portal.Capable.level);
  $("#cunning").val(game.portal.Cunning.level);
  $("#curious").val(game.portal.Curious.level);
  $("#heirloom").val(((heirloomBonus) * 100) - 100);
  $("#ZoneYP").val(game.global.lastPortal);
  if (game.global.dailyChallenge.seed) $("#DailyModifier").val(Math.round(getDailyHeliumValue(countDailyWeight())));
  if (!game.global.dailyChallenge.seed) $("#DailyModifier").val('');
  currentExp = Math.ceil(game.global.fluffyExp - removeExp(game.global.fluffyPrestige, calculateLevel()));
  neededExp = upgrade(game.global.fluffyPrestige, calculateLevel());

}

function update() {

  spireBonus = $("#spireBonus").val().split(",");

  // mins per run
  if ($("#MPR").val()) $("#showTime").show();
  if (!$("#MPR").val() || $("#MPR").val() <= 0) $("#showTime").hide();
  if ($("#toSpend").val()) findBest($("#toSpend").val());

  // updates values based on input
  game.portal.Capable.level = Number($("#capable").val());
  game.portal.Cunning.level = Number($("#cunning").val());
  game.portal.Curious.level = Number($("#curious").val());
  game.global.lastPortal = Number($("#ZoneYP").val());
  zoneYP = Number($("#ZoneYP").val());
  dailyBonus = Number(($("#DailyModifier").val() / 100) + 1);
  heirloomBonus = Number(($("#heirloom").val() / 100) + 1);
  specialBonus = Number($("#SpecialBonus").val());

  check = (zoneYP > 301) ? ($("#ZoneYP").removeClass("has-error")) : ($("#ZoneYP").addClass("has-error"));

  // left column tooltips
  $("#capableTooltip").html("<td title = 'Helium Spent " + countSpent(1) + "'> Capable Level" + "</td>");
  $("#cunningTooltip").html("<td title = 'Helium Spent " + countSpent(2) + "'> Cunning Level" + "</td>");
  $("#curiousTooltip").html("<td title = 'Helium Spent " + countSpent(3) + "'> Curious Level" + "</td>");
  $("#zoneYPTooltop").attr("title", ("The last zone you don't complete \n Xp per run " + prettify(zoneXP(zoneYP, false))));

  // top title bar
  $("#fluffyHelium").html("<span title ='% of helium spent on fluffy \n " + countSpent(5) + "'>" + countSpent(4) + "  <span  class ='noselect astext' onclick='stealth(false)'>%</span> spent" + "</span>");
  $("#fluffyLevel").html("<span title='This is your current fluffy evolution and level'> E<span contenteditable id='inputE'>" + game.global.fluffyPrestige + "</span>L<span contenteditable id='inputL'>" + calculateLevel() + "</span>");
  $("#xpTA").html("<span id='inputXP' title = " + numberWithCommas(currentExp) + ">" + prettify(currentExp) + "</span> <span title = 'Need " + numberWithCommas(neededExp - currentExp) + " Exp'" + "> / </span> <span title =" + numberWithCommas(neededExp) + ">" + prettify(upgrade(game.global.fluffyPrestige, calculateLevel())) + " exp</span");
  $("#fluffyDamage").html("<span title='This is your current damage %'> +" + prettify(((getDamageModifier(calculateLevel(), currentExp, neededExp, game.global.fluffyPrestige)) - 1) * 100) + "% damage" + "</span>");
  $("#xpto1").html(upgrade(game.global.fluffyPrestige, calculateLevel()) - Math.ceil(game.global.fluffyExp - removeExp(game.global.fluffyPrestige, calculateLevel())));
  $("#currentZone").html(game.global.world);

  // right column
  $(".moreInfo").empty();

  $(".moreInfo").append("<tr><td><span title='Your helium' > Helium: </span>" + prettify(game.global.totalHeliumEarned) + "</td></tr>");
  $(".moreInfo").append("<tr><td>Xp per run: " + numberWithCommas(Math.ceil(zoneXP(zoneYP, false))) + "</td></tr>");
  $(".moreInfo").append("<tr><td><span title='To level up' > Needed daily: </span>" + getneededPercent() + "</td></tr>");
  $(".moreInfo").append("<tr><td>You have " + prettify((currentExp / neededExp) * 100) + "% <span title='% of xp to level' >of  level </span></td></tr>");
  $(".moreInfo").append("<tr><td>Current Zone: " + game.global.world + "</td></tr>");
  $(".moreInfo").append("<tr><td>Suggested next: " + suggested() + "</td></tr>");
  $(".moreInfo").append("<tr><td>Bones to level up: " + bonestolevel() + "</td></tr>");
  if ($("#MPR").val()) $(".moreInfo").append("<tr><td>Fluffy/hr: " + numberWithCommas(Math.ceil(((zoneXP(zoneYP, false) / $("#MPR").val()) * 60))) + "</td></tr>");

  saveLocalStorage();

}

function bonestolevel() {
  if (game.global.bestFluffyExp == 0) {
    return "N/A";
  } else {
    return prettify(Math.ceil(((neededExp - currentExp) / game.global.bestFluffyExp)) * 100);
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
function countSpent(type) {
  var cap = capableCost(game.portal.Capable.level);
  var cun = cunningCost(game.portal.Cunning.level);
  var cur = curiousCost(game.portal.Curious.level);
  var all = cap + cun + cur;
  if (type == 1) return prettify(cap);
  if (type == 2) return prettify(cun);
  if (type == 3) return prettify(cur);
  if (type == 4) return prettify((all / game.global.totalHeliumEarned) * 100);
  if (type == 5) {
    var capp = "";
    var cunn = "";
    var curr = "";
    if (!game.portal.Capable.locked) capp = "Capable: " + prettify((cap / game.global.totalHeliumEarned) * 100) + "%";
    if (!game.portal.Cunning.locked) cunn = "\n Cunning: " + prettify((cun / game.global.totalHeliumEarned) * 100) + "%";
    if (!game.portal.Curious.locked) curr = "\n Curious: " + prettify((cur / game.global.totalHeliumEarned) * 100) + "%";
    return capp + cunn + curr;
  }
}

//number with commas do numberWithCommas(number) and make numbers look good
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Makes both tables
function tableValues() {
  $("#RTable").empty();
  $("#TTable").empty();

  level = calculateLevel();
  var emax = Number(game.global.fluffyPrestige) + 2;
  var runsNeeded = 0;
  var minutesPerRun = Number($("#MPR").val());
  var seconds = (minutesPerRun * 60);

  for (var i = 0; i < 10; i++) {
    $("#RTable").append("<tr> <td> Runs to L" + (i + 1) + "</td><td id='R" + i + "'></td> <td id='D" + i + "'</td> <td id='ER" + i + "' </td> <td id='ED" + i + "' </td> </tr> ");
    $("#TTable").append("<tr> <td> Time to L" + (i + 1) + "</td><td id='Rt" + i + "'></td> <td id='Et" + i + "' </td></tr> ");
  }

  for (var e = game.global.fluffyPrestige; e < emax; e++) {
    for (var l = 0; l < 10; l++) {
      if (e == game.global.fluffyPrestige) $(".e1").html("E" + e);
      if (e > game.global.fluffyPrestige) $(".e2").html("E" + e);
      if (l <= level - 1 && e == game.global.fluffyPrestige) {
        // $("#R" + l).add("#Rt" + l).append("Already E" + e + "L" + (l + 1));
        $("#R" + l).add("#Rt" + l).append("");
        $("#D" + l).append("");
      } else if (l == level && e == game.global.fluffyPrestige) {
        firstRun = (upgrade(e, l) - currentExp) / zoneXP(Number(zoneYP), false);
        runsNeeded += firstRun;
        $("#R" + l).append(Number((runsNeeded).toFixed(2)));
        $("#D" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
        $("#Rt" + l).append(sformat(runsNeeded * seconds));
      } else if (e > maxEvolution) {
        $("#ER" + l).add("#ED" + l).append("");
      } else {
        secondRun = upgrade(e, l) / zoneXP(Number(zoneYP), false);
        runsNeeded += secondRun;
        if (e == game.global.fluffyPrestige) {
          $("#R" + l).append(Number((runsNeeded).toFixed(2)));
          $("#D" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
          $("#Rt" + l).append(sformat(runsNeeded * seconds));
        }
        if (e > game.global.fluffyPrestige) {
          $("#ER" + l).append(Number((runsNeeded).toFixed(2)));
          $("#ED" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
          $("#Et" + l).append(sformat(runsNeeded * seconds));
        }
      }
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
function scatterValues() {

  var evolution = game.global.fluffyPrestige;
  var level = Number(calculateLevel());
  var leveled = 0;
  var nextPrice = upgrade(evolution, level) - currentExp;
  var evolved = 0;
  var pluslevel = 0;
  var result;

  check = (zoneYP > 601) ? (toZone = zoneYP) : (toZone = 601);
  check = (game.global.world > 301) ? (zone = (game.global.world), middle = true) : (zone = 301, middle = false);

  rekt: for (var t = zone; t < toZone; t++) {
    if (zoneXP(t, middle) >= nextPrice) {

      do {
        // console.log("in do loop");
        leveled++;
        pluslevel++;
        plotY.push(leveled);
        plotX.push(t);
        result += "<tr><td>" + t + "</td><td>E" + evolution + "L" + (level + pluslevel) + "</td></tr>";
        if (level + pluslevel > 9) {
          evolution++;
          level = 0;
          pluslevel = 0;
          continue rekt;
        }
        if (evolution > maxEvolution) {
          break;
        }
        nextPrice += upgrade(evolution, (level + pluslevel));
      } while (zoneXP(t, middle) >= nextPrice);
    }
  }
  check1 = (!result) ? ($("#showZoneYL").hide()) : ($("#showZoneYL").show());
  $("#zoneYL").html(result);
}

function getHeirloomValue() {
  var b = (game.heirlooms.Staff.FluffyExp.currentBonus / 100) + 1;
  if (b > 1) {
    return b;
  } else if (b == 1) {
    return 1;
  }
}

// Gets next optimal perk
function suggested() {

  var capableLevel = game.portal.Capable.level;
  var cunningLevel = game.portal.Cunning.level;
  var curiousLevel = game.portal.Curious.level;
  var curiousWorth = ((50 + ((curiousLevel + 1) * 30)) * (1 + ((cunningLevel) * 0.25))) / curiousCost(curiousLevel + 1);
  var cunningWorth = ((50 + ((curiousLevel) * 30)) * (1 + ((cunningLevel + 1) * 0.25))) / cunningCost(cunningLevel + 1);

  // console.log(cunningWorth);
  // console.log(curiousWorth);
  if (game.portal.Cunning.locked && game.portal.Curious.locked) return "Capable";
  if (!game.portal.Cunning.locked && curiousWorth < cunningWorth || game.portal.Curious.locked) return "Cunning";
  if (!game.portal.Curious.locked && curiousWorth > cunningWorth) return "Curious";
}

// Finds the best ratio for fluffy perks
function findBest(spend) {

  var capableLevel = game.portal.Capable.level;

  var cunningLevel = 0;
  var cunningWorth = 0;
  var curiousLevel = 0;
  var curiousWorth = 0;

  var willing = game.global.totalHeliumEarned * (spend / 100);
  willing -= capableCost(capableLevel);

  while (true) {
    curiousWorth = ((50 + 30 * (curiousLevel + 1)) / (50 + 30 * curiousLevel) - 1) / curiousCost(curiousLevel + 1);
    cunningWorth = ((1 + 0.25 * (cunningLevel + 1)) / (1 + 0.25 * cunningLevel) - 1) / cunningCost(cunningLevel + 1);

    if (!game.portal.Curious.locked && (curiousCost(curiousLevel + 1) + cunningCost(cunningLevel)) <= willing && curiousWorth >= cunningWorth) {
      curiousLevel++;
    } else if (!game.portal.Cunning.locked && (cunningCost(cunningLevel + 1) + curiousCost(curiousLevel)) <= willing) {
      cunningLevel++;
    } else {
      break;
    }
  }

  var tempCurious = curiousLevel;
  var tempCunning = cunningLevel;

  tempCurious -= 1;
  while ((cunningCost(cunningLevel + 1) + curiousCost(curiousLevel)) <= willing) {
    tempCunning++;
  }
  if (((50 + ((tempCurious) * 30)) * (1 + ((tempCunning) * 0.25))) > ((50 + ((curiousLevel) * 30)) * (1 + ((cunningLevel) * 0.25)))) {
    curiousLevel = tempCurious;
    cunningLevel = tempCunning;
  }

  // game.portal.Capable.level = capableLevel;
  game.portal.Cunning.level = cunningLevel;
  game.portal.Curious.level = curiousLevel;
  $("#toSpend").val("");
  update();
  charts();
}

function capableCost(capableLevel) {
  return 100000000 * (1 - Math.pow(10, capableLevel)) / (1 - 10);
}

function cunningCost(cunningLevel) {
  return 100000000000 * (1 - (Math.pow(1.3, cunningLevel))) / (1 - 1.3);
}

function curiousCost(curiousLevel) {
  return 100000000000000 * (1 - (Math.pow(1.3, curiousLevel))) / (1 - 1.3);
}

// hidden menu
function stealth(update) {
  if (!update) $("#hidden").toggle();

  $("#hiddenText").empty();
  $("#hiddenText").append("Current Exp <input id='changeExp' class='hiddenPadding' value = '" + numberWithCommas(currentExp) + "''>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick='changeXP()'>Change Vars</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick='stealth(true)'>Update this</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick='stealthUnlock()'>Unlock Spire Perks</button>");
  $("#hiddenText").append("<select class='hiddenPadding' id='selectSave'>" +
    "<option value=one>E0L0 0 XP</option>" +
    "<option value=two>E0L3 208 XP</option>" +
    "<option value=three>E0L9 260M XP</option>" +
    "<option value=four>E2L8 1.07B XP</option>" +
    "<option value=five>E3L9 32.7B XP</option>" +
    "<option value=six>E4L0 0 XP</option>" +
    // "<option value=test1>Before</option>" +
    // "<option value=test2>After</option>" +
    "</select>" + "<button class='hiddenPadding' onclick='testSaves()')>Load Test Save</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick=fluffyhrf('save')>Save Fluffy/hr</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick=fluffyhrf('clear')>Clear Fluffy/hr</button>");
  $("#hiddenText").append("<button class='hiddenPadding' onclick=fluffyhrf('compare')>Show Graph</button>");
}

var fluffyhr = [];
var result;

function fluffyhrf(what) {

  if (what === "save") {
    fluffyhr.push({
      xp: numberWithCommas(Math.ceil(((zoneXP(zoneYP, false) / $("#MPR").val()) * 60))),
      zone: zoneYP,
      time: Number($("#MPR").val()),
      cunning: game.portal.Cunning.level,
      curious: game.portal.Curious.level
    });
  }
  if (what === "clear") {
    $("#showFHTable").hide();
    result = "";
    fluffyhr = [];
  }
  if (what === "compare") {
    $("#showFHTable").show();
    result = "";
    for (var i in fluffyhr) {
      result += "<tr><td>" + fluffyhr[i].xp + "</td>";
      result += "<td>" + fluffyhr[i].zone + "</td>";
      result += "<td>" + fluffyhr[i].time + "</td>";
      result += "<td>" + fluffyhr[i].cunning + "</td>";
      result += "<td>" + fluffyhr[i].curious + "</td></tr>";

    }
    console.log(result);
    $("#FHTable").html(result);
  }
}

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
  var xpgain = (zoneXP(zoneYP, false));
  var percentFromDays = 0;
  var days = 0;
  var tod = "days";

  var calc1 = (Math.pow(expGrowth, (zoneYP - 301)) - 1) / (expGrowth - 1);
  var calc2 = (50 + (game.portal.Curious.level * 30)) * (1 + (game.portal.Cunning.level * 0.25)) * ((0 / 100) + 1) * specialBonus * expGrowth;
  xpgain = calc1 * calc2;
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

// Different saves for testing
function testSaves(input) {
  var value = $("#selectSave").val();
  if (value == "one") {
    game.global.fluffyExp = 0;
    game.global.fluffyPrestige = 0;
    game.portal.Capable.level = 0;
    game.portal.Cunning.level = 0;
    game.portal.Cunning.locked = true;
    game.portal.Curious.level = 0;
    game.portal.Curious.locked = true;
    game.global.lastPortal = 335;
    game.global.totalHeliumEarned = 292667659304;
  }
  if (value == "two") {
    game.global.fluffyExp = 21207.818305244513;
    game.global.fluffyPrestige = 0;
    game.portal.Capable.level = 3;
    game.portal.Cunning.level = 0;
    game.portal.Cunning.locked = true;
    game.portal.Curious.level = 0;
    game.portal.Curious.locked = true;
    game.global.lastPortal = 338;
    game.global.totalHeliumEarned = 298620603801;
  }
  if (value == "three") {
    game.global.fluffyExp = 347381000;
    game.global.fluffyPrestige = 0;
    game.portal.Capable.level = 10;
    game.portal.Cunning.level = 68;
    game.portal.Cunning.locked = false;
    game.portal.Curious.level = 38;
    game.portal.Curious.locked = false;
    game.global.lastPortal = 700;
    game.global.totalHeliumEarned = 31720963611541640000;
  }
  if (value == "four") {
    game.global.fluffyExp = 1620652137.9627433;
    game.global.fluffyPrestige = 2;
    game.portal.Capable.level = 10;
    game.portal.Cunning.level = 68;
    game.portal.Cunning.locked = false;
    game.portal.Curious.level = 38;
    game.portal.Curious.locked = false;
    game.global.lastPortal = 486;
    game.global.totalHeliumEarned = 31720963611541640000;
  }
  if (value == "five") {
    game.global.fluffyExp = 43647978697.894;
    game.global.fluffyPrestige = 3;
    game.portal.Capable.level = 10;
    game.portal.Cunning.level = 68;
    game.portal.Cunning.locked = false;
    game.portal.Curious.level = 38;
    game.portal.Curious.locked = false;
    game.global.lastPortal = 486;
    game.global.totalHeliumEarned = 31721217442851980000;
  }
  if (value == "six") {
    game.global.fluffyExp = 0;
    game.global.fluffyPrestige = 4;
    game.portal.Capable.level = 10;
    game.portal.Cunning.level = 68;
    game.portal.Cunning.locked = false;
    game.portal.Curious.level = 38;
    game.portal.Curious.locked = false;
    game.global.lastPortal = 469;
    game.global.totalHeliumEarned = 31721217442851980000;
  }
  // if (value == "test1") {
  //   game.global.fluffyExp = 0;
  //   game.global.fluffyPrestige = 0;
  //   game.portal.Capable.level = 7;
  //   game.portal.Cunning.level = 17;
  //   game.portal.Cunning.locked = false;
  //   game.portal.Curious.level = 0;
  //   game.portal.Curious.locked = true;
  //   game.global.lastPortal = 438;
  //   $("#DailyModifier").val(3361);
  //   game.global.world = 301;
  //   game.global.totalHeliumEarned = 31721217442851980000;
  // }
  // if (value == "test2") {
  //   game.global.fluffyExp = 266.4375;
  //   game.global.fluffyPrestige = 0;
  //   game.portal.Capable.level = 7;
  //   game.portal.Cunning.level = 17;
  //   game.portal.Cunning.locked = false;
  //   game.portal.Curious.level = 0;
  //   game.portal.Curious.locked = true;
  //   game.global.lastPortal = 438;
  //   $("#DailyModifier").val(3361);
  //   game.global.world = 302;
  //   game.global.totalHeliumEarned = 31721217442851980000;
  // }
  stealthCall();
  // console.log(value);
  if (!value) {
    // console.log("didNothing");
  }
}


function getLocalStorage() {
  if (localStorage.getItem("fluffyCalculator") == null) {
    localStorage.setItem("fluffyCalculator", "");
  } else {
    $("#spireBonus").val(localStorage.getItem("fluffyCalculator"));
  }

}

function saveLocalStorage() {
  localStorage.setItem("fluffyCalculator", spireBonus);
}

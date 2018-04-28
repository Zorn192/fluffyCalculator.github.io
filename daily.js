var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["Spacer", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var mods = {
  "empower": "E",
  "toxic": "T",
  "pressure": "P",
};

var filterType = {
  "has": false,
  "atleast": true,
};

var filter = {
  "minDamage": true,
  "maxDamage": true,
  "plague": true,
  "weakness": true,
  "large": true,
  "dedication": true,
  "famine": true,
  "badStrength": true,
  "badHealth": true,
  "badMapStrength": true,
  "badMapHealth": true,
  "crits": true,
  "bogged": true,
  "dysfunctional": true,
  "oddTrimpNerf": true,
  "evenTrimpBuff": true,
  "karma": true,
  "toxic": true,
  "bloodthirst": true,
  "explosive": true,
  "slippery": true,
  "rampage": true,
  "mutimps": true,
  "empower": true,
  "pressure": true,
  "mirrored": true,
  "metallicThumb": true,
  "seed": true,
};

function showFilter() {
  if ($("#filter").is(":visible")) {
    $("#filter").hide();
    return;
  } else if (!$("#filter").is(":visible")) {
    $("#filter").show();
  }

  show = "";
  for (var f in filter) {
    if (f == "seed") continue;
    if (filter[f]) {
      show += "<div onmousedown=flipFilter('" + (f) + "') class='filter daily3' id='" + f + "'>" + f;
    } else {
      show += "<div onmousedown=flipFilter('" + (f) + "') class='filter daily1' id='" + f + "'>" + f;
    }
    show += "</div>";
  }
  for (var i in filterType) {
    if (filterType[i]) {
      if (i == "has") {
        show += "<div onmousedown=flipFilter('" + (i) + "',true) class='filter daily2 filterType' style='width: 100%; text-align:center'>Has all of these mods</div>";
      }
      if (i == "atleast") {
        show += "<div onmousedown=flipFilter('" + (i) + "',true) class='filter daily3 filterType' style='width: 100%; text-align:center'>Has atleast these mods</div>";
      }
    }
  }
  show += "<span style='width: 100%; text-align:center'><button onclick=flipFilter('all')>Flip all</button></span>";
  show += "<span style='width: 100%; text-align:center'><input type='number' min ='0' style='width:60px' value='2' id='filterMatch'> Mods to match  ";
  show += "<button onmousedown='makeDaily()'>Do Filter</span>";

  $("#filter").html(show);
}

function flipFilter(f, type) {
  if ($('#' + f).hasClass("daily3")) {
    $('#' + f).removeClass("daily3");
    $('#' + f).addClass("daily1");
    filter[f] = false;
  } else if (($('#' + f).hasClass("daily1"))) {
    $('#' + f).removeClass("daily1");
    $('#' + f).addClass("daily3");
    filter[f] = true;
  } else if (f == "all") {
    for (var i in filter) {
      if (i == "seed") continue;
      if (filter[i] == true) {
        $('#' + i).removeClass("daily3");
        $('#' + i).addClass("daily1");
        filter[i] = false;
      } else if (filter[i] == false) {
        $('#' + i).removeClass("daily1");
        $('#' + i).addClass("daily3");
        filter[i] = true;
      }
    }
  } else if (type == true) {
    if (f == "has") {
      $(".filterType").replaceWith("<div onmousedown=flipFilter('" + ("atleast") + "',true) class='filter daily3 filterType' style='width: 100%; text-align:center'>Has atleast these mods</div>");
      filterType[f] = false;
      filterType.atleast = true;
    } else if (f == "atleast") {
      $(".filterType").replaceWith("<div onmousedown=flipFilter('" + ("has") + "',true) class='filter daily2 filterType' style='width: 100%; text-align:center'>Has all of these mods</div>");
      filterType[f] = false;
      filterType.has = true;
    }
  }
  makeDaily();
}

function sendToConsole(add) {
  var value = prettify(getDailyHeliumValue(countDailyWeight(getDailyChallenge(add, true, false))));
  var returnText = getDailyChallenge(add, false, true);
  returnText += "Grants an additional " + value + "% of all helium earned before finishing.";
  console.log(returnText);
}

function makeDaily() {
  var todayOfWeek = getDailyTimeString(0, false, true);

  for (var z = 0; z < 8; z++) {
    dayIndex = (todayOfWeek * -1) + z;
    if (dayIndex > -1) {
      dayIndex = (z - todayOfWeek) - 7;
    }
  }


  lastWeek = dayIndex - 7;
  blank = lastWeek - dayIndex + 1;
  if (lastWeek == -13) {
    lastWeek = -6;
    blank = -7;
  }

  // console.log(dayIndex);
  // console.log(lastWeek);

  $("#dates").html("");
  header = "";
  for (var i in days) {
    header += "<div class = 'daily'>" + days[i] + "</div>";

  }
  $("#dates").append(header);


  forX: for (var x = lastWeek; x < 365; x++) {
    if (x < (blank)) {
      $("#dates").append("<div class= 'daily'> </div>");
      continue;
    }
    var add = 0;
    var dailyInfo = getDailyChallenge(x, false, true);
    var dailyObj = getDailyChallenge(x, true, false);
    var dailyValue = getDailyHeliumValue(countDailyWeight(dailyObj));
    var dailyWeight = countDailyWeight(dailyObj);
    if ($("#100Daily").is(':checked')) {
      dailyValue += 100;
      add += 100;
    }

    showMods = "";
    classList = "";
    for (var m in dailyObj) {
      classList += m + " ";
      if (mods.hasOwnProperty(m)) {
        showMods += mods[m];
      }
    }

    var append = "";
    var dailyDate = getDailyTimeString(x, true, false);
    var tiers = [(200 + add), (300 + add), (400 + add)];
    if (dailyValue <= tiers[0]) {
      append += ("<div onmousedown=sendToConsole(" + x + ") class ='daily daily1 " + classList + "' title='" + dailyInfo + "' > ");
    } else if (dailyValue <= tiers[1] && dailyValue > tiers[0]) {
      append += ("<div onmousedown=sendToConsole(" + x + ") class ='daily daily2 " + classList + "' title='" + dailyInfo + "' > ");
    } else if (dailyValue > tiers[1]) {
      append += ("<div onmousedown=sendToConsole(" + x + ") class ='daily daily3 " + classList + "' title='" + dailyInfo + "' > ");
    }

    append += ("<small>" + dailyDate + "</small> <br>");
    append += ("<span class=percent>" + prettify(dailyValue) + "% </span><br>");
    append += ("<span style='font-size: smaller' class=mods>" + showMods + "</span>");

    if (x == 1) {
      append += ("<span style='font-size: smaller' title='This is the next daily' class=mods>" + "⭐" + "</span>");
    }

    append += ("</div>");


    $("#dates").append(append);
  }
  doFilter();
}
var matched;

function doFilter() {
  badDivs = [];
  toFilter = [];
  toMatch = Number($("#filterMatch").val());
  if (filterType.has) {
    for (var f in filter) {
      if (f == "seed") continue;
      if (!filter[f]) {
        badDivs.push($("." + f));
      }
    }
  }
  if (filterType.atleast) {
    divsToCheck = $(".seed");
    for (var z in filter) {
      if (z == "seed") continue;
      if (filter[z]) {
        toFilter.push(z);
      }
    }
    for (var d of divsToCheck) { //jshint ignore:line
      matched = 0;
      if (toFilter <= 0) break;
      for (var n in toFilter) {
        if ($(d).hasClass(toFilter[n])) {
          // console.log("matched");
          matched++;
        }
      }
      if (matched < toMatch) {
        badDivs.push(d);
      }
    }
  }
  for (var b in badDivs) {
    $(badDivs[b]).replaceWith("<div class=daily>Not In Filter</div>");
  }
}

function redditFormat() {
  var todayOfWeek = getDailyTimeString(0, false, true);

  for (var z = 0; z < 8; z++) {
    dayIndex = (todayOfWeek * -1) + z;
    if (dayIndex > -1) {
      dayIndex = (z - todayOfWeek) - 7;
    }
  }



  for (var x = dayIndex; x < (dayIndex + 7); x++) {
    var value = prettify(getDailyHeliumValue(countDailyWeight(getDailyChallenge(x, true, false))));
    var returnText = getDailyChallenge(x, false, false, true);
    returnText += "Grants an additional **" + value + "%** of all helium earned before finishing.";
    console.log(returnText);
  }
}

function formatDailySeedDate() {
  if (!game.global.dailyChallenge.seed) return "";
  var seed = String(game.global.dailyChallenge.seed);
  return seed.substr(0, 4) + '-' + seed.substr(4, 2) + '-' + seed.substr(6);
}

var lastAdd = 0; //internal starting seed

function getDailyTimeString(add, makePretty, getDayOfWeek, makeReallyPretty) {
  var today = new Date();
  if (!add) add = 0;
  today.setUTCDate(today.getUTCDate() + add + lastAdd);
  if (getDayOfWeek) return today.getUTCDay();
  var year = today.getUTCFullYear();
  var month = today.getUTCMonth() + 1; //For some reason January is month 0? Why u do dis?
  if (month < 10) month = "0" + month;
  var day = today.getUTCDate();
  if (day < 10) day = "0" + day;
  if (makeReallyPretty == "long") return (months[Number(month)]) + " " + day + ", " + year;
  if (makePretty) return year + "-" + month + "-" + day;
  var seedStr = String(year) + String(month) + String(day);
  seedStr = parseInt(seedStr);
  return seedStr;
}

function getRandomIntSeeded(seed, minIncl, maxExcl) {
  var toReturn = Math.floor(seededRandom(seed) * (maxExcl - minIncl)) + minIncl;
  return (toReturn === maxExcl) ? minIncl : toReturn;
}

function seededRandom(seed) {
  var x = Math.sin(seed++) * 10000;
  return parseFloat((x - Math.floor(x)).toFixed(7));
}

function everythingInArrayGreaterEqual(smaller, bigger) {
  if (bigger.length < smaller.length) return false;
  for (var x = 0; x < smaller.length; x++) {
    if (smaller[x] > bigger[x]) return false;
  }
  return true;
}


function getDailyChallenge(add, objectOnly, textOnly, reddit) {
  // checkCompleteDailies();
  var now = new Date().getTime();
  var dateSeed = getDailyTimeString(add);
  var betterDailyDate = getDailyTimeString(add, false, false, "long");
  var todayOfWeek = getDailyTimeString(0, false, true);
  var returnText = "";
  if (!objectOnly) {
    if (textOnly) {
      returnText = "•" + betterDailyDate + "\n";
    }
    if (reddit) {
      returnText = "**" + days[todayOfWeek + add] + ", " + betterDailyDate + "**\n \n";
    }
  }

  var seedStr = getRandomIntSeeded(dateSeed + 2, 1, 1e9);
  //seedStr = getRandomIntSeeded(seedStr, 1, 1e9);
  var weightTarget = getRandomIntSeeded(seedStr++, 20, 51) / 10;
  //Build a list of all modifiers to choose from
  var modifierList = [];
  var totalChance = 0;
  var dailyObject = {};

  for (var item in dailyModifiers) {
    modifierList.push(item);
    totalChance += dailyModifiers[item].chance;
  }
  var chanceMod = 1000 / totalChance;
  var currentWeight = 0;
  var maxLoops = modifierList.length;
  var sizeCount = [0, 0, 0]; // < 0.3, < 1, >= 1
  var sizeTarget = [getRandomIntSeeded(seedStr++, 0, 2), getRandomIntSeeded(seedStr++, 1, 5), getRandomIntSeeded(seedStr++, 2, 6)];
  if (weightTarget < 2.75) {
    sizeTarget[2] = 0;
    sizeTarget[0] += 2;
  }
  mainLoop:
    for (var x = 0; x < maxLoops; x++) {
      var maxZLoops = modifierList.length;
      var firstChoice = [];
      modLoop:
        for (var z = 0; z < maxZLoops; z++) {
          var roll = getRandomIntSeeded(seedStr++, 0, 1000);
          var selectedIndex;
          var checkedTotal = 0;
          lookupLoop:
            for (var y = 0; y < modifierList.length; y++) {
              checkedTotal += dailyModifiers[modifierList[y]].chance * chanceMod;
              if ((roll < checkedTotal) || y == modifierList.length - 1) {
                totalChance -= dailyModifiers[modifierList[y]].chance;
                chanceMod = 1000 / totalChance;
                selectedIndex = y;
                break lookupLoop;
              }
            }
          var selectedMod = modifierList[selectedIndex];
          var modObj = dailyModifiers[selectedMod];
          var str = modObj.minMaxStep[0] + (getRandomIntSeeded(seedStr++, 0, Math.floor(((modObj.minMaxStep[1] + modObj.minMaxStep[2]) * (1 / modObj.minMaxStep[2]))) - modObj.minMaxStep[0]) * modObj.minMaxStep[2]);
          var modWeight = modObj.getWeight(str);
          var modSize = (modWeight < 0.85) ? 0 : ((modWeight < 1.85) ? 1 : 2);
          if ((modWeight + currentWeight > weightTarget + 1)) continue;
          if (everythingInArrayGreaterEqual(sizeTarget, sizeCount)) {
            //use it and stuff
          } else if (sizeCount[modSize] >= sizeTarget[modSize] && z != maxZLoops - 1) {
            if (!firstChoice.length) firstChoice = [selectedMod, str, selectedIndex, modSize, modWeight];
            continue modLoop;
          } else if (z == maxZLoops - 1 && firstChoice.length) {
            selectedMod = firstChoice[0];
            modObj = dailyModifiers[selectedMod];
            selectedIndex = firstChoice[2];
            str = firstChoice[1];
            modSize = firstChoice[3];
            modWeight = firstChoice[4];
          }

          //It's been officially selected by this point
          sizeCount[modSize]++;
          if (!objectOnly) {
            if (textOnly) {
              returnText += "•" + modObj.description(str) + " \n ";
            }
            if (reddit) {
              returnText += "* " + modObj.redditdescription(str) + " \n \n";
            }
          }
          dailyObject[modifierList[selectedIndex]] = {
            strength: str,
            stacks: 0
          };
          currentWeight += modWeight;
          if (x > 0 && (currentWeight > weightTarget || (currentWeight >= weightTarget - 0.5 && currentWeight <= weightTarget + 0.5))) {
            break mainLoop;
          }
          modifierList.splice(selectedIndex, 1);
          break modLoop;
        }

    }
  dailyObject.seed = dateSeed;
  if (objectOnly) return dailyObject;
  // returnText += "</ul>Challenge has no end point, and grants an <u><b>additional " + prettify(getDailyHeliumValue(currentWeight)) + "%</b></u> of all helium earned before finishing. <b>Can only be run once!</b> Reward does not count toward Bone Portals or affect best He/Hr stat.";
  if (textOnly) return returnText;
  nextDaily = returnText;
  // if (document.getElementById('specificChallengeDescription') != null) document.getElementById('specificChallengeDescription').innerHTML = returnText;
  // updateDailyClock();
  return returnText;
}

var bestDailyValue = 0;
var bestDailyDate = 0;
var bestDailyObj = {};

function findBestDaily(days) {
  for (var x = 0; x < days; x++) {
    var dailyDate = getDailyTimeString(x, true, false);
    var dailyValue = getDailyHeliumValue(countDailyWeight(getDailyChallenge(x, true, false)));
    if (dailyValue > bestDailyValue) {
      bestDailyValue = dailyValue;
      bestDailyDate = dailyDate;
      bestDailyObj = getDailyChallenge(x, true, false);
    }
  }
  console.log(bestDailyDate);
  console.log(bestDailyValue);
  console.log(bestDailyObj);
}

function avgDaily(days) {
  var dailyValues = 0;
  var dailyTimes = 0;
  for (var x = 0; x < days; x++) {
    dailyTimes = x;
    dailyValues += getDailyHeliumValue(countDailyWeight(getDailyChallenge(x, true, false)));
  }
}

function handle_paste(ev) {

  var save_string = ev.clipboardData.getData("text/plain").replace(/\s/g, '');
  game = JSON.parse(LZString.decompressFromBase64(save_string));

  $("#error").hide();

  if (game.global.version > 4.72) $("#error").show().empty().append("This calculator is updated for Trimps 4.71, values might be inaccurate.");

  makeDaily();
}

function countDailyWeight(daily) {
  var weight = 0;
  dailyObj = daily;
  for (var item in dailyObj) {
    if (item == "seed") continue;
    weight += dailyModifiers[item].getWeight(dailyObj[item].strength);
  }
  return weight;
}

function prettify(x) {
  return (x).toFixed(1);
}

function getDailyHeliumValue(weight) {
  var value = 75 * weight + 20;
  if (value < 100) value = 100;
  else if (value > 500) value = 500;
  return value;
}
$(function() {
  $(document).tooltip();
});

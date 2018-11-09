/* jshint esversion: 6 */

$(document).ready(function() {
  buildSpire();
  // getTrapLocalStorage();
});

var trapLayout;

function buildSpire() {

  trapLayout = [];
  $("#layout").empty();

  var rows = document.getElementById("spireRows").value;
  var columns = 5;
  var toDo = columns * rows;

  for (var t = toDo; t > 0; t--) {

    element = "<div onclick='setTrap(" + (t - 1) + ",\"none\")'";
    element += "id='trapCell" + (t - 1) + "'";
    element += "class='trapCell EmptyTrapBox' >";
    element += "</div>";

    $("#layout").append(element);
  }
  trapLayout = $("#layout").children();

  var div = document.getElementById("layout");
  div.addEventListener("mouseover", doSomething, false);

}

function doSomething(e) {
  if (e.target !== e.currentTarget) {
    if (e.buttons == 1 || e.buttons == 3) {
      // console.log(e.target);
      e.target.click();
    } else {
      return;
    }
  }
  e.stopPropagation();
}

var strengthLocations = [];

function setTrap(number, current) {

  if (selectedTrap == null || selectedTrap == current) return;

  var search = trapLayout;
  var index = $("#layout").find("#trapCell" + number).index();

  var row = Math.floor(index / 5);

  if (index == -1) return;

  if (strengthLocations[row] == true && selectedTrap == "Strength") {
    // console.log(strengthLocations[row] + " row " + row);
    return;
  }

  if (selectedTrap == "Strength") {
    strengthLocations[row] = true;
  } else if (current == "Strength" && selectedTrap != "Strength") {
    strengthLocations[row] = false;
  }

  // Check if row already has Strength

  search[index].classList = "trapCell";
  search[index].classList.add(selectedTrap + "TrapBox");
  search[index].setAttribute('onclick', 'setTrap(' + number + ",\"" + selectedTrap + "\")");

  imAnEnemy();
  getCostOfBuild();

}

var selectedTrap;

function selectTrap(type) {

  var search = $("#trapSelector").children();
  var length = search.length;

  selectedTrap = type;

  for (var o = 0; o < length; o++) {
    if (search[o].classList.contains(type + "TrapBox")) {
      search[o].classList += " selected";
    } else {
      search[o].classList.remove("selected");
      continue;
    }
  }
}

var fireDamage = 70;

var frostDamage = 10;
var frostSlow = 5;

var poisonStackAtOnce = 3;

var lightningDamage = 10;

var strengthDamage = 20;
var strengthBoost = 0.5; // 50% Boost , Does *not* get affected by lightning

//add +1 to this, or *2 then +1 if you have lightning before
var condenserBuff = 0.25;

//
var knowledgeSlow = 5;

var layout = {};

function imAnEnemy() {

  //hey you're an enemy cool;

  pathLength = trapLayout.length;
  path = trapLayout;

  damageTaken = 0; // Damage you've taken
  chilledFor = 0; // Chilled by Frost Trap
  frozenFor = 0; // Frozen by knowledge
  poisonStack = 0; // Current Poison Stack you have, will take damage at end of turn
  lastStruckCell = -10;

  fireCount = 0;
  frostCount = 0;
  poisonCount = 0;
  lightningCount = 0;
  strengthCount = 0;
  condenserCount = 0;
  knowledgeCount = 0;

  for (var p = (pathLength - 1); p > -1; p--) {
    layout[p] = {};
    if (path[p] == null) {
      continue;
    }
    console.log("yes");
    if (path[p].classList.contains("FireTrapBox")) {
      layout[p].type = "fire";
      fireCount++;
      damageTaken += fireDamage * amIChilled() * amIStruck(p) * amIFrozen() * isThereStrength(p);
    }
    if (path[p].classList.contains("FrostTrapBox")) {
      layout[p].type = "frost";
      frostCount++;
      chilledFor += frostSlow * amIStruck(p);
      damageTaken += frostDamage * amIStruck(p);
    }
    if (path[p].classList.contains("PoisonTrapBox")) {
      layout[p].type = "poison";
      poisonCount++;
      poisonStack += poisonStackAtOnce * amIStruck(p) * amIChilled() * amIFrozen();

      damageTaken += poisonStackAtOnce;
      if (amIChilled() > 1) damageTaken += poisonStack;
      if (amIFrozen() > 1) damageTaken += poisonStack;

    }
    if (path[p].classList.contains("LightningTrapBox")) {
      layout[p].type = "lightning";
      lightningCount++;
      damageTaken += lightningDamage * amIChilled() * amIFrozen();
      lastStruckCell = p;
    }
    if (path[p].classList.contains("StrengthTrapBox")) {
      layout[p].type = "strength";
      strengthCount++;
      damageTaken += strengthDamage * amIChilled() * amIStruck(p) * amIFrozen();
    }
    if (path[p].classList.contains("CondenserTrapBox")) {
      layout[p].type = "condensor";
      condenserCount++;
      poisonStack *= (condenserBuff * amIChilled() * amIStruck(p) * amIFrozen()) + 1;
    }
    if (path[p].classList.contains("KnowledgeTrapBox")) {
      layout[p].type = "knowledge";
      if (chilledFor > 0) {
        knowledgeCount++;
        chilledFor = 0;
        frozenFor += knowledgeSlow * amIStruck(p);
      }
    }
    if (path[p].classList.contains("EmptyTrapBox")) {
      layout[p].type = "empty";
      if (chilledFor > 0) {
        chilledFor -= 1;
      }
      if (frozenFor > 0) {
        frozenFor -= 1;
      }
    }

    if (poisonStack > 0 && !path[p].classList.contains("PoisonTrapBox") && p != 0) {
      damageTaken += poisonStack * amIChilled() * amIFrozen();
    }

  }

  $("#allDamage").text(numberWithCommas(Math.round(damageTaken)));
  estimatedMaxDifficulty();
}

function amIChilled() {
  if (chilledFor > 0) {
    chilledFor -= 1;
    return 2;
  } else {
    return 1;
  }
}

function amIStruck(p) {
  if (lastStruckCell == (p + 1)) {
    return 2;
  } else {
    return 1;
  }
}

function amIFrozen() {
  if (frozenFor > 0) {
    frozenFor -= 1;
    return 3;
  } else {
    return 1;
  }
}

function isThereStrength(number) {
  var row = Math.floor(number / 5);

  if (strengthLocations[row]) {
    // console.log(row);
    return (strengthBoost + 1);
  } else {
    return 1;
  }
}

var fireBaseCost = 100;
var fireCostIncrease = 1.1;

var frostBaseCost = 100;
var frostCostIncrease = 1.2;

var poisonBaseCost = 500;
var poisonCostIncrease = 1.1;

var lightningBaseCost = 1000;
var lightningCostIncrease = 1.5;

var strengthBaseCost = 5000;
var strengthCostIncrease = 10;

var condenserBaseCost = 5000;
var condenserCostIncrease = 15;

var knowledgeBaseCost = 5000;
var knowledgeCostIncrease = 20;

function getCostOfBuild() {
  cost = 0;

  cost += fireBaseCost * (1 - (Math.pow(fireCostIncrease, fireCount))) / (1 - fireCostIncrease);
  cost += frostBaseCost * (1 - (Math.pow(frostCostIncrease, frostCount))) / (1 - frostCostIncrease);
  cost += poisonBaseCost * (1 - (Math.pow(poisonCostIncrease, poisonCount))) / (1 - poisonCostIncrease);
  cost += lightningBaseCost * (1 - (Math.pow(lightningCostIncrease, lightningCount))) / (1 - lightningCostIncrease);
  cost += strengthBaseCost * (1 - (Math.pow(strengthCostIncrease, strengthCount))) / (1 - strengthCostIncrease);
  cost += condenserBaseCost * (1 - (Math.pow(condenserCostIncrease, condenserCount))) / (1 - condenserCostIncrease);
  cost += knowledgeBaseCost * (1 - (Math.pow(knowledgeCostIncrease, knowledgeCount))) / (1 - knowledgeCostIncrease);

  $("#costOfBuild").text(numberWithCommas(Math.round(cost)));

}

function getHealthWith(difficulty) {
  var difficultyMod = Math.pow(1.02, difficulty);
  return 50 + (difficultyMod / 2) + Math.floor(1 * (50 + difficultyMod)); // .5 in place of Math.random() , its the average basically, less randomness
}

var damageTaken;
var damage;

function estimatedMaxDifficulty() {
  damage = damageTaken;
  var difficulty = 100;

  min = 1;
  max = 5000;

  if (damage < 31000) { // 500 = 30034 HP
    max = 510;
  } else if (damage < 600000000) { // 1000 = 597397076 HP
    max = 1100;
  } else if (damage < 680) { // 300 = 670.1172540307665 HP
    max = 310;
  }

  do {
    if (damage == 0 || damage == null || damage == undefined || damage < 120) {
      break;
    }
    check = ((max + min) / 2);

    health = getHealthWith(check);

    if (damage > health) {
      min = check;
    } else {
      max = check;
    }

    if (health <= damage && (damage - health) <= 1 || (max - min) <= 1) {
      difficulty = min;
      break;
    }

    console.log("l");
  } while (true);

  shownDifficulty = Math.round(difficulty - 10);

  $("#maxDiffuculty").text(numberWithCommas(shownDifficulty));
  $("#enemyHealth").text(numberWithCommas(Math.round(getHealthWith(difficulty))));
}


// loadouts = [{}];
//
//
// function saveLoadout(number) {
//
//   loadouts[number] = $("#layout")[0].outerHTML;
//
//   localStorage.setItem('loadouts',loadouts);
// }
//
// function loadLoadout(number) {
//
//   trapLayout = $.extend(true, {}, trapLayout);
//
//   $("#layout").html(trapLayout);
//
// }
//
// function getTrapLocalStorage() {
//   if (localStorage.getItem("loadouts") == null) {
//     localStorage.setItem("loadouts", loadouts);
//   } else {
//     loadouts = localStorage.getItem("loadouts");
//   }
// }

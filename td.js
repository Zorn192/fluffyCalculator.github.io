$(document).ready(buildSpire());

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
    element += "class='trapCell' >";
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
  estimatedMaxDifficulty();
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

function imAnEnemy() {

  //hey you're an enemy cool;

  pathLength = trapLayout.length;
  path = trapLayout;

  damageTaken = 0; // Damage you've taken
  chilledFor = 0; // Frozen by knowledge
  frozenFor = 0; // Chilled by Frost Trap
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
    if (path[p] == null) {
      continue;
    }

    if (path[p].classList.contains("FireTrapBox")) {
      fireCount++;
      damageTaken += fireDamage * amIChilled() * amIStruck(p) * amIFrozen() * isThereStrength(p);
    }
    if (path[p].classList.contains("FrostTrapBox")) {
      frostCount++;
      chilledFor += frostSlow * amIStruck(p);
      damageTaken += frostDamage * amIStruck(p);
    }
    if (path[p].classList.contains("PoisonTrapBox")) {
      poisonCount++;
      poisonStack += poisonStackAtOnce * amIChilled() * amIStruck(p) * amIFrozen();
    }
    if (path[p].classList.contains("LightningTrapBox")) {
      lightningCount++;
      damageTaken += lightningDamage * amIChilled() * amIFrozen();
      lastStruckCell = p;
    }
    if (path[p].classList.contains("StrengthTrapBox")) {
      strengthCount++;
      damageTaken += strengthDamage * amIChilled() * amIStruck(p) * amIFrozen();
    }
    if (path[p].classList.contains("CondenserTrapBox")) {
      condenserCount++;
      poisonStack *= (condenserBuff * amIChilled() * amIStruck(p) * amIFrozen()) + 1;
    }
    if (path[p].classList.contains("KnowledgeTrapBox")) {
      knowledgeCount++;
      chilledFor = 0;
      frozenFor += knowledgeSlow * amIStruck(p);
    }

    if (poisonStack > 0) {
      damageTaken += poisonStack;
    }
  }

  $("#allDamage").text(numberWithCommas(Math.round(damageTaken)));
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

function estimatedMaxDifficulty() {
  damage = damageTaken;
  var difficulty = 100;

  function getHealthWith(difficulty) {
    var difficultyMod = Math.pow(1.02, difficulty);
    return 50 + (difficultyMod / 2) + Math.floor(0.5 * (50 + difficultyMod)); // .5 in place of Math.random() , its the average basically, less randomness
  }

  do {
    health = getHealthWith(difficulty);
    if (damage / health < 100) {
      difficulty += 5;
    } else {
      difficulty += 500;
    }

  } while ((damage) > health);

  $("#maxDiffuculty").text(numberWithCommas(Math.round(difficulty)));
}

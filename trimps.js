function countDailyWeight(daily) {
  var weight = 0;
  if (!daily) {
    dailyObj = game.global.dailyChallenge;
  } else if (daily) {
    dailyObj = daily;
  }
  for (var item in dailyObj) {
    if (item == "seed") continue;
    weight += dailyModifiers[item].getWeight(dailyObj[item].strength);
  }
  return weight;
}

function getDailyHeliumValue(weight) {
  var l = calculateLevel();
  var e = game.global.fluffyPrestige;
  var value = 75 * weight + 20;
  if (value < 100) value = 100;
  else if (value > 500) value = 500;
  if (isRewardActive("dailies")) value += 100;
  return value;
}
$(function() {
  $(document).tooltip();
});


function prettify(a) {
  var yourNotation = game.options.menu.standardNotation.enabled;
  notations = [
    [], "KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTgUtgDtgTtgQatgQitgSxtgSptgOtgNtgQaaUqaDqaTqaQaqaQiqaSxqaSpqaOqaNqaQiaUqiDqiTqiQaqiQiqiSxqiSpqiOqiNqiSxaUsxDsxTsxQasxQisxSxsxSpsxOsxNsxSpaUspDspTspQaspQispSxspSpspOspNspOgUogDogTogQaogQiogSxogSpogOogNogNaUnDnTnQanQinSxnSpnOnNnCtUc".split(/(?=[A-Z])/), [], "a b c d e f g h i j k l m n o p q r s t u v w x y z aa ab ac ad ae af ag ah ai aj ak al am an ao ap aq ar as at au av aw ax ay az ba bb bc bd be bf bg bh bi bj bk bl bm bn bo bp bq br bs bt bu bv bw bx by bz ca cb cc cd ce cf cg ch ci cj ck cl cm cn co cp cq cr cs ct cu cv cw cx".split(" "), "KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTg".split(/(?=[A-Z])/)
  ];
  if (0 > a)
    return "-" + prettify(-a);
  if (1e4 > a)
    return +a.toPrecision(4) + "";
  if ("0" === yourNotation)
    return a.toExponential(2).replace("+", "");
  for (var b = 0; a >= 999.5;)
    a /= 1e3,
    b++; // jshint ignore:line
  var c = notations[yourNotation || 1],
    d = b > c.length ? "e" + 3 * b : c[b - 1];
  return +a.toPrecision(3) + d;
}

/* jshint ignore:start */

function decodePrettify(a) {
  if (a) {
    num = a.toLowerCase();
    game.global.lastCustomExact = num;
    if (game.global.firstCustomExact == -1) game.global.firstCustomExact = num;
    if (num.split('%')[1] == "") {
      num = num.split('%');
      num[0] = parseFloat(num[0]);
      if (num[0] <= 100 && num[0] >= 0) {
        var workspaces = game.workspaces;
        num = Math.floor(workspaces * (num[0] / 100));
      } else num = 1;
    } else if (num.split('/')[1]) {
      num = num.split('/');
      num[0] = parseFloat(num[0]);
      num[1] = parseFloat(num[1]);
      var workspaces = game.workspaces;
      num = Math.floor(workspaces * (num[0] / num[1]));
      if (num < 0 || num > workspaces) num = 1;
    } else if (num.split('e')[1]) {
      num = num.split('e');
      num = Math.floor(parseFloat(num[0]) * (Math.pow(10, parseInt(num[1]))));
    } else {
      var letters = num.replace(/[^a-z]/gi, "");
      var base = 0;
      if (letters.length) {
        if (game.options.menu.standardNotation.enabled == 3) {
          var suffices = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
          base = (suffices.indexOf(letters[0]) + 1);
          if (letters.length > 1) {
            base *= suffices.length;
            base += (suffices.indexOf(letters[1]) + 1);
          }
        } else {
          var suffices = [
            'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud',
            'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv',
            'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tg', 'Utg', 'Dtg', 'Ttg',
            'Qatg', 'Qitg', 'Sxtg', 'Sptg', 'Otg', 'Ntg', 'Qaa', 'Uqa', 'Dqa', 'Tqa',
            'Qaqa', 'Qiqa', 'Sxqa', 'Spqa', 'Oqa', 'Nqa', 'Qia', 'Uqi', 'Dqi',
            'Tqi', 'Qaqi', 'Qiqi', 'Sxqi', 'Spqi', 'Oqi', 'Nqi', 'Sxa', 'Usx',
            'Dsx', 'Tsx', 'Qasx', 'Qisx', 'Sxsx', 'Spsx', 'Osx', 'Nsx', 'Spa',
            'Usp', 'Dsp', 'Tsp', 'Qasp', 'Qisp', 'Sxsp', 'Spsp', 'Osp', 'Nsp',
            'Og', 'Uog', 'Dog', 'Tog', 'Qaog', 'Qiog', 'Sxog', 'Spog', 'Oog',
            'Nog', 'Na', 'Un', 'Dn', 'Tn', 'Qan', 'Qin', 'Sxn', 'Spn', 'On',
            'Nn', 'Ct', 'Uc'
          ];
          for (var x = 0; x < suffices.length; x++) {
            if (suffices[x].toLowerCase() == letters) {
              base = x + 1;
              break;
            }
          }
        }
        if (base) num = Math.round(parseFloat(num.split(letters)[0]) * Math.pow(1000, base));
      }
      if (!base) num = parseInt(num);
    }
  }
  return num;
}
/* jshint ignore:end */


// get daily % for you
var dailyModifiers = {
  minDamage: {
    description: function(str) {
      return "Trimp min damage reduced by " + prettify(this.getMult(str) * 100) + "% (additive).";
    },
    getMult: function(str) {
      return 0.1 + ((str - 1) * 0.01);
    },
    getWeight: function(str) {
      return (1 / ((1.2 + (1 - this.getMult(str))) / 2 / 1.1)) - 1;
    },
    minMaxStep: [41, 90, 1],
    chance: 1
  },
  maxDamage: {
    description: function(str) {
      return "Trimp max damage increased by " + prettify(this.getMult(str) * 100) + "% (additive).";
    },
    getMult: function(str) {
      return str;
    },
    getWeight: function(str) {
      return (1 - ((1.2 + (1 + str)) / 2 / 1.1));
    },
    minMaxStep: [1, 5, 0.25],
    chance: 1
  },
  plague: { //Half of electricity
    description: function(str) {
      return "Enemies stack a debuff with each attack, damaging Trimps for " + prettify(this.getMult(str, 1) * 100) + "% of total health per turn per stack, resets on Trimp death.";
    },
    getMult: function(str, stacks) {
      return 0.01 * str * stacks;
    },
    getWeight: function(str) {
      var count = Math.ceil((1 + Math.sqrt(1 + 800 / str)) / 2);
      return (6 - (0.1 * count) + (0.8 / count) + (str / 8)) / 1.75;
    },
    minMaxStep: [1, 10, 1],
    chance: 0.3,
    icon: "*bug2",
    incompatible: ["rampage", "weakness"],
    stackDesc: function(str, stacks) {
      return "Your Trimps are taking " + prettify(this.getMult(str, stacks) * 100) + "% damage after each attack.";
    }
  },
  weakness: {
    description: function(str) {
      return "Enemies stack a debuff with each attack, reducing Trimp attack by " + prettify(100 - this.getMult(str, 1) * 100) + "% per stack. Stacks cap at 9 and reset on Trimp death.";
    },
    getMult: function(str, stacks) {
      return 1 - (0.01 * str * stacks);
    },
    getWeight: function(str) {
      return str / 4;
    },
    minMaxStep: [1, 10, 1],
    chance: 0.6,
    icon: "fire",
    incompatible: ["bogged", "plague"],
    stackDesc: function(str, stacks) {
      return "Your Trimps have " + prettify(100 - this.getMult(str, stacks) * 100) + "% less attack.";
    }
  },
  large: {
    description: function(str) {
      return "All housing can store " + prettify(100 - this.getMult(str) * 100) + "% fewer Trimps";
    },
    getMult: function(str) {
      return 1 - (0.01 * str);
    },
    getWeight: function(str) {
      return (1 / this.getMult(str) - 1) * 2;
    },
    start: function(str) {
      game.resources.trimps.maxMod = this.getMult(str);
    },
    abandon: function(str) {
      game.resources.trimps.maxMod = 1;
    },
    minMaxStep: [10, 60, 1],
    chance: 1
  },
  dedication: {
    description: function(str) {
      return "Gain " + prettify((this.getMult(str) * 100) - 100) + "% more resources from gathering";
    },
    getMult: function(str) {
      return 1 + (0.1 * str);
    },
    getWeight: function(str) {
      return 0.075 * str * -1;
    },
    incompatible: ["famine"],
    minMaxStep: [5, 40, 1],
    chance: 0.75
  },
  famine: {
    description: function(str) {
      return "Gain " + prettify(100 - (this.getMult(str) * 100)) + "% less Metal, Food, Wood, and Gems from all sources";
    },
    getMult: function(str) {
      return 1 - (0.01 * str);
    },
    getWeight: function(str) {
      return (1 / this.getMult(str) - 1) / 2;
    },
    incompatible: ["dedication"],
    minMaxStep: [40, 80, 1],
    chance: 2
  },
  badStrength: {
    description: function(str) {
      return "Enemy attack increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
    },
    getMult: function(str) {
      return 1 + (0.2 * str);
    },
    getWeight: function(str) {
      return 0.1 * str;
    },
    minMaxStep: [5, 15, 1],
    chance: 1
  },
  badHealth: {
    description: function(str) {
      return "Enemy health increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
    },
    getMult: function(str) {
      return 1 + (0.2 * str);
    },
    getWeight: function(str) {
      return 0.2 * str;
    },
    minMaxStep: [3, 15, 1],
    chance: 1
  },
  badMapStrength: {
    description: function(str) {
      return "Enemy attack in maps increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
    },
    getMult: function(str) {
      return 1 + (0.3 * str);
    },
    getWeight: function(str) {
      return (0.1 * (1 + 1 / 3)) * str;
    },
    minMaxStep: [3, 15, 1],
    chance: 1
  },
  badMapHealth: {
    description: function(str) {
      return "Enemy health in maps increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
    },
    getMult: function(str) {
      return 1 + (0.3 * str);
    },
    getWeight: function(str) {
      return (0.3 * str) * (5 / 8);
    },
    minMaxStep: [3, 10, 1],
    chance: 1
  },
  crits: {
    description: function(str) {
      return "Enemies have a 25% chance to crit for " + prettify(this.getMult(str) * 100) + "% of normal damage.";
    },
    getMult: function(str) {
      return 1 + (0.5 * str);
    },
    getWeight: function(str) {
      return 0.15 * this.getMult(str);
    },
    minMaxStep: [1, 24, 1],
    chance: 0.75
  },
  trimpCritChanceUp: {
    description: function(str) {
      return "Your Trimps have +" + prettify(this.getMult(str) * 100) + "% Crit Chance.";
    },
    getMult: function(str) {
      return str / 10;
    },
    getWeight: function(str) {
      return 0.25 * str * -1;
    },
    minMaxStep: [5, 10, 1],
    incompatible: ["trimpCritChanceDown"],
    chance: 1.25
  },
  trimpCritChanceDown: {
    description: function(str) {
      return "Your Trimps have -" + prettify(this.getMult(str) * 100) + "% Crit Chance.";
    },
    getMult: function(str) {
      return str / 10;
    },
    getWeight: function(str) {
      return (str / 4.5);
    },
    minMaxStep: [2, 7, 1],
    incompatible: ["trimpCritChanceUp"],
    chance: 0.75
  },
  bogged: {
    description: function(str) {
      return "Your Trimps lose " + prettify(this.getMult(str) * 100) + "% of their max health after each attack.";
    },
    getMult: function(str) {
      return 0.01 * str;
    },
    getWeight: function(str) {
      var count = Math.ceil(1 / this.getMult(str));
      return (6 - ((0.2 * (count > 60 ? 60 : count) / 2)) + ((((500 * count + 400) / count) / 500) - 1)) / 1.5;
    },
    incompatible: ["rampage", "weakness"],
    minMaxStep: [1, 5, 1],
    chance: 0.3
  },
  dysfunctional: {
    description: function(str) {
      return "Your Trimps breed " + prettify(100 - (this.getMult(str) * 100)) + "% slower";
    },
    getMult: function(str) {
      return 1 - (str * 0.05);
    },
    getWeight: function(str) {
      return ((1 / this.getMult(str)) - 1) / 6;
    },
    minMaxStep: [10, 18, 1],
    chance: 1
  },
  oddTrimpNerf: {
    description: function(str) {
      return "Trimps have " + prettify(100 - (this.getMult(str) * 100)) + "% less attack on odd numbered Zones";
    },
    getMult: function(str) {
      return 1 - (str * 0.02);
    },
    getWeight: function(str) {
      return (1 / this.getMult(str) - 1) / 1.5;
    },
    minMaxStep: [15, 40, 1],
    chance: 1
  },
  evenTrimpBuff: {
    description: function(str) {
      return "Trimps have " + prettify((this.getMult(str) * 100) - 100) + "% more attack on even numbered Zones";
    },
    getMult: function(str) {
      return 1 + (str * 0.2);
    },
    getWeight: function(str) {
      return (this.getMult(str) - 1) * -1;
    },
    minMaxStep: [1, 10, 1],
    chance: 1
  },
  karma: {
    description: function(str) {
      return 'Gain a stack after killing an enemy, increasing all non Helium loot by ' + prettify((this.getMult(str, 1) * 100) - 100) + '%. Stacks cap at ' + this.getMaxStacks(str) + ', and reset after clearing a Zone.';
    },
    stackDesc: function(str, stacks) {
      return "Your Trimps are finding " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more loot!";
    },
    getMaxStacks: function(str) {
      return Math.floor((str % 9) * 25) + 300;
    },
    getMult: function(str, stacks) {
      var realStrength = Math.ceil(str / 9);
      return 1 + (0.0015 * realStrength * stacks);
    },
    getWeight: function(str) {
      return (this.getMult(str, this.getMaxStacks(str)) - 1) / -2;
    },
    icon: "*arrow-up",
    minMaxStep: [1, 45, 1],
    chance: 1
  },
  toxic: {
    description: function(str) {
      return "Gain a stack after killing an enemy, reducing breed speed by " + prettify(100 - (this.getMult(str, 1) * 100)) + '% (compounding). Stacks cap at ' + this.getMaxStacks(str) + ', and reset after clearing a Zone.';
    },
    stackDesc: function(str, stacks) {
      return "Your Trimps are breeding " + prettify(100 - (this.getMult(str, stacks) * 100)) + "% slower.";
    },
    getMaxStacks: function(str) {
      return Math.floor((str % 9) * 25) + 300;
    },
    getMult: function(str, stacks) {
      var realStrength = Math.ceil(str / 9);
      return Math.pow((1 - 0.001 * realStrength), stacks);
    },
    getWeight: function(str) {
      return (1 / this.getMult(str, this.getMaxStacks(str)) - 1) / 6;
    },
    icon: "*radioactive",
    minMaxStep: [1, 45, 1],
    chance: 1
  },
  bloodthirst: {
    description: function(str) {
      return "Enemies gain a stack of Bloodthirst whenever Trimps die. Every " + this.getFreq(str) + " stacks, enemies will heal to full and gain an additive 50% attack. Stacks cap at " + this.getMaxStacks(str) + " and reset after killing an enemy.";
    },
    stackDesc: function(str, stacks) {
      var freq = this.getFreq(str);
      var max = this.getMaxStacks(str);
      var text = "This Bad Guy";
      if (stacks < max) {
        var next = (freq - (stacks % freq));
        text += " will heal to full and gain attack in " + next + " stack" + ((next == 1) ? "" : "s") + ", " + ((stacks >= freq) ? "" : " and") + " gains 1 stack whenever Trimps die";
      }
      if (stacks >= freq) {
        if (stacks < max) text += ", and";
        text += " currently has " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more attack";
      }
      text += ".";
      return text;
    },
    getMaxStacks: function(str) {
      return (this.getFreq(str) * (2 + Math.floor(str / 2)));
    },
    getFreq: function(str) {
      return 10 - str;
    },
    getMult: function(str, stacks) {
      var count = Math.floor(stacks / this.getFreq(str));
      return 1 + (0.5 * count);
    },
    getWeight: function(str) {
      return 0.5 + (0.25 * Math.floor(str / 2));
    },
    minMaxStep: [1, 7, 1],
    chance: 1,
    icon: "*flask",
    iconOnEnemy: true
  },
  explosive: {
    description: function(str) {
      var text = "Enemies instantly deal " + prettify(this.getMult(str) * 100) + "% of their attack damage when killed";
      if (str > 15) {
        text += " unless your block is as high as your maximum health";
      }
      text += ".";
      return text;
    },
    getMult: function(str) {
      return str;
    },
    getWeight: function(str) {
      var mult = this.getMult(str);
      if (str <= 15) {
        return (3 / 20 * mult) + (1 / 4);
      } else {
        return (1 / 14 * mult) - (1 / 7);
      }
    },
    minMaxStep: [5, 30, 1],
    chance: 1
  },
  slippery: {
    description: function(str) {
      return "Enemies have a " + prettify(this.getMult(str) * 100) + "% chance to dodge your attacks on " + ((str <= 15) ? "odd" : "even") + " Zones.";
    },
    getMult: function(str) {
      if (str > 15) str -= 15;
      return 0.02 * str;
    },
    getWeight: function(str) {
      return (1 / (1 - this.getMult(str)) - 1) * 10 / 1.5;
    },
    minMaxStep: [1, 30, 1],
    chance: 1
  },
  rampage: {
    description: function(str) {
      return "Gain a stack after killing an enemy, increasing Trimp attack by " + prettify((this.getMult(str, 1) * 100) - 100) + '% (additive). Stacks cap at ' + this.getMaxStacks(str) + ', and reset when your Trimps die.';
    },
    stackDesc: function(str, stacks) {
      return "Your Trimps are dealing " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more damage.";
    },
    getMaxStacks: function(str) {
      return Math.floor((str % 10 + 1) * 10);
    },
    getMult: function(str, stacks) {
      var realStrength = Math.ceil(str / 10);
      return 1 + (0.01 * realStrength * stacks);
    },
    getWeight: function(str) {
      return (1 - this.getMult(str, 1)) * this.getMaxStacks(str);
    },
    icon: "*fire",
    incompatible: ["plague", "bogged"],
    minMaxStep: [1, 40, 1],
    chance: 1
  },
  mutimps: {
    description: function(str) {
      var size = str % 5;
      if (size == 0) size = "";
      else size = "the first " + prettify(size * 2) + " rows of";

      var name = (str < 4) ? "Mutimps" : "Hulking Mutimps";
      return "40% of Bad Guys in " + size + " the World will be mutated into " + name + ".";
    },
    getWeight: function(str) {
      return (str / 10) * 1.5;
    },
    getMaxCellNum: function(str) {
      if (str > 5) str -= 5;
      str--;
      var values = [19, 39, 59, 79, 99];
      return values[str];
    },
    minMaxStep: [1, 10, 1],
    chance: 1
  },
  empower: {
    description: function(str) {
      var s = (str == 1) ? "" : "s";
      return "All enemies gain " + str + " stack" + s + " of Empower whenever your Trimps die in the World. Empower increases the attack and health of Bad Guys in the World by 0.2% per stack, can stack to 9999, and never resets.";
    },
    getWeight: function(str) {
      return (str / 6) * 2;
    },
    stackDesc: function(str, stacks) {
      return "This Bad Guy is Empowered and has " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more health and attack.";
    },
    stacksToAdd: function(str) {
      return str;
    },
    getMult: function(str, stacks) {
      return 1 + (0.002 * stacks);
    },
    getMaxStacks: function(str) {
      return 9999;
    },
    worldStacksOnly: true,
    iconOnEnemy: true,
    icon: "baby-formula",
    minMaxStep: [1, 10, 1],
    chance: 1
  },
  pressure: {
    description: function(str) {
      return "Trimps gain a stack of Pressure every " + Math.round(this.timePerStack(str)) + " seconds. Each stack of pressure reduces Trimp health by 1%. Max of " + Math.round(this.getMaxStacks(str)) + " stacks, stacks reset after clearing a Zone.";
    },
    getWeight: function(str) {
      var time = (105 - this.timePerStack(str));
      var stacks = this.getMaxStacks(str);
      return (((time * 1.3) + stacks) / 200);
    },
    getMult: function(str, stacks) {
      return Math.pow(0.99, stacks);
    },
    addSecond: function() {
      var modifier = game.global.dailyChallenge.pressure;
      modifier.timer = (modifier.timer) ? modifier.timer + 1 : 1;
      if (modifier.timer >= 60) {
        this.addStack();
        modifier.timer = 0;
      }
      updateDailyStacks('pressure');
    },
    addStack: function() {
      var global = game.global;
      var challenge = global.dailyChallenge.pressure;
      if (this.getMaxStacks(challenge.strength) <= challenge.stacks) {
        return;
      }
      challenge.stacks++;
      if (global.fighting) {
        global.soldierHealthMax *= 0.99;
        if (global.soldierHealthMax < global.soldierHealth)
          global.soldierHealth = global.soldierHealthMax;
        if (global.soldierHealth < 0)
          global.soldierHealth = 0;
      }
    },
    timePerStack: function(str) {
      var thisStr = Math.ceil(str / 4) - 1;
      return (45 + (thisStr * 5));
    },
    resetTimer: function() {
      var modifier = game.global.dailyChallenge.pressure;
      modifier.timer = 0;
      modifier.stacks = 0;
      updateDailyStacks('pressure');
    },
    stackDesc: function(str, stacks) {
      return "Your Trimps are under a lot of pressure. Maximum health is reduced by " + prettify((1 - this.getMult(str, stacks)) * 100) + "%.";
    },
    getMaxStacks: function(str) {
      var thisStr = Math.floor(str % 4);
      return (45 + (thisStr * 5));
    },
    icon: "*heart3",
    minMaxStep: [1, 16, 1],
    chance: 1
  },
  mirrored: {
    description: function(str) {
      var reflectChance = this.getReflectChance(str);
      return "Enemies have a" + (reflectChance.toString()[0] == '8' ? 'n' : '') + " " + prettify(reflectChance) + "% chance to reflect an attack, dealing " + prettify(this.getMult(str) * 100) + "% of damage taken back to your Trimps.";
    },
    getReflectChance: function(str) {
      return (Math.ceil(str / 10)) * 10;
    },
    getMult: function(str) {
      return ((str % 10) + 1) / 10;
    },
    getWeight: function(str) {
      return ((((this.getReflectChance(str) + 90) / 100) * 0.85) * ((this.getMult(str) + 0.9) * 0.85));
    },
    testWeights: function() {
      var min = 0;
      var max = 0;
      var results = [];
      for (var x = this.minMaxStep[0]; x <= this.minMaxStep[1]; x += this.minMaxStep[2]) {
        var result = this.getWeight(x);
        if (min == 0)
          min = result;
        else if (result < min)
          min = result;
        if (result > max)
          max = result;
        results.push(result);
      }
      console.log(results);
      return "Min: " + min + ", Max: " + max;
    },
    reflectDamage: function(str, attack) {
      if (Math.floor(Math.random() * 100) >= this.getReflectChance(str))
        return 0;
      return this.getMult(str) * attack;
    },
    minMaxStep: [1, 100, 1],
    chance: 1
  },
  metallicThumb: {
    description: function(str) {
      return "Equipment is " + prettify((1 - this.getMult(str)) * 100) + "% cheaper.";
    },
    getWeight: function(str) {
      return ((str + 3) / 26);
    },
    getMult: function(str) {
      return 1 - (str / 100 * 5);
    },
    minMaxStep: [1, 10, 1],
    chance: 1
  }
  /* 		disarmed: {
  			equipmentList: ["Boots", "Mace", "Helmet", "Polearm", "Pants", "Battleaxe", "Shoulderguards", "Greatsword", "Breastplate", "Arbalest", "Gambeson"],
  			description: function (str) {
  				return "You can't use something"
  			},
  			getBannedEquipment(str, checkOne){
  				if (checkOne) return (this.equipmentList.indexOf(checkOne) < str);
  			},
  			minMaxStep: [1, 11, 1],
  			chance: 1
  		} */
};


function romanNumeral(number) {
  //This is only accurate up to 399, but that's more than plenty for this game. Probably not the cleanest converter ever, but I thought of it myself, it works, and I'm proud.
  var numeral = "";
  while (number >= 100) {
    number -= 100;
    numeral += "C";
  }
  //77
  if (number >= 90) {
    number -= 90;
    numeral += "XC";
  }
  if (number >= 50) {
    number -= 50;
    numeral += "L";
  }
  if (number >= 40) {
    number -= 40;
    numeral += "XL";
  }
  while (number >= 10) {
    number -= 10;
    numeral += "X";
  }
  if (number >= 9) {
    number -= 9;
    numeral += "IX";
  }
  if (number >= 5) {
    number -= 5;
    numeral += "V";
  }
  if (number >= 4) {
    number -= 4;
    numeral += "IV";
  }
  while (number >= 1) {
    number -= 1;
    numeral += "I";
  }
  return numeral;
}

var rewards = ["stickler", "helium", "liquid", "purifier", "lucky", "void", "helium", "liquid", "eliminator", "overkiller"];
var prestigeRewards = ["dailies", "voidance", "overkiller", "critChance", "megaCrit", "superVoid", "voidelicious", "naturesWrath", "voidSiphon"];

function isRewardActive(reward) {
  var calculatedPrestige = game.global.fluffyPrestige;
  if (game.talents.fluffyAbility.purchased) calculatedPrestige++;
  if (calculateLevel() + calculatedPrestige == 0) return 0;
  var indexes = [];
  for (var x = 0; x < rewards.length; x++) {
    if (rewards[x] == reward)
      indexes.push(x);
  }
  for (var z = 0; z < prestigeRewards.length; z++) {
    if (prestigeRewards[z] == reward)
      indexes.push(rewards.length + z);
  }
  var count = 0;
  for (var y = 0; y < indexes.length; y++) {
    if (currentLevel + calculatedPrestige > indexes[y]) count++;
  }
  return count;
}

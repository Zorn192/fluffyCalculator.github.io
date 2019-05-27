/* jshint esversion: 6 */
function handle_paste(ev) {
    var save_string = ev.clipboardData.getData("text/plain").replace(/\s/g, '');
    game = JSON.parse(LZString.decompressFromBase64(save_string));
    timesNextRunned = 0;
    update.fill();
    update.table();
}

var version = 0.07;
var firstTableCorner = "🍆";
var secondTableCorner = "💦";
var calc = {
    firstLevel: 1000,
    getFirstLevel: function () {
        var prestigeRequire = Math.pow(this.prestigeExpModifier, game.global.fluffyPrestige);
        return this.firstLevel * prestigeRequire;
    },
    growth: 4,
    specialExpModifier: 1, //For events, test server, etc
    baseExp: 50,
    expGrowth: 1.015,
    currentLevel: 0,
    prestigeDamageModifier: 5,
    prestigeExpModifier: 5,
    damageModifiers: [1, 1.1, 1.3, 1.6, 2, 2.5, 3.1, 3.8, 4.6, 5.5, 6.5],
    calculateLevel: function () {
        var level = Math.floor(Math.log(((game.global.fluffyExp / this.getFirstLevel()) * (this.growth - 1)) + 1) / Math.log(this.growth));
        // var capableLevels = game.portal.Capable.level;
        // if (level > capableLevels) level = capableLevels;
        this.currentLevel = level;
        return level;
    },
    getMinZoneForExp: function () {
        var zone = 301;
        if (game.portal.Classy.level) zone -= (game.portal.Classy.level * 2);
        calc.startToEarn = Math.floor(zone);
        return Math.floor(zone);
    },
    //removeExp input E/L and returns the right xp to remove
    removeExp: function (e, l) {
        if (l == 10) return 0;
        return Math.floor(this.firstLevel * Math.pow(this.prestigeExpModifier, e) * ((Math.pow(this.growth, l) - 1) / (this.growth - 1)));
    },
    //evaluates how much xp is needed to level
    upgrade: function (e, l) {
        return Math.floor(this.firstLevel * Math.pow(this.prestigeExpModifier, e) * ((Math.pow(this.growth, l + 1) - 1) / (this.growth - 1)) - this.removeExp(e, l));
    },
    zoneYouPortal: 0,
    dailyBonus: 0,
    heirloomBonus: 0,
    specialBonus: 1,
    startToEarn: 301,
    expBonus: 1,
    currentExp: 0,
    neededExp: 0,
    maxEvolution: 10,
    xpPerRun: 0,
    graphNextIce: false,
    zoneXP: function (start, end) {
        if (end < this.startToEarn) {
            return 0;
        }
        // So if you start at zone 0, it wouldn't count you're gaining xp at there.
        if (start < this.startToEarn) {
            start = this.startToEarn;
        }
        if (end - start == 1) {
            return this.spireXP(start);
        }
        mcalc1 = (Math.pow(this.expGrowth, (end - start)) - 1) / (this.expGrowth - 1);
        mcalc2 = (50 + (game.portal.Curious.level * 30)) * (1 + (game.portal.Cunning.level * 0.25)) * this.expBonus;
        // Starting spire bonus information
        addSpireBonus = 0;
        if (fluffyCalculator.spireBonus != "") {
            var spires = fluffyCalculator.spireBonus.split(",");
            for (var s in spires) {
                zone = (parseInt(spires[s]) + 1) * 100;
                if (start < zone && zone < end) {
                    addSpireBonus += this.spireXP(zone);
                }
            }
        }
        if (start < calc.startToEarn) {
            return (((mcalc1 * mcalc2) + addSpireBonus) - this.zoneXP(calc.startToEarn, (start)));
        } else {
            return ((mcalc1 * mcalc2) + addSpireBonus);
        }
    },
    spireXP: function (zone) {
        var reward = (this.baseExp + (game.portal.Curious.level * 30)) * Math.pow(this.expGrowth, zone - this.getMinZoneForExp() - 1) * (1 + (game.portal.Cunning.level * 0.25));
        value = reward * this.expBonus * this.expGrowth;
        return (value);
    }
};

var fluffyCalculator = {
    spireBonus: "",
    minutesPerRun: 0,
    instantUpdating: false,
    lastVersionSeen: version,
    theme: "light"
};

var update = {
    fill: function () {
        //jshint ignore:start
        document.getElementById("CapablePerk").value = game.portal.Capable.level;
        document.getElementById("CunningPerk").value = game.portal.Cunning.level;
        !game.portal.Cunning.locked && !$("#CunningPerk").is(":visible") && $("#CunningPerk").parent().toggle();
        document.getElementById("CuriousPerk").value = game.portal.Curious.level;
        !game.portal.Curious.locked && !$("#CuriousPerk").is(":visible") && $("#CuriousPerk").parent().toggle();
        document.getElementById("ClassyPerk").value = game.portal.Classy.level;
        !game.portal.Classy.locked && !$("#ClassyPerk").is(":visible") && $("#ClassyPerk").parent().toggle();
        document.getElementById("ZoneYouPortal").value = game.global.lastPortal;
        document.getElementById("ZoneYouPortal").setAttribute("min", calc.getMinZoneForExp());
        calc.zoneYouPortal = game.global.lastPortal;
        document.getElementById("DailyPercentage").value = Math.round(getDailyHeliumValue(countDailyWeight()));
        if (game.global.dailyChallenge.seed) {
            document.getElementById("DailyPercentage").value = Math.round(getDailyHeliumValue(countDailyWeight()));
            calc.dailyBonus = (Math.round(getDailyHeliumValue(countDailyWeight())) / 100) + 1;
        } else {
            document.getElementById("DailyPercentage").value = 0;
            calc.dailyBonus = 1;
        }
        document.getElementById("HeirloomPercentage").value = getHeirloomValue() * 100 - 100;
        document.getElementById("HeirloomPercentage").value = getHeirloomValue() * 100 - 100;
        calc.heirloomBonus = getHeirloomValue()
        getHeirloomValue() > 1 && !$("#HeirloomPercentage").is(":visible") && $("#HeirloomPercentage").parent().toggle();
        if (game.playerSpire.traps.Knowledge.owned && !$("#KnowledgeTowers").is(":visible")) {
            $("#KnowledgeTowers").parent().toggle();
            $("#KnowledgeLevel").parent().toggle();
        }
        document.getElementById("KnowledgeTowers").value = game.playerSpire.traps.Knowledge.owned;
        document.getElementById("KnowledgeLevel").value = game.playerSpire.traps.Knowledge.level;
        calc.currentExp = Math.ceil(game.global.fluffyExp - calc.removeExp(game.global.fluffyPrestige, calc.calculateLevel()));
        calc.iceBonus = (1 + (0.0025 * game.empowerments.Ice.level));

        this.expBonus()
        this.stats();
        // jshint ignore:end
    },
    toggle: function (id) {},
    vars: function (type, data) {
        data = Number(data);
        switch (type) {
            case "CapablePerk":
                game.portal.Capable.level = (data);
                game.portal.Capable.heliumSpent = 100000000 * (1 - Math.pow(10, data)) / (1 - 10);
                break;
            case "CunningPerk":
                game.portal.Cunning.level = (data);
                game.portal.Cunning.heliumSpent = 100000000000 * (1 - (Math.pow(1.3, data))) / (1 - 1.3);
                break;
            case "CuriousPerk":
                game.portal.Curious.level = (data);
                game.portal.Curious.heliumSpent = 100000000000000 * (1 - (Math.pow(1.3, data))) / (1 - 1.3);
                break;
            case "ClassyPerk":
                game.portal.Classy.level = (data);
                game.portal.Classy.heliumSpent = 100000000000000000 * (1 - (Math.pow(1.3, data))) / (1 - 1.3);
                if ((data > 1)) calc.startToEarn = 301 - (data * 2);
                break;
            case "ZoneYouPortal":
                calc.zoneYouPortal = data;
                break;
            case "DailyPercentage":
                calc.dailyBonus = (data / 100) + 1;
                break;
            case "HeirloomPercentage":
                calc.heirloomBonus = (data / 100) + 1;
                break;
            case "SpecialBonus":
                calc.specialBonus = (data);
                break;
            case "InstantUpdating":
                fluffyCalculator.instantUpdating = data;
                saveLocalStorage();
                break;
            case "KnowledgeTowers":
                game.playerSpire.traps.Knowledge.owned = data;
                break;
            case "KnowledgeLevel":
                game.playerSpire.traps.Knowledge.level = data;
                break;
            case "SpiresInARun":
                fluffyCalculator.spireBonus = $("#spireBonus").val();
                saveLocalStorage();
                break;
            case "MinutesPerRun":
                fluffyCalculator.minutesPerRun = Number($("#MPR").val());
                saveLocalStorage();
                break;
        }
        // console.log(fluffyCalculator.instantUpdating == "true" && type != "instantUpdating");
        if (fluffyCalculator.instantUpdating == "true" && type != "instantUpdating") {
            this.table();
        }
    },
    expBonus: function () {
        var returnN = 1;
        //dailyBonus
        if (calc.dailyBonus > 1) {
            returnN *= calc.dailyBonus;
        }
        // specialBonus
        if (calc.specialBonus > 1) {
            returnN *= calc.specialBonus;
        }
        //expGrowth
        returnN *= calc.expGrowth;
        // heirloomBonus
        if (calc.heirloomBonus > 1) {
            returnN *= calc.heirloomBonus;
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
        // iceBonus
        if (calc.iceBonus > 1 && calc.graphNextIce) {
            returnN *= calc.iceBonus;
        }
        calc.expBonus = returnN;
    },
    XpPerRun: function () {
        value = calc.zoneXP(0, calc.zoneYouPortal);
        calc.xpPerRun = value;
        return value;
    },
    stats: function () {
        calc.neededExp = calc.upgrade(game.global.fluffyPrestige, calc.currentLevel);
        document.getElementById("XpPerRun").value = numberWithCommas(Math.round(calc.xpPerRun));
        document.getElementById("PercentageToLevelLabel").innerText = `% Of Level: ${prettify(Math.round((calc.currentExp / calc.neededExp) * 100))}%`;
        document.getElementById("PercentageToLevel").innerHTML = `<div class="progress-bar" style="width:${prettify((calc.currentExp / calc.neededExp) * 100)}%"></div>`;
        document.getElementById("CurrentZone").value = game.global.world;
        if (game.stats.bestFluffyExp.valueTotal > 0) {
            document.getElementById("BonesToLevel").value = prettify(Math.ceil(((calc.neededExp - calc.currentExp) / game.stats.bestFluffyExp.valueTotal)) * 100);
        }
        (fluffyCalculator.minutesPerRun > 0) ? $("#FluffyXPHr").parent().show(): $("#FluffyXPHr").parent().hide(); // jshint ignore:line
        if (fluffyCalculator.minutesPerRun > 0) {
            document.getElementById("FluffyXPHr").value = numberWithCommas(Math.ceil(((calc.xpPerRun / fluffyCalculator.minutesPerRun) * 60)));
        }
        this.countHelium();
    },
    table: function () {
        calc.getMinZoneForExp();
        this.expBonus();
        this.XpPerRun();
        $("#TableHead").empty();
        var thead = `<tr> <th>${firstTableCorner}</th>`;
        thead += `<th>Runs to E${game.global.fluffyPrestige}</th>`;
        if (fluffyCalculator.minutesPerRun > 0) thead += `<th>Time to E${game.global.fluffyPrestige}</th>`;
        if (game.global.fluffyPrestige != calc.maxEvolution) {
            thead += `<th>Runs to E${game.global.fluffyPrestige + 1}</th>`;
            if (fluffyCalculator.minutesPerRun > 0) thead += `<th>Time to E${game.global.fluffyPrestige + 1}</th>`;
        }
        thead += "</tr>";
        $("#TableHead").append(thead);
        var hypo = {
            "E": game.global.fluffyPrestige,
            "L": 0,
        };
        this.tableValues = {
            "runs": [],
            "runSeconds": [],
            "approxDate": []
        };
        var seconds = (fluffyCalculator.minutesPerRun * 60);
        var runsAdded = 0;
        var runLength = 20;
        if (game.global.fluffyPrestige == calc.maxEvolution) {
            runLength = 10;
        }
        for (var x = 0; runLength >= x; x++) {
            date = new Date();
            timeDate = new Date();
            if (x <= 10) {
                l = x - 1;
                e = hypo.E;
            }
            if (x > 10) {
                l = (x == 20) ? 9 : (x - 11); // x == 20 because  20 % 10 = 0 :P
                e = hypo.E + 1;
            }
            xpToLevel = calc.upgrade(e, l);
            if ((l <= calc.currentLevel - 1 && e == hypo.E)) { // if level is lower then the one "l" just put blank
                this.tableValues.approxDate[x] = "";
            } else if (l == calc.currentLevel && e == hypo.E) { // if level is the same as the one you are trying to upgrade from, calcualte from - currentXP
                runsAdded += (xpToLevel - calc.currentExp) / calc.xpPerRun;
                timeDate.setSeconds(timeDate.getDate() + (runsAdded * seconds));
                this.tableValues.approxDate[x] = timeDate;
                date.setDate(date.getDate() + runsAdded);
            } else if (e > calc.maxEvolution) { // If evolution is above the max, put nothing for everything on the last column.
            } else { // If you are calculating the rest of your evolution, put data on the first columns
                runsAdded += xpToLevel / calc.xpPerRun;
                date.setDate(date.getDate() + runsAdded);
                timeDate.setSeconds(timeDate.getDate() + (runsAdded * seconds));
                this.tableValues.approxDate[x] = timeDate;
            }
            this.tableValues.runs[x] = Number((runsAdded).toFixed(2));
            this.tableValues.runSeconds[x] = sformat(runsAdded * seconds);
        }
        // console.log(this.tableValues)
        $("#TableBody").empty();
        var tbody = "";
        for (var y = 1; y <= 10; y++) {
            tbody += `<tr>`;
            tbody += `<th class="levelRows">L${y}</th>`;
            tbody += `<td>${this.tableValues.runs[y]}</td>`;
            if (fluffyCalculator.minutesPerRun > 0) tbody += `<td title="${this.tableValues.approxDate[y]}">${this.tableValues.runSeconds[y]}</td>`;
            if (game.global.fluffyPrestige != calc.maxEvolution) {
                tbody += `<td>${this.tableValues.runs[y+10]}</td>`;
                if (fluffyCalculator.minutesPerRun > 0) tbody += `<td title="${this.tableValues.approxDate[y+10]}">${this.tableValues.runSeconds[y+10]}</td>`;
            }
            tbody += `</tr>`;
        }
        $("#TableBody").append(tbody);
        this.zoneData = {
            "zone": [],
            "level": []
        };
        if (this.tableValues.runs[calc.currentLevel + 1] < 3) {
            maxZone = game.global.highestLevelCleared + 50;
            if (game.global.world > game.global.highestLevelCleared) {
                maxZone = game.global.world + 50;
            }
            if (calc.zoneYouPortal > game.global.highestLevelCleared) {
                maxZone = calc.zoneYouPortal + 50;
            }
            document.getElementById("zoneTable").innerHTML = "";
            document.getElementById("zoneTable").style.display = "none";
            zone = game.global.world;
            level = calc.currentLevel;
            evolution = game.global.fluffyPrestige;
            lastLeveled = zone;
            xpToLevel = calc.neededExp - calc.currentExp;
            timesLeveled = 0;
            for (var z = zone; z < maxZone; z++) {
                runXP = calc.zoneXP(lastLeveled, z + 1);
                if (runXP >= xpToLevel) {
                    this.zoneData.zone[timesLeveled] = z;
                    this.zoneData.level[timesLeveled] = `E${evolution}L${level+1}`;
                    lastLeveled = z;

                    if (level == 9) {
                        evolution++;
                        level = 0;
                    } else {
                        level++;
                    }
                    timesLeveled++;
                    xpToLevel = calc.upgrade(evolution, (level));
                }
            }
            if (this.zoneData.zone[0] > 0) {
                zoneTable = `<tr>
                <thead class="thead-active">
                <tr><th>${secondTableCorner}</th>
                <th>On Zone</th></tr>
                </thead>
                `;
                for (var zi = 0; zi < this.zoneData.zone.length; zi++) {
                    zoneTable += `
                    <tr><th class="levelRows">${this.zoneData.level[zi]}</th>
                    <td>${this.zoneData.zone[zi]}</td></tr>
                    `;
                }
                zoneTable += `</tr>`;
                document.getElementById("zoneTable").style.display = "inline-table";
                document.getElementById("zoneTable").innerHTML = zoneTable;

            }
        }
        this.stats();
    },
    countHelium: function () {
        allHelium = game.global.totalHeliumEarned;
        var capablePercent = (game.portal.Capable.heliumSpent / allHelium) * 100;
        var cunningPercent = (game.portal.Cunning.heliumSpent / allHelium) * 100;
        var curiousPercent = (game.portal.Curious.heliumSpent / allHelium) * 100;
        var classyPercent = (game.portal.Classy.heliumSpent / allHelium) * 100;

        htmlContent = `
        <div class="progress-bar bg-success" title = "Capable" style="width:${capablePercent}%"></div>
        <div class="progress-bar bg-info" title = "Cunning" style="width:${cunningPercent}%"></div>
        <div class="progress-bar bg-warning" title = "Curious" style="width:${curiousPercent}%"></div>
        <div class="progress-bar bg-danger" title = "Classy" style="width:${classyPercent}%"></div>
        `;

        document.getElementById("HeliumOnFluffy").innerText = `Helium on Fluffy: ${Math.round(capablePercent + cunningPercent + curiousPercent + classyPercent)}%`;

        document.getElementById("HeliumSpentFluffy").innerHTML = htmlContent;
        // return prettify((capableCost + cunningCost + curiousCost + classyCost) / allHelium * 100);
    }
};

function unlockHiddenStats() {
    //jshint ignore:start
    game.portal.Cunning.locked = false;
    !$("#CunningPerk").is(":visible") && $("#CunningPerk").parent().toggle();
    game.portal.Curious.locked = false;
    !$("#CuriousPerk").is(":visible") && $("#CuriousPerk").parent().toggle();
    game.portal.Classy.locked = false;
    !$("#ClassyPerk").is(":visible") && $("#ClassyPerk").parent().toggle();
    !$("#HeirloomPercentage").is(":visible") && $("#HeirloomPercentage").parent().toggle();
    if (!$("#KnowledgeTowers").is(":visible")) {
        $("#KnowledgeTowers").parent().toggle();
        $("#KnowledgeLevel").parent().toggle();
    }
    //jshint ignore:end
}

function makePopup(title, innerHTML, type, width) {

    titleNoSpaces = title.replace(/\s/g, '');

    if (document.getElementById(titleNoSpaces)) {
        closePopup(titleNoSpaces);
    }


    firstLayer = document.createElement('div');
    firstLayer.setAttribute("class", "firstLayer");
    firstLayer.setAttribute("id", titleNoSpaces);

    secondLayer = document.createElement('div');
    secondLayer.setAttribute("class", "secondLayer");

    thirdLayer = document.createElement('div');
    thirdLayer.setAttribute("class", "thirdLayer");


    thirdLayer.style.width = width;
    thirdLayer.innerHTML += "<div class='tooltipTitle' style='position: relative; width:100%; text-align: center;'><u>" + uppercaseLetter(title) + "</u></div>";
    if (type == "daily") thirdLayer.innerHTML += "<div style='text-align:center'> (" + timesNextRunned + ")</div>";
    thirdLayer.innerHTML += innerHTML;

    thirdLayer.innerHTML += "<br /> <div> <input type='button' class='form-control input-shadow' value='Close' onmousedown=closePopup('" + titleNoSpaces + "')></input> </div>";

    firstLayer.appendChild(secondLayer);
    secondLayer.appendChild(thirdLayer);
    document.getElementById("basicallyBody").appendChild(firstLayer);

}

function closePopup(title) {
    if (document.getElementById(title)) {
        document.getElementById(title).remove();
    }
}

function graphNextLevel() {
    innerHTML = "<div style='text-align:center'>";
    shownDailies = [];
    var todayOfWeek = getDailyTimeString(0, false, true);
    for (var z = 0; z < 8; z++) {
        dayIndex = (todayOfWeek * -1) + z;
        if (dayIndex > -1) {
            dayIndex = (z - todayOfWeek) - 7;
        }
    }
    lastWeek = dayIndex - 7;
    blank = lastWeek - dayIndex + 1;
    index = lastWeek;
    do {
        if (blank > index) {
            index++;
            continue;
        }
        daily = getDailyChallenge(index, true, false);
        if (game.global.recentDailies.includes(daily.seed)) {
            index++;
            continue;
        } else {
            shownDailies.push(index);
            index++;
            continue;
        }
    } while (shownDailies.length < 7);

    for (var x = 0; x < shownDailies.length; x++) {
        if (x == 7) innerHTML += "<br>";
        thisIndex = shownDailies[x];

        var dailyObj = getDailyChallenge(thisIndex, true, false);
        var dailyHeliumValue = getDailyHeliumValue(countDailyWeight(dailyObj));
        var tooltip = getDailyTimeString(thisIndex, false, false, "long") + "\n" + getDailyChallenge(thisIndex, false, true).replace(/<br>/g, "");

        innerHTML += `
      <div onmousedown=makeNextWith(this.id) class="graphNextLevel" id="${thisIndex}" 
      style="background-color: var(--${getDailyClass(dailyHeliumValue)})"
      title="${tooltip} Bonus is ${dailyPrettify(dailyHeliumValue)}%">
      
      ${getDailyTimeString(thisIndex, true)} <br /> <div> ${prettify(dailyHeliumValue)}% </div>
      </div>
      `;
    }

    innerHTML += "<br> <br> <div class='graphNextLevel' id='none' onmousedown=makeNextWith(this.id)>⠀No Daily⠀</div>";
    innerHTML += "<br> <div class='graphNextLevel' id='ice" + calc.graphNextIce + "' title='Would apply a " + prettify(calc.iceBonus * 100) + "% bonus to your run' onmousedown=toggleIceBonus(this.id)> Ice Enlightenment</div>";

    innerHTML += "</div>";


    makePopup("Graph Next Level", innerHTML, "daily", "50%");
}
timesNextRunned = 0;

function getDailyClass(value) {
    add = 0;
    if (isRewardActive("dailies")) add = 100;
    var tiers = [(200 + add), (300 + add), (400 + add)];

    if (value <= tiers[0]) {
        return "daily-tier-1";
    } else if (value <= tiers[1] && value > tiers[0]) {
        return "daily-tier-2";
    } else if (value > tiers[1]) {
        return "daily-tier-3";
    }
}

function makeNextWith(input) {
    //NowLevel
    nowLevel = calc.calculateLevel();
    // finish off this run;
    if (game.global.world < calc.zoneYouPortal) {
        game.global.fluffyExp += calc.zoneXP(game.global.world, calc.zoneYouPortal);
    }
    game.global.world = 0;
    //Then Level
    thenLevel = calc.calculateLevel();

    if (thenLevel > nowLevel) {
        if (thenLevel == 10) {
            game.global.fluffyPrestige += 1;
            game.global.fluffyExp = 0;
        }
    }

    if (input == "none") {
        game.global.dailyChallenge = {};
    } else {
        input = Number(input);
        dailyObj = getDailyChallenge(input, true);
        game.global.dailyChallenge = dailyObj;
        game.global.recentDailies.push(dailyObj.seed);
    }
    timesNextRunned++;

    closePopup("GraphNextLevel");
    graphNextLevel();
    $('.ui-tooltip').remove(); // tooltips stay why
    update.fill();
    update.table();
}

function toggleIceBonus() {
    calc.graphNextIce = !calc.graphNextIce;
    $('.ui-tooltip').remove(); // tooltips stay why
    closePopup("GraphNextLevel");
    graphNextLevel();
}
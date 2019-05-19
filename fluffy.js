/* jshint esversion: 6 */
function handle_paste(ev) {
    var save_string = ev.clipboardData.getData("text/plain").replace(/\s/g, '');
    game = JSON.parse(LZString.decompressFromBase64(save_string));
    update.fill();
    update.table();
}
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
    zoneXP: function (start, end) {
        // So if you start at zone 0, it wouldn't count you're gaining xp at there.
        if (start < this.startToEarn) {
            start = this.startToEarn;
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
        document.getElementById("KnowledgeTowers").value = game.playerSpire.traps.Knowledge.owned;
        document.getElementById("KnowledgeLevel").value = game.playerSpire.traps.Knowledge.level;
        calc.currentExp = Math.ceil(game.global.fluffyExp - calc.removeExp(game.global.fluffyPrestige, calc.calculateLevel()));
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
        // if (iceBonus > 1 && graphNextIce) {
        //     returnN *= iceBonus;
        // }
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
        document.getElementById("PercentageToLevel").value = prettify((calc.currentExp / calc.neededExp) * 100) + "%";
        document.getElementById("CurrentZone").value = game.global.world;
        document.getElementById("BonesToLevel").value = prettify(Math.ceil(((calc.neededExp - calc.currentExp) / game.stats.bestFluffyExp.valueTotal)) * 100);
        (fluffyCalculator.minutesPerRun > 0) ? $("#FluffyXPHr").parent().show(): $("#FluffyXPHr").parent().hide();
        if (fluffyCalculator.minutesPerRun > 0) {
            document.getElementById("FluffyXPHr").value = numberWithCommas(Math.ceil(((calc.xpPerRun / fluffyCalculator.minutesPerRun) * 60)));
        }
        document.getElementById("HeliumSpentFluffy").value = this.countHelium() + "%";
    },
    table: function () {
        calc.getMinZoneForExp();
        this.expBonus();
        this.XpPerRun();
        $("#TableHead").empty();
        var thead = "<tr> <th>😊</th>";
        thead += `<th>Runs to E${game.global.fluffyPrestige}</th>`;
        if (fluffyCalculator.minutesPerRun > 0) thead += `<th>Time to E${game.global.fluffyPrestige + 1}</th>`;
        thead += `<th>Runs to E${game.global.fluffyPrestige + 1}</th>`;
        if (fluffyCalculator.minutesPerRun > 0) thead += `<th>Time to E${game.global.fluffyPrestige + 1}</th>`;
        thead += "</tr>";
        $("#TableHead").append(thead);
        var hypo = {
            "E": game.global.fluffyPrestige,
            "L": 0,
        };
        var tableValues = {
            "runs": [],
            "runSeconds": [],
            "approxDate": []
        };
        var approxDate = [];
        var seconds = (fluffyCalculator.minutesPerRun * 60);
        var runsAdded = 0;
        for (var x = 0; 20 >= x; x++) {
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
                approxDate[x] = "";
            } else if (l == calc.currentLevel && e == hypo.E) { // if level is the same as the one you are trying to upgrade from, calcualte from - currentXP
                runsAdded += (xpToLevel - calc.currentExp) / calc.xpPerRun;
                timeDate.setSeconds(timeDate.getDate() + (runsAdded * seconds));
                tableValues.approxDate[x] = timeDate;
                date.setDate(date.getDate() + runsAdded);
            } else if (e > calc.maxEvolution) { // If evolution is above the max, put nothing for everything on the last column.
            } else { // If you are calculating the rest of your evolution, put data on the first columns
                runsAdded += xpToLevel / calc.xpPerRun;
                date.setDate(date.getDate() + runsAdded);
                timeDate.setSeconds(timeDate.getDate() + (runsAdded * seconds));
                tableValues.approxDate[x] = timeDate;
            }
            tableValues.runs[x] = Number((runsAdded).toFixed(2));
            tableValues.runSeconds[x] = sformat(runsAdded * seconds);
        }
        // console.log(tableValues)
        $("#TableBody").empty();
        var tbody = "";
        for (var y = 1; y <= 10; y++) {
            tbody += `<tr>`;
            tbody += `<th class="levelRows">L${y}</th>`;
            tbody += `<td>${tableValues.runs[y]}</td>`;
            if (fluffyCalculator.minutesPerRun > 0) tbody += `<td title="${tableValues.approxDate[y]}">${tableValues.runSeconds[y]}</td>`;
            tbody += `<td>${tableValues.runs[y+10]}</td>`;
            if (fluffyCalculator.minutesPerRun > 0) tbody += `<td title="${tableValues.approxDate[y+10]}">${tableValues.runSeconds[y+10]}</td>`;
            tbody += `</tr>`;
        }
        $("#TableBody").append(tbody);
        this.stats();
    },
    countHelium: function () {
        allHelium = game.global.totalHeliumEarned;
        var capableCost = game.portal.Capable.heliumSpent;
        var cunningCost = game.portal.Cunning.heliumSpent;
        var curiousCost = game.portal.Curious.heliumSpent;
        var classyCost = game.portal.Classy.heliumSpent;
        return prettify((capableCost + cunningCost + curiousCost + classyCost) / allHelium * 100);
    }
};

function correctLocalStorage() {
    error = false;
    oldSave = (localStorage.getItem("fluffyCalculator"));
    try {
        if (!JSON.parse(oldSave));
        if (typeof JSON.parse(oldSave) == "string") throw "typeof was string";
        if (typeof Number(oldSave) == "number" && !isNaN(Number(oldSave))) throw "typeof was number";
    } catch (err) {
        var errormessage = err;
        if (err.name == "SyntaxError") errormessage = "couldn't parse oldSave";
        error = true;
        // console.log(errormessage);
    }
    if (error) {
        localStorage.removeItem("fluffyCalculator");
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

function saveLocalStorage() {
    fluffyCalculator.spireBonus = $("#SpiresInARun").val();
    fluffyCalculator.minutesPerRun = Number($("#MinutesPerRun").val());
    fluffyCalculator.instantUpdating = document.getElementById("InstantUpdating").value;
    localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
}

function getLocalStorage() {
    if (localStorage.getItem("fluffyCalculator") == null) {
        localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
    } else {
        fluffyCalculator = JSON.parse(localStorage.getItem("fluffyCalculator"));
        document.getElementById("SpiresInARun").value = fluffyCalculator.spireBonus;
        document.getElementById("MinutesPerRun").value = fluffyCalculator.minutesPerRun;
        document.getElementById("InstantUpdating").value = fluffyCalculator.instantUpdating;
    }
}

function sformat(s) {
    if (s == 0) return 0;
    var fm = [
        Math.floor(s / 60 / 60 / 24), // DAYS
        Math.floor(s / 60 / 60) % 24, // HOURS
        Math.floor(s / 60) % 60, // MINUTES
        Math.floor(s % 60) // SECONDS
    ];
    return $.map(fm, function (v, i) {
        return ((v < 10) ? '0' : '') + v;
    }).join(':');
}
// Makes both tables
function getRunsToLevelUp() {
  $("#levelUpTable").empty();
  $("#timeLevelUpTable").empty();
  $(".levelUpHeader1").html("E" + game.global.fluffyPrestige);
  $(".levelUpHeader2").html("E" + (game.global.fluffyPrestige + 1));
  $(".timeLevelUpHeader1").html("E" + game.global.fluffyPrestige);
  $(".timeLevelUpHeader2").html("E" + (game.global.fluffyPrestige + 1));
  var xpPerRun = zoneXP(0, zoneYP);
  var xpToLevel = neededExp - currentExp;
  var nowLevel = calculateLevel();
  var nowEvolution = game.global.fluffyPrestige;
  var seconds = (fluffyCalculator.minutesPerRun * 60);
  allxp = 0;
  runs = 0;
  for (var i = 0; i < 10; i++) {
    $("#levelUpTable").append("<tr> <td> Runs to L" + (i + 1) + "</td><td id='R" + i + "'></td> <td id='D" + i + "'</td> <td id='ER" + i + "' </td> <td id='ED" + i + "' </td> </tr> ");
    $("#timeLevelUpTable").append("<tr> <td> Time to L" + (i + 1) + "</td><td id='Rt" + i + "'></td> <td id='Et" + i + "' </td></tr> ");
  }
  for (var x = 0; 20 >= x; x++) {
    date = new Date();
    timeDate = new Date();
    if (x <= 10) {
      l = x - 1;
      e = nowEvolution;
    }
    if (x > 10) {
      l = (x == 20) ? 9 : (x - 11); // x == 20 because  20 % 10 = 0 :P
      e = nowEvolution + 1;
    }
    xpToLevel = upgrade(e, l);
    if (l <= nowLevel - 1 && e == nowEvolution) { // if level is lower then the one "l" just put blank
      $("#R" + l).add("#Rt" + l).append("");
      // $("#D" + l).append("");
    }
    else if (l == nowLevel && e == nowEvolution) { // if level is the same as the one you are trying to upgrade from, calcualte from - currentXP
      runs += (xpToLevel - currentExp) / xpPerRun;
      allxp += xpToLevel - currentExp;
      date.setDate(date.getDate() + runs);
      $("#R" + l).append(Number((runs).toFixed(2)));
      $("#R" + l).attr("title", "Bone Portals to level up: " + (Math.ceil(allxp / game.stats.bestFluffyExp.valueTotal)) + "\n" + "Date: " + date.toDateString());
      $("#Rt" + l).append(sformat(runs * seconds));
      timeDate.setSeconds(timeDate.getDate() + (runs * seconds));
      $("#Rt" + l).attr("title", "Approx date: " + timeDate);
    }
    else if (e > maxEvolution) { // If evolution is above the max, put nothing for everything on the last column.
      $("#ER" + l).add("#ED" + l).append("");
    }
    else if (e == nowEvolution) { // If you are calculating the rest of your evolution, put data on the first columns
      runs += xpToLevel / xpPerRun;
      allxp += xpToLevel;
      date.setDate(date.getDate() + runs);
      $("#R" + l).append(Number((runs).toFixed(2)));
      $("#R" + l).attr("title", "Bone Portals to level up: " + Math.ceil(allxp / game.stats.bestFluffyExp.valueTotal) + "\n" + "Date: " + date.toDateString());
      $("#D" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
      $("#Rt" + l).append(sformat(runs * seconds));
      timeDate.setSeconds(timeDate.getDate() + (runs * seconds));
      $("#Rt" + l).attr("title", "Approx date: " + timeDate);
    }
    else if (e > nowEvolution) { // If you are above the evolution, new data goes to the last columns
      runs += xpToLevel / xpPerRun;
      allxp += xpToLevel;
      date.setDate(date.getDate() + runs);
      $("#ER" + l).append(Number((runs).toFixed(2)));
      $("#ER" + l).attr("title", "Bone Portals to level up: " + Math.ceil(allxp / game.stats.bestFluffyExp.valueTotal) + "\n" + "Date: " + date.toDateString());
      $("#ED" + l).append(prettify(((getDamageModifier(l + 1, 0, upgrade(e, l + 1), e)) - 1) * 100));
      $("#Et" + l).append(sformat(runs * seconds));
      timeDate.setSeconds(timeDate.getDate() + (runs * seconds));
      $("#Et" + l).attr("title", "Approx date: " + timeDate);
    }
  }
}

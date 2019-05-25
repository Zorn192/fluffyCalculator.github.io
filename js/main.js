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
        console.log(errormessage);
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
    fluffyCalculator.lastVersionSeen = version;
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
        document.getElementById("InstantUpdating").value = fluffyCalculator.instantUpdating;
        document.getElementById("versionNumber").textContent = version;
        versionSeen();
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

function changeTheme(flip) {
    dir = "css/";
    currentTheme = fluffyCalculator.theme;
    // currentDir = dir + currentTheme;
    oppositeTheme = (currentTheme == "light") ? "dark" : "light";
    // oppositeDir = dir + oppositeTheme;

    if (flip == true) {
        fluffyCalculator.theme = oppositeTheme;
        document.getElementById(currentTheme).disabled = true;
        document.getElementById(oppositeTheme).disabled = false;
    } else {
        document.getElementById(currentTheme).disabled = false;
        document.getElementById(oppositeTheme).disabled = true;
    }
}

function versionSeen() {
    if (version > fluffyCalculator.lastVersionSeen) {
        //Do Future Stuff *people need to get it first*
        console.log("Your seeing a new version!")
        fluffyCalculator.lastVersionSeen = version;
        localStorage.setItem("fluffyCalculator", JSON.stringify(fluffyCalculator));
    }
}
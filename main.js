/********* 
 * SETUP *
 *********/

var lastFrame = 0;
var lastSave = 0;
window.requestAnimationFrame(nextFrame);

var pastGame;
var game = newGame();

/************* 
 * GAME LOOP *
 *************/

function nextFrame(timeStamp) {
	let sinceLastFrame = timeStamp - lastFrame;
	let sinceLastSave = timeStamp - lastSave;
	if (sinceLastFrame >= game.updateSpeed) {
		game.number = game.number.mul(game.mult.generation[1].root(1000/game.updateSpeed/game.speed));
		for (let i = 1; i < game.mult.maxMult; i++) {
			game.mult.amount[i] = game.mult.amount[i].mul(game.mult.generation[i+1].root(1000/game.updateSpeed/game.speed));
		}
		if (game.auto.bought[0]) {
			maxAll('normal');
		}
		updateAll();
		lastFrame = timeStamp;
		game.permaStat.timePlayed += sinceLastFrame;
	}
	if (sinceLastSave >= game.autoSaveSpeed) {
		if (game.autoSave) {
			save(true);
		}
		lastSave = timeStamp;
	}
	window.requestAnimationFrame(nextFrame);
}

function changeUpdateSpeed() {
	let newSpeed = prompt("Please enter new update speed in milliseconds.\n(Number from 33 to 2000, inclusive)");
	if (newSpeed != null) {
		newSpeed = Number(newSpeed);
		if (!isNaN(newSpeed) && newSpeed >= 33 && newSpeed <= 2000) {
			game.updateSpeed = newSpeed;
			document.getElementById("updateSpeedButton").innerHTML = "Update Speed: " + newSpeed + "ms";
		}
	}
}

function changeAutoSaveSpeed() {
	let newSpeed = prompt("Please enter new auto-save speed in seconds.\n(Number from 0.2 to 300, inclusive)");
	if (newSpeed != null) {
		newSpeed = Number(newSpeed);
		if (!isNaN(newSpeed) && newSpeed >= 0.2 && newSpeed <= 300) {
			let newSpeedMs = newSpeed * 1000
			game.autoSaveSpeed = newSpeedMs;
			document.getElementById("autoSaveSpeedButton").innerHTML = "Auto-Save Speed: " + newSpeed + "s";
		}
	}
}

/**********
 * SAVING *
 **********/

function save(auto) {
	localStorage.setItem('emsave', JSON.stringify(game));
	if (!auto) {
		document.getElementById("saveButton").innerHTML = "Saved!";
		setTimeout(function(){
			document.getElementById("saveButton").innerHTML = "Save"
		}, 1000);
	}
}

function load(auto) {
	if (localStorage.getItem('emsave')) {
		pastGame = JSON.parse(localStorage.getItem('emsave'));
		objectToDecimal(pastGame);
		if (pastGame.permaStat != undefined) {
			if (pastGame.permaStat.version == undefined || pastGame.permaStat.version < newGame().permaStat.version) {
				notify('Welcome to version ' + newGame().permaStat.version + '!');
			}
		} else {
			notify('Welcome to version ' + newGame().permaStat.version + '!');
		}
		merge(game, pastGame);
		game.permaStat.version = newGame().permaStat.version;
		if(!auto) {
			document.getElementById("loadButton").innerHTML = "Loaded!";
			setTimeout(function(){
				document.getElementById("loadButton").innerHTML = "Load"
			}, 1000);
		}
	}
}

function exportSave() {
	document.getElementById("exportArea").classList.remove('hidden');
	document.getElementById("exportArea").innerHTML = btoa(JSON.stringify(game));
	document.getElementById("exportArea").select();
	document.execCommand("copy");
	document.getElementById("exportArea").classList.add('hidden');
	document.getElementById("exportButton").innerHTML = "Exported to Clipboard!";
	setTimeout(function(){
		document.getElementById("exportButton").innerHTML = "Export"
	}, 1000);
}

function importSave() {
	let save = prompt("Please enter export text.\nWarning: Your current save will be over-written.");
	if (save != null) {
		let err = false;
		let secret = true;
		try {
			localStorage.setItem('emsave', atob(save));
			load(true);
		}
		catch {
			err = true;
			switch (save) {
				case "export text":
					giveAchievement(1000);
				break;
				case "Thank you!":
					giveAchievement(1001);
				break;
				default:
					secret = false;
					document.getElementById("importButton").innerHTML = "Invalid Save";
				break;
			}
			if (secret) {
				document.getElementById("importButton").innerHTML = "Secret!";
			}
		}
		if (err == false) {
			document.getElementById("importButton").innerHTML = "Imported!";
		}
		setTimeout(function(){
			document.getElementById("importButton").innerHTML = "Import"
		}, 1000);
	}
}

// totally didn't copy this from somewhere else
function objectToDecimal(object) { 
	for (i in object) {
		if (typeof(object[i]) == "string" && !isNaN(new Decimal(object[i]).mag) && !(new Decimal(object[i]).sign == 0 && object[i] != "0")) {
			object[i] = new Decimal(object[i]);
		}
		if (typeof(object[i]) == "object") {
			objectToDecimal(object[i]);
		}
	}
}

function merge(base, source) {
	for (i in base) {
		if (source[i] != undefined) {
			if (typeof(base[i]) == "object" && typeof(source[i]) == "object" && !isDecimal(base[i]) && !isDecimal(source[i])) {
				merge(base[i], source[i]);
			} else {
				base[i] = source[i];
			}
		}
	}
}

function isDecimal(x) {
	if (x.mag == undefined) {
		return false;
	} else {
		return true;
	}
}

function newGame() {
	let save = {
		permaStat: {
			version: 0.3,
			timePlayed: 0,
			highestNum: new Decimal(10),
			totalReset: new Decimal(0),
			totalPlexal: new Decimal(0),
		},
		auto: {
			unlocked: false,
			price: [Decimal.fromComponents(1, 2, 100)],
			bought: [false]
		},
		achievement: {
			completed: [],
			secretCompleted: [],
			hideCompleted: false
		},
		number: new Decimal(10),
		mult: {
			amount:[0, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
			power:[0, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
			generation:[0, new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1)],
			powerPerBuy:new Decimal(2),
			upgradeAmount:[0, new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
			baseCost:[0, new Decimal(10), new Decimal(1e10), Decimal.fromComponents(1, 2, 2), Decimal.fromComponents(1, 2, 4), Decimal.fromComponents(1, 2, 9), Decimal.fromComponents(1, 2, 15), Decimal.fromComponents(1, 2, 21), Decimal.fromComponents(1, 2, 30), Decimal.fromComponents(1, 2, 41), Decimal.fromComponents(1, 2, 54)],
			cost:[0, new Decimal(10), new Decimal(1e10), Decimal.fromComponents(1, 2, 2), Decimal.fromComponents(1, 2, 4), Decimal.fromComponents(1, 2, 9), Decimal.fromComponents(1, 2, 15), Decimal.fromComponents(1, 2, 21), Decimal.fromComponents(1, 2, 30), Decimal.fromComponents(1, 2, 41), Decimal.fromComponents(1, 2, 54)],
			costIncrease:[0, new Decimal(1e3), new Decimal(1e4), new Decimal(1e5), new Decimal(1e6), new Decimal(1e7), new Decimal(1e9), new Decimal(1e11), new Decimal(1e14), new Decimal(1e17), new Decimal(1e21)],
			unlocked:[0, false, false, false, false, false, false, false, false, false, false],
			maxMult: 4,
			actualMaxMult: 10
		},
		reset: {
			amount: new Decimal(0),
			boost: new Decimal(3),
			totalBoost: new Decimal(1),
			baseCost: Decimal.fromComponents(1, 2, 11),
			cost: Decimal.fromComponents(1, 2, 11),
			baseCostIncrease: new Decimal(1e6),
			costIncrease: new Decimal(1e6),
			costScaling: new Decimal(1e1),
			unlocked: false
		},
		plexal: {
			amount: new Decimal(0),
			gain: new Decimal(0),
			essence: new Decimal(0),
			upgrade: {
				cost: ["lol", new Decimal(1), new Decimal(2), new Decimal(1), new Decimal(3), new Decimal(8), new Decimal(15)],
				unlocked: [true, false, false, false, false, false, false],
				boost: ["lol", new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(1), new Decimal(0), new Decimal(1)]
			},
			unlocked: false
		},
		iterator: {
			iteration: new Decimal(0),
			baseBoost: new Decimal(1.1),
			boost: new Decimal(1.1),
			totalBoost: new Decimal(1),
			baseCost: new Decimal(10),
			cost: new Decimal(10),
			costIncrease: new Decimal(1e2),
			upgrade: {
				amount: new Decimal(0),
				boost: new Decimal(1.1),
				totalBoost: new Decimal(1),
				baseCost: new Decimal(10),
				cost: new Decimal(100),
				costIncrease: new Decimal(10)
			},
			unlocked: false
		},
		autoSave: true,
		autoSaveSpeed: 1000,
		updateSpeed: 50,
		theme: {
			themeList:["light", "dark"],
			currentTheme: 0,
		},
		speed: 1
	}
	return save;
}

function wipe() {
	game = newGame();
	save(true);
}

function wipeConfirm() {
	if (confirm("Are you sure you want to wipe your save?")) {
		wipe();
	}
}

function toggleAutoSave() {
	game.autoSave = !game.autoSave;
}

/*********** 
 * HOTKEYS *
 ***********/

document.addEventListener("keydown", function(input){
	let key = input.key;
	switch(key) {
		case "1":
		case "2":
		case "3":
		case "4":
		case "5":
		case "6":
		case "7":
		case "8":
		case "9":
			buyMult(Number(key), "normal");
		break;
		case "0":
			buyMult(10, "normal");
		break;
		case "i":
			iterate();
		break;
		case "m":
			maxAll("normal");
		break;
		case "r":
			reset(0);
		break;
		case "p":
			reset(1);
		break;
	}
});

/*********** 
 * DISPLAY *
 ***********/

function toTab(tab) {
	document.getElementById(tab).parentNode.querySelectorAll(":scope > .tab").forEach(function(element) {
		element.classList.add('hidden');
	});
	document.getElementById(tab).classList.remove('hidden');
	if (tab == 'achievement') {
		giveAchievement(0);
	}
}

function updateTab() {
	if (game.plexal.amount.greaterThanOrEqualTo(1)) {
		document.getElementById("plexalStatTabButton").classList.remove('hidden');
	} else {
		document.getElementById("plexalStatTabButton").classList.add('hidden');
		if (!document.getElementById("plexalStat").classList.contains('hidden')) {
			toTab('normalStat');
		}
	}
	if (game.plexal.essence.greaterThan(Decimal.fromComponents(1, 2, 50))) {
		game.auto.unlocked = true;
	}
	if (game.auto.unlocked) {
		document.getElementById("autoTabButton").classList.remove('hidden');
		giveAchievement(15);
	}
}

function cycleTheme(){
	document.querySelectorAll("*").forEach(function(element) {
		element.classList.remove(game.theme.themeList[game.theme.currentTheme]);
	});
	game.theme.currentTheme++;
	if (game.theme.currentTheme >= game.theme.themeList.length) {
		game.theme.currentTheme = 0;
	}
}

function findDisplay(n) {
	if (n.lessThan(1000)) {
		return n.toFixed(2);
	} else if (n.lessThan(1e100)) {
		return n.m.toFixed(2) + "e" + findDisplay(new Decimal(n.e));
	} else if (n.lessThan(Decimal.fromComponents(1, 5, 1))) {
		return "e" + findDisplay(n.log10());
	} else {
		let x = new Decimal(n.mag).slog(10);
		return "E" + (new Decimal(n.mag)).iteratedlog(10,x.floor()).toFixed(2) + "#" + (new Decimal(n.layer)).add(x.floor());
	}
}

function findTimeDisplay(ms) {
	let s = ms/1000;
	let ds = mod(s, 60).toFixed(2);
	let m = Math.floor(s/60);
	let dm = mod(m, 60);
	let h = Math.floor(m/60);
	let dh = mod(h, 24);
	let d = Math.floor(h/24);
	let dd = mod(d, 30.43685);
	let mo = Math.floor(d/30.43685);
	let dmo = mod(mo, 12);
	let dy = Math.floor(mo/365.2422);
	let time = "";
	let seg = 0;
	if (s < 60) {
		time = ds + " second" + pluralCheck(ds, false);
		seg++;
	} else {
		time = "and " + ds + " second" + pluralCheck(ds, false);
		seg++;
	}
	if (dm >= 1) {
		time = dm + " minute" + pluralCheck(dm, false) + ", " + time;
		seg++;
	}
	if (dh >= 1) {
		time = dh + " hour" + pluralCheck(dh, false) + ", " + time;
		seg++;
	}
	if (dd >= 1) {
		time = dh + " day" + pluralCheck(dd, false) + ", " + time;
		seg++;
	}
	if (dmo >= 1) {
		time = dh + " month" + pluralCheck(dmo, false) + ", " + time;
		seg++;
	}
	if (dy >= 1) {
		time = dh + " year" + pluralCheck(dy, false) + ", " + time;
		seg++;
	}
	if (seg == 2) {
		time = time.replace(",", "");
	}
	return time;
}

function pluralCheck(x, decimal) {
	if (decimal) {
		if (x.equal(1)) {
			return "";
		} else {
			return "s";
		}
	} else {
		if (x == 1) {
			return "";
		} else {
			return "s";
		}
	}
}

function mod(x, y) {
	let a = Math.floor(x / y);
	let b = a * y;
	return x - b;
}

function notify(message, subMessage, bgColor) {
	let note = document.createElement("button");
	let big = document.createElement("span");
	let bigText = document.createTextNode(message);
	document.body.appendChild(note);
	note.appendChild(big);
	big.appendChild(bigText);
	if (subMessage != undefined) {
		note.appendChild(document.createElement("br"));
		let text = document.createTextNode(subMessage);
		note.appendChild(text);
	}
	big.style.fontSize = "20px";
	if (bgColor != undefined) {
		note.style.backgroundColor = bgColor;
	}
	note.classList.add('notification');
	setTimeout(function() {
		note.remove();
	}, 3800)
}

/********************
 * UPDATE (display) *
 ********************/

function getPower(n) {
	let power = game.mult.powerPerBuy.pow(game.mult.upgradeAmount[n]).mul(game.reset.totalBoost).mul(game.iterator.totalBoost)
	if (game.plexal.upgrade.unlocked[1]) {
		power = power.mul(game.plexal.upgrade.boost[1])
	}
	if (game.plexal.upgrade.unlocked[3]) {
		power = power.mul(game.plexal.upgrade.boost[3]);
	}
	return power;
}

function updateMult() {
	for (let i = 1; i <= game.mult.actualMaxMult; i++) {
		let m = game.mult;
		m.powerPerBuy = (new Decimal(2))
		if (game.plexal.upgrade.unlocked[2]) {
			m.powerPerBuy = m.powerPerBuy.mul(game.plexal.upgrade.boost[2]);
		}
		m.generation[i] = m.amount[i].pow(m.power[i]); 
		m.cost[i] = m.baseCost[i].pow(m.costIncrease[i].pow(m.upgradeAmount[i]));
		m.power[i] = getPower(i);
		m.maxMult = (new Decimal(4)).add(game.reset.amount);
		if ((new Decimal(game.mult.maxMult)).greaterThan(game.mult.actualMaxMult)) {
			m.maxMult = m.actualMaxMult;
		}
		document.getElementById("multAmount" + i).innerHTML = findDisplay(m.amount[i]);
		document.getElementById("multPower" + i).innerHTML = "^" + findDisplay(m.power[i]);
		if (m.unlocked[i] == false) {
			document.getElementById("multButton" + i).innerHTML = "Unlock Multiplier " + i + " Cost: " + findDisplay(m.cost[i]);
			if (i != m.actualMaxMult) {
				document.getElementById("mult"+(i+1)).classList.add('hidden');
			}
		} else {
			document.getElementById("multButton" + i).innerHTML = "Boost Multiplier " + i + " by ^" + findDisplay(m.powerPerBuy) + " Cost: " + findDisplay(m.cost[i]);
			if (i != m.maxMult) {
				document.getElementById("mult"+(i+1)).classList.remove('hidden');
			}
			giveAchievement(i);
		}
		if (game.number.greaterThanOrEqualTo(m.cost[i])) {
			document.getElementById("multButton" + i).classList.remove('disabled');
			document.getElementById("multButton" + i).classList.add('enabled');
		} else {
			document.getElementById("multButton" + i).classList.remove('enabled');
			document.getElementById("multButton" + i).classList.add('disabled');  
		}
	}
}

function updateReset() {
	let r = game.reset;
	r.boost = new Decimal(3);
	if (game.plexal.upgrade.unlocked[4]) {
		r.boost = r.boost.mul(game.plexal.upgrade.boost[4]);
	}
	r.totalBoost = r.boost.pow(r.amount);
	r.costIncrease = r.baseCostIncrease.mul(r.costScaling.pow(r.amount));
	r.cost = r.baseCost.pow(r.costIncrease.pow(r.amount))
	if (game.reset.amount.greaterThan(new Decimal(0))
	   || game.number.greaterThan(Decimal.fromComponents(1, 2, 8))) {
		game.reset.unlocked = true;
	}
	if (game.reset.unlocked == true) {
		document.getElementById("reset").classList.remove('hidden');
	}
	document.getElementById("resetPower").innerHTML = "^" + findDisplay(r.totalBoost);
	document.getElementById("resetAmount").innerHTML = findDisplay(new Decimal(r.amount));
	if (game.mult.maxMult < game.mult.actualMaxMult) {
		document.getElementById("resetButton").innerHTML = "Reset the game for a new multiplier and a ^" + findDisplay(game.reset.boost) + " boost to all multipliers Requires: " + findDisplay(game.reset.cost);
	} else {
		document.getElementById("resetButton").innerHTML = "Reset the game for a ^" + findDisplay(game.reset.boost) + " boost to all multipliers Requires: " + findDisplay(game.reset.cost);
	}
	if (game.number.greaterThanOrEqualTo(r.cost)) {
		document.getElementById("resetButton").classList.remove('disabled');
		document.getElementById("resetButton").classList.add('enabled');
	} else {
		document.getElementById("resetButton").classList.remove('enabled');
		document.getElementById("resetButton").classList.add('disabled');  
	}
}

function getPlexalGain() {
	let gain = game.number.log(Decimal.fromComponents(1, 2, 100)).root(666);
	if (game.plexal.upgrade.unlocked[6]) {
		gain = gain.mul(game.plexal.upgrade.boost[6]);
	}
	return gain.floor();
}

function updatePlexal() {
	game.plexal.gain = getPlexalGain();
	if (game.number.greaterThan(Decimal.fromComponents(1, 2, 80))) {
		game.plexal.unlocked = true;
	}
	if (game.plexal.amount.greaterThan(new Decimal(0))) {
		document.getElementById("plexalTabButton").classList.remove('hidden');
	} else {
		document.getElementById("plexalTabButton").classList.add('hidden');
	}
	if (game.plexal.unlocked == true) {
		document.getElementById("plexButton").classList.remove('hidden');
	} else {
		document.getElementById("plexButton").classList.add('hidden');
	}
	if (game.number.greaterThanOrEqualTo(Decimal.fromComponents(1, 2, 100))) {
		document.getElementById("plexButton").innerHTML = "Reset all of your progress so far to gain " + findDisplay(game.plexal.gain) + " Plexal Essence";
		document.getElementById("plexButton").classList.remove('disabled');
		document.getElementById("plexButton").classList.add('plexal');
	} else {
		document.getElementById("plexButton").innerHTML = "Requires: ee100";
		document.getElementById("plexButton").classList.remove('plexal');
		document.getElementById("plexButton").classList.add('disabled');  
	}
	document.getElementById("plexalEssenceAmount").innerHTML = findDisplay(game.plexal.essence);
}

function updateIterator() {
	let it = game.iterator;
	let upg = it.upgrade;
	it.boost = it.baseBoost.mul(upg.totalBoost);
	it.totalBoost = it.boost.pow(it.iteration);
	it.cost = it.baseCost.pow(it.costIncrease.pow(it.iteration));
	upg.totalBoost = upg.boost.pow(upg.amount);
	if (upg.amount.lessThan(1)) {
		upg.cost = new Decimal(100);
	} else {
		upg.cost = upg.baseCost.pow(upg.costIncrease.pow(upg.amount));
	}
	document.getElementById("iteratorTotalBoost").innerHTML = "^" + findDisplay(it.totalBoost);
	document.getElementById("iteration").innerHTML = findDisplay(it.iteration);
	document.getElementById("iterationCost").innerHTML = findDisplay(it.cost);
	document.getElementById("iteratorBoost").innerHTML = "^" + findDisplay(it.boost);
	document.getElementById("iteratorUpgradeBoost").innerHTML = findDisplay(upg.boost);
	document.getElementById("iteratorUpgradeCost").innerHTML = findDisplay(upg.cost);
	if (it.unlocked == true) {
		document.getElementById("iteratorUnlock").classList.add('hidden');
		document.getElementById("iteratorUpgrade").classList.remove('hidden');
		if (game.mult.amount[1].greaterThan(1)) {
			document.getElementById("iterate").classList.remove('hidden');
		} else {
			document.getElementById("iterate").classList.add('hidden');
		}
	} else {
		document.getElementById("iteratorUnlock").classList.remove('hidden');
		document.getElementById("iteratorUpgrade").classList.add('hidden');
		document.getElementById("iterate").classList.add('hidden');
	}
	if (game.number.greaterThanOrEqualTo(it.cost)) {
		document.getElementById("iterateButton").classList.remove('disabled');
		document.getElementById("iterateButton").classList.add('enabled');
	} else {
		document.getElementById("iterateButton").classList.remove('enabled');
		document.getElementById("iterateButton").classList.add('disabled');  
	}
	if (game.plexal.essence.greaterThanOrEqualTo(1)) {
		document.getElementById("iteratorUnlock").classList.remove('disabled');
		document.getElementById("iteratorUnlock").classList.add('enabled');
	} else {
		document.getElementById("iteratorUnlock").classList.remove('enabled');
		document.getElementById("iteratorUnlock").classList.add('disabled');  
	}
	if (game.plexal.essence.greaterThanOrEqualTo(upg.cost)) {
		document.getElementById("iteratorUpgradeButton").classList.remove('disabled');
		document.getElementById("iteratorUpgradeButton").classList.add('enabled');
	} else {
		document.getElementById("iteratorUpgradeButton").classList.remove('enabled');
		document.getElementById("iteratorUpgradeButton").classList.add('disabled');  
	}
}

function updateUpg() {
	// Plexal
	game.plexal.upgrade.boost[1] = game.plexal.amount.add(1);
	game.plexal.upgrade.boost[2] = game.iterator.boost;
	game.plexal.upgrade.boost[3] = game.plexal.essence.pow(1.1).add(1);
	game.plexal.upgrade.boost[4] = game.reset.amount.root(8);
	game.plexal.upgrade.boost[5] = game.permaStat.totalReset.root(3.5).floor();
	game.plexal.upgrade.boost[6] = game.plexal.essence.root(2);
	if (game.plexal.upgrade.boost[4].lessThan(1)) {
		game.plexal.upgrade.boost[4] = new Decimal(1);
	}
	if (game.plexal.upgrade.boost[6].lessThan(1)) {
		game.plexal.upgrade.boost[6] = new Decimal(1);
	}
	for (let i = 1; i < game.plexal.upgrade.boost.length; i++) {
		document.getElementById("plexalUpg" + i + "Boost").innerHTML = findDisplay(game.plexal.upgrade.boost[i]);
	}
	for (let i = 1; i < game.plexal.upgrade.unlocked.length; i++) {
		if (game.plexal.upgrade.unlocked[i] == false) {
			document.getElementById("plexalUpg" + i).classList.remove('noHover');
			if (game.plexal.essence.greaterThanOrEqualTo(game.plexal.upgrade.cost[i]) && game.plexal.upgrade.unlocked[i-1] == true) {
				document.getElementById("plexalUpg" + i).classList.add('enabled');
				document.getElementById("plexalUpg" + i).classList.remove('disabled');
			} else {
				document.getElementById("plexalUpg" + i).classList.add('disabled');
				document.getElementById("plexalUpg" + i).classList.remove('enabled');
			}
		} else {
			document.getElementById("plexalUpg" + i).classList.add('plexal');
			document.getElementById("plexalUpg" + i).classList.add('noHover');
		}
	}
}

function updateStat() {
	document.getElementById("timePlayed").innerHTML = findTimeDisplay(game.permaStat.timePlayed);
	document.getElementById("highestNum").innerHTML = findDisplay(game.permaStat.highestNum);
	document.getElementById("totalReset").innerHTML = findDisplay(game.permaStat.totalReset);
	document.getElementById("plexalAmount").innerHTML = findDisplay(game.plexal.amount);
}

function updateAuto() {
	for (let i = 0; i < game.auto.price.length; i++) {
		if (game.auto.bought[i]) {
			document.getElementById("autoButton" + i).classList.add('plexal');
			document.getElementById("autoButton" + i).classList.add('noHover');
		} else {
			document.getElementById("autoButton" + i).classList.remove('plexal');
			document.getElementById("autoButton" + i).classList.remove('noHover');
			if (game.plexal.essence.greaterThanOrEqualTo(game.auto.price[i])) {
				document.getElementById("autoButton" + i).classList.add('enabled');
				document.getElementById("autoButton" + i).classList.remove('disabled');
			} else {
				document.getElementById("autoButton" + i).classList.remove('enabled');
				document.getElementById("autoButton" + i).classList.add('disabled');
			}
		}
	}
}

function updateAchievement() {
	achievementList.forEach(function(achieve) {
		if (game.achievement.completed[achieve.id]) {
			achieve.hidden = false;
			document.getElementById("achievement" + achieve.id + "Box").classList.remove('disabled');
			document.getElementById("achievement" + achieve.id + "Box").classList.add('enabled');
			if (game.achievement.hideCompleted) {
				document.getElementById("achievement" + achieve.id).classList.add('hidden');
			} else {
				document.getElementById("achievement" + achieve.id).classList.remove('hidden');
			}
		} else {
			document.getElementById("achievement" + achieve.id + "Box").classList.remove('enabled');
			document.getElementById("achievement" + achieve.id + "Box").classList.add('disabled');
		}
		if (achieve.hidden) {
			document.getElementById("achievement" + achieve.id).classList.add('hidden');
		} else {
			document.getElementById("achievement" + achieve.id).classList.remove('hidden');
		}
	});
	if (game.achievement.hideCompleted) {
		document.getElementById("hideCompletedButton").innerHTML = "Show Completed Achievements";
	} else {
		document.getElementById("hideCompletedButton").innerHTML = "Hide Completed Achievements";
	}
}

function updateAll() {
	if (game.number.greaterThan(game.permaStat.highestNum)){
		game.permaStat.highestNum = game.number;
	}
	if (game.number.greaterThan(Decimal.fromComponents(1, 3, 20))) {
		
	}
	document.getElementById("multPerSecond").innerHTML = findDisplay(game.mult.generation[1]);
	document.getElementById("number").innerHTML = findDisplay(game.number);
	updateTab();
	updateMult();
	updateReset();
	updatePlexal();
	updateIterator();
	updateUpg();
	updateStat();
	updateAuto();
	updateAchievement();
	document.getElementById("title").innerHTML = "Exponential Madness v" + game.permaStat.version;
	if (game.autoSave) {
		document.getElementById("autoSaveButton").innerHTML = "Auto Save: ON";
	} else {
		document.getElementById("autoSaveButton").innerHTML = "Auto Save: OFF";
	}
	document.querySelectorAll("*").forEach(function(element) {
		element.classList.add(game.theme.themeList[game.theme.currentTheme]);
	});
	document.getElementById("themeButton").innerHTML = game.theme.themeList[game.theme.currentTheme].charAt(0).toUpperCase() + game.theme.themeList[game.theme.currentTheme].slice(1) + " Theme";
}

/*****************
 * PLAYER ACTION *
 *****************/

function buyMult(n, type) {
	switch (type) {
		case "normal":
			if (!document.getElementById("mult" + n).classList.contains('hidden')) {
				if (game.number.greaterThanOrEqualTo(game.mult.cost[n])) {
					game.number = game.number.div(game.mult.cost[n]);
					if (game.mult.unlocked[n] == false) {
						game.mult.amount[n] = new Decimal(1.25);
						game.mult.unlocked[n] = true;
					} else {
						game.mult.upgradeAmount[n] = game.mult.upgradeAmount[n].add(1);
					}
				}
			}
		break;
	}
}

function maxMult(n, type) {
	switch (type) {
		case "normal":
			if (!document.getElementById("mult" + n).classList.contains('hidden')) {
				let num = game.number.log10().log10().mul(0.99999);
				let startCost = game.mult.cost[n].log10().log10();
				if (num.greaterThanOrEqualTo(startCost)) {
					let increase = game.mult.costIncrease[n].log10();
					let buyAmount = num.sub(startCost).div(increase).ceil();
					let endCost = startCost.add(increase.mul(buyAmount));
					let totalCost = endCost.sub(increase);
					if (game.mult.unlocked[n] == false) {
						game.mult.amount[n] = new Decimal(1.25);
						game.mult.unlocked[n] = true;
						game.number = game.number.div(game.mult.cost[n]);
						maxMult(n, "normal");
					} else {
						game.number = game.number.div((new Decimal(10)).pow((new Decimal(10)).pow(totalCost)));
						game.mult.upgradeAmount[n] = game.mult.upgradeAmount[n].add(buyAmount);
					}
				}
			}
		break;
	}
}

function maxAll(type) {
	switch (type) {
		case "normal":
			maxMult(1, "normal");
			maxMult(2, "normal");
			maxMult(3, "normal");
			maxMult(4, "normal");
			maxMult(5, "normal");
			maxMult(6, "normal");
			maxMult(7, "normal");
			maxMult(8, "normal");
			maxMult(9, "normal");
			maxMult(10, "normal");
			maxIterate();
		break;
	}
}

function reset(level) {
	switch (level) {
		case 0:
			if (game.number.greaterThanOrEqualTo(game.reset.cost)) {
				game.number = newGame().number;
				game.mult = newGame().mult;
				game.reset.amount = game.reset.amount.add(1);
				game.permaStat.totalReset = game.permaStat.totalReset.add(1);
				giveAchievement(11);
			}
		break;
		case 1:
			if (game.number.greaterThanOrEqualTo(Decimal.fromComponents(1, 2, 100))) {
				game.number = newGame().number;
				game.mult = newGame().mult;
				game.reset = newGame().reset;
				if (game.plexal.upgrade.unlocked[5]) {
					game.reset.amount = game.plexal.upgrade.boost[5];
				}
				game.iterator.iteration = newGame().iterator.iteration;
				game.plexal.amount = game.plexal.amount.add(1);
				game.permaStat.totalPlexal = game.permaStat.totalPlexal.add(1);
				game.plexal.essence = game.plexal.essence.add(game.plexal.gain);
				giveAchievement(12);
			}
		break;
	}
}

// I don't know how to do this, it doesn't work right now
function maxReset() {
	if (game.reset.unlocked == true) {
		let num = game.number.log10().log10().mul(0.99999);
		let startCost = game.reset.cost.log10().log10();
		if (num.greaterThanOrEqualTo(startCost)) {
			let baseCost = game.reset.baseCost.log10().log10();
			let costChange = num.sub(startCost);
			let scaling = game.reset.costScaling.log10().mul(2);
			let startIncrease = game.reset.costIncrease.log10();
			let endIncrease = startIncrease.pow(2).add(scaling.mul(costChange).mul(2)).sqrt();
			let increaseChange = endIncrease.sub(startIncrease);
			let buyAmount = increaseChange.div(scaling).add(1).floor();
			game.number = newGame().number;
			game.mult = newGame().mult;
			game.reset.amount = game.reset.amount.add(buyAmount);
			game.permaStat.totalReset = game.permaStat.totalReset.add(buyAmount);
			giveAchievement(11);
		}
	}
}

function unlockIterator() {
	if (game.plexal.essence.greaterThanOrEqualTo(1)) {
		game.plexal.essence = game.plexal.essence.sub(1);
		game.iterator.unlocked = true;
	}
}

function iterate() {
	if (game.number.greaterThanOrEqualTo(game.iterator.cost)) {
		game.number = game.number.div(game.iterator.cost);
		game.iterator.iteration = game.iterator.iteration.add(1);
	}
}

function maxIterate() {
	if (game.iterator.unlocked == true) {
		let num = game.number.log10().log10().mul(0.99999);
		let startCost = game.iterator.cost.log10().log10();
		if (num.greaterThanOrEqualTo(startCost)) {
			let increase = game.iterator.costIncrease.log10();
			let buyAmount = num.sub(startCost).div(increase).ceil();
			let endCost = startCost.add(increase.mul(buyAmount));
			let totalCost = endCost.sub(increase);
			game.number = game.number.div((new Decimal(10)).pow((new Decimal(10)).pow(totalCost)));
			game.iterator.iteration = game.iterator.iteration.add(buyAmount);
		}
	}
}

function upgradeIterator() {
	if (game.plexal.essence.greaterThanOrEqualTo(game.iterator.upgrade.cost)) {
		game.plexal.essence = game.plexal.essence.sub(game.iterator.upgrade.cost)
		game.iterator.upgrade.amount = game.iterator.upgrade.amount.add(1);
	}
}

function maxUpgradeIterator() {
	let PE = game.plexal.essence.log10().log10().mul(0.99999);
	let startCost = game.iterator.upgrade.cost.log10().log10();
	if (PE.greaterThanOrEqualTo(startCost)) {
		let increase = game.iterator.upgrade.costIncrease.log10();
		let buyAmount = PE.sub(startCost).div(increase).ceil();
		let endCost = startCost.add(increase.mul(buyAmount));
		let totalCost = endCost.sub(increase);
		game.plexal.essence = game.plexal.essence.sub((new Decimal(10)).pow(totalCost));
		game.iterator.upgrade.amount = game.iterator.upgrade.amount.add(buyAmount);
	}
}

function buyUpgrade(n, type) {
	switch (type) {
		case "plexal":
			if (game.plexal.essence.greaterThanOrEqualTo(game.plexal.upgrade.cost[n]) &&
			   game.plexal.upgrade.unlocked[n-1] == true) {
				game.plexal.essence = game.plexal.essence.sub(game.plexal.upgrade.cost[n]);
				game.plexal.upgrade.unlocked[n] = true;
				if (n == 6) {
					giveAchievement(13);
				}
			}
		break;
	}
}

function unlockAuto(n) {
	let priceList = [Decimal.fromComponents(1, 2, 100)];
	if (game.plexal.essence.greaterThanOrEqualTo(game.auto.price[n])) {
		switch (n) {
			case 0:
				game.auto.bought[n] = true;
			break;
		}
	}
}

/****************
 * ACHIEVEMENTS *
 ****************/

var nextAchieveId = 0;
var achievementList = [];
var secretAchievementList = [];

function Achievement(name, desc, hidden) {
	this.name = name;
	this.desc = desc;
	this.id = nextAchieveId;
	this.hidden = true;
	this.isSecret = false;
	if (hidden == false) {
		this.hidden = false;
	}
	if (this.id > 999) {
		this.isSecret = true;
	}
	if (this.isSecret) {
		secretAchievementList.push(this);
		if (game.achievement.secretCompleted.length <= nextAchieveId - 1000) {
			game.achievement.secretCompleted.push(false);
		}
		this.complete = function() {
			if (game.achievement.secretCompleted[this.id - 1000] != true) {
				game.achievement.secretCompleted[this.id - 1000] = true;
				notify("Achievement Completed:", this.name);
			}
		}
	} else {
		achievementList.push(this);
		if (game.achievement.completed.length <= nextAchieveId) {
			game.achievement.completed.push(false);
		}
		this.complete = function() {
			if (game.achievement.completed[this.id] != true) {
				game.achievement.completed[this.id] = true;
				notify("Achievement Completed:", this.name);
			}
		}
	}
	
	let ach = document.createElement("span");
	ach.id = "achievement" + this.id;
	if (this.isSecret) {
		document.getElementById("secretAchieve").appendChild(ach);
	} else {
		document.getElementById("normalAchieve").appendChild(ach);
	}
	ach.appendChild(document.createElement("br"));
	let achBox = document.createElement("button");
	achBox.id = "achievement" + this.id + "Box";
	achBox.classList.add('noHover');
	achBox.classList.add('veryBig');
	ach.appendChild(achBox);
	
	let nameText = document.createTextNode(this.name);
	let big = document.createElement("span");
	achBox.appendChild(big);
	big.appendChild(nameText);
	big.id = "achievement" + this.id + "Name";
	
	achBox.appendChild(document.createElement("br"));
	let descText = document.createTextNode(this.desc); 
	let small = document.createElement("span");
	achBox.appendChild(small);
	small.appendChild(descText);
	small.id = "achievement" + this.id + "Desc";
	small.style.fontSize = "10px";
	
	nextAchieveId++;
}

function giveAchievement(id) {
	achievementList[id].complete();
}

function hideCompleted() {
	game.achievement.hideCompleted = !game.achievement.hideCompleted;
}

new Achievement("Open the Achievements Tab", "Hi, I exist.", false); //0
new Achievement("Unlock Multiplier 1", "It begins.", false); //1
new Achievement("Unlock Multiplier 2", "This is getting out of hand already.", false); //2
new Achievement("Unlock Multiplier 3", "Many people don't know how to count to 3, so good thing you do know.", false); //3
new Achievement("Unlock Multiplier 4", "Wait where's the 5th one?", false); //4
new Achievement("Unlock Multiplier 5", "Look, ma, one hand!"); //5
new Achievement("Unlock Multiplier 6", "I couldn't think of a description for this one, so I'll just type my thought in."); //6
new Achievement("Unlock Multiplier 7", "Number cannibal."); //7
new Achievement("Unlock Multiplier 8", "90 degrees to infini- wait we're already there."); //8
new Achievement("Unlock Multiplier 9", "Good thing these aren't dimensions."); //9
new Achievement("Unlock Multiplier 10", "Oops, you hit the ceiling. That must have hurt."); //10
new Achievement("Reset", "Backtracking, fun!"); //11
new Achievement("Plexal", "You've reached a googolplex. It perplexes many, but not you of course."); //12
new Achievement("Unlock All Plexal Upgrades", "I feel... powerful."); //13
new Achievement("Inflate", "It's fine! It's fine! Stay calm! I said stay calm god dammit!"); //14
new Achievement("Unlock Automation", "I've removed some displays that isn't useful anymore because of this inflation that's going on. You better thank me now."); //15
nextAchieveId = 1000; // 1000+ for secrets
new Achievement("Import export text", "You... did what I said... I guess?"); //1000
new Achievement("Thanks", "I didn't expect that. Thank you for thanking me!"); //1001

load(true);

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_attackWaveMessages = ["C1A-C_WAVE1", "C1A-C_WAVE2", "C1A-C_WAVE3", "C1A-C_WAVE4", "C1A-C_WAVE5", "C1A-C_WAVE6", "C1A-C_WAVE7", "C1A-C_WAVE8"];
const mis_cyborgPatrolList = [
	"seCybPos1", "seCybPos2", "seCybPos3", "northCybPos1",
	"northCybPos2", "northCybPos3", "canyonCybPos1",
	"canyonCybPos2", "canyonCybPos3", "hillCybPos1",
	"hillCybPos2", "hillCybPos3", "1aCybPos1",
	"1aCybPos2", "1aCybPos3",
];
const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade03",
	"R-Struc-Materials03", "R-Vehicle-Engine03",
	"R-Vehicle-Metals02", "R-Cyborg-Metals02", "R-Wpn-Cannon-Damage03",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Rocket-Accuracy02", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Rocket-Damage03", "R-Wpn-Rocket-ROF01", "R-Sys-Engineering01",
	"R-Wpn-Mortar-ROF01", "R-Struc-RprFac-Upgrade01",
];
var wavesDone; // True if all attack waves have spawned
var truckJob1, truckJob2, truckJob3, truckJob4, truckJob5, truckJob6;

// Check if all waves have spawned and all enemies are gone
function extraVictoryCondition()
{
	const enemies = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false);
	if (wavesDone && enemies.length === 0)
	{
		return true;
	}
}

function startAttack()
{
	// Queue up the big attack waves
	prepAttackWave(0); // Southeast
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(1)), "1"); // South
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(3)), "2"); // North 1
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(4)), "3"); // Northeast
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(5)), "4"); // North 2
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(7)), "5"); // East 1
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(9)), "6"); // West
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(10)), "7"); // Northwest
}

// Send trucks to attempt building New Paradigm LZs
function sendLZTrucks(index)
{
	// NOTE: These are in the order of in-game appearence
	const truckJobs = [truckJob3, truckJob4, truckJob2, truckJob2, truckJob1, truckJob2, truckJob5, truckJob6];
	const entrances = [
		"reinforceSouthEast", "reinforceSouth", "reinforceNorth1",
		"reinforceNorthEast", "reinforceNorth2", "reinforceEast1",
		"reinforceWest", "reinforceNorthWest"
	];

	// Don't send a truck if there's already one working on this LZ
	if (!camGetTruck(truckJobs[index]))
	{
		const tPos = camMakePos(entrances[index]);
		const tTemp = cTempl.npmtruckt;
		camAssignTruck(camAddDroid(CAM_NEW_PARADIGM, tPos, tTemp), truckJobs[index]);
	}
}

// Announce an incoming attack wave
function prepAttackWave(index)
{
	playSound(cam_sounds.enemyUnitDetected);
	hackAddMessage(mis_attackWaveMessages[index], PROX_MSG, CAM_HUMAN_PLAYER, false);
	queue("spawnAttackWave", camSecondsToMilliseconds(20), "" + index);
}

// Spawn the attack wave and remove the red blip
function spawnAttackWave(index)
{
	const attackEntrances = [
		"reinforceSouthEast", "reinforceSouth", "reinforceNorth1",
		"reinforceNorthEast", "reinforceNorth2", "reinforceEast1",
		"reinforceWest", "reinforceNorthWest"
	];
	const attackDroids = [
		[ // Attack 1 (Southeast)
			cTempl.nphhct, cTempl.nphhct, cTempl.nphhct, cTempl.nphhct,
			cTempl.nphhct, cTempl.nphhct, cTempl.nphhct, cTempl.nphhct, // Heavy Cannons
		],
		[ // Attack 2 (South)
			cTempl.npmmorbht, cTempl.npmmorbht, cTempl.npmmorbht,
			cTempl.npmmorbht, cTempl.npmmorbht, cTempl.npmmorbht, // Bombards
			cTempl.npmsensht, // Sensor
		],
		[ // Attack 3 (North 1)
			cTempl.nphhct, cTempl.nphhct, cTempl.nphhct, cTempl.nphhct, // Heavy Cannons
			cTempl.npmatt, cTempl.npmatt, cTempl.npmatt, cTempl.npmatt, // Lancers
			cTempl.npmmrat, cTempl.npmmrat, // MRAs
		],
		[ // Attack 4 (Northeast)
			cTempl.npmbbht, cTempl.npmbbht, cTempl.npmbbht, cTempl.npmbbht, // Bunker Busters
			cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, // MRAs
		],
		[ // Attack 5 (North 2)
			cTempl.npmbbt, cTempl.npmbbt, cTempl.npmbbt, // Bunker Busters (+1 Mantis)
			cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, // Medium Cannons
			cTempl.npmhmgt, cTempl.npmhmgt, // HMGs
		],
		[ // Attack 6 (East 1)
			cTempl.nphhct, cTempl.nphhct, // Heavy Cannons
			cTempl.npmrept, cTempl.npmrept, // Repair Turrets
			cTempl.npmmorbht, cTempl.npmmorbht, cTempl.npmmorbht, cTempl.npmmorbht, // Bombards
			cTempl.npmsensht, // Sensor
		],
		[ // Attack 7 (West)
			cTempl.cybca, cTempl.cybca, cTempl.cybca, cTempl.cybca, // Heavy Gunners
			cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, // Grenadiers
			cTempl.npmatht, cTempl.npmatht, cTempl.npmatht, cTempl.npmatht, // Lancers
		],
		[ // Attack 8 (Northwest)
			cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // Heavy Machinegunners
			cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, // Flamers
			cTempl.npmmraht, cTempl.npmmraht, cTempl.npmmraht, cTempl.npmmraht, // MRAs
		],
	];

	// Add more units on higher difficulties
	if (difficulty >= MEDIUM)
	{
		attackDroids[0].push(cTempl.npmmct, cTempl.npmmct); // 2 Medium Cannons
		attackDroids[1].push(cTempl.npmmcht, cTempl.npmmcht); // 2 Medium Cannons
		attackDroids[2].push(cTempl.npmmrat, cTempl.npmmrat); // 2 MRAs
		attackDroids[3].push(cTempl.npmmraht, cTempl.npmmraht); // 2 MRAs (Scorpion)
		attackDroids[4].push(cTempl.npmhmgt, cTempl.npmhmgt); // 2 HMGs
		attackDroids[5].push(cTempl.nphhct, cTempl.nphhct); // 2 Heavy Cannons
		attackDroids[6].push(cTempl.cybgr, cTempl.cybgr); // 2 Grenadiers
		attackDroids[7].push(cTempl.cybfl, cTempl.cybfl); // 2 Flamers
	}
	if (difficulty >= HARD)
	{
		attackDroids[0].push(cTempl.npmmct, cTempl.npmmct); // 2 Medium Cannons
		attackDroids[1].push(cTempl.npmmcht, cTempl.npmmcht); // 2 Medium Cannons
		attackDroids[2].push(cTempl.npmatt, cTempl.npmatt); // 2 Lancers
		attackDroids[3].push(cTempl.npmmraht, cTempl.npmmraht); // 2 MRAs (Scorpion)
		attackDroids[4].push(cTempl.npmrept, cTempl.npmrept); // 2 Repair Turrets
		attackDroids[5].push(cTempl.npmmorbht, cTempl.npmmorbht); // 2 Bombards
		attackDroids[6].push(cTempl.npmbbht, cTempl.npmbbht); // 2 Bunker Busters
		attackDroids[7].push(cTempl.npmbbht, cTempl.npmbbht); // 2 Bunker Busters
	}
	if (difficulty == INSANE)
	{
		attackDroids[0].push(cTempl.npmhct, cTempl.npmhct); // 2 Heavy Cannons
		attackDroids[1].push(cTempl.npmmorbht, cTempl.npmmorbht); // 2 Bombards
		attackDroids[2].push(cTempl.nphhct, cTempl.nphhct); // 2 Heavy Cannons
		attackDroids[3].push(cTempl.npmbbht, cTempl.npmbbht); // 2 Bunker Busters
		attackDroids[4].push(cTempl.nphhct, cTempl.nphhct); // 2 Heavy Cannons
		attackDroids[5].push(cTempl.npmrept, cTempl.npmrept); // 2 Repair Turrets
		attackDroids[6].push(cTempl.npmbbht, cTempl.npmbbht); // 2 Bunker Busters
		attackDroids[7].push(cTempl.npmbbht, cTempl.npmbbht); // 2 Bunker Busters
	}

	hackRemoveMessage(mis_attackWaveMessages[index], PROX_MSG, CAM_HUMAN_PLAYER, false);
	if (index !== "4")
	{
		// Spawn a group of droids
		camSendReinforcement(CAM_NEW_PARADIGM, getObject(attackEntrances[index]), attackDroids[index], CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_ATTACK
		});
	}
	else
	{
		// This wave spawns with a commander
		// Rank changes on difficulty:
		// Trained (SUPEREASY/EASY/MEDIUM)
		// Regular (HARD)
		// Professional (INSANE)
		const COMMANDER_RANK = (difficulty <= MEDIUM) ? 2 : (difficulty);
		const commDroid = camAddDroid(CAM_NEW_PARADIGM, attackEntrances[index], cTempl.npmcomt);
		addLabel(commDroid, "npCommander");
		camSetDroidRank(commDroid, COMMANDER_RANK);
		camManageGroup(camMakeGroup(commDroid), CAM_ORDER_ATTACK);

		// Send in the rest of the group
		camSendReinforcement(CAM_NEW_PARADIGM, getObject(attackEntrances[index]), attackDroids[index], CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_FOLLOW,
			data: {
				leader: "npCommander",
				suborder: CAM_ORDER_ATTACK
			}
		});

		// Also include a special Mantis tank
		const busterDroid = camAddDroid(CAM_NEW_PARADIGM, camMakePos(attackEntrances[index]), cTempl.nphbbt);
		// Order the tank to follow the commander
		camManageGroup(camMakeGroup(busterDroid), CAM_ORDER_FOLLOW, {
			leader: "npCommander",
			suborder: CAM_ORDER_ATTACK
		});
		// Make this tank drop an artifact
		addLabel(busterDroid, "npBusterTank");
		camAddArtifact("npBusterTank", "R-Wpn-Rocket03-HvAT"); // Bunker Buster
	}
	
	sendLZTrucks(index); // Also try sending a truck

	if (index === "7")
	{
		wavesDone = true; // Final wave has spawned
	}
}

// Send a transport to any built LZs
function sendTransport()
{
	// Choose a built LZ
	let pos;
	if (!camBaseIsEliminated("NorthWestNPLZ"))
	{
		pos = camMakePos("NPLZ6");
	}
	else if (!camBaseIsEliminated("WestNPLZ"))
	{
		pos = camMakePos("NPLZ5");
	}
	else if (!camBaseIsEliminated("CentralNPLZ"))
	{
		pos = camMakePos("NPLZ4");
	}
	else if (!camBaseIsEliminated("SouthNPLZ"))
	{
		pos = camMakePos("NPLZ3");
	}
	else if (!camBaseIsEliminated("EastNPLZ"))
	{
		pos = camMakePos("NPLZ2");
	}
	else if (!camBaseIsEliminated("NorthNPLZ"))
	{
		pos = camMakePos("NPLZ1");
	}
	else
	{
		return; // No LZs built :(
	}

	// Cyborgs...
	let templates  = [cTempl.cybca, cTempl.cybla, cTempl.cybgr, cTempl.cybrp];
	const COUNT = (difficulty <= HARD) ? 8 : 10;
	const droids = [];
	for (let i = 0; i < COUNT; ++i)
	{
		const t = camRandFrom(templates);
		droids.push(t);
	}

	camSendReinforcement(CAM_NEW_PARADIGM, pos, droids, CAM_REINFORCE_TRANSPORT, {
		entry: { x: 126, y: 36 },
		exit: { x: 126, y: 76 },
		order: CAM_ORDER_ATTACK,
		data: { regroup: true, count: -1 }
	});
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Destroy all New Paradigm reinforcements"));

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.alpha11.pre, {
		callback: "extraVictoryCondition"
	});

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	if (!tweakOptions.ref_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));
	}

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);

	camPlayVideos([{video: "MB1A-C_MSG", type: CAMP_MSG}, {video: "MB1A-C_MSG2", type: MISS_MSG}]);

	wavesDone = false;

	// New Paradigm LZs
	camSetEnemyBases({
		"NorthNPLZ": {
			cleanup: "NPLZ1",
			detectMsg: "C1A-C_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM // We need these in case the player already has structures here
		},
		"EastNPLZ": {
			cleanup: "NPLZ2",
			detectMsg: "C1A-C_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		},
		"SouthNPLZ": {
			cleanup: "NPLZ3",
			detectMsg: "C1A-C_LZ3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		},
		"CentralNPLZ": {
			cleanup: "NPLZ4",
			detectMsg: "C1A-C_LZ4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		},
		"WestNPLZ": {
			cleanup: "NPLZ5",
			detectMsg: "C1A-C_LZ5",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		},
		"NorthWestNPLZ": {
			cleanup: "NPLZ6",
			detectMsg: "C1A-C_LZ6",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		}
	});

	truckJob1 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NorthNPLZ",
			rebuildBase: true,
			structset: camA10NPNorthLZStructs
	});
	truckJob2 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "EastNPLZ",
			rebuildBase: true,
			structset: camA10NPEastLZStructs
	});
	truckJob3 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "SouthNPLZ",
			rebuildBase: true,
			structset: camA10NPSouthLZStructs
	});
	truckJob4 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "CentralNPLZ",
			rebuildBase: true,
			structset: camA10NPCentralLZStructs
	});
	truckJob5 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "WestNPLZ",
			rebuildBase: true,
			structset: camA10NPWestLZStructs
	});
	truckJob6 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NorthWestNPLZ",
			rebuildBase: true,
			structset: camA10NPNorthWestLZStructs
	});

	queue("startAttack", camSecondsToMilliseconds(40));
	setTimer("sendTransport", camChangeOnDiff(camMinutesToMilliseconds(2)));
}

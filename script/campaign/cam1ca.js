include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js"); // Used to store lists of structures for NP LZs

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage03", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade02",
	"R-Struc-Materials02", "R-Vehicle-Engine01",
	"R-Vehicle-Metals01", "R-Wpn-Cannon-Damage02",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Rocket-Accuracy01", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-Damage02", "R-Wpn-Rocket-ROF01", "R-Struc-RprFac-Upgrade01",
];
const mis_attackWaveMessages = [ "C1CA_WAVE1", "C1CA_WAVE2", "C1CA_WAVE3" ];
var blipActive; // True if there aren't enough player structures on the plateau
var lastArty;
var allowAttack; // True if attacks waves may begin spawning
var wavesDone; // True if all attack waves have spawned
var truckJob1, truckJob2, truckJob3;

// See if we have enough structures on the plateau area and toggle
// the green objective blip on or off accordingly.
// Also starts attack waves when allowed.
function baseEstablished()
{
	//Now we check if there is stuff built here already from cam1-C.
	const TOTAL = camCountStructuresInArea("buildArea") +
				camCountStructuresInArea("buildArea2") +
				camCountStructuresInArea("buildArea3") +
				camCountStructuresInArea("buildArea4") +
				camCountStructuresInArea("buildArea5");
	if (TOTAL >= 7)
	{
		if (blipActive)
		{
			blipActive = false;
			hackRemoveMessage("C1CA_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
		}
		if (allowAttack)
		{
			camCallOnce("beginAttackWaves");
		}
		return true;
	}
	else
	{
		if (!blipActive)
		{
			blipActive = true;
			hackAddMessage("C1CA_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);
		}
		return false;
	}
}

// a simple extra victory condition callback
function extraVictoryCondition()
{
	const enemies = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false);
	// No enemies on map and all NP attacks have occured.
	if (baseEstablished() && wavesDone && !enemies.length)
	{
		return true;
	}
	// otherwise returns 'undefined', which suppresses victory;
	// returning 'false' would have triggered an instant defeat
}

// Send a transport to any built LZs
function sendTransport()
{
	// start with light forces
	if (!camDef(lastArty))
	{
		lastArty = true;
	}

	// Choose a built LZ
	let pos;
	if (!camBaseIsEliminated("NorthNPLZ"))
	{
		pos = camMakePos("NPLZ1");
	}
	else if (!camBaseIsEliminated("EastNPLZ"))
	{
		pos = camMakePos("NPLZ2");
	}
	else if (!camBaseIsEliminated("SouthNPLZ"))
	{
		pos = camMakePos("NPLZ3");
	}
	else
	{
		return; // No LZs built :(
	}

	let templates;
	if (lastArty)
	{
		// Generic attack units
		templates = [cTempl.nplatht, cTempl.npmbbht, cTempl.nplmraht, cTempl.npmmcht];
		if (difficulty >= HARD)
		{
			templates.push(cTempl.npmmcht); // Add a chance for Mantis tanks
		}
	}
	else
	{
		// Mortars (or Bombards on Insane)
		templates = (difficulty === INSANE) ? [cTempl.npmmorbht] : [cTempl.npmmorht];
	}

	const COUNT = (difficulty <= MEDIUM) ? 4 : 5;
	const droids = [];
	for (let i = 0; i < COUNT; ++i)
	{
		const t = camRandFrom(templates);
		// two droids of each template
		droids.push(t);
		droids.push(t);
	}

	if (!lastArty)
	{
		// If we're sending artillery, make sure to include a sensor
		droids.pop();
		droids.push(cTempl.npmsensht);
	}

	camSendReinforcement(CAM_NEW_PARADIGM, pos, droids, CAM_REINFORCE_TRANSPORT, {
		entry: { x: 126, y: 36 },
		exit: { x: 126, y: 76 },
		order: CAM_ORDER_ATTACK,
		data: { regroup: !lastArty, count: -1, pos: "buildArea" }
	});
	// Flip this bool
	lastArty = !lastArty;
}

// The attacks start with 3 trucks with a small escort each
// Once the player has built the plateau base, 3 larger attack waves will spawn
// After the last attack wave has spawned, the player wins by destroying anything left on the map
function startAttack()
{
	allowAttack = true;

	const escortDroids = [
		cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, // MRAs
		cTempl.nplatht, cTempl.nplatht, // Lancers
		cTempl.nplhmght, cTempl.nplhmght, // HMGs
	];

	sendLZTrucks(0);
	camSendReinforcement(CAM_NEW_PARADIGM, getObject("reinforceNorth2"), escortDroids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_DEFEND,
		data: {radius: 18, pos: "NPLZ1"}
	});
	sendLZTrucks(1);
	camSendReinforcement(CAM_NEW_PARADIGM, getObject("reinforceEast1"), escortDroids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_DEFEND,
		data: {radius: 18, pos: "NPLZ2"}
	});
	sendLZTrucks(2);
	camSendReinforcement(CAM_NEW_PARADIGM, getObject("reinforceSouthEast"), escortDroids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_DEFEND,
		data: {radius: 18, pos: "NPLZ3"}
	});
}

// Send trucks to attempt building New Paradigm LZs
function sendLZTrucks(index)
{
	const truckJobs = [truckJob1, truckJob2, truckJob3];
	const entrances = ["reinforceNorth2", "reinforceEast1", "reinforceSouthEast"];

	// Don't send a truck if there's already one working on this LZ
	if (!camGetTruck(truckJobs[index]))
	{
		const tPos = camMakePos(entrances[index]);
		const tTemp = cTempl.npmtruckht;
		camAssignTruck(camAddDroid(CAM_NEW_PARADIGM, tPos, tTemp), truckJobs[index]);
	}
}

// Called after the player builds the plateau base
function beginAttackWaves()
{
	// Queue up the big attack waves
	prepAttackWave(0);
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(2.5)), "1");
	queue("prepAttackWave", camChangeOnDiff(camMinutesToMilliseconds(4)), "2");
}

// Announce an incoming attack wave
function prepAttackWave(index)
{
	playSound(cam_sounds.enemyUnitDetected);
	hackAddMessage(mis_attackWaveMessages[index], PROX_MSG, CAM_HUMAN_PLAYER, false);
	queue("spawnAttackWave", camSecondsToMilliseconds(20), index);
}

// Spawn the attack wave and remove the red blip
function spawnAttackWave(index)
{
	const attackDroids = [
		[ // Attack 1
			cTempl.nplpodw, cTempl.nplpodw, cTempl.nplpodw, cTempl.nplpodw, // Mini-Rocket Pods
			cTempl.npmlcht, cTempl.npmlcht, cTempl.npmlcht, // Light Cannons
			cTempl.npmlcht, cTempl.npmlcht, cTempl.npmlcht,
			cTempl.nplatht, cTempl.nplatht, // Lancers
			cTempl.nplhmght, cTempl.nplhmght, // HMGs
		],
		[ // Attack 2
			cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, // Medium Cannons
			cTempl.nphmct, cTempl.nphmct, // Medium Cannons (Mantis)
			cTempl.npmbbht, cTempl.npmbbht, cTempl.npmbbht, // Bunker Busters
			cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, // MRAs
		],
		[ // Attack 3
			cTempl.npmmcht, cTempl.npmmcht, cTempl.npmmcht,
			cTempl.npmmcht, cTempl.npmmcht, cTempl.npmmcht, // Medium Cannons
			cTempl.npmflamht, cTempl.npmflamht, cTempl.npmflamht, cTempl.npmflamht, // Flamers
			cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, cTempl.nplmraht, // MRAs
		],
	];
	const attackEntrances = ["reinforceNorth2", "reinforceEast1", "reinforceEast2"];

	hackRemoveMessage(mis_attackWaveMessages[index], PROX_MSG, CAM_HUMAN_PLAYER, false);
	camSendReinforcement(CAM_NEW_PARADIGM, getObject(attackEntrances[index]), attackDroids[index], CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_ATTACK
	});
	sendLZTrucks(index); // Also try sending another truck

	if (index === "2")
	{
		wavesDone = true; // Final wave has spawned
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Build at least 7 non-wall structures on the plateau and destroy all New Paradigm reinforcements"));

	allowAttack = false;
	wavesDone = false;
	blipActive = false;

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.alpha8.pre, {
		callback: "extraVictoryCondition"
	});
	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);

	setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));
	camPlayVideos({video: "MB1CA_MSG", type: CAMP_MSG});

	// New Paradigm LZs
	// These are all unbuilt at the start of the level
	camSetEnemyBases({
		"NorthNPLZ": {
			cleanup: "NPLZ1",
			detectMsg: "C1CA_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM // We need these in case the player already has structures here
		},
		"EastNPLZ": {
			cleanup: "NPLZ2",
			detectMsg: "C1CA_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		},
		"SouthNPLZ": {
			cleanup: "NPLZ3",
			detectMsg: "C1CA_LZ3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM
		}
	});

	// Set up truck jobs
	truckJob1 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NorthNPLZ",
			rebuildBase: true,
			structset: camA7NPNorthLZStructs
	});
	truckJob2 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "EastNPLZ",
			rebuildBase: true,
			structset: camA7NPEastLZStructs
	});
	truckJob3 = camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "SouthNPLZ",
			rebuildBase: true,
			structset: camA7NPSouthLZStructs
	});

	// Begin attacks after 20 seconds
	queue("startAttack", camSecondsToMilliseconds(20));
	setTimer("sendTransport", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
}

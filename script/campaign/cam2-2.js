include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage06", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage04", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-Damage05", "R-Wpn-Cannon-ROF02", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage04", "R-Wpn-Mortar-ROF02", "R-Wpn-Mortar-Acc01", 
	"R-Wpn-Rocket-Damage05", "R-Wpn-Rocket-ROF01", "R-Wpn-Rocket-Accuracy03",
	"R-Defense-WallUpgrade05", "R-Struc-Materials05",
	"R-Sys-Engineering02",
	"R-Struc-RprFac-Upgrade02",
	"R-Vehicle-Metals04", "R-Cyborg-Metals04",
	"R-Vehicle-Engine04",
];
var commanderGroup, escortGroup;
var playerWarned;
var commanderAdvancing;
var wayPointReached;
var nxGroupST;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if ((droid.player !== CAM_HUMAN_PLAYER))
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

// Warn the player that the commander is approaching the exit
camAreaEvent("warningZone", function(droid)
{
	if (!playerWarned && commanderAdvancing && droid.droidType === DROID_COMMAND)
	{
		playSound(cam_sounds.enemyEscaping);
		playerWarned = true;
	}
	resetLabel("warningZone", CAM_THE_COLLECTIVE);
});

camAreaEvent("escapeZone", function(droid)
{
	if (droid.droidType === DROID_COMMAND)
	{
		camSafeRemoveObject(droid, false);
		queue("camCallOnce", camSecondsToMilliseconds(0.3), "showGameOver");
	}
	else if (commanderAdvancing)
	{
		// If a non-commander droid enters the escape zone, detach the escort from the commander to prevent them from body blocking its escape
		camManageGroup(escortGroup, CAM_ORDER_ATTACK, {
			repair: 67,
			removable: false
		});
	}
	resetLabel("escapeZone", CAM_THE_COLLECTIVE);
});

function enableAllFactories()
{
	camEnableFactory("COFactoryWest");
	camEnableFactory("COCybFactoryWest");
	camEnableFactory("COFactoryEast");
}

function vtolAttack()
{
	if (getObject("COCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	const templates = [cTempl.colpbv, cTempl.colatv]; // Phosphor Bombs and Lancers
	const ext = {
		limit: [2, 3],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter", ext);
}

// Start moving the Collective commander towards the west base
function startConvoy()
{
	hackRemoveMessage("C22_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	camManageGroup(commanderGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint"),
		radius: 0
	});

	setTimer("convoyTick", camSecondsToMilliseconds(1));
}

function showGameOver()
{
	const arti = camGetArtifacts();
	camSafeRemoveObject(arti[0], false);
	gameOverMessage(false);
}

//Make the enemy commander flee back to the NW base if attacked.
function eventAttacked(victim, attacker)
{
	if (camDef(victim) &&
		victim.player === CAM_THE_COLLECTIVE &&
		wayPointReached && commanderAdvancing && //only if the commander is escaping to the south
		victim.group === commanderGroup &&
		camGetRefillableGroupTemplates(escortGroup).length > 4)
	{
		// If the commander is attacked and the escort group is missing too many droids, fall back to base
		commanderAdvancing = false;
		playerWarned = false;
		camManageGroup(commanderGroup, CAM_ORDER_DEFEND, {
			pos: camMakePos("wayPoint"),
			radius: 6,
			repair: 67
		});

		// Make sure the escort group falls back with the commander
		camManageGroup(escortGroup, CAM_ORDER_FOLLOW, {
			leader: "COCommander",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 67
			}
		});
	}
}

// Convoy logic
function convoyTick()
{
	if (groupSize(commanderGroup) === 0)
	{
		removeTimer("convoyTick");
		return; // Commander is dead
	}

	if (!wayPointReached && camWithinArea("COCommander", "westBaseCleanup"))
	{
		wayPointReached = true;
	}

	if (wayPointReached && !commanderAdvancing)
	{
		const MISSING_DROIDS = camGetRefillableGroupTemplates(escortGroup).length;

		if (MISSING_DROIDS < 4 && getObject("COCommander").health > 95)
		{
			// Order the commander to advance if it's fully healed and the escort group is missing less than 4 droids
			commanderAdvancing = true;
			camManageGroup(commanderGroup, CAM_ORDER_COMPROMISE, {
				pos: camMakePos("escapePos")
			});
		}
	}	
}

// Needed to ensure the NEXUS units fleeing can be triggered after a save/load
function eventGameLoaded()
{
	if (groupSize(nxGroupST) > 0)
	{
		addLabel({type: GROUP, id: nxGroupST}, "nxGroupST", false);
		resetLabel("nxGroupST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen
	}
}

// If the NEXUS units are spotted, make them flee
function eventGroupSeen(viewer, group)
{
	if (group === nxGroupST)
	{
		camCallOnce("nexusFlee");
	}
}

function nexusFlee()
{
	const escapePos = camMakePos("nxRemoveZone");
	const droids = enumGroup(nxGroupST);
	for (const droid of droids)
	{
		// Move towards the escape trigger
		orderDroidLoc(droid, DORDER_MOVE, escapePos.x, escapePos.y);
	}
}

// Quietly remove the NEXUS droids when reaching the trigger
camAreaEvent("nxRemoveZone", function(droid)
{
	const droids = enumDroid(CAM_NEXUS);
	for (const droid of droids)
	{
		camSafeRemoveObject(droid);
	}
});

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.beta5,{
		area: "RTLZ",
		message: "C22_LZ",
		reinforcements: camMinutesToSeconds(3),
		retlz: true,
		enableLastAttack: false
	});

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	setAlliance(CAM_NEXUS, CAM_THE_COLLECTIVE, true);

	playerWarned = false;
	commanderAdvancing = false;
	wayPointReached = false;

	camSetArtifacts({
		"COCommander": { tech: "R-Wpn-Rocket08-Ballista" }, // Ballista
	});

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveRes, CAM_NEXUS);

	camSetEnemyBases({
		"COEastBase": {
			cleanup: "eastBaseCleanup",
			detectMsg: "C22_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COWestBase": {
			cleanup: "westBaseCleanup",
			detectMsg: "C22_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COFactoryEast": {
			assembly: camMakePos("eastAssembly"),
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 20,
			},
			templates: [cTempl.cohhct, cTempl.comact, cTempl.comit, cTempl.cohhrat] // Heavy factory
		},
		"COFactoryWest": {
			assembly: camMakePos("westAssembly"),
			order: CAM_ORDER_PATROL,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			data: {
				pos: [
					camMakePos("hoverPatrolPos1"),
					camMakePos("hoverPatrolPos2"),
				],
				interval: camSecondsToMilliseconds(40),
				repair: 67,
				radius: 18,
			},
			templates: [cTempl.comath, cTempl.comhpvh, cTempl.commrah] // Hovers
		},
		"COCybFactoryWest": {
			assembly: camMakePos("westAssembly"),
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 50,
			},
			templates: [cTempl.cybla, cTempl.cybth, cTempl.scygr]
		},
	});

	// Rank changes on difficulty:
	// Regular (SUPEREASY/EASY/MEDIUM)
	// Professional (HARD)
	// Veteran (INSANE)
	camSetDroidRank(getObject("COCommander"), (difficulty <= MEDIUM) ? 3 : (difficulty + 1));
	commanderGroup = camMakeGroup("COCommander");
	escortGroup = camMakeRefillableGroup(
		camMakeGroup("group1NBase"), {
			templates: [
				cTempl.cohact, // Assault Cannon
				cTempl.scyac, cTempl.scyac, cTempl.scyac, // Super Auto-Cannons
				cTempl.comsenst, // Sensor
				cTempl.comrept, // Repair Turret
				cTempl.comhatt, cTempl.comhatt, // Tank Killers
				cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // HVCs
				cTempl.cohact, cTempl.cohact, // Assault Cannons (Hard+)
				cTempl.cohhrat, cTempl.cohhrat, // HRAs (Insane)
			],
			factories: ["COFactoryWest", "COCybFactoryWest"],
		}, CAM_ORDER_FOLLOW, {
			leader: "COCommander",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 67
			}
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 90 : 180));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COEastBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck1"),
			structset: camAreaToStructSet("eastBaseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COWestBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck2"),
			structset: camAreaToStructSet("westBaseCleanup")
	});

	// Set up this sight trigger group
	nxGroupST = camMakeGroup(getObject("nxGroup"));
	addLabel({type: GROUP, id: nxGroupST}, "nxGroupST", false);
	resetLabel("nxGroupST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen

	hackAddMessage("C22_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("startConvoy", camChangeOnDiff(camMinutesToMilliseconds(3.5)));
	setTimer("convoyTick", camSecondsToMilliseconds(1));

	// Stop the rain
	camSetWeather(CAM_WEATHER_CLEAR);
}

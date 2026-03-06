include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage03", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade01",
	"R-Struc-Materials01", "R-Vehicle-Engine01",
	"R-Vehicle-Metals01", "R-Wpn-Cannon-Damage02",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Rocket-Accuracy01",
	"R-Wpn-Rocket-Damage02", "R-Wpn-Rocket-ROF01", "R-Struc-RprFac-Upgrade01",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage02", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage03", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-Mortar-Damage01",
	"R-Wpn-Rocket-ROF01", "R-Defense-WallUpgrade01", "R-Struc-Materials01",
];

var NPTankCommander, NPAmbushCommander;

function sendRocketForce()
{
	camManageGroup(camMakeGroup("RocketForce"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
}

function sendTankScoutForce()
{
	camManageGroup(NPTankCommander, CAM_ORDER_ATTACK, {
		repair: 40
	});
}

function enableNPFactory()
{
	camEnableFactory("NPCentralFactory");
}

camAreaEvent("RemoveBeacon", function()
{
	hackRemoveMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
});

camAreaEvent("AmbushTrigger", function()
{
	camEnableFactory("ScavEastFactory");

	camManageGroup(NPAmbushCommander, CAM_ORDER_ATTACK, {
		pos: "AmbushTarget",
		repair: 40
	});
});

function camEnemyBaseEliminated_NPEastBaseGroup()
{
	camEnableFactory("NPNorthFactory");
}

function getDroidsForNPLZ(args)
{
	const scouts = [ cTempl.nplmraht, cTempl.nplhmght ];
	const heavies = [ cTempl.npmmcht, cTempl.npmmct ];
	const list = [];
	const LIMIT = ((difficulty >= INSANE) ? 10 : 8);
	let numScouts = camRand(5) + 1;
	let heavy = camRandFrom(heavies);
	let loopRuns = 0;

	if (camRand(2) == 0)
	{
		list.push(cTempl.nplsensw); //sensor will count towards scout total
		numScouts -= 1;
		heavy = cTempl.npmmorht;
	}

	while (list.length < LIMIT)
	{
		list.push((loopRuns < numScouts) ? scouts[camRand(scouts.length)] : heavy);
		++loopRuns;
	}

	return list;
}

camAreaEvent("NPLZ1Trigger", function()
{
	// Message4 here, Message3 for the second LZ, and
	// please don't ask me why they did it this way
	camPlayVideos({video: "MB1C4_MSG", type: MISS_MSG});
	camDetectEnemyBase("NPLZ1Group");
	// Activate remaining factories
	camEnableFactory("NPNorthFactory");
	camEnableFactory("ScavNorthFactory");

	camSetBaseReinforcements("NPLZ1Group", camChangeOnDiff(camMinutesToMilliseconds((difficulty >= INSANE) ? 4.5 : 5)), "getDroidsForNPLZ",
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 126, y: 76 },
			exit: { x: 126, y: 36 },
			posLZ: camMakePos("EastNPLZ")
		}
	);

	camCallOnce("activateLZDefenders");
});

camAreaEvent("NPLZ2Trigger", function()
{
	camPlayVideos({video: "MB1C3_MSG", type: MISS_MSG});
	camDetectEnemyBase("NPLZ2Group");

	camSetBaseReinforcements("NPLZ2Group", camChangeOnDiff(camMinutesToMilliseconds(5)), "getDroidsForNPLZ",
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 126, y: 76 },
			exit: { x: 126, y: 36 },
			posLZ: camMakePos("WestNPLZ")
		}
	);
});

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.alpha7);
	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));

	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetArtifacts({
		"ScavSouthFactory": { tech: "R-Wpn-Rocket02-MRL" }, // Mini-Rocket Array
		"NPResearchFacility": { tech: "R-Struc-Research-Module" }, // Research Module
		"NPCentralFactory": { tech: "R-Struc-Factory-Module" }, // Factory Module
		"NPNorthFactory": { tech: "R-Wpn-Cannon2Mk1" }, // Medium Cannon
	});

	camSetEnemyBases({
		"ScavSouthDerrickGroup": {
			cleanup: "ScavSouthDerrick",
			detectMsg: "C1C_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"ScavSouthEastHighgroundGroup": {
			cleanup: "ScavSouthEastHighground",
			detectMsg: "C1C_BASE6",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"ScavNorthBaseGroup": {
			cleanup: "ScavNorthBase",
			detectMsg: "C1C_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"ScavSouthPodPitsGroup": {
			cleanup: "ScavSouthPodPits",
			detectMsg: "C1C_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"ScavEastOutpostGroup": {
			cleanup: "ScavEastOutpost",
			detectMsg: "C1C_BASE11",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"NPEastBaseGroup": {
			cleanup: "NPEastBase",
			detectMsg: "C1C_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPNorthEastGeneratorGroup": {
			cleanup: "NPNorthEastGenerator",
			detectMsg: "C1C_BASE8",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPNorthEastBaseGroup": {
			cleanup: "NPNorthEastBase",
			detectMsg: "C1C_BASE9",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPCentralBaseGroup": {
			cleanup: "CentralBase",
			detectMsg: "C1C_BASE10",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPLZ1Group": {
			cleanup: "NPLZ1", // kill the four towers to disable LZ
			detectMsg: "C1C_LZ1",
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM // required for LZ-type bases
		},
		"NPLZ2Group": {
			cleanup: "NPLZ2", // kill the four towers to disable LZ
			detectMsg: "C1C_LZ2",
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEW_PARADIGM // required for LZ-type bases
		},
	});

	hackAddMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); // initial beacon
	camPlayVideos([{video: "MB1C_MSG", type: CAMP_MSG}, {video: "MB1C2_MSG", type: CAMP_MSG}]);

	camSetFactories({
		"ScavSouthFactory": {
			assembly: "ScavSouthFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.rbjeep, cTempl.trike, cTempl.buggy ]
		},
		"ScavEastFactory": {
			assembly: "ScavEastFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.firetruck, cTempl.rbuggy, cTempl.bjeep, cTempl.kevbloke ]
		},
		"ScavNorthFactory": {
			assembly: "ScavNorthFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.minitruck, cTempl.rbuggy, cTempl.buscan, cTempl.gbjeep ]
		},
		"NPCentralFactory": {
			assembly: "NPCentralFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.npmmorht, cTempl.nplsensw, cTempl.npmlcht, cTempl.nplflamht ]
		},
		"NPNorthFactory": {
			assembly: "NPNorthFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 66,
				count: -1,
			},
			templates: [ cTempl.nplpodw, cTempl.npmmct, cTempl.npmmorht, cTempl.nplflamht ]
		},
	});

	// Set up NP truck management
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(110));
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPEastBaseGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode, // Don't rebuild this truck unless we're on timerless mode
			respawnDelay: TRUCK_TIME,
			template: cTempl.npmtruckht,
			structset: camAreaToStructSet("NPEastBase");
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPNorthEastGeneratorGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.npmtruckht,
			structset: camAreaToStructSet("NPNorthEastGenerator");
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPNorthEastBaseGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.npmtruckht,
			structset: camAreaToStructSet("NPNorthEastBase");
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPCentralBaseGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.npmtruckht,
			structset: camAreaToStructSet("CentralBase");
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPLZ1Group",
			rebuildTruck: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.npmtruckht,
			structset: camAreaToStructSet("NPLZ1");
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPLZ2Group",
			rebuildTruck: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.npmtruckht,
			structset: camAreaToStructSet("NPLZ2");
	});

	// Rank changes on difficulty:
	// Rookie (SUPEREASY/EASY/MEDIUM)
	// Green (HARD)
	// Trained (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 0 : (difficulty - 2);
	camSetDroidRank(getObject("TankScoutForceCommander"), COMMANDER_RANK);
	camSetDroidRank(getObject("AmbushForceCommander"), COMMANDER_RANK);
	camSetDroidRank(getObject("TankForceCommander"), COMMANDER_RANK + 1); // This commander has +1 rank

	// Set up refillable groups and orders for NP commanders
	NPTankCommander = camMakeGroup("TankScoutForceCommander"); // Gets orders later
	camMakeRefillableGroup(
		camMakeGroup("TankScoutForce"), {
			templates: [
				cTempl.nplhmght, cTempl.nplhmght, cTempl.nplhmght, // Heavy Machineguns
				cTempl.npmlcht, cTempl.npmlcht, cTempl.npmlcht, // Light Cannons
				cTempl.nplhmght, cTempl.nplhmght, // More Heavy Machineguns (Hard+)
				cTempl.npmlcht, cTempl.npmlcht, // More Light Cannons (Insane)
			],
			obj: "TankScoutForceCommander",
			player: CAM_NEW_PARADIGM // Only refill from NP factories
		}, CAM_ORDER_FOLLOW, {
			leader: "TankScoutForceCommander",
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 33,
			},
			repair: 66,
	});
	NPAmbushCommander = camMakeGroup("AmbushForce"); // Gets orders later
	camMakeRefillableGroup(
		camMakeGroup("AmbushForce"), {
			templates: [
				cTempl.nplhmght, cTempl.nplhmght, // Heavy Machineguns
				cTempl.npmmcht, cTempl.npmmcht, // Medium Cannons
				cTempl.nplpodw, cTempl.nplpodw, // Mini-Rocket Pods
				cTempl.nplhmght, cTempl.nplhmght, // More Heavy Machineguns (Hard+)
				cTempl.nplpodw, cTempl.nplpodw, // More Mini-Rocket Pods (Insane)
			],
			obj: "AmbushForceCommander",
			player: CAM_NEW_PARADIGM
		}, CAM_ORDER_FOLLOW, {
			leader: "AmbushForceCommander",
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 33,
			},
			repair: 66,
	});
	camManageGroup(camMakeGroup("TankForceCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("TankPatrolPos1"),
			camMakePos("TankPatrolPos2"),
			camMakePos("NPNorthFactoryAssembly")
		],
		interval: camSecondsToMilliseconds(30)
	});
	camMakeRefillableGroup(
		camMakeGroup("TankForce"), {
			templates: [ // NOTE: The starting Mantis tank isn't in this list, so it won't be rebuilt if destroyed.
				cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, // Medium Cannons
				cTempl.npmmct, cTempl.npmmct, cTempl.npmmct,
				cTempl.nplmraht, cTempl.nplmraht, // Mini-Rocket Arrays
				cTempl.nplmraht, cTempl.nplmraht, // More Mini-Rocket Arrays (Hard+)
				cTempl.npmrept, cTempl.npmrept, // Repair Turrets (Insane)
			],
			obj: "TankForceCommander",
			player: CAM_NEW_PARADIGM
		}, CAM_ORDER_FOLLOW, {
			leader: "TankForceCommander",
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 33,
			},
			repair: 66,
	});

	camEnableFactory("ScavSouthFactory");
	camManageGroup(camMakeGroup("RocketScoutForce"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
	camManageGroup(camMakeGroup("DefendForce"), CAM_ORDER_DEFEND, {
		pos: camMakePos("defensePos"),
		radius: 16,
		regroup: false
	});
	camManageGroup(camMakeGroup("PatrolForce"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("PatrolPos1"),
			camMakePos("PatrolPos2"),
			camMakePos("PatrolPos3"),
			camMakePos("PatrolPos4")
		],
		interval: camSecondsToMilliseconds(30),
		regroup: false,
	});
	queue("sendRocketForce", camSecondsToMilliseconds(25));
	queue("sendTankScoutForce", camSecondsToMilliseconds(30));
	queue("enableNPFactory", camMinutesToMilliseconds(3));

	// Darken the fog to 1/2 default brightness
	camSetFog(88, 72, 48);
	// Darken the lighting and add a slight orange hue
	camSetSunIntensity(.45, .45, .4);
	// Move the sun towards the west
	camSetSunPos(425, -400, 450);
}

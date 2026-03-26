include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

//New base blip, new base area, new factory data

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage03", "R-Wpn-MG-ROF01",
	"R-Vehicle-Metals01", "R-Wpn-Cannon-Damage01",
	"R-Wpn-Flamer-Damage02", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Mortar-Damage01", "R-Sys-Engineering01",
	"R-Wpn-Rocket-Damage01", "R-Wpn-Rocket-ROF01",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage02", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage02", "R-Wpn-Cannon-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Rocket-Damage01",
];

var NPCommander;

camAreaEvent("RemoveBeacon", function(droid)
{
	hackRemoveMessage("C1-3_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
});

camAreaEvent("NorthConvoyTrigger", function(droid)
{
	camManageGroup(camMakeGroup("NorthConvoyForce"), CAM_ORDER_DEFEND, {
		pos: camMakePos("NorthConvoyLoc")
	});
});

camAreaEvent("SouthConvoyTrigger", function(droid)
{
	const scout = getObject("ScoutDroid");
	if (camDef(scout) && scout)
	{
		camTrace("New Paradigm sensor scout retreating");
		const pos = camMakePos("ScoutDroidTarget");
		orderDroidLoc(scout, DORDER_MOVE, pos.x, pos.y);
	}
});

camAreaEvent("WestConvoyTrigger", function(droid)
{
	camManageGroup(camMakeGroup("WestConvoyForce"), CAM_ORDER_DEFEND, {
		pos: camMakePos("WestConvoyLoc"),
		radius: 6,
	});
});

function enableNP(args)
{
	camEnableFactory("ScavFactory");
	camEnableFactory("NPFactory");
	camEnableFactory("ScavFactorySouth");

	camManageGroup(camMakeGroup("NPScoutForce"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("RTLZ"),
		repair: 66,
		regroup: true
	});

	camManageGroup(NPCommander, CAM_ORDER_ATTACK, {
		pos: camMakePos("RTLZ"),
		repair: 50
	});

	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "SB1_3_MSG4", type: MISS_MSG}]);
}

function sendScouts()
{
	camManageGroup(camMakeGroup("ScavScoutForce"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("RTLZ")
	});
}

camAreaEvent("NPTrigger", function(droid)
{
	camCallOnce("enableReinforcements");
});

function eventDestroyed(obj)
{
	if (obj.type !== FEATURE && obj.player === CAM_NEW_PARADIGM)
	{
		if (obj.type === STRUCTURE && obj.status === BEING_BUILT)
		{
			return; // Don't aggro when the NP demolishes one of their own structures
		}
		camCallOnce("enableNP");
	}
}

function enableReinforcements()
{
	playSound(cam_sounds.reinforcementsAreAvailable);
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha6, {
		area: "RTLZ",
		message: "C1-3_LZ",
		reinforcements: camMinutesToSeconds(2), // changes!
		annihilate: true
	});

	// Also enable the scavenger factories
	camEnableFactory("ScavFactory");
	camEnableFactory("ScavFactorySouth");
}

function camEnemyBaseDetected_NPBaseGroup()
{
	queue("camCallOnce", camSecondsToMilliseconds(1), "enableReinforcements");
}

function camEnemyBaseDetected_ScavBaseGroup()
{
	queue("camCallOnce", camSecondsToMilliseconds(1), "enableReinforcements");
}

function camEnemyBaseDetected_ScavBaseGroupSouth()
{
	camManageGroup(camMakeGroup("SouthConvoyForce"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("SouthConvoyLoc"),
		regroup: true,
	});
	queue("camCallOnce", camSecondsToMilliseconds(1), "enableReinforcements");
}

function camEnemyBaseEliminated_ScavBaseGroup()
{
	//make enemy easier to find if all his buildings destroyed
	camManageGroup(
		camMakeGroup(enumArea(0, 0, mapWidth, mapHeight, CAM_SCAV_7, false)),
		CAM_ORDER_ATTACK
	);
}

function playNPWarningMessage()
{
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "SB1_3_MSG3", type: CAMP_MSG}]);
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha6, {
		area: "RTLZ",
		message: "C1-3_LZ",
		reinforcements: -1, // will override later
		annihilate: true
	});

	const startPos = getObject("StartPosition");
	const lz = getObject("LandingZone");
	const tEnt = getObject("TransporterEntry");
	const tExt = getObject("TransporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetArtifacts({
		"ScavFactory": { tech: "R-Wpn-Rocket05-MiniPod" }, // Mini-Rocket Pod
		"NPFactory": { tech: "R-Vehicle-Body04" }, // Bug
		"NPLab": { tech: "R-Wpn-MG3Mk1" }, // Heavy Machinegun
		"NPCRC": { tech: "R-Struc-CommandRelay" }, // Command Relay Post
		"NPHQ": { tech: "R-Defense-HardcreteWall" }, // Hardcrete
		"NPRepair": { tech: "R-Struc-RepairFacility" }, // Repair Facility
	});

	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	camSetEnemyBases({
		"ScavBaseGroup": {
			cleanup: "ScavBase",
			detectMsg: "C1-3_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"NPBaseGroup": {
			cleanup: "NPBase",
			detectMsg: "C1-3_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"ScavBaseGroupSouth": {
			cleanup: "SouthScavBase",
			detectMsg: "C1-3_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
	});

	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPBaseGroup",
			rebuildTruck: false, // Can't rebuild this truck
			truckDroid: getObject("NPTruck"), // Use the pre-placed truck on the map
			structset: camAreaToStructSet("NPBase")
	});
	if (tweakOptions.ref_timerlessMode)
	{
		// Set up Timerless mode-exclusive cranes
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(120));
		camManageTrucks(
			CAM_SCAV_7, {
				label: "ScavBaseGroup",
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("ScavBase")
		});
		camManageTrucks(
			CAM_SCAV_7, {
				label: "ScavBaseGroupSouth",
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("SouthScavBase")
		});
	}

	hackAddMessage("C1-3_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); // south-west beacon

	camSetFactories({
		"ScavFactory": {
			assembly: "ScavAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				pos: camMakePos("RTLZ")
			},
			groupSize: 4,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.rbuggy, cTempl.bloke, cTempl.rbjeep, cTempl.buggy ]
		},
		"NPFactory": {
			assembly: "NPAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 30,
			},
			groupSize: 4, // sic! scouts, at most
			maxSize: 20,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.nplpodw, cTempl.nplhmght, cTempl.nplpodw, cTempl.nplflamht ]
		},
		"ScavFactorySouth": {
			assembly: "ScavAssemblySouth",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: true,
				count: -1,
			},
			groupSize: 4,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			templates: [ cTempl.rbjeep, cTempl.buscan, cTempl.rbuggy, cTempl.firetruck ]
		},
	});

	// Rank changes on difficulty:
	// Rookie (SUPEREASY/EASY/MEDIUM)
	// Green (HARD)
	// Trained (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 0 : (difficulty - 2);
	camSetDroidRank(getObject("NPCommander"), COMMANDER_RANK);

	camMakeRefillableGroup(
		camMakeGroup("NPDefense"), {
			templates: [ // NOTE: The starting Medium Cannon tank isn't in this list, so it won't be rebuilt if destroyed.
				cTempl.nplhmght, cTempl.nplhmght, cTempl.nplhmght, cTempl.nplhmght, // Heavy Machineguns
				cTempl.nplpodw, cTempl.nplpodw, // Mini-Rocket Pods
				// The templates below are only built if the commander is ranked higher (or if the Medium Cannon dies)
				cTempl.nplpodw, cTempl.nplpodw, // More Mini-Rocket Pods (Hard+)
				cTempl.nplflamht, cTempl.nplflamht, // Flamers (Insane)
			],
			factories: ["NPFactory"], // Only refill from this factory
			obj: "NPCommander", // Stop filling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "NPCommander", // The object to follow (in this case, the NP commmand droid)
			suborder: CAM_ORDER_DEFEND, // Order to fulfill if the commander dies
			data: { // Suborder data
				pos: camMakePos("NPDefense"),
				radius: 22,
				repair: 66,
			},
			repair: 66,
	});

	// Upgrade NP structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace once destroyed
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "Sys-SensoTower01", "Sys-SensoTower02", true); // Sensor Tower
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "PillBox2", "PillBox1", true); // MG Bunker
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "Sys-SensoTower01", "Sys-SensoTower02");
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "PillBox2", "PillBox1");
	}

	NPCommander = camMakeGroup("NPCommander");

	queue("playNPWarningMessage", camSecondsToMilliseconds(3));
	queue("sendScouts", camSecondsToMilliseconds(60));
}

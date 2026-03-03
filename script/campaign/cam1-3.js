include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

//New base blip, new base area, new factory data

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage03", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade01",
	"R-Struc-Materials01", "R-Vehicle-Engine01",
	"R-Vehicle-Metals01", "R-Wpn-Cannon-Damage01",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Mortar-Damage01", "R-Sys-Engineering01",
	"R-Wpn-Rocket-Damage01", "R-Wpn-Rocket-ROF01",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage02", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage02", "R-Wpn-Cannon-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Rocket-ROF01",
];

var NPDefenseGroup, NPScoutGroup, NPFactory;

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

	camManageGroup(NPScoutGroup, CAM_ORDER_COMPROMISE, {
		pos: camMakePos("RTLZ"),
		repair: 66,
		regroup: true,
		removable: false,
	});
	camManageGroup(NPDefenseGroup, CAM_ORDER_FOLLOW, {
		droid: "NPCommander",
		order: CAM_ORDER_DEFEND,
		data: {
			pos: camMakePos("NPCommander"),
			radius: 22,
			repair: 66,
		},
		repair: 66,
	});

	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "SB1_3_MSG4", type: MISS_MSG}]);
}

function sendScouts()
{
	camManageGroup(camMakeGroup("ScavScoutForce"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("RTLZ")
	});
}

camAreaEvent("ScavTrigger", function(droid)
{
	camEnableFactory("ScavFactory");
});

camAreaEvent("NPTrigger", function(droid)
{
	camCallOnce("enableReinforcements");
});

function eventAttacked(victim, attacker) {
	if (!camDef(victim) || !victim || victim.player === CAM_HUMAN_PLAYER)
	{
		return;
	}
	if (victim.player === CAM_NEW_PARADIGM)
	{
		camCallOnce("enableNP");
		const commander = getObject("NPCommander");
		if (camDef(attacker) && attacker && camDef(commander) && commander &&
			commander.order !== DORDER_SCOUT && commander.order !== DORDER_RTR)
		{
			orderDroidLoc(commander, DORDER_SCOUT, attacker.x, attacker.y);
		}
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
}

function camEnemyBaseDetected_ScavBaseGroup()
{
	queue("camCallOnce", camSecondsToMilliseconds(1), "enableReinforcements");
}

function camEnemyBaseDetected_ScavBaseGroupSouth()
{
	camEnableFactory("ScavFactory");
	camEnableFactory("ScavFactorySouth");
	camManageGroup(camMakeGroup("SouthConvoyForce"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("SouthConvoyLoc"),
		regroup: false, //true when movement gets better. Very big group this one is.
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

function eventDroidBuilt(droid, structure)
{
	// An example of manually managing factory groups.
	if (!camDef(structure) || !structure || structure.id !== NPFactory.id)
	{
		return;
	}
	if (getObject("NPCommander") !== null && groupSize(NPDefenseGroup) < 6) // watch out! commander control limit
	{
		groupAdd(NPDefenseGroup, droid);
	}
	else if (groupSize(NPScoutGroup) < 4 && droid.body !== cTempl.npmmcht.body)
	{
		groupAdd(NPScoutGroup, droid); // heavy tanks don't go scouting
	}
	// As libcampaign.js pre-hook has already fired,
	// the droid would remain assigned to the factory's
	// managed group if not reassigned here,
	// hence fall-through.
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
		"NPFactory": { tech: "R-Defense-HardcreteWall" }, // Hardcrete
		"NPLab": { tech: "R-Vehicle-Body04" }, // Bug
		"NPCRC": { tech: "R-Struc-CommandRelay" }, // Command Relay Post
		// TODO: Repair Facility, HMG
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

	hackAddMessage("C1-3_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); // south-west beacon

	camSetFactories({
		"ScavFactory": {
			assembly: "ScavAssembly",
			order: CAM_ORDER_COMPROMISE,
			data: {
				pos: camMakePos("RTLZ"),
				radius: 8
			},
			groupSize: 4,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.rbuggy, cTempl.bloke, cTempl.rbjeep, cTempl.buggy ]
		},
		"NPFactory": {
			assembly: "NPAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: false,
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
				regroup: false,
				count: -1,
			},
			groupSize: 4,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.rbjeep, cTempl.buscan, cTempl.rbuggy, cTempl.firetruck ]
		},
	});

	NPScoutGroup = camMakeGroup("NPScoutForce");
	NPDefenseGroup = camMakeGroup("NPDefense");
	NPFactory = getObject("NPFactory");

	queue("playNPWarningMessage", camSecondsToMilliseconds(3));
	queue("sendScouts", camSecondsToMilliseconds(60));
}

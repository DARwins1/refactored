include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade02",
	"R-Struc-Materials02", "R-Vehicle-Engine02",
	"R-Vehicle-Metals01", "R-Wpn-Cannon-Damage02",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-Damage02", "R-Wpn-Rocket-Accuracy01", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-Damage02", "R-Wpn-Rocket-ROF01", "R-Struc-RprFac-Upgrade01",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-Mortar-Damage02", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Vehicle-Metals01",
	"R-Defense-WallUpgrade01", "R-Struc-Materials01",
];
var npAttacked;
var destroyedCount;
var baseDefendersLightGroup;
var baseDefendersMediumGroup;

//Pursue player when nearby but do not go too far away from defense zone.
function camEnemyBaseDetected_NPBaseGroup()
{
	camCallOnce("NPBaseDetect");
}

function enableSouthScavFactory()
{
	camEnableFactory("SouthScavFactory");
}

function activateNPFactories()
{
	camEnableFactory("HeavyNPFactory");
	camEnableFactory("MediumNPFactory");
}

camAreaEvent("NorthScavFactoryTrigger", function()
{
	camEnableFactory("NorthScavFactory");
});

camAreaEvent("NPBaseDetectTrigger", function()
{
	camDetectEnemyBase("NPBaseGroup");
});

camAreaEvent("removeRedObjectiveBlip", function()
{
	hackRemoveMessage("C1-4_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER); //Remove mission objective.
	hackAddMessage("C1-4_LZ", PROX_MSG, CAM_HUMAN_PLAYER, false);
});

camAreaEvent("LandingZoneTrigger", function()
{
	camPlayVideos([cam_sounds.incoming.incomingIntelligenceReport, {video: "SB1_4_B", type: MISS_MSG}]);
	hackRemoveMessage("C1-4_LZ", PROX_MSG, CAM_HUMAN_PLAYER); //Remove LZ 2 blip.

	const lz = getObject("LandingZone2"); // will override later
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give extra 40 minutes.
	setMissionTime(camChangeOnDiff(camMinutesToSeconds((tweakOptions.classicTimers) ? 30 : 40)) + getMissionTime());
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha9.pre, {
		area: "RTLZ",
		message: "C1-4_LZ",
		reinforcements: camMinutesToSeconds(1.5), // changes!
		retlz: true
	});

	// enables all factories
	camEnableFactory("SouthScavFactory");
	camEnableFactory("NorthScavFactory");
	activateNPFactories();
	buildDefenses();
	if (!npAttacked)
	{
		setupBaseDefenders(true);
	}
});

function setupBaseDefenders(shouldDefend)
{
	const ORDER_STATE = (shouldDefend) ? CAM_ORDER_DEFEND : CAM_ORDER_ATTACK;
	camManageGroup(baseDefendersLightGroup, ORDER_STATE, {
		pos: camMakePos("nearSensor"),
		radius: 10,
	});
	camManageGroup(baseDefendersMediumGroup, ORDER_STATE, {
		pos: camMakePos("nearSensor"),
		radius: 10,
	});
}

function NPBaseDetect()
{
	queue("activateNPFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));
}

function switchBaseDefenderOrders()
{
	setupBaseDefenders(false); //Now they will attack indefinitely.
}

// Destroying too many New Paradigm units/structures will set the base defenders into attack mode.
function eventDestroyed(obj)
{
	if ((obj.type === DROID || obj.type === STRUCTURE) && obj.player === CAM_NEW_PARADIGM)
	{
		const MIN_DESTROYED_OBJECTS = 3;
		destroyedCount += 1;

		if (destroyedCount >= MIN_DESTROYED_OBJECTS)
		{
			camCallOnce("switchBaseDefenderOrders");
		}
	}
}

// Harming the NP will cause the base groups to defend the front of the base, and queue
// factory production shortly after.
function eventAttacked(victim, attacker)
{
	if (npAttacked || !victim || !attacker)
	{
		return;
	}
	if ((attacker.player === CAM_HUMAN_PLAYER && victim.player === CAM_NEW_PARADIGM) ||
		(attacker.player === CAM_NEW_PARADIGM && victim.player === CAM_HUMAN_PLAYER))
	{
		const ARTY_IGNORE_DIST = 9;
		if ((attacker.player === CAM_NEW_PARADIGM) &&
			(attacker.hasIndirect || attacker.isCB) &&
			(camDist(victim.x, victim.y, attacker.x, attack.y) >= ARTY_IGNORE_DIST))
		{
			return;
		}
		npAttacked = true;
		setupBaseDefenders(true);
		queue("activateNPFactories", camMinutesToMilliseconds(1.5));
	}
}

function buildDefenses()
{
	// First wave of trucks
	camQueueBuilding(CAM_NEW_PARADIGM, "GuardTower6", "BuildTower0");
	camQueueBuilding(CAM_NEW_PARADIGM, "PillBox1",    "BuildTower3");
	camQueueBuilding(CAM_NEW_PARADIGM, "PillBox1",    "BuildTower6");

	// Second wave of trucks
	camQueueBuilding(CAM_NEW_PARADIGM, "GuardTower3", "BuildTower1");
	camQueueBuilding(CAM_NEW_PARADIGM, "GuardTower6", "BuildTower2");
	camQueueBuilding(CAM_NEW_PARADIGM, "GuardTower6", "BuildTower4");

	// Third wave of trucks
	camQueueBuilding(CAM_NEW_PARADIGM, "GuardTower3", "BuildTower5");
	camQueueBuilding(CAM_NEW_PARADIGM, "GuardTower6", "BuildTower7");
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha9.pre, {
		area: "RTLZ",
		message: "C1-4_LZ",
		reinforcements: -1, // will override later
		retlz: true
	});

	const startPos = getObject("StartPosition");
	const lz = getObject("LandingZone1"); // will override later
	const tEnt = getObject("TransporterEntry");
	const tExt = getObject("TransporterExit");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	npAttacked = false;
	destroyedCount = 0;
	baseDefendersLightGroup = camMakeGroup("AttackGroupLight");
	baseDefendersMediumGroup = camMakeGroup("AttackGroupMedium");

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetArtifacts({
		"NPCommandCenter": { tech: "R-Defense-WallUpgrade03" }, // Improved Hardcrete Mk3
		"NPResearchFacility": { tech: "R-Wpn-Mortar02Hvy" }, // Bombard
		"MediumNPFactory": { tech: "R-Wpn-Rocket01-LtAT" }, // Lancer
		"HeavyNPFactory": { tech: "R-Vehicle-Prop-Tracks" }, // Tracked Propulsion
	});

	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	camSetEnemyBases({
		"SouthScavBaseGroup": {
			cleanup: "SouthScavBase",
			detectMsg: "C1-4_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"NorthScavBaseGroup": {
			cleanup: "NorthScavBase",
			detectMsg: "C1-4_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"NPBaseGroup": {
			cleanup: "NPBase",
			detectMsg: "C1-4_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
	});

	hackAddMessage("C1-4_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	camSetFactories({
		"SouthScavFactory": {
			assembly: "SouthScavFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.rbuggy, cTempl.bjeep, cTempl.buscan, cTempl.trike ]
		},
		"NorthScavFactory": {
			assembly: "NorthScavFactoryAssembly",
			order: CAM_ORDER_COMPROMISE,
			data: {
				pos: camMakePos("RTLZ"),
				radius: 8
			},
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.firetruck, cTempl.rbjeep, cTempl.bloke, cTempl.buggy ]
		},
		"HeavyNPFactory": {
			assembly: "HeavyNPFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6, // this one was exclusively producing trucks
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)), // but we simplify this out
			templates: [ cTempl.nphmct, cTempl.npmmct, cTempl.npmmcht ]
		},
		"MediumNPFactory": {
			assembly: "MediumNPFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.nplmraht, cTempl.nplhmght, cTempl.npmbbht, cTempl.npmmorht, cTempl.nplflamht ]
		},
	});

	// To be able to use camEnqueueBuilding() later,
	// and also to rebuild dead trucks.
	camManageTrucks(CAM_NEW_PARADIGM);

	queue("enableSouthScavFactory", camChangeOnDiff(camSecondsToMilliseconds(10)));
}

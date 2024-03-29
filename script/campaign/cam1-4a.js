include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade02",
	"R-Struc-Materials02", "R-Struc-Factory-Upgrade02",
	"R-Vehicle-Engine02",
	"R-Vehicle-Metals02", "R-Cyborg-Metals02", "R-Wpn-Cannon-Damage03",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Mortar-Damage02", "R-Wpn-Rocket-Accuracy01",
	"R-Wpn-Rocket-Damage02", "R-Wpn-Rocket-ROF02",
	"R-Wpn-RocketSlow-Damage02", "R-Struc-RprFac-Upgrade03",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-ROF02", "R-Vehicle-Metals02",
	"R-Defense-WallUpgrade03", "R-Struc-Materials03",
];

//Pursue player when nearby but do not go too far away from defense zone.
function camEnemyBaseDetected_NPBaseGroup()
{
	camCallOnce("NPBaseDetect");
}

function enableSouthScavFactory()
{
	camEnableFactory("SouthScavFactory");
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
	camPlayVideos(["pcv456.ogg", {video: "SB1_4_B", type: MISS_MSG}]);
	hackRemoveMessage("C1-4_LZ", PROX_MSG, CAM_HUMAN_PLAYER); //Remove LZ 2 blip.

	const lz = getObject("LandingZone2"); // will override later
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give extra 40 minutes.
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(40)) + getMissionTime());
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_1_5S", {
		area: "RTLZ",
		message: "C1-4_LZ",
		reinforcements: camMinutesToSeconds(1.5), // changes!
		retlz: true
	});
	// enables all factories
	camEnableFactory("SouthScavFactory");
	camEnableFactory("NorthScavFactory");
	camEnableFactory("HeavyNPFactory");
	camEnableFactory("MediumNPFactory");
	buildDefenses();
});

function NPBaseDetect()
{
	// Send tanks
	camManageGroup(camMakeGroup("AttackGroupLight"), CAM_ORDER_ATTACK, {
		pos: camMakePos("nearSensor"),
		radius: 10,
	});

	camManageGroup(camMakeGroup("AttackGroupMedium"), CAM_ORDER_ATTACK, {
		pos: camMakePos("nearSensor"),
		radius: 10,
	});

	camEnableFactory("HeavyNPFactory");
	camEnableFactory("MediumNPFactory");
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
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_1_5S", {
		area: "RTLZ",
		message: "C1-4_LZ",
		reinforcements: -1, // will override later
		retlz: true
	});

	const startpos = getObject("StartPosition");
	const lz = getObject("LandingZone1"); // will override later
	const tent = getObject("TransporterEntry");
	const text = getObject("TransporterExit");

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);
	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	camSetEnemyBases({
		"SouthScavBaseGroup": {
			cleanup: "SouthScavBase",
			detectMsg: "C1-4_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"NorthScavBaseGroup": {
			cleanup: "NorthScavBase",
			detectMsg: "C1-4_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"NPBaseGroup": {
			cleanup: "NPBase",
			detectMsg: "C1-4_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
	});

	hackAddMessage("C1-4_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	camSetArtifacts({
		"NPCommandCenter": { tech: "R-Vehicle-Metals01" },
		"NPResearchFacility": { tech: "R-Vehicle-Body04" },
		"MediumNPFactory": { tech: "R-Wpn-Rocket03-HvAT" }, // Bunker Buster
	});

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
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.bloke, cTempl.buggy ]
		},
		"HeavyNPFactory": {
			assembly: "HeavyNPFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,         // this one was exclusively producing trucks
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),    // but we simplify this out
			templates: [ cTempl.npmmct, cTempl.npsmct, cTempl.npsmc ]
		},
		"MediumNPFactory": {
			assembly: "MediumNPFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.npmrl, cTempl.nphmg, cTempl.npsbb, cTempl.npmor, cTempl.npflam ]
		},
	});

	// To be able to use camEnqueueBuilding() later,
	// and also to rebuild dead trucks.
	camManageTrucks(CAM_NEW_PARADIGM);

	queue("enableSouthScavFactory", camChangeOnDiff(camSecondsToMilliseconds(10)));
}
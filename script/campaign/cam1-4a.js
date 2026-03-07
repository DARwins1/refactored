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

camAreaEvent("NPBaseDetectTrigger", function()
{
	camDetectEnemyBase("NPBaseGroup");
});

// Discover the NP base after the player trades attacks with them
function eventAttacked(victim, attacker)
{
	if (npAttacked || !victim || !attacker)
	{
		return;
	}
	if ((attacker.player === CAM_HUMAN_PLAYER && victim.player === CAM_NEW_PARADIGM) ||
		(attacker.player === CAM_NEW_PARADIGM && victim.player === CAM_HUMAN_PLAYER))
	{
		camDetectEnemyBase("NPBaseGroup");
		npAttacked = true;
	}
}

// Detect the NP base and start ordering their groups around.
// The NP base can be "detected" in three ways:
// Actually discovering the base structures themselves
// Attacking any NP unit/structure
// Crossing the detection trigger
function NPBaseDetect()
{
	hackRemoveMessage("C1-4_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER); //Remove mission objective.
	hackAddMessage("C1-4_LZ", PROX_MSG, CAM_HUMAN_PLAYER, false);

	// Queue up factories
	queue("activateNPFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("enableNorthScavFactories", camChangeOnDiff(camMinutesToMilliseconds(1)));

	// Light group pursues the player; medium group falls back
	camManageGroup(baseDefendersLightGroup, CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
	camManageGroup(baseDefendersMediumGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("MediumNPFactoryAssembly"),
		radius: 10,
	});
}

function enableNorthScavFactories()
{
	camEnableFactory("NorthScavFactory");
	camEnableFactory("WestScavFactory");
}

function activateNPFactories()
{
	camEnableFactory("HeavyNPFactory");
	camEnableFactory("MediumNPFactory");
}

camAreaEvent("LandingZoneTrigger", function()
{
	camPlayVideos([cam_sounds.incoming.incomingIntelligenceReport, {video: "SB1_4_B", type: MISS_MSG}]);
	hackRemoveMessage("C1-4_LZ", PROX_MSG, CAM_HUMAN_PLAYER); //Remove LZ 2 blip.

	const lz = getObject("LandingZone2");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give extra 40 minutes.
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(40)) + getMissionTime());
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha9.pre, {
		area: "RTLZ",
		message: "C1-4_LZ",
		reinforcements: camMinutesToSeconds(1.5), // changes!
		retlz: true
	});

	// Enable all factories
	enableNorthScavFactories();
	activateNPFactories();

	// If the medium group is still alive, order them to attack
	camManageGroup(baseDefendersMediumGroup, CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
});

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha9.pre, {
		area: "RTLZ",
		message: "C1-4_LZ",
		reinforcements: -1, // will override later
		retlz: true
	});

	const startPos = getObject("StartPosition");
	const lz = getObject("LandingZone1");
	const tEnt = getObject("TransporterEntry");
	const tExt = getObject("TransporterExit");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER); // will override later
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	npAttacked = false;
	destroyedCount = 0;
	baseDefendersLightGroup = camMakeGroup("AttackGroupLight");
	baseDefendersMediumGroup = camMakeGroup("AttackGroupMedium");

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetArtifacts({
		"NPCommandCenter": { tech: "R-Vehicle-Body08" }, // Scorpion
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
		"WestScavBaseGroup": {
			cleanup: "WestScavBase",
			detectMsg: "C1-4_BASE4",
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
			templates: [ cTempl.firetruck, cTempl.rbjeep, cTempl.kevbloke, cTempl.gbjeep ]
		},
		"WestScavFactory": {
			assembly: "WestScavFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.minitruck, cTempl.kevlance, cTempl.bjeep ]
		},
		"HeavyNPFactory": {
			assembly: "HeavyNPFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			templates: [ cTempl.nphmct, cTempl.npmmct, cTempl.npmmcht ]
		},
		"MediumNPFactory": {
			assembly: "MediumNPFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.nplmraht, cTempl.nplhmght, cTempl.npmbbht, cTempl.npmmorht, cTempl.npmflamht ]
		},
	});

	if (difficulty >= HARD)
	{
		// Swap Mortars for Bombards
		camUpgradeOnMapTemplates(cTempl.npmmorht, cTempl.npmmorbht);
	}

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(90));
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPBaseGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode, // Don't rebuild this truck unless we're on timerless mode
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("npTruck1"), // Use the truck already on the map
			structset: camAreaToStructSet("NPBase")
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPBaseGroup",
			rebuildTruck: false, // Don't rebuild this truck ever
			truckDroid: getObject("npTruck2"),
			structset: camAreaToStructSet("NPBase")
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPBaseGroup",
			rebuildTruck: false, // Nor this one
			truckDroid: getObject("npTruck3"),
			structset: camAreaToStructSet("NPBase")
	});

	queue("enableSouthScavFactory", camChangeOnDiff(camSecondsToMilliseconds(10)));

	// Change the skybox to a night sky
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to be nearly pitch black
	camSetFog(10, 10, 10);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Reverse the sun east/west direction
	camSetSunPos(-225, -600, 450);
}

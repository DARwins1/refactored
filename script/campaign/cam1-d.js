include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade03",
	"R-Struc-Materials03", "R-Vehicle-Engine03",
	"R-Vehicle-Metals03", "R-Cyborg-Metals03", "R-Wpn-Cannon-Damage03",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Rocket-Accuracy02", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Rocket-Damage03", "R-Wpn-Rocket-ROF01", "R-Sys-Engineering01",
	"R-Wpn-Mortar-ROF01", "R-Struc-RprFac-Upgrade01",
];
var npCommander;

camAreaEvent("causeWayTrig", function(droid)
{
	enableAllFactories();
	aggroNPCommander();
});

camAreaEvent("westWayTrigger", function(droid)
{
	enableAllFactories();
});

function transportBaseSetup()
{
	camDetectEnemyBase("NPLZGroup");
	camSetBaseReinforcements("NPLZGroup", camChangeOnDiff(camMinutesToMilliseconds(8)), "getDroidsForNPLZ", CAM_REINFORCE_TRANSPORT, {
		entry: { x: 2, y: 2 },
		exit: { x: 2, y: 2 },
		posLZ: camMakePos("NPLZ1"),
		data: {
			regroup: true,
			count: -1,
			repair: 40,
		},
	});
}

function getDroidsForNPLZ()
{
	let lim = 8;
	if (difficulty === HARD)
	{
		lim = 9;
	}
	else if (difficulty >= INSANE)
	{
		lim = 10;
	}

	const USE_ARTILLERY = (camRand(2) == 0);
	let templates;

	if (USE_ARTILLERY)
	{
		templates = [ cTempl.npmmorbht ];
	}
	else
	{
		templates = [ cTempl.npmatht, cTempl.npmbbht, cTempl.npmhmght, cTempl.npmmcht, cTempl.npmmraht ];
	}

	const droids = [];
	for (let i = 0; i < lim; ++i)
	{
		droids.push(camRandFrom(templates));
	}

	if (USE_ARTILLERY)
	{
		// Ensure a sensor is with the group
		droids.pop();
		droids.push(cTempl.npmsensht);
	}

	return droids;
}

// Start moving attack/patrol groups around
// Also activate some factories
function groupOrders()
{
	// Ambush Groups
	camManageGroup(camMakeGroup("MRL1"), CAM_ORDER_ATTACK, {
		repair: 80,
	});
	camManageGroup(camMakeGroup("IDF1"), CAM_ORDER_ATTACK);
	camManageGroup(camMakeGroup("IDF2"), CAM_ORDER_ATTACK);

	// Hover Groups
	camManageGroup(camMakeGroup("hoversAttack"), CAM_ORDER_ATTACK, {
		pos: camMakePos("attackPoint"),
		fallback: camMakePos("genRetreatPoint"),
		morale: 50,
		regroup: false
	});
	camManageGroup(camMakeGroup("hoversDefense"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverDefense1"),
			camMakePos("hoverDefense2"),
			camMakePos("hoverDefense3"),
			camMakePos("hoverDefense4")
		],
		interval: camMinutesToMilliseconds(1.5),
		repair: 70
	});

	// Cyborg base patrols
	camManageGroup(camMakeGroup("cyborgs"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("genRetreatPoint"),
			camMakePos("cybRetreatPoint"),
			camMakePos("NPLZ1")
		],
		repair: 66
	});

	camEnableFactory("NPFactoryW");
	camEnableFactory("NPCybFactoryW");
}

// Enable the east the east and northeast NP factories, as well as the LZ
function enableAllFactories()
{
	camEnableFactory("NPFactoryE");
	camEnableFactory("NPCybFactoryE");
	camEnableFactory("NPFactoryNE");
	camEnableFactory("NPCybFactoryNE");
	camCallOnce("transportBaseSetup");
}

// Make the NP commander more aggressive
function aggroNPCommander()
{
	camManageGroup(npCommander, CAM_ORDER_ATTACK, {repair: 50});
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alphaEnd, {
		area: "RTLZ",
		message: "C1D_LZ",
		reinforcements: camMinutesToSeconds(2),
		eliminateBases: true
	});

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"artifact1": { tech: "R-Vehicle-Prop-Hover" }, // Hover Propulsion
		"NPFactoryNE": { tech: "R-Vehicle-Body12" }, // Mantis
	});

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);

	camSetEnemyBases({
		"NPSouthEastGroup": {
			cleanup: "NPSouthEast",
			detectMsg: "C1D_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPMiddleGroup": {
			cleanup: "NPMiddle",
			detectMsg: "C1D_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPNorthEastGroup": {
			cleanup: "NPNorthEast",
			detectMsg: "C1D_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPLZGroup": {
			cleanup: "NPLZBaseCleanup",
			detectMsg: "C1D_LZ2",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_NEW_PARADIGM // required for LZ-type bases
		},
	});

	camSetFactories({
		"NPFactoryW": {
			assembly: "NPFactoryWAssembly",
			order: CAM_ORDER_PATROL,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				pos: [
					camMakePos("hoverDefense5"),
					camMakePos("hoverDefense6"),
					camMakePos("hoverDefense7"),
					camMakePos("hoverDefense8"),
					camMakePos("hoverDefense9")
				],
				interval: camSecondsToMilliseconds(45),
				regroup: false,
				repair: 66,
				count: -1,
			},
			templates: [ cTempl.npmhmgh, cTempl.npmath, cTempl.npmmrah ] //Hover factory
		},
		"NPFactoryE": {
			assembly: "NPFactoryEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.npmatht, cTempl.npmmraht, cTempl.npmflamht, cTempl.npmmcht ] //variety
		},
		"NPFactoryNE": {
			assembly: "NPFactoryNEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(120)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.nphhct, cTempl.npmbbt, cTempl.npmatt ] //tough units
		},
		"NPCybFactoryW": {
			assembly: "NPCybFactoryWAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.cybca, cTempl.cybhg, cTempl.cybgr ] // General attack cyborgs
		},
		"NPCybFactoryE": {
			assembly: "NPCybFactoryEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.cybca, cTempl.cybrp ] // Cannons and mechanics
		},
		"NPCybFactoryNE": {
			assembly: "NPCybFactoryNEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.cybfl, cTempl.cybla ] // Lancers and flamers
		},
	});

	// Rank changes on difficulty:
	// Trained (SUPEREASY/EASY/MEDIUM)
	// Regular (HARD)
	// Professional (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 2 : (difficulty);
	camSetDroidRank(getObject("npCommander"), COMMANDER_RANK);

	npCommander = camManageGroup(camMakeGroup("npCommander"), CAM_ORDER_PATROL, {
		pos: [ // These orders are overwritten later
			camMakePos("genRetreatPoint"),
			camMakePos("cybRetreatPoint"),
			camMakePos("NPLZ1")
		],
		interval: camSecondsToMilliseconds(40),
		repair: 50
	});
	camMakeRefillableGroup(
		camMakeGroup("npCommandGroup"), {
			templates: [
				cTempl.nphhct, cTempl.nphhct, cTempl.nphhct,
				cTempl.nphhct, cTempl.nphhct, cTempl.nphhct, // Heavy Cannons
				cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, // Mechanics
				cTempl.npmmrat, cTempl.npmmrat, // MRAs (Hard+)
				cTempl.npmmrat, cTempl.npmmrat, // More MRAs (Insane)
			],
			obj: "npCommander",
			factories: ["NPFactoryNE", "NPCybFactoryNE"]
		}, CAM_ORDER_FOLLOW, {
			leader: "npCommander",
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 50,
				regroup: true,
				count: -1
			},
			repair: 50,
	});

	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPNorthEastGroup",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= MEDIUM), // Don't rebuild this truck unless we're on timerless mode (or on Medium+)
			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(180)),
			truckDroid: getObject("npTruck1"), // Use the truck already on the map
			structset: camAreaToStructSet("NPNorthEast")
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPNorthEastGroup",
			rebuildTruck: (tweakOptions.ref_timerlessMode && difficulty >= MEDIUM), // Don't rebuild this truck unless we're on timerless mode AND on Medium+
			truckDroid: getObject("npTruck2"),
			structset: camAreaToStructSet("NPNorthEast")
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPMiddleGroup",
			rebuildTruck: ref_timerlessMode,
			truckDroid: getObject("npTruck3"),
			structset: camAreaToStructSet("NPMiddle")
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPLZGroup",
			rebuildBase: ((difficulty === INSANE) || (ref_timerlessMode && difficulty >= HARD)),
			rebuildTruck: ref_timerlessMode,
			truckDroid: getObject("npTruck4"),
			structset: camAreaToStructSet("NPLZBaseCleanup")
	});

	hackAddMessage("C1D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("groupOrders", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("aggroNPCommander", camChangeOnDiff(camMinutesToMilliseconds(14)));

	// Change the skybox to a night sky
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to be nearly pitch black
	camSetFog(10, 10, 10);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Reverse the sun east/west direction
	camSetSunPos(-225, -600, 450);
}

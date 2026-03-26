include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_UPLINK_PLAYER = 1; //The satellite uplink player number.
const mis_collectiveRes = [
	"R-Wpn-MG-Damage07", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage06", "R-Wpn-Cannon-ROF03", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF03", "R-Wpn-Mortar-Acc02", 
	"R-Wpn-Rocket-Damage06", "R-Wpn-Rocket-ROF02", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage02", "R-Wpn-AAGun-ROF02", "R-Wpn-AAGun-Accuracy01",
	"R-Wpn-Howitzer-Damage01", "R-Wpn-Howitzer-ROF01",
	"R-Wpn-Bomb-Damage01",
	"R-Defense-WallUpgrade05", "R-Struc-Materials05",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade02",
	"R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat01", "R-Cyborg-Armor-Heat01",
	"R-Vehicle-Engine05",
];
var commanderEast, commanderSouth;

// Attack the player with the cyborg squad stashed in the NE corner
// Also enable some factories
function cyborgAmbush()
{
	camManageGroup(camMakeGroup("cybAmbushGroup"), CAM_ORDER_ATTACK, {
		repair: 67,
		regroup: true,
		count: -1
	});

	camEnableFactory("COCentralFactoryL");
	camEnableFactory("CONorthCyborgFactory1");
	camEnableFactory("CONorthCyborgFactory2");
}

// Enable all remaining factories
function enableAllFactories()
{
	camEnableFactory("COCentralFactoryR");
	camEnableFactory("COSouthCyborgFactory");
}

// Order the eastern commander to attack the player (if still alive)
function aggroEastCommander()
{
	camManageGroup(commanderEast, CAM_ORDER_ATTACK, {repair: 67});
}

// Order the southern commander to attack the player (if still alive)
function aggroSouthCommander()
{
	camManageGroup(commanderSouth, CAM_ORDER_ATTACK, {repair: 67});
}

//Extra win condition callback.
function checkNASDACentral()
{
	if (getObject("uplink") === null)
	{
		return false; //It was destroyed
	}
	return true; // The player still has to kill everything to win
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Secure the Uplink from The Collective"));

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.beta8.pre, {
		area: "RTLZ",
		message: "C2D_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "checkNASDACentral",
		annihilate: true
	});

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	camSetArtifacts({
		"COResearchLab": { tech: "R-Struc-Research-Upgrade02" }, // Dedicated Synaptic Link Data Analysis
		"COCentralFactoryL": { tech: "R-Wpn-Cannon3Mk1" }, // Heavy Cannon
		"COVtolFactory": { tech: "R-Wpn-Bomb-Damage01" }, // HE Bomb Shells
		"COHowitzerEmplacement": { tech: "R-Wpn-HowitzerMk1" }, // Howitzer
	});

	setAlliance(CAM_HUMAN_PLAYER, MIS_UPLINK_PLAYER, true);
	setAlliance(CAM_THE_COLLECTIVE, MIS_UPLINK_PLAYER, true);

	// Set uplink team colour to white.
	changePlayerColour(MIS_UPLINK_PLAYER, 10);

	camSetEnemyBases({
		"COCentralBase": {
			cleanup: "baseCleanup",
			detectMsg: "C2D_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"COVtolBase": {
			cleanup: "vtolBaseCleanup",
			detectMsg: "C2D_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COCentralFactoryR": {
			assembly: "COCentralAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 20,
			},
			templates: [cTempl.comsenst, cTempl.comrotmt, cTempl.cohbalt, cTempl.comrotmt, cTempl.comhpvt] // Artillery support mostly
		},
		"COCentralFactoryL": {
			assembly: "COCentralAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 20,
			},
			templates: [cTempl.cohhct, cTempl.comhatt, cTempl.cohhct, cTempl.cohhrat] // Heavies
		},
		"COHoverFactory": {
			assembly: "COHoverAssembly",
			order: CAM_ORDER_PATROL,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				pos: [
					camMakePos("hoverPatrolPos4"),
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos2"),
					camMakePos("startPosition"),
				],
				repair: 40,
				patrolType: CAM_PATROL_CYCLE,
				interval: camSecondsToMilliseconds(30)
			},
			templates: [cTempl.combbh, cTempl.cohhrah, cTempl.comhpvh]
		},
		"CONorthCyborgFactory1": {
			assembly: "COCentralAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
			},
			templates: [cTempl.cybth, cTempl.cybag] // Thermites and Assault Gunners
		},
		"CONorthCyborgFactory2": {
			assembly: "COCentralAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 40,
			},
			templates: [cTempl.scyac] // Super Auto Cannons only
		},
		"COSouthCyborgFactory": {
			assembly: "COSouthCyborgFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 40,
			},
			templates: [cTempl.scytk, cTempl.scyhr] // Heavy Rockets & Tank Killers
		},
		"COVtolFactory": {
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(75)),
			templates: [cTempl.comhbv, cTempl.comacv] // HEAP Bombs and Assault Cannons
		},
	});

	// Make sure these labels are replaced if these towers are destroyed and rebuilt
	camAutoReplaceObjectLabel(["coVtolTowerW", "coVtolTowerNE", "coVtolTowerC", "coVtolCBTower"]);

	// Rank changes on difficulty:
	// Professional (SUPEREASY/EASY/MEDIUM)
	// Veteran (HARD)
	// Elite (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 4 : (difficulty + 2);
	camSetDroidRank(getObject("coCommanderEast"), COMMANDER_RANK);
	camSetDroidRank(getObject("coCommanderSouth"), COMMANDER_RANK);

	commanderEast = camManageGroup(camMakeGroup("coCommanderEast"), CAM_ORDER_PATROL, { // Orders updated later
		pos: [
			camMakePos("eastPatrolPos1"),
			camMakePos("eastPatrolPos2"),
			camMakePos("eastPatrolPos3"),
			camMakePos("eastPatrolPos4"),
		],
		interval: camSecondsToMilliseconds(40),
		repair: 67
	});
	camMakeRefillableGroup(
		camMakeGroup("eastComGroup"), {
			templates: [
				cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // Heavy Cannons
				cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // HRAs
				cTempl.comaat, cTempl.comaat, // Cyclones
				cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // Tank Killers
				cTempl.comrept, cTempl.comrept, // Repair Turrets (Hard+)
				cTempl.comrept, cTempl.comrept, // More Repair Turrets (Insane)
			],
			obj: "coCommanderEast",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coCommanderEast",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			}
	});
	commanderSouth = camManageGroup(camMakeGroup("coCommanderSouth"), CAM_ORDER_PATROL, { // Orders updated later
		pos: [
			camMakePos("southPatrolPos1"),
			camMakePos("southPatrolPos2"),
			camMakePos("southPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(40),
		repair: 67
	});
	camMakeRefillableGroup(
		camMakeGroup("southComGroup"), {
			templates: [
				cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // Heavy Cannons
				cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // HRAs
				cTempl.comhatt, cTempl.comhatt, cTempl.comhatt,
				cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // Assault Guns
				cTempl.comact, cTempl.comact, // Assault Cannons (Hard+)
				cTempl.comact, cTempl.comact, // More Assault Cannons (Insane)
			],
			obj: "coCommanderSouth",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coCommanderSouth",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			}
	});

	// VTOL Radar Tower management
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers
				cTempl.comhatv, cTempl.comhatv,
			],
			obj: "coVtolTowerW",
			globalFill: true // The Collective only has 1 VTOL factory on this level but whatever
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerW",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Assault Cannons
				cTempl.comacv, cTempl.comacv,
			],
			obj: "coVtolCBTower",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolCBTower",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Phosphor Bombs, 2 Assault Guns
				cTempl.colpbv,
				cTempl.colagv,
				cTempl.colpbv,
				cTempl.colagv,
				cTempl.colpbv,
			],
			obj: "coVtolTowerNE",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerNE",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Assault Guns, 2 Assault Cannons
				cTempl.colagv,
				cTempl.comacv,
				cTempl.colagv,
				cTempl.comacv,
				cTempl.colagv,
			],
			obj: "coVtolTowerC",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerC",
			suborder: CAM_ORDER_ATTACK
	});

	// Hover patrol group
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.cohhrah, cTempl.cohhrah, // HRAs
				cTempl.comhpvh, cTempl.comhpvh, // HVCs
				cTempl.comhath, cTempl.comhath, // Tank Killers
			],
			factories: ["COHoverFactory"]
		}, CAM_ORDER_PATROL, {
			repair: 67,
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
				camMakePos("hoverPatrolPos4"),
			],
			interval: camSecondsToMilliseconds(30)
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COCentralBase",
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck1"),
			structset: camAreaToStructSet("baseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COCentralBase",
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck2"),
			structset: camAreaToStructSet("baseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COVtolBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck3"),
			structset: camAreaToStructSet("vtolBaseCleanup")
	});

	hackAddMessage("C2D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	// Start these factories immediately
	camEnableFactory("COHoverFactory");
	camEnableFactory("COVtolFactory");

	queue("cyborgAmbush", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("aggroEastCommander", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("aggroSouthCommander", camChangeOnDiff(camMinutesToMilliseconds(12)));

	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Move the sun towards the east
	camSetSunPos(-225, -600, 450);
	camSetSkyType(CAM_SKY_NIGHT);
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy02",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF02", "R-Wpn-Howitzer-Accuracy01",
	"R-Wpn-Bomb-Damage01",
	"R-Wpn-Missile-Damage01",
	"R-Defense-WallUpgrade06", "R-Struc-Materials06",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat02", "R-Cyborg-Armor-Heat02",
	"R-Vehicle-Engine06",
];
var coCommander;

function camEnemyBaseDetected_COBase1()
{
	camCallOnce("removeBlip1");
}

function camEnemyBaseDetected_COBase2()
{
	camCallOnce("removeBlip2");
}

function camEnemyBaseDetected_COBase3()
{
	camCallOnce("removeBlip3");
}

function camEnemyBaseDetected_COBase4()
{
	camCallOnce("removeBlip4");
}

function removeBlip1()
{
	hackRemoveMessage("C27_OBJECTIVE1", PROX_MSG, CAM_HUMAN_PLAYER);
}

function removeBlip2()
{
	hackRemoveMessage("C27_OBJECTIVE2", PROX_MSG, CAM_HUMAN_PLAYER);
}

function removeBlip3()
{
	hackRemoveMessage("C27_OBJECTIVE3", PROX_MSG, CAM_HUMAN_PLAYER);
}

function removeBlip4()
{
	hackRemoveMessage("C27_OBJECTIVE4", PROX_MSG, CAM_HUMAN_PLAYER);
}

function enableFactoriesAndHovers()
{
	camManageGroup(camMakeGroup("grp2Hovers"), CAM_ORDER_ATTACK, {
		fallback: camMakePos("hoverPos3"),
		morale: 10, // Fall back after minor losses
		count: -1
	});

	// Just turn everything on all at once :P
	camEnableFactory("COHeavyFac-Arti-b2");
	camEnableFactory("COCyborgFac-b2");
	camEnableFactory("COCyborgFac-b3");
	camEnableFactory("COCyborgFac-b4");
}

function baseThreeVtolAttack()
{
	const vt = enumArea("vtolGroupBase3", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && isVTOL(obj)
	));
	camManageGroup(camMakeGroup(vt), CAM_ORDER_ATTACK, {
		regroup: false,
	});
}

function aggroCommander()
{
	camManageGroup(coCommander, CAM_ORDER_ATTACK, {repair: 67});
}

// Reapply the label to the VTOL Strike Turret if it's rebuilt
function eventDroidBuilt(droid, structure)
{
	if (camDef(structure) && droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comstriket))
	{
		addLabel(droid, "coVtolStrike");
	}
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.beta10.pre, {
		eliminateBases: true,
		area: "RTLZ",
		message: "C27_LZ",
		reinforcements: camMinutesToSeconds(3)
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
		"COHeavyFac-Arti-b2": { tech: ["R-Wpn-Cannon-ROF04"] }, // Cannon Rapid Loader
		"COTankKillerHardpoint": { tech: "R-Wpn-Rocket-Damage07" }, // HESH Rocket Warhead
		"COHeavyFac-b4": { tech: "R-Vehicle-Body09" }, // Tiger
	});

	camSetEnemyBases({
		"COBase1": {
			cleanup: "COBase1Cleanup",
			detectMsg: "C27_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBase2": {
			cleanup: "COBase2Cleanup",
			detectMsg: "C27_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBase3": {
			cleanup: "COBase3Cleanup",
			detectMsg: "C27_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBase4": {
			cleanup: "COBase4Cleanup",
			detectMsg: "C27_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COHeavyFac-Arti-b2": {
			assembly: "base2HeavyAssembly",
			order: CAM_ORDER_PATROL,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				pos: [
					camMakePos("hoverPos4"),
					camMakePos("hoverPos3"),
					camMakePos("hoverPos2"),
					camMakePos("hoverPos1"),
				],
				interval: camSecondsToMilliseconds(20),
				radius: 16,
				patrolType: CAM_PATROL_CYCLE,
				repair: 33,
			},
			templates: [cTempl.cohbbt, cTempl.comhpvh, cTempl.cohhrah, cTempl.comhath, cTempl.comhpvh]
		},
		"COCyborgFac-b2": {
			assembly: "base2CybAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 40,
			},
			templates: [cTempl.cybth, cTempl.cybag]
		},
		"COCyborgFac-b3": {
			assembly: "base3CybAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.scyac, cTempl.cybla]
		},
		"COHeavyFac-b4": {
			assembly: "base4Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			data: {
				repair: 20,
			},
			templates: [cTempl.cohhrat, cTempl.comhatt, cTempl.cohhct, cTempl.comit, cTempl.comagt]
		},
		"COCyborgFac-b4": {
			assembly: "base4Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.scygr, cTempl.scytk]
		},
		"COVtolFactory-b4": {
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: [cTempl.comhbv, cTempl.comtbv]
		},
	});

	// Rank changes on difficulty:
	// Veteran (SUPEREASY/EASY/MEDIUM)
	// Elite (HARD)
	// Special (INSANE)
	camSetDroidRank(getObject("coCommander"), (difficulty <= MEDIUM) ? 5 : (difficulty + 3));
	coCommander = camManageGroup(camMakeGroup("coCommander"), CAM_ORDER_PATROL, { // Gets new order later
		pos: [
			camMakePos("patrolPos"),
			camMakePos("commandGroup"),
		],
		interval: camSecondsToMilliseconds(40),
		repair: 67
	});
	camMakeRefillableGroup(
		camMakeGroup("commandGroup"), {
			templates: [
				cTempl.cohhrat, cTempl.cohhrat, // Whirlwinds
				cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // HRAs
				cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // Heavy Cannons
				cTempl.comrept, cTempl.comrept, cTempl.comrept, // Repair Turrets
				cTempl.comstriket, // VTOL Strike Turret
				cTempl.comit, cTempl.comit, // Infernos
				cTempl.comhatt, cTempl.comhatt, // Tank Killers (Hard+)
				cTempl.comhatt, cTempl.comhatt, // More Tank Killers (Insane)
			],
			obj: "coCommander",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coCommander",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 33
			}
	});

	// VTOL Turrets
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Tank Killers
				cTempl.comhatv, cTempl.comhatv, cTempl.comhatv, cTempl.comhatv,
			],
			obj: "coVtolStrike",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolStrike",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("base4Assembly"),
				radius: 20
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Assault Guns, 2 Tank Killers
				cTempl.colagv,
				cTempl.comhatv,
				cTempl.colagv,
				cTempl.comhatv,
				cTempl.colagv,
			],
			obj: "coVtolTowerW",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerW",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Assault Cannons, 2 Thermite Bombs
				cTempl.comacv,
				cTempl.comtbv,
				cTempl.comacv,
				cTempl.comtbv,
				cTempl.comacv,
			],
			obj: "coVtolTowerE",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerE",
			suborder: CAM_ORDER_ATTACK
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase1",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckht,
			structset: camAreaToStructSet("COBase1Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase2",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckht,
			structset: camAreaToStructSet("COBase2Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase3",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("COBase3Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase4",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("COBase4Cleanup")
	});

	camAutoReplaceObjectLabel(["coVtolTowerW", "coVtolTowerE"]);

	// Start these factories right away
	camEnableFactory("COVtolFactory-b4");
	camEnableFactory("COHeavyFac-b4");

	//This mission shows you the approximate base locations at the start.
	//These are removed once the base it is close to is seen and is replaced
	//with a more precise proximity blip.
	hackAddMessage("C27_OBJECTIVE1", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("C27_OBJECTIVE2", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("C27_OBJECTIVE3", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("C27_OBJECTIVE4", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("enableFactoriesAndHovers", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("baseThreeVtolAttack", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("aggroCommander", camChangeOnDiff(camMinutesToMilliseconds(8)));

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting slightly and add a slight blue hue
	camSetSunIntensity(.38, .38, .45);
	// Move the sun towards the west
	camSetSunPos(425, -400, 450);
	// Constant rain
	camSetWeather(CAM_WEATHER_RAINSTORM);
}

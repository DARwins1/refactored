include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy02",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy02",
	"R-Wpn-Bomb-Damage01",
	"R-Wpn-Missile-Damage01",
	"R-Defense-WallUpgrade06", "R-Struc-Materials06",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals06", "R-Cyborg-Metals06",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",
	"R-Vehicle-Engine06",
];

function vtolGroupAttack()
{
	camManageGroup(camMakeGroup("COVtolGroup"), CAM_ORDER_ATTACK, {
		regroup: false,
	});
}

function setupLandGroups()
{
	const hovers = enumArea("NWTankGroup", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && obj.propulsion === "hover01"
	));
	const tanks = enumArea("NWTankGroup", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && obj.propulsion !== "hover01"
	));

	camManageGroup(camMakeGroup(hovers), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverPos1"),
			camMakePos("hoverPos2"),
			camMakePos("hoverPos3"),
			camMakePos("hoverPos4"),
		],
		interval: camSecondsToMilliseconds(25),
		repair: 80,
	});

	camManageGroup(camMakeGroup(tanks), CAM_ORDER_ATTACK);

	camManageGroup(camMakeGroup("WCyborgGroup"), CAM_ORDER_ATTACK, {
		fallback: camMakePos("WCybPos"),
		morale: 60,
		radius: 10,
		count: -1
	});
}

function enableFactories()
{
	// Turn it all on
	camEnableFactory("COCyborgFac-b1");
	camEnableFactory("COCyborgFac-b2");
	camEnableFactory("COHeavyFacL-b2");
	camEnableFactory("COHeavyFacR-b2");
	camEnableFactory("COVtolFac-b3");
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.betaEnd, {
		area: "RTLZ",
		reinforcements: camMinutesToSeconds(3),
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
		"COSAM": { tech: "R-Wpn-Missile-LtSAM" }, // Avenger SAM
		"COHeavyFacL-b2": { tech: "R-Wpn-HvyHowitzer" }, // Ground Shaker
	});

	camSetEnemyBases({
		"COBase1": {
			cleanup: "COBase1Cleanup",
			detectMsg: "C28_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBase2": {
			cleanup: "COBase2Cleanup",
			detectMsg: "C28_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBase3": {
			cleanup: "COBase3Cleanup",
			detectMsg: "C28_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COCyborgFac-b1": {
			assembly: "COCyborgFac-b1Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				repair: 40,
				count: -1,
			},
			templates: [cTempl.cybag, cTempl.cybth]
		},
		"COCyborgFac-b2": {
			assembly: "COCyborgFac-b2Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
			},
			templates: [cTempl.scytk, cTempl.scygr, cTempl.scyac]
		},
		"COHeavyFacL-b2": {
			assembly: "COHeavyFacL-b2Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 20,
			},
			templates: [cTempl.cohhct, cTempl.cohbbt, cTempl.cohhct, cTempl.cohhct]
		},
		"COHeavyFacR-b2": {
			assembly: "COHeavyFacR-b2Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				repair: 20,
			},
			templates: [cTempl.comrotmt, cTempl.comsenst, cTempl.cohbalt, cTempl.cohhrat, cTempl.comrotmt, cTempl.comaat]
		},
		"COVtolFac-b3": {
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [cTempl.comhvat, cTempl.comacv]
		},
	});

	camAutoReplaceObjectLabel("coVtolTower");

	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Tank Killers, 3 Assault Guns
				cTempl.comhatv,
				cTempl.colagv,
				cTempl.comhatv,
				cTempl.colagv,
				cTempl.comhatv,
				cTempl.colagv,
			],
			obj: "coVtolTower",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTower",
			suborder: CAM_ORDER_ATTACK
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase1",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck1"),
			structset: camAreaToStructSet("COBase1Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase2",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck2"),
			structset: camAreaToStructSet("COBase2Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase2",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck3"),
			structset: camAreaToStructSet("COBase2Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COBase3",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck4"),
			structset: camAreaToStructSet("COBase3Cleanup")
	});

	queue("setupLandGroups", camChangeOnDiff(camSecondsToMilliseconds(90)));
	queue("vtolGroupAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("enableFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));

	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	// Darken the lighting and add a blue hue
	camSetSunIntensity(.3, .3, .38);
	// Move the sun towards the east
	camSetSunPos(-225, -600, 450);
	// Constant rain
	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);
}

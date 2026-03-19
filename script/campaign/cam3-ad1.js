include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_SILO_PLAYER = 1;
const MIS_GAMMA_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(8));
const mis_nexusRes = [ // NEXUS is maxed-out on upgrades at this point
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage09", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage06", "R-Wpn-AAGun-ROF06", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage06", "R-Wpn-Howitzer-ROF04", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage03",
	"R-Wpn-Missile-Damage03", "R-Wpn-Missile-ROF03", "R-Wpn-Missile-Accuracy02",
	"R-Wpn-Rail-Damage03", "R-Wpn-Rail-ROF03", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage03", "R-Wpn-Energy-ROF03", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade09", "R-Struc-Materials09",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-Factory-Upgrade03", "R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals09", "R-Cyborg-Metals09",
	"R-Vehicle-Armor-Heat06", "R-Cyborg-Armor-Heat06",
	"R-Vehicle-Engine09",
	"R-Sys-NEXUSrepair",
];
const mis_defaultFog = {r:182, g:225, b:236};
const mis_defaultSun = {r:0.5, g:0.5, b:0.5};
var capturedSilos; // victory flag letting us know if we captured any silos.
var mapLimit; //LasSat slowly creeps toward missile silos.
var satData; // Stores data about the LasSat's target, charging sequence, etc.
var gammaCommanderDeathTime;
var gammaRank;

// Increase the size of the LasSat death zone
function expandBlastZone()
{
	// Cap the blast zone to the top 1/2 of the map
	if (mapLimit < (mapHeight / 2))
	{
		// Total tiles = 256; 256 / 2 = 128 tiles.
		// This function is called about every 30 seconds (changes with difficulty).
		// At about 2 tiles per minute, the blast zone reaches max size in about 64 minutes.
		mapLimit++;
	}
}

// Choose a target to fire the LasSat at.
function initLasSat()
{
	const targets = enumArea(0, 0, mapWidth, mapLimit, CAM_HUMAN_PLAYER, false);
	let target;
	if (targets.length)
	{
		const dr = targets.filter((obj) => (obj.type === DROID));
		const st = targets.filter((obj) => (obj.type === STRUCTURE && obj.stattype !== WALL && obj.stattype !== GATE && obj.status === BUILT));

		if (dr.length)
		{
			// Prioritize droids
			target = camRandFrom(dr);
		}
		else if (st.length)
		{
			target = camRandFrom(st);
		}
	}
	
	const chargeDiffs = [ // Charge decrements every 1/10th of a second
		200, // SUPEREASY
		150, // EASY
		100, // MEDIUM
		80, // HARD
		60, // INSANE
	];
	if (camDef(target))
	{
		// We have a target; lock the LasSat onto it
		satData.x = target.x;
		satData.y = target.y;
		satData.targetId = target.id;
		satData.targetType = target.type;
		satData.charge = chargeDiffs[difficulty];
	}
	else if (satData.misfire)
	{
		// No target; if we're set to misfire, start charging a drifting shot at random coordinates
		//Choose random coordinate within the limits.
		satData.x = camRand(mapWidth);
		satData.y = camRand(mapLimit);
		satData.driftX = (camRand(2) === 0);
		satData.driftY = (camRand(2) === 0);
		satData.charge = chargeDiffs[difficulty];
	}

	// Flip this
	satData.misfire = !satData.misfire
}

// Aim and charge the LasSat.
// When the charge reaches 0, fire it.
function laserSatTick()
{
	if (satData.charge < 0)
	{
		// LasSat is idle
		return;
	}

	let target;
	if (camDef(satData.targetId))
	{
		// Check to make sure we can still track the target
		target = getObject(satData.targetType, CAM_HUMAN_PLAYER, satData.targetId);
		if (!camDef(target) || target === null || !camWithinArea(target, {x: 0, x2: mapWidth, y: 0, y2: mapLimit}))
		{
			// Target is either dead, outside of the blast zone, or otherwise unavailable
			// Clear the target and start drifting
			satData.targetId = undefined;
			satData.targetType = undefined;
			satData.driftX = (camRand(2) === 0);
			satData.driftY = (camRand(2) === 0);
		}
		else
		{
			// Update target position
			satData.x = target.x;
			satData.y = target.y;
		}
	}

	if (!camDef(target))
	{
		// Drift the LasSat around the map
		// Make sure the LasSat doesn't drift out of bounds
		if (satData.x <= 0)
		{
			satData.driftX = true;
		}
		else if (satData.x <= mapWidth)
		{
			satData.driftX = false;
		}
		if (satData.y <= 0)
		{
			satData.driftY = true;
		}
		else if (satData.y <= mapLimit)
		{
			satData.driftY = false;
		}

		if (satData.driftX)
		{
			satData.x += 0.2;
		}
		else
		{
			satData.x -= 0.2;
		}
		if (satData.driftY)
		{
			satData.y += 0.2;
		}
		else
		{
			satData.y -= 0.2;
		}
	}

	camUnmarkTiles(CAM_ALL_NON_DEBUG_TILES); // Clear previously marked tiles
	// Mark tiles to show where the LasSat is aiming
	let tiles;
	if (charge >= 80)
	{
		tiles = {x: satData.x, y: satData.y}; // Single dot
	}
	else if (charge >= 50)
	{
		tiles = [ // Cross
			{x: satData.x, y: satData.y},
			{x: satData.x + 1, y: satData.y},
			{x: satData.x - 1, y: satData.y},
			{x: satData.x, y: satData.y + 1},
			{x: satData.x, y: satData.y - 1},
		];
	}
	else if (charge >= 20)
	{
		tiles = [ // "Circle"
			{x: satData.x - 1, y: satData.y - 1, x2: satData.x + 1, y2: satData.y + 1},
			{x: satData.x + 2, y: satData.y},
			{x: satData.x - 2, y: satData.y},
			{x: satData.x, y: satData.y + 2},
			{x: satData.x, y: satData.y - 2},
		];
	}
	else // < 20
	{
		tiles = [ // "Hollow Circle"
			{x: satData.x - 1, y: satData.y - 1},
			{x: satData.x - 1, y: satData.y + 1},
			{x: satData.x + 1, y: satData.y + 1},
			{x: satData.x + 1, y: satData.y - 1},
			{x: satData.x + 2, y: satData.y},
			{x: satData.x - 2, y: satData.y},
			{x: satData.x, y: satData.y + 2},
			{x: satData.x, y: satData.y - 2},
		];
	}

	if (--satData.charge === 0)
	{
		// LasSat is charged; fire!
		laserSatStrike(target);
	}
}

// Fire the LasSat
function laserSatStrike(target)
{
	let effectDelay = false;
	if (camDef(target))
	{
		// We have a target lock, fire the LasSat directly at it
		fireWeaponAtObj("LasSat", target, CAM_NEXUS);
	}
	else
	{
		// No target lock, fire the LasSat at whatever it was aiming at
		fireWeaponAtLoc("LasSat", satData.x, satData.y, CAM_NEXUS, true);

		if (getObject(satData.x, satData.y) !== null)
		{
			// Firing at a location is instant if there's a structure there
			effectDelay = true;
		}
	}

	if (!effectDelay)
	{
		blastEffects();
	}
	else
	{
		queue("effectDelay", camSecondsToMilliseconds(1.5));
	}

	// Reset LasSat data
	// NOTE: Positional data is set when the LasSat chooses a target
	satData.targetId = undefined;
	satData.targetType = undefined;
	satData.charge = -1;
	camUnmarkTiles(CAM_ALL_NON_DEBUG_TILES); // Clear previously marked tiles
}

// Temporarily redden the skies whenever the LasSat fires
function blastEffects()
{
	camSetFog(182, 113, 118);
	camSetSunIntensity(0.5, 0.3, 0.25);

	camGradualFog(camSecondsToMilliseconds(4), mis_defaultFog.r, mis_defaultFog.g, mis_defaultFog.b);
	camGradualSunIntensity(camSecondsToMilliseconds(4), mis_defaultSun.r, mis_defaultSun.g, mis_defaultSun.b);
}

// Returns a list of objects to be targeted by Devastator VTOL strikes
function getStrikeTargets()
{
	// Target any Command Center/Power Generator/Repair Facility/Factory
	let targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
		struct.stattype === HQ || struct.stattype === POWER_GEN ||
		struct.stattype === REPAIR_FACILITY || struct.stattype === FACTORY ||
		struct.stattype === CYBORG_FACTORY || struct.stattype === VTOL_FACTORY
	));

	if (!targets.length)
	{
		// If no target, just attack any non-wall player structure
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
			struct.stattype !== WALL && struct.stattype !== GATE
		));
	}

	return targets;
}

//Donate the silos to the player. Allow capturedSilos victory flag to be true.
function captureSilos()
{
	playSound(cam_sounds.objectiveCaptured);
	hackRemoveMessage("CM3D1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	camAbsorbPlayer(MIS_SILO_PLAYER, CAM_HUMAN_PLAYER);
	capturedSilos = true;
}

function eventDestroyed(obj)
{
	if (obj.player === CAM_NEXUS && obj.type === DROID && obj.droidType === DROID_COMMAND)
	{
		// Mark the time that the commander died
		gammaCommanderDeathTime = gameTime;
	}
}

function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_NEXUS && camDroidMatchesTemplate(droid, cTempl.prhcomht))
	{
		// Gamma commander rebuilt
		addLabel(droid, "gammaCommander");
		camSetDroidRank(droid, gammaRank);
	}
}

// Delay when Gamma can rebuild their commander
function allowGammaCommanderRebuild()
{
	return (difficulty > EASY) && (gameTime >= gammaCommanderDeathTime + MIS_GAMMA_COMMANDER_DELAY) && (enumStruct(CAM_NEXUS, COMMAND_CONTROL).length > 0);
}

//Check if the silos still exist and only allow winning if the player captured them.
function checkMissileSilos()
{
	if (!countStruct("NX-ANTI-SATSite", CAM_HUMAN_PLAYER) && !countStruct("NX-ANTI-SATSite", MIS_SILO_PLAYER))
	{
		return false;
	}

	if (capturedSilos)
	{
		const Y_SCROLL_LIMIT = 140; // About the same number as the one in the Gamma 8 script.
		const safeToWinObjs = enumArea(0, Y_SCROLL_LIMIT, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter((obj) => (
			((obj.type === DROID && obj.droidType === DROID_CONSTRUCT) || (obj.type === STRUCTURE && obj.stattype === FACTORY && obj.status === BUILT))
		));

		if (safeToWinObjs.length > 0)
		{
			return true;
		}
	}

	const siloArea = camMakePos("missileSilos");
	const safe = enumRange(siloArea.x, siloArea.y, 10, ALL_PLAYERS, false);
	const enemies = safe.filter((obj) => (obj.player === CAM_NEXUS));
	const player = safe.filter((obj) => (obj.player === CAM_HUMAN_PLAYER));
	if (!enemies.length && player.length)
	{
		camCallOnce("captureSilos");
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Build a forward base at the silos"));

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	const lz2 = getObject("landingZone2"); //LZ for cam3-4s.
	mapLimit = 1;
	satData = {
		x: -1, y: -1, // Current position of where the LasSat is targetting
		targetId: undefined, // ID of the object the LasSat is tracking; if no target is defined, the LasSat will drift around like a DVD screensaver
		targetType: undefined, // Type of target being tracked (DROID or STRUCTURE)
		driftX: false, driftY: false, // Drift directions; only used if target is undefined
		charge: -1, // How close the LasSat is to firing; decrements until reaching 0; a charge of -1 means the LasSat is not preparing to fire
		misfire: false, // Used to determine if the LasSat should fire a drifting shot if no targets are found
	};

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.gamma8, {
		callback: "checkMissileSilos"
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setNoGoArea(lz2.x, lz2.y, lz2.x2, lz2.y2, CAM_NEXUS);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	camSetArtifacts({
		"NXbase2HeavyFac": { tech: "R-Wpn-Laser02" }, // Pulse Laser
		"NXbase1VtolFacArti": { tech: "R-Wpn-Bomb-Damage03" }, // Advanced Bomb Warhead
		"NXcommandCenter": { tech: "R-Defense-WallUpgrade09" }, // Plascrete Mk3
		"NXvindicator": { tech: "R-Wpn-Missile-HvSAM" }, // Vindicator SAM
		"gammaResearch": { tech: "R-Wpn-AAGun-Damage06" }, // AA HEAP Flak Mk3
		"NXarchEmp": { tech: "R-Wpn-HvArtMissile" }, // Archangel Missile
	});

	setAlliance(CAM_HUMAN_PLAYER, MIS_SILO_PLAYER, true);
	setAlliance(CAM_NEXUS, MIS_SILO_PLAYER, true);

	camSetEnemyBases({
		"NXMainBase": {
			cleanup: "mainBaseCleanup",
			detectMsg: "CM3D1_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NXVtolBase": {
			cleanup: "vtolBaseCleanup",
			detectMsg: "CM3D1_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"gammaRampartsBase": {
			cleanup: "rampartsBaseCleanup",
			detectMsg: "CM3D1_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXMainBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("mainBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXMainBase", // Main base gets two trucks
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("mainBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXVtolBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("vtolBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "gammaRampartsBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.prhtruckht,
			structset: camAreaToStructSet("rampartsBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "gammaRampartsBase", // Ramparts gets two trucks too
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.prhtruckht,
			structset: camAreaToStructSet("rampartsBaseCleanup")
	});

	camSetFactories({
		"NXbase1VtolFacArti": {
			assembly: "NxVtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 67,
			},
			templates: [cTempl.nxhrailv, cTempl.nxmhbv]
		},
		"NXbase1CyborgFac": {
			assembly: "NXb1CybAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 45,
				repairPos: camMakePos("NXb1CybAssembly"),
				count: -1,
			},
			templates: [cTempl.ncyla, cTempl.ncypl]
		},
		"NXbase2HeavyFac1": {
			assembly: "NXb2Assembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: true,
				repair: 60,
				repairPos: camMakePos("missileSiloRetreat"),
				count: -1,
			},
			templates: [cTempl.nxmrailh, cTempl.nxmscouh, cTempl.nxmpulseh, cTempl.nxmlinkh]
		},
		"NXbase2HeavyFac2": {
			assembly: "NXb2Assembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(110)),
			data: {
				regroup: true,
				repair: 40,
				repairPos: camMakePos("missileSiloRetreat"),
				count: -1,
			},
			templates: [cTempl.nxhserh, cTempl.nxhgaush, cTempl.nxhserh, cTempl.nxmsamh]
		},
		"NXbase2CyborgFac1": {
			assembly: "NXb2Assembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 45,
				repairPos: camMakePos("missileSiloRetreat"),
				count: -1,
			},
			templates: [cTempl.ncysc]
		},
		"NXbase2CyborgFac2": {
			assembly: "NXb2Assembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: true,
				repair: 50,
				repairPos: camMakePos("missileSiloRetreat"),
				count: -1,
			},
			templates: [cTempl.ncyne, cTempl.ncyla]
		},
		"gammaFactory1": {
			assembly: "gammaAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 7,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				repair: 75,
			},
			templates: [cTempl.prhhct, cTempl.prhagt, cTempl.prhhct, cTempl.prhraat]
		},
		"gammaFactory2": {
			assembly: "gammaAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				repair: 50,
			},
			templates: [cTempl.prhsensht, cTempl.prhrotmht, cTempl.prhbalht, cTempl.prhrotmht]
		},
		"gammaCybFactory": {
			assembly: "gammaCybAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: true,
				repair: 75,
				count: -1,
			},
			templates: [cTempl.scyhc, cTempl.scygr, cTempl.cybrp]
		},
	});

	camAutoReplaceObjectLabel(["gammaVtolTower", "nxVtolTowerW", "nxVtolTowerE"]);

	camMakeRefillableGroup(
		camMakeGroup("vtolGroup1"), {
			templates: [ // 2 Scourge Missiles, 2 Thermite Bombs
				cTempl.nxlscouv,
				cTempl.nxmtbv,
				cTempl.nxlscouv,
				cTempl.nxmtbv,
			],
			globalFill: true, // There's only 1 VTOL factory on this mission but whatever
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolStrike",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		camMakeGroup("vtolGroup2"), {
			templates: [ // 2 Scourge Missiles, 2 Pulse Lasers
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "gammaVtolTower",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		camMakeGroup("vtolGroup3"), {
			templates: [ // 4 Scourge Missiles, 4 Thermite Bombs
				cTempl.nxlscouv,
				cTempl.nxmtbv,
				cTempl.nxlscouv,
				cTempl.nxmtbv,
				cTempl.nxlscouv,
				cTempl.nxmtbv,
				cTempl.nxlscouv,
				cTempl.nxmtbv,
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolTowerW",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Scourge Missiles, 4 Pulse Lasers
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolTowerE",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Devastators
				cTempl.nxldevv,
				cTempl.nxldevv,
			],
			globalFill: true,
		}, CAM_ORDER_STRIKE, {
			callback: "getStrikeTargets",
			suborder: CAM_ORDER_ATTACK
	});

	gammaCommanderDeathTime = 0;
	// Rank changes on difficulty:
	// Elite (SUPEREASY/EASY/MEDIUM)
	// Special (HARD)
	// Hero (INSANE)
	gammaRank = (difficulty <= MEDIUM) ? 6 : (difficulty + 4);
	camSetDroidRank(getObject("gammaCommander"), gammaRank);
	camMakeRefillableGroup(
		camMakeGroup("gammaCommander"), {
			templates: [cTempl.prhcomht],
			factories: ["gammaFactory1", "gammaFactory2"],
			callback: "allowGammaCommanderRebuild"
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("gammaDefensePos"),
			repair: 75,
			repairPos: camMakePos("missileSiloRetreat"),
			radius: 32 // Big radius
	});
	camMakeRefillableGroup(
		camMakeGroup("commandGroup"), {
			templates: [
				cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, // 4 Mechanics
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc, cTempl.scyhc, // 4 Super HPCs
				cTempl.prhhatht, cTempl.prhhatht, cTempl.prhhatht,
				cTempl.prhhatht, cTempl.prhhatht, cTempl.prhhatht, // 6 Tank Killers
				cTempl.prhraaht, cTempl.prhraaht, cTempl.prhraaht, cTempl.prhraaht, // 4 Whirlwinds
				cTempl.scyhc, cTempl.scyhc, // 2 More Super HPCs (Hard+)
				cTempl.prhhatht, cTempl.prhhatht, // 2 More Tank Killers (Insane)
			],
			factories: ["gammaFactory1", "gammaFactory2", "gammaCybFactory"]
			obj: "gammaCommander"
		}, CAM_ORDER_FOLLOW, {
			leader: "gammaCommander",
			suborder: CAM_ORDER_DEFEND,
			repair: 75,
			data: {
				pos: camMakePos("gammaDefensePos"),
				radus: 22,
				repair: 75
			}
		}
	);

	camManageGroup(camMakeGroup("NXpatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("northPos1"),
			camMakePos("northPos2"),
			camMakePos("northPos3"),
		],
		interval: camSecondsToMilliseconds(25),
		repair: 80,
		repairPos: camMakePos("missileSiloRetreat")
	});

	camPlayVideos([{video: "MB3_AD1_MSG", type: CAMP_MSG}, {video: "MB3_AD1_MSG2", type: CAMP_MSG}, {video: "MB3_AD1_MSG3", type: MISS_MSG}]);
	hackAddMessage("CM3D1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);

	// Turn everything on immediately :P
	camEnableFactory("NXbase1VtolFacArti");
	camEnableFactory("NXbase1CyborgFac");
	camEnableFactory("NXbase2HeavyFac1");
	camEnableFactory("NXbase2HeavyFac2");
	camEnableFactory("NXbase2CyborgFac1");
	camEnableFactory("NXbase2CyborgFac2");
	camEnableFactory("gammaFactory1");
	camEnableFactory("gammaFactory2");
	camEnableFactory("gammaCybFactory");

	// LasSat logic
	setTimer("initLasSat", camSecondsToMilliseconds(60)); // Target choosing
	setTimer("laserSatTick", camSecondsToMilliseconds(0.1)); // Aiming & firing logic
	setTimer("expandBlastZone", camChangeOnDiff(camSecondsToMilliseconds(30))); // Expand the LasSat's domain
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_Y_SCROLL_LIMIT = 137;
const mis_blastYLimits = {
	preRes: 155,
	postRes: 180,
	code1: 210,
	code2: 228
};
const mis_nexusRes = [
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
const mis_vtolPositions = [
	"vtolAppearPosW", "vtolAppearPosE",
];
const mis_researchTargets = {
	missileCode1: "R-Comp-MissileCodes01",
	missileCode2: "R-Comp-MissileCodes02",
	missileCode3: "R-Comp-MissileCodes03",
	resistance: "R-Sys-Resistance"
};
const mis_defaultFog = {r:182, g:225, b:236};
const mis_defaultSun = {r:0.5, g:0.5, b:0.5};
var winFlag;
var mapLimit;
var lastResCheckFailed, playerWarned;
var videoInfo; //holds some info about when to play a video.
var truckJob1;
var truckJob2;
var nxHarassGroup;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_NEXUS);
});

// Check the status of the player's research facilities
// Warn the player if the silo research is stalled
function checkResearchStalled()
{
	if (winFlag)
	{
		return; // No need to check anything
	}

	const res1 = getResearch(mis_researchTargets.missileCode1);
	const res2 = getResearch(mis_researchTargets.missileCode2);
	const res3 = getResearch(mis_researchTargets.missileCode3);
	const res4 = getResearch(mis_researchTargets.resistance);

	if ((res1.started && !res1.done) ||
		(res2.started && !res2.done) ||
		(res3.started && !res3.done) ||
		(res4.started && !res4.done))
	{
		// Research is in progress...
		// Check to make sure that at least one research facility is alive and working
		let working = false;
		const labs = enumStruct(CAM_HUMAN_PLAYER, RESEARCH_LAB);

		for (const lab of labs)
		{
			if (!structureIdle(lab))
			{
				working = true;
			}
		}

		if (!working)
		{
			if (!lastResCheckFailed)
			{
				// This check failed, mark it and remember for the next check
				lastResCheckFailed = true;
			}
			else if (!playerWarned) // Don't spam the player with warnings
			{
				// This check and the previous one failed, warn the player that they're not progressing
				console(_("----- CRITICAL RESEARCH STALLED -----"));
				playSound(cam_sounds.errorBeep);
				playerWarned = true;
			}
		}
		else
		{
			// This check passed, reset vars
			lastResCheckFailed = false;
			playerWarned = false;
		}
	}
}

// Increase the size of the LasSat death zone
function expandBlastZone()
{
	// Cap the blast zone to a maximum based off of what the player has researched
	let yMax = mis_blastYLimits.preRes;
	if (getResearch(mis_researchTargets.missileCode2).done)
	{
		yMax = mis_blastYLimits.code2;
	}
	else if (getResearch(mis_researchTargets.missileCode1).done)
	{
		yMax = mis_blastYLimits.code1;
	}
	else if (getResearch(mis_researchTargets.resistance).done)
	{
		yMax = mis_blastYLimits.postRes;
	}

	if (mapLimit <= yMax)
	{
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
	clearLasSatData();
}

// Temporarily redden the skies whenever the LasSat fires
function blastEffects()
{
	camSetFog(182, 113, 118);
	camSetSunIntensity(0.5, 0.3, 0.25);

	camGradualFog(camSecondsToMilliseconds(4), mis_defaultFog.r, mis_defaultFog.g, mis_defaultFog.b);
	camGradualSunIntensity(camSecondsToMilliseconds(4), mis_defaultSun.r, mis_defaultSun.g, mis_defaultSun.b);
}

function clearLasSatData()
{
	// NOTE: Positional data is set when the LasSat chooses a target
	satData.targetId = undefined;
	satData.targetType = undefined;
	satData.charge = -1;
	camUnmarkTiles(CAM_ALL_NON_DEBUG_TILES); // Clear previously marked tiles
}

//Setup Nexus VTOL hit and runners. Choose a random spawn point for the VTOLs.
function vtolAttack()
{
	const list = [cTempl.nxmhbv, cTempl.nxmtbv];
	const ext = {limit: [4, 4], alternate: true, altIdx: 0};
	camSetVtolData(CAM_NEXUS, mis_vtolPositions, "vtolRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(3)), undefined, ext);
	queue("wave2", camChangeOnDiff(camSecondsToMilliseconds(30)));
	queue("wave3", camChangeOnDiff(camSecondsToMilliseconds(60)));
}

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// Thermite Bombs, Rail Guns, HEAP Bombs and Pulse Lasers
	const templates = [cTempl.nxmtbv, cTempl.nxhrailv, cTempl.nxmhbv, cTempl.nxlpulsev];
	const ext = {
		limit: [3, 2, 3, 4],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, mis_vtolPositions, "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "NXcommandCenter", ext);
}

// Focus on important player structures
function vtolDevastatorStrike()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// Devastator and HEAP Bombs (yes I know the function is called "vtolDevastatorStrike")
	const templates = [cTempl.nxldevv, cTempl.nxmhbv];
	const ext = {
		limit: [2, 3],
		alternate: true,
		dynamic: true,
		callback: "getDevastatorTargets" // Used to get targets for VTOL strikes
	};
	camSetVtolData(CAM_THE_COLLECTIVE, mis_vtolPositions, "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "NXcommandCenter", ext);
}

// Focus on important player units
function vtolScourgeStrike()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// Scourges only
	const templates = [cTempl.nxlscouv];
	const ext = {
		limit: [3],
		alternate: true,
		dynamic: true,
		callback: "getScourgeTargets" // Used to get targets for VTOL strikes
	};
	camSetVtolData(CAM_THE_COLLECTIVE, mis_vtolPositions, "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "NXcommandCenter", ext);
}

// Returns a list of objects to be targeted by Devastator VTOL strikes
function getDevastatorTargets()
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

// Returns a list of objects to be targeted by Scourge VTOL strikes
function getScourgeTargets()
{
	// Target any commander/truck/sensor
	let targets = enumDroid(CAM_HUMAN_PLAYER).filter((droid) => (
		(droid.droidType === DROID_CONSTRUCT && droid.propulsion !== "CyborgLegs") ||
		droid.droidType === DROID_COMMAND || droid.droidType === DROID_SENSOR
	));

	if (!targets.length)
	{
		// If no target, just attack any non-cyborg droid
		targets = enumDroid(CAM_HUMAN_PLAYER).filter((droid) => (
			droid.propulsion !== "CyborgLegs"
		));
	}

	return targets;
}

// Choose a random spawn point to send ground reinforcements.
function phantomFactorySpawn()
{
	const NEXUS_UNIT_LIMIT = 60;
	if (countDroid(DROID_ANY, CAM_NEXUS) > NEXUS_UNIT_LIMIT)
	{
		return; // Too many units already on the map
	}

	const phantomFactory = camRandFrom(["phantomFacNorth", "phantomFacWest", "phantomFacMiddle", "phantomFacEast"]);

	let templatePools = [
		[ // Cyborgs + Seraphs
			cTempl.ncypl, cTempl.ncysc, cTempl.ncyla,
			cTempl.nxhserh,
		],
		[ // Pulse Lasers + Plasmite Flamers
			cTempl.nxmpulseh, cTempl.nxmplash
		],
		[ // Rail Guns + Scourges
			cTempl.ncysc, cTempl.ncyla,
			cTempl.nxmscouh, cTempl.nxmrailh
		],
		[ // NEXUS Link + Cyborgs
			cTempl.ncyne, cTempl.ncyla,
			cTempl.nxmlinkh,
		],
	];

	// Choose one of the above pools to pull templates from
	const chosenPool = camRandFrom(templatePools);
	const droids = [];
	const NUM_DROIDS = (difficulty >= INSANE) ? 10 : 8;
	for (let j = 0; j < NUM_DROIDS; j++)
	{
		droids.push(camRandFrom(chosenPool));
	}

	// Always include a Vindicator
	droids.push(cTempl.nxmsamh);
	if (getResearch(mis_researchTargets.missileCode1).done)
	{
		droids.push(cTempl.nxhgaush); // Add Gauss Cannon
	}

	// First, send the attack wave.
	camSendReinforcement(CAM_NEXUS, getObject(phantomFactory), droids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_ATTACK,
		data: {
			repair: 60, // Fall back to the entrance to heal
			repairPos: camMakePos(phantomFactory)
		}
	});

	// Second, send droids to refill the harassment group
	const replacements = camSendReinforcement(CAM_NEXUS, getObject(phantomFactory), camGetRefillableGroupTemplates(nxHarassGroup), CAM_REINFORCE_GROUND);
	camAssignToRefillableGroups(enumGroup(replacements), nxHarassGroup);

	// Third, send an LZ truck
	let job = truckJob1; // East LZ
	if (phantomFactory === "phantomFacWest")
	{
		job = truckJob2; // West LZ
	}
	sendLZTrucks(phantomFactory, job);
}

// Send trucks to attempt building NEXUS LZs
function sendLZTrucks(entrance, truckJob)
{
	// Don't send a truck if there's already one working on this LZ
	if (!camGetTruck(truckJob))
	{
		const tPos = camMakePos(entrance);
		const tTemp = cTempl.prhtruckht;
		camAssignTruck(camAddDroid(CAM_NEXUS, tPos, tTemp), truckJob);
	}
}

//Send Nexus transport units
function sendNXTransporter()
{
	// Randomly choose a built LZ
	const lzPositions = [];
	if (!camBaseIsEliminated("NXLZEast"))
	{
		lzPositions.push(camMakePos("nxETransPos"));
	}
	if (!camBaseIsEliminated("NXLZWest"))
	{
		lzPositions.push(camMakePos("nxWTransPos"));
	}

	if (lzPositions.length)
	{
		camSendReinforcement(CAM_NEXUS, camRandFrom(lzPositions), getDroidsForNXLZ(), CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("vtolAppearPosE"),
			exit: camMakePos("vtolAppearPosW")
		});
	}
}

// This is the same as Gamma 5
function getDroidsForNXLZ()
{
	const COUNT = 10;
	const USE_ARTILLERY = camRand(2) === 0;
	let units;
	if (USE_ARTILLERY)
	{
		units = [cTempl.prhbalht, cTempl.prhhellht];
	}
	else
	{
		units = [cTempl.prhhct, cTempl.prhagt, cTempl.prhhatt, cTempl.scyhc, cTempl.scytk];
	}

	const droids = [];
	for (let i = 0; i < COUNT; ++i)
	{
		droids.push(camRandFrom(units));
	}

	if (USE_ARTILLERY)
	{
		// Make sure there's a sensor with the group
		droids.pop();
		droids.push(cTempl.prhsensht);
	}

	return droids;
}

//Play videos and allow winning once the final one is researched.
function eventResearched(research, structure, player)
{
	for (let i = 0, l = videoInfo.length; i < l; ++i)
	{
		if (research.name === videoInfo[i].res && !videoInfo[i].played)
		{
			videoInfo[i].played = true;
			camPlayVideos({video: videoInfo[i].video, type: videoInfo[i].type});
			if (videoInfo[i].res === mis_researchTargets.resistance)
			{
				enableResearch(mis_researchTargets.missileCode1, CAM_HUMAN_PLAYER);
			}
			else if (videoInfo[i].res === mis_researchTargets.missileCode3)
			{
				winFlag = true;

				// Halt attack waves
				removeTimer("phantomFactorySpawn");
				removeTimer("sendNXTransporter");
				camSetVtolData(false); // Disable all VTOL attacks

				// Disable the LasSat
				removeTimer("initLasSat");
				removeTimer("laserSatTick");
				removeTimer("expandBlastZone");
				clearLasSatData();
			}
		}
	}
}

//For checking when the five minute delay is over.
function setupMission()
{
	camPlayVideos({video: "MB3_AD2_MSG2", type: CAMP_MSG});
	setMissionTime(-1); // Remove the mission timer

	phantomFactorySpawn();
	setTimer("phantomFactorySpawn", camChangeOnDiff(camMinutesToMilliseconds(2)));
	setTimer("sendNXTransporter", camChangeOnDiff(camMinutesToMilliseconds(3)))
	queue("vtolAttack", camChangeOnDiff(camSecondsToMilliseconds(10)));
	queue("vtolDevastatorStrike", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("vtolScourgeStrike", camChangeOnDiff(camMinutesToMilliseconds(12)));

	// LasSat logic
	setTimer("initLasSat", camSecondsToMilliseconds(60)); // Target choosing
	setTimer("laserSatTick", camSecondsToMilliseconds(0.1)); // Aiming & firing logic
	setTimer("expandBlastZone", camChangeOnDiff(camSecondsToMilliseconds(15))); // Expand the LasSat's domain
}

//Check if the silos still exist and only allow winning if the player captured them.
//NOTE: Being in cheat mode disables the extra failure condition.
function checkMissileSilos()
{
	if (winFlag)
	{
		return true;
	}

	if (!camIsCheating() && !countStruct("NX-ANTI-SATSite", CAM_HUMAN_PLAYER))
	{
		return false;
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Protect the missile silos and research for the missile codes"));

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	mapLimit = 137.0;
	winFlag = false;
	lastResCheckFailed = false;
	playerWarned = false;
	videoInfo = [
		{played: false, video: "MB3_AD2_MSG3", type: MISS_MSG, res: mis_researchTargets.resistance},
		{played: false, video: "MB3_AD2_MSG4", type: CAMP_MSG, res: mis_researchTargets.missileCode1},
		{played: false, video: "MB3_AD2_MSG5", type: CAMP_MSG, res: mis_researchTargets.missileCode2},
		{played: false, video: "MB3_AD2_MSG6", type: CAMP_MSG, res: mis_researchTargets.missileCode3},
	];

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.gammaEnd.pre, {
		callback: "checkMissileSilos"
	});

	setScrollLimits(0, MIS_Y_SCROLL_LIMIT, 64, 256);

	// NEXUS LZs
	camSetEnemyBases({
		"NXLZEast": {
			cleanup: "eastLZStructs",
			detectMsg: "CM3D2_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS // We need these in case the player already has structures here
		},
		"NXLZWest": {
			cleanup: "westLZStructs",
			detectMsg: "CM3D2_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS
		},
	});

	truckJob1 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZEast",
			rebuildBase: true,
			structset: camGammaNXLZStructsE
	});
	truckJob2 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZWest",
			rebuildBase: true,
			structset: camGammaNXLZStructsNE
	});

	nxHarassGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.nxmsensh, // 1 Sensor
				cTempl.nxhserh, cTempl.nxhserh, cTempl.nxhserh, cTempl.nxhserh, // 4 Seraphs
				cTempl.nxmdevh, cTempl.nxmdevh, // 2 Devastators
				cTempl.nxhserh, cTempl.nxhserh, // 2 Vindicators
			],
		}, CAM_ORDER_ATTACK, {
			repair: 80,
			repairPos: camMakePos("phantomFacNorth"),
			regroup: true,
			count: -1
	});

	//Destroy everything above limits
	const destroyZone = enumArea(0, 0, 64, MIS_Y_SCROLL_LIMIT, CAM_HUMAN_PLAYER, false);
	for (let i = 0, l = destroyZone.length; i < l; ++i)
	{
		camSafeRemoveObject(destroyZone[i], false);
	}

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camMinutesToSeconds(5));
	queue("setupMission", camMinutesToMilliseconds(5) - camSecondsToMilliseconds(2));
	enableResearch(mis_researchTargets.resistance, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	camPlayVideos({video: "MB3_AD2_MSG", type: MISS_MSG});

	setTimer("checkResearchStalled", camSecondsToMilliseconds(5));
}

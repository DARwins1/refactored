include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage08", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage05", "R-Wpn-AAGun-ROF05", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage06", "R-Wpn-Howitzer-ROF04", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage02",
	"R-Wpn-Missile-Damage02", "R-Wpn-Missile-ROF02", "R-Wpn-Missile-Accuracy01",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF02", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage02", "R-Wpn-Energy-ROF02", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade09", "R-Struc-Materials09",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals08", "R-Cyborg-Metals08",
	"R-Vehicle-Armor-Heat05", "R-Cyborg-Armor-Heat05",
	"R-Vehicle-Engine08",
	"R-Sys-NEXUSrepair",
];
const mis_hackedProductionName = "???"; // The name of all NEXUS units built from player factories
var winFlag;
var lastResCheckFailed, playerWarned;
var playerTrueColour, nxTrueColour;
var hackIdx;
var truckJob1;
var truckJob2;
var truckJob3;
var truckJob4;
var truckJob5;

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
// Warn the player if the resistance circuits research is stalled
function checkResearchStalled()
{
	if (winFlag)
	{
		return; // No need to check anything
	}

	const res1 = getResearch(cam_resistance_circuits.first);
	const res2 = getResearch(cam_resistance_circuits.second);
	const res3 = getResearch(cam_resistance_circuits.third);

	if ((!res1.started && !res1.done) ||
		(res1.done && !res2.started && !res2.done) ||
		(res2.done && !res3.started && !res3.done))
	{
		// No research is in progress!
		if (!lastResCheckFailed)
		{
			// This check failed, mark it and remember for the next check
			lastResCheckFailed = true;
		}
		else if (!playerWarned) // Don't spam the player with warnings
		{
			// This check and the previous one failed, warn the player that they're not progressing
			console(_("----- CRITICAL RESEARCH STALLED -----"));
			playSound(cam_sounds.beacon);
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

// Send NEXUS ground groups
// If Resistance Mk2 is researched, send two groups and trucks
function sendEdgeMapDroids()
{
	const entrances = [
		"EPhantomFactory",
		"NEPhantomFactory1",
		"NEPhantomFactory2",
		"NWPhantomFactory",
		"SWPhantomFactory",
		"SPhantomFactory",
	];
	const truckJobs = [ // NOTE: Truck jobs are paired with entrances
		truckJob1,
		truckJob2,
		truckJob2,
		truckJob3,
		truckJob4,
		truckJob5,
	];

	let NUM_GROUPS = (getResearch(cam_resistance_circuits.second).done) ? 2 : 1;
	for (let i = 0; i < NUM_GROUPS; i++)
	{
		let templatePools = [
			[ // Cyborgs + Seraphs
				cTempl.ncypl, cTempl.ncysc, cTempl.ncyla,
				cTempl.nxhserh,
			],
			[ // Flashlights + Plasmite Flamers
				cTempl.nxlflash, cTempl.nxmplash
			],
			[ // Rail Guns + Scourges
				cTempl.ncysc, cTempl.ncyla,
				cTempl.nxmscouh, cTempl.nxmrailh
			],
		];
		if (getResearch(cam_resistance_circuits.second).done)
		{
			templatePools.push([ // Devastator + Seraphs + Plasmite Flamers
				cTempl.nxmplash, cTempl.nxmdevh, cTempl.nxhserh, 
			]);
		}

		// Choose one of the above pools to pull templates from
		const chosenPool = camRandFrom(templatePools);
		const droids = [];
		const NUM_DROIDS = (difficulty >= INSANE) ? 10 : 8;
		for (let j = 0; j < NUM_DROIDS; j++)
		{
			droids.push(camRandFrom(chosenPool));
		}
		// Always include a NEXUS Link turret and a Vindicator
		droids.push(cTempl.nxmlinkh, cTempl.nxmsamh);

		// Choose an entrance to arrive from, then send the droids
		const INDEX = camRand(entrances.length);
		camSendReinforcement(CAM_NEXUS, getObject(entrances[INDEX]), droids, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 60, // Fall back to the entrance to heal
				repairPos: camMakePos(entrances[INDEX])
			}
		});

		if (getResearch(cam_resistance_circuits.second).done)
		{
			// Send in a truck to build an LZ
			sendLZTrucks(entrances[INDEX], truckJobs[INDEX]);
		}

		// Don't choose the same entrance again
		entrances.splice(INDEX, 1);
		truckJobs.splice(INDEX, 1);
	}
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
	// Choose a built LZ (prioritizing ones closer to the player's base)
	let pos;
	if (!camBaseIsEliminated("NXLZSouth"))
	{
		pos = camMakePos("nxSTransPos");
	}
	else if (!camBaseIsEliminated("NXLZWest"))
	{
		pos = camMakePos("nxWTransPos");
	}
	else if (!camBaseIsEliminated("NXLZEast"))
	{
		pos = camMakePos("nxETransPos");
	}
	else if (!camBaseIsEliminated("NXLZNorthWest"))
	{
		pos = camMakePos("nxNWTransPos");
	}
	else if (!camBaseIsEliminated("NXLZNorthEast"))
	{
		pos = camMakePos("nxNETransPos");
	}
	else 
	{
		return; // No LZs built :(
	}

	camSendReinforcement(CAM_NEXUS, camMakePos(pos), getDroidsForNXLZ(), CAM_REINFORCE_TRANSPORT, {
		entry: camGenerateRandomMapEdgeCoordinate(),
		exit: camGenerateRandomMapEdgeCoordinate()
	});
}

// This is the almost the same as Gamma 3
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

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// HEAP Bombs, Scourge Missiles and Flashlights
	const templates = [cTempl.nxmhbv, cTempl.nxlscouv, cTempl.nxlflasv];
	const ext = {
		limit: [2, 3, 4],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_NEXUS, ["vtolAppearPos1", "vtolAppearPos2"], "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), undefined, ext);
}

// Focus on important player structures
function vtolStrike()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// Devastators
	const ext = {
		limit: [2],
		alternate: true,
		dynamic: true,
		callback: "getDevastatorTargets" // Used to get targets for VTOL strikes
	};
	camSetVtolData(CAM_NEXUS, ["vtolAppearPos1", "vtolAppearPos2"], "vtolRemoveZone", [cTempl.nxldevv], camChangeOnDiff(camMinutesToMilliseconds(1)), undefined, ext);
}

// Returns a list of objects to be targeted by Devastator VTOL strikes
function getDevastatorTargets()
{
	// Target any Research Facility/Command Center/Power Generator/Repair Facility
	let targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
		struct.stattype === RESEARCH_LAB || struct.stattype === HQ ||
		struct.stattype === POWER_GEN || struct.stattype === REPAIR_FACILITY
	));

	if (!targets.length)
	{
		// If no target, just attack any non-wall player structure
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
			struct.stattype !== WALL && struct.stattype !== GATE
		));
	}

	// NOTE: If the target list is empty/undefined, these VTOLs will just execute a normal CAM_ORDER_ATTACK
	return targets;
}

// This mission can be broken down into 4 stages:
// Stage 1 (No resistance): NEXUS hacking only
// No enemy ground or air attacks.
// Stage 2 (Resistance Mk1): Ground and air attacks start.
// Hacking slows down a bit.
// Stage 3 (Resistance Mk2): Devastator strikes and LZ trucks start arriving.
// Hacking slows down further.
// Stage 4 (Resistance Mk3): All hacking and attack waves stop.
// Player can win once all remaining enemies are cleaned up.
function eventResearched(research, structure, player)
{
	if (!camDef(structure) || !structure)
	{
		return;
	}
	if (research.name === cam_resistance_circuits.first)
	{
		// Set up ground and air attacks
		queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
		queue("sendEdgeMapDroids", camSecondsToMilliseconds(15));
		setTimer("sendEdgeMapDroids", camChangeOnDiff(camMinutesToMilliseconds(1.25)));
	}
	else if (research.name === cam_resistance_circuits.second)
	{
		// Set up Devastator strikes
		queue("vtolStrike", camChangeOnDiff(camMinutesToMilliseconds(1)));

		// Check all of the player's factories for hacked templates in progress
		const factories = enumStruct(CAM_HUMAN_PLAYER, FACTORY).concat(enumStruct(CAM_HUMAN_PLAYER, CYBORG_FACTORY), enumStruct(CAM_HUMAN_PLAYER, VTOL_FACTORY));
		for (const factory of factories)
		{
			if (!structureIdle(factory) && getDroidProduction(factory).name === mis_hackedProductionName)
			{
				// Replace the hacked template with a mundane one
				let template;
				switch (factory.stattype)
				{
					case FACTORY:
						template = cTempl.prlmgw;
						break;
					case CYBORG_FACTORY:
						template = cTempl.cybmg;
						break;
					case FACTORY:
						template = cTempl.prlmgv;
						break;
				}

				// This might be one of the wackiest things I've ever scripted, but since there doesn't seem to be a way to cancel production 
				// through the JS API, this'll just have to do.
				// I guess it's not stupid if it works.
				buildDroid(factory, camNameTemplate(template), template.body, template.prop, "", "", template.weap);
			}
		}
	}
	else if (research.name === cam_resistance_circuits.third)
	{
		// Stop all ground and air attacks
		removeTimer("sendEdgeMapDroids");
		removeTimer("sendNXTransporter");
		camSetVtolSpawnStateAll(false); // Stop VTOL attacks

		winFlag = true;
		camSetNexusState(false);
		colourReset();
	}
}

// NEXUS hacking chooses a player unit or structure and does the following:
// Factory (Idle): Start building a special NEXUS unit. The unit is donated to NEXUS once fully built. ("Production completed")
// Factory (Busy): Destroy it. ("Structure neutralized")
// Research (Idle): Destroy it. ("Structure neutralized")
// Research (Busy): Absorb it. ("Research absorbed")
// Truck: Absorb it and assign it to an LZ. ("Unit absorbed")
// Unit (low rank): Absorb it. ("Unit absorbed")
// Unit (high rank): Attack it with EMP. ("Unit neutralized")
// Misc. structure: Absorb it and all structures adjacent to it. ("Structure absorbed"/"Defenses absorbed")
// 
// Unit absorption is disabled after Resistance Mk1 (all units are stunned instead).
// Structure absorption is disabled after Resistance Mk2 (structures are destroyed instead, adjacent structures are unaffected).
// All hacking stops after Resistance Mk3.
// NOTE: VTOLs that are EMP'd freeze where they are, but this looks really silly if they're already in the air.
// So we'll only EMP VTOLs that are landed (DACTION_NONE or DACTION_WAITDURINGREARM)
function hackPlayer()
{
	hackIdx++;

	if (getResearch(cam_resistance_circuits.third).done)
	{
		// No more hacking
		removeTimer("hackPlayer");
		return;
	}
	else if (getResearch(cam_resistance_circuits.second).done && (hackIdx % 3) !== 0)
	{
		return; // If Resistance Mk2 is done, fail 2/3 times
	}
	else if (getResearch(cam_resistance_circuits.first).done && (hackIdx % 2) !== 0)
	{
		return; // If Resistance Mk1 is done, fail 1/2 times
	}

	let target;
	let sound;
	const DACTION_NONE = 0;
	const DACTION_WAITDURINGREARM = 35;
	switch (camRand(4))
	{
		case 0: // Target a Factory (any type)
			const factories = enumStruct(CAM_HUMAN_PLAYER, FACTORY).concat(enumStruct(CAM_HUMAN_PLAYER, CYBORG_FACTORY), enumStruct(CAM_HUMAN_PLAYER, VTOL_FACTORY));
			if (!factories.length)
			{
				return;
			}
			target = camRandFrom(factories); // Choose a random factory
			if (!getResearch(cam_resistance_circuits.second).done && structureIdle(target))
			{
				nexusManufacture(target); // Start building a NEXUS unit under the player's nose
				// No sound; we're trying to be sneaky here :P
			}
			else if (!structureIdle(target) && !getDroidProduction(target).propulsion.includes("02")) // Don't blow up a factory that is already building for NEXUS
			{
				camSafeRemoveObject(target, true); // Blow it up
				sound = cam_sounds.nexus.structureNeutralized;
			}
			break;
		case 1: // Target a Research Facility
			const labs = enumStruct(CAM_HUMAN_PLAYER, RESEARCH_LAB);
			if (!labs.length)
			{
				return;
			}
			if (camRand(labs.length + 2) <= 1) // 2 / (*number of research labs* + 2) chance of failing here
			{
				// Do this to avoid breaking the player's research labs faster than they can build them
				return;
			}
			target = camRandFrom(labs); // Choose a random lab
			if (structureIdle(target))
			{
				camSafeRemoveObject(target, true); // Blow it up
				sound = cam_sounds.nexus.structureNeutralized;
			}
			else
			{
				if (!getResearch(cam_resistance_circuits.second).done)
				{
					absorbObject(target); // Take it
				}
				else
				{
					camSafeRemoveObject(target, true); // Blow it up
					sound = cam_sounds.nexus.structureNeutralized;
				}
			}
			break;
		case 2: // Target a unit (any type)
			const units = enumDroid(CAM_HUMAN_PLAYER);
			if (!units.length)
			{
				return;
			}
			target = camRandFrom(units); // Choose a random droid
			if (!getResearch(cam_resistance_circuits.first).done && camGetDroidRank(target) < 3) // Below "Regular"
			{
				absorbObject(target); // Take it
			}
			else if (!target.isVTOL || (target.isVTOL && (target.action === DACTION_NONE || target.action === DACTION_WAITDURINGREARM)))
			{
				fireWeaponAtObj("EMP-Cannon", target, CAM_NEXUS); // Stun it
				sound = cam_sounds.nexus.unitNeutralized; // Yes, I know this stretches the definition of "neutralized"
			}
			break;
		case 3: // Target a structure (any type)
			const structs = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (struct.stattype !== WALL && struct.stattype !== GATE));
			if (!structs.length)
			{
				return;
			}
			target = camRandFrom(structs); // Choose a random (non-wall) structure
			if (!getResearch(cam_resistance_circuits.second).done)
			{
				// Capture everything around the target
				const RADIUS = (difficulty < INSANE) ? 2 : 3;
				const targetStructs = enumRange(target.x, target.y, RADIUS, CAM_HUMAN_PLAYER, false).filter((obj) => (obj.type === STRUCTURE));
				for (const struct of targetStructs)
				{
					absorbObject(struct); // Take it all
				}
			}
			else
			{
				camSafeRemoveObject(target, true); // Blow it up

				if (target.stattype === DEFENSE)
				{
					sound = cam_sounds.nexus.defensesNeutralized;
				}
				else
				{
					sound = cam_sounds.nexus.structureNeutralized;
				}
			}
			break;
	}

	// Play a sound if applicable
	if (camDef(sound))
	{
		playSound(sound);
		queue("camNexusLaugh", camSecondsToMilliseconds(1.5));
	}
}

function nexusManufacture(factory)
{
	if (countDroid(DROID_ANY, CAM_NEXUS) > 100)
	{
		return;
	}
	let temps;
	switch (factory.stattype)
	{
		case FACTORY:
			temps = [cTempl.nxmrailh, cTempl.nxmlinkh, cTempl.nxmscouh, cTempl.nxlflash, cTempl.nxhserh, cTempl.nxmplash];
			break;
		case CYBORG_FACTORY:
			temps = [cTempl.ncyne, cTempl.ncysc, cTempl.ncyla, cTempl.ncypl];
			break;
		case VTOL_FACTORY:
			temps = [cTempl.nxlscouv, cTempl.nxmtbv, cTempl.nxmhbv, cTempl.nxlflasv, cTempl.nxlneedv];
			break;
		default:
			return; // How did we get here???
	}

	let additive = "";
	if (factory.stattype !== CYBORG_FACTORY)
	{
		// Since we're making components "available" to the player, we'll use special (non-designable) versions that can't be accessed in the design menu.
		// That way the player doesn't get to use these components in their own designs.
		// NOTE: We don't need to worry about propulsions because Mk2 propulsions are all undesignable.
		// NOTE 2: We also don't need to worry about any cyborg components.
		// NOTE 3: A lot of these components ARE normally available to the player at this point if they've been keeping up with research,
		// but to be thorough, we'll use the alternate components to avoid any weirdness if the player has been slacking on research for some reason.
		additive = "-ND";
	}

	const template = camRandFrom(temps);
	makeComponentAvailable(template.body + additive, CAM_HUMAN_PLAYER);
	makeComponentAvailable(template.prop, CAM_HUMAN_PLAYER);
	makeComponentAvailable(template.weap + additive, CAM_HUMAN_PLAYER);
	buildDroid(factory, "???", template.body + additive, template.prop, "", "", template.weap + additive);
}

// Try donating an object to NEXUS.
// If that can't be done, explode it.
function absorbObject(obj)
{
	if (!donateObject(obj, CAM_NEXUS))
	{
		camSafeRemoveObject(obj, true); // Explode it then.
	}
}

// If NEXUS successfully builds a hacked template from a player factory, take the droid once it's built
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.name === mis_hackedProductionName)
	{
		absorbObject(droid);
		playSound(cam_sounds.nexus.productionCompleted);
	}
}

function eventObjectTransfer(obj, from)
{
	if (obj.player === CAM_NEXUS && from === CAM_HUMAN_PLAYER && obj.type === DROID)
	{
		if (obj.droidType === DROID_CONSTRUCT) // Assign this truck to an LZ if possible
		{
			const jobPositions = [
				{job: truckJob1, pos: camMakePos("nxETransPos")},
				{job: truckJob2, pos: camMakePos("nxNETransPos")},
				{job: truckJob3, pos: camMakePos("nxNWTransPos")},
				{job: truckJob4, pos: camMakePos("nxWTransPos")},
				{job: truckJob5, pos: camMakePos("nxSTransPos")},
			];
			jobPositions.sort(function(a, b) { // Sort jobs by distance from the truck
				return distBetweenTwoPoints(obj.x, obj.y, a.pos.x, a.pos.y) - distBetweenTwoPoints(obj.x, obj.y, b.pos.x, b.pos.y);
			});

			// Run through the job list and assign the truck to the first empty job we find
			for (const jobPosition of jobPositions)
			{
				if (!camGetTruck(jobPosition.job))
				{
					// Hired!
					camAssignTruck(obj, jobPosition.job);
					return;
				}
			}

			// If all jobs were taken, just move the truck to the closest LZ
			orderDroidLoc(obj, DORDER_MOVE, jobPositions[0].pos.x, jobPositions[0].pos.y)
		}
		else
		{
			// Misc. unit management
			queue("manualGrouping", camSecondsToMilliseconds(1));
		}
	}
}

function manualGrouping()
{
	const vtols = enumDroid(CAM_NEXUS).filter((obj) => (obj.group === null && !camIsTransporter(obj) && isVTOL(obj)));
	const nonVtols = enumDroid(CAM_NEXUS).filter((obj) => (obj.group === null && !camIsTransporter(obj) && !isVTOL(obj)));
	if (vtols.length)
	{
		camManageGroup(camMakeGroup(vtols), CAM_ORDER_ATTACK, { regroup: false, count: -1 });
	}
	if (nonVtols.length)
	{
		camManageGroup(camMakeGroup(nonVtols), CAM_ORDER_ATTACK, { regroup: false, count: -1 });
	}
}

// Activate the NEXUS Intruder Program and steal the player's HQ
function synapticsSound()
{
	playSound(cam_sounds.nexus.synapticLinksActivated);

	const hq = enumStruct(CAM_HUMAN_PLAYER, HQ)[0];

	if (camDef(hq) && hq !== null)
	{
		absorbObject(hq);
	}
}

// A cosmetic effect that momentarily swaps the player's and NEXUS' team colors
// Becomes less common as the player researches resistance upgrades
function colourPulse()
{
	if (getResearch(cam_resistance_circuits.third).done)
	{
		removeTimer("colourPulse");
		return;
	}
	else if (getResearch(cam_resistance_circuits.second).done && camRand(12) === 0)
	{
		return;
	}
	else if (getResearch(cam_resistance_circuits.first).done && camRand(6) === 0)
	{
		return;
	}
	else if (camRand(3) === 0)
	{
		return;
	}

	changePlayerColour(CAM_HUMAN_PLAYER, nxTrueColour);
	changePlayerColour(CAM_NEXUS, playerTrueColour);

	// Colour effect lasts for a random amount of time
	const DURATION = 0.6 + (camRand(8) * 0.2); // 0.6 to 2.0 seconds
	queue("colourReset", camSecondsToMilliseconds(DURATION));
}

// Revert the colour-swapping effect
function colourReset()
{
	changePlayerColour(CAM_HUMAN_PLAYER, playerTrueColour);
	changePlayerColour(CAM_NEXUS, nxTrueColour);
}

// winFlag is set in eventResearched.
function resistanceResearched()
{
	if (winFlag)
	{
		return true;
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Research resistance circuits and survive the assault from Nexus"));

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.gamma6, {
		callback: "resistanceResearched"
	});

	// NEXUS LZs
	camSetEnemyBases({
		"NXLZEast": {
			cleanup: "structZoneE",
			detectMsg: "CM3AB_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS // We need these in case the player already has structures here
		},
		"NXLZNorthEast": {
			cleanup: "structZoneNE",
			detectMsg: "CM3AB_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS
		},
		"NXLZNorthWest": {
			cleanup: "structZoneNW",
			detectMsg: "CM3AB_LZ3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS
		},
		"NXLZWest": {
			cleanup: "structZoneW",
			detectMsg: "CM3AB_LZ4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS
		},
		"NXLZSouth": {
			cleanup: "structZoneS",
			detectMsg: "CM3AB_LZ5",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_NEXUS
		}
	});

	truckJob1 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZEast",
			rebuildBase: true,
			structset: camGamma5NXLZStructsE
	});
	truckJob2 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZNorthEast",
			rebuildBase: true,
			structset: camGamma5NXLZStructsNE
	});
	truckJob3 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZNorthWest",
			rebuildBase: true,
			structset: camGamma5NXLZStructsNW
	});
	truckJob4 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZWest",
			rebuildBase: true,
			structset: camGamma5NXLZStructsW
	});
	truckJob5 = camManageTrucks(
		CAM_NEXUS, {
			label: "NXLZSouth",
			rebuildBase: true,
			structset: camGamma5NXLZStructsS
	});

	camSetNexusState(true);
	camPlayVideos([{video: "MB3_AB_MSG", type: CAMP_MSG}, {video: "MB3_AB_MSG2", type: CAMP_MSG}, {video: "MB3_AB_MSG3", type: MISS_MSG}]);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camMinutesToSeconds(45));

	setPower(playerPower(CAM_HUMAN_PLAYER) + 5000);
	playSound(cam_sounds.powerTransferred);

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	enableResearch(cam_resistance_circuits.first, CAM_HUMAN_PLAYER);
	winFlag = false;
	lastResCheckFailed = false;
	playerWarned = false;
	hackIdx = 0;
	playerTrueColour = playerData[CAM_HUMAN_PLAYER].colour;
	nxTrueColour = playerData[CAM_NEXUS].colour;
	
	setTimer("colourPulse", camSecondsToMilliseconds(32));

	queue("synapticsSound", camSecondsToMilliseconds(2.5));

	setTimer("sendNXTransporter", camChangeOnDiff(camMinutesToMilliseconds(2)));
	setTimer("hackPlayer", camChangeOnDiff(camSecondsToMilliseconds(8)));
	setTimer("checkResearchStalled", camSecondsToMilliseconds(8));

	// Darken the fog to 1/2 default brightness
	camSetFog(91, 113, 118);
	// Move the sun far towards the east
	camSetSunPos(-500, -200, 200);
}

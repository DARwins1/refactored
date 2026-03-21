include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage05", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-Damage04", "R-Wpn-Cannon-ROF01", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-ROF01", "R-Wpn-Mortar-Acc01", 
	"R-Wpn-Rocket-Damage04", "R-Wpn-Rocket-ROF01", "R-Wpn-Rocket-Accuracy02",
	"R-Defense-WallUpgrade04", "R-Struc-Materials04",
	"R-Sys-Engineering02",
	"R-Struc-RprFac-Upgrade01",
	"R-Vehicle-Metals03", "R-Cyborg-Metals03",
	"R-Vehicle-Engine03",
];

const MIS_MAX_TRANSPORTS = 8;
const MIS_MAX_MENU_TRANSPORTS = 6;
var transporterIndex; //Number of transport loads sent into the level
var startedFromMenu;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if ((droid.player !== CAM_HUMAN_PLAYER))
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

//Attack and destroy all those who resist the Machine! -The Collective
function secondVideo()
{
	camPlayVideos({video: "MB2A_MSG2", type: CAMP_MSG});
}

//Damage the base and droids for the player
function preDamageStuff()
{
	const droids = enumDroid(CAM_HUMAN_PLAYER);
	const structures = enumStruct(CAM_HUMAN_PLAYER);

	for (let x = 0; x < droids.length; ++x)
	{
		const droid = droids[x];
		if (!camIsTransporter(droid))
		{
			setHealth(droid, 45 + camRand(20));
		}
	}

	for (let x = 0; x < structures.length; ++x)
	{
		const struc = structures[x];
		setHealth(struc, 45 + camRand(45));
	}
}

function getDroidsForCOLZ()
{
	const droids = [];
	const COUNT = 6 + camRand(5);
	let templates;
	let usingHeavy = false;

	if (camRand(100) < 75)
	{
		templates = [cTempl.cybhg, cTempl.comhmgt, cTempl.scymc, cTempl.cybla];
	}
	else
	{
		templates = [cTempl.cohhrat, cTempl.commct, cTempl.comhpvt];
		usingHeavy = true;
	}

	for (let i = 0; i < COUNT; ++i)
	{
		if (!i && usingHeavy)
		{
			droids.push(cTempl.comsenst); //bring a sensor
		}
		else
		{
			droids.push(templates[camRand(templates.length)]);
		}
	}

	return droids;
}

//Send Collective transport units
function sendCOTransporter()
{
	if (!camBaseIsEliminated("COLZBase"))
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("COTransportPos"), getDroidsForCOLZ(),
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 125, y: 100 },
				exit: { x: 125, y: 70 }
			}
		);
	}
}

// Spawn heavy units on the north part of the map every 7 minutes
// NOTE: Only spawn if the CC is still active
function mapEdgeDroids()
{
	if (getObject("COCommandCenter") === null)
	{
		return; // CC Destroyed
	}

	const units = [cTempl.cybhg, cTempl.scymc, cTempl.scygr, cTempl.cohhct];
	const LIMIT = 8 + camRand(5);
	const droids = [];
	for (let i = 0; i < LIMIT; i++)
	{
		droids.push(camRandFrom(units));
	}
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("groundUnitPos"), droids, CAM_REINFORCE_GROUND);
}

function vtolAttack()
{
	if (getObject("COCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	// Focus towards the player's LZ
	const templates = [cTempl.colcbv, cTempl.colatv]; // Cluster Bombs and Lancers
	const ext = {
		limit: [2, 3],
		alternate: true,
		pos: camMakePos("landingZone"),
		dynamic: true // Change attack rate based on how many VTOLs are shot down
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter", ext);
}

function groupOrders()
{
	const colCommander = camMakeGroup("COCommander");
	if (colCommander !== null)
	{
		camManageGroup(colCommander, CAM_ORDER_ATTACK);
	}

	camManageGroup(camMakeGroup("IDFGroup"), CAM_ORDER_DEFEND, {
		pos: [
			camMakePos("waypoint1"),
			camMakePos("waypoint2")
		]
	});

	camManageGroup(camMakeGroup("sensorGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("waypoint1"),
			camMakePos("waypoint2")
		]
	});
}

//Get some higher rank droids.
function setUnitRank(transport)
{
	let droids;
	let mapRun = false;

	if (transport)
	{
		droids = enumCargo(transport);
	}
	else
	{
		mapRun = true;
		//These are the units in the base already at the start.
		droids = enumDroid(CAM_HUMAN_PLAYER).filter((dr) => (!camIsTransporter(dr)));
	}

	const ranks = (mapRun || transporterIndex == 1) ? ["Elite"] : ["Veteran", "Professional", "Regular"];
	for (const droid of droids)
	{
		camSetDroidRank(droid, camRandFrom(ranks));
	}
}

//Bump the rank of the first batch of transport droids as a reward.
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (!camDef(transporterIndex))
		{
			transporterIndex = 0;
		}

		transporterIndex += 1;

		if (startedFromMenu)
		{
			setUnitRank(transport);
		}

		if (transporterLimitReached())
		{
			queue("downTransporter", camMinutesToMilliseconds(1));
		}
	}
}

// Returns true if the player has reached their maximum amount of transport runs
function transporterLimitReached()
{
	return transporterIndex >= MIS_MAX_TRANSPORTS || (startedFromMenu && transporterIndex >= MIS_MAX_MENU_TRANSPORTS);
}

//Warn that something bad happened to the fifth transport
function reallyDownTransporter()
{
	// Set the next mission to Beta 2 (to go rescue the transport)
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.beta2.pre);
	setReinforcementTime(LZ_COMPROMISED_TIME);
	playSound(cam_sounds.transport.transportUnderAttack);
}

function downTransporter()
{
	camCallOnce("reallyDownTransporter");
}

function eventTransporterLaunch(transport)
{
	if (transporterLimitReached())
	{
		queue("downTransporter", camMinutesToMilliseconds(1));
	}
}

function eventGameLoaded()
{
	if (transporterLimitReached())
	{
		setReinforcementTime(LZ_COMPROMISED_TIME);
	}
}

// Allow the player to change to colors that are hard-coded to be unselectable
function eventChat(from, to, message)
{
	let colour = 0;
	switch (message)
	{
		case "green me":
			colour = 0; // Green
			break;
		case "orange me":
			colour = 1; // Orange
			break;
		case "grey me":
		case "gray me":
			colour = 2; // Gray
			break;
		case "black me":
			colour = 3; // Black
			break;
		case "red me":
			colour = 4; // Red
			break;
		case "blue me":
			colour = 5; // Blue
			break;
		case "pink me":
			colour = 6; // Pink
			break;
		case "aqua me":
		case "cyan me":
			colour = 7; // Cyan
			break;
		case "yellow me":
			colour = 8; // Yellow
			break;
		case "purple me":
			colour = 9; // Purple
			break;
		case "white me":
			colour = 10; // White
			break;
		case "bright blue me":
		case "bright me":
			colour = 11; // Bright Blue
			break;
		case "neon green me":
		case "neon me":
		case "bright green me":
			colour = 12; // Neon Green
			break;
		case "infrared me":
		case "infra red me":
		case "infra me":
		case "dark red me":
			colour = 13; // Infrared
			break;
		case "ultraviolet me":
		case "ultra violet me":
		case "ultra me":
		case "uv me":
		case "dark blue me":
			colour = 14; // Ultraviolet
			break;
		case "brown me":
		case "dark green me":
			colour = 15; // Brown
			break;
		default:
			return; // Some other message; do nothing
	}

	playerColour = colour;
	changePlayerColour(CAM_HUMAN_PLAYER, colour);
	adaptColors();
	playSound("beep6.ogg");
}


function adaptColors()
{
	// Make sure other factions aren't choosing conflicting colors with the player
	changePlayerColour(CAM_THE_COLLECTIVE, (playerColour !== 2) ? 2 : 10); // Set to gray or white
	changePlayerColour(CAM_NEXUS, (playerColour !== 3) ? 3 : 14); // Set to black or ultraviolet
}

function eventStartLevel()
{
	const PLAYER_POWER = 5000;
	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");

	// NOTE: This is set to Beta 3 by default.
	// If the player's transport is shot down, then set the next mission to Beta 2 instead.
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.beta3);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	playerColour = playerData[0].colour;
	adaptColors();

	camSetArtifacts({
		"COCommandCenter": { tech: "R-Sys-Engineering02" }, // Improved Engineering
		"COArtiPillbox": { tech: "R-Wpn-MG-Damage05" }, // Tungsten-Tipped MG Bullets
		"COArtiCBTower": { tech: "R-Sys-CBSensor-Turret01" }, // CB Turret
		"COArtiHRA": { tech: "R-Wpn-Rocket02-MRLHvy" }, // Heavy Rocket Array
	});

	if (!tweakOptions.ref_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));
	}
	setPower(PLAYER_POWER, CAM_HUMAN_PLAYER);

	// Grant research and tech
	for (let x = 0, l = mis_structsAlpha.length; x < l; ++x)
	{
		enableStructure(mis_structsAlpha[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(mis_alphaResearchNew, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(mis_playerResBeta, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);
	enableResearch("R-Wpn-Cannon-Damage04", CAM_HUMAN_PLAYER);
	enableResearch("R-Wpn-Mortar-Damage04", CAM_HUMAN_PLAYER);
	enableResearch("R-Wpn-AAGun-Damage01", CAM_HUMAN_PLAYER);
	enableResearch("R-Wpn-AAGun-ROF01", CAM_HUMAN_PLAYER);
	enableResearch("R-Wpn-Rocket-Accuracy03", CAM_HUMAN_PLAYER);

	if (difficulty === INSANE)
	{
		camUpgradeOnMapTemplates(cTempl.commct, cTempl.comhpvt, CAM_THE_COLLECTIVE);
	}

	preDamageStuff();

	camSetEnemyBases({
		"CONorthBase": {
			cleanup: "CONorth",
			detectMsg: "C2A_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"CONorthWestBase": {
			cleanup: "CONorthWest",
			detectMsg: "C2A_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COLZBase": {
			cleanup: "COLandingZone",
			detectMsg: "C2A_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
	});

	setUnitRank(); //All pre-placed player droids are ranked.
	camPlayVideos({video: "MB2A_MSG", type: MISS_MSG});
	startedFromMenu = false;

	//Only if starting Beta directly rather than going through Alpha
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		
		// Subsequent transport droids are randomly chosen from this pool
		const attackPool = [ // Misc. cyborgs and tanks
			cTempl.cybhg, cTempl.cybla, cTempl.scymc,
			cTempl.prhmcht, cTempl.prhhmght, cTempl.prhatht, cTempl.prhpodht,
		];

		const artPool = [ // Bombards, MRAs, and Grenadiers
			cTempl.prhmorbht, cTempl.prhmraht, cTempl.scygr,
		];

		// Store units "offworld", so that the player can bring them in via transport.
		// The chosen units are distributed (roughly) as: 2/3 "attack" units, 1/3 artillery
		const NUM_DROIDS = 50;
		let numAttackDroids = (NUM_DROIDS * 2 / 3) + (NUM_DROIDS % 3);
		let numArtilleryDroids = Math.floor(NUM_DROIDS / 3);
		for (let i = 0; i < NUM_DROIDS; i++)
		{
			const choice = [];
			let template;
			if (numAttackDroids > 0) choice.push("attack"); // Allow choosing an "attack" droid
			if (numArtilleryDroids > 0) choice.push("artillery"); // Allow choosing an "artillery" droid
			switch (camRandFrom(choice))
			{
				case "attack":
				{
					// Choose a random attack template
					template = camRandFrom(attackPool);
					break;
				}
				case "artillery":
				{
					// Choose a random artillery template
					template = camRandFrom(artPool);
					break;
				}
			}

			// Create the droid
			camAddDroid(CAM_HUMAN_PLAYER, -1, template);
			// NOTE: We can't give the offworld droid XP here, since the scripting API can't find it.
			// Instead, we'll grant XP when the transport drops it off.
		}

		// Send a pre-filled transport with a commander and some high-rank droids
		const firstTransportDroids = [
			cTempl.prhcomht, // 1 Command Turret
			cTempl.scymc, cTempl.scymc, cTempl.scymc, // 3 Super Heavy Gunners
			cTempl.prhatht, cTempl.prhatht, cTempl.prhatht, // 3 Lancers
			cTempl.prhhmght, cTempl.prhhmght, cTempl.prhhmght, // 3 HMGs
		];

		camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), firstTransportDroids,
			CAM_REINFORCE_TRANSPORT, {
				entry: tEnt,
				exit: tExt
			}
		);
	}

	setReinforcementTime(camMinutesToSeconds(3)); // 3 min.

	// NOTE: None of these trucks are rebuilt if destroyed
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "dummy", // No base label; this truck won't wander around
			rebuildTruck: false,
			truckDroid: getObject("coTruck1"),
			structset: camB1COOilStructs
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "CONorthBase",
			rebuildTruck: false,
			truckDroid: getObject("coTruck2"),
			structset: camAreaToStructSet("CONorth")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "CONorthWestBase",
			rebuildTruck: false,
			truckDroid: getObject("coTruck3"),
			structset: camAreaToStructSet("CONorthWest")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COLZBase",
			rebuildTruck: false,
			truckDroid: getObject("coTruck4"),
			structset: camAreaToStructSet("COLandingZone")
	});

	// Assign the edge group to their commander
	// Rank changes on difficulty:
	// Trained (SUPEREASY/EASY/MEDIUM)
	// Regular (HARD)
	// Professional (INSANE)
	camSetDroidRank(getObject("COCommander"), (difficulty <= MEDIUM) ? 2 : (difficulty));
	camManageGroup(camMakeGroup("edgeGroup"), CAM_ORDER_FOLLOW, {
		leader: "COCommander",
		suborder: CAM_ORDER_ATTACK
	});
	// NOTE1: This commander has no orders for now
	// NOTE2: This commander is underfilled; that's OK

	queue("secondVideo", camSecondsToMilliseconds(12));
	queue("groupOrders", camChangeOnDiff(camMinutesToMilliseconds(1)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	setTimer("sendCOTransporter", camChangeOnDiff(camMinutesToMilliseconds(5)));
	setTimer("mapEdgeDroids", camChangeOnDiff(camMinutesToMilliseconds(7)));

	// Darken the fog to 3/4 default brightness
	// NOTE: default RGB for the ubran skies is (16, 16, 64)
	camSetFog(12, 12, 48);
	// Darken the lighting slightly and add a slight blue hue
	// NOTE: default brightness is (.5, .5, .5)
	camSetSunIntensity(.4, .4, .45);
	// Move the sun towards the west
	// NOTE: default position is (x: 225.0, y: -600.0, z: 450.0)
	// Sun coordinates and their corresponding sun directions (where the sun is relative to the world):
	// -x: EAST, +x: WEST
	// -y: UP, +y: DOWN
	// -z: NORTH, +z: SOUTH
	// (remember that shadows are casted in the OPPOSITE direction of the sun)
	// Also remember that these coordinates are normalized; the values of each axis only matter in respect to each other.
	// e.g. (5, 4, 3) == (500, 400, 300)
	camSetSunPos(425, -400, 450);
	// Constant rain
	camSetWeather(CAM_WEATHER_RAINSTORM);
}

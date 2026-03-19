include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const MIS_ALPHA_PLAYER = 1; //Team alpha units belong to player 1.
const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage07", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage05", "R-Wpn-AAGun-ROF05", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage05", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage02",
	"R-Wpn-Missile-Damage02", "R-Wpn-Missile-ROF02", "R-Wpn-Missile-Accuracy01",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF01", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage02", "R-Wpn-Energy-ROF01", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade08", "R-Struc-Materials08",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-Factory-Upgrade03", "R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals08", "R-Cyborg-Metals08",
	"R-Vehicle-Armor-Heat04", "R-Cyborg-Armor-Heat04",
	"R-Vehicle-Engine08",
	"R-Sys-NEXUSrepair",
];
var alphaUnitIDs;
var railGroup;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_NEXUS);
});

//This is an area just below the "doorway" into the alpha team pit. Activates
//groups that are hidden farther south.
camAreaEvent("rescueTrigger", function(droid)
{
	hackRemoveMessage("C3-2_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	
	//Activate edge map queue and donate all of alpha to the player.
	camAbsorbPlayer(MIS_ALPHA_PLAYER, CAM_HUMAN_PLAYER);
	queue("phantomFactorySE", camChangeOnDiff(camSecondsToMilliseconds(60)));
	setTimer("phantomFactorySE", camChangeOnDiff(camMinutesToMilliseconds(5)));

	camPlayVideos({video: "MB3_2_MSG4", type: MISS_MSG});
});

camAreaEvent("phantomFacTrigger", function(droid)
{
	camCallOnce("alphaWarning");
});

// Play videos and setup reinforcements.
function alphaWarning()
{
	camPlayVideos([cam_sounds.incoming.incomingIntelligenceReport, {video: "MB3_2_MSG3", type: CAMP_MSG}]); //Warn about VTOLs.
	queue("enableReinforcements", camSecondsToMilliseconds(5));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));

	// Also start moving some groups around
	// This group carries an artifact
	camManageGroup(railGroup, CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1
	});
	camManageGroup(camMakeGroup("laserTankGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4"),
		],
		interval: camSecondsToMilliseconds(25),
		repair: 60,
		repairPos: camMakePos("healthRetreatPos")
	});
}

//Reinforcements not available until team Alpha brief about VTOLS.
function enableReinforcements()
{
	playSound(cam_sounds.reinforcementsAreAvailable);
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.gamma5, {
		area: "RTLZ",
		message: "C32_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "alphaTeamAlive",
		retlz: true
	});
}

// Store the IDs of the transport units when they're given to the player
function eventObjectTransfer(obj, from)
{
	if (obj.type === DROID && obj.player === CAM_HUMAN_PLAYER && from === MIS_ALPHA_PLAYER)
	{
		if (!camDef(alphaUnitIDs))
		{
			alphaUnitIDs = [];
		}

		alphaUnitIDs.push(obj.id);
	}
}

function phantomFactoryNE()
{
	const droids = [
		cTempl.ncypl, // 1 Plasmite Flamer
		cTempl.ncyne, cTempl.ncyne, cTempl.ncyne, // 3 Needler Gunners
		cTempl.ncysc, cTempl.ncysc, // 2 Scourges
	];
	camSendReinforcement(CAM_NEXUS, getObject("NE-PhantomFactory"), droids, CAM_REINFORCE_GROUND);
}

function phantomFactorySW()
{
	const list = [cTempl.ncyne, cTempl.ncysc, cTempl.ncyla];
	const droids = [
		cTempl.ncypl, // 1 Plasmite Flamer
		cTempl.ncyla, cTempl.ncyla, cTempl.ncyla, cTempl.ncyla, // 4 Flashlight Gunners
		cTempl.ncysc, cTempl.ncysc, cTempl.ncysc, // 3 Scourges
	];
	camSendReinforcement(CAM_NEXUS, camMakePos("SW-PhantomFactory"), droids, CAM_REINFORCE_GROUND);
}

function phantomFactorySE()
{
	const droids = [
		cTempl.nxhserh, // 1 Seraph Missile
		cTempl.nxlflash, cTempl.nxlflash, cTempl.nxlflash, cTempl.nxlflash, // 4 Flashlights
		cTempl.nxmrailh, cTempl.nxmrailh, // 2 Rail Guns
		cTempl.nxmscouh, cTempl.nxmscouh, // 2 Scourge Missiles
		cTempl.nxmplash, cTempl.nxmplash, // 2 Plasmite Flamers
	];
	camSendReinforcement(CAM_NEXUS, getObject("SE-PhantomFactory"), droids, CAM_REINFORCE_GROUND);
}

function sendEdgeMapDroids(droidCount, location, list)
{
	camSendGenericSpawn(CAM_REINFORCE_GROUND, CAM_NEXUS, CAM_REINFORCE_CONDITION_NONE, location, list, droidCount);
}

function cyborgAttack()
{
	camManageGroup(camMakeGroup("cyborgGroup"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
		repairPos: 60,
		repairPos: camMakePos("healthRetreatPos")
	});
}

function vtolAttack()
{
	if (getObject("NXCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	// Needle Guns, Scourge Missiles and Flashlights
	const templates = [cTempl.nxlneedv, cTempl.nxlscouv, cTempl.nxlflasv];
	const ext = {
		limit: [2, 2, 4],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "NXCommandCenter", ext);
}

function alphaTeamAlive()
{
	if (camDef(alphaUnitIDs))
	{
		let alphaAlive = false;
		const alive = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter((obj) => (
			obj.type === DROID
		));

		for (const droid of alive)
		{
			for (const ALPHA_ID of alphaUnitIDs)
			{
				if (droid.id === ALPHA_ID)
				{
					alphaAlive = true;
					break;
				}
			}
		}

		return alphaAlive;
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Rescue Alpha team from Nexus"));

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.gamma5, {
		area: "RTLZ",
		message: "C32_LZ",
		reinforcements: -1,
		callback: "alphaTeamAlive",
		retlz: true
	});

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);
	camCompleteRequiredResearch(mis_gammaAllyRes, MIS_ALPHA_PLAYER);

	camSetArtifacts({
		"NXartiRail": { tech: "R-Wpn-RailGun02" }, // Rail Gun
	});

	camSetEnemyBases({
		"NXOutpost": {
			cleanup: "baseCleanup",
			detectMsg: "C3-2_BASE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		}
	});

	// NOTE: This truck is never rebuilt
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXOutpost",
			rebuildBase: tweakOptions.ref_timerlessMode,
			truckDroid: getObject("nxTruck"),
			structset: camAreaToStructSet("NXEastBaseCleanup")
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	setAlliance(MIS_ALPHA_PLAYER, CAM_NEXUS, true);
	setAlliance(MIS_ALPHA_PLAYER, CAM_HUMAN_PLAYER, true);
	changePlayerColour(MIS_ALPHA_PLAYER, playerData[0].colour);

	const alphaDroids = enumDroid(MIS_ALPHA_PLAYER);
	for (const droid of alphaDroids)
	{
		camSetDroidRank(droid, "Hero");
	}

	railGroup = camMakeGroup("railGroup");

	hackAddMessage("C3-2_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);

	queue("cyborgAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("camCallOnce", camMinutesToMilliseconds(10), "alphaWarning");

	setTimer("phantomFactoryNE", camChangeOnDiff(camMinutesToMilliseconds(4.5)));
	setTimer("phantomFactorySW", camChangeOnDiff(camMinutesToMilliseconds(6.5)));

	// Darken the fog to be nearly pitch black
	camSetFog(10, 10, 10);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Move the sun towards the east
	camSetSunPos(-225, -600, 450);
	camSetSkyType(CAM_SKY_NIGHT);
}

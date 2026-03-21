include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const MIS_GAMMA_PLAYER = 1; // Gamma is player one; note that the hostile "Gamma" bases belong to CAM_NEXUS
const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage09", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage06", "R-Wpn-AAGun-ROF06", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage06", "R-Wpn-Howitzer-ROF04", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage02",
	"R-Wpn-Missile-Damage03", "R-Wpn-Missile-ROF02", "R-Wpn-Missile-Accuracy02",
	"R-Wpn-Rail-Damage03", "R-Wpn-Rail-ROF02", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage03", "R-Wpn-Energy-ROF02", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade09", "R-Struc-Materials09",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals09", "R-Cyborg-Metals09",
	"R-Vehicle-Armor-Heat05", "R-Cyborg-Armor-Heat05",
	"R-Vehicle-Engine09",
	"R-Sys-NEXUSrepair",
];
var reunited;
var betaUnitIds;

camAreaEvent("gammaBaseTrigger", function(droid) {
	discoverGammaBase();
});

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_NEXUS);
});

// Attack the player's base(s) with pre-placed groups
function ambushAttack()
{
	camManageGroup(camMakeGroup("ambushGroup1"), CAM_ORDER_ATTACK, {
		pos: camMakePos("landingZone"),
		repair: 80,
		repairPos: camMakePos("NXAssembly")
	});
}

function vtolAttack()
{
	if (getObject("NXcommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);		
	}

	// Thermite Bombs, Scourge Missiles and Pulse Lasers
	const templates = [cTempl.nxmtbv, cTempl.nxlscouv, cTempl.nxlpulsev];
	const ext = {
		limit: [3, 4, 3],
		pos: camMakePos("vtolFocusPos"),
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_NEXUS, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2.5)), "NXcommandCenter", ext);
}

// Focus on important player structures
function vtolStrike()
{
	if (getObject("NXcommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);		
	}

	// Devastators only
	const templates = [cTempl.nxldevv];
	const ext = {
		limit: [2],
		alternate: true,
		dynamic: true,
		callback: "getStrikeTargets" // Used to get targets for VTOL strikes
	};
	camSetVtolData(CAM_NEXUS, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2.5)), "NXcommandCenter", ext);
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

function setupPatrolGroups()
{
	camManageGroup(camMakeGroup("Egroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
		],
		repairPos: camMakePos("NXAssembly"),
		repair: 80,
		interval: camSecondsToMilliseconds(35),
	});
}

// Either time based or triggered by discovering Gamma base.
function enableFirstFactories()
{
	camEnableFactory("gammaCybFactory");
	camEnableFactory("gammaNorthFactory");
}

function enableSecondFactories()
{
	camEnableFactory("NXsouthCybFac");
	camEnableFactory("gammaCentralFactory");
}

function enableFinalFactories()
{
	camEnableFactory("NXbase1HeavyFacArti");
}

function discoverGammaBase()
{
	reunited = true;
	camSetExtraObjectiveMessage();
	const lz = getObject("landingZone");
	setScrollLimits(0, 0, 64, 192); //top and middle portion.
	restoreLimboMissionData();
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(80)) + getMissionTime());
	setPower(playerPower(CAM_HUMAN_PLAYER) + camChangeOnDiff(10000));

	playSound(cam_sounds.powerTransferred);
	playSound(cam_sounds.rescue.groupRescued);

	camAbsorbPlayer(MIS_GAMMA_PLAYER, CAM_HUMAN_PLAYER); //Take everything they got!

	hackRemoveMessage("CM3C_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER);
	hackRemoveMessage("CM3C_BETATEAM", PROX_MSG, CAM_HUMAN_PLAYER);

	enableFirstFactories();

	queue("ambushAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("enableSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("vtolStrike", camChangeOnDiff(camMinutesToMilliseconds(7)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(9)));
}

function findBetaUnitIds()
{
	const droids = enumArea("betaUnits", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));

	for (let i = 0, len = droids.length; i < len; ++i)
	{
		betaUnitIds.push(droids[i].id);
	}
}

function betaAlive()
{
	if (reunited)
	{
		return true; //Don't need to see if Beta is still alive if reunited with base.
	}

	let alive = false;
	const myDroids = enumDroid(CAM_HUMAN_PLAYER);

	for (let i = 0, l = betaUnitIds.length; i < l; ++i)
	{
		for (let x = 0, c = myDroids.length; x < c; ++x)
		{
			if (myDroids[x].id === betaUnitIds[i])
			{
				alive = true;
				break;
			}
		}

		if (alive)
		{
			break;
		}
	}

	if (!alive)
	{
		return false;
	}
}

// Recycle the stashed EXP from Gamma 2
function recycleExpStash()
{
	const droids = enumDroid(CAM_HUMAN_PLAYER, DROID_WEAPON);
	for (const droid of droids)
	{
		if (droid.name === "*EXP Stash*")
		{
			orderDroid(droid, DORDER_RECYCLE);
		}
	}
	queue("removeLimboRepair", camSecondsToMilliseconds(0.6));
}

// Remove the repair facilities placed in the limbo LZ
function removeLimboRepair()
{
	const objs = enumArea("limboDroidLZ");

	for (const obj of objs)
	{
		if (obj.type === STRUCTURE && obj.stattype === REPAIR_FACILITY)
		{
			camSafeRemoveObject(obj);
		}
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Reunite a part of Beta team with a Gamma team outpost"));

	const startPos = getObject("startPosition");
	const limboLZ = getObject("limboDroidLZ");
	reunited = false;
	betaUnitIds = [];

	findBetaUnitIds();

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.gamma7, {
		callback: "betaAlive"
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(limboLZ.x, limboLZ.y, limboLZ.x2, limboLZ.y2, -1);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(10)));

	queue("recycleExpStash", camSecondsToMilliseconds(0.1));

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);
	camCompleteRequiredResearch(mis_gammaAllyRes, MIS_GAMMA_PLAYER);

	camSetArtifacts({
		"NXsouthCybFac": { tech: "R-Wpn-RailGun02" }, // Rail Gun
		"NXbase1HeavyFacArti": { tech: "R-Wpn-MissileBB2" }, // Devastator Missile
		"gammaResearch": { tech: "R-Struc-Research-Upgrade03" }, // Neural Synapse Research Brain
		"gammaWhirlwind": { tech: "R-Wpn-AAGun-Damage06" }, // AA HEAP Flak Mk3
		"gammaHellstorm": { tech: "R-Wpn-Howitzer03-Rot" }, // Hellstorm
		"NXcommandCenter": { tech: "R-Vehicle-Body07" }, // Retribution
	});

	hackAddMessage("CM3C_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("CM3C_BETATEAM", PROX_MSG, CAM_HUMAN_PLAYER, false);

	setAlliance(CAM_HUMAN_PLAYER, MIS_GAMMA_PLAYER, true);
	setAlliance(CAM_NEXUS, MIS_GAMMA_PLAYER, true);

	camSetEnemyBases({
		"gammaNorthBase": {
			cleanup: "northBaseCleanup",
			detectMsg: "CM3C_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"gammaCentralBase": {
			cleanup: "centralBaseCleanup",
			detectMsg: "CM3C_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NXSouthBase": {
			cleanup: "southBaseCleanup",
			detectMsg: "CM3C_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_NEXUS, {
			label: "gammaNorthBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.prhtruckht,
			structset: camAreaToStructSet("northBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "gammaCentralBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.prhtruckht,
			structset: camAreaToStructSet("centralBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXSouthBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("southBaseCleanup")
	});

	camSetFactories({
		"NXbase1HeavyFacArti": {
			assembly: "NXAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(100)),
			data: {
				repair: 45,
				repairPos: camMakePos("NXAssembly")
			},
			templates: [cTempl.nxhserh, cTempl.nxmlinkh, cTempl.nxmdevh, cTempl.nxmpulseh]
		},
		"NXsouthCybFac": {
			assembly: "NXAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 40,
				repairPos: camMakePos("NXAssembly")
			},
			templates: [cTempl.ncypl, cTempl.ncysc]
		},
		"gammaCybFactory": {
			assembly: "gammaNorthAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: true,
				repair: 75,
				count: -1,
			},
			templates: [cTempl.scyhc, cTempl.scyag]
		},
		"gammaNorthFactory": {
			assembly: "gammaNorthAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 50,
			},
			templates: [cTempl.prhsensht, cTempl.prhbalht, cTempl.prhrotmht, cTempl.prhbalht, cTempl.prhrotmht]
		},
		"gammaCentralFactory": {
			assembly: "gammaCentralAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 50,
			},
			templates: [cTempl.prhhct, cTempl.prhagt, cTempl.prhhrat]
		},
	});

	camPlayVideos([{video: "MB3_C_MSG", type: CAMP_MSG}, {video: "MB3_C_MSG2", type: MISS_MSG}]);
	setScrollLimits(0, 137, 64, 192); //Show the middle section of the map.
	changePlayerColour(MIS_GAMMA_PLAYER, playerData[0].colour);

	queue("setupPatrolGroups", camSecondsToMilliseconds(10));
	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));

	// Darken the fog to 3/4 default brightness
	camSetFog(137, 167, 177);
	// Move the sun towards the east
	camSetSunPos(-425, -400, 450);
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const GAMMA = 1; //Gamma is player one.
const mis_nexusRes = [
	"R-Defense-WallUpgrade09", "R-Struc-Materials09", "R-Struc-Factory-Upgrade06",
	"R-Struc-VTOLPad-Upgrade06", "R-Vehicle-Engine09", "R-Vehicle-Metals08",
	"R-Cyborg-Metals08", "R-Vehicle-Armor-Heat05", "R-Cyborg-Armor-Heat05",
	"R-Sys-Engineering03", "R-Vehicle-Prop-Hover02", "R-Vehicle-Prop-VTOL02",
	"R-Wpn-Bomb-Damage03", "R-Wpn-Energy-Accuracy01", "R-Wpn-Energy-Damage03",
	"R-Wpn-Energy-ROF03", "R-Wpn-Missile-Accuracy01", "R-Wpn-Missile-Damage02",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF02", "R-Sys-Sensor-Upgrade01",
	"R-Sys-NEXUSrepair", "R-Wpn-Flamer-Damage08", "R-Wpn-Flamer-ROF03",
];
var reunited;
var betaUnitIds;

camAreaEvent("gammaBaseTrigger", function(droid) {
	discoverGammaBase();
});

function setupPatrolGroups()
{
	camManageGroup(camMakeGroup("NEgroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southBaseRetreat"),
			camMakePos("southOfVtolBase"),
			camMakePos("SWrampToGammaBase"),
			camMakePos("eastRidgeGammaBase"),
		],
		//fallback: camMakePos("southBaseRetreat"),
		//morale: 90,
		interval: camSecondsToMilliseconds(35),
		regroup: true,
	});

	camManageGroup(camMakeGroup("Egroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southBaseRetreat"),
			camMakePos("southOfVtolBase"),
			camMakePos("SWrampToGammaBase"),
			camMakePos("eastRidgeGammaBase"),
		],
		//fallback: camMakePos("southBaseRetreat"),
		//morale: 90,
		interval: camSecondsToMilliseconds(35),
		regroup: true,
	});

	camManageGroup(camMakeGroup("vtolGroup1"), CAM_ORDER_ATTACK, {
		regroup: false, count: -1
	});

	camManageGroup(camMakeGroup("vtolGroup2"), CAM_ORDER_ATTACK, {
		regroup: false, count: -1
	});
}

//Either time based or triggered by discovering Gamma base.
function enableAllFactories()
{
	camEnableFactory("NXbase1HeavyFacArti");
	camEnableFactory("NXsouthCybFac");
	camEnableFactory("NXcybFacArti");
	camEnableFactory("NXvtolFacArti");
}

function discoverGammaBase()
{
	reunited = true;
	const lz = getObject("landingZone");
	setScrollLimits(0, 0, 64, 192); //top and middle portion.
	restoreLimboMissionData();
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(90)));
	setPower(playerPower(CAM_HUMAN_PLAYER) + camChangeOnDiff(10000));

	playSound("power-transferred.ogg");
	playSound("pcv616.ogg"); //Group rescued.

	camAbsorbPlayer(GAMMA, CAM_HUMAN_PLAYER); //Take everything they got!
	setAlliance(CAM_NEXUS, GAMMA, false);

	hackRemoveMessage("CM3C_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER);
	hackRemoveMessage("CM3C_BETATEAM", PROX_MSG, CAM_HUMAN_PLAYER);

	enableAllFactories();
}

function findBetaUnitIds()
{
	const droids = enumArea("betaUnits", CAM_HUMAN_PLAYER, false).filter(function(obj) {
		return obj.type === DROID;
	});

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

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Reunite a part of Beta team with a Gamma team outpost"));

	const startpos = getObject("startPosition");
	const limboLZ = getObject("limboDroidLZ");
	reunited = false;
	betaUnitIds = [];

	findBetaUnitIds();

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAM3A-D1", {
		callback: "betaAlive"
	});

	centreView(startpos.x, startpos.y);
	setNoGoArea(limboLZ.x, limboLZ.y, limboLZ.x2, limboLZ.y2, -1);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(10)));

	const enemyLz = getObject("NXlandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, CAM_NEXUS);

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);
	camCompleteRequiredResearch(mis_gammaAllyRes, GAMMA);
	hackAddMessage("CM3C_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("CM3C_BETATEAM", PROX_MSG, CAM_HUMAN_PLAYER, false);

	setAlliance(CAM_HUMAN_PLAYER, GAMMA, true);
	setAlliance(CAM_NEXUS, GAMMA, true);

	camSetArtifacts({
		"NXbase1HeavyFacArti": { tech: "R-Vehicle-Body07" }, //retribution
		"NXcybFacArti": { tech: "R-Wpn-Missile2A-T" },
		"NXvtolFacArti": { tech: "R-Struc-VTOLPad-Upgrade04" },
		"NXcommandCenter": { tech: "R-Wpn-Plasmite-Flamer" },
	});

	camSetEnemyBases({
		"NXNorthBase": {
			cleanup: "northBaseCleanup",
			detectMsg: "CM3C_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NXVtolBase": {
			cleanup: "vtolBaseCleanup",
			detectMsg: "CM3C_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"NXSouthBase": {
			cleanup: "southBaseCleanup",
			detectMsg: "CM3C_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"NXbase1HeavyFacArti": {
			assembly: "NXHeavyAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: false,
				repair: 45,
				count: -1,
			},
			templates: [cTempl.nxmrailh, cTempl.nxlflash, cTempl.nxmlinkh, cTempl.nxmplash] //nxmsamh
		},
		"NXsouthCybFac": {
			assembly: "NXsouthCybFacAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas]
		},
		"NXcybFacArti": {
			assembly: "NXcybFacArtiAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas]
		},
		"NXvtolFacArti": {
			assembly: "NXvtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.nxmheapv, cTempl.nxmtherv]
		},
	});

	camPlayVideos([{video: "MB3_C_MSG", type: CAMP_MSG}, {video: "MB3_C_MSG2", type: MISS_MSG}]);
	setScrollLimits(0, 137, 64, 192); //Show the middle section of the map.
	changePlayerColour(GAMMA, playerData[0].colour);

	queue("setupPatrolGroups", camSecondsToMilliseconds(10));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));
}

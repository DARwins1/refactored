include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_UPLINK_PLAYER = 1; //The satellite uplink player number.
const mis_collectiveRes = [
	"R-Defense-WallUpgrade04", "R-Struc-Materials05",
	"R-Struc-Factory-Upgrade05", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Engine05", "R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat02", "R-Cyborg-Armor-Heat02",
	"R-Sys-Engineering02", "R-Wpn-Cannon-Accuracy02", "R-Wpn-Cannon-Damage05",
	"R-Wpn-Cannon-ROF03", "R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF03",
	"R-Wpn-MG-Damage06", "R-Wpn-MG-ROF03", "R-Wpn-Mortar-Acc02",
	"R-Wpn-Mortar-Damage05", "R-Wpn-Mortar-ROF03",
	"R-Wpn-Rocket-Accuracy02", "R-Wpn-Rocket-Damage06",
	"R-Wpn-Rocket-ROF03", "R-Wpn-RocketSlow-Accuracy03",
	"R-Wpn-RocketSlow-Damage06", "R-Sys-Sensor-Upgrade01",
	"R-Wpn-Howitzer-Accuracy01", "R-Wpn-RocketSlow-ROF03",
	"R-Wpn-Howitzer-Damage01",
];

camAreaEvent("vtolRemoveZone", function(droid)
{
	if ((droid.player === CAM_THE_COLLECTIVE) && isVTOL(droid))
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

//Order the truck to build some defenses.
function truckDefense()
{
	if (enumDroid(CAM_THE_COLLECTIVE, DROID_CONSTRUCT).length === 0)
	{
		removeTimer("truckDefense");
		return;
	}

	const list = ["AASite-QuadBof", "CO-WallTower-HvCan", "CO-Tower-RotMG", "CO-Tower-HvFlame"];
	camQueueBuilding(CAM_THE_COLLECTIVE, list[camRand(list.length)], camMakePos("uplinkPos"));
}

//Attacks every 2 minutes until HQ is destroyed.
function vtolAttack()
{
	const list = [cTempl.colatv, cTempl.commorvt, cTempl.colatv, cTempl.commorv];
	const ext = {
		limit: [4, 2, 4, 2],
		alternate: true,
		altIdx: 0
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemovePos", list, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter", ext);
}

//The project captured the uplink.
function captureUplink()
{
	const GOODSND = "pcv621.ogg";	//"Objective captured"
	playSound(GOODSND);
	hackRemoveMessage("C2D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

//Extra win condition callback.
function checkNASDACentral()
{
	if (getObject("uplink") === null)
	{
		return false; //It was destroyed
	}

	if (camCountStructuresInArea("uplinkClearArea", CAM_THE_COLLECTIVE) === 0)
	{
		camCallOnce("captureUplink");
		return true;
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Secure the Uplink from The Collective"));

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_2_6S", {
		area: "RTLZ",
		message: "C2D_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "checkNASDACentral",
		annihilate: true,
		retlz: true
	});

	const startpos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tent = getObject("transporterEntry");
	const text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	const enemyLz = getObject("COLandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, CAM_THE_COLLECTIVE);

	camSetArtifacts({
		"COCommandCenter": { tech: "R-Struc-VTOLPad-Upgrade01" },
		"COResearchLab": { tech: "R-Struc-Research-Upgrade04" },
		"COCommandRelay": { tech: "R-Wpn-Bomb02" },
		"COHeavyFactoryA": { tech: "R-Wpn-Mortar-Damage04" },
	});

	setAlliance(CAM_HUMAN_PLAYER, MIS_UPLINK_PLAYER, true);
	setAlliance(CAM_THE_COLLECTIVE, MIS_UPLINK_PLAYER, true);

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	camSetEnemyBases({
		"COSouthEastBase": {
			cleanup: "baseCleanup",
			detectMsg: "C2D_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"COHeavyFactoryA": {
			assembly: "COHeavyFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(140)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [cTempl.cohhpv, cTempl.comhltat, cTempl.cohct]
		},
		"COHeavyFactoryB": {
			assembly: "COHeavyFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(140)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [cTempl.cohhpv, cTempl.comhltat, cTempl.cohct, cTempl.cohhot]
		},
		"COHeavyFactoryC": {
			assembly: "COHeavyFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(100)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [cTempl.comit, cTempl.comhpv, cTempl.comrlt, cTempl.copodt]
		},
		"COHeavyFactoryD": {
			assembly: "COHeavyFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(100)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [cTempl.comhpv, cTempl.comrlt, cTempl.copodt, cTempl.comit]
		},
		"COSouthCyborgFactory": {
			assembly: "COSouthCyborgFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.npcybc, cTempl.cocybtf, cTempl.npcybr, cTempl.cocybag, cTempl.coscymc, cTempl.npcybg]
		},
	});

	camManageTrucks(CAM_THE_COLLECTIVE);
	truckDefense();
	hackAddMessage("C2D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	camEnableFactory("COHeavyFactoryA");
	camEnableFactory("COHeavyFactoryB");
	camEnableFactory("COHeavyFactoryC");
	camEnableFactory("COHeavyFactoryD");
	camEnableFactory("COSouthCyborgFactory");

	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	setTimer("truckDefense", camChangeOnDiff(camMinutesToMilliseconds(4)));
}

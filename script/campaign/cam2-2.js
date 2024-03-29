
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const warning = "pcv632.ogg"; // Collective commander escaping
const mis_collectiveRes = [
	"R-Defense-WallUpgrade03", "R-Struc-Materials04",
	"R-Struc-Factory-Upgrade04",
	"R-Vehicle-Engine04", "R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Cannon-Damage04",
	"R-Wpn-Cannon-ROF02", "R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF03",
	"R-Wpn-MG-Damage05", "R-Wpn-MG-ROF03", "R-Wpn-Mortar-Acc02",
	"R-Wpn-Mortar-Damage04", "R-Wpn-Mortar-ROF03",
	"R-Wpn-Rocket-Accuracy02", "R-Wpn-Rocket-Damage06",
	"R-Wpn-Rocket-ROF03", "R-Wpn-RocketSlow-Accuracy03",
	"R-Wpn-RocketSlow-Damage04", "R-Sys-Sensor-Upgrade01",
	"R-Struc-VTOLPad-Upgrade01",
	"R-Sys-Engineering02", "R-Wpn-Howitzer-Accuracy01",
	"R-Wpn-Howitzer-Damage01", "R-Wpn-RocketSlow-ROF01",
];
var commandGroup;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if (isVTOL(droid) && (droid.weapons[0].armed < 20) || (droid.health < 60))
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});


camAreaEvent("group1Trigger", function(droid)
{
	hackRemoveMessage("C22_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	camEnableFactory("COFactoryEast");

	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint1"),
		radius: 0,
		regroup: false,
	});
});

camAreaEvent("wayPoint1Rad", function(droid)
{
	if (isVTOL(droid))
	{
		resetLabel("wayPoint1Rad", CAM_THE_COLLECTIVE);
		return;
	}
	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint3"),
		radius: 0,
		regroup: false,
	});
});

//Tell player that Collective Commander is leaving and group all droids
//that can attack together to defend the enemy commander.
camAreaEvent("wayPoint2Rad", function(droid)
{
	if (droid.droidType !== DROID_COMMAND)
	{
		resetLabel("wayPoint2Rad", CAM_THE_COLLECTIVE);
		return;
	}

	const point = getObject("wayPoint3");
	const defGroup = enumRange(point.x, point.y, 10, CAM_THE_COLLECTIVE, false).filter(function(obj) {
		return (obj.droidType === DROID_WEAPON);
	});

	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint4"),
		radius: 0,
		regroup: false
	});

	camManageGroup(camMakeGroup(defGroup), CAM_ORDER_DEFEND, {
		pos: camMakePos("defensePos"),
		regroup: false,
		radius: 10,
		repair: 67,
	});

	playSound(warning);
});

camAreaEvent("failZone", function(droid)
{
	if (droid.droidType === DROID_COMMAND)
	{
		camSafeRemoveObject(droid, false);
		failSequence();
	}
	else
	{
		resetLabel("failZone", CAM_THE_COLLECTIVE);
	}
});

function vtolAttack()
{
	const list = [cTempl.colatv];
	const ext = {
		limit: 4,
		alternate: false,
		altIdx: 0
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPoint", "vtolRemovePoint", list, camChangeOnDiff(camMinutesToMilliseconds(3)), "COCommandCenter", ext);
}

//Order the truck to build some defenses.
function truckDefense()
{
	if (enumDroid(CAM_THE_COLLECTIVE, DROID_CONSTRUCT).length === 0)
	{
		removeTimer("truckDefense");
		return;
	}

	const list = ["CO-Tower-LtATRkt", "PillBox1", "CO-Tower-MdCan"];
	camQueueBuilding(CAM_THE_COLLECTIVE, list[camRand(list.length)]);
}

function showGameOver()
{
	const arti = camGetArtifacts();
	camSafeRemoveObject(arti[0], false);
	gameOverMessage(false);
}

function failSequence()
{
	queue("showGameOver", camSecondsToMilliseconds(0.3));
}

function retreatCommander()
{
	camManageGroup(commandGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("wayPoint3"),
		radius: 6,
		repair: 67,
		regroup: false
	});
}

//Make the enemy commander flee back to the NW base if attacked.
function eventAttacked(victim, attacker)
{
	if (camDef(victim) &&
		victim.player === CAM_THE_COLLECTIVE &&
		victim.y > Math.floor(mapHeight / 3) && //only if the commander is escaping to the south
		victim.group === commandGroup)
	{
		camCallOnce("retreatCommander");
	}
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CAM_2C",{
		area: "RTLZ",
		message: "C22_LZ",
		reinforcements: camMinutesToSeconds(3)
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
		"COCommander": { tech: "R-Wpn-RocketSlow-Accuracy03" },
	});

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	camSetEnemyBases({
		"COEastBase": {
			cleanup: "eastBaseCleanup",
			detectMsg: "C22_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"COWestBase": {
			cleanup: "westBaseCleanup",
			detectMsg: "C22_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"COFactoryEast": {
			assembly: camMakePos("eastAssembly"),
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.cohct, cTempl.comtathh, cTempl.comorb, cTempl.comrlt] //Heavy factory
		},
		"COFactoryWest": {
			assembly: camMakePos("westAssembly"),
			order: CAM_ORDER_DEFEND,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(120)),
			data: {
				pos: camMakePos("westAssembly"),
				regroup: false,
				repair: 67,
				radius: 18,
				count: -1,
			},
			templates: [cTempl.comtath] //Hover lancers
		},
	});

	commandGroup = camMakeGroup("group1NBase");
	camManageTrucks(CAM_THE_COLLECTIVE);
	truckDefense();
	camEnableFactory("COFactoryWest");

	hackAddMessage("C22_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("vtolAttack", camMinutesToMilliseconds(2));
	setTimer("truckDefense", camChangeOnDiff(camMinutesToMilliseconds(3)));
}

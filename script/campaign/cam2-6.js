include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage07", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF03", "R-Wpn-Mortar-Acc02", 
	"R-Wpn-Rocket-Damage06", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage02", "R-Wpn-AAGun-ROF02", "R-Wpn-AAGun-Accuracy01",
	"R-Wpn-Howitzer-Damage02", "R-Wpn-Howitzer-ROF01",
	"R-Wpn-Bomb-Damage01",
	"R-Defense-WallUpgrade06", "R-Struc-Materials06",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat01", "R-Cyborg-Armor-Heat01",
	"R-Vehicle-Engine05",
];
var artilleryGroup;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if ((droid.player !== CAM_HUMAN_PLAYER))
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function camEnemyBaseEliminated_COUplinkBase()
{
	hackRemoveMessage("C26_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

//Group together attack droids in this base that are not already in a group
function camEnemyBaseDetected_COMediumBase()
{
	const droids = enumArea("mediumBaseCleanup", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && obj.group === null && obj.canHitGround
	));

	camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
		regroup: false,
	});
}

function southEastAttack()
{
	camManageGroup(camMakeGroup("southEastGroup"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("landingZone"),
		repair: 40,
	});
}

function mainBaseAttackGroup()
{
	camManageGroup(artilleryGroup, CAM_ORDER_ATTACK, {
		morale: 60,
		fallback: camMakePos("fallbackPos"),
		count: -1
	});
}

function enableFirstFactories()
{
	camEnableFactory("COCyborgFactory-Arti");
	camEnableFactory("COCyborgFactory-b2");
	camEnableFactory("COHeavyFactory-b2");
}

function enableFinalFactories()
{
	camEnableFactory("COMediumFactory");
	camEnableFactory("COCyborgFactory-b1");
}

function vtolAttack()
{
	if (getObject("COCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	const templates = [cTempl.comhbv, cTempl.comhatv, cTempl.comtbv]; // HEAP Bombs, Tank Killers, and Thermite Bombs
	const ext = {
		limit: [2, 2, 2],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter", ext);
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.betaExtra, {
		area: "RTLZ",
		message: "C26_LZ",
		reinforcements: camMinutesToSeconds(3)
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
		"COCommandCenter": { tech: "R-Defense-WallUpgrade06" }, // Supercrete Mk3
		"COMediumFactory": { tech: "R-Wpn-Cannon-Damage07" }, // HVAPFSDS Cannon Rounds
		"COHeavyFactory-b2": { tech: "R-Struc-Factory-Upgrade03" }, // Advanced Manufacturing
		"COResearchLab": { tech: "R-Wpn-Bomb02" }, // HEAP Bombs
		"COWhirlwind": { tech: "R-Wpn-AAGun04" }, // Whirlwind
	});

	camSetEnemyBases({
		"COUplinkBase": {
			cleanup: "uplinkBaseCleanup",
			detectMsg: "C26_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COMainBase": {
			cleanup: "mainBaseCleanup",
			detectMsg: "C26_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COMediumBase": {
			cleanup: "mediumBaseCleanup",
			detectMsg: "C26_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COCyborgFactory-Arti": {
			assembly: "COb1-Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
			},
			templates: [cTempl.scyac, cTempl.scygr]
		},
		"COCyborgFactory-b1": {
			assembly: "COb1-Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.cybag, cTempl.scytk, cTempl.scyhr]
		},
		"COCyborgFactory-b2": {
			assembly: "COb2-Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 40,
			},
			templates: [cTempl.scyac, cTempl.cybth]
		},
		"COHeavyFactory-b2": {
			assembly: "COb2-Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			data: {
				regroup: true,
				repair: 20,
				count: -1,
			},
			templates: [cTempl.cohhct, cTempl.cohhrat, cTempl.cohbbt]
		},
		"COMediumFactory": {
			assembly: "COMediumFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				repair: 30,
			},
			templates: [cTempl.comact, cTempl.comagt, cTempl.comit]
		},
	});

	artilleryGroup = camMakeGroup("mainBaseGroup");

	// Rank changes on difficulty:
	// Professional (SUPEREASY/EASY/MEDIUM)
	// Veteran (HARD)
	// Elite (INSANE)
	camSetDroidRank(getObject("coMediumCommander"), (difficulty <= MEDIUM) ? 4 : (difficulty + 2));
	camManageGroup(camMakeGroup("coMediumCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4"),
		],
		interval: camSecondsToMilliseconds(40),
		repair: 67
	});
	camMakeRefillableGroup(
		camMakeGroup("mediumBaseGroup"), {
			templates: [
				cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // Heavy Cannons
				cTempl.cohraat, // Whirlwind
				cTempl.comrept, cTempl.comrept, // Repair Turrets
				cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // Super Tank Killers
				cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // Assault Gunners
				cTempl.cybag, cTempl.cybag, // More Assault Gunners (Hard+)
				cTempl.scytk, cTempl.scytk, // More Super Tank Killers (Insane)
			],
			obj: "coMediumCommander",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coMediumCommander",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 67
			}
	});

	camManageGroup(camMakeGroup("uplinkBaseGroup"), CAM_ORDER_DEFEND, {
		pos: camMakePos("uplinkBaseCorner"),
		radius: 22, // big radius
		repair: 40
	});
	camManageGroup(camMakeGroup("rippleGroup"), CAM_ORDER_FOLLOW, {
		leader: "COSensorTower",
		suborder: CAM_ORDER_DEFEND,
		data: {
			pos: camMakePos("rippleGroup"),
		}
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COUplinkBase",
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckht,
			structset: camAreaToStructSet("uplinkBaseCleanup").filter((struct) => (struct.stat !== "UplinkCentre"))
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COMainBase",
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("mainBaseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COMediumBase",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckht,
			structset: camAreaToStructSet("mediumBaseCleanup")
	});

	camAutoReplaceObjectLabel("COSensorTower");

	hackAddMessage("C26_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("mainBaseAttackGroup", camChangeOnDiff(camMinutesToMilliseconds(4.5)));
	queue("southEastAttack", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(7)));

	// Brighten the fog to 1.5 default brightness (and reduce the amount of blue by a bit)
	camSetFog(24, 24, 64);
	// Brighten the lighting a bit and add a slight orange hue
	camSetSunIntensity(.55, .55, .52);
	// Move the sun far towards the east
	camSetSunPos(-500, -200, 200);
	// Stop the rain
	camSetWeather(CAM_WEATHER_CLEAR);
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

var civilianPosIndex; //Current location of civilian groups.
var shepardCommander; //Enemy commander that protects civilians.
var hvyCommander;
var lastSoundTime; //Only play the "civilian rescued" sound every so often.
const mis_collectiveRes = [
	"R-Wpn-MG-Damage06", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage05", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage05", "R-Wpn-Cannon-ROF03", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage05", "R-Wpn-Mortar-ROF03", "R-Wpn-Mortar-Acc01", 
	"R-Wpn-Rocket-Damage05", "R-Wpn-Rocket-ROF02", "R-Wpn-Rocket-Accuracy03",
	"R-Wpn-AAGun-Damage02", "R-Wpn-AAGun-ROF02",
	"R-Defense-WallUpgrade05", "R-Struc-Materials05",
	"R-Sys-Engineering02",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade02",
	"R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat01", "R-Cyborg-Armor-Heat01",
	"R-Vehicle-Engine04",
];

//Play video about civilians being captured by the Collective. Triggered
//by destroying the air base or crossing the base3Trigger area.
function videoTrigger()
{
	hackRemoveMessage("C2C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	camPlayVideos({video: "MB2_C_MSG2", type: MISS_MSG});
	hackAddMessage("C2C_OBJ2", PROX_MSG, CAM_HUMAN_PLAYER, false);
}

//Play second video and add 30 minutes to timer when base3Trigger is crossed.
camAreaEvent("base3Trigger", function(droid)
{
	camCallOnce("videoTrigger");
});

//...Or if the player destroys the VTOL base.
function camEnemyBaseEliminated_COAirBase()
{
	camCallOnce("videoTrigger");
}

//Send idle droids in this base to attack when the player spots the base
function camEnemyBaseDetected_COAirBase()
{
	const droids = enumArea("airBaseCleanup", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && obj.group === null
	));

	camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
		count: -1,
		regroup: false,
		repair: 67
	});
}

//Enable Groups after 8 minutes or player enters groupTrigger area.
//GroundWaypoint1 is included, but is unused in the WZScript version. Also
//the defense group patrols are unused, but cause path problems anyway.
function activateGroups()
{
	camManageGroup(hvyCommander, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("groundWayPoint1"),
			camMakePos("groundWayPoint2"),
		],
		interval: camSecondsToMilliseconds(70),
		repair: 67
	});

	camManageGroup(camMakeGroup("cyborgGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("oilDerrick"),
			camMakePos("centerOfPlayerBase"),
		],
		interval: camSecondsToMilliseconds(40),
	});
}

//This controls the collective cyborg shepard groups and moving civilians
//to the transporter pickup zone. Civilians spawn around each waypoint (stops
//when all of the shepard group members are destroyed).
function captureCivilians()
{
	const wayPoints = [
		"civPoint1", "civPoint2", "civPoint3", "civPoint4",
		"civPoint5", "civPoint6", "civPoint7", "civCapturePos"
	];
	const currPos = getObject(wayPoints[civilianPosIndex]);
	const shepardCommander = getObject("coCommanderShepard");

	if (shepardCommander !== null)
	{
		//add some civs
		const NUM = 1 + camRand(3);
		for (let i = 0; i < NUM; ++i)
		{
			camAddDroid(CAM_SCAV_7, currPos, cTempl.civ);
		}

		//Only count civilians that are not in the the transporter base.
		const civs = enumArea(0, 0, 35, mapHeight, CAM_SCAV_7, false);
		//Move them
		for (let i = 0; i < civs.length; ++i)
		{
			orderDroidLoc(civs[i], DORDER_MOVE, currPos.x, currPos.y);
		}

		if (civilianPosIndex <= 5)
		{
			orderDroidLoc(shepardCommander, DORDER_MOVE, currPos.x, currPos.y);
		}

		if (civilianPosIndex === 7)
		{
			queue("sendCOTransporter", camSecondsToMilliseconds(6));
		}
		civilianPosIndex = (civilianPosIndex > 6) ? 0 : (civilianPosIndex + 1);
	}
	else
	{
		// Stop gathering civilians if the commander dies
		removeTimer("captureCivilians");
	}
}

//When rescued, the civilians will make their way towards the player's LZ
//before removal.
function civilianOrders()
{
	const lz = getObject("startPosition");
	const civs = enumDroid(CAM_SCAV_7);
	let rescued = false;

	//Check if a civilian is close to a player droid.
	for (let i = 0; i < civs.length; ++i)
	{
		const objs = enumRange(civs[i].x, civs[i].y, 6, CAM_HUMAN_PLAYER, false);
		for (let j = 0; j < objs.length; ++j)
		{
			if (objs[j].type === DROID)
			{
				rescued = true;
				orderDroidLoc(civs[i], DORDER_MOVE, lz.x, lz.y);
				break;
			}
		}
	}

	//Play the "Civilian rescued" sound and throttle it.
	if (rescued && ((lastSoundTime + camSecondsToMilliseconds(30)) < gameTime))
	{
		lastSoundTime = gameTime;
		playSound(cam_sounds.rescue.civilianRescued);
	}
}

//Capture civilans.
function eventTransporterLanded(transport)
{
	const SCAN_RADIUS = 4;
	const position = camMakePos("COLandingZone");
	const civs = enumRange(position.x, position.y, SCAN_RADIUS, CAM_SCAV_7, false);

	if ((civs.length > 0) && (camDist(transport, position) <= SCAN_RADIUS))
	{
		for (const civ of civs)
		{
			camSafeRemoveObject(civ, false);
		}
	}
}

//Send Collective transport as long as the player has not entered the base.
function sendCOTransporter()
{
	const list = [
		cTempl.scyac, cTempl.scyac, // Super Auto Cannons
		cTempl.scytk, cTempl.scytk, // Super Tank Killers
		cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // Assault Gunners
	];
	const tPos = camMakePos("COLandingZone");
	const pDroid = enumRange(tPos.x, tPos.y, 6, CAM_HUMAN_PLAYER, false);

	if (!pDroid.length)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, tPos, list,
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 2, y: 80 },
				exit: { x: 2, y: 80 }
			}
		);
	}
}

//Check if too many civilians have been captured by the Collective.
//This will automatically check for civs near landing zones and remove them.
function extraVictoryCondition()
{
	const lz = getObject("startPosition");
	const civs = enumRange(lz.x, lz.y, 30, CAM_SCAV_7, false);

	for (let i = 0; i < civs.length; ++i)
	{
		camSafeRemoveObject(civs[i], false);
	}

	//Win regardless if all civilians do not make it to the LZ.
	return true;
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.beta6.pre, {
		callback: "extraVictoryCondition"
	});

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	camSetArtifacts({
		"rippleRocket": { tech: "R-Wpn-Rocket06-IDF" }, // Ripple Rockets
		"quadbof": { tech: "R-Wpn-AAGun02" }, // Cyclone
		"COVtolFacRight": { tech: "R-Vehicle-Body02" }, // Leopard
		"COVtolFacLeft": { tech: "R-Vehicle-Prop-VTOL" }, // VTOL Propulsion
		"COInfernoEmplacement-Arti": { tech: "R-Wpn-Flamer-ROF02" }, // Flamer Autoloader Mk2
		"COResearchLab1": { tech: "R-Wpn-Cannon5" }, // Assault Cannon
		"COResearchLab2": { tech: "R-Wpn-Mortar3" }, // Pepperpot
	});

	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));

	setAlliance(CAM_THE_COLLECTIVE, CAM_SCAV_7, true);
	setAlliance(CAM_HUMAN_PLAYER, CAM_SCAV_7, true);

	// Set civilian team colour to white.
	changePlayerColour(CAM_SCAV_7, 10);

	camSetEnemyBases({
		"COAirBase": {
			cleanup: "airBaseCleanup",
			detectMsg: "C2C_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COCyborgBase": {
			cleanup: "cyborgBaseCleanup",
			detectMsg: "C2C_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COtransportBase": {
			cleanup: "transportBaseCleanup",
			detectMsg: "C2C_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COmortarBase": {
			cleanup: "mortarBaseCleanup",
			detectMsg: "C2C_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COHeavyFacL": {
			assembly: "COHeavyFacLAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 20,
			},
			templates: [cTempl.comorbt, cTempl.comit, cTempl.comhatt, cTempl.cohact, cTempl.comhmgt, cTempl.comsenst]
		},
		"COHeavyFacR": {
			assembly: "COHeavyFacRAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 20,
			},
			templates: [cTempl.cohbbt, cTempl.cohhrat, cTempl.cohhct, cTempl.comact]
		},
		"COCyborgFactoryL": {
			assembly: "COCyborgFactoryLAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [cTempl.scytk, cTempl.scyac, cTempl.cybag]
		},
		"COCyborgFactoryR": {
			assembly: "COCyborgFactoryRAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
			},
			templates: [cTempl.cybth, cTempl.scymc, cTempl.cybla]
		},
		"COCyborgFactoryS": {
			assembly: "COCyborgFactorySAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 40,
			},
			templates: [cTempl.cybhg, cTempl.scymc, cTempl.scygr]
		},
		"COVtolFacLeft": {
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: [cTempl.colcbv, cTempl.colpbv, cTempl.colcbv, cTempl.colpbv]
		},
		"COVtolFacRight": {
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			templates: [cTempl.colagv, cTempl.colatv, cTempl.colagv, cTempl.colatv]
		},
	});

	civilianPosIndex = 0;
	lastSoundTime = 0;

	// Make sure these labels are replaced if these towers are destroyed and rebuilt
	camAutoReplaceObjectLabel(["coVtolTowerE", "coVtolTowerW"]);

	// Rank changes on difficulty:
	// Regular (SUPEREASY/EASY/MEDIUM)
	// Professional (HARD)
	// Veteran (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 3 : (difficulty + 1);
	camSetDroidRank(getObject("coCommanderHeavy"), COMMANDER_RANK);
	camSetDroidRank(getObject("coCommanderShepard"), COMMANDER_RANK);

	hvyCommander = camMakeGroup("coCommanderHeavy"); // Wait for orders later
	camMakeRefillableGroup(
		camMakeGroup("heavyGroup1"), {
			templates: [
				cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // Heavy Cannons
				cTempl.comsenst, cTempl.comsenst, // Repair Turrets
				cTempl.comsenst, // Sensor
				cTempl.comhatt, // Tank Killer
				cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // Heavy Machinegunners
				cTempl.cohhrat, cTempl.cohhrat, // HRAs (Hard+)
				cTempl.scytk, cTempl.scytk, // Super Tank Killers (Insane)
			],
			obj: "coCommanderHeavy",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coCommanderHeavy",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 67
			}
	});	

	shepardCommander = camMakeGroup("coCommanderShepard"); // Wait for orders later
	camManageGroup(camMakeGroup("heavyGroup2"), CAM_ORDER_FOLLOW, {
		leader: "coCommanderShepard",
		suborder: CAM_ORDER_DEFEND, // Fall back to LZ if the commander dies
		data: {
			pos: camMakePos("civCapturePos"),
			radius: 18
		}
	});

	// VTOL Radar Tower management
	camMakeRefillableGroup(
		camMakeGroup("vtolGroup1"), {
			templates: [ // 3 Lancers, 2 Assault Guns
				cTempl.colatv, // These are listed like this
				cTempl.colagv, // because the group is refilled
				cTempl.colatv, // based on the order of the
				cTempl.colagv, // listed templates.
				cTempl.colatv,
			],
			obj: "coVtolTowerE", // Don't refill this group if the tower is gone
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerE", // Assigned to the western VTOL Radar Tower
			suborder: CAM_ORDER_ATTACK // Attack the player if the tower dies
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Assault Guns, 2 Phosphor Bombs
				cTempl.colagv,
				cTempl.colpbv,
				cTempl.colagv,
				cTempl.colpbv,
				cTempl.colagv,
			],
			obj: "coVtolTowerW",
			globalFill: true
		}, CAM_ORDER_FOLLOW, {
			leader: "coVtolTowerW",
			suborder: CAM_ORDER_ATTACK
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 90 : 180));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COCyborgBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck1"),
			structset: camAreaToStructSet("cyborgBaseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COAirBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck2"),
			structset: camAreaToStructSet("airBaseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COAirBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck3"),
			structset: camAreaToStructSet("airBaseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COtransportBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck4"),
			structset: camAreaToStructSet("transportBaseCleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COmortarBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck5"),
			structset: camAreaToStructSet("mortarBaseCleanup")
	});

	// Just turn everything on all at once :P
	camEnableFactory("COHeavyFacR");
	camEnableFactory("COHeavyFacL");
	camEnableFactory("COVtolFacLeft");
	camEnableFactory("COVtolFacRight");
	camEnableFactory("COCyborgFactoryL");
	camEnableFactory("COCyborgFactoryR");

	camPlayVideos({video: "MB2_C_MSG", type: MISS_MSG});
	hackAddMessage("C2C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("activateGroups", camChangeOnDiff(camMinutesToMilliseconds(1)));

	setTimer("civilianOrders", camSecondsToMilliseconds(2));
	setTimer("captureCivilians", camChangeOnDiff(camSecondsToMilliseconds(10)));

	// Darken the fog to 2/3 default brightness
	camSetFog(11, 11, 43);
	// Darken the lighting slightly
	camSetSunIntensity(.45, .45, .45);
	// Move the sun towards the west
	camSetSunPos(425, -400, 250);
}

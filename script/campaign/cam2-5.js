include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage06", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage05", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage05", "R-Wpn-Cannon-ROF03", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage05", "R-Wpn-Mortar-ROF02", "R-Wpn-Mortar-Acc01", 
	"R-Wpn-Rocket-Damage05", "R-Wpn-Rocket-ROF02", "R-Wpn-Rocket-Accuracy03",
	"R-Wpn-AAGun-Damage02", "R-Wpn-AAGun-ROF02",
	"R-Defense-WallUpgrade05", "R-Struc-Materials05",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade02",
	"R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat01", "R-Cyborg-Armor-Heat01",
	"R-Vehicle-Engine04",
];

camAreaEvent("vtolRemoveZone", function(droid)
{
	if ((droid.player !== CAM_HUMAN_PLAYER))
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function camEnemyBaseEliminated_COEastBase()
{
	hackRemoveMessage("C25_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

//Tell everything not grouped on map to attack
function camEnemyBaseDetected_COEastBase()
{
	const droids = enumArea(0, 0, mapWidth, mapHeight, CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && obj.group === null && obj.canHitGround
	));

	camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
		count: -1,
		regroup: false,
		repair: 80
	});
}

function setupDamHovers()
{
	camManageGroup(camMakeGroup("damGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("damWaypoint1"),
			camMakePos("damWaypoint2"),
			camMakePos("damWaypoint3"),
		],
		interval: camSecondsToMilliseconds(30),
		morale: 60,
		fallback: camMakePos("damWaypoint1"),
		repair: 67,
		regroup: true,
		count: -1
	});
}

function ambush1()
{
	camManageGroup(camMakeGroup("eastCyborgs"), CAM_ORDER_ATTACK, {
		morale: 90,
		fallback: camMakePos("crossroadWaypoint"),
		repair: 30,
		count: -1
	});

	camManageGroup(camMakeGroup("canalGuards"), CAM_ORDER_ATTACK, {
		morale: 60,
		fallback: camMakePos("COMediumFactoryAssembly"),
		repair: 67,
		count: -1
	});
}

function ambush2()
{
	camManageGroup(camMakeGroup("northCyborgs"), CAM_ORDER_ATTACK, {
		morale: 70,
		fallback: camMakePos("COMediumFactoryAssembly"),
		repair: 67,
		count: -1
	});

	camManageGroup(camMakeGroup("eastAmbushGroup"), CAM_ORDER_ATTACK, {
		morale: 70,
		fallback: camMakePos("canalWaypoint"),
		repair: 33,
		count: -1
	});
}

function enableFactories()
{
	camEnableFactory("COMediumFactory");
	camEnableFactory("COCyborgFactoryL");
	camEnableFactory("COCyborgFactoryR");
}

function vtolAttack()
{
	if (getObject("COCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	const templates = [cTempl.comacv, cTempl.colagv, cTempl.colatv]; // Assault Cannons, Assault Guns, and Lancers
	const ext = {
		limit: [2, 3, 4],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter", ext);
}

// Returns true if the name of a structure is related to the nuclear reactor (cooling towers, reactor, etc.)
// Used to prevent Collective trucks from rebuilding the reactor
function isReactorStruct(structname)
{
	return (obj.name === "Nuclear Reactor" || obj.name === "Cooling Tower" || obj.name === "Scavenger Power Generator")
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.beta7.pre,{
		area: "RTLZ",
		message: "C25_LZ",
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
		"NuclearReactor": { tech: "R-Struc-Power-Upgrade01" }, // Gas Turbine Generator
		"COMediumFactory": { tech: "R-Wpn-Rocket07-Tank-Killer" }, // Tank Killer
		"COCyborgFactoryL": { tech: "R-Wpn-MG4" }, // Assault Gun
		"COCommandCenter": { tech: "R-Sys-Sensor-Upgrade01" }, // Sensor Upgrade
	});

	camSetEnemyBases({
		"COEastBase": {
			cleanup: "baseCleanup",
			detectMsg: "C25_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"CODamBase": {
			cleanup: "damBaseCleanup",
			detectMsg: "C25_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COMediumFactory": {
			assembly: "COMediumFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				repair: 20,
			},
			templates: [cTempl.comagt, cTempl.comhatt, cTempl.comact, cTempl.cohhct, cTempl.comit]
		},
		"COCyborgFactoryL": {
			assembly: "COCyborgFactoryLAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				repair: 30,
			},
			templates: [cTempl.cybag, cTempl.cybth, cTempl.cybla]
		},
		"COCyborgFactoryR": {
			assembly: "COCyborgFactoryRAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 30,
				count: -1,
			},
			templates: [cTempl.scytk, cTempl.scyac]
		},
	});

	// NOTE: The player now has access to VTOLs and long range artillery.
	// From this point onwards, missions are going to be a lot more liberal with enemy truck use.
	// Both of the trucks below are rebuilt regardless of difficulty or tweak options.
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COEastBase",
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("baseCleanup").filter((struct) => (!isReactorStruct(struct.stat)))
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "CODamBase",
			rebuildBase: (tweakOptions.ref_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			template: cTempl.comtruckht,
			structset: camAreaToStructSet("damBaseCleanup")
	});

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace once destroyed
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "CO-WallTower-MedCan", "CO-WallTower-HypCan", true); // Medium Cannon Hardpoints
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "AASite-QuadMg1", "AASite-QuadBof", true); // Hurricanes
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "CO-WallTower-MedCan", "CO-WallTower-HypCan");
		camTruckObsoleteStructure(CAM_NEW_PARADIGM, "AASite-QuadMg1", "AASite-QuadBof");
	}

	hackAddMessage("C25_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("setupDamHovers", camSecondsToMilliseconds(30));
	queue("ambush1", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("enableFactories", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(7)));
	queue("ambush2", camChangeOnDiff(camMinutesToMilliseconds(9)));

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(.35, .35, .45);
	// Move the sun far towards the west
	camSetSunPos(500, -200, 200);
	// Constant rain
	camSetWeather(CAM_WEATHER_RAINSTORM);
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage07", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage02",
	"R-Wpn-Missile-Damage02", "R-Wpn-Missile-ROF01", "R-Wpn-Missile-Accuracy01",
	"R-Wpn-Rail-Damage01", "R-Wpn-Rail-ROF01", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage01", "R-Wpn-Energy-ROF01", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade07", "R-Struc-Materials07",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals07", "R-Cyborg-Metals07",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",
	"R-Vehicle-Engine07",
	"R-Sys-NEXUSrepair",
];
var launchInfo;
var detonateInfo;
var allInValley;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_NEXUS);
});

function vtolAttack()
{
	if (getObject("NXCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	// Scourge Missiles, Thermite Bombs, and Needle Guns
	const templates = [cTempl.nxlscouv, cTempl.nxmtbv, cTempl.nxlneedv];
	const ext = {
		limit: [3, 2, 3],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_NEXUS, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(3)), "NXCommandCenter", ext);
}

function hoverAttack()
{
	camManageGroup(camMakeGroup("lzAttackHovers"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
		repair: 60,
		repairPos: camMakePos("lzAttackHovers")
	});
}

//Setup next mission part if all missile silos are destroyed (setupNextMission()).
function missileSilosDestroyed()
{
	return enumStruct(CAM_NEXUS).filter((struct) => (struct.name === "Missile Silo")).length === 0;
}

//Nuclear missile destroys everything not in safe zone.
function nukeAndCountSurvivors()
{
	// Remove the base in the rare event an auto-explosion triggers as we nuke the base here.
	camSetEnemyBases({});
	const nuked = enumArea(0, 0, mapWidth, mapHeight, ALL_PLAYERS, false);
	const safeZone = enumArea("valleySafeZone", CAM_HUMAN_PLAYER, false);
	let foundUnit = false;

	//Make em' explode!
	for (let i = 0, len = nuked.length; i < len; ++i)
	{
		let nukeIt = true;
		const obj1 = nuked[i];

		//Check if it's in the safe area.
		for (let j = 0, len2 = safeZone.length; j < len2; ++j)
		{
			const obj2 = safeZone[j];

			if (obj1.id === obj2.id)
			{
				if (obj1.type === DROID && obj1.player === CAM_HUMAN_PLAYER)
				{
					foundUnit = true;
				}

				nukeIt = false;
				break;
			}
		}

		if (nukeIt && obj1 !== null && obj1.id !== 0)
		{
			camSafeRemoveObject(obj1, true);
		}
	}

	if (foundUnit)
	{
		// Also stash player EXP with these droids
		let droidExp = -1;
		while (droidExp != 0)
		{
			const droid = camAddDroid(CAM_HUMAN_PLAYER, "valleySafeZone", cTempl.prlmgw, "*EXP Stash*");
			droidExp = droid.experience;
			if (!droidExp)
			{
				// Don't keep extra droids with no EXP
				camSafeRemoveObject(droid);
			}
		}
	}

	return foundUnit; //Must have saved at least one unit to win.
}

//Expand the map and play video and prevent transporter reentry.
function setupNextMission()
{
	if (missileSilosDestroyed())
	{
		camSetExtraObjectiveMessage(_("Move all units into the valley"));

		camPlayVideos([cam_sounds.missile.launch.missileLaunchAborted, {video: "MB3_1B_MSG", type: CAMP_MSG}, {video: "MB3_1B_MSG2", type: MISS_MSG}]);

		setScrollLimits(0, 0, 64, 64); //Reveal the whole map.
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));

		hackRemoveMessage("CM31_TAR_UPLINK", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("CM31_HIDE_LOC", PROX_MSG, CAM_HUMAN_PLAYER);

		setReinforcementTime(-1);
		removeTimer("setupNextMission");

		camManageGroup(camMakeGroup("hillGroupHovers"), CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hillPos1"),
				camMakePos("hillPos2"),
				camMakePos("hillPos3"),
			],
			interval: camSecondsToMilliseconds(25),
			regroup: true,
			count: -1
		});

		camManageGroup(camMakeGroup("hillGroupCyborgs"), CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hillPos1"),
				camMakePos("hillPos2"),
				camMakePos("hillPos3"),
			],
			interval: camSecondsToMilliseconds(15),
			regroup: true,
			count: -1,
			morale: 25,
			fallback: camMakePos("hillGroupCyborgs")
		});
	}
}

//Play countdown sounds. Elements are shifted out of the missile launch/detonation arrays as they play.
function getCountdown()
{
	if (camDef(tweakOptions.infiniteTime) && tweakOptions.infiniteTime)
	{
		return; //Skip this with infinite time as a little optimization.
	}

	const ACCEPTABLE_TIME_DIFF = 2;
	const SILOS_DESTROYED = missileSilosDestroyed();
	const countdownObject = SILOS_DESTROYED ? detonateInfo : launchInfo;
	let skip = false;

	for (let i = 0, len = countdownObject.length; i < len; ++i)
	{
		const CURRENT_TIME = getMissionTime();
		if (CURRENT_TIME <= countdownObject[0].time)
		{
			if (CURRENT_TIME < (countdownObject[0].time - ACCEPTABLE_TIME_DIFF))
			{
				skip = true; //Huge time jump?
			}
			if (!skip)
			{
				playSound(countdownObject[0].sound, CAM_HUMAN_PLAYER);
			}

			if (SILOS_DESTROYED)
			{
				detonateInfo.shift();
			}
			else
			{
				launchInfo.shift();
			}

			break;
		}
	}
}

function enableAllFactories()
{
	camEnableFactory("NXCybFac1");
	camEnableFactory("NXCybFac2");
	camEnableFactory("NXMediumFac");
}

//For now just make sure we have all the droids in the canyon.
function unitsInValley()
{
	if (!camAllArtifactsPickedUp())
	{
		return;
	}
	if (allInValley)
	{
		return true;
	}

	const safeZone = enumArea("valleySafeZone", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));
	const allDroids = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));

	if (safeZone.length === allDroids.length)
	{
		if (nukeAndCountSurvivors())
		{
			allInValley = true;
			return true;
		}
		else
		{
			return false;
		}
	}
}

// Returns true for special structures that NEXUS trucks shouldn't rebuild
function isSpecialStruct(statName)
{
	return (
		statName === "NX-CruiseSite" ||
		statName === "UplinkCentre" ||
		statName === "PillBox1" ||
		statName === "GuardTower6H"
	);
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Destroy the missile silos"));

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	allInValley = false;

	//Time is in seconds.
	launchInfo = [
		{sound: cam_sounds.missile.launch.missileLaunchIn60Minutes, time: camMinutesToSeconds(60)},
		{sound: cam_sounds.missile.launch.missileLaunchIn50Minutes, time: camMinutesToSeconds(50)},
		{sound: cam_sounds.missile.launch.missileLaunchIn40Minutes, time: camMinutesToSeconds(40)},
		{sound: cam_sounds.missile.launch.missileLaunchIn30Minutes, time: camMinutesToSeconds(30)},
		{sound: cam_sounds.missile.launch.missileLaunchIn20Minutes, time: camMinutesToSeconds(20)},
		{sound: cam_sounds.missile.launch.missileLaunchIn10Minutes, time: camMinutesToSeconds(10)},
		{sound: cam_sounds.missile.launch.missileEnteringFinalLaunchPeriod, time: camMinutesToSeconds(5) + 10},
		{sound: cam_sounds.missile.launch.missileLaunchIn5Minutes, time: camMinutesToSeconds(5)},
		{sound: cam_sounds.missile.launch.missileLaunchIn4Minutes, time: camMinutesToSeconds(4)},
		{sound: cam_sounds.missile.launch.missileLaunchIn3Minutes, time: camMinutesToSeconds(3)},
		{sound: cam_sounds.missile.launch.missileLaunchIn2Minutes, time: camMinutesToSeconds(2)},
		{sound: cam_sounds.missile.launch.missileLaunchIn1Minute, time: camMinutesToSeconds(1)},
		{sound: cam_sounds.missile.launch.finalMissileLaunchSequenceInitiated, time: 25},
		{sound: cam_sounds.missile.countdown, time: 11},
		{sound: cam_sounds.missile.launch.missileLaunched, time: 2},
	];
	detonateInfo = [
		{sound: cam_sounds.missile.detonate.warheadActivatedCountdownBegins, time: camMinutesToSeconds(60) - 9},
		{sound: cam_sounds.missile.detonate.detonationIn60Minutes, time: camMinutesToSeconds(60) - 10},
		{sound: cam_sounds.missile.detonate.detonationIn50Minutes, time: camMinutesToSeconds(50)},
		{sound: cam_sounds.missile.detonate.detonationIn40Minutes, time: camMinutesToSeconds(40)},
		{sound: cam_sounds.missile.detonate.detonationIn30Minutes, time: camMinutesToSeconds(30)},
		{sound: cam_sounds.missile.detonate.detonationIn20Minutes, time: camMinutesToSeconds(20)},
		{sound: cam_sounds.missile.detonate.detonationIn10Minutes, time: camMinutesToSeconds(10)},
		{sound: cam_sounds.missile.detonate.detonationIn5Minutes, time: camMinutesToSeconds(5)},
		{sound: cam_sounds.missile.detonate.detonationIn4Minutes, time: camMinutesToSeconds(4)},
		{sound: cam_sounds.missile.detonate.detonationIn3Minutes, time: camMinutesToSeconds(3)},
		{sound: cam_sounds.missile.detonate.detonationIn2Minutes, time: camMinutesToSeconds(2)},
		{sound: cam_sounds.missile.detonate.detonationIn1Minute, time: camMinutesToSeconds(1)},
		{sound: cam_sounds.missile.detonate.finalDetonationSequenceInitiated, time: 20},
		{sound: cam_sounds.missile.countdown, time: 10},
	];

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.gamma3, {
		area: "RTLZ",
		playLzReminder: false,
		reinforcements: camMinutesToSeconds(3),
		callback: "unitsInValley"
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);
	setScrollLimits(0, 32, 64, 64);

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	camSetArtifacts({
		"NXMediumFac": { tech: "R-Vehicle-Body03" }, // Retaliation
		"NXCommandCenter": { tech: "R-Wpn-Flamer-Damage07" }, // Plasmite Flamer Gel
		"NXCybFac2": { tech: "R-Wpn-Missile2A-T" }, // Scourge Missile
	});

	camSetEnemyBases({
		"NX-SWBase": {
			cleanup: "baseCleanupArea",
			detectMsg: "CM31_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"NXCybFac1": {
			assembly: "NXAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
				repairPos: camMakePos("healthRetreatPos")
			},
			templates: [cTempl.ncyne, cTempl.ncysc, cTempl.ncyla]
		},
		"NXCybFac2": {
			assembly: "NXAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 40,
				repairPos: camMakePos("healthRetreatPos")
			},
			templates: [cTempl.ncyne, cTempl.ncysc, cTempl.ncyla]
		},
		"NXMediumFac": {
			assembly: "NXAssembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("patrolPos1"),
					camMakePos("patrolPos2"),
					camMakePos("patrolPos3"),
					camMakePos("patrolPos4"),
					camMakePos("patrolPos5"),
					camMakePos("patrolPos6"),
					camMakePos("patrolPos7"),
					camMakePos("patrolPos8"),
				],
				interval: camSecondsToMilliseconds(30),
				repair: 45,
				repairPos: camMakePos("healthRetreatPos")
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [cTempl.nxmscouh, cTempl.nxlflash]
		},
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_NEXUS, {
			label: "NEXUS-SWBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("baseCleanupArea").filter((struct) => !isSpecialStruct(struct.stat))
	});
	// Replace the sensor tower if it dies
	camTruckObsoleteStructure(CAM_NEW_PARADIGM, "Sys-SensoTower02", "Sys-NX-SensorTower", true);

	hackAddMessage("CM31_TAR_UPLINK", PROX_MSG, CAM_HUMAN_PLAYER);

	// This group is active immediately.
	camManageGroup(camMakeGroup("lzAttackCyborgs"), CAM_ORDER_ATTACK, {
		regroup: true,
		count: -1,
	});
	getCountdown();

	setTimer("getCountdown", camSecondsToMilliseconds(0.4));
	setTimer("setupNextMission", camSecondsToMilliseconds(2));
	queue("hoverAttack", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(5)));

	// Dim the fog and make it gray
	camSetFog(111, 111, 111);
	// Darken the lighting
	camSetSunIntensity(.4, .4, .4);
	// Constant snow
	camSetWeather(CAM_WEATHER_SNOWSTORM);
}

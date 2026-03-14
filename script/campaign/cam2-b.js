include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveRes = [
	"R-Wpn-MG-Damage06", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage04", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-Damage05", "R-Wpn-Cannon-ROF01", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage04", "R-Wpn-Mortar-ROF01", "R-Wpn-Mortar-Acc01", 
	"R-Wpn-Rocket-Damage05", "R-Wpn-Rocket-ROF01", "R-Wpn-Rocket-Accuracy03",
	"R-Defense-WallUpgrade05", "R-Struc-Materials05",
	"R-Sys-Engineering02",
	"R-Struc-RprFac-Upgrade02",
	"R-Vehicle-Metals04", "R-Cyborg-Metals04",
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

function enableAllFactories()
{
	camEnableFactory("COHeavyFacL-b1");
	camEnableFactory("COCybFacL-b2");
	camEnableFactory("COHeavyFacR-b1");
	camEnableFactory("COCybFacR-b2");
}

function camEnemyBaseDetected_COMiddleBase()
{
	hackRemoveMessage("C2B_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);

	// Order any idle droids in the base to attack
	const droids = enumArea("base4Cleanup", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === DROID && obj.group === null
	));
	camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
		count: -1,
		regroup: false,
		repair: 67
	});
}

function ambushPlayer()
{	
	// Rank changes on difficulty:
	// Trained (SUPEREASY/EASY)
	// Regular (MEDIUM)
	// Professional (HARD)
	// Veteran (INSANE)
	camSetDroidRank(getObject("COCommander"), (difficulty <= EASY) ? 2 : (difficulty + 1));
	camManageGroup(camMakeGroup("COCommander"), CAM_ORDER_ATTACK, {repair: 67});
	camMakeRefillableGroup(
		camMakeGroup("centralBaseGroup"), {
			templates: [
				cTempl.cohhct, cTempl.cohhct, // Heavy Cannons
				cTempl.cohbbt, cTempl.cohbbt, // Bunker Busters
				cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit, // Infernos
				cTempl.comsenst, // Sensor
				cTempl.comrept, // Repair Turret
				cTempl.comrept, cTempl.comrept, // Repair Turrets (Medium+)
				cTempl.comhpvt, cTempl.comhpvt, // Hyper Velocity Cannons (Hard+)
				cTempl.comhpvt, cTempl.comhpvt, // More Hyper Velocity Cannons (Insane)
			],
			// No need to specify player or factories here
			obj: "COCommander",
		}, CAM_ORDER_FOLLOW, {
			leader: "COCommander",
			repair: 67,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 67
			}
	});

	camManageGroup(camMakeGroup("NBaseGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("leftSideAmbushPos1"),
			camMakePos("leftSideAmbushPos2"),
			camMakePos("leftSideAmbushPos3"),
		],
		patrolType: CAM_PATROL_CYCLE,
		interval: camSecondsToMilliseconds(60)
	});

	camManageGroup(camMakeGroup("NBaseGroup-below"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("grp2Pos1"),
			camMakePos("grp2Pos2"),
			camMakePos("grp2Pos3"),
			camMakePos("grp2Pos4"),
			camMakePos("grp2Pos5"),
		],
		patrolType: CAM_PATROL_CYCLE,
		interval: camSecondsToMilliseconds(60)
	});
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

function transferPower()
{
	//increase player power level and play sound
	setPower(playerPower(CAM_HUMAN_PLAYER) + 4000);
	playSound(cam_sounds.powerTransferred);
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.beta4.pre);

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	camPlayVideos([{video: "MB2_B_MSG", type: CAMP_MSG}, {video: "MB2_B_MSG2", type: MISS_MSG}]);

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	camSetArtifacts({
		"COResearchLab": { tech: "R-Wpn-Cannon4AMk1" }, // Hyper Velocity Cannon
		"COHeavyFac-b4": { tech: "R-Wpn-Flame2" }, // Inferno
		"COHeavyFacL-b1": { tech: "R-Struc-Factory-Upgrade02" }, // Robotic Manufacturing
		"COCommandCenter": { tech: "R-Vehicle-Body06" }, // Panther
	});

	camSetEnemyBases({
		"CONorthBase": {
			cleanup: "base1Cleanup",
			detectMsg: "C2B_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COCentralBase": {
			cleanup: "base2Cleanup",
			detectMsg: "C2B_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COMiddleBase": {
			cleanup: "base4Cleanup",
			detectMsg: "C2B_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"COHeavyFacL-b1": {
			assembly: "COHeavyFacL-b1Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			data: {
				repair: 30,
			},
			templates: [cTempl.cohhrat, cTempl.cohhct, cTempl.comit]
		},
		"COHeavyFacR-b1": {
			assembly: "COHeavyFacR-b1Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 30,
			},
			templates: [cTempl.comatt, cTempl.comhpvt, cTempl.comhmgt]
		},
		"COCybFacL-b2": {
			assembly: "COCybFacL-b2Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
			},
			templates: [cTempl.scygr, cTempl.scymc]
		},
		"COCybFacR-b2": {
			assembly: "COCybFacR-b2Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				repair: 40,
			},
			templates: [cTempl.cybla, cTempl.cybth, cTempl.cybhg]
		},
		"COHeavyFac-b4": {
			assembly: "COHeavyFac-b4Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 30,
			},
			templates: [cTempl.comatt, cTempl.comit, cTempl.commct]
		},
		"COCybFac-b4": {
			assembly: "COCybFac-b4Assembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				repair: 40,
			},
			templates: [cTempl.cybca, cTempl.cybhg]
		},
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 90 : 180));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "CONorthBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck1"),
			structset: camAreaToStructSet("base1Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COCentralBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck2"),
			structset: camAreaToStructSet("base2Cleanup")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "COMiddleBase",
			rebuildTruck: (tweakOptions.ref_timerlessMode),
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("coTruck3"),
			structset: camAreaToStructSet("base4Cleanup")
	});

	hackAddMessage("C2B_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	camEnableFactory("COHeavyFac-b4");
	camEnableFactory("COCybFac-b4");

	queue("transferPower", camSecondsToMilliseconds(2));
	queue("ambushPlayer", camSecondsToMilliseconds(3));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));

	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Move the sun towards the east
	camSetSunPos(-225, -600, 450);
	camSetSkyType(CAM_SKY_NIGHT);
}

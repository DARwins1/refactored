include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const MIS_GAMMA_PLAYER = 1; // Player 1 is Gamma team.
const MIS_GAMMA_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(8));
const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage07", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage04", "R-Wpn-AAGun-ROF04", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage05", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage02",
	"R-Wpn-Missile-Damage02", "R-Wpn-Missile-ROF02", "R-Wpn-Missile-Accuracy01",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF01", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage02", "R-Wpn-Energy-ROF01", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade08", "R-Struc-Materials08",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-Factory-Upgrade03", "R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals07", "R-Cyborg-Metals07",
	"R-Vehicle-Armor-Heat04", "R-Cyborg-Armor-Heat04",
	"R-Vehicle-Engine07",
	"R-Sys-NEXUSrepair",
];
var gammaCommanderDeathTime;
var gammaRank;

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

	// HEAP Bombs, Scourge Missiles and Flashlights
	const templates = [cTempl.nxmtbv, cTempl.nxlscouv, cTempl.nxlflasv];
	const ext = {
		limit: [2, 3, 4],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "COCommandCenter", ext);
}

camAreaEvent("mockBattleTrigger", function(droid)
{
	camCallOnce("mockBattle");
});

function camEnemyBaseDetected_NorthGroup()
{
	camCallOnce("mockBattle");
}

function camEnemyBaseEliminated()
{
	camCallOnce("mockBattle");
}

function mockBattle()
{
	camSetObjectVision(MIS_GAMMA_PLAYER); // Grant vision to the player
	setAlliance(MIS_GAMMA_PLAYER, CAM_NEXUS, false); //brief mockup battle

	queue("setupCapture", camSecondsToMilliseconds(12));
}

function setupCapture()
{
	playSound(cam_sounds.incoming.incomingTransmission);

	queue("trapSprung", camSecondsToMilliseconds(2)); //call this a few seconds later
}

// Repaint Team Gamma and make them EVIL
// NOTE: Nothing is actually transferred to CAM_NEXUS, we just recolor Gamma and make them hostile to the player.
function trapSprung()
{
	setAlliance(MIS_GAMMA_PLAYER, CAM_NEXUS, true);
	setAlliance(MIS_GAMMA_PLAYER, CAM_HUMAN_PLAYER, false);
	camCompleteRequiredResearch(mis_nexusRes, MIS_GAMMA_PLAYER); //They get even more research.
	camPlayVideos({video: "MB3_B_MSG3", type: CAMP_MSG});
	hackRemoveMessage("CM3B_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER);

	camSetObjectVision(MIS_GAMMA_PLAYER, false); // Stop granting vision to the player

	// Add an extra hour
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(60)) + getMissionTime());
	enableAllFactories();

	sendNXTransporter();
	changePlayerColour(MIS_GAMMA_PLAYER, CAM_NEXUS); // Black painting.
	playSound(cam_sounds.nexus.synapticLinksActivated);

	setTimer("sendNXTransporter", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("aggroGammaCommander", camMinutesToMilliseconds(12));
}

function enableAllFactories()
{
	camEnableFactory("gammaFactory");
	camEnableFactory("gammaCyborgFactory");
	camEnableFactory("NXFactory");
	camEnableFactory("NXCyborgFactory");
}

//Send Nexus transport units
function sendNXTransporter()
{
	if (camCountStructuresInArea("eastLZStructs", CAM_NEXUS) === 0 &&
		camCountStructuresInArea("westLZStructs", CAM_NEXUS) === 0)
	{
		return; //Call off transport when both west and east Nexus bases are destroyed.
	}

	const LZ_ALIAS = "CM3B_TRANS"; //1 and 2
	const list = getDroidsForNXLZ();
	let lzNum;
	let pos;

	if (camCountStructuresInArea("eastLZStructs", CAM_NEXUS) > 0)
	{
		lzNum = 1;
		pos = "nexusEastTransportPos";
	}

	if (camCountStructuresInArea("westLZStructs", CAM_NEXUS) > 0 && (camRand(2) || !camDef(pos)))
	{
		lzNum = 2;
		pos = "nexusWestTransportPos";
	}

	if (camDef(pos))
	{
		camSendReinforcement(CAM_NEXUS, camMakePos(pos), list, CAM_REINFORCE_TRANSPORT, {
			message: LZ_ALIAS + lzNum,
			entry: { x: 62, y: 4 },
			exit: { x: 62, y: 4 }
		});
	}
}

function getDroidsForNXLZ()
{
	const COUNT = 10;
	const USE_ARTILLERY = camRand(2) === 0;
	let units;
	if (USE_ARTILLERY)
	{
		units = [cTempl.prhrotmht, cTempl.prhbalht, cTempl.prhhowht];
	}
	else
	{
		units = [cTempl.prhhct, cTempl.prhagt, cTempl.prhhatt, cTempl.scyhc, cTempl.scytk];
	}

	const droids = [];
	for (let i = 0; i < COUNT; ++i)
	{
		droids.push(camRandFrom(units));
	}

	if (USE_ARTILLERY)
	{
		// Make sure there's a sensor with the group
		droids.pop();
		droids.push(cTempl.prhsensht);
	}

	return droids;
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_GAMMA_PLAYER && obj.type === DROID && obj.droidType === DROID_COMMAND)
	{
		// Mark the time that the commander died
		gammaCommanderDeathTime = gameTime;
	}
}

function eventDroidBuilt(droid, structure)
{
	if (droid.player === MIS_GAMMA_PLAYER && camDroidMatchesTemplate(droid, cTempl.prhcomt))
	{
		// Gamma commander rebuilt
		addLabel(droid, "gammaCommander");
		camSetDroidRank(droid, gammaRank);
	}
}

// Delay when Gamma can rebuild their commander
function allowGammaCommanderRebuild()
{
	// Gamma's commander can be rebuild when:
	// 1.) The difficulty is above EASY
	// 2.) Enough time has passed after the commander died (about 8 minutes on this mission)
	// 3.) Gamma has a Command Relay Post
	return (difficulty > EASY) && (gameTime >= gammaCommanderDeathTime + MIS_GAMMA_COMMANDER_DELAY) && (enumStruct(MIS_GAMMA_PLAYER, COMMAND_CONTROL).length > 0);
}

// Order Gamma's command droid to attack the player
function aggroGammaCommander()
{
	camManageGroup(gammaCommander, CAM_ORDER_ATTACK, {
		repair: 75,
		repairPos: camMakePos("gammaAssembly"),
		radius: 16,
		removable: false
	});
}

// "We're sorry you just lost your army here's a compensation check"
function transferPower()
{
	const AWARD = 5000;
	setPower(playerPower(CAM_HUMAN_PLAYER) + AWARD, CAM_HUMAN_PLAYER);
	playSound(cam_sounds.powerTransferred);
}

function eventStartLevel()
{
	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.gamma4.pre);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(30))); // For the rescue mission.

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);
	camCompleteRequiredResearch(mis_gammaAllyRes, MIS_GAMMA_PLAYER);

	setAlliance(MIS_GAMMA_PLAYER, CAM_HUMAN_PLAYER, false);
	setAlliance(MIS_GAMMA_PLAYER, CAM_NEXUS, true);

	camSetArtifacts({
		"NXCommandCenter": { tech: "R-Defense-WallUpgrade08" }, // Plascrete Mk2
		"NXCyborgFactory": { tech: "R-Wpn-Laser01" }, // Flashlight
		"gammaResLabArti": { tech: "R-Wpn-AAGun-Damage04" }, // AA HEAP Flak
		"gammaFactory": { tech: "R-Wpn-Howitzer-Damage05" }, // HEAP Howitzer Shells Mk2
		"NXHeavyFactory": { tech: "R-Wpn-MdArtMissile" }, // Seraph Missile
	});

	camSetEnemyBases({
		"GammaBase": {
			cleanup: "gammaBaseCleanup",
			detectMsg: "CM3B_GAMMABASE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NXEastBase": {
			cleanup: "NXEastBaseCleanup",
			detectMsg: "CM3B_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NXWestBase": {
			cleanup: "NXWestBaseCleanup",
			detectMsg: "CM3B_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NXNorthWestBase": {
			cleanup: "NXNorthWestBaseCleanup",
			detectMsg: "CM3B_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		}
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		MIS_GAMMA_PLAYER, { // Don't rebuild this base
			label: "GammaBase",
			respawnDelay: TRUCK_TIME,
			template: cTempl.prhtruckht,
			structset: camAreaToStructSet("gammaBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXEastBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("NXEastBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXWestBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("NXWestBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NXNorthWestBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("NXNorthWestBaseCleanup")
	});

	camSetFactories({
		"gammaFactory": {
			assembly: "gammaAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				repair: 50,
			},
			templates: [cTempl.prhhct, cTempl.prhagt]
		},
		"gammaCyborgFactory": {
			assembly: "gammaAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 50,
			},
			templates: [cTempl.scyhc]
		},
		"NXFactory": {
			assembly: "NXAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 45,
				repairPos: camMakePos("NXAssembly")
			},
			templates: [cTempl.nxhserh, cTempl.nxmplash]
		},
		"NXCyborgFactory": {
			assembly: "NXCyborgAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				repair: 40,
				repairPos: camMakePos("NXCyborgAssembly")
			},
			templates: [cTempl.ncyne, cTempl.ncysc, cTempl.ncyla]
		}
	});

	gammaCommanderDeathTime = 0;
	// Rank changes on difficulty:
	// Elite (SUPEREASY/EASY/MEDIUM)
	// Special (HARD)
	// Hero (INSANE)
	gammaRank = (difficulty <= MEDIUM) ? 6 : (difficulty + 4);
	camSetDroidRank(getObject("gammaCommander"), gammaRank);
	gammaCommander = camMakeRefillableGroup(
		camMakeGroup("gammaCommander"), {
			templates: [cTempl.prhcomt],
			factories: ["gammaFactory"],
			callback: "allowGammaCommanderRebuild" // Allow Gamma to rebuild this commander after a delay
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("gammaDefensePos"), // Sit around the base for now
			repair: 75,
			repairPos: camMakePos("gammaAssembly"),
			radius: 16
	});
	camMakeRefillableGroup(
		camMakeGroup("gammaCommandGroup"), {
			templates: [
				cTempl.prhhatt, cTempl.prhhatt, cTempl.prhhatt, cTempl.prhhatt, 
				cTempl.prhhatt, cTempl.prhhatt, cTempl.prhhatt, cTempl.prhhatt, // 8 Tank Killers
				cTempl.prhagt, cTempl.prhagt, cTempl.prhagt,
				cTempl.prhagt, cTempl.prhagt, cTempl.prhagt, // 6 Assault Guns
				cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, // 4 Mechanics
				cTempl.cybrp, cTempl.cybrp, // 2 More Mechanics (Hard+)
				cTempl.prhagt, cTempl.prhagt, // 2 More Assault Guns (Insane)
			],
			factories: ["gammaFactory", "gammaCyborgFactory"]
			obj: "gammaCommander"
		}, CAM_ORDER_FOLLOW, {
			leader: "gammaCommander",
			suborder: CAM_ORDER_ATTACK,
			repair: 75,
			data: {
				repair: 75
			}
		}
	);

	camManageGroup(camMakeGroup("eastNXGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southOfRidge"),
			camMakePos("westRidge"),
			camMakePos("eastRidge"),
		],
		interval: camSecondsToMilliseconds(45),
		repair: 60,
		repairPos: camMakePos("NXCyborgAssembly")
	});
	camManageGroup(camMakeGroup("westNXGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("westPos1"),
			camMakePos("westPos2"),
		],
		interval: camSecondsToMilliseconds(45),
		repair: 60,
		repairPos: camMakePos("healthRetreatPos")
	});

	//In the event they put all trucks into Gamma 2 and have no completed factories on map...
	if (enumStruct(CAM_HUMAN_PLAYER, FACTORY).filter((obj) => (obj.status === BUILT)).length === 0 && enumDroid(CAM_HUMAN_PLAYER, DROID_CONSTRUCT).length === 0)
	{
		const failSafeTruck = camAddDroid(MIS_GAMMA_PLAYER, lz, cTempl.prhtruckht);
		donateObject(failSafeTruck, CAM_HUMAN_PLAYER); //So the reticules update for the next tick.
		playSound(cam_sounds.giftReceived);
	}

	setAlliance(MIS_GAMMA_PLAYER, CAM_HUMAN_PLAYER, true);
	hackAddMessage("CM3B_GAMMABASE", PROX_MSG, CAM_HUMAN_PLAYER, false);
	camPlayVideos([{video: "MB3_B_MSG", type: CAMP_MSG}, {video: "MB3_B_MSG2", type: MISS_MSG}]);

	changePlayerColour(MIS_GAMMA_PLAYER, playerData[0].colour);
	setAlliance(MIS_GAMMA_PLAYER, CAM_HUMAN_PLAYER, true);

	queue("transferPower", camSecondsToMilliseconds(3));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(8)));

	// Darken the fog to 3/4 default brightness
	camSetFog(137, 167, 177);
	// Move the sun towards the west
	camSetSunPos(425, -400, 450);
}

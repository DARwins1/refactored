include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage09", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage06", "R-Wpn-AAGun-ROF06", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage06", "R-Wpn-Howitzer-ROF04", "R-Wpn-Howitzer-Accuracy03",
	"R-Wpn-Bomb-Damage03",
	"R-Wpn-Missile-Damage03", "R-Wpn-Missile-ROF03", "R-Wpn-Missile-Accuracy02",
	"R-Wpn-Rail-Damage03", "R-Wpn-Rail-ROF03", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage03", "R-Wpn-Energy-ROF03", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade09", "R-Struc-Materials09",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals09", "R-Cyborg-Metals09",
	"R-Vehicle-Armor-Heat06", "R-Cyborg-Armor-Heat06",
	"R-Vehicle-Engine09",
	"R-Sys-NEXUSrepair",
];
const MIS_GAMMA_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(6));
const mis_defaultFog = {r:10, g:10, b:10};
const mis_defaultSun = {r:0.35, g:0.35, b:0.4};
var empCharge; // Decrements over time; EMP attack when zero
var playerWarned; // Warn the player when an EMP attack is imminent
var gammaCommanderDeathTime;
var commanderRank;
var strikeGroupsEnabled;

// Enable factories in the Gamma, NE, and SE bases
function enableFirstFactories()
{
	camEnableFactory("gammaFactory1");
	camEnableFactory("gammaCyborgFactory");
	camEnableFactory("NX-NEFactory");
	camEnableFactory("NX-SEFactory");
}

// Enable remaining factories in the Gamma, SW, and VTOL bases
function enableFinalFactories()
{
	camEnableFactory("gammaFactory2");
	camEnableFactory("NX-SWFactory");
	camEnableFactory("NX-SWCyborgFactory2");
	camEnableFactory("NX-VtolFactory2");
}

function enableEMPAttack()
{
	console(_("----- WARNING: EMP WEAPON DETECTED ------"));
	playSound(cam_sounds.beacon);
	setTimer("chargeEMP", camSecondsToMilliseconds(1));
}

// Charge the NEXUS EMP weapon
// Also update the "wininfo" text to show how charged it is
function chargeEMP()
{
	const chargeDiffs = [
		camMinutesToSeconds(12), // SUPEREASY
		camMinutesToSeconds(6), // EASY
		camMinutesToSeconds(5), // MEDIUM
		camMinutesToSeconds(4), // HARD
		camMinutesToSeconds(3), // INSANE
	];

	if (getObject("NX-HQ") !== null)
	{
		if (empCharge <= 0)
		{
			empAttack(); // Unleash the EMP
			empCharge = chargeDiffs[difficulty];
			playerWarned = false;
		}
		else
		{
			empCharge--;

			if (!playerWarned && empCharge <= 25)
			{
				// Warn the player that all of their units are abut to get stunned
				console(_("----- EMP ATTACK IMMINENT -----"));
				playSound(cam_sounds.uplink);
				playerWarned = true;
			}
		}

		const CHARGE_PERCENT = Math.floor(100 * ((chargeDiffs[difficulty] - empCharge) / chargeDiffs[difficulty]));
		const extraMessages = [
			_("Destroy the Nexus HQ to disable EMP attacks"),
			_("EMP Charge: " + CHARGE_PERCENT + "%"),
		];
		camSetExtraObjectiveMessage(extraMessages);
	}
	else
	{
		camSetExtraObjectiveMessage();
	}
}

// Fire the EMP
function empAttack()
{
	// Hit every player droid with an EMP
	// NOTE: Don't hit flying VTOLs with the EMP, since they freeze in the air and that looks weird
	const DACTION_NONE = 0;
	const DACTION_WAITDURINGREARM = 35;
	const droids = enumDroid(CAM_HUMAN_PLAYER);
	for (const droid of droids)
	{
		if (droid.droidType !== DROID_SUPERTRANSPORTER &&
				(!droid.isVTOL ||
					(droid.isVTOL &&
						(droid.action === DACTION_NONE || droid.action === DACTION_WAITDURINGREARM))))
		{
			fireWeaponAtObj("EMP-Cannon", droid, CAM_NEXUS); // Stun it
		}
	}

	// TODO: Also reduce sensor vision range temporarily?

	empEffects();
}

// Temporarily blue-ify the skies whenever the EMP fires
function empEffects()
{
	camSetFog(91, 113, 236); // Unaltered: r:10, g:10, b:10
	camSetSunIntensity(0.1, 0.1, 0.6); // Unaltered: r:0.35, g:0.35, b:0.4

	camGradualFog(camSecondsToMilliseconds(6), mis_defaultFog.r, mis_defaultFog.g, mis_defaultFog.b);
	camGradualSunIntensity(camSecondsToMilliseconds(6), mis_defaultSun.r, mis_defaultSun.g, mis_defaultSun.b);
}

function eventDestroyed(obj)
{
	if (obj.player === CAM_NEXUS && obj.type === DROID &&
		obj.droidType === DROID_COMMAND && camDroidMatchesTemplate(obj, cTempl.prhcomt))
	{
		// Mark the time that the commander died
		gammaCommanderDeathTime = gameTime;
	}
}

function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_NEXUS && camDroidMatchesTemplate(droid, cTempl.prhcomt))
	{
		// Gamma commander rebuilt
		addLabel(droid, "gammaCommander");
		camSetDroidRank(droid, commanderRank);
	}
}

// Delay when Gamma can rebuild their commander
function allowGammaCommanderRebuild()
{
	return (difficulty > EASY) && (gameTime >= gammaCommanderDeathTime + MIS_GAMMA_COMMANDER_DELAY) && (enumStruct(CAM_NEXUS, COMMAND_CONTROL).length > 0);
}

// Allow NEXUS to build VTOL strike groups
function enableStrikeGroups()
{
	strikeGroupsEnabled = true;
}

function allowVtolStrikeGroups()
{
	return strikeGroupsEnabled;
}

// Returns a list of objects to be targeted by Devastator VTOL strikes
function getDevastatorTargets()
{
	// Target any Repair Facility/Sensor Tower
	let targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
		struct.stattype === REPAIR_FACILITY || struct.isSensor || struct.isCB
	));

	if (!targets.length)
	{
		// If no target, start picking off any AA
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
			struct.canHitAir && !struct.canHitGround
		));
	}

	if (!targets.length)
	{
		// If STILL no target, just attack any non-wall structure
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
			struct.stattype !== WALL && struct.stattype !== GATE
		));
	}

	return targets;
}

// Returns a list of objects to be targeted by Scourge VTOL strikes
function getScourgeTargets()
{
	// Target any commander/truck/sensor
	let targets = enumDroid(CAM_HUMAN_PLAYER).filter((droid) => (
		(droid.droidType === DROID_CONSTRUCT && droid.propulsion !== "CyborgLegs") ||
		droid.droidType === DROID_COMMAND || droid.droidType === DROID_SENSOR
	));

	if (!targets.length)
	{
		// If no target, just attack any non-cyborg droid
		targets = enumDroid(CAM_HUMAN_PLAYER).filter((droid) => (
			droid.propulsion !== "CyborgLegs"
		));
	}

	return targets;
}

function eventStartLevel()
{
	const startPos = getObject("startPosition");
	const tpos = getObject("transportEntryExit");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, CAM_GAMMA_OUT, {
		area: "RTLZ",
		reinforcements: camMinutesToSeconds(1),
		eliminateBases: true
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tpos.x, tpos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tpos.x, tpos.y, CAM_HUMAN_PLAYER);
	setMissionTime(-1); //Infinite time

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	empCharge = 50; // Start with 50 seconds before attack
	playerWarned = false;
	gammaCommanderDeathTime = 0;
	strikeGroupsEnabled = false;

	camSetArtifacts({
		"NX-NEFactory": { tech: "R-Wpn-RailGun03" }, // Gauss Cannon
		"NX-SEFactory": { tech: "R-Vehicle-Body10" }, // Vengeance
	});

	camSetFactories({
		"gammaFactory1": {
			assembly: "gammaAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 50,
			},
			templates: [cTempl.prhhct, cTempl.prhhrat, cTempl.prhagt]
		},
		"gammaFactory2": {
			assembly: "gammaAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				repair: 75,
			},
			templates: [cTempl.prhiht, cTempl.prhhatht]
		},
		"gammaCyborgFactory": {
			assembly: "gammaCybAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				regroup: true,
				repair: 75,
				count: -1,
			},
			templates: [cTempl.scyhc, cTempl.scytk, cTempl.scyhr]
		},
		"NX-NEFactory": {
			assembly: "NX-NEFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			data: {
				repair: 45,
				repairPos: camMakePos("NEPatrolPos3")
			},
			templates: [cTempl.nxhgaush, cTempl.nxmrailh, cTempl.nxmplash]
		},
		"NX-SEFactory": {
			assembly: "NX-SEFactoryAssembly",
			order: CAM_ORDER_PATROL,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(120)),
			data: {
				pos: [
					camMakePos("SEPatrolPos1"),
					camMakePos("NEPatrolPos1")
				],
				reactToAttack: true,
				interval: camSecondsToMilliseconds(90),
				regroup: true,
				repair: 45,
				repairPos: camMakePos("NX-SEFactoryAssembly"),
				count: -1,
			},
			templates: [cTempl.nxhgaush, cTempl.nxhserh]
		},
		"NX-SECyborgFactory": {
			assembly: "NX-SECyborgFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 45,
				repairPos: camMakePos("NX-SECyborgFactoryAssembly"),
			},
			templates: [cTempl.ncypl, cTempl.ncyne]
		},
		"NX-SWFactory": {
			assembly: "NX-SWFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80)),
			data: {
				regroup: true,
				repair: 45,
				repairPos: camMakePos("NX-SWFactoryAssembly"),
				count: -1,
			},
			templates: [cTempl.nxmlinkh, cTempl.nxhdevh, cTempl.nxmpulseh]
		},
		"NX-SWCyborgFactory1": {
			assembly: "NX-SWCyborgFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			data: {
				regroup: true,
				repair: 45,
				repairPos: camMakePos("NX-SWCyborgFactoryAssembly"),
				count: -1,
			},
			templates: [cTempl.ncysc, cTempl.ncyla]
		},
		"NX-SWCyborgFactory2": {
			assembly: "NX-SWCyborgFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				repair: 45,
				repairPos: camMakePos("NX-SWCyborgFactoryAssembly"),
			},
			templates: [cTempl.ncysc, cTempl.ncypl]
		},
		"NX-VtolFactory1": {
			assembly: "NX-VtolFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(100)),
			data: {
				repair: 45,
			},
			templates: [cTempl.nxmhbv, cTempl.nxhrailv]
		},
		"NX-VtolFactory2": {
			assembly: "NX-VtolFactoryAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(100)),
			data: {
				repair: 45,
			},
			templates: [cTempl.nxmpulsev, cTempl.nxmtbv]
		},
	});

	camSetEnemyBases({
		"NX_SWBase": {
			cleanup: "SWBaseCleanup",
			detectMsg: "CM34_OBJ2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"gammaNWBase": {
			cleanup: "NWBaseCleanup",
			detectMsg: "CM34_BASEA",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NX_NEBase": {
			cleanup: "NEBaseCleanup",
			detectMsg: "CM34_BASEB",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NX_WBase": {
			cleanup: "WBaseCleanup",
			detectMsg: "CM34_BASEC",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NX_SEBase": {
			cleanup: "SEBaseCleanup",
			detectMsg: "CM34_BASED",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NX_VtolBase": {
			cleanup: "vtolBaseCleanup",
			detectMsg: "CM34_BASEE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	// NOTE: In this mission, timerless mode has no effect (there's no timer regardless)
	// NOTE 2: The west base doesn't have any trucks because it's small and insignificant, AGAIN.
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(60));
	camManageTrucks(
		CAM_NEXUS, {
			label: "NX_SWBase",
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("nxTruck1"),
			structset: camAreaToStructSet("SWBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NX_SWBase", // Main base gets two trucks
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("nxTruck2"),
			structset: camAreaToStructSet("SWBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "gammaNWBase",
			rebuildBase: true,
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("gammaTruck1"),
			structset: camAreaToStructSet("NWBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "gammaNWBase", // Gamma base also gets two trucks
			rebuildBase: true,
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("gammaTruck2"),
			structset: camAreaToStructSet("NWBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NX_NEBase",
			rebuildBase: true,
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("nxTruck3"),
			structset: camAreaToStructSet("NEBaseCleanup").filter((struct) => (
				struct.stat !== "CoolingTower" && struct.stat !== "NuclearReactor"
			))
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NX_SEBase",
			rebuildBase: true,
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("nxTruck4"),
			structset: camAreaToStructSet("SEBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NX_VtolBase",
			rebuildBase: true,
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("nxTruck5"),
			structset: camAreaToStructSet("vtolBaseCleanup")
	});

	// Misc. patrol groups...
	camManageGroup(camMakeGroup("SWPatrolGroup"), CAM_ORDER_PATROL, {
		pos:[
			"SWPatrolPos1",
			"SWPatrolPos2",
			"SWPatrolPos3"
		],
		reactToAttack: true,
		interval: camSecondsToMilliseconds(20),
		regroup: false,
		repair: 45,
		count: -1
	});
	camManageGroup(camMakeGroup("NEPatrolGroup"), CAM_ORDER_PATROL, {
		pos:[
			"NEPatrolPos1",
			"NEPatrolPos2",
			"NEPatrolPos3",
		],
		reactToAttack: true,
		interval: camSecondsToMilliseconds(30),
		regroup: false,
		repair: 45,
		count: -1
	});
	camManageGroup(camMakeGroup("SEPatrolGroup"), CAM_ORDER_PATROL, {
		pos:[
			"SEPatrolPos1",
			"SEPatrolPos2"
		],
		reactToAttack: true,
		interval: camSecondsToMilliseconds(20),
		regroup: false,
		repair: 45,
		count: -1
	});
	camManageGroup(camMakeGroup("NWPatrolGroup"), CAM_ORDER_PATROL, {
		pos:[
			"NWPatrolPos1",
			"NWPatrolPos5"
		],
		reactToAttack: true,
		interval: camSecondsToMilliseconds(35),
		regroup: false,
		repair: 45,
		count: -1
	});

	// Commander groups...
	// Rank changes on difficulty:
	// Elite (SUPEREASY/EASY/MEDIUM)
	// Special (HARD)
	// Hero (INSANE)
	commanderRank = (difficulty <= MEDIUM) ? 6 : (difficulty + 4);
	camSetDroidRank(getObject("trophyCommander"), commanderRank);
	camSetDroidRank(getObject("gammaCommander"), commanderRank);
	camMakeRefillableGroup(
		camMakeGroup("gammaCommander"), {
			templates: [cTempl.prhcomt],
			factories: ["gammaFactory1", "gammaFactory2"],
			callback: "allowGammaCommanderRebuild"
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("NWPatrolPos2"),
				camMakePos("NWPatrolPos3"),
				camMakePos("NWPatrolPos4"),
			],
			interval: camSecondsToMilliseconds(40),
			reactToAttack: true,
			repair: 75,
			repairPos: camMakePos("NX-SWCyborgFactoryAssembly"),
			radius: 16
	});
	camMakeRefillableGroup(
		getObject("gammaCommandGroup"), {
			templates: [
				cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, // 4 Mechanics
				cTempl.prhhct, cTempl.prhhct, cTempl.prhhct,
				cTempl.prhhct, cTempl.prhhct, cTempl.prhhct, // 6 Heavy Cannons
				cTempl.prhagt, cTempl.prhagt, cTempl.prhagt,
				cTempl.prhagt, cTempl.prhagt, cTempl.prhagt, // 6 Assault Guns
				cTempl.prhraat, cTempl.prhraat, // 2 Whirlwinds
				cTempl.prhraat, cTempl.prhraat, // 2 More Whirlwinds (Hard+)
				cTempl.prhhct, cTempl.prhhct, // 2 More Heavy Cannons (Insane)
			],
			factories: ["gammaFactory1", "gammaFactory2", "gammaCyborgFactory"],
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
	// NOTE: The "trophy" commander is never rebuilt
	camManageGroup(camMakeGroup("trophyCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("trophyPatrolPos1"),
			camMakePos("trophyPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(40),
		reactToAttack: true,
		repair: 67,
		repairPos: camMakePos("NX-SWCyborgFactoryAssembly"),
		radius: 16
	});
	camMakeRefillableGroup(
		camMakeGroup("trophyCommandGroup"), {
			// NOTE: These templates are all different than what this commander starts with
			templates: [
				cTempl.nxhgaush, cTempl.nxhgaush, cTempl.nxhgaush, cTempl.nxhgaush, // 4 Gauss Cannons
				cTempl.nxhserh, cTempl.nxhserh, cTempl.nxhserh, cTempl.nxhserh, // 4 Seraphs
				cTempl.nxmpulseh, cTempl.nxmpulseh, // 2 Pulse Lasers
				cTempl.ncypl, cTempl.ncypl, cTempl.ncypl, cTempl.ncypl, // 4 Plasmite Flamer Cyborgs
				cTempl.ncysc, cTempl.ncysc, cTempl.ncysc, cTempl.ncysc, // 4 Scourge Cyborgs
				cTempl.nxmpulseh, cTempl.nxmpulseh, // 2 More Pulse Lasers (Hard+)
				cTempl.nxmsamh, cTempl.nxmsamh, // 2 Vindicators
			],
			globalFill: true,
			obj: "trophyCommander"
		}, CAM_ORDER_FOLLOW, {
			leader: "trophyCommander",
			suborder: CAM_ORDER_ATTACK,
			repair: 67,
			repairPos: camMakePos("NX-SWCyborgFactoryAssembly"),
			data: {
				repair: 67
			}
		}
	);

	// VTOL tower groups...
	camMakeRefillableGroup(
		camMakeGroup("vtolGroup1"), {
			templates: [ // 3 Scourge Missiles, 3 Pulse Lasers
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "gammaVtolTower",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		camMakeGroup("vtolGroup2"), {
			templates: [ // 3 Scourge Missiles, 3 Pulse Lasers
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
				cTempl.nxlscouv,
				cTempl.nxlpulsev,
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolTowerE",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Pulse Lasers
				cTempl.nxmpulsev, cTempl.nxmpulsev, cTempl.nxmpulsev, cTempl.nxmpulsev, 
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolTowerS",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Scourge Missiles, 2 Thermite Bombs
				cTempl.nxlscouv,
				cTempl.nxmtbv,
				cTempl.nxlscouv,
				cTempl.nxmtbv,
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolTowerW",
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HEAP Bombs
				cTempl.nxmhbv, cTempl.nxmhbv, cTempl.nxmhbv, cTempl.nxmhbv, 
			],
			globalFill: true,
		}, CAM_ORDER_FOLLOW, {
			leader: "nxVtolTowerCB",
			suborder: CAM_ORDER_ATTACK
	});

	// VTOL strike groups...
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Devastators
				cTempl.nxldevv, cTempl.nxldevv, cTempl.nxldevv, 
			],
			factories: ["NX-VtolFactory1"],
			callback: "allowVtolStrikeGroups"
		}, CAM_ORDER_STRIKE, {
			callback: "getDevastatorTargets",
			minSize: 3, // Don't attack until the group is full
			altOrder: CAM_ORDER_DEFEND, // Sit by the factories until ready
			pos: camMakePos("NX-VtolFactoryAssembly")
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Scourges
				cTempl.nxlscouv, cTempl.nxlscouv, cTempl.nxlscouv, cTempl.nxlscouv,
			],
			factories: ["NX-VtolFactory2"],
			callback: "allowVtolStrikeGroups"
		}, CAM_ORDER_STRIKE, {
			callback: "getScourgeTargets",
			minSize: 4,
			altOrder: CAM_ORDER_DEFEND,
			pos: camMakePos("NX-VtolFactoryAssembly")
	});

	camAutoReplaceObjectLabel(["NX-HQ", "gammaVtolTower", "nxVtolTowerW", "nxVtolTowerE", "nxVtolTowerS", "nxVtolTowerCB"]);

	//Show Project transport flying video.
	camPlayVideos({video: "MB3_4_MSG3", type: CAMP_MSG});
	hackAddMessage("CM34_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);

	// These factories are active immediately
	camEnableFactory("NX-SWCyborgFactory1");
	camEnableFactory("NX-SECyborgFactory");
	camEnableFactory("NX-VtolFactory1");

	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(4)))
	queue("enableStrikeGroups", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("enableEMPAttack", camChangeOnDiff(camMinutesToMilliseconds(12)));

	// Darken the fog to be nearly pitch black
	camSetFog(mis_defaultFog.r, mis_defaultFog.g, mis_defaultFog.b); // r:10, g:10, b:10
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(mis_defaultSun.r, mis_defaultSun.g, mis_defaultSun.b); // r:0.35, g:0.35, b:0.4
	// Move the sun towards the east
	camSetSunPos(-225, -600, 450);
	camSetSkyType(CAM_SKY_NIGHT);
	// Stop the snow
	camSetWeather(CAM_WEATHER_CLEAR);
}

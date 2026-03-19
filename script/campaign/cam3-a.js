include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_nexusRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy03",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy02",
	"R-Wpn-Bomb-Damage02",
	"R-Wpn-Missile-Damage01", "R-Wpn-Missile-ROF01", "R-Wpn-Missile-Accuracy01",
	"R-Wpn-Rail-Damage01", "R-Wpn-Rail-ROF01", "R-Wpn-Rail-Accuracy01",
	"R-Wpn-Energy-Damage01", "R-Wpn-Energy-ROF01", "R-Wpn-Energy-Accuracy01",
	"R-Defense-WallUpgrade07", "R-Struc-Materials07",
	"R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	"R-Struc-Factory-Upgrade03", "R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals07", "R-Cyborg-Metals07",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",
	"R-Vehicle-Engine07",
	"R-Sys-NEXUSrepair",
];
var transporterIndex; //Number of bonus transports that have flown in.
var startedFromMenu;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", CAM_NEXUS);
});

function setUnitRank(transport)
{
	const ranks = ["Hero", "Special", "Elite", "Veteran"];
	const droids = enumCargo(transport);

	for (const droid of droids)
	{
		camSetDroidRank(droid, ranks[transporterIndex - 1]);
	}
}

function eventTransporterLanded(transport)
{
	if (startedFromMenu)
	{
		setUnitRank(transport);
	}
}

// Make sure NEXUS isn't caught slacking
function camEnemyBaseEliminated()
{
	activateSecondFactories();
	enableAllFactories();
	camCallOnce("vtolAttack");
}

// Enable the SW and NE factories
function activateSecondFactories()
{
	camEnableFactory("NXHvyFac-b2");
	camEnableFactory("NXcybFac-b3");
}

// Enable the NW Cyborg Factory
function enableAllFactories()
{
	camEnableFactory("NXcybFac-b4");
}

//Extra transport units are only awarded to those who start Gamma campaign
//from the main menu.
function sendPlayerTransporter()
{
	const transportLimit = 4; //Max of four transport loads if starting from menu.
	if (!camDef(transporterIndex))
	{
		transporterIndex = 0;
	}

	if (transporterIndex === transportLimit)
	{
		removeTimer("sendPlayerTransporter");
		return;
	}

	const droids = [];
	const bodyList = [tBody.tank.tiger, tBody.tank.tiger, tBody.tank.python, tBody.tank.mantis];
	const propulsionList = [tProp.tank.hover, tProp.tank.hover, tProp.tank.tracks];
	const weaponList = [
		tWeap.tank.assaultCannon, tWeap.tank.assaultCannon, tWeap.tank.inferno,
		tWeap.tank.inferno, tWeap.tank.assaultGun, tWeap.tank.assaultGun,
		tWeap.tank.hyperVelocityCannon, tWeap.tank.tankKiller
	];
	const specialList = [tConstruct.truck, tConstruct.truck, tCommand.commander, tCommand.commander];
	const BODY = bodyList[camRand(bodyList.length)];
	const PROP = propulsionList[camRand(propulsionList.length)];

	for (let i = 0; i < 10; ++i)
	{
		let prop = PROP;
		let weap = (!transporterIndex && (i < specialList.length)) ? specialList[i] : weaponList[camRand(weaponList.length)];
		if (transporterIndex === 1 && i < 4)
		{
			weap = tWeap.tank.whirlwind; //Bring 4 Whirlwinds on the 2nd transport.
		}
		if (BODY === tBody.tank.mantis)
		{
			prop = tProp.tank.tracks; //Force Mantis to use Tracks.
		}
		if (weap === tConstruct.truck)
		{
			prop = tProp.tank.hover; //Force trucks to use Hover.
		}
		droids.push({ body: BODY, prop: prop, weap: weap });
	}

	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 63, y: 118 },
			exit: { x: 63, y: 118 }
		}
	);

	transporterIndex += 1;
}

//Setup Nexus VTOL hit and runners.
function vtolAttack()
{
	if (getObject("NXCommandCenter") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	// Scourge Missiles, Thermite Bombs, and Needle Guns
	const templates = [cTempl.nxlscouv, cTempl.nxmtbv, cTempl.nxlneedv];
	const ext = {
		limit: [2, 2, 3],
		alternate: true,
		dynamic: true // Change attack rate based on how many VTOLs are shot down
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAppearPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(3)), "COCommandCenter", ext);
}

function eventStartLevel()
{
	const PLAYER_POWER = 16000;
	const startPos = getObject("startPosition");
	const lz = getObject("landingZone");
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, cam_levels.gamma2.pre);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"NXPowerGenArti": { tech: "R-Struc-Power-Upgrade02" }, // Vapor Turbine Generator
		"NXResearchLabArti": { tech: "R-Wpn-Missile-Accuracy01" }, // Target Prediction Missiles
		"NXCommandCenter": { tech: "R-Sys-Engineering03" }, // Advanced Engineering
		"NXcybFac-b4": { tech: "R-Wpn-RailGun01" }, // Needle Gun
	});

	setPower(PLAYER_POWER, CAM_HUMAN_PLAYER);
	for (let x = 0, l = mis_structsAlpha.length; x < l; ++x)
	{
		enableStructure(mis_structsAlpha[x], CAM_HUMAN_PLAYER);
	}
	camCompleteRequiredResearch(mis_gammaAllyRes, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(mis_gammaAllyRes, CAM_NEXUS);
	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	camSetEnemyBases({
		"NEXUS-WBase": {
			cleanup: "westBaseCleanup",
			detectMsg: "CM3A_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NEXUS-SWBase": {
			cleanup: "southWestBaseCleanup",
			detectMsg: "CM3A_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NEXUS-NEBase": {
			cleanup: "northEastBaseCleanup",
			detectMsg: "CM3A_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NEXUS-NWBase": {
			cleanup: "northWestBaseCleanup",
			detectMsg: "CM3A_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"NXcybFac-b3": {
			assembly: "NXcybFac-b3Assembly",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40,
				repairPos: camMakePos("northPos2")
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [cTempl.ncyne, cTempl.ncysc]
		},
		"NXcybFac-b2": {
			assembly: "NXb2Assembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("NXb2Assembly"),
					camMakePos("westEntrancePatrol"),
					camMakePos("playerLZPatrol"),
				],
				repair: 40,
				repairPos: camMakePos("NXb2Assembly")
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			templates: [cTempl.ncyne, cTempl.ncysc]
		},
		"NXHvyFac-b2": {
			assembly: "NXb2Assembly",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 45,
				repairPos: camMakePos("NXb2Assembly")
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: (difficulty === INSANE) ? cTempl.nxmscouh : [] // Only refill patrol group on lower difficulties
		},
		"NXcybFac-b4": {
			assembly: "NXcybFac-b4Assembly",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40,
				repairPos: camMakePos("NXcybFac-b4Assembly")
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			templates: [cTempl.ncyne, cTempl.ncysc]
		},
	});

	camPlayVideos([{video: "MB3A_MSG", type: CAMP_MSG}, {video: "MB3A_MSG2", type: MISS_MSG}]);
	startedFromMenu = false;

	//Only if starting Gamma directly rather than going through Beta
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		
		// Subsequent transport droids are randomly chosen from this pool
		const attackPool = [ // Misc. cyborgs and tanks
			cTempl.cybag, cTempl.scytk, cTempl.cybth, cTempl.scyhc,
			cTempl.prhacht, cTempl.cohaght, cTempl.cohhatht, cTempl.cohbbht, cTempl.prhiht,
		];

		const artPool = [ // Pepperpots, Ballistas, and HRAs
			cTempl.prhrotmht, cTempl.prhbalht, cTempl.cohhraht,
		];

		const vtolPool = [ // Misc. VTOLs
			cTempl.comhbv, cTempl.comtbv, cTempl.comhatv, cTempl.comacv, cTempl.comagv, 
		];

		// Store units "offworld", so that the player can bring them in via transport.
		// The chosen units are distributed (roughly) as: 1/2 "attack" units, 1/4 artillery, 1/4 VTOLs
		const NUM_DROIDS = 50;
		let numAttackDroids = (NUM_DROIDS / 2) + NUM_DROIDS % 4;
		let numArtilleryDroids = Math.floor(NUM_DROIDS / 4);
		let numVtolDroids = Math.floor(NUM_DROIDS / 4);
		for (let i = 0; i < NUM_DROIDS; i++)
		{
			const choice = [];
			let template;
			if (numAttackDroids > 0) choice.push("attack");
			if (numArtilleryDroids > 0) choice.push("artillery");
			if (numVtolDroids > 0) choice.push("vtol");
			switch (camRandFrom(choice))
			{
				case "attack":
				{
					// Choose a random attack template
					template = camRandFrom(attackPool);
					break;
				}
				case "artillery":
				{
					// Choose a random artillery template
					template = camRandFrom(artPool);
					break;
				}
				case "vtol":
				{
					// Choose a random vtol template
					template = camRandFrom(vtolPool);
					break;
				}
			}

			// Create the droid
			camAddDroid(CAM_HUMAN_PLAYER, -1, template);
			// NOTE: We can't give the offworld droid XP here, since the scripting API can't find it.
			// Instead, we'll grant XP when the transport drops it off.
		}

		// Send a pre-filled transport with a commander and some high-rank droids
		const firstTransportDroids = [
			cTempl.cohcomht, // 1 Command Turret
			cTempl.cohhatht, cTempl.cohhatht, cTempl.cohhatht, // 3 Tank Killers
			cTempl.cohaght, cTempl.cohaght, cTempl.cohaght, // 3 Assault Guns
			cTempl.prhtruckht, cTempl.prhtruckht, cTempl.prhtruckht, // 3 Trucks
		];

		camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), firstTransportDroids,
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 87, y: 126 },
				exit: { x: 87, y: 126 }
			}
		);
	}
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		sendPlayerTransporter();
		setTimer("sendPlayerTransporter", camMinutesToMilliseconds(5));
	}
	else
	{
		setReinforcementTime(camMinutesToSeconds(3)); // 3 min.
	}

	// NOTE: The west base doesn't have any trucks because it's small and insignificant.
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.ref_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_NEXUS, {
			label: "NEXUS-SWBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("southWestBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NEXUS-NEBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("northEastBaseCleanup")
	});
	camManageTrucks(
		CAM_NEXUS, {
			label: "NEXUS-NWBase",
			rebuildBase: tweakOptions.ref_timerlessMode,
			respawnDelay: TRUCK_TIME,
			template: cTempl.nxmtruckh,
			structset: camAreaToStructSet("northWestBaseCleanup")
	});

	// Add a Seraph tank on Hard+
	const patrolTemplates = [
		cTempl.nxmscouh,
		cTempl.nxmrailh,
		cTempl.nxmscouh,
		cTempl.nxmrailh,
	]
	if (difficulty >= HARD) patrolTemplates.push(cTempl.nxhserh);
	camMakeRefillableGroup(
		camMakeGroup("hoverPatrolGrp"), {
			templates: patrolTemplates,
			globalFill: true
		}, CAM_ORDER_PATROL{
		pos: [
			camMakePos("hoverGrpPos1"),
			camMakePos("hoverGrpPos2"),
			camMakePos("hoverGrpPos3"),
		],
		interval: camSecondsToMilliseconds(20),
		repair: 80, // Be as annoying as possible
		repairPos: camMakePos("hoverGrpPos3")
	});
	camManageGroup(camMakeGroup("cybAttackers"), CAM_ORDER_ATTACK, {
		pos: [
			camMakePos("northPos2"),
			camMakePos("playerLZPatrol"),
		],
		regroup: true,
		count: -1,
	});
	camManageGroup(camMakeGroup("cybValleyPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("NXb2Assembly"),
			camMakePos("westEntrancePatrol"),
			camMakePos("playerLZPatrol"),
		]
	});
	camManageGroup(camMakeGroup("NEDefenderGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("northPos1"),
			camMakePos("northPos2"),
		],
		interval: camMinutesToMilliseconds(1),
		regroup: true,
		count: -1,
		repair: 60,
		repairPos: camMakePos("NXcybFac-b3Assembly")
	});
	camManageGroup(camMakeGroup("NAmbushCyborgs"), CAM_ORDER_ATTACK);

	// This factory is active from the start
	camEnableFactory("NXcybFac-b2");

	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("camCallOnce", camChangeOnDiff(camMinutesToMilliseconds(12)), "vtolAttack");
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(18)));
}

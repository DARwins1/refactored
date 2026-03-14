include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade03",
	"R-Struc-Materials03", "R-Vehicle-Engine02",
	"R-Vehicle-Metals02", "R-Cyborg-Metals02", "R-Wpn-Cannon-Damage02",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-Damage02", "R-Wpn-Rocket-Accuracy02", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Rocket-Damage02", "R-Wpn-Rocket-ROF01", "R-Sys-Engineering01",
	"R-Wpn-Mortar-ROF01", "R-Struc-RprFac-Upgrade01",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-Mortar-Damage02", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Vehicle-Metals01",
	"R-Defense-WallUpgrade02", "R-Struc-Materials02",
];
var useHeavyReinforcement;
var npCommander;

//Get some droids for the New Paradigm transport
function getDroidsForNPLZ()
{
	let lightAttackerLimit = 8;
	let heavyAttackerLimit = 6;
	let unitTemplates;
	const list = [];

	if (difficulty === HARD)
	{
		lightAttackerLimit = 9;
		heavyAttackerLimit = 7;
	}
	else if (difficulty >= INSANE)
	{
		lightAttackerLimit = 10;
		heavyAttackerLimit = 8;
	}

	if (useHeavyReinforcement)
	{
		const artillery = [cTempl.npmmorbht];
		const other = (difficulty >= HARD) ? [cTempl.nphmct] : [cTempl.npmmct];
		if (camRand(2) > 0)
		{
			//Add a sensor if artillery was chosen for the heavy units
			list.push(cTempl.npmsensht);
			unitTemplates = artillery;
		}
		else
		{
			unitTemplates = other;
		}
	}
	else
	{
		unitTemplates = [cTempl.nplatht, cTempl.nplmraht, cTempl.npmbbht];
	}

	const LIM = useHeavyReinforcement ? heavyAttackerLimit : lightAttackerLimit;
	for (let i = 0; i < LIM; ++i)
	{
		list.push(unitTemplates[camRand(unitTemplates.length)]);
	}

	useHeavyReinforcement = !useHeavyReinforcement; //switch it
	return list;
}

// Enable the two southern scav factories
function enableSouthScavFactories()
{
	camEnableFactory("ScavSouthWestFactory");
	camEnableFactory("ScavSouthEastFactory");
}

// Enable the northern scav factory and the NP Cyborg factory
function enableNorthFactories()
{
	camEnableFactory("NPCyborgFactory");
	camEnableFactory("ScavNorthFactory");
}

// Enable the NP vehicle factories
function enableNPVehicleFactories()
{
	camEnableFactory("NPLeftFactory");
	camEnableFactory("NPRightFactory");
}

function activateNPLZTransporter()
{
	setTimer("sendNPTransport", camChangeOnDiff(camMinutesToMilliseconds(4)));
	sendNPTransport();
}

function sendNPTransport()
{
	const nearbyDefense = enumArea("LandingZone2", CAM_NEW_PARADIGM, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype === DEFENSE
	));

	if (nearbyDefense.length > 0)
	{
		const list = getDroidsForNPLZ();
		camSendReinforcement(CAM_NEW_PARADIGM, camMakePos("NPTransportPos"), list, CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 42 },
			exit: { x: 2, y: 42 },
			order: CAM_ORDER_ATTACK
		});
	}
}

// Make the NP commander more aggressive towards the player (if it's still alive)
function aggroNPCommander()
{
	camManageGroup(npCommander, CAM_ORDER_ATTACK, {repair: 66});
}

//Destroying the New Paradigm base will activate all scav factories
//And make any unfound scavs attack the player
function camEnemyBaseEliminated_NPBaseGroup()
{
	//Enable all scav factories
	camEnableFactory("ScavNorthFactory");
	camEnableFactory("ScavSouthWestFactory");
	camEnableFactory("ScavSouthEastFactory");

	//Make all scavengers on map attack
	camManageGroup(
		camMakeGroup(enumArea(0, 0, mapWidth, mapHeight, CAM_SCAV_7, false)),
		CAM_ORDER_ATTACK
	);
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha10, {
		area: "RTLZ",
		message: "C1-5_LZ",
		reinforcements: camMinutesToSeconds(3),
		annihilate: true
	});

	useHeavyReinforcement = false; //Start with a light unit reinforcement first
	const lz = getObject("LandingZone1"); //player lz
	const tEnt = getObject("TransporterEntry");
	const tExt = getObject("TransporterExit");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	//Transporter is the only droid of the player's on the map
	const transporter = enumDroid();
	cameraTrack(transporter[0]);

	//Make sure the New Paradigm and Scavs are allies
	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetArtifacts({
		"NPRightFactory": { tech: "R-Struc-Factory-Upgrade01" }, // Automated Manufacturing
		"NPCommandCenter": { tech: "R-Defense-WallUpgrade03" }, // Improved Hardcrete Mk3
		"NPResearchFacility": { tech: "R-Comp-SynapticLink" }, // Synaptic Link
	});

	camSetEnemyBases({
		"ScavNorthGroup": {
			cleanup: "ScavNorth",
			detectMsg: "C1-5_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"ScavSouthWestGroup": {
			cleanup: "ScavSouthWest",
			detectMsg: "C1-5_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"ScavSouthEastGroup": {
			cleanup: "ScavSouthEast",
			detectMsg: "C1-5_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"NPBaseGroup": {
			cleanup: "NPBase",
			detectMsg: "C1-5_OBJ1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_NEW_PARADIGM
		},
	});

	camSetFactories({
		"NPLeftFactory": {
			assembly: "NPLeftAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: [ cTempl.npmmcht, cTempl.npmflamht, cTempl.npmhmght, cTempl.nplmraht ],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
		},
		"NPRightFactory": {
			assembly: "NPRightAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			templates: [ cTempl.nphmct, cTempl.npmmct, cTempl.npmmct ],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
		},
		"NPCyborgFactory": {
			assembly: "NPCyborgAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			templates: [ cTempl.cybca, cTempl.cybfl, cTempl.cybhg ],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
		},
		"ScavSouthWestFactory": {
			assembly: "ScavSouthWestAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.firetruck, cTempl.rbjeep, cTempl.rbuggy, cTempl.kevbloke ],
			data: {
				regroup: false,
				count: -1,
			},
		},
		"ScavSouthEastFactory": {
			assembly: "ScavSouthEastAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.kevlance, cTempl.rbjeep, cTempl.kevbloke ],
			data: {
				regroup: false,
				count: -1,
			},
		},
		"ScavNorthFactory": {
			assembly: "ScavNorthAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.buscan, cTempl.rbjeep, cTempl.gbjeep, cTempl.kevlance, cTempl.minitruck ],
			data: {
				regroup: false,
				count: -1,
			},
		},
	});

	// Rank changes on difficulty:
	// Green (SUPEREASY/EASY/MEDIUM)
	// Trained (HARD)
	// Regular (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 1 : (difficulty - 1);
	camSetDroidRank(getObject("npCommander"), COMMANDER_RANK);

	npCommander = camManageGroup(camMakeGroup("npCommander"), CAM_ORDER_PATROL, {
		pos: [ // These orders are overwritten later
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
		],
		interval: camSecondsToMilliseconds(30),
		repair: 66
	});
	camMakeRefillableGroup(
		camMakeGroup("NPCommandGroup"), {
			templates: [
				cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, cTempl.npmmct, // Medium Cannons
				cTempl.nphmct, cTempl.nphmct, // Medium Cannons (Mantis)
				cTempl.npmrept, cTempl.npmrept, // Repair Turrets
				cTempl.nphmct, cTempl.nphmct, // More Medium Cannons (Hard+)
				cTempl.npmatt, cTempl.npmatt, // Lancers (Insane)
			],
			obj: "npCommander",
			player: CAM_NEW_PARADIGM
		}, CAM_ORDER_FOLLOW, {
			leader: "npCommander",
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 33,
			},
			repair: 66,
	});

	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(90));
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPBaseGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode, // Don't rebuild this truck unless we're on timerless mode
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("npTruck1"), // Use the truck already on the map
			structset: camAreaToStructSet("NPBase")
	});
	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "NPBaseGroup",
			rebuildTruck: tweakOptions.ref_timerlessMode, // Don't rebuild this truck unless we're on timerless mode
			respawnDelay: TRUCK_TIME,
			truckDroid: getObject("npTruck2"),
			structset: camAreaToStructSet("NPBase")
	});

	queue("enableSouthScavFactories", camChangeOnDiff(camMinutesToMilliseconds(0.5)));
	queue("enableNorthFactories", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("enableNPVehicleFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("activateNPLZTransporter", camChangeOnDiff(camMinutesToMilliseconds(9)));
	queue("aggroNPCommander", camChangeOnDiff(camMinutesToMilliseconds(14)));

	// Darken the fog to 2/3 default brightness
	camSetFog(117, 95, 63);
	// Move the sun slightly towards the east
	camSetSunPos(-425, -400, 450);
}

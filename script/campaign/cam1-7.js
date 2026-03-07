include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade03",
	"R-Struc-Materials03", "R-Vehicle-Engine03",
	"R-Vehicle-Metals02", "R-Cyborg-Metals02", "R-Wpn-Cannon-Damage03",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Rocket-Accuracy02", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Rocket-Damage03", "R-Wpn-Rocket-ROF01", "R-Sys-Engineering01",
	"R-Wpn-Mortar-ROF01",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-Damage03",
	"R-Wpn-Cannon-Damage03", "R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Vehicle-Metals02",
	"R-Defense-WallUpgrade03", "R-Struc-Materials03",
];
const MIS_NEW_ARTI_LABEL = "newArtiLabel"; //Label for the picked-up artifact once dropped.

var playerHasArtifact; // True when the player has collected the artifact (and can escape)
var enemyStoleArtifact; // True when the New Paradigm have successfully escaped with the artifact

//These enable scav factories when close enough
function enableScavFactories()
{
	camEnableFactory("scavNorthEastFactory");
	camEnableFactory("scavSouthEastFactory");
	camEnableFactory("scavMiddleFactory");
}

// Order the NP BBs to attack the player
function npAttack()
{
	camManageGroup(camMakeGroup("npAttackGroup"), CAM_ORDER_ATTACK, {regroup: true, count: -1});
}

// Spawn a convoy that travels towards the NP LZ
// The convoy is lead by a commaner carrying an artifact
function startConvoy()
{
	// This wave spawns with a commander
	// Rank changes on difficulty:
	// Trained (SUPEREASY/EASY/MEDIUM)
	// Regular (HARD)
	// Professional (INSANE)
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? 2 : (difficulty);
	const commTemplate = (difficulty >= HARD) ? cTempl.nphcomt : cTempl.npmcomt;
	const commDroid = camAddDroid(CAM_NEW_PARADIGM, "convoyEntrance", commTemplate);
	addLabel(commDroid, "npCommander");
	camSetDroidRank(commDroid, COMMANDER_RANK);
	camManageGroup(camMakeGroup(commDroid), CAM_ORDER_COMPROMISE, {pos: camMakePos("NPLZ")});
	camAddArtifact("npCommander", "R-Vehicle-Metals03"); // Composite Alloys Mk3

	const convoyDroids = [
		cTempl.nphhct, cTempl.nphhct, // Heavy Cannons
		cTempl.nphmct, cTempl.nphmct, cTempl.nphmct, cTempl.nphmct, // Medium Cannons
		cTempl.npmrept, cTempl.npmrept, // Repair Turrets
		cTempl.npmmrat, cTempl.npmmrat, // MRAs
		cTempl.npmhmgt, cTempl.npmhmgt, // HMGs (Hard+)
		cTempl.npmhmgt, cTempl.npmhmgt, // HMGs (Insane)
	];

	// Send in the rest of the convoy
	camSendReinforcement(CAM_NEW_PARADIGM, getObject("convoyEntrance"), convoyDroids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_FOLLOW,
		data: {
			leader: "npCommander",
			suborder: CAM_ORDER_ATTACK // Attack the player if the commander dies
		}
	});

	// Alert the player that the NP is on the move
	camPlayVideos({video: "SB1_7_MSG3", type: MISS_MSG});
	camCallOnce("removeCanyonBlip");
	camSetExtraObjectiveMessage(_("Do not allow the New Paradigm to escape with the artifact"));
}

// Put a red dot on the minimap over the artifact holder's current position
function trackArtiHolder()
{
	const artiHolder = getObject("npCommander");
	if (artiHolder !== null && !enemyStoleArtifact)
	{
		playSound(cam_sounds.tracker, artiHolder.x, artiHolder.y, artiHolder.z);
	}
}

// Send a transport to the NP lZ (if it's built)
function sendTransport()
{
	// Only land if there is at least one structure around the LZ
	let pos;
	if (enumArea("NPLZ", CAM_NEW_PARADIGM, false).filter((obj) => (obj.type === STRUCTURE && obj.status === BUILT)).length < 1)
	{
		return; // Not built :(
	}
	else
	{
		pos = camMakePos("NPLZ");
	}

	// Cyborgs...
	let templates  = [cTempl.cybca, cTempl.cybla, cTempl.cybgr, cTempl.cybhg];
	const COUNT = (difficulty <= HARD) ? 8 : 10;
	const droids = [];
	for (let i = 0; i < COUNT; ++i)
	{
		droids.push(camRandFrom(templates));
	}

	camSendReinforcement(CAM_NEW_PARADIGM, pos, droids, CAM_REINFORCE_TRANSPORT, {
		entry: { x: 126, y: 36 },
		exit: { x: 126, y: 76 },
		order: CAM_ORDER_ATTACK,
		data: { regroup: true, count: -1 }
	});
}

// If the NP commander is at the LZ, remove it and prep for mission failure
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_NEW_PARADIGM && (getObject("npCommander") !== null) && camWithinArea("npCommander", "NPLZ"))
	{
		enemyStoleArtifact = true;
		playSound(cam_sounds.enemyEscaping);
	}
}

// The player can leave once they've collected the artifact
function extraVictory()
{
	let npTransportFound = false;
	enumDroid(CAM_NEW_PARADIGM).forEach((dr) => {
		if (camIsTransporter(dr))
		{
			npTransportFound = true;
		}
	});

	//fail if they stole it and the transporter is not on map anymore
	if (enemyStoleArtifact && !npTransportFound)
	{
		return false;
	}

	if (playerHasArtifact)
	{
		return true;
	}
}

function removeCanyonBlip()
{
	hackRemoveMessage("C1-7_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

// Allow the player to win if they collect the artifact
function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER)
	{
		playerHasArtifact = true;
		camSetExtraObjectiveMessage();
	}
}

//Mission setup stuff
function eventStartLevel()
{
	enemyStoleArtifact = false;
	playerHasArtifact = false;
	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha12.pre, {
		area: "RTLZ",
		message: "C1-7_LZ",
		reinforcements: camMinutesToSeconds(1),
		callback: "extraVictory",
		retlz: true,
	});

	//Make sure the New Paradigm and Scavs are allies
	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);


	camSetEnemyBases({
		"ScavMiddleGroup": {
			cleanup: "scavMiddle",
			detectMsg: "C1-7_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"ScavSouthEastGroup": {
			cleanup: "scavSouthEast",
			detectMsg: "C1-7_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"ScavNorthEastGroup": {
			cleanup: "scavNorth",
			detectMsg: "C1-7_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
	});

	camSetFactories({
		"scavMiddleFactory": {
			assembly: "middleAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.buscan, cTempl.bjeep, cTempl.kevlance, cTempl.buscan, cTempl.kevbloke ]
		},
		"scavSouthEastFactory": {
			assembly: "southAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.firetruck, cTempl.gbjeep, cTempl.gbjeep, cTempl.buscan ]
		},
		"scavNorthEastFactory": {
			assembly: "northAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			rdata: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.minitruck, cTempl.kevlance, cTempl.rbjeep, cTempl.flatat ]
		},
	});

	camManageTrucks(
		CAM_NEW_PARADIGM, {
			label: "dummy", // Not assigned to a base
			truckDroid: getObject("npTruck"),
			area: "NPBuildArea",
			structset: camAreaToStructSet("NPBuildArea")
	});

	// If below Insane difficulty, remove NP LZ structs at the start
	if (difficulty < INSANE)
	{
		const structs = enumArea("NPLZ", CAM_NEW_PARADIGM, false).filter((obj) => (obj.type === STRUCTURE));
		for (const struct of structs)
		{
			camSafeRemoveObject(struct);
		}
	}

	hackAddMessage("C1-7_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); //Canyon
	queue("enableScavFactories", camChangeOnDiff(camSecondsToMilliseconds(30)));
	queue("npAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("startConvoy", camChangeOnDiff(camMinutesToMilliseconds(5)));
	setTimer("sendTransport", camChangeOnDiff(camMinutesToMilliseconds(2)));
	setTimer("trackArtiHolder", camSecondsToMilliseconds(3));

	// Darken the fog to 1/3 default brightness
	camSetFog(59, 48, 32);
	// Darken the lighting and add a slight orange hue
	camSetSunIntensity(.42, .42, .4);
	// Move the sun far towards the west
	camSetSunPos(500, -200, 200);
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

var victoryFlag;
var transUnitIDs;

const MIS_TRANSPORT_TEAM_PLAYER = 1;
const mis_collectiveRes = [
	"R-Wpn-MG-Damage05", "R-Wpn-MG-ROF02",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-Damage04", "R-Wpn-Cannon-ROF01", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-ROF01", "R-Wpn-Mortar-Acc01", 
	"R-Wpn-Rocket-Damage04", "R-Wpn-Rocket-ROF01", "R-Wpn-Rocket-Accuracy02",
	"R-Defense-WallUpgrade04", "R-Struc-Materials04",
	"R-Sys-Engineering02",
	"R-Struc-RprFac-Upgrade01",
	"R-Vehicle-Metals03", "R-Cyborg-Metals03",
	"R-Vehicle-Engine03",
];

//trigger event when droid reaches the downed transport.
camAreaEvent("crashSite", function(droid)
{
	//Unlikely to happen.
	if (!enumDroid(MIS_TRANSPORT_TEAM_PLAYER).length)
	{
		gameOverMessage(false);
		return;
	}

	playSound(cam_sounds.rescue.unitsRescued);

	hackRemoveMessage("C21_OBJECTIVE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Donate the lost squad to the player
	camEnsureDonateObject(enumDroid(MIS_TRANSPORT_TEAM_PLAYER), CAM_HUMAN_PLAYER);

	// Allow the player to escape
	victoryFlag = true;
	camSetExtraObjectiveMessage(_("At least one transporter unit must survive"));
});

// Store the IDs of the transport units when they're given to the player
function eventObjectTransfer(obj, from)
{
	if (obj.type === DROID && obj.player === CAM_HUMAN_PLAYER && from === MIS_TRANSPORT_TEAM_PLAYER)
	{
		transUnitIDs.push(obj.id);
	}
}

function setupCyborgGroups()
{
	//create group of cyborgs and send them on war path
	camManageGroup(camMakeGroup("cyborgPositionNorth"), CAM_ORDER_ATTACK, {
		regroup: false
	});

	//create group of cyborgs and send them on war path
	camManageGroup(camMakeGroup("cyborgPositionEast"), CAM_ORDER_ATTACK, {
		regroup: false
	});
}

//Checks if the downed transport has been destroyed and issue a game lose.
function checkCrashedTeam()
{
	if (!victoryFlag && getObject("transporter") === null)
	{
		return false;
	}

	if (camDef(transUnitIDs) && victoryFlag)
	{
		// If the units were rescued, make sure they stay alive
		let rescueAlive = false;

		for (const ID of transUnitIDs)
		{
			if (getObject(DROID, CAM_HUMAN_PLAYER, ID) !== null)
			{
				rescueAlive = true;
				break;
			}
		}

		if (rescueAlive === false)
		{
			return false; // All transport units are dead :(
		}
		else
		{
			return true; // All is well with the world
		}
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Locate and rescue your units from the shot down transporter"));

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.beta3, {
		area: "RTLZ",
		message: "C21_LZ",
		reinforcements: -1,
		callback: "checkCrashedTeam",
		retlz: true
	});

	const subLandingZone = getObject("landingZone");
	const startPos = getObject("startingPosition");
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(subLandingZone.x, subLandingZone.y, subLandingZone.x2, subLandingZone.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	//Add crash site blip and from an alliance with the crashed team.
	hackAddMessage("C21_OBJECTIVE", PROX_MSG, CAM_HUMAN_PLAYER, false);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TRANSPORT_TEAM_PLAYER, true);
	setAlliance(MIS_TRANSPORT_TEAM_PLAYER, CAM_THE_COLLECTIVE, true);

	//set downed transport team colour to be the player's colour.
	changePlayerColour(MIS_TRANSPORT_TEAM_PLAYER, playerData[0].colour);

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_alphaResearchNew, MIS_TRANSPORT_TEAM_PLAYER);
	camCompleteRequiredResearch(mis_playerResBeta, MIS_TRANSPORT_TEAM_PLAYER);

	camSetEnemyBases({
		"COHardpointBase": {
			cleanup: "hardpointBaseCleanup",
			detectMsg: "C21_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBombardBase": {
			cleanup: "bombardBaseCleanup",
			detectMsg: "C21_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"COBunkerBase": {
			cleanup: "bunkerBaseCleanup",
			detectMsg: "C21_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	// Damage and rank the transport group
	setHealth(getObject("transporter"), 40);
	const droids = enumDroid(MIS_TRANSPORT_TEAM_PLAYER);
	for (const droid of droids)
	{
		setHealth(droid, 40 + camRand(20));
		camSetDroidRank(droid, "Professional");
	}

	victoryFlag = false;
	queue("setupCyborgGroups", camSecondsToMilliseconds(5));

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(.35, .35, .45);
	// Move the sun towards the west
	camSetSunPos(425, -300, 350);
}

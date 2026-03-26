include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage01", "R-Wpn-MG-Damage01",
];

//Ambush player from scav base - triggered from middle path
camAreaEvent("scavBaseTrigger", function()
{
	const AMBUSH_GROUP = camMakeGroup(enumArea("eastScavsNorth", CAM_SCAV_7, false));
	camManageGroup(AMBUSH_GROUP, CAM_ORDER_ATTACK, {
		count: -1,
		regroup: false
	});
});

//Moves west scavs units closer to the base - triggered from right path
camAreaEvent("ambush1Trigger", function()
{
	const AMBUSH_GROUP = camMakeGroup(enumArea("westScavs", CAM_SCAV_7, false));
	camManageGroup(AMBUSH_GROUP, CAM_ORDER_DEFEND, {
		pos: camMakePos("ambush1")
	});
});

//Sends some units towards player LZ - triggered from left path
camAreaEvent("ambush2Trigger", function()
{
	const AMBUSH_GROUP = camMakeGroup(enumArea("northWestScavs", CAM_SCAV_7, false));
	camManageGroup(AMBUSH_GROUP, CAM_ORDER_DEFEND, {
		pos: camMakePos("ambush2")
	});
});

function eventPickup(feature, droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && feature.stattype === ARTIFACT)
	{
		hackRemoveMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	}
}

//Mission setup stuff
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alpha4.pre, {
		area: "RTLZ",
		message: "C1-1_LZ",
		reinforcements: -1, //No reinforcements
		retlz: true
	});

	const startPos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tEnt = getObject("transporterEntry");
	const tExt = getObject("transporterExit");
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tEnt.x, tEnt.y, CAM_HUMAN_PLAYER);
	setTransporterExit(tExt.x, tExt.y, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"artifactLocation": { tech: "R-Wpn-Cannon1Mk1" }, // Light Cannon
	});

	camPlayVideos({video: "FLIGHT", type: CAMP_MSG});
	hackAddMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	// Change the skybox to a night sky
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to be nearly pitch black
	camSetFog(10, 10, 10);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Reverse the sun east/west direction
	camSetSunPos(-225, -600, 450);
}

include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 13, y: 52},
	lz: {x: 10, y: 51, x2: 12, y2: 53},
	trPlace: {x: 11, y: 52},
	trExit: {x: 39, y: 1}
};

function eventStartLevel()
{
	camSetupTransporter(mis_Labels.trPlace.x, mis_Labels.trPlace.y, mis_Labels.trExit.x, mis_Labels.trExit.y);
	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);
	if (!tweakOptions.ref_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));
	}
	camPlayVideos({video: "SB1_2_MSG", type: CAMP_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.alpha4.offWorld);

	// Change the skybox to a night sky
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to be nearly pitch black
	camSetFog(10, 10, 10);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Reverse the sun east/west direction
	camSetSunPos(-225, -600, 450);
}

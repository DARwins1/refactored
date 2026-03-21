include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 88, y: 101},
	lz: {x: 86, y: 99, x2: 88, y2: 101},
	trPlace: {x: 87, y: 100},
	trExit: {x: 1, y: 100}
};

function eventStartLevel()
{
	camSetupTransporter(mis_Labels.trPlace.x, mis_Labels.trPlace.y, mis_Labels.trExit.x, mis_Labels.trExit.y);
	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);
	if (!tweakOptions.ref_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(75)));
	}
	camPlayVideos({video: "MB2_DI_MSG", type: MISS_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.beta7.offWorld);

	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	// Darken the lighting
	camSetSunIntensity(.35, .35, .35);
	// Move the sun towards the east
	camSetSunPos(-225, -600, 450);
	camSetSkyType(CAM_SKY_NIGHT);
}

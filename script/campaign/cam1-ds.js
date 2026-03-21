include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 13, y: 52},
	lz: {x: 10, y: 51, x2: 12, y2: 53},
	trPlace: {x: 11, y: 52},
	trExit: {x: 126, y: 112}
};

function eventStartLevel()
{
	camSetupTransporter(mis_Labels.trPlace.x, mis_Labels.trPlace.y, mis_Labels.trExit.x, mis_Labels.trExit.y);
	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);
	if (!tweakOptions.ref_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	}
	camPlayVideos([{video: "MB1D_MSG", type: CAMP_MSG}, {video: "MB1D_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.alpha12.offWorld);

	// In case the player didn't get this in the last mission
	enableResearch("R-Vehicle-Metals03", CAM_HUMAN_PLAYER);

	// Darken the fog to 1/3 default brightness
	camSetFog(59, 48, 32);
	// Darken the lighting and add a slight orange hue
	camSetSunIntensity(.42, .42, .4);
	// Move the sun far towards the west
	camSetSunPos(500, -200, 200);
}

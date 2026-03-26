include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 13, y: 52},
	lz: {x: 10, y: 51, x2: 12, y2: 53},
	trPlace: {x: 11, y: 52},
	trExit: {x: 55, y: 1}
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
	camPlayVideos([{video: "SB1_7_MSG", type: CAMP_MSG}, {video: "SB1_7_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.alpha11.offWorld);

	// In case the player didn't get this in the last mission
	enableResearch("R-Wpn-Rocket03-HvAT", CAM_HUMAN_PLAYER);

	// Darken the fog to 1/2 default brightness
	camSetFog(88, 72, 48);
	// Darken the lighting and add a slight orange hue
	camSetSunIntensity(.45, .45, .4);
	// Move the sun towards the west
	camSetSunPos(425, -400, 450);
}

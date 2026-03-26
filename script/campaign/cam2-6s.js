include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 88, y: 101},
	lz: {x: 86, y: 99, x2: 88, y2: 101},
	trPlace: {x: 87, y: 100},
	trExit: {x: 16, y: 126}
};

function eventStartLevel()
{
	camSetupTransporter(mis_Labels.trPlace.x, mis_Labels.trPlace.y, mis_Labels.trExit.x, mis_Labels.trExit.y);
	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);
	if (!tweakOptions.ref_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));
	}
	camPlayVideos([{video: "MB2_6_MSG", type: CAMP_MSG}, {video: "MB2_6_MSG2", type: CAMP_MSG}, {video: "MB2_6_MSG3", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.beta8.offWorld);

	// Brighten the fog to 1.5 default brightness (and reduce the amount of blue by a bit)
	camSetFog(24, 24, 64);
	// Brighten the lighting a bit and add a slight orange hue
	camSetSunIntensity(.55, .55, .52);
	// Move the sun far towards the east
	camSetSunPos(-500, -200, 200);
	// Stop the rain
	camSetWeather(CAM_WEATHER_CLEAR);
}

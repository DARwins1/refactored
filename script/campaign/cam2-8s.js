include("script/campaign/libcampaign.js");

const mis_Labels = {
	startPos: {x: 88, y: 101},
	lz: {x: 86, y: 99, x2: 88, y2: 101},
	trPlace: {x: 87, y: 100},
	trExit: {x: 126, y: 60}
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
	camPlayVideos([{video: "MB2_8_MSG", type: CAMP_MSG}, {video: "MB2_8_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, cam_levels.beta10.offWorld);

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting slightly and add a slight blue hue
	camSetSunIntensity(.38, .38, .45);
	// Move the sun far towards the west
	camSetSunPos(500, -200, 200);
	// Constant rain
	camSetWeather(CAM_WEATHER_RAINSTORM);
}

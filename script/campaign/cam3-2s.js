include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(56, 120, 25, 87);
	centreView(57, 119);
	setNoGoArea(55, 119, 57, 121, CAM_HUMAN_PLAYER);
	setNoGoArea(7, 52, 9, 54, CAM_NEXUS);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));
	camPlayVideos([{video: "MB3_2_MSG", type: CAMP_MSG}, {video: "MB3_2_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "SUB_3_2");
}

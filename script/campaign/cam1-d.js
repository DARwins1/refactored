include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade03",
	"R-Struc-Materials03", "R-Vehicle-Engine03",
	"R-Vehicle-Metals03", "R-Cyborg-Metals03", "R-Wpn-Cannon-Damage03",
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Rocket-Accuracy02", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Rocket-Damage03", "R-Wpn-Rocket-ROF01", "R-Sys-Engineering01",
];

camAreaEvent("tankTrapTrig", function(droid)
{
	camEnableFactory("NPFactoryW");
	camEnableFactory("NPCybFactoryW");
	camCallOnce("mrlGroupAttack");
});

camAreaEvent("northWayTrigger", function(droid)
{
	camEnableFactory("NPFactoryE");
	camEnableFactory("NPCybFactoryE");
	camCallOnce("mrlGroupAttack");
});

camAreaEvent("causeWayTrig", function(droid)
{
	camEnableFactory("NPFactoryNE");
	camEnableFactory("NPCybFactoryNE");
	camCallOnce("transportBaseSetup");
});

camAreaEvent("westWayTrigger", function(droid)
{
	camEnableFactory("NPFactoryNE");
	camEnableFactory("NPCybFactoryNE");
	camEnableFactory("NPFactoryE");
	camEnableFactory("NPCybFactoryE");
	camCallOnce("mrlGroupAttack");
	camCallOnce("transportBaseSetup");
});

function transportBaseSetup()
{
	camDetectEnemyBase("NPLZGroup");
	camSetBaseReinforcements("NPLZGroup", camChangeOnDiff(camMinutesToMilliseconds(10)), "getDroidsForNPLZ", CAM_REINFORCE_TRANSPORT, {
		entry: { x: 2, y: 2 },
		exit: { x: 2, y: 2 },
		posLZ: camMakePos("NPLZ1"),
		data: {
			regroup: false,
			count: -1,
			repair: 40,
		},
	});
}

function getDroidsForNPLZ()
{
	let lim = 8;
	if (difficulty === HARD)
	{
		lim = 9;
	}
	else if (difficulty >= INSANE)
	{
		lim = 10;
	}
	const templates = [ cTempl.nphhct, cTempl.nphhct, cTempl.npmmorbht, cTempl.npmmorbht, cTempl.npmbbht ];

	const droids = [];
	for (let i = 0; i < lim; ++i)
	{
		droids.push(templates[camRand(templates.length)]);
	}
	return droids;
}

function HoverGroupPatrol()
{
	camManageGroup(camMakeGroup("hoversAttack"), CAM_ORDER_ATTACK, {
		pos: camMakePos("attackPoint2"),
		fallback: camMakePos("cybRetreatPoint"),
		morale: 50,
		regroup: false
	});
	camManageGroup(camMakeGroup("hoversDefense"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverDefense1"),
			camMakePos("hoverDefense2"),
			camMakePos("hoverDefense3"),
			camMakePos("hoverDefense4")
		],
		interval: camMinutesToMilliseconds(1.5),
		repair: 70
	});
}

function cyborgGroupPatrol()
{
	camManageGroup(camMakeGroup("cyborgs1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("genRetreatPoint"),
			camMakePos("cybRetreatPoint"),
			camMakePos("NPTransportPos")
		],
		repair: 66
	});
	camManageGroup(camMakeGroup("cyborgs2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("genRetreatPoint"),
			camMakePos("cybRetreatPoint"),
			camMakePos("NPTransportPos")
		],
		repair: 66
	});
}

function mrlGroupAttack()
{
	camManageGroup(camMakeGroup("MRL1"), CAM_ORDER_ATTACK, {
		count: -1,
		repair: 80,
		regroup: false
	});
}

function IDFGroupAmbush()
{
	camManageGroup(camMakeGroup("IDF1"), CAM_ORDER_ATTACK, {
		count: -1,
		regroup: false
	});
	camManageGroup(camMakeGroup("IDF2"), CAM_ORDER_ATTACK, {
		count: -1,
		regroup: false
	});
}

function setupPatrols()
{
	IDFGroupAmbush();
	HoverGroupPatrol();
	cyborgGroupPatrol();
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, cam_levels.alphaEnd, {
		area: "RTLZ",
		message: "C1D_LZ",
		reinforcements: camMinutesToSeconds(2),
		eliminateBases: true
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
		"artifact1": { tech: "R-Vehicle-Prop-Hover" }, // Hover Propulsion
		// "NPFactoryW": { tech: "R-Vehicle-Metals03" }, //West factory
		"NPFactoryNE": { tech: "R-Vehicle-Body12" }, // Mantis
	});

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);

	camSetEnemyBases({
		"NPSouthEastGroup": {
			cleanup: "NPSouthEast",
			detectMsg: "C1D_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPMiddleGroup": {
			cleanup: "NPMiddle",
			detectMsg: "C1D_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPNorthEastGroup": {
			cleanup: "NPNorthEast",
			detectMsg: "C1D_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"NPLZGroup": {
			cleanup: "NPLZBaseCleanup",
			detectMsg: "C1D_LZ2",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_NEW_PARADIGM // required for LZ-type bases
		},
	});

	camSetFactories({
		"NPFactoryW": {
			assembly: "NPFactoryWAssembly",
			order: CAM_ORDER_PATROL,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				pos: [
					camMakePos("hoverDefense5"),
					camMakePos("hoverDefense6"),
					camMakePos("hoverDefense7"),
					camMakePos("hoverDefense8"),
					camMakePos("hoverDefense9")
				],
				interval: camSecondsToMilliseconds(45),
				regroup: false,
				repair: 66,
				count: -1,
			},
			templates: [ cTempl.npmhmgh, cTempl.npmath, cTempl.nphhch, cTempl.npmmrah ] //Hover factory
		},
		"NPFactoryE": {
			assembly: "NPFactoryEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.nplatht, cTempl.npmsensht, cTempl.npmmorbht, cTempl.npmmct, cTempl.nphhct ] //variety
		},
		"NPFactoryNE": {
			assembly: "NPFactoryNEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(120)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.nphhct, cTempl.npmbbht, cTempl.npmmorbht ] //tough units
		},
		"NPCybFactoryW": {
			assembly: "NPCybFactoryWAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.npcybc, cTempl.npcybf, cTempl.npcybr ]
		},
		"NPCybFactoryE": {
			assembly: "NPCybFactoryEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.npcybc, cTempl.npcybf, cTempl.npcybr ]
		},
		"NPCybFactoryNE": {
			assembly: "NPCybFactoryNEAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			data: {
				regroup: false,
				repair: 33,
				count: -1,
			},
			templates: [ cTempl.npcybc, cTempl.npcybf, cTempl.npcybr ]
		},
	});

	hackAddMessage("C1D_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	queue("setupPatrols", camMinutesToMilliseconds(2.5));
}

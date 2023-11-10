include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_nexusRes = [
	"R-Defense-WallUpgrade09", "R-Struc-Materials09", "R-Struc-Factory-Upgrade06",
	"R-Struc-VTOLPad-Upgrade06", "R-Vehicle-Engine09", "R-Vehicle-Metals07",
	"R-Cyborg-Metals07", "R-Vehicle-Armor-Heat05", "R-Cyborg-Armor-Heat05",
	"R-Sys-Engineering03", "R-Vehicle-Prop-Hover02", "R-Vehicle-Prop-VTOL02",
	"R-Wpn-Bomb-Damage03", "R-Wpn-Energy-Accuracy01", "R-Wpn-Energy-Damage02",
	"R-Wpn-Energy-ROF02", "R-Wpn-Missile-Accuracy01", "R-Wpn-Missile-Damage02",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF02", "R-Sys-Sensor-Upgrade01",
	"R-Sys-NEXUSrepair", "R-Wpn-Flamer-Damage08", "R-Wpn-Flamer-ROF03",
];
var edgeMapCounter; //how many Nexus reinforcement runs have happened.
var hackFailChance; //chance the Nexus Intruder Program will fail
var winFlag;

//Remove Nexus VTOL droids.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("vtolRemoveZone", CAM_NEXUS);
});

function sendEdgeMapDroids()
{
	const unitCount = 6 + camRand(5); // 6 - 10.
	const EDGE = ["SWPhantomFactory", "NWPhantomFactory"];
	const list = [
		cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas,
		cTempl.nxlflash, cTempl.nxmrailh, cTempl.nxmlinkh,
		cTempl.nxmscouh, cTempl.nxmsamh, cTempl.nxmplash,
	];
	const droids = [];

	if (!camDef(edgeMapCounter))
	{
		edgeMapCounter = 0;
	}

	for (let i = 0; i < unitCount; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	droids = droids.concat(cTempl.nxmsens);

	camSendReinforcement(CAM_NEXUS, camMakePos(EDGE[camRand(EDGE.length)]), droids,
		CAM_REINFORCE_GROUND, {
			data: {regroup: false, count: -1}
		}
	);

	edgeMapCounter += 1;
}

//Setup Nexus VTOL hit and runners. NOTE: These do not go away in this mission.
function vtolAttack()
{
	const list = [cTempl.nxlscouv, cTempl.nxmtherv, cTempl.nxlscouv, cTempl.nxmheapv];
	const ext = {
		limit: [2, 4, 2, 4],
		alternate: true,
		altIdx: 0
	};
	camSetVtolData(CAM_NEXUS, (difficulty === INSANE) ? undefined : "vtolAppearPos", "vtolRemovePos", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), undefined, ext);
}

// Order any absorbed trucks to start building defenses near themselves.
function truckDefense()
{
	const droids = enumDroid(CAM_NEXUS, DROID_CONSTRUCT);
	const defenses = [
		"Sys-NEXUSLinkTOW", "P0-AASite-SAM2", "Emplacement-PrisLas",
		"NX-Tower-ATMiss", "Sys-NX-CBTower",
	];

	for (let i = 0, len = droids.length; i < len; ++i)
	{
		const truck = droids[i];
		if (truck.order !== DORDER_BUILD)
		{
			const defense = defenses[camRand(defenses.length)];
			const loc = pickStructLocation(truck, defense, truck.x, truck.y);
			enableStructure(defense, CAM_NEXUS);
			if (camDef(loc))
			{
				orderDroidBuild(truck, DORDER_BUILD, defense, truck.x, truck.y);
			}
		}
	}
}

function hackManufacture(structure, template)
{
	makeComponentAvailable(template.body, structure.player);
	makeComponentAvailable(template.prop, structure.player);
	makeComponentAvailable(template.weap, structure.player);
	return buildDroid(structure, "Nexus unit", template.body, template.prop, "", "", template.weap);
}

function nexusManufacture()
{
	if (countDroid(DROID_ANY, CAM_NEXUS) > 100)
	{
		return;
	}
	const factoryType = [
		{structure: FACTORY, temps: [cTempl.nxmrailh, cTempl.nxmlinkh, cTempl.nxmscouh, cTempl.nxlflash, cTempl.nxmplash]},
		{structure: CYBORG_FACTORY, temps: [cTempl.nxcyrail, cTempl.nxcyscou, cTempl.nxcylas,]},
		{structure: VTOL_FACTORY, temps: [cTempl.nxlscouv, cTempl.nxmtherv, cTempl.nxmheapv,]},
	];

	for (let i = 0; i < factoryType.length; ++i)
	{
		const factories = enumStruct(CAM_NEXUS, factoryType[i].structure);
		const templs = factoryType[i].temps;

		for (let j = 0, len = factories.length; j < len; ++j)
		{
			const fac = factories[j];
			if (fac.status !== BUILT || !structureIdle(fac))
			{
				return;
			}
			hackManufacture(fac, templs[camRand(templs.length)]);
		}
	}

	queue("manualGrouping", camSecondsToMilliseconds(1.5));
}

function manualGrouping()
{
	const vtols = enumDroid(CAM_NEXUS).filter(function(obj) {
		return obj.group === null && isVTOL(obj);
	});
	const nonVtols = enumDroid(CAM_NEXUS).filter(function(obj) {
		return obj.group === null && !isVTOL(obj);
	});
	if (vtols.length)
	{
		camManageGroup(camMakeGroup(vtols), CAM_ORDER_ATTACK, { regroup: false, count: -1 });
	}
	if (nonVtols.length)
	{
		camManageGroup(camMakeGroup(nonVtols), CAM_ORDER_ATTACK, { regroup: false, count: -1 });
	}
}

function eventObjectTransfer(obj, from)
{
	if (obj.player === CAM_NEXUS && from === CAM_HUMAN_PLAYER)
	{
		if (obj.type === STRUCTURE)
		{
			if (obj.stattype === FACTORY || obj.stattype === CYBORG_FACTORY || obj.stattype === VTOL_FACTORY)
			{
				queue("nexusManufacture", camSecondsToMilliseconds(0.1)); //build immediately if possible.
			}
		}
	}
}

function powerTransfer()
{
	setPower(playerPower(CAM_HUMAN_PLAYER) + 5000);
	playSound("power-transferred.ogg");
}

function eventResearched(research, structure, player)
{
	if (research.name === "R-Sys-Resistance-Upgrade01")
	{
		hackFailChance = 55;
	}
	else if (research.name === "R-Sys-Resistance-Upgrade02")
	{
		hackFailChance = 80;
	}
	else if (research.name === "R-Sys-Resistance-Upgrade03")
	{
		hackFailChance = 95;
	}
	else if (research.name === "R-Sys-Resistance-Upgrade04")
	{
		winFlag = true;
		hackFailChance = 100;
		camSetNexusState(false);
		removeTimer("sendEdgeMapDroids");
		setTimer("sendEdgeMapDroids", camChangeOnDiff(camSecondsToMilliseconds(45))); // Waves start coming faster (if the player hasn't already won)
	}
}

function hackPlayer()
{
	if (!camGetNexusState())
	{
		removeTimer("hackPlayer");
		return;
	}
	if (camRand(100) < hackFailChance)
	{
		return;
	}

	camHackIntoPlayer(CAM_HUMAN_PLAYER, CAM_NEXUS);
}

function synapticsSound()
{
	playSound(CAM_SYNAPTICS_ACTIVATED_SND);
	camHackIntoPlayer(CAM_HUMAN_PLAYER, CAM_NEXUS);
}

//winFlag is set in eventResearched.
function resistanceResearched()
{
	const MIN_EDGE_COUNT = 15;
	if (winFlag && edgeMapCounter >= MIN_EDGE_COUNT)
	{
		return true;
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Research resistance circuits and survive the assault from Nexus"));

	const startpos = getObject("startPosition");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAM3C", {
		callback: "resistanceResearched"
	});

	camSetNexusState(true);
	camPlayVideos([{video: "MB3_AB_MSG", type: CAMP_MSG}, {video: "MB3_AB_MSG2", type: CAMP_MSG}, {video: "MB3_AB_MSG3", type: MISS_MSG}]);

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));

	const enemyLz = getObject("NXlandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, CAM_NEXUS);

	camCompleteRequiredResearch(mis_nexusRes, CAM_NEXUS);

	enableResearch("R-Sys-Resistance-Upgrade01", CAM_HUMAN_PLAYER);
	winFlag = false;
	hackFailChance = 30;

	vtolAttack();

	queue("powerTransfer", camSecondsToMilliseconds(0.8));
	queue("synapticsSound", camSecondsToMilliseconds(2.5));
	queue("sendEdgeMapDroids", camSecondsToMilliseconds(15));

	setTimer("truckDefense", camSecondsToMilliseconds(2));
	setTimer("hackPlayer", camSecondsToMilliseconds((difficulty <= HARD) ? 8 : 5));
	setTimer("nexusManufacture", camSecondsToMilliseconds(10));
	setTimer("sendEdgeMapDroids", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
}

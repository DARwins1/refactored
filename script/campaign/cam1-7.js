
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_newParadigmRes = [
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade03",
	"R-Struc-Materials03", "R-Struc-Factory-Upgrade03",
	"R-Vehicle-Engine03",
	"R-Vehicle-Metals03", "R-Cyborg-Metals03", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Cannon-Damage03", "R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-Acc01", "R-Wpn-Rocket-Accuracy01",
	"R-Wpn-Rocket-Damage03", "R-Wpn-Rocket-ROF03", "R-Wpn-RocketSlow-Accuracy02",
	"R-Wpn-RocketSlow-Damage03", "R-Struc-RprFac-Upgrade03",
];
const mis_scavengerRes = [
	"R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-Damage03",
	"R-Wpn-Cannon-Damage03", "R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-ROF01",
	"R-Wpn-Rocket-Accuracy02", "R-Wpn-Rocket-ROF03", "R-Vehicle-Metals02",
	"R-Defense-WallUpgrade03", "R-Struc-Materials03", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Mortar-Acc01",
];
var artiGroup; //Droids that take the artifact
var enemyHasArtifact; //Do they have the artifact
var enemyStoleArtifact; //Reached the LZ with the artifact
var droidWithArtiID; //The droid ID that was closest to the artifact to take it
var artiMovePos; //where artiGroup members are moving to


//These enable scav factories when close enough
camAreaEvent("northScavFactoryTrigger", function(droid)
{
	camEnableFactory("scavNorthEastFactory");
});

camAreaEvent("southScavFactoryTrigger", function(droid)
{
	camEnableFactory("scavSouthEastFactory");
});

camAreaEvent("middleScavFactoryTrigger", function(droid)
{
	camEnableFactory("scavMiddleFactory");
});

//If a group member of artiGroup gets to the waypoint, then go to the
//New Paradigm landing zone.
camAreaEvent("NPWayPointTrigger", function(droid)
{
	artiMovePos = "NPTransportPos";
});

//Land New Paradigm transport if the New Paradigm have the artifact.
camAreaEvent("NPTransportTrigger", function(droid)
{
	if (enemyHasArtifact && droid.group === artiGroup)
	{
		const list = [cTempl.npmrl, cTempl.npmrl];
		camSendReinforcement(CAM_NEW_PARADIGM, camMakePos("NPTransportPos"), list, CAM_REINFORCE_TRANSPORT, {
			entry: { x: 39, y: 2 },
			exit: { x: 32, y: 60 }
		});
		playSound("pcv632.ogg"); //enemy transport escaping warning sound
	}
	else
	{
		resetLabel("NPTransportTrigger", CAM_NEW_PARADIGM);
	}
});

//Only called once when the New Paradigm takes the artifact for the first time.
function artifactVideoSetup()
{
	camPlayVideos({video: "SB1_7_MSG3", type: MISS_MSG});
	camCallOnce("removeCanyonBlip");
	artiMovePos = "NPWayPoint";
}

//Remove nearby droids. Make sure the player loses if the NP still has the artifact
//by the time it lands.
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_NEW_PARADIGM && enemyHasArtifact)
	{
		enemyStoleArtifact = true;
		const crew = enumRange(transport.x, transport.y, 6, CAM_NEW_PARADIGM, false).filter(function(obj) {
			return obj.type === DROID && obj.group === artiGroup;
		});
		for (let i = 0, l = crew.length; i < l; ++i)
		{
			camSafeRemoveObject(crew[i], false);
		}
	}
}

//Check if the artifact group members are still alive and drop the artifact if needed.
function eventGroupLoss(obj, group, newsize)
{
	if (group === artiGroup && enemyHasArtifact && !enemyStoleArtifact)
	{
		if (obj.id === droidWithArtiID)
		{
			const acrate = addFeature("Crate", obj.x, obj.y);
			addLabel(acrate, "newArtiLabel");

			camSetArtifacts({
				"newArtiLabel": { tech: "R-Wpn-Cannon4AMk1" } // Hyper Velocity Cannon
			});

			droidWithArtiID = undefined;
			enemyHasArtifact = false;
			hackRemoveMessage("C1-7_LZ2", PROX_MSG, CAM_HUMAN_PLAYER);
		}
	}
}

function enemyCanTakeArtifact(label)
{
	return label.indexOf("newArtiLabel") !== -1 || label.indexOf("artifactLocation") !== -1;
}

//Moves some New Paradigm forces to the artifact
function getArtifact()
{
	if (groupSize(artiGroup) === 0)
	{
		removeTimer("getArtifact");
		return;
	}

	const GRAB_RADIUS = 2;
	const artifact = camGetArtifacts().filter(function(label) {
		return enemyCanTakeArtifact(label) && getObject(label) !== null;
	});
	let artiLoc = artiMovePos;

	if (!enemyHasArtifact && !enemyStoleArtifact && artifact.length > 0)
	{
		//Go to the artifact instead.
		const realCrate = artifact[0];
		artiLoc = camMakePos(realCrate);
		if (!camDef(artiLoc))
		{
			return; //player must have snatched it
		}

		//Find the one closest to the artifact so that one can "hold" it
		const artiMembers = enumGroup(artiGroup);
		let idx = 0;
		let dist = Infinity;

		for (let i = 0, l = artiMembers.length; i < l; ++i)
		{
			const DR_DIST = camDist(artiMembers[i], artiLoc);
			if (DR_DIST < dist)
			{
				idx = i;
				dist = DR_DIST;
			}
		}

		//Now take it if close enough
		if (camDist(artiMembers[idx], artiLoc) < GRAB_RADIUS)
		{
			camCallOnce("artifactVideoSetup");
			hackAddMessage("C1-7_LZ2", PROX_MSG, CAM_HUMAN_PLAYER, false); //NPLZ blip
			droidWithArtiID = artiMembers[idx].id;
			enemyHasArtifact = true;
			camSafeRemoveObject(realCrate, false);
		}
	}

	if (camDef(artiLoc))
	{
		camManageGroup(artiGroup, CAM_ORDER_DEFEND, {
			pos: artiLoc,
			radius: 0,
			regroup: false
		});
	}
}

//New Paradigm truck builds six lancer hardpoints around LZ
function buildLancers()
{
	for (let i = 1; i <= 6; ++i)
	{
		camQueueBuilding(CAM_NEW_PARADIGM, "WallTower06", "hardPoint" + i);
	}
}

//Must destroy all of the New Paradigm droids and make sure the artifact is safe.
function extraVictory()
{
	let npTransportFound = false;
	enumDroid(CAM_NEW_PARADIGM).forEach(function(dr) {
		if (camIsTransporter(dr))
		{
			npTransportFound = true;
		}
	});

	//fail if they stole it and the transporter is not on map anymore
	if (enemyStoleArtifact && !npTransportFound)
	{
		return false;
	}

	if (!enumDroid(CAM_NEW_PARADIGM).length)
	{
		return true;
	}
}

function removeCanyonBlip()
{
	hackRemoveMessage("C1-7_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
}

function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT)
	{
		if (droid.player === CAM_HUMAN_PLAYER)
		{
			if (enemyHasArtifact)
			{
				hackRemoveMessage("C1-7_LZ2", PROX_MSG, CAM_HUMAN_PLAYER);
			}
			enemyHasArtifact = false;
			camCallOnce("removeCanyonBlip");
		}
	}
}

function startArtifactCollection()
{
	setTimer("getArtifact", camSecondsToMilliseconds(0.2));
}

//Mission setup stuff
function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Destroy all New Paradigm units"));

	enemyHasArtifact = false;
	enemyStoleArtifact = false;
	const startpos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tent = getObject("transporterEntry");
	const text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "SUB_1_DS", {
		area: "RTLZ",
		message: "C1-7_LZ",
		reinforcements: camMinutesToSeconds(1),
		callback: "extraVictory",
		retlz: true,
	});

	//Make sure the New Paradigm and Scavs are allies
	setAlliance(CAM_NEW_PARADIGM, CAM_SCAV_7, true);

	//Get rid of the already existing crate and replace with another
	camSafeRemoveObject("artifact1", false);
	camSetArtifacts({
		"artifactLocation": { tech: "R-Wpn-Cannon4AMk1" }, // Hyper Velocity Cannon
	});

	camCompleteRequiredResearch(mis_newParadigmRes, CAM_NEW_PARADIGM);
	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetEnemyBases({
		"ScavMiddleGroup": {
			cleanup: "scavMiddle",
			detectMsg: "C1-7_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavSouthEastGroup": {
			cleanup: "scavSouthEast",
			detectMsg: "C1-7_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavNorthEastGroup": {
			cleanup: "scavNorth",
			detectMsg: "C1-7_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
	});

	camSetFactories({
		"scavMiddleFactory": {
			assembly: "middleAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ]
		},
		"scavSouthEastFactory": {
			assembly: "southAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ]
		},
		"scavNorthEastFactory": {
			assembly: "northAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			rdata: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.firecan, cTempl.rbjeep, cTempl.rbuggy, cTempl.bloke ]
		},
	});

	artiGroup = camMakeGroup(enumArea("NPArtiGroup", CAM_NEW_PARADIGM, false));
	droidWithArtiID = 0;
	camManageTrucks(CAM_NEW_PARADIGM);
	buildLancers();

	hackAddMessage("C1-7_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); //Canyon
	queue("startArtifactCollection", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
}

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

var wavesDone; // True if all attack waves have spawned
const mis_collectiveRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy02",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF02", "R-Wpn-Howitzer-Accuracy01",
	"R-Wpn-Bomb-Damage01",
	"R-Defense-WallUpgrade06", "R-Struc-Materials06",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals05", "R-Cyborg-Metals05",
	"R-Vehicle-Armor-Heat02", "R-Cyborg-Armor-Heat02",
	"R-Vehicle-Engine06",
];
const mis_Labels = {
	startPos: {x: 92, y: 99},
	lz: {x: 86, y: 99, x2: 88, y2: 101},
	trPlace: {x: 87, y: 100},
	trExit: {x: 0, y: 55},
	lzStructArea1: {x: 27, y: 104, x2: 35, y2: 110},
	lzStructArea2: {x: 13, y: 11, x2: 20, y2: 19},
	lzStructArea3: {x: 16, y: 45, x2: 25, y2: 52},
	lzStructArea4: {x: 61, y: 6, x2: 69, y2: 12},
	// lzStructArea5: {x: 99, y: 17, x2: 105, y2: 24},
	// lzStructArea6: {x: 56, y: 38, x2: 65, y2: 46},
	// lzStructArea7: {x: 113, y: 113, x2: 124, y2: 120},
	lzPos1: {x: 32, y: 108},
	lzPos2: {x: 18, y: 17},
	lzPos3: {x: 20, y: 48},
	lzPos4: {x: 66, y: 9},
	// lzPos5: {x: 102, y: 21},
	// lzPos6: {x: 61, y: 42},
	// lzPos7: {x: 118, y: 117},
	// eastEntrance: {x: 124, y: 32, x2: 125, y2: 36},
	// northeastEntrance: {x: 119, y: 2, x2: 124, y2: 3},
	northEntrance: {x: 93, y: 2, x2: 97, y2: 3},
	northwestEntrance: {x: 43, y: 2, x2: 47, y2: 3},
	westEntrance1: {x: 2, y: 43, x2: 3, y2: 46},
	westEntrance2: {x: 2, y: 65, x2: 3, y2: 70},
	westEntrance3: {x: 2, y: 111, x2: 3, y2: 113},
	southwestEntrance: {x: 6, y: 124, x2: 10, y2: 125},
	southEntrance: {x: 50, y: 124, x2: 54, y2: 125},
	// southeastEntrance: {x: 122, y: 124, x2: 125, y2: 125},
	vtolRemovePos: {x: 127, y: 64},
	vtolSpawnPos1: {x: 99, y: 1},
	// vtolSpawnPos2: {x: 127, y: 65},
	// vtolSpawnPos3: {x: 127, y: 28},
	vtolSpawnPos4: {x: 36, y: 1},
	vtolSpawnPos5: {x: 1, y: 28},
	vtolSpawnPos6: {x: 1, y: 101},
};
var truckJob1;
var truckJob2;
var truckJob3;
var truckJob4;
var groundBlips, airBlips;
var colCommanderIndex;

// Check if all waves have spawned and all enemies are gone
function extraVictoryCondition()
{
	const enemies = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false);
	if (wavesDone && enemies.length === 0)
	{
		return true;
	}
}

//Remove enemy vtols when in the remove zone area.
function checkEnemyVtolArea()
{
	const vtols = enumRange(mis_Labels.vtolRemovePos.x, mis_Labels.vtolRemovePos.y, 2, CAM_THE_COLLECTIVE, false).filter((obj) => (isVTOL(obj)));

	for (const vtol of vtols)
	{
		camSafeRemoveObject(vtol, false);
	}
}

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	let vtolPositions = [
		mis_Labels.vtolSpawnPos1,
		mis_Labels.vtolSpawnPos4,
		mis_Labels.vtolSpawnPos5,
		mis_Labels.vtolSpawnPos6
	];

	// HEAP Bombs, Thermite Bombs, Assault Cannons, Assault Guns
	let list = [ cTempl.comhbv, cTempl.comtbv, cTempl.comacv, cTempl.colagv ];
	const extras = {
		limit: [2, 2, 3, 5],
		alternate: true,
		dynamic: true
	};

	camSetVtolData(CAM_THE_COLLECTIVE, vtolPositions, mis_Labels.vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(30)), undefined, extras);
}

function groundAssault(index)
{
	let bIndices;
	switch (index)
	{
		case 1:
			bIndices = [1, 2];
			break;
		case 2:
			bIndices = [4, 5];
			break;
		case 3:
			bIndices = [1, 3, 5];
			break;
		case 4:
			bIndices = [1, 2, 6, 7];
			break;
	}

	// Mark the entry points that are about to be blitzed
	for (const BINDEX of bIndices)
	{
		activateGroundBlip(BINDEX);
	}

	// Play a sound
	playSound(cam_sounds.enemyUnitDetected);
	
	// Queue the actual units
	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "" + index);
}

function airAssault(index)
{
	let bIndex;
	switch (index)
	{
		case 1:
			bIndex = 6;
			break;
		case 2:
			bIndex = 4;
			break;
	}

	activateAirBlip(bIndex);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "" + index);
}

function activateGroundBlip(index)
{
	const msgName = "C2E_G_ENTRY" + index;

	groundBlips[index] = true;
	hackAddMessage(msgName, PROX_MSG, CAM_HUMAN_PLAYER);
}

function activateAirBlip(index)
{
	const msgName = "C2E_A_ENTRY" + index;

	airBlips[index] = true;
	hackAddMessage(msgName, PROX_MSG, CAM_HUMAN_PLAYER);
}

function clearGroundBlips()
{
	if (groundBlips[1]) hackRemoveMessage("C2E_G_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[2]) hackRemoveMessage("C2E_G_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[3]) hackRemoveMessage("C2E_G_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[4]) hackRemoveMessage("C2E_G_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[5]) hackRemoveMessage("C2E_G_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[6]) hackRemoveMessage("C2E_G_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[7]) hackRemoveMessage("C2E_G_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);

	groundBlips[1] = false;
	groundBlips[2] = false;
	groundBlips[3] = false;
	groundBlips[4] = false;
	groundBlips[5] = false;
	groundBlips[6] = false;
	groundBlips[7] = false;
}

function clearAirBlips()
{
	if (airBlips[1]) hackRemoveMessage("C2E_A_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	// if (airBlips[2]) hackRemoveMessage("C2E_A_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	// if (airBlips[3]) hackRemoveMessage("C2E_A_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[4]) hackRemoveMessage("C2E_A_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[5]) hackRemoveMessage("C2E_A_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[6]) hackRemoveMessage("C2E_A_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

	airBlips[1] = false;
	// airBlips[2] = false;
	// airBlips[3] = false;
	airBlips[4] = false;
	airBlips[5] = false;
	airBlips[6] = false;
}

function groundAssaultWave(index)
{
	clearGroundBlips();

	let waveTemplates;
	switch (index)
	{
		case 1:
			waveTemplates = [
				[ // South entry templates (+commander)
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 4 Heavy Cannons
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit, // 4 Infernos
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Southwest entry templates
					cTempl.cybla, cTempl.cybla, cTempl.cybla,
					cTempl.cybla, cTempl.cybla, cTempl.cybla, // 6 Lancer Cyborgs
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= HARD)
			{
				waveTemplates[0].push(cTempl.comaat, cTempl.comaat); // 2 Cyclones
			}
			if (difficulty == INSANE)
			{
				waveTemplates[0].push(cTempl.cohhct, cTempl.cohhct); // 2 Heavy Cannons
			}

			sendCollectiveGroundWave(mis_Labels.southEntrance, waveTemplates[0], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.southwestEntrance, waveTemplates[1]);
			break;
		case 2:
			waveTemplates = [
				[ // West1 entry templates
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 4 Heavy Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt,
					cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comaat, cTempl.comaat, cTempl.comaat, cTempl.comaat, // 4 Cyclones
				],
				[ // West2 entry templates 
					cTempl.comsensht, // 1 Sensor
					cTempl.comrotmht, cTempl.comrotmht, cTempl.comrotmht,
					cTempl.comrotmht, cTempl.comrotmht, cTempl.comrotmht, // 6 Pepperpots
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 3 Howitzers
				],
			];

			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.westEntrance2, waveTemplates[1]);
			break;
		case 3:
			waveTemplates = [
				[ // South entry templates
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 8 Super Auto Cannons
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, // 4 Assault Guns
				],
				[ // West3 entry templates (+commander)
					cTempl.comsenst, // 1 Sensor
					cTempl.cohraat, // 1 Whirlwind
					cTempl.comact, cTempl.comact, cTempl.comact,
					cTempl.comact, cTempl.comact, cTempl.comact, // 6 Assault Cannons
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt,
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
				],
				[ // West1 entry templates
					cTempl.cohrat, cTempl.cohrat, cTempl.cohrat, cTempl.cohrat, // 4 HRAs
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit, // 4 Infernos
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[1].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty == INSANE)
			{
				waveTemplates[1].push(cTempl.cohraat, cTempl.cohraat); // 2 Whirlwinds
			}

			sendCollectiveGroundWave(mis_Labels.southEntrance, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.westEntrance3, waveTemplates[1], cTempl.comcomt);
			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[2]);
			break;
		case 4:
			waveTemplates = [
				[ // South entry templates (+commander)
					cTempl.comaat, cTempl.comaat, cTempl.comaat, cTempl.comaat, // 4 Cyclones
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
				],
				[ // Southwest entry templates
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.cybag, cTempl.cybag, cTempl.cybag,
					cTempl.cybag, cTempl.cybag, cTempl.cybag, // 6 Assault Gunners
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamers
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
				],
				[ // Northwest entry templates
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 8 Super Auto Cannons
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
				],
				[ // North entry templates (+commander)
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, 
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 6 Heavy Cannons
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[0].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
				waveTemplates[3].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty == INSANE)
			{
				waveTemplates[0].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
				waveTemplates[3].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
			}

			sendCollectiveGroundWave(mis_Labels.southEntrance, waveTemplates[0], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.southwestEntrance, waveTemplates[1]);
			sendCollectiveGroundWave(mis_Labels.northwestEntrance, waveTemplates[2]);
			sendCollectiveGroundWave(mis_Labels.northEntrance, waveTemplates[3], cTempl.cohcomt);

			// Allow the player to win after this point
			removeTimer("supportAttack");
			wavesDone = true;
			break;
	}
}

function airAssaultWave(index)
{
	clearAirBlips();

	const vtolData1 = {
		templates: [ // Bombers
			[cTempl.colbombv], // Cluster Bombs
			[cTempl.comthermv], // Thermite Bombs
			[cTempl.comhbombv], // HEAP Bombs
		],
		extras: [
			{limit: 4},
			{limit: 2},
			{limit: 2},
		]
	};
	const vtolData2 = {
		templates: [ // Strafers
			[cTempl.comacv], // Assault Cannons
			[cTempl.colagv], // Assault Guns
		],
		extras: [
			{limit: 4},
			{limit: 8},
		]
	};

	let entrance;
	let vtolData;

	switch (index)
	{
		case 1:
			entrance = mis_Labels.vtolSpawnPos6;
			vtolData = vtolData1;
			break;
		case 2:
			entrance = mis_Labels.vtolSpawnPos4;
			vtolData = vtolData2;
			break;
	}

	for (let i = 0; i < vtolData.templates.length; i++)
	{
		// Send some one-time VTOL groups
		camSetVtolData(CAM_THE_COLLECTIVE, entrance, mis_Labels.vtolRemovePos, vtolData.templates[i], undefined, undefined, vtolData.extras[i]);
	}
}

function sendCollectiveGroundWave(entry, templates, commTemplate)
{
	if (camDef(commTemplate))
	{
		// Rank changes on difficulty:
		// Professional (SUPEREASY/EASY/MEDIUM)
		// Veteran (HARD)
		// Elite (INSANE)
		const COMMANDER_RANK = (difficulty <= MEDIUM) ? 4 : (difficulty + 2);

		const commLabel = "colCommander" + colCommanderIndex++;
		const commDroid = camAddDroid(CAM_THE_COLLECTIVE, camMakePos(entry), commTemplate);
		addLabel(commDroid, commLabel);
		camSetDroidRank(commDroid, COMMANDER_RANK);
		camManageGroup(camMakeGroup(commDroid), CAM_ORDER_ATTACK, {repair: 40});

		// Send in the rest of the group; which will follow the leader
		camSendReinforcement(CAM_THE_COLLECTIVE, entry, templates, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_FOLLOW,
			data: {
				leader: commLabel,
				suborder: CAM_ORDER_ATTACK
			}
		});
	}
	else
	{
		// No leader; just send in the group
		camSendReinforcement(CAM_THE_COLLECTIVE, entry, templates, CAM_REINFORCE_GROUND);
	}
}

function supportAttack()
{
	const entrances = [
		mis_Labels.northEntrance,
		mis_Labels.northwestEntrance,
		mis_Labels.westEntrance1,
		mis_Labels.westEntrance2,
		mis_Labels.westEntrance3,
		mis_Labels.southwestEntrance,
		mis_Labels.southEntrance,
	];
	const truckJobs = [ // NOTE: Truck jobs are paired with entrances
		truckJob4,
		truckJob4,
		truckJob2,
		truckJob3,
		truckJob1,
		truckJob1,
		truckJob1,
	];

	let numGroups = 0;
	if (difficulty >= MEDIUM) numGroups++;
	if (difficulty >= HARD) numGroups++;
	if (difficulty == INSANE) numGroups++;
	if (getMissionTime() < camMinutesToSeconds(10)) numGroups++;

	if (numGroups > 0)
	{
		for (let i = 0; i < numGroups; i++)
		{
			const INDEX = camRand(entrances.length);

			sendSupportWave(entrances[INDEX]);
			sendLZTrucks(entrances[INDEX], truckJobs[INDEX]);

			// Don't choose the same entrance again
			entrances.splice(INDEX, 1);
			truckJobs.splice(INDEX, 1);
		}
	}
}

function sendSupportWave(entrance)
{
	// Support waves come in two forms:
	// 1.) Halftrack/Cyborg group
	// 2.) Sensor/artillery group

	let droids = [];
	switch (camRand(2))
	{
		case 0: // Halftracks & Cyborgs
			droids = [
				cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
				cTempl.commraht, cTempl.commraht, // 2 MRAs
				cTempl.cybth, cTempl.cybth, cTempl.cybth, // 3 Thermite Flamers
				cTempl.cybag, cTempl.cybag, cTempl.cybag, // 3 Assault Gunners
			];
			break;
		case 1: // Sensor + Mortars
			droids = [
				cTempl.comsenst, // 1 Sensor
				cTempl.comorbt, cTempl.comorbt, cTempl.comorbt, cTempl.comorbt, // 4 Bombards
				cTempl.cohbalt, cTempl.cohbalt, cTempl.cohbalt, // 3 Ballistas
			];
			break;
	}

	// Send in the group
	camSendReinforcement(CAM_THE_COLLECTIVE, entrance, droids, CAM_REINFORCE_GROUND);
}

// Send trucks to attempt building Collective LZs
function sendLZTrucks(entrance, index)
{
	const truckJobs = [truckJob1, truckJob2, truckJob3, truckJob4];

	// Don't send a truck if there's already one working on this LZ
	if (!camGetTruck(truckJobs[index]))
	{
		const tPos = camMakePos(entrance);
		const tTemp = cTempl.comtruckt;
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp), truckJobs[index]);
	}
}

// Send a Collective transport to one of the built LZs (if any exist)
function sendCollectiveTransporter()
{
	// Choose a built LZ (prioritizing ones closer to the player's base)
	let pos;
	else if (!camBaseIsEliminated("NorthLZ"))
	{
		pos = mis_Labels.lzPos4;
	}
	else if (!camBaseIsEliminated("WestLZ"))
	{
		pos = mis_Labels.lzPos3;
	}
	else if (!camBaseIsEliminated("NorthWestLZ"))
	{
		pos = mis_Labels.lzPos2;
	}
	else if (!camBaseIsEliminated("SouthWestLZ"))
	{
		pos = mis_Labels.lzPos1;
	}
	else
	{
		return; // No LZs built :(
	}

	// Get a pool of possible templates
	const droidPool = [
		cTempl.cybth, // Thermite Flamer Cyborg
		cTempl.cybag, // Assault Gunner Cyborg
		cTempl.scytk, // Super TK Cyborg
		cTempl.scygr, // Super Grenadier Cyborg
		cTempl.scyac, // Super Auto Gunner Cyborg
		cTempl.comhatht, // Tank Killer
		cTempl.comhpvht, // HVC
		cTempl.comaght, // Assault Gun
		cTempl.comrepht, // Repair Turret
	];

	// Generate a list of droids to send
	const droids = [];
	let numDroids = 6;
	if (difficulty === INSANE) numDroids = 10;
	else if (difficulty >= MEDIUM) numDroids = 8;

	for (let i = 0; i < numDroids; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, pos, droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camGenerateRandomMapEdgeCoordinate(),
			exit: camGenerateRandomMapEdgeCoordinate(),
		}
	);
}

// This whole mission is essentially a watered-down version of Beta 11, but without the evacuation part
function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Destroy all Collective reinforcements"));

	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, cam_levels.beta9.pre, {
		callback: "extraVictoryCondition"
	});

	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camMinutesToSeconds(45));

	camCompleteRequiredResearch(mis_collectiveRes, CAM_THE_COLLECTIVE);

	// Collective LZs
	camSetEnemyBases({
		"SouthWestLZ": {
			cleanup: mis_Labels.lzStructArea1,
			detectMsg: "C2E_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE // We need these in case the player already has structures here
		},
		"NorthWestLZ": {
			cleanup: mis_Labels.lzStructArea2,
			detectMsg: "C2E_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"WestLZ": {
			cleanup: mis_Labels.lzStructArea3,
			detectMsg: "C2E_LZ3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"NorthLZ": {
			cleanup: mis_Labels.lzStructArea4,
			detectMsg: "C2E_LZ4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
	});

	truckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "SouthWestLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs1
	});
	truckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "NorthWestLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs2
	});
	truckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "WestLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs3
	});
	truckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "NorthLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs4
	});

	// Used to keep track of which bips are active
	groundBlips = [
		null,
		false, // Blip #1
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
		false, // Blip #6
		false, // Blip #7
	];
	airBlips = [
		null,
		false, // Blip #1
		false, // Blip #2 (unused)
		false, // Blip #3 (unused)
		false, // Blip #4
		false, // Blip #5
		false, // Blip #6
	];
	colCommanderIndex = 0;
	wavesDone = false;

	// Queue large telegraphed Collective ground and air attacks
	queue("groundAssault", camMinutesToMilliseconds(0.5), "1");
	queue("vtolAttack", camMinutesToMilliseconds(2));
	queue("groundAssault", camMinutesToMilliseconds(3), "2");
	queue("airAssault", camMinutesToMilliseconds(4), "1");
	queue("groundAssault", camMinutesToMilliseconds(6), "3");
	queue("airAssault", camMinutesToMilliseconds(7), "2");
	queue("groundAssault", camMinutesToMilliseconds(9), "4"); // Final attack

	// Smaller untelegraphed attacks every few minutes
	setTimer("supportAttack", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	setTimer("checkEnemyVtolArea", camSecondsToMilliseconds(1));

	camPlayVideos({video: "MB2_DI_MSG2", type: CAMP_MSG});
}

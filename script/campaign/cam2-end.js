include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

var allowWin;
var lastTransportAlert;
const mis_collectiveRes = [
	"R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	"R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	"R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	"R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy02",
	"R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy02",
	"R-Wpn-Bomb-Damage01",
	"R-Wpn-Missile-Damage01",
	"R-Defense-WallUpgrade06", "R-Struc-Materials06",
	"R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Vehicle-Metals06", "R-Cyborg-Metals06",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",
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
	lzStructArea5: {x: 99, y: 17, x2: 105, y2: 24},
	lzStructArea6: {x: 56, y: 38, x2: 65, y2: 46},
	lzStructArea7: {x: 113, y: 113, x2: 124, y2: 120},
	lzPos1: {x: 32, y: 108},
	lzPos2: {x: 18, y: 17},
	lzPos3: {x: 20, y: 48},
	lzPos4: {x: 66, y: 9},
	lzPos5: {x: 102, y: 21},
	lzPos6: {x: 61, y: 42},
	lzPos7: {x: 118, y: 117},
	eastEntrance: {x: 124, y: 32, x2: 125, y2: 36},
	northeastEntrance: {x: 119, y: 2, x2: 124, y2: 3},
	northEntrance: {x: 93, y: 2, x2: 97, y2: 3},
	northwestEntrance: {x: 43, y: 2, x2: 47, y2: 3},
	westEntrance1: {x: 2, y: 43, x2: 3, y2: 46},
	westEntrance2: {x: 2, y: 65, x2: 3, y2: 70},
	westEntrance3: {x: 2, y: 111, x2: 3, y2: 113},
	southwestEntrance: {x: 6, y: 124, x2: 10, y2: 125},
	southEntrance: {x: 50, y: 124, x2: 54, y2: 125},
	southeastEntrance: {x: 122, y: 124, x2: 125, y2: 125},
	vtolRemovePos: {x: 127, y: 64},
	vtolSpawnPos1: {x: 99, y: 1},
	vtolSpawnPos2: {x: 127, y: 65},
	vtolSpawnPos3: {x: 127, y: 28},
	vtolSpawnPos4: {x: 36, y: 1},
	vtolSpawnPos5: {x: 1, y: 28},
	vtolSpawnPos6: {x: 1, y: 101},
};
const MIS_ASSAULT_DELAY = camSecondsToMilliseconds(20);
var truckJob1;
var truckJob2;
var truckJob3;
var truckJob4;
var truckJob5;
var truckJob6;
var truckJob7;
var groundBlips, airBlips;
var colCommanderIndex;

//NOTE: this is only called once from the library's eventMissionTimeout().
function checkIfLaunched()
{
	const transporters = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && camIsTransporter(obj)
	));
	if (transporters.length > 0)
	{
		allowWin = false;
	}

	if (allowWin)
	{
		camCallOnce("playLastVideo");
		return true;
	}
	return false;
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

//Play last video sequence.
function playLastVideo()
{
	camPlayVideos({video: "CAM2_OUT", type: CAMP_MSG});
}

//Allow a win if a transporter was launched with a construction droid.
function eventTransporterLaunch(transporter)
{
	if (!allowWin && transporter.player === CAM_HUMAN_PLAYER)
	{
		const cargoDroids = enumCargo(transporter);

		for (let i = 0, len = cargoDroids.length; i < len; ++i)
		{
			const virDroid = cargoDroids[i];

			if (virDroid && virDroid.droidType === DROID_CONSTRUCT)
			{
				allowWin = true;
				break;
			}
		}
	}
}

function eventTransporterArrived(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		transportReturnAlert();
	}
}

// This function is needed to ensure that the return alert is only played ONCE per trip
function transportReturnAlert()
{
	if (lastTransportAlert + camSecondsToMilliseconds(30) < gameTime)
	{
		lastTransportAlert = gameTime;
		playSound(cam_sounds.transport.transportReturningToBase);
	}
}

//Attack every 30 seconds.
function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	let vtolPositions = [
		mis_Labels.vtolSpawnPos1,
		mis_Labels.vtolSpawnPos2,
		mis_Labels.vtolSpawnPos3,
		mis_Labels.vtolSpawnPos4,
		mis_Labels.vtolSpawnPos5,
		mis_Labels.vtolSpawnPos6
	];

	if (difficulty >= INSANE)
	{
		vtolPositions = undefined; //to randomize the spawns each time
	}

	// HEAP Bombs, Thermite Bombs, Tank Killers, Assault Cannons, Assault Guns
	let list = [ cTempl.comhbv, cTempl.comtbv, cTempl.comhatv, cTempl.comacv, cTempl.colagv ];
	const extras = {
		limit: [2, 2, 2, 3, 5],
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
		case "1":
			bIndices = [1, 4];
			break;
		case "2":
			bIndices = [3, 5, 6];
			break;
		case "3":
			bIndices = [2, 6, 7];
			break;
		case "4":
			bIndices = [5, 9, 10];
			break;
		case "5":
			bIndices = [4, 5];
			break;
		case "6":
			bIndices = [2, 6, 10];
			break;
		case "7":
			bIndices = [5, 7, 8, 9];
			break;
		case "8":
			bIndices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
	queue("groundAssaultWave", MIS_ASSAULT_DELAY, "" + index);
}

function airAssault(index)
{
	let bIndices;
	switch (index)
	{
		case "1":
			bIndices = [4];
			break;
		case "2":
			bIndices = [3, 6];
			break;
		case "3":
			bIndices = [1, 2, 5];
			break;
		case "4":
			bIndices = [3, 5];
			break;
		case "5":
			bIndices = [1, 4, 6];
			break;
		case "6":
			bIndices = [1, 2, 3, 4, 5, 6];
			break;
	}

	for (const BINDEX of bIndices)
	{
		activateAirBlip(BINDEX);
	}

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_ASSAULT_DELAY, "" + index);
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
	if (groundBlips[8]) hackRemoveMessage("C2E_G_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[9]) hackRemoveMessage("C2E_G_ENTRY9", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[10]) hackRemoveMessage("C2E_G_ENTRY10", PROX_MSG, CAM_HUMAN_PLAYER);

	groundBlips[1] = false;
	groundBlips[2] = false;
	groundBlips[3] = false;
	groundBlips[4] = false;
	groundBlips[5] = false;
	groundBlips[6] = false;
	groundBlips[7] = false;
	groundBlips[8] = false;
	groundBlips[9] = false;
	groundBlips[10] = false;
}

function clearAirBlips()
{
	if (airBlips[1]) hackRemoveMessage("C2E_A_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[2]) hackRemoveMessage("C2E_A_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[3]) hackRemoveMessage("C2E_A_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[4]) hackRemoveMessage("C2E_A_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[5]) hackRemoveMessage("C2E_A_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[6]) hackRemoveMessage("C2E_A_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

	airBlips[1] = false;
	airBlips[2] = false;
	airBlips[3] = false;
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
		case "1":
			waveTemplates = [
				[ // West2 entry templates
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 3 Heavy Cannons
					cTempl.commct, cTempl.commct, cTempl.commct, cTempl.commct, // 4 Medium Cannons
					cTempl.cybag, cTempl.cybag, cTempl.cybag,
					cTempl.cybag, cTempl.cybag, cTempl.cybag, // 6 Heavy Machinegunners
					cTempl.comit, cTempl.comit, // 2 Infernos
				],
				[ // South entry templates
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Lancer Cyborgs
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
				],
			];
			sendCollectiveGroundWave(mis_Labels.westEntrance2, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.southEntrance, waveTemplates[1]);
			break;
		case "2":
			waveTemplates = [
				[ // Northwest entry templates
					cTempl.commct, cTempl.commct, cTempl.commct,
					cTempl.commct, cTempl.commct, cTempl.commct, // 6 Medium Cannons
					cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 4 Heavy Machineguns
					cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, // 4 MRPs
				],
				[ // West1 entry templates (+commander)
					cTempl.cohhct, cTempl.cohhct, // 2 Heavy Cannons
					cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 4 HVCs
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, // 4 Super Heavy Gunners
				],
				[ // West3 entry templates
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Lancer Cyborgs
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= HARD)
			{
				waveTemplates[1].push(cTempl.comhpvt, cTempl.comhpvt); // 2 HVCs
			}
			if (difficulty == INSANE)
			{
				waveTemplates[1].push(cTempl.cohhct, cTempl.cohhct); // 2 Heavy Cannons
			}

			sendCollectiveGroundWave(mis_Labels.northwestEntrance, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[1], cTempl.comcomt);
			sendCollectiveGroundWave(mis_Labels.westEntrance3, waveTemplates[2]);
			break;
		case "3":
			waveTemplates = [
				[ // North entry templates (+commander)
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct,
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 6 Heavy Cannons
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact,
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact, // 8 Assault Cannons
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Northwest entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comatt, cTempl.comatt, cTempl.comatt,
					cTempl.comatt, cTempl.comatt, cTempl.comatt, // 6 Bombards
					cTempl.cohbalt, cTempl.cohbalt, // 2 Ballistas
					cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 4 Assault Gunners
					cTempl.cybla, cTempl.cybla, cTempl.cybla,
					cTempl.cybla, cTempl.cybla, cTempl.cybla, // 6 Lancer Cyborgs
				],
				[ // Southwest entry templates
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, // 4 Assault Guns
					cTempl.scygr, cTempl.scygr, cTempl.scygr,
					cTempl.scygr, cTempl.scygr, cTempl.scygr, // 6 Super Grenadiers
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[0].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty == INSANE)
			{
				waveTemplates[0].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
			}

			sendCollectiveGroundWave(mis_Labels.northEntrance, waveTemplates[0], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.northwestEntrance, waveTemplates[1]);
			sendCollectiveGroundWave(mis_Labels.southwestEntrance, waveTemplates[2]);
			break;
		case "4":
			waveTemplates = [
				[ // West1 entry templates
					cTempl.cohact, cTempl.cohact, cTempl.cohact, 
					cTempl.cohact, cTempl.cohact, cTempl.cohact, // 6 Assault Cannons (Tiger)
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact,
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact, // 8 Assault Cannons (Panther)
					cTempl.comagt, cTempl.comagt, cTempl.comagt,
					cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // East entry templates
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.cybag, cTempl.cybag, cTempl.cybag,
					cTempl.cybag, cTempl.cybag, cTempl.cybag, // 6 Assault Gunners
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamers
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
				],
				[ // Southeast entry templates
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 8 Super Auto Cannons
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
				],
			];

			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.eastEntrance, waveTemplates[1]);
			sendCollectiveGroundWave(mis_Labels.southeastEntrance, waveTemplates[2]);
			break;
		case "5":
			waveTemplates = [
				[ // West1 entry templates (+commander)
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt,
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 8 Tank Killers
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt,
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 8 HVCs
					cTempl.comaat, cTempl.comaat, // 2 Cyclones
				],
				[ // West2 entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, 
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
					cTempl.comrept, cTempl.comrept, cTempl.comrept, // 3 Repair Turrets
					cTempl.comsenst, // 1 Sensor
					cTempl.comsamt, cTempl.comsamt, // 2 Avengers
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[0].push(cTempl.comhpvt, cTempl.comhpvt); // 2 HVCs
				waveTemplates[1].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
			}
			if (difficulty == INSANE)
			{
				waveTemplates[0].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
				waveTemplates[1].push(cTempl.cohraat, cTempl.cohraat); // 2 Whirlwinds
			}

			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[0], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.westEntrance2, waveTemplates[1], cTempl.cohcomt);
			break;
		case "6":
			waveTemplates = [
				[ // Southeast entry templates
					cTempl.comit, cTempl.comit, cTempl.comit,
					cTempl.comit, cTempl.comit, cTempl.comit, // 6 Infernos
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.comaat, cTempl.comaat, cTempl.comaat, cTempl.comaat, // 4 Cyclones
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
				],
				[ // Southwest entry templates
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht,
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 6 HVCs
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 8 Super Auto Cannons
					cTempl.scytk, cTempl.scytk, cTempl.scytk,
					cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killers
					cTempl.comsamht, cTempl.comsamht, // 2 Avengers
				],
				[ // Northwest entry templates (+commander)
					cTempl.comagt, cTempl.comagt, cTempl.comagt,
					cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.cohact, cTempl.cohact, // 2 Assault Cannons
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[2].push(cTempl.cohact, cTempl.cohact); // 2 Assault Cannons
			}
			if (difficulty == INSANE)
			{
				waveTemplates[2].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}

			sendCollectiveGroundWave(mis_Labels.southeastEntrance, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.southwestEntrance, waveTemplates[1]);
			sendCollectiveGroundWave(mis_Labels.northwestEntrance, waveTemplates[2], cTempl.cohcomt);
			break;
		case "7":
			waveTemplates = [
				[ // West1 entry templates
					cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, 
					cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 8 Assault Gunners
					cTempl.scytk, cTempl.scytk, cTempl.scytk, 
					cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killers
					cTempl.scygr, cTempl.scygr, cTempl.scygr, 
					cTempl.scygr, cTempl.scygr, cTempl.scygr, // 6 Super Grenadiers
				],
				[ // Northeast entry templates
					cTempl.comsensht,
					cTempl.comrotmht, cTempl.comrotmht, cTempl.comrotmht,
					cTempl.comrotmht, cTempl.comrotmht, cTempl.comrotmht, // 6 Pepperpots
					cTempl.cohript, cTempl.cohript, cTempl.cohript,
					cTempl.cohript, cTempl.cohript, cTempl.cohript, // 6 Ripple Rockets
				],
				[ // North entry templates (+commander)
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct,
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 6 Heavy Cannons
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt,
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 6 Bunker Busters
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
				],
				[ // East entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat,
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit, // 4 Infernos
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comsamt, cTempl.comsamt, // 2 Avengers
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[2].push(cTempl.cohhct, cTempl.cohhct); // 2 Heavy Cannons
				waveTemplates[3].push(cTempl.comit, cTempl.comit); // 2 Infernos
			}
			if (difficulty == INSANE)
			{
				waveTemplates[2].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
				waveTemplates[3].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}

			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[0]);
			sendCollectiveGroundWave(mis_Labels.northeastEntrance, waveTemplates[1]);
			sendCollectiveGroundWave(mis_Labels.northEntrance, waveTemplates[2], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.eastEntrance, waveTemplates[3], cTempl.cohcomt);
			break;
		case "8":
			// NOTE: ALL of these have commanders!!!
			// (But since there's < 2 minutes left in the mission, most of these guys probably won't actually see any action)
			waveTemplates = [
				[ // South entry templates
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 4 Heavy Cannons
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.comaat, cTempl.comaat, cTempl.comaat, cTempl.comaat, // 4 Cyclones
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact, // 4 Assault Cannons
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Southwest entry templates
					cTempl.comagt, cTempl.comagt, cTempl.comagt,
					cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt,
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.comaat, cTempl.comaat, cTempl.comaat, cTempl.comaat, // 4 Cyclones
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // West3 entry templates
					cTempl.comsamt, cTempl.comsamt, cTempl.comsamt, cTempl.comsamt, // 4 Avengers
					cTempl.comrept, cTempl.comrept, cTempl.comrept,
					cTempl.comrept, cTempl.comrept, cTempl.comrept, // 6 Repair Turrets
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt,
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 8 HVCs
				],
				[ // West2 entry templates
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat,
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 8 HRAs
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 4 HVCs
				],
				[ // West1 entry templates
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt,
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 6 Bunker Busters
					cTempl.comaat, cTempl.comaat, cTempl.comaat, cTempl.comaat, // 4 Cyclones
					cTempl.comit, cTempl.comit, cTempl.comit,
					cTempl.comit, cTempl.comit, cTempl.comit, // 6 Infernos
				],
				[ // Northwest entry templates
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt,
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 8 Tank Killers
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt,
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 6 Bunker Busters
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
				],
				[ // North entry templates
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct,
					cTempl.cohhct, cTempl.cohhct, cTempl.cohhct, // 6 Heavy Cannons
					cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit,
					cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit, // 8 Infernos
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Northeast entry templates
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact,
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact, // 8 Assault Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt,
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 8 Assault Guns
					cTempl.comsamt, cTempl.comsamt, // 2 Avengers
				],
				[ // East entry templates
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt,
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
					cTempl.comit, cTempl.comit, // 2 Infernos
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Southeast entry templates
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.comact, cTempl.comact, cTempl.comact, cTempl.comact, // 4 Assault Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comsamt, cTempl.comsamt, // 2 Avengers
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.comit, cTempl.comit, cTempl.comit, cTempl.comit, // 4 Infernos
				],
			];

			if (difficulty >= HARD)
			{
				waveTemplates[0].push(cTempl.cohhct, cTempl.cohhct); // Just give everything more Heavy Cannons
				waveTemplates[1].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[2].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[3].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[4].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[5].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[6].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[7].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[8].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[9].push(cTempl.cohhct, cTempl.cohhct);
			}
			if (difficulty == INSANE)
			{
				waveTemplates[0].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[1].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[2].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[3].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[4].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[5].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[6].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[7].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[8].push(cTempl.cohhct, cTempl.cohhct);
				waveTemplates[9].push(cTempl.cohhct, cTempl.cohhct);
			}

			sendCollectiveGroundWave(mis_Labels.southEntrance, waveTemplates[0], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.southwestEntrance, waveTemplates[1], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.westEntrance3, waveTemplates[2], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.westEntrance2, waveTemplates[3], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.westEntrance1, waveTemplates[4], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.northwestEntrance, waveTemplates[5], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.northEntrance, waveTemplates[6], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.northeastEntrance, waveTemplates[7], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.eastEntrance, waveTemplates[8], cTempl.cohcomt);
			sendCollectiveGroundWave(mis_Labels.southeastEntrance, waveTemplates[9], cTempl.comcomt); // This one is a Panther
			break;
	}
}

function airAssaultWave(index)
{
	clearAirBlips();

	const vtolData1 = {
		templates: [ // Anti-unit stuff
			[cTempl.colagv], // Assault Guns
			[cTempl.colatv], // Lancers
			[cTempl.colpbv], // Phosphor Bombs
		],
		extras: [
			{limit: 4},
			{limit: 3},
			{limit: 2},
		]
	};
	const vtolData2 = {
		templates: [ // Bombers
			[cTempl.colcbv], // Cluster Bombs
			[cTempl.comtbv], // Thermite Bombs
			[cTempl.comhbv], // HEAP Bombs
		],
		extras: [
			{limit: 4},
			{limit: 2},
			{limit: 2},
		]
	};
	const vtolData3 = {
		templates: [ // Strafers
			[cTempl.comacv], // Assault Cannons
			[cTempl.colagv], // Assault Guns
		],
		extras: [
			{limit: 4},
			{limit: 8},
		]
	};

	let entrances;
	let vtolData;

	switch (index)
	{
		case "1":
			entrances = [mis_Labels.vtolSpawnPos4];
			vtolData = vtolData2;
			break;
		case "2":
			entrances = [mis_Labels.vtolSpawnPos3, mis_Labels.vtolSpawnPos6];
			vtolData = vtolData1;
			break;
		case "3":
			entrances = [mis_Labels.vtolSpawnPos1, mis_Labels.vtolSpawnPos2, mis_Labels.vtolSpawnPos5];
			vtolData = vtolData3;
			break;
		case "4":
			entrances = [mis_Labels.vtolSpawnPos3, mis_Labels.vtolSpawnPos5];
			vtolData = vtolData2;
			break;
		case "5":
			entrances = [mis_Labels.vtolSpawnPos1, mis_Labels.vtolSpawnPos4, mis_Labels.vtolSpawnPos6];
			vtolData = vtolData1;
			break;
		case "6":
			entrances = [
				mis_Labels.vtolSpawnPos1, mis_Labels.vtolSpawnPos2, mis_Labels.vtolSpawnPos3,
				mis_Labels.vtolSpawnPos4, mis_Labels.vtolSpawnPos5, mis_Labels.vtolSpawnPos6
			];
			vtolData = vtolData3;
			break;
	}

	for (const entrance of entrances)
	{
		for (let i = 0; i < vtolData.templates.length; i++)
		{
			// Send some one-time VTOL groups
			camSetVtolData(CAM_THE_COLLECTIVE, entrance, mis_Labels.vtolRemovePos, vtolData.templates[i], undefined, undefined, vtolData.extras[i]);
		}
	}
}

function sendCollectiveGroundWave(entry, templates, commTemplate)
{
	if (camDef(commTemplate))
	{
		// This group has a commander leader; create one
		// Rank changes on difficulty:
		// Elite (SUPEREASY/EASY/MEDIUM)
		// Special (HARD)
		// Hero (INSANE)
		const COMMANDER_RANK = (difficulty <= MEDIUM) ? 6 : (difficulty + 4);

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
		mis_Labels.eastEntrance,
		mis_Labels.northeastEntrance,
		mis_Labels.northEntrance,
		mis_Labels.northwestEntrance,
		mis_Labels.westEntrance1,
		mis_Labels.westEntrance2,
		mis_Labels.westEntrance3,
		mis_Labels.southwestEntrance,
		mis_Labels.southEntrance,
		mis_Labels.southeastEntrance,
	];
	const truckJobs = [ // NOTE: Truck jobs are paired with entrances
		truckJob5,
		truckJob5,
		truckJob4,
		truckJob6,
		truckJob2,
		truckJob3,
		truckJob1,
		truckJob1,
		truckJob1,
		truckJob7,
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
	// Support waves come in three forms:
	// 1.) Halftrack/Cyborg group
	// 2.) Sensor/artillery group
	// 3.) Hover group

	// These groups get stronger over time...
	const TIME_FLAG1 = (getMissionTime() < camMinutesToSeconds(20));
	const TIME_FLAG2 = (getMissionTime() < camMinutesToSeconds(10));

	let droids = [];
	switch (camRand(3))
	{
		case 0: // Halftracks & Cyborgs
			if (!TIME_FLAG1)
			{
				droids = [
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
					cTempl.commraht, cTempl.commraht, // 2 MRAs
					cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, // 3 Flamers
					cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // 3 Heavy Machinegunners
				];
			}
			else // Switch to this after the 20-minute mark
			{
				droids = [
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.comhpvht, cTempl.comhpvht, // 2 HVCs
					cTempl.cybth, cTempl.cybth, cTempl.cybth, // 3 Thermite Flamers
					cTempl.cybag, cTempl.cybag, cTempl.cybag, // 3 Assault Gunners
				];
			}
			break;
		case 1: // Sensor + Mortars
			droids.push(cTempl.comsensht);
			if (!TIME_FLAG1)
			{
				droids.concat([cTempl.comorbht, cTempl.comorbht, cTempl.comorbht, cTempl.comorbht]); // Bombards
			}
			else // Switch to this after the 20-minute mark
			{
				droids.concat([cTempl.comrotmht, cTempl.comrotmht, cTempl.comrotmht, cTempl.comrotmht]); // Pepperpots
			}

			if (TIME_FLAG1)
			{
				switch (camRand(3))
				{
					case 0:
						droids.concat([cTempl.cohbalt, cTempl.cohbalt, cTempl.cohbalt]); // Add Ballistas
						break;
					case 1:
						droids.concat([cTempl.cohript, cTempl.cohript]); // Add Ripple Rockets
						break;
					case 2:
						if (difficulty === INSANE || TIME_FLAG2)
						{
							droids.concat([cTempl.cohshakt, cTempl.cohshakt]); // Add Ground Shakers
						}
						else
						{
							droids.concat([cTempl.cohhowt, cTempl.cohhowt]); // Add Howitzers
						}
						break;
				}
			}

			if (TIME_FLAG2)
			{
				droids.concat([cTempl.comhatht, cTempl.comhatht, cTempl.comaght, cTempl.comaght]); // Add Halftrack escorts
			}
			break;
		case 2:
			if (!TIME_FLAG1)
			{
				droids = [
					cTempl.comhpvh, cTempl.comhpvh, // 2 HVCs
					cTempl.comath, cTempl.comath, cTempl.comath, // 3 Lancers
					cTempl.commrah, cTempl.commrah, cTempl.commrah, // 3 MRAs
				];
			}
			else if (!TIME_FLAG1) // Switch to this ater the 20-minute mark
			{
				droids = [
					cTempl.comhpvh, cTempl.comhpvh, // 2 HVCs
					cTempl.comhath, cTempl.comhath, // 2 Tank Killers
					cTempl.cohhrah, cTempl.cohhrah, // 2 HRAs
					cTempl.combbh, // 1 Bunker Buster
				];
			}
			else // Switch to this ater the 10-minute mark
			{
				droids = [
					cTempl.comhpvh, cTempl.comhpvh, cTempl.comhpvh, cTempl.comhpvh, // 4 HVCs
					cTempl.comhath, cTempl.comhath, // 2 Tank Killers
					cTempl.cohhrah, cTempl.cohhrah, // 2 HRAs
					cTempl.cohbbh, cTempl.cohbbh, // 2 Bunker Busters
				];
			}
			break;
	}

	// Send in the group
	camSendReinforcement(CAM_THE_COLLECTIVE, entrance, droids, CAM_REINFORCE_GROUND);
}

// Send trucks to attempt building Collective LZs
function sendLZTrucks(entrance, truckJob)
{
	// Don't send a truck if there's already one working on this LZ
	if (!camGetTruck(truckJob))
	{
		const tPos = camMakePos(entrance);
		const tTemp = cTempl.comtruckht;
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp), truckJob);
	}
}

// Send a Collective transport to one of the built LZs (if any exist)
function sendCollectiveTransporter()
{
	// Choose a built LZ (prioritizing ones closer to the player's base)
	let pos;
	if (!camBaseIsEliminated("SouthEastLZ"))
	{
		pos = mis_Labels.lzPos7;
	}
	else if (!camBaseIsEliminated("CentralLZ"))
	{
		pos = mis_Labels.lzPos6;
	}
	else if (!camBaseIsEliminated("NorthEastLZ"))
	{
		pos = mis_Labels.lzPos5;
	}
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

// Start the mission properly
function missionSetup()
{
	camSetExtraObjectiveMessage(_("Send off as many transporters as you can and bring at least one truck"));
	setMissionTime(camMinutesToSeconds(30)); // NOTE: This timer stays even in Timerless mode
	camSetupTransporter(mis_Labels.trPlace.x, mis_Labels.trPlace.y, mis_Labels.trExit.x, mis_Labels.trExit.y);
	playSound(cam_sounds.lz.returnToLZ);

	// Queue large telegraphed Collective ground and air attacks
	queue("vtolAttack", camMinutesToMilliseconds(2)); // at 28 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(5), "1"); // at 25 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(9), "2"); // at 21 minutes remaining
	queue("airAssault", camMinutesToMilliseconds(10), "1"); // at 20 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(13), "3"); // at 17 minutes remaining
	queue("airAssault", camMinutesToMilliseconds(16), "2"); // at 14 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(18), "4"); // at 12 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(20), "5"); // at 10 minutes remaining
	queue("airAssault", camMinutesToMilliseconds(22), "3"); // at 8 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(24), "6"); // at 6 minutes remaining
	queue("airAssault", camMinutesToMilliseconds(25), "4"); // at 5 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(26), "7"); // at 4 minutes remaining
	queue("airAssault", camMinutesToMilliseconds(27), "5"); // at 3 minutes remaining
	queue("groundAssault", camMinutesToMilliseconds(28), "8"); // at 2 minutes remaining
	queue("airAssault", camMinutesToMilliseconds(29), "6"); // at 1 minute remaining

	// Smaller untelegraphed attacks every few minutes
	setTimer("supportAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	// Visually shift the sky and weather over the course of the mission
	// Shift the fog to 1.5 default brightness (and lower the blue)
	camGradualFog(camMinutesToMilliseconds(30), 24, 24, 64);
	// Shift the lighting to be brighter and with a slight orange-red hue
	camGradualSunIntensity(camMinutesToMilliseconds(30), .6, .55, .5);
	queue("reduceRain", camMinutesToMilliseconds(10));
	queue("stopRain", camMinutesToMilliseconds(20));
}

function reduceRain()
{
	// Intermittent rain
	camSetWeather(CAM_WEATHER_RAIN); // Could also use CAM_WEATHER_DEFAULT
}

function stopRain()
{
	// Stop the rain
	camSetWeather(CAM_WEATHER_CLEAR);
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, cam_levels.gamma1, {
		reinforcements: camMinutesToSeconds(3), //Duration the transport "leaves" map.
		callback: "checkIfLaunched"
	});

	centreView(mis_Labels.startPos.x, mis_Labels.startPos.y);
	setNoGoArea(mis_Labels.lz.x, mis_Labels.lz.y, mis_Labels.lz.x2, mis_Labels.lz.y2, CAM_HUMAN_PLAYER);

	// Grant a minute-long "grace" period where nothing happens
	setMissionTime(62);

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
		"NorthEastLZ": {
			cleanup: mis_Labels.lzStructArea5,
			detectMsg: "C2E_LZ5",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"CentralLZ": {
			cleanup: mis_Labels.lzStructArea6,
			detectMsg: "C2E_LZ6",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"SouthEastLZ": {
			cleanup: mis_Labels.lzStructArea7,
			detectMsg: "C2E_LZ7",
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
	truckJob5 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "NorthEastLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs5
	});
	truckJob6 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "CentralLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs6
	});
	truckJob7 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "SouthEastLZ",
			rebuildBase: true,
			structset: camBetaCOLZStructs7
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
		false, // Blip #8
		false, // Blip #9
		false, // Blip #10
	];
	airBlips = [
		null,
		false, // Blip #1
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
		false, // Blip #6
	];
	colCommanderIndex = 0;
	lastTransportAlert = 0;

	allowWin = false;
	camPlayVideos([{video: "MB2_DII_MSG", type: CAMP_MSG}, {video: "MB2_DII_MSG2", type: MISS_MSG}]);

	queue("missionSetup", camSecondsToMilliseconds(60));
	setTimer("checkEnemyVtolArea", camSecondsToMilliseconds(1));

	// Darken the fog to 3/4 default brightness
	camSetFog(12, 12, 48);
	// Darken the lighting slightly and add a slight blue hue
	camSetSunIntensity(.4, .4, .45);
	// Move the sun strongly towards the east
	camSetSunPos(-525, -400, 350);
	// Constant rain
	camSetWeather(CAM_WEATHER_RAINSTORM);
}

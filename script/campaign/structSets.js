// Contains structure sets used by trucks for building/maintaining bases.
// The sets here are usually bases that aren't present on the map at the start of the level,
// but are built later on by trucks.

// Alpha 7
// NP north LZ
const camA7NPNorthLZStructs = [
	{stat: "GuardTower6H", x: 72, y: 7}, {stat: "WallTower03", x: 75, y: 8}, {stat: "WallTower03", x: 71, y: 12},
	{stat: "WallTower03", x: 75, y: 12}, 
];

// NP east LZ
const camA7NPEastLZStructs = [
	{stat: "WallTower03", x: 116, y: 37}, {stat: "WallTower03", x: 116, y: 41}, {stat: "Emplacement-MRL-pit", x: 120, y: 38},
];

// NP south LZ
const camA7NPSouthLZStructs = [
	{stat: "PillBox5", x: 118, y: 110}, {stat: "WallTower03", x: 118, y: 115}, {stat: "WallTower03", x: 122, y: 109},
	{stat: "WallTower03", x: 122, y: 114}, 
];

// Alpha 10
// NP north LZ
const camA10NPNorthLZStructs = [
	{stat: "GuardTower6H", x: 72, y: 7}, {stat: "WallTower06", x: 75, y: 8}, {stat: "WallTower06", x: 71, y: 12},
	{stat: "WallTower06", x: 75, y: 12}, 
];

// NP east LZ
const camA10NPEastLZStructs = [
	{stat: "WallTower06", x: 116, y: 37}, {stat: "WallTower06", x: 116, y: 41}, {stat: "Emplacement-MRL-pit", x: 120, y: 38},
];

// NP south LZ
const camA10NPSouthLZStructs = [
	{stat: "PillBox5", x: 118, y: 110}, {stat: "WallTower06", x: 118, y: 115}, {stat: "WallTower06", x: 122, y: 109},
	{stat: "WallTower06", x: 122, y: 114}, 
];

// NP south central LZ
const camA10NPCentralLZStructs = [
	{stat: "WallTower06", x: 74, y: 93}, {stat: "WallTower06", x: 78, y: 93}, {stat: "WallTower06", x: 74, y: 97},
	{stat: "WallTower06", x: 78, y: 97}, 
];

// NP west LZ
const camA10NPWestLZStructs = [
	{stat: "WallTower06", x: 15, y: 68}, {stat: "WallTower06", x: 11, y: 72}, {stat: "GuardTower6H", x: 11, y: 68},
	{stat: "Sys-SensoTower02", x: 15, y: 71}, {stat: "Emplacement-MortarPit02", x: 11, y: 69}, {stat: "Emplacement-MortarPit02", x: 12, y: 68}, 
];

// NP north west LZ
const camA10NPNorthWestLZStructs = [
	{stat: "WallTower06", x: 7, y: 14}, {stat: "WallTower06", x: 11, y: 14}, {stat: "WallTower06", x: 7, y: 18},
	{stat: "WallTower06", x: 11, y: 18}, 
];

// Beta 1
// Collective oil defenses
const camB1COOilStructs = [
	{stat: "A0ResourceExtractor", x: 114, y: 74}, {stat: "CO-PillBoxHPC", x: 113, y: 76}, {stat: "Emplacement-MRLHvy-pit", x: 115, y: 73},
];

// Beta E/11
// Southwest LZ
const camBetaCOLZStructs1 = [
	{stat: "Emplacement-Howitzer105", x: 28, y: 105}, {stat: "Emplacement-Howitzer105", x: 27, y: 107}, {stat: "Emplacement-Howitzer105", x: 28, y: 109},
	{stat: "CO-WallTower-HvCan", x: 30, y: 106}, {stat: "CO-WallTower-HvCan", x: 34, y: 106}, {stat: "CO-WallTower-HvCan", x: 34, y: 110},
	{stat: "CO-PillBoxHPC", x: 31, y: 104}, {stat: "CO-Pillbox-RotMG", x: 35, y: 105}, {stat: "AASite-QuadRotMg", x: 30, y: 110},
	{stat: "Sys-CO-CBTower", x: 29, y: 107},
];

// Northwest LZ
const camBetaCOLZStructs2 = [
	{stat: "Emplacement-Rocket06-IDF", x: 16, y: 12}, {stat: "Emplacement-Rocket06-IDF", x: 18, y: 11}, {stat: "Emplacement-Rocket06-IDF", x: 20, y: 12},
	{stat: "Emplacement-Rocket06-IDF", x: 18, y: 13}, {stat: "CO-WallTower-HvCan", x: 16, y: 15}, {stat: "CO-WallTower-HvCan", x: 20, y: 15},
	{stat: "CO-WallTower-HvCan", x: 16, y: 19}, {stat: "CO-WallTower-HvCan", x: 20, y: 19}, {stat: "AASite-QuadRotMg", x: 13, y: 18, rot: 1},
	{stat: "AASite-QuadRotMg", x: 13, y: 16, rot: 1}, {stat: "Sys-CO-CBTower", x: 13, y: 13},
];

// West LZ
const camBetaCOLZStructs3 = [
	{stat: "AASite-QuadRotMg", x: 16, y: 48, rot: 1}, {stat: "AASite-QuadRotMg", x: 19, y: 51, rot: 2}, {stat: "CO-WallTower-HvCan", x: 18, y: 46},
	{stat: "CO-WallTower-HvCan", x: 22, y: 46}, {stat: "CO-WallTower-HvCan", x: 22, y: 50}, {stat: "Sys-CO-SensorTower", x: 21, y: 45},
	{stat: "Emplacement-Ballista", x: 21, y: 52}, {stat: "Emplacement-Ballista", x: 23, y: 52}, {stat: "CO-Emplacement-RotMor", x: 24, y: 49},
	{stat: "CO-Emplacement-RotMor", x: 25, y: 50}, {stat: "CO-Tower-Projector", x: 25, y: 46},
];

// North LZ
const camBetaCOLZStructs4 = [
	{stat: "CO-Emplacement-RotMor", x: 61, y: 9}, {stat: "CO-Emplacement-RotMor", x: 63, y: 9}, {stat: "Sys-CO-SensorTower", x: 63, y: 11},
	{stat: "CO-Pillbox-RotMG", x: 66, y: 6}, {stat: "CO-Pillbox-RotMG", x: 69, y: 9}, {stat: "CO-Pillbox-RotMG", x: 66, y: 12},
	{stat: "AASite-QuadRotMg", x: 62, y: 7}, {stat: "CO-Tower-HvATRkt", x: 64, y: 11}, {stat: "CO-Tower-HvATRkt", x: 68, y: 11},
	{stat: "CO-WallTower-HvCan", x: 64, y: 7}, {stat: "CO-WallTower-HvCan", x: 68, y: 7},
];

// Northeast LZ
const camBetaCOLZStructs5 = [
	{stat: "AASite-QuadRotMg", x: 99, y: 18}, {stat: "AASite-QuadRotMg", x: 103, y: 17}, {stat: "AASite-QuadRotMg", x: 105, y: 22},
	{stat: "CO-WallTower-HvCan", x: 100, y: 19}, {stat: "CO-WallTower-HvCan", x: 104, y: 19}, {stat: "CO-Tower-Projector", x: 99, y: 19},
	{stat: "CO-Tower-HvATRkt", x: 100, y: 23}, {stat: "CO-Tower-HvATRkt", x: 104, y: 23}, {stat: "Sys-CO-SensorTower", x: 105, y: 21},
	{stat: "CO-Pillbox-RotMG", x: 99, y: 24}, {stat: "CO-Pillbox-RotMG", x: 104, y: 24},
];

// Central LZ
const camBetaCOLZStructs6 = [
	{stat: "CO-WallTower-HvCan", x: 59, y: 40}, {stat: "CO-WallTower-HvCan", x: 63, y: 40}, {stat: "CO-WallTower-HvCan", x: 49, y: 44},
	{stat: "CO-Emplacement-RotMor", x: 56, y: 38}, {stat: "CO-Emplacement-RotMor", x: 58, y: 39}, {stat: "CO-Emplacement-RotMor", x: 58, y: 41},
	{stat: "CO-Tower-HvATRkt", x: 63, y: 44}, {stat: "CO-Pillbox-RotMG", x: 65, y: 42}, {stat: "CO-Pillbox-RotMG", x: 62, y: 46},
	{stat: "Sys-CO-SensorTower", x: 57, y: 44}, {stat: "Emplacement-Howitzer105", x: 56, y: 40}, {stat: "Emplacement-Howitzer105", x: 56, y: 42},
	{stat: "Sys-CO-CBTower", x: 58, y: 38}, {stat: "AASite-QuadRotMg", x: 60, y: 38}, {stat: "AASite-QuadRotMg", x: 62, y: 38},
];

// Southeast LZ
const camBetaCOLZStructs7 = [
	{stat: "CO-WallTower-HvCan", x: 116, y: 115}, {stat: "CO-WallTower-HvCan", x: 120, y: 115}, {stat: "CO-WallTower-HvCan", x: 116, y: 119},
	{stat: "CO-WallTower-HvCan", x: 120, y: 119}, {stat: "Emplacement-Ballista", x: 122, y: 114}, {stat: "Emplacement-Ballista", x: 124, y: 115},
	{stat: "Emplacement-Ballista", x: 122, y: 116}, {stat: "Emplacement-Howitzer105", x: 122, y: 118}, {stat: "Emplacement-Howitzer105", x: 124, y: 119},
	{stat: "AASite-QuadRotMg", x: 124, y: 113}, {stat: "AASite-QuadRotMg", x: 113, y: 119}, {stat: "CO-Pillbox-RotMG", x: 114, y: 116},
	{stat: "CO-Pillbox-RotMG", x: 117, y: 113}, {stat: "CO-Tower-HvATRkt", x: 114, y: 118}, {stat: "Sys-CO-SensorTower", x: 119, y: 114},
	{stat: "Sys-CO-CBTower", x: 122, y: 120}, {stat: "Emplacement-Ballista", x: 124, y: 117},
];

// Gamma 5
// East LZ
const camGamma5NXLZStructsE = [
	{stat: "PillBoxTK", x: 46, y: 49}, {stat: "PillBoxTK", x: 46, y: 53}, {stat: "Sys-SensoTower02", x: 51, y: 54},
	{stat: "WallTower04", x: 50, y: 49}, {stat: "WallTower04", x: 50, y: 53}, {stat: "Emplacement-RotMor", x: 54, y: 49},
	{stat: "Emplacement-RotMor", x: 54, y: 51}, {stat: "Emplacement-RotMor", x: 52, y: 50}, {stat: "Emplacement-RotMor", x: 52, y: 52},
	{stat: "AASite-QuadRotMg", x: 52, y: 48}, {stat: "AASite-QuadRotMg", x: 54, y: 53, rot: 3},
];

// Northeast LZ
const camGamma5NXLZStructsNE = [
	{stat: "WallTower04", x: 51, y: 7}, {stat: "WallTower04", x: 55, y: 7}, {stat: "WallTower04", x: 55, y: 11},
	{stat: "Emplacement-Howitzer150", x: 47, y: 8}, {stat: "Emplacement-Howitzer150", x: 49, y: 8}, {stat: "Emplacement-Howitzer150", x: 49, y: 6},
	{stat: "AASite-QuadRotMg", x: 48, y: 10}, {stat: "AASite-QuadRotMg", x: 53, y: 5}, {stat: "AASite-QuadRotMg", x: 58, y: 7},
	{stat: "Pillbox-RotMG", x: 47, y: 11}, {stat: "Pillbox-RotMG", x: 53, y: 13}, {stat: "PillBoxTK", x: 50, y: 12},
	{stat: "Sys-CBTower", x: 48, y: 7}, {stat: "Sys-SensoTower02", x: 51, y: 11},
];

// Northwest LZ
const camGamma5NXLZStructsNW = [
	{stat: "AASite-QuadRotMg", x: 6, y: 53, rot: 3}, {stat: "AASite-QuadRotMg", x: 8, y: 49, rot: 2}, {stat: "AASite-QuadRotMg", x: 10, y: 53, rot: 1},
	{stat: "Emplacement-RotMor", x: 3, y: 51}, {stat: "Emplacement-RotMor", x: 4, y: 53}, {stat: "Emplacement-RotMor", x: 4, y: 55},
	{stat: "Tower-Projector", x: 4, y: 48}, {stat: "Tower-Projector", x: 10, y: 47}, {stat: "PillBoxTK", x: 8, y: 56},
	{stat: "WallTower04", x: 6, y: 51}, {stat: "WallTower04", x: 10, y: 51}, {stat: "WallTower04", x: 6, y: 55},
	{stat: "WallTower04", x: 10, y: 55}, {stat: "Sys-SensoTower02", x: 11, y: 50},
];

// West LZ
const camGamma5NXLZStructsW = [
	{stat: "AASite-QuadRotMg", x: 9, y: 87}, {stat: "AASite-QuadRotMg", x: 9, y: 83}, {stat: "AASite-QuadRotMg", x: 12, y: 82, rot: 1},
	{stat: "Pillbox-RotMG", x: 10, y: 90}, {stat: "Pillbox-RotMG", x: 16, y: 90}, {stat: "Pillbox-RotMG", x: 16, y: 84},
	{stat: "WallTower04", x: 11, y: 85}, {stat: "WallTower04", x: 11, y: 89}, {stat: "WallTower04", x: 15, y: 85},
	{stat: "WallTower04", x: 15, y: 89}, {stat: "Sys-SensoTower02", x: 16, y: 87},
];

// South LZ
const camGamma5NXLZStructsS = [
	{stat: "WallTower04", x: 30, y: 112}, {stat: "WallTower04", x: 30, y: 116}, {stat: "WallTower04", x: 34, y: 116},
	{stat: "Pillbox-RotMG", x: 30, y: 111}, {stat: "Pillbox-RotMG", x: 28, y: 116}, {stat: "Pillbox-RotMG", x: 30, y: 118},
	{stat: "AASite-QuadRotMg", x: 32, y: 112}, {stat: "AASite-QuadRotMg", x: 29, y: 114, rot: 3}, {stat: "PillBoxHPC", x: 35, y: 116},
	{stat: "Sys-SensoTower02", x: 34, y: 113}, {stat: "PillBoxTK", x: 34, y: 114},
];

// Gamma 8
// East LZ
const camGamma8NXLZStructsE = [
	{stat: "A0RepairCentre3", x: 53, y: 142}, {stat: "A0RepairCentre3", x: 55, y: 142}, {stat: "A0RepairCentre3", x: 57, y: 142},
	{stat: "AASite-QuadRotMg", x: 57, y: 144}, {stat: "AASite-QuadRotMg", x: 53, y: 144}, {stat: "AASite-QuadRotMg", x: 51, y: 146, rot: 3},
	{stat: "Pillbox-RotMG", x: 58, y: 149}, {stat: "Pillbox-RotMG", x: 55, y: 150}, {stat: "Pillbox-RotMG", x: 49, y: 150},
	{stat: "Pillbox-RotMG", x: 50, y: 147}, {stat: "Pillbox-RotMG", x: 49, y: 144}, {stat: "Tower-Projector", x: 50, y: 149},
	{stat: "WallTower04", x: 53, y: 148}, {stat: "WallTower04", x: 57, y: 148},
];

// West LZ
const camGamma8NXLZStructsW = [
	{stat: "Pillbox-RotMG", x: 15, y: 160}, {stat: "Pillbox-RotMG", x: 18, y: 161}, {stat: "Pillbox-RotMG", x: 21, y: 160},
	{stat: "AASite-QuadRotMg", x: 15, y: 151}, {stat: "AASite-QuadRotMg", x: 21, y: 151}, {stat: "AASite-QuadRotMg", x: 21, y: 154},
	{stat: "WallTower04", x: 16, y: 155}, {stat: "WallTower04", x: 20, y: 155}, {stat: "WallTower04", x: 16, y: 159},
	{stat: "WallTower04", x: 20, y: 159}, {stat: "Sys-SensoTower02", x: 18, y: 160}, {stat: "Sys-CBTower", x: 15, y: 154},
	{stat: "Emplacement-RotHow", x: 16, y: 153}, {stat: "Emplacement-RotHow", x: 18, y: 153}, {stat: "Emplacement-RotHow", x: 20, y: 153},
	{stat: "Emplacement-RotHow", x: 17, y: 151}, {stat: "Emplacement-RotHow", x: 19, y: 151},
];
//Contains the campaign transition technology definitions.

//Basic base structures.
const mis_structsAlpha = [
	"A0CommandCentre",
	"A0PowerGenerator",
	"A0ResourceExtractor",
	"A0ResearchFacility",
	"A0LightFactory",
];

//This array should give a player all the research from Alpha.
const mis_alphaResearchNew = [
	// Starting tech
	"R-Wpn-MG1Mk1", "R-Vehicle-Body01", "R-Sys-Spade1Mk1", "R-Vehicle-Prop-Wheels", 

	// 1
	"R-Wpn-MG-Damage01", // Artifact
	"R-Wpn-MG-Damage02",
	"R-Sys-Engineering01", // Artifact
	"R-Sys-MobileRepairTurret01", "R-Defense-TankTrap01",
	"R-Wpn-Flamer01Mk1", // Artifact
	"R-Wpn-Flamer-Damage01", "R-Defense-Flamer",

	// 2
	"R-Wpn-Flamer-ROF01", // Artifact
	"R-Wpn-Flamer-Damage02",
	"R-Wpn-MG2Mk1", // Artifact
	"R-Wpn-MG-Damage03", "R-Defense-Tower02",
	"R-Sys-Sensor-Turret01", // Artifact
	"R-Sys-Sensor-Tower01",
	"R-Struc-PowerModuleMk1", // Artifact

	// 3
	"R-Wpn-Cannon1Mk1", // Artifact
	"R-Wpn-Cannon-Damage01", "R-Defense-Cannon",

	// 4
	"R-Wpn-Mortar01Lt", // Artifact
	"R-Wpn-Mortar-Damage01",
	"R-Vehicle-Prop-Halftracks", // Artifact

	// 5
	"R-Wpn-MG3Mk1", // Artifact
	"R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01", "R-Defense-Tower01",
	"R-Defense-HardcreteWall", // Artifact
	"R-Defense-HardcreteGate", "R-Defense-MortarPit", "R-Defense-WallTower03",
	"R-Defense-Pillbox01", "R-Defense-Pillbox04", "R-Defense-Pillbox05",
	"R-Defense-WallTower01", "R-Defense-WallTower02", "R-Defense-WallUpgrade01",
	"R-Defense-WallUpgrade02", "R-Struc-Materials01", "R-Struc-Materials02", 
	"R-Struc-CommandRelay", // Artifact
	"R-Comp-CommandTurret01",
	"R-Struc-RepairFacility", // Artifact
	"R-Vehicle-Body04", // Artifact
	"R-Vehicle-Metals01",
	"R-Wpn-Rocket05-MiniPod", // Artifact
	"R-Defense-Tower06", "R-Wpn-Rocket-Damage01",

	// 6
	"R-Struc-Research-Module", // Artifact
	"R-Wpn-Flamer-Damage03", "R-Wpn-Rocket-Accuracy01",
	"R-Wpn-Rocket02-MRL", // Artifact
	"R-Defense-MRL", "R-Wpn-Rocket-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Rocket-Damage02", 
	"R-Struc-Factory-Module", // Artifact
	"R-Vehicle-Body05", "R-Vehicle-Engine01",
	"R-Wpn-Cannon2Mk1", // Artifact
	"R-Wpn-Cannon-Damage02", "R-Wpn-Mortar-Damage02",

	// 7

	// 8
	"R-Wpn-Mortar02Hvy", // Artifact
	"R-Wpn-Mortar-Damage03", "R-Wpn-Cannon-Damage03", "R-Defense-HvyMor",
	"R-Vehicle-Prop-Tracks", // Artifact
	"R-Vehicle-Metals02",
	"R-Wpn-Rocket01-LtAT", // Artifact
	"R-Defense-WallTower06", "R-Defense-LancerTower", "R-Defense-Pillbox06",
	"R-Wpn-Rocket-Damage03", "R-Wpn-Rocket-Accuracy02",
	"R-Vehicle-Body08", // Artifact
	"R-Vehicle-Engine02",

	// 9
	"R-Comp-SynapticLink", // Artifact
	"R-Struc-Research-Upgrade01", "R-Wpn-Cannon-Accuracy01",
	"R-Wpn-Mortar-Acc01", 
	"R-Struc-Factory-Cyborg", "R-Cyborg-Wpn-HvyMG",
	"R-Cyborg-Wpn-Cannon", "R-Cyborg-Wpn-Flamer", "R-Cyborg-Wpn-Rocket",
	"R-Cyb-Sys-Repair", "R-Cyb-Sys-Construct", "R-Cyb-Wpn-Grenade",
	"R-Cyb-Wpn-MRL", "R-Cyborg-Metals01", "R-Cyborg-Metals02",
	"R-Struc-Factory-Upgrade01", // Artifact
	"R-Struc-RprFac-Upgrade01",
	"R-Defense-WallUpgrade03", // Artifact
	"R-Struc-Materials03",

	// 10
	"R-Wpn-Rocket03-HvAT", // Artifact
	"R-Wpn-Rocket-Damage04",

	// 11
	"R-Vehicle-Metals03", // Artifact
	"R-Cyborg-Metals03", "R-Cyborg-Hvywpn-Mcannon", "R-Cyb-Hvywpn-Grenade",
	"R-Vehicle-Body11",

	//12
	"R-Vehicle-Prop-Hover", // Artifact
	"R-Vehicle-Engine03",
	"R-Vehicle-Body12", // Artifact

	///////

	// END AT:
	// "R-Wpn-MG-Damage04", "R-Wpn-MG-ROF01",
	// "R-Wpn-Flamer-Damage03", "R-Wpn-Flamer-ROF01",
	// "R-Wpn-Cannon-Damage03", "R-Wpn-Cannon-ROF01", "R-Wpn-Cannon-Accuracy01",
	// "R-Wpn-Mortar-Damage03", "R-Wpn-Mortar-ROF01", "R-Wpn-Mortar-Acc01", 
	// "R-Wpn-Rocket-Damage04", "R-Wpn-Rocket-ROF01", "R-Wpn-Rocket-Accuracy02",
	// "R-Defense-WallUpgrade03", "R-Struc-Materials03",
	// "R-Sys-Engineering01",
	// "R-Struc-Factory-Upgrade01", "R-Struc-RprFac-Upgrade01",
	// "R-Vehicle-Metals03", "R-Cyborg-Metals03",
	// "R-Vehicle-Engine03",
	// "R-Struc-Research-Upgrade01",
];

//BETA 2-A bonus research
const mis_playerResBeta = [
	"R-Wpn-AAGun03",
	"R-Defense-AASite-QuadMg1",
];

//This array should give a player all the research from Beta.
const mis_betaResearchNew = [
	// 1
	"R-Sys-Engineering02", // Artifact
	"R-Defense-WallUpgrade04", "R-Defense-WallUpgrade05", "R-Struc-Materials04",
	"R-Struc-Materials05",
	"R-Wpn-MG-Damage05", // Artifact
	"R-Sys-CBSensor-Turret01", // Artifact
	"R-Sys-CBSensor-Tower01", 
	"R-Wpn-Rocket02-MRLHvy", // Artifact
	"R-Defense-MRLHvy", "R-Cyb-Hvywpn-HRA", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Wpn-Cannon-Damage04", // Granted (available to research at the start of the level)
	"R-Wpn-Mortar-Damage04", // Granted
	"R-Wpn-AAGun-Damage01", // Granted
	"R-Wpn-AAGun-ROF01", // Granted
	"R-Wpn-Rocket-Accuracy03", // Granted

	// 2

	// 3
	"R-Vehicle-Body06", // Artifact
	"R-Vehicle-Metals04", "R-Cyborg-Metals04", "R-Vehicle-Armor-Heat01",
	"R-Cyborg-Armor-Heat01",
	"R-Wpn-Flame2", // Artifact
	"R-Defense-HvyFlamer", "R-Cyb-Wpn-Thermite", "R-Wpn-Flamer-Damage04",
	"R-Struc-Factory-Upgrade02", // Artifact
	"R-Struc-RprFac-Upgrade02", "R-Wpn-MG-ROF02", "R-Wpn-MG-Damage06",
	"R-Wpn-AAGun-ROF02", 
	"R-Wpn-Cannon4AMk1", // Artifact
	"R-Defense-Emplacement-HPVcannon", "R-Defense-WallTower-HPVcannon", "R-Defense-HVCTower", 
	"R-Cyborg-Hvywpn-HPV", "R-Wpn-Cannon-Damage05", "R-Wpn-Cannon-Accuracy02",
	"R-Wpn-Mortar-Damage05",

	// 4
	"R-Wpn-Rocket08-Ballista", // Artifact
	"R-Defense-Ballista", "R-Wpn-Rocket-Accuracy04", "R-Wpn-AAGun-Accuracy01",
	"R-Wpn-Mortar-Acc02",

	// 5
	"R-Vehicle-Body02", // Artifact
	"R-Vehicle-Metals05", "R-Cyborg-Metals05", "R-Vehicle-Armor-Heat02",
	"R-Cyborg-Armor-Heat02",
	"R-Vehicle-Prop-VTOL", // Artifact
	"R-Struc-VTOLFactory", "R-Struc-VTOLPad", "R-Sys-VTOLStrike-Turret01",
	"R-Sys-VTOLStrike-Tower01", "R-Sys-VTOLCBS-Turret01", "R-Sys-VTOLCBS-Tower01",
	"R-Struc-VTOLPad-Upgrade01", "R-Struc-VTOLPad-Upgrade02", "R-Wpn-Bomb01",
	"R-Wpn-Bomb03", "R-Vehicle-Engine04",
	"R-Wpn-AAGun02", // Artifact
	"R-Defense-AASite-QuadBof", "R-Wpn-AAGun-Damage03",
	"R-Wpn-Rocket06-IDF", // Artifact
	"R-Defense-IDFRocket", "R-Wpn-Rocket-Damage05",
	"R-Wpn-Flamer-ROF02", // Artifact
	"R-Wpn-Flamer-Damage05",
	"R-Wpn-Cannon5", // Artifact
	"R-Defense-Wall-VulcanCan", "R-Cyborg-Hvywpn-Acannon", "R-Wpn-Cannon-ROF03",
	"R-Wpn-Mortar3", // Artifact
	"R-Defense-RotMor", "R-Wpn-Mortar-ROF03",

	// 6
	"R-Struc-Power-Upgrade01", // Artifact
	"R-Vehicle-Engine05",
	"R-Wpn-MG4", // Artifact
	"R-Cyborg-Wpn-RotMG", "R-Defense-RotMG", "R-Wpn-MG-Damage07",
	"R-Defense-Wall-RotMg", "R-Defense-Pillbox-RotMG",
	"R-Wpn-Rocket07-Tank-Killer", // Artifact
	"R-Cyborg-Hvywpn-TK", "R-Defense-HvyA-Trocket", "R-Defense-WallTower-HvyA-Trocket",
	"R-Wpn-Rocket-Damage06",
	"R-Sys-Sensor-Upgrade01", // Artifact

	// 7
	"R-Wpn-HowitzerMk1", // Artifact
	"R-Defense-Howitzer", "R-Wpn-Howitzer-Damage01", "R-Wpn-Howitzer-ROF01",
	"R-Wpn-Howitzer-Accuracy01", "R-Wpn-Mortar-Damage06",
	"R-Wpn-Bomb-Damage01", // Artifact
	"R-Struc-Research-Upgrade02", // Artifact
	"R-Wpn-Howitzer-Accuracy02", "R-Wpn-AAGun-Accuracy02",  "R-Wpn-Mortar-Acc03",
	"R-Wpn-Flamer-Damage06",
	"R-Wpn-Cannon3Mk1", // Artifact
	"R-Defense-WallTower04", "R-Wpn-Cannon-Damage06",

	// 8
	"R-Wpn-Bomb02", // Artifact
	"R-Wpn-Bomb04",
	"R-Struc-Factory-Upgrade03", // Artifact
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03", "R-Wpn-MG-ROF03", 
	"R-Wpn-MG-Damage08",
	"R-Defense-WallUpgrade06", // Artifact
	"R-Struc-Materials06",
	"R-Wpn-Cannon-Damage07", // Artifact
	"R-Wpn-Howitzer-Damage02",
	"R-Wpn-AAGun04", // Artifact
	"R-Defense-AASite-QuadRotMg", "R-Wpn-AAGun-ROF03",

	// E


	// 9
	"R-Wpn-Rocket-Damage07", // Artifact
	"R-Wpn-Rocket-ROF03",
	"R-Wpn-Cannon-ROF04", // Artifact
	"R-Wpn-Howitzer-ROF02", "R-Wpn-Mortar-ROF04", "R-Wpn-Flamer-ROF03",
	"R-Vehicle-Body09", // Artifact
	"R-Vehicle-Metals06", "R-Cyborg-Metals06", "R-Vehicle-Engine06",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",

	// 10
	"R-Wpn-HvyHowitzer", // Artifact
	"R-Defense-HvyHowitzer", "R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF03",
	"R-Wpn-Missile-LtSAM", // Artifact
	"R-Defense-SamSite1", "R-Wpn-Missile-Damage01",

	// 11


	// END AT:
	// "R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	// "R-Wpn-Flamer-Damage06", "R-Wpn-Flamer-ROF03",
	// "R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	// "R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	// "R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	// "R-Wpn-AAGun-Damage03", "R-Wpn-AAGun-ROF03", "R-Wpn-AAGun-Accuracy02",
	// "R-Wpn-Howitzer-Damage03", "R-Wpn-Howitzer-ROF03", "R-Wpn-Howitzer-Accuracy02",
	// "R-Wpn-Bomb-Damage01",
	// "R-Wpn-Missile-Damage01",
	// "R-Defense-WallUpgrade06", "R-Struc-Materials06",
	// "R-Sys-Engineering02", "R-Sys-Sensor-Upgrade01",
	// "R-Struc-Factory-Upgrade03", "R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	// "R-Vehicle-Metals06", "R-Cyborg-Metals06",
	// "R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",
	// "R-Vehicle-Engine06",
	// "R-Struc-Research-Upgrade02",
];

//This is used for giving allies in Gamma technology (3-b/3-2/3-c)
const mis_gammaAllyRes = mis_alphaResearchNew.concat(mis_playerResBeta).concat(mis_betaResearchNew);

const mis_gammaResearchNew = [
	//1
	"R-Struc-Power-Upgrade02", // Artifact
	"R-Sys-Engineering03", // Artifact
	"R-Defense-WallUpgrade07", "R-Struc-Materials07",
	"R-Wpn-Missile-Accuracy01", // Artifact
	"R-Wpn-AAGun-Accuracy03", "R-Wpn-Howitzer-Accuracy03", "R-Wpn-Howitzer-Damage04",
	"R-Wpn-AAGun-Damage04", "R-Wpn-AAGun-ROF04",
	"R-Wpn-RailGun01", // Artifact
	"R-Defense-Rail1", "R-Defense-GuardTower-Rail1", "R-Cyborg-Wpn-Rail1",
	"R-Wpn-Rail-Damage01", "R-Wpn-Rail-Accuracy01", "R-Wpn-Rail-ROF01",

	//2
	"R-Wpn-Missile2A-T", // Artifact
	"R-Defense-GuardTower-ATMiss", "R-Defense-WallTower-A-Tmiss",
	"R-Cyborg-Hvywpn-A-T", "R-Defense-ATMiss", "R-Wpn-Missile-Damage02", "R-Wpn-Missile-ROF01",
	"R-Vehicle-Body03", // Artifact
	"R-Vehicle-Metals07", "R-Cyborg-Metals07", "R-Vehicle-Engine07",
	"R-Vehicle-Armor-Heat04", "R-Cyborg-Armor-Heat04",
	"R-Wpn-Flamer-Damage07", // Artifact

	// 3
	"R-Wpn-Laser01", // Artifact
	"R-Defense-BeamLasTower", "R-Defense-PrisLas", "R-Defense-WallTower-BeamLas",
	"R-Cyborg-Wpn-Laser1", "R-Wpn-Energy-Accuracy01", "R-Wpn-Energy-Damage01",
	"R-Wpn-Energy-ROF01",
	"R-Wpn-AAGun-Damage05", // Artifact
	"R-Wpn-AAGun-ROF05",
	"R-Wpn-Howitzer-Damage05", // Artifact
	"R-Wpn-Bomb-Damage02",
	"R-Defense-WallUpgrade08", // Artifact
	"R-Struc-Materials08",
	"R-Wpn-MdArtMissile", // Artifact
	"R-Defense-MdArtMissile", "R-Cyb-Hvywpn-Seraph", "R-Wpn-Missile-ROF02", 

	// 4
	"R-Wpn-Flamer-Plasmite", // Artifact
	"R-Wpn-Flamer-Damage08",

	// 5
	"R-Sys-Resistance-Upgrade01", // Granted
	"R-Sys-Resistance-Upgrade02", "R-Sys-Resistance-Upgrade03",

	// 6
	"R-Vehicle-Body07", // Artifact
	"R-Vehicle-Metals08", "R-Vehicle-Armor-Heat05", "R-Vehicle-Engine08",
	"R-Cyborg-Metals08", "R-Cyborg-Armor-Heat05",
	"R-Wpn-RailGun02", // Artifact
	"R-Cyborg-Hvywpn-RailGunner", "R-Defense-Rail2", "R-Defense-WallTower-Rail2",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF02", 
	"R-Wpn-MissileBB2", // Artifact
	"R-Wpn-Missile-Damage03", "R-Wpn-Missile-Accuracy02",
	"R-Wpn-AAGun-Damage06", // Artifact
	"R-Wpn-AAGun-ROF06",
	"R-Wpn-Howitzer03-Rot", // Artifact
	"R-Defense-RotHow", "R-Wpn-Howitzer-Damage06", "R-Wpn-Howitzer-ROF04",
	"R-Struc-Research-Upgrade03", // Artifact
	"R-Wpn-Energy-Damage02", "R-Wpn-Energy-ROF02",
	"R-Struc-Factory-Upgrade04",

	// 7
	"R-Wpn-Laser02", // Artifact
	"R-Defense-PulseLasTower", "R-Defense-PulseLas", "R-Defense-WallTower-PulseLas",
	"R-Wpn-Energy-Damage03", "R-Wpn-Energy-ROF03", "R-Cyborg-Hvywpn-PulseLsr",
	"R-Wpn-Flamer-Damage09", "R-Wpn-Rail-ROF03",
	"R-Wpn-Missile-HvSAM", // Artifact
	"R-Defense-SamSite2",
	"R-Defense-WallUpgrade09", // Artifact
	"R-Struc-Materials09",
	"R-Wpn-Bomb-Damage03", // Artifact
	
	"R-Wpn-HvArtMissile", // Artifact
	"R-Defense-HvyArtMissile", "R-Wpn-Missile-ROF03",

	// 8
	"R-Sys-Resistance", // Granted
	"R-Comp-MissileCodes01", "R-Comp-MissileCodes02", "R-Comp-MissileCodes03",

	// 9
	"R-Wpn-RailGun03", // Artifact
	"R-Wpn-Rail-Damage03", "R-Defense-WallTower-Rail3",
	"R-Vehicle-Body10", // Artifact
	"R-Vehicle-Metals09", "R-Vehicle-Armor-Heat06", "R-Vehicle-Engine09",
	"R-Cyborg-Metals09", "R-Cyborg-Armor-Heat06",

	// END AT:
	// "R-Wpn-MG-Damage08", "R-Wpn-MG-ROF03",
	// "R-Wpn-Flamer-Damage09", "R-Wpn-Flamer-ROF03",
	// "R-Wpn-Cannon-Damage07", "R-Wpn-Cannon-ROF04", "R-Wpn-Cannon-Accuracy02",
	// "R-Wpn-Mortar-Damage06", "R-Wpn-Mortar-ROF04", "R-Wpn-Mortar-Acc03", 
	// "R-Wpn-Rocket-Damage07", "R-Wpn-Rocket-ROF03", "R-Wpn-Rocket-Accuracy04",
	// "R-Wpn-AAGun-Damage06", "R-Wpn-AAGun-ROF06", "R-Wpn-AAGun-Accuracy03",
	// "R-Wpn-Howitzer-Damage06", "R-Wpn-Howitzer-ROF04", "R-Wpn-Howitzer-Accuracy03",
	// "R-Wpn-Bomb-Damage03",
	// "R-Wpn-Missile-Damage03", "R-Wpn-Missile-ROF03", "R-Wpn-Missile-Accuracy02",
	// "R-Wpn-Rail-Damage03", "R-Wpn-Rail-ROF03", "R-Wpn-Rail-Accuracy01",
	// "R-Wpn-Energy-Damage03", "R-Wpn-Energy-ROF03", "R-Wpn-Energy-Accuracy01",
	// "R-Defense-WallUpgrade09", "R-Struc-Materials09",
	// "R-Sys-Engineering03", "R-Sys-Sensor-Upgrade01",
	// "R-Struc-Factory-Upgrade04", "R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	// "R-Vehicle-Metals09", "R-Cyborg-Metals09",
	// "R-Vehicle-Armor-Heat06", "R-Cyborg-Armor-Heat06",
	// "R-Vehicle-Engine09",
	// "R-Struc-Research-Upgrade03",
];

//...

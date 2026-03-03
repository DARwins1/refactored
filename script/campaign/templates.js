var cTempl = {
////////////////////////////////////////////////////////////////////////////////

// Scavenger Units:
bloke: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" }, // Bloke
kevbloke: { body: "B1BaBaPerson01-Kev", prop: "BaBaLegs", weap: "BabaMG" }, // Armored Bloke
lance: { body: "BaBaLanceBody", prop: "BaBaLegs", weap: "BabaLance" }, // Rocket Bloke
kevlance: { body: "BaBaLanceBody-Kev", prop: "BaBaLegs", weap: "BabaLance" }, // Armored Rocket Bloke
trike: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" }, // Trike
buggy: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" }, // Buggy
bjeep: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" }, // Jeep
rbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaRocket" }, // Rocket Jeep
rbuggy: { body: "B3bodyRKbuggy01", prop: "BaBaProp", weap: "BabaRocket" }, // Rocket Buggy
firetruck: { body: "FireBody", prop: "BaBaProp", weap: "RustFlame1Mk1" }, // Flamer Firetruck
buscan: { body: "BusBody", prop: "BaBaProp", weap: "RustCannon1Mk1" }, // Cannon Bus
minitruck: { body: "FireBody", prop: "BaBaProp", weap: "RustRocket-Pod" }, // Mini-Rocket Pod Firetruck
civ: { body: "CivilianBody", prop: "BaBaLegs", weap: "BabaMG" }, // Civilian

// Cyborgs:
cybrp: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRepair" }, // Mechanic Cyborg
cyben: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgSpade" }, // Combat Engineer Cyborg
cybmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingun" }, // Machinegunner Cyborg
cybhg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgHeavyChaingun" }, // Heavy Machinegunner Cyborg
cybag: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRotMG" }, // Assault Gunner Cyborg
cybfl: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgFlamer01" }, // Flamer Cyborg
cybth: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Thermite" }, // Thermite Flamer Cyborg
cybgr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Grenade" }, // Grenadier Cyborg
scygr: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Grenade" }, // Super Heavy Grenadier Cyborg
cybla: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRocket" }, // Lancer Cyborg
scytk: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-TK" }, // Super Tank-Killer Cyborg
cybca: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" }, // Heavy Gunner Cyborg
scymc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Mcannon" }, // Super Heavy-Gunner Cyborg
scyhc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HPV" }, // Super HPC Cyborg
scyac: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Acannon" }, // Super Auto-Cannon Cyborg
cybls: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Laser" }, // Flashlight Gunner Cyborg
nxcyrail: { body: "CybNXRail1Jmp", prop: "CyborgLegs02", weap: "NX-Cyb-Rail1" }, // NEXUS Needle Cyborg
nxcyscou: { body: "CybNXMissJmp", prop: "CyborgLegs02", weap: "NX-CyborgMiss" }, // NEXUS Scourge Cyborg
nxcylas: { body: "CybNXPulseLasJmp", prop: "CyborgLegs02", weap: "NX-CyborgPulseLas" }, // NEXUS Flashlight Cyborg

// New Paradigm Units:
npmtruckht: { body: "Body8MBT", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Scorpion Halftracks

nplpodw: { body: "Body4ABT", prop: "wheeled01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Bug Wheels
nplatht: { body: "Body4ABT", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Bug Halftracks
npmath: { body: "Body8MBT", prop: "hover01", weap: "Rocket-LtA-T" }, // Lancer Scorpion Hover

nplhmght: { body: "Body4ABT", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Bug Halftracks
npmhmgh: { body: "Body8MBT", prop: "hover01", weap: "MG3Mk1" }, // Heavy Machinegun Scorpion Hover

nplflamht: { body: "Body4ABT", prop: "HalfTrack", weap: "Flame1Mk1" }, // Flamer Bug Halftracks

nplsensw: { body: "Body4ABT", prop: "wheeled01", weap: "SensorTurret1Mk1" }, // Sensor Bug Wheels
npmsensht: { body: "Body8MBT", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Scorpion Halftracks

npmlcht: { body: "Body8MBT", prop: "HalfTrack", weap: "Cannon1Mk1" }, // Light Cannon Scorpion Halftracks
npmmcht: { body: "Body8MBT", prop: "HalfTrack", weap: "Cannon2A-TMk1" }, // Medium Cannon Scorpion Halftracks
npmmct: { body: "Body8MBT", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Scorpion Tracks
nphmct: { body: "Body12SUP", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Mantis Tracks
nphhct: { body: "Body12SUP", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Mantis Tracks
nphhch: { body: "Body12SUP", prop: "hover01", weap: "Cannon375mmMk1" }, // Heaavy Cannon Mantis Hover

npmmorht: { body: "Body8MBT", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Mortar Scorpion Halftracks
npmmorbht: { body: "Body8MBT", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Scorpion Halftracks

nplmraht: { body: "Body4ABT", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Bug Halftracks
npmmrah: { body: "Body8MBT", prop: "hover01", weap: "Rocket-MRL" }, // Mini-Rocket Array Scorpion Hover

npmbbht: { body: "Body8MBT", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Scorpion Halftracks

// Collective Units:

// CAM_2_A
commgt: { body: "Body6SUPP", prop: "tracked01", weap: "MG3Mk1" },
comsens: { body: "Body6SUPP", prop: "tracked01", weap: "SensorTurret1Mk1" },
cohct: { body: "Body9REC", prop: "tracked01", weap: "Cannon375mmMk1" },
comct: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon2A-TMk1" },
comorb: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar2Mk1" },
colcbv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" },
colatv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-LtA-T" },
copodt: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-Pod" }, // Light Mini-Rocket Pod Tank
coscymc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Mcannon" }, // Super Heavy-Gunner
prtruck: { body: "Body5REC", prop: "tracked01", weap: "Spade1Mk1" },
prhhpvt: { body: "Body11ABT", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // HPV cannon tank (Swapped with Heavy Cannon)
prltat: { body: "Body5REC", prop: "tracked01", weap: "Rocket-LtA-T" },
prrept: { body: "Body5REC", prop: "tracked01", weap: "LightRepair1" }, 

// CAM_2_B
cotruck: { body: "Body6SUPP", prop: "tracked01", weap: "Spade1Mk1" },
comatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-LtA-T" },
comit: { body: "Body6SUPP", prop: "tracked01", weap: "Flame2" },
comrept: { body: "Body6SUPP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Panther Tracks
comorbt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar2Mk1" },
cocybtf: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Thermite" }, // Thermite Flamer Cyborg
comrlt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-MRL" }, // Medium Mini-Rocket Array Tank

// CAM_2_2
comtath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-LtA-T" },
comtathh: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-LtA-T" },
comih: { body: "Body6SUPP", prop: "hover01", weap: "Flame2" },

// CAM_2_C
commorv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" },
colagv: { body: "Body2SUP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" },
comhpv: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon4AUTOMk1" },
cohbbt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-BB" },
cohhot: { body: "Body9REC", prop: "tracked01", weap: "Howitzer105Mk1" }, // Howitzer Tiger Tracks

// CAM_2_5
cohhpv: { body: "Body9REC", prop: "tracked01", weap: "Cannon4AUTOMk1" },
comagt: { body: "Body6SUPP", prop: "tracked01", weap: "MG4ROTARYMk1" },
cocybag: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRotMG" },
cohaaq: { body: "Body9REC", prop: "tracked01", weap: "QuadRotAAGun" },

// CAM_2_D
comhltat: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-HvyA-T" },
commorvt: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" },

// CAM_2_6
cohact: { body: "Body9REC", prop: "tracked01", weap: "Cannon5VulcanMk1" },
comrotm: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" },
comsensh: { body: "Body6SUPP", prop: "HalfTrack", weap: "SensorTurret1Mk1" },
colacv: { body: "Body2SUP", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon VTOL
coscyac: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Acannon" }, // Super Assault Cannon
coscytk: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-TK" }, // Super Tank Killer

// CAM_2_7
comrotmh: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar3ROTARYMk1" },
cohript: { body: "Body9REC", prop: "tracked01", weap: "Rocket-IDF" }, // Ripple Rocket Tiger Tracks

// CAM_2_8
comhvat: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" },

// CAM_3_A
nxtruckh: { body: "Body7ABT", prop: "hover02", weap: "Spade1Mk1" },
nxmserh: { body: "Body7ABT", prop: "hover02", weap: "Missile-MdArt" },
nxmreph: { body: "Body7ABT", prop: "hover02", weap: "LightRepair1" },
nxlsensh: { body: "Body3MBT", prop: "hover02", weap: "SensorTurret1Mk1" },
nxmrailh: { body: "Body7ABT", prop: "hover02", weap: "RailGun2Mk1" },
nxmscouh: { body: "Body7ABT", prop: "hover02", weap: "Missile-A-T" },
nxcyrail: { body: "CybNXRail1Jmp", prop: "CyborgLegs02", weap: "NX-Cyb-Rail1" },
nxcyscou: { body: "CybNXMissJmp", prop: "CyborgLegs02", weap: "NX-CyborgMiss" },
nxlneedv: { body: "Body3MBT", prop: "V-Tol02", weap: "RailGun1-VTOL" },
nxlscouv: { body: "Body3MBT", prop: "V-Tol02", weap: "Missile-VTOL-AT" },
nxmtherv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb4-VTOL-HvyINC" },
prhasgnt: { body: "Body11ABT", prop: "tracked01", weap: "MG4ROTARYMk1" },
prhct: { body: "Body11ABT", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Tank (Swapped with HPV)
prhaacnt: { body: "Body11ABT", prop: "tracked01", weap: "QuadRotAAGun" },

// CAM_3_1
nxmcommh: { body: "Body7ABT", prop: "hover02", weap: "CommandTurret1" },
nxcylas: { body: "CybNXPulseLasJmp", prop: "CyborgLegs02", weap: "NX-CyborgPulseLas" },

// CAM_3_B
nxmlinkh: { body: "Body7ABT", prop: "hover02", weap: "NEXUSlink" },
nxmsamh: { body: "Body7ABT", prop: "hover02", weap: "Missile-HvySAM" },
nxmheapv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb2-VTOL-HvHE" },
nxmplash: { body: "Body7ABT", prop: "hover02", weap: "PlasmiteFlamer" }, // Plasmite Flamer Tank

// CAM_3_2
nxlflash: { body: "Body3MBT", prop: "hover02", weap: "Laser3BEAMMk1" },

// CAM_3_A_B
nxmsens: { body: "Body7ABT", prop: "hover02", weap: "SensorTurret1Mk1" },

// CAM_3_A_D_1
nxmpulseh: { body: "Body7ABT", prop: "hover02", weap: "Laser2PULSEMk1" },
nxlpulsev: { body: "Body3MBT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" },

// CAM_3_A_D_2
nxhgauss: { body: "Body10MBT", prop: "hover02", weap: "RailGun3Mk1" },
nxhrailv: { body: "Body10MBT", prop: "V-Tol02", weap: "RailGun2-VTOL" },
nxharch: { body: "Body10MBT", prop: "hover02", weap: "Missile-HvyArt" }, // Heavy Archangel Missile Tank

// CAM_3_4
nxllinkh: { body: "Body3MBT", prop: "hover02", weap: "NEXUSlink" },
nxmpulsev: { body: "Body7ABT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" },
nxhseraph: { body: "Body10MBT", prop: "hover02", weap: "Missile-MdArt" }, // Heavy Seraph Missile Tank


////////////////////////////////////////////////////////////////////////////////
};

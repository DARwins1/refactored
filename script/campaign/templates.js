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
gbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaMiniMortar" }, // Grenade Jeep
firetruck: { body: "FireBody", prop: "BaBaProp", weap: "RustFlame1Mk1" }, // Flamer Firetruck
buscan: { body: "BusBody", prop: "BaBaProp", weap: "RustCannon1Mk1" }, // Cannon Bus
minitruck: { body: "FireBody", prop: "BaBaProp", weap: "RustRocket-Pod" }, // Mini-Rocket Pod Firetruck
flatmrl: { body: "ScavTruckBody", prop: "BaBaProp", weap: ["RustRocket-Pod", "RustRocket-MRL"] }, // MRA Flatbed Truck
flatat: { body: "ScavTruckBody", prop: "BaBaProp", weap: ["RustRocket-Pod", "RustRocket-LtA-T"] }, // Lancer Flatbed Truck
crane: { body: "ScavCraneBody", prop: "HalfTrack", weap: "ScavCrane" }, // Scavenger Crane (Constructor)
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
npmtruckt: { body: "Body8MBT", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Scorpion Tracks

nplpodw: { body: "Body4ABT", prop: "wheeled01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Bug Wheels
nplatht: { body: "Body4ABT", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Bug Halftracks
npmatht: { body: "Body8MBT", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Scorpion Halftracks
npmatt: { body: "Body8MBT", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Scorpion Tracks
npmath: { body: "Body8MBT", prop: "hover01", weap: "Rocket-LtA-T" }, // Lancer Scorpion Hover

nplhmght: { body: "Body4ABT", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Bug Halftracks
npmhmght: { body: "Body8MBT", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Scorpion Halftracks
npmhmgt: { body: "Body8MBT", prop: "tracked01", weap: "MG3Mk1" }, // Heavy Machinegun Scorpion Tracks
npmhmgh: { body: "Body8MBT", prop: "hover01", weap: "MG3Mk1" }, // Heavy Machinegun Scorpion Hover

nplflamht: { body: "Body4ABT", prop: "HalfTrack", weap: "Flame1Mk1" }, // Flamer Bug Halftracks
npmflamht: { body: "Body8MBT", prop: "HalfTrack", weap: "Flame1Mk1" }, // Flamer Scorpion Halftracks

nplsensw: { body: "Body4ABT", prop: "wheeled01", weap: "SensorTurret1Mk1" }, // Sensor Bug Wheels
npmsensht: { body: "Body8MBT", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Scorpion Halftracks

npmcomht: { body: "Body8MBT", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Scorpion Halftracks
npmcomt: { body: "Body8MBT", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Scorpion Tracks
nphcomt: { body: "Body12SUP", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Mantis Tracks

npmrept: { body: "Body8MBT", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Scorpion Tracks

npmlcht: { body: "Body8MBT", prop: "HalfTrack", weap: "Cannon1Mk1" }, // Light Cannon Scorpion Halftracks
npmmcht: { body: "Body8MBT", prop: "HalfTrack", weap: "Cannon2A-TMk1" }, // Medium Cannon Scorpion Halftracks
npmmct: { body: "Body8MBT", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Scorpion Tracks
nphmct: { body: "Body12SUP", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Mantis Tracks
nphhct: { body: "Body12SUP", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Mantis Tracks
nphhch: { body: "Body12SUP", prop: "hover01", weap: "Cannon375mmMk1" }, // Heaavy Cannon Mantis Hover

npmmorht: { body: "Body8MBT", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Mortar Scorpion Halftracks
npmmorbht: { body: "Body8MBT", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Scorpion Halftracks

nplmraht: { body: "Body4ABT", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Bug Halftracks
npmmraht: { body: "Body8MBT", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Scorpion Halftracks
npmmrat: { body: "Body8MBT", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Scorpion Tracks
npmmrah: { body: "Body8MBT", prop: "hover01", weap: "Rocket-MRL" }, // Mini-Rocket Array Scorpion Hover

npmbbht: { body: "Body8MBT", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Scorpion Halftracks
npmbbt: { body: "Body8MBT", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Scorpion Tracks
nphbbt: { body: "Body12SUP", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Mantis Tracks
nphbbh: { body: "Body12SUP", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Mantis Hover

// Collective Units:
comtruckht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Panther Halftracks
comtruckt: { body: "Body6SUPP", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Panther Tracks

comaat: { body: "Body6SUPP", prop: "tracked01", weap: "AAGun2Mk1" }, // Cyclone Panther Tracks
cohraat: { body: "Body9REC", prop: "tracked01", weap: "QuadRotAAGun" }, // Whirlwind Tiger Tracks
comsamht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Missile-LtSAM" }, // Avenger Panther Halftracks
comsamt: { body: "Body6SUPP", prop: "tracked01", weap: "Missile-LtSAM" }, // Avenger Panther Tracks

comhmgt: { body: "Body6SUPP", prop: "tracked01", weap: "MG3Mk1" }, // Heavy Machinegun Panther Tracks
comaght: { body: "Body6SUPP", prop: "HalfTrack", weap: "MG4ROTARYMk1" }, // Assault Gun Panther Halftracks
comagt: { body: "Body6SUPP", prop: "tracked01", weap: "MG4ROTARYMk1" }, // Assault Gun Panther Tracks

comsenstht: { body: "Body6SUPP", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Panther Halftracks
comsenst: { body: "Body6SUPP", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Panther Tracks
comstriket: { body: "Body6SUPP", prop: "tracked01", weap: "Sys-VstrikeTurret01" }, // Vtol Strike Turret Panther Tracks

comcomt: { body: "Body6SUPP", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Panther Tracks
cohcomt: { body: "Body9REC", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Tiger Tracks

commct: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Panther Tracks
comhpvht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Halftracks
comhpvt: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Tracks
comhpvh: { body: "Body6SUPP", prop: "hover01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Hover
cohhpvt: { body: "Body9REC", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Tiger Tracks
comact: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Panther Tracks
cohact: { body: "Body9REC", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Tiger Tracks
cohhct: { body: "Body9REC", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Tiger Tracks

comorbht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Panther Halftracks
comorbt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar2Mk1" }, // Bombard Panther Tracks
comrotmht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" }, // Pepperpot Panther Halftracks
comrotmt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Panther Tracks
cohhowt: { body: "Body9REC", prop: "tracked01", weap: "Howitzer105Mk1" }, // Howitzer Tiger Tracks
cohshakt: { body: "Body9REC", prop: "tracked01", weap: "Howitzer150Mk1" }, // Ground Shaker Tiger Tracks

colpodt: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Leopard Tracks
comatht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Panther Halftracks
comatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Panther Tracks
comath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-LtA-T" }, // Lancer Panther Hover
comhatht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Halftracks
comhatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Tracks
comhath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Hover
cohbalt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-Ballista" }, // Ballista Tiger Tracks

combbh: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Panther Hover
cohbbt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Tiger Tracks
cohbbh: { body: "Body9REC", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Tiger Hover

comit: { body: "Body6SUPP", prop: "tracked01", weap: "Flame2" }, // Inferno Panther Tracks

comrepht: { body: "Body6SUPP", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Panther Halftracks
comrept: { body: "Body6SUPP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Panther Tracks

commraht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Halftracks
commrat: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Tracks
commrah: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Hover
cohhrat: { body: "Body9REC", prop: "tracked01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Tracks
cohhrah: { body: "Body9REC", prop: "hover01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Hover
cohript: { body: "Body9REC", prop: "tracked01", weap: "Rocket-IDF" }, // Ripple Rocket Tiger Tracks

colcbv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Leopard VTOL
colatv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-LtA-T" }, // Lancer Leopard VTOL
colagv: { body: "Body2SUP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Leopard VTOL
comhbv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Panther VTOL
comtbv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Panther VTOL
comacv: { body: "Body6SUPP", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon Panther VTOL
comhatv: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" }, // Tank Killer Panther VTOL

// NEXUS Units:

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

// Project Units:
prmtruckt: { body: "Body5REC", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Cobra Tracks
prhtruckw: { body: "Body11ABT", prop: "wheeled01", weap: "Spade1Mk1" }, // Truck Python Wheels
prhtruckht: { body: "Body11ABT", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Python Halftracks

prhsensht: { body: "Body11ABT", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Python Halftracks

prhhmght: { body: "Body11ABT", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Python Halftracks

prhmcht: { body: "Body11ABT", prop: "HalfTrack", weap: "Cannon2A-TMk1" }, // Medium Cannon Python Halftracks
prhhpvt: { body: "Body11ABT", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Python Tracks

prhcomht: { body: "Body11ABT", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Python Halftracks

prmatt: { body: "Body5REC", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Cobra Tracks
prhpodht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-Pod" }, // Mini-Rocket Pod Python Halftracks
prhatht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Python Halftracks

prhmraht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Python Halftracks

prhmorbht: { body: "Body11ABT", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Python Halftracks

prmrept: { body: "Body5REC", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Cobra Tracks

////////////////////////////////////////////////////////////////////////////////
};

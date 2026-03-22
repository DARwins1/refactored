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
scyhr: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HRA" }, // Super Heavy Rocket Cyborg
cybla: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRocket" }, // Lancer Cyborg
scytk: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-TK" }, // Super Tank-Killer Cyborg
cybca: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" }, // Heavy Gunner Cyborg
scymc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Mcannon" }, // Super Heavy-Gunner Cyborg
scyhc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HPV" }, // Super HPC Cyborg
scyac: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Acannon" }, // Super Auto-Cannon Cyborg
cybls: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Laser" }, // Flashlight Gunner Cyborg
ncyne: { body: "CybNXJmpBody", prop: "CyborgLegs02", weap: "NX-Cyb-Rail1" }, // NEXUS Needle Cyborg
ncysc: { body: "CybNXJmpBody", prop: "CyborgLegs02", weap: "NX-CyborgMiss" }, // NEXUS Scourge Cyborg
ncyla: { body: "CybNXJmpBody", prop: "CyborgLegs02", weap: "NX-CyborgLas" }, // NEXUS Flashlight Cyborg
ncypl: { body: "CybNXJmpBody", prop: "CyborgLegs02", weap: "NX-CyborgPlasFlame" }, // NEXUS Plasmite Flamer Cyborg

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
cohaght: { body: "Body9REC", prop: "HalfTrack", weap: "MG4ROTARYMk1" }, // Assault Gun Tiger Halftracks

comsensht: { body: "Body6SUPP", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Panther Halftracks
comsenst: { body: "Body6SUPP", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Panther Tracks
comstriket: { body: "Body6SUPP", prop: "tracked01", weap: "Sys-VstrikeTurret01" }, // Vtol Strike Turret Panther Tracks

comcomt: { body: "Body6SUPP", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Panther Tracks
cohcomht: { body: "Body9REC", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Tiger Halftracks
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
cohhatht: { body: "Body9REC", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Tiger Halftracks
cohbalt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-Ballista" }, // Ballista Tiger Tracks

combbh: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Panther Hover
cohbbht: { body: "Body9REC", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Tiger Halftracks
cohbbt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Tiger Tracks
cohbbh: { body: "Body9REC", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Tiger Hover

comit: { body: "Body6SUPP", prop: "tracked01", weap: "Flame2" }, // Inferno Panther Tracks

comrepht: { body: "Body6SUPP", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Panther Halftracks
comrept: { body: "Body6SUPP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Panther Tracks

commraht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Halftracks
commrat: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Tracks
commrah: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Hover
cohhraht: { body: "Body9REC", prop: "HalfTrack", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Halftracks
cohhrat: { body: "Body9REC", prop: "tracked01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Tracks
cohhrah: { body: "Body9REC", prop: "hover01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Hover
cohript: { body: "Body9REC", prop: "tracked01", weap: "Rocket-IDF" }, // Ripple Rocket Tiger Tracks

colcbv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Leopard VTOL
colpbv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb3-VTOL-LtINC" }, // Phosphor Bomb Leopard VTOL
colatv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-LtA-T" }, // Lancer Leopard VTOL
colagv: { body: "Body2SUP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Leopard VTOL
comhbv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Panther VTOL
comtbv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Panther VTOL
comagv: { body: "Body6SUPP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Panther VTOL
comacv: { body: "Body6SUPP", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon Panther VTOL
comhatv: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" }, // Tank Killer Panther VTOL

// NEXUS Units:
// NOTE: NEXUS units use Mk2 propulsions
nxmtruckh: { body: "Body7ABT", prop: "hover02", weap: "Spade1Mk1" }, // Truck Retribution Hover

nxmreph: { body: "Body7ABT", prop: "hover02", weap: "LightRepair1" }, // Repair Turret Retribution Hover

nxmcommh: { body: "Body7ABT", prop: "hover02", weap: "CommandTurret1" }, // Command Turret Retribution Hover

nxlsensh: { body: "Body3MBT", prop: "hover02", weap: "SensorTurret1Mk1" }, // Sensor Retaliation Hover
nxmsensh: { body: "Body7ABT", prop: "hover02", weap: "SensorTurret1Mk1" }, // Sensor Retribution Hover

nxmserh: { body: "Body7ABT", prop: "hover02", weap: "Missile-MdArt" }, // Seraph Missile Retribution Hover
nxhserh: { body: "Body10MBT", prop: "hover02", weap: "Missile-MdArt" }, // Seraph Missile Vengeance Hover
nxharch: { body: "Body10MBT", prop: "hover02", weap: "Missile-HvyArt" }, // Archangel Missile Vengeance Hover

nxmrailh: { body: "Body7ABT", prop: "hover02", weap: "RailGun2Mk1" }, // Rail Gun Retribution Hover
nxhgaush: { body: "Body10MBT", prop: "hover02", weap: "RailGun3Mk1" }, // Gauss Cannon Vengeance Hover

nxmscouh: { body: "Body7ABT", prop: "hover02", weap: "Missile-A-T" }, // Scourge Missile Retribution Hover

nxmdevh: { body: "Body7ABT", prop: "hover02", weap: "Missile-BB" }, // Devastator Missile Retribution Hover
nxhdevh: { body: "Body10MBT", prop: "hover02", weap: "Missile-BB" }, // Devastator Missile Vengeance Hover

nxlneedv: { body: "Body3MBT", prop: "V-Tol02", weap: "RailGun1-VTOL" }, // Needle Gun Retaliation VTOL
nxlscouv: { body: "Body3MBT", prop: "V-Tol02", weap: "Missile-VTOL-AT" }, // Scourge Missile Retaliation VTOL
nxldevv: { body: "Body3MBT", prop: "V-Tol02", weap: "Missile-VTOL-BB" }, // Devastator Missile Retaliation VTOL
nxlflasv: { body: "Body3MBT", prop: "V-Tol02", weap: "Laser3BEAM-VTOL" }, // Flashlight Retaliation VTOL
nxlpulsev: { body: "Body3MBT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" }, // Pulse Laser Retaliation VTOL
nxmpulsev: { body: "Body7ABT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" }, // Pulse Laser Retribution VTOL
nxmdevv: { body: "Body7ABT", prop: "V-Tol02", weap: "Missile-VTOL-BB" }, // Devastator Missile Retribution VTOL
nxmhbv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Retribution VTOL
nxmtbv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Retribution VTOL
nxhrailv: { body: "Body10MBT", prop: "V-Tol02", weap: "RailGun2-VTOL" }, // Rail Gun Vengeance VTOL

nxllinkh: { body: "Body3MBT", prop: "hover02", weap: "NEXUSlink" }, // NEXUS Link Retaliation Hover
nxmlinkh: { body: "Body7ABT", prop: "hover02", weap: "NEXUSlink" }, // NEXUS Link Retribution Hover

nxmsamh: { body: "Body7ABT", prop: "hover02", weap: "Missile-HvySAM" }, // Vindicator Retribution Hover

nxmplash: { body: "Body7ABT", prop: "hover02", weap: "PlasmiteFlamer" }, // Plasmite Flamer Retribution Hover

nxlflash: { body: "Body3MBT", prop: "hover02", weap: "Laser3BEAMMk1" }, // Flashlight Retaliation Hover
nxmpulseh: { body: "Body7ABT", prop: "hover02", weap: "Laser2PULSEMk1" }, // Pulse Laser Retribution Hover

// Project Units:
prmtruckt: { body: "Body5REC", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Cobra Tracks
prhtruckw: { body: "Body11ABT", prop: "wheeled01", weap: "Spade1Mk1" }, // Truck Python Wheels
prhtruckht: { body: "Body11ABT", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Python Halftracks
prhtruckt: { body: "Body11ABT", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Python Tracks

prhsensht: { body: "Body11ABT", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Python Halftracks

prlmgw: { body: "Body1REC", prop: "wheeled01", weap: "MG1Mk1" }, // Machinegun Viper Wheels
prhhmght: { body: "Body11ABT", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Python Halftracks
prhagt: { body: "Body11ABT", prop: "tracked01", weap: "MG4ROTARYMk1" }, // Assault Gun Python Tracks

prhmcht: { body: "Body11ABT", prop: "HalfTrack", weap: "Cannon2A-TMk1" }, // Medium Cannon Python Halftracks
prhacht: { body: "Body11ABT", prop: "HalfTrack", weap: "Cannon5VulcanMk1" }, // Assault Cannon Python Halftracks
prhhpvt: { body: "Body11ABT", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Python Tracks
prhhct: { body: "Body11ABT", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Python Tracks

prhcomht: { body: "Body11ABT", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Python Halftracks
prhcomt: { body: "Body11ABT", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Python Tracks

prmatt: { body: "Body5REC", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Cobra Tracks
prhpodht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-Pod" }, // Mini-Rocket Pod Python Halftracks
prhatht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Python Halftracks
prhhatht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Python Halftracks
prhhatt: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-HvyA-T" }, // Tank Killer Python Tracks
prhbalht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-Ballista" }, // Ballista Python Halftracks

prhmraht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Python Halftracks
prhhraht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Python Halftracks
prhhrat: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Python Tracks

prhiht: { body: "Body11ABT", prop: "HalfTrack", weap: "Flame2" }, // Inferno Python Halftracks

prhmorbht: { body: "Body11ABT", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Python Halftracks
prhrotmht: { body: "Body11ABT", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" }, // Pepperpot Python Halftracks
prhhowht: { body: "Body11ABT", prop: "HalfTrack", weap: "Howitzer105Mk1" }, // Howitzer Python Halftracks
prhshakht: { body: "Body11ABT", prop: "HalfTrack", weap: "Howitzer150Mk1" }, // Ground Shaker Python Halftracks
prhhellht: { body: "Body11ABT", prop: "HalfTrack", weap: "Howitzer03-Rot" }, // Hellstorm Python Halftracks

prhraaht: { body: "Body11ABT", prop: "HalfTrack", weap: "QuadRotAAGun" }, // Whirlwind Python Halftracks
prhraat: { body: "Body11ABT", prop: "tracked01", weap: "QuadRotAAGun" }, // Whirlwind Python Tracks

prmrept: { body: "Body5REC", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Cobra Tracks

prlmgv: { body: "Body1REC", prop: "V-Tol", weap: "MG1-VTOL" }, // Machinegun Viper VTOL

////////////////////////////////////////////////////////////////////////////////
};

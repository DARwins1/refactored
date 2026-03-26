
////////////////////////////////////////////////////////////////////////////////
// Nexus related functionality.
////////////////////////////////////////////////////////////////////////////////

//;; ## camNexusLaugh()
//;;
//;; Play a random NEXUS laugh.
//;;
//;; @returns {void}
//;;
function camNexusLaugh()
{
	const __LAUGH_CHANCE = 45;
	if (camRand(100) < __LAUGH_CHANCE)
	{
		const laughs = [cam_sounds.nexus.laugh1, cam_sounds.nexus.laugh2, cam_sounds.nexus.laugh3];
		playSound(laughs[camRand(laughs.length)]);
	}
}

//;; ## camAbsorbPlayer([who[, to]])
//;;
//;; Completely give all of player `who` droids and structures to player `to`.
//;; Will default to `CAM_HUMAN_PLAYER` and `CAM_NEXUS` respectively.
//;;
//;; @param {number} [who]
//;; @param {number} [to]
//;; @returns {void}
//;;
function camAbsorbPlayer(who, to)
{
	if (!camDef(who))
	{
		who = CAM_HUMAN_PLAYER;
	}
	if (!camDef(to))
	{
		to = CAM_NEXUS;
	}
	const units = enumDroid(who);
	for (let i = 0, len = units.length; i < len; ++i)
	{
		const droid = units[i];
		if (!donateObject(droid, to))
		{
			camSafeRemoveObject(droid, false);
		}
	}
	const structs = enumStruct(who);
	for (let i = 0, len = structs.length; i < len; ++i)
	{
		const structure = structs[i];
		if (!donateObject(structure, to))
		{
			camSafeRemoveObject(structure, false);
		}
	}
	camTrace("Player " + who + " has been absorbed by player" + to);
	changePlayerColour(who, to);
}

//;; ## camSetNexusState(flag)
//;;
//;; Turn on/off the NEXUS hacking state feature.
//;;
//;; @param {boolean} flag
//;; @returns {void}
//;;
function camSetNexusState(flag)
{
	__camNexusActivated = flag;
}

//;; ## camGetNexusState()
//;;
//;; Returns the activation state of the NEXUS hacking feature.
//;;
//;; @returns {boolean}
//;;
function camGetNexusState()
{
	return __camNexusActivated;
}

//////////// privates

// Start managing a factory that was stolen from the player by NEXUS
function __camManageCapturedFactory(factory)
{
	// Select templates based on the type of factory that was captured
	let templates;
	let throttle;
	// Instead of a pre-defined list, sample all of the player's units on the map...
	const droids = enumDroid(CAM_HUMAN_PLAYER);
	templates = [];
	for (const droid of droids)
	{
		if (droid.droidType !== DROID_CONSTRUCT && droid.droidType !== DROID_COMMAND &&
			droid.droidType !== DROID_REPAIR && droid.droidType !== DROID_SENSOR &&
			droid.droidType !== DROID_SUPERTRANSPORTER)
		{
			// NOTE: This assumes that the player doesn't have any multi-weapon units!
			templates.push({body: droid.body, prop: droid.propulsion, weap: droid.weapons[0].name});
		}
	}
	// templates = camRemoveDuplicates(templates);

	if (factory.stattype === FACTORY) // Standard factory
	{
		throttle = camChangeOnDiff(camSecondsToMilliseconds(60));
		templates = templates.filter((temp) => (temp.prop !== "CyborgLegs" && temp.prop !== "V-Tol")); // Filter out all cyborgs and VTOLs
		if (factory.modules < 2)
		{
			templates = templates.filter((temp) => ( // Filter out all heavy bodies
				temp.body !== "Body11ABT" && 
				temp.body !== "Body12SUP" && 
				temp.body !== "Body9REC" &&
				temp.body !== "Body10MBT"
			));
		}
		if (factory.modules < 1)
		{
			templates = templates.filter((temp) => ( // Filter out all medium bodies
				temp.body !== "Body5REC" &&
				temp.body !== "Body8MBT" &&
				temp.body !== "Body6SUPP" &&
				temp.body !== "Body7ABT"
			));
		}
	}
	else if (factory.stattype === CYBORG_FACTORY) // Cyborg factory
	{
		throttle = camChangeOnDiff(camSecondsToMilliseconds(40));
		templates = templates.filter((temp) => (temp.prop === "CyborgLegs")); // Filter out all non-cyborgs
	}
	else // VTOL factory
	{
		throttle = camChangeOnDiff(camSecondsToMilliseconds(70));
		templates = templates.filter((temp) => (temp.prop === "V-Tol")); // Filter out all non-VTOLs
		if (factory.modules < 2)
		{
			templates = templates.filter((temp) => ( // Filter out all heavy bodies
				temp.body !== "Body11ABT" && 
				temp.body !== "Body12SUP" && 
				temp.body !== "Body9REC" &&
				temp.body !== "Body10MBT"
			));
		}
		if (factory.modules < 1)
		{
			templates = templates.filter((temp) => ( // Filter out all medium bodies
				temp.body !== "Body5REC" &&
				temp.body !== "Body8MBT" &&
				temp.body !== "Body6SUPP" &&
				temp.body !== "Body7ABT"
			));
		}
	}

	// Start managing the factory!
	const fLabel = "capturedFactory" + __camCapturedFactoryIdx++;
	addLabel(factory, fLabel);
	camSetFactoryData(fLabel, {
		order: CAM_ORDER_ATTACK,
		throttle: throttle,
		groupSize: 3,
		data: {
			repair: 50,
		},
		templates: templates
	});
	camEnableFactory(fLabel);
}
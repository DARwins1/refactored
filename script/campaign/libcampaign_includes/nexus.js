
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


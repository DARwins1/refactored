
////////////////////////////////////////////////////////////////////////////////
// Research related functions.
////////////////////////////////////////////////////////////////////////////////

//;; ## camEnableRes(researchIds, playerId)
//;;
//;; Grants research from the given list to player
//;;
//;; @param {string[]} researchIds
//;; @param {number} playerId
//;; @returns {void}
//;;
function camEnableRes(researchIds, playerId)
{
	for (let i = 0, l = researchIds.length; i < l; ++i)
	{
		const __RESEARCH_ID = researchIds[i];
		const __FORCE = (cam_nexusSpecialResearch.indexOf(__RESEARCH_ID) !== -1);
		enableResearch(__RESEARCH_ID, playerId);
		completeResearch(__RESEARCH_ID, playerId, __FORCE);
	}
}

//;; ## camCompleteRequiredResearch(researchIds, playerId)
//;;
//;; Grants research from the given list to player and also researches the required research for that item.
//;;
//;; @param {string[]} researchIds
//;; @param {number} playerId
//;; @returns {void}
//;;
function camCompleteRequiredResearch(researchIds, playerId)
{
	//dump("\n*Player " + playerId + " requesting accelerated research.");
	for (let i = 0, l = researchIds.length; i < l; ++i)
	{
		const __RESEARCH_ID = researchIds[i];
		//dump("Searching for required research of item: " + __RESEARCH_ID);
		let reqRes = findResearch(__RESEARCH_ID, playerId).reverse();

		if (reqRes.length === 0)
		{
			//HACK: autorepair like upgrades don't work after mission transition.
			if (cam_nexusSpecialResearch.indexOf(__RESEARCH_ID) !== -1)
			{
				completeResearch(__RESEARCH_ID, playerId, true);
			}
			continue;
		}

		reqRes = camRemoveDuplicates(reqRes);
		for (let s = 0, r = reqRes.length; s < r; ++s)
		{
			const __RESEARCH_REQ = reqRes[s].name;
			//dump("	Found: " + __RESEARCH_REQ);
			enableResearch(__RESEARCH_REQ, playerId);
			completeResearch(__RESEARCH_REQ, playerId);
		}
	}
}

//;; ## camCompleteRequiredResearch(researchId)
//;;
//;; Returns true if the player has the given research available in their menu, false otherwise.
//;;
//;; @param {string} researchIds
//;; @returns {boolean}
//;;
function camResearchIsAvailable(researchId)
{
	const resList = enumResearch();
	for (let i = 0; i < resList.length; i++)
	{
		if (resList[i].id === researchId)
		{
			return true;
		}
	}
	return false;
}

//////////// privates

// Automatically complete special research buffs for enemies.
function __camGrantSpecialResearch()
{
	for (let i = 1; i < __CAM_MAX_PLAYERS; ++i)
	{
		if (countDroid(DROID_ANY, i) > 0 || enumStruct(i).length > 0)
		{
			//Boost AI production to produce all droids within a factory throttle
			completeResearch(__CAM_AI_INSTANT_PRODUCTION_RESEARCH, i);
		}
	}
}

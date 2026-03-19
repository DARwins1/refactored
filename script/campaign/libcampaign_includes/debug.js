
////////////////////////////////////////////////////////////////////////////////
// Debugging helpers.
////////////////////////////////////////////////////////////////////////////////

//;; ## camMarkTiles(what[, debug])
//;;
//;; Mark area on the map, can be a label, position, or area.
//;; If `debug` is true or undefined, only display the tiles when in debug mode.
//;; Otherwise, remember what to mark in case it is going to be.
//;;
//;; @param {string|string[]} what
//;; @param {bool} debug
//;; @returns {void}
//;;
function camMarkTiles(what, debug = true)
{
	if (!(what instanceof Array))
	{
		__camMarkedTiles[__camMarkedTilesIdx++] = {what: what, debug: debug};
	}
	else
	{
		for (let i = 0, l = what.length; i < l; ++i)
		{
			__camMarkedTiles[__camMarkedTilesIdx++] = {what: what[i], debug: debug};
		}
	}
	// apply instantly
	__camUpdateMarkedTiles();
}

//;; ## camUnmarkTiles(what)
//;;
//;; No longer mark area(s).
//;; If `what` is CAM_ALL_NON_DEBUG_TILES, unmark all non-debug exclusive tiles.
//;;
//;; @param {string|string[]} what
//;; @returns {void}
//;;
function camUnmarkTiles(what)
{
	if (what === CAM_ALL_NON_DEBUG_TILES)
	{
		for (const i in __camMarkedTiles)
		{
			if (!__camMarkedTiles[i].debug)
			{
				delete __camMarkedTiles[i];
			}
		}
	}
	else if (!(what instanceof Array))
	{
		for (const i in __camMarkedTiles)
		{
			if (__camCompareLabelPosOrArea(__camMarkedTiles[i].what, what))
			{
				delete __camMarkedTiles[i];
			}
		}
	}
	else
	{
		for (let i = 0, l = what.length; i < l; ++i)
		{
			for (const j in __camMarkedTiles)
			{
				if (__camCompareLabelPosOrArea(__camMarkedTiles[j].what, what[i]))
				{
					delete __camMarkedTiles[j];
				}
			}
		}
	}
	// apply instantly
	__camUpdateMarkedTiles();
}

//;; ## camDebug(...args)
//;;
//;; Pretty debug prints - a wrapper around `debug()`.
//;; Prints a function call stack and the argument message, prefixed with `DEBUG`.
//;; Only use this function to indicate actual bugs in the scenario script,
//;; because game shouldn't print things when nothing is broken.
//;; If you want to keep some prints around to make debugging easier
//;; without distracting the user, use `camTrace()`.
//;;
//;; @param {...string} args
//;; @returns {void}
//;;
function camDebug(...args)
{
	__camGenericDebug("DEBUG", debugGetCallerFuncName(), args, true, __camBacktrace());
}

//;; ## camDebugOnce(...args)
//;;
//;; Same as `camDebug()`, but prints each message only once during script lifetime.
//;;
//;; @param {...string} args
//;; @returns {void}
//;;
function camDebugOnce(...args)
{
	const __STR = debugGetCallerFuncName() + ": " + args.join(" ");
	if (camDef(__camDebuggedOnce[__STR]))
	{
		return;
	}
	__camDebuggedOnce[__STR] = true;
	__camGenericDebug("DEBUG", debugGetCallerFuncName(), args, true, __camBacktrace());
}

//;; ## camTrace(...args)
//;;
//;; Same as `camDebug()`, but only warns in cheat mode.
//;; Prefixed with `TRACE`. It's safe and natural to keep `camTrace()` calls in your code for easier debugging.
//;;
//;; @param {...string} args
//;; @returns {void}
//;;
function camTrace(...args)
{
	if (!camIsCheating())
	{
		return;
	}
	__camGenericDebug("TRACE", debugGetCallerFuncName(), args);
}

//;; ## camTraceOnce(...args)
//;;
//;; Same as `camTrace()`, but prints each message only once during script lifetime.
//;;
//;; @param {...string} args
//;; @returns {void}
//;;
function camTraceOnce(...args)
{
	if (!camIsCheating())
	{
		return;
	}
	const __STR = debugGetCallerFuncName() + ": " + args.join(" ");
	if (camDef(__camTracedOnce[__STR]))
	{
		return;
	}
	__camTracedOnce[__STR] = true;
	__camGenericDebug("TRACE", debugGetCallerFuncName(), args);
}

//;; ## camIsCheating()
//;;
//;; Check if the player is in cheat mode.
//;;
//;; @returns {boolean}
//;;
function camIsCheating()
{
	return __camCheatMode;
}

//////////// privates

function __camUpdateMarkedTiles()
{
	hackMarkTiles();
	if (camDef(__camMarkedTiles))
	{
		for (const i in __camMarkedTiles)
		{
			const marker = __camMarkedTiles[i];
			if (!camDef(marker))
			{
				continue;
			}

			if (!marker.debug || (marker.debug && camIsCheating()))
			{
				if (camIsString(marker.what))
				{
					hackMarkTiles(marker.what); // Label
				}
				else if (camDef(marker.what.x2))
				{
					hackMarkTiles(marker.what.x, marker.what.y, marker.what.x2, marker.what.y2); // Area
				}
				else if (camDef(marker.what.x))
				{
					hackMarkTiles(marker.what.x, marker.what.y); // Position
				}
				else
				{
					// ???
					camDebug("Tried to mark tiles with unkown data!");
				}
			}
		}
	}
}

function __camLetMeWin()
{
	__camLetMeWinArtifacts();
	hackMarkTiles(); // clear marked tiles, as they may actually remain
	__camGameWon();
}

function __camGenericDebug(flag, functionName, args, err, backtrace)
{
	if (camDef(backtrace) && backtrace)
	{
		for (let i = backtrace.length - 1; i >= 0; --i)
		{
			debug("STACK: from", [backtrace[i]]);
		}
	}
	if (!functionName)
	{
		functionName = "<anonymous>";
	}
	const __STR = flag + ": " + functionName + ": " + Array.prototype.join.call(args, " ");
	debug(__STR);
	if (camDef(err) && err)
	{
		dump(__STR);
	}
}

function __camBacktrace()
{
	return debugGetBacktrace();
}

function __camCompareLabelPosOrArea(a, b)
{
	if (camDef(a.x2)) // A is area
	{
		if (!camDef(b.x2)) // B is not an area
		{
			return false;
		}
		else
		{
			return (
				a.x === b.x &&
				a.y === b.y &&
				a.x2 === b.x2 &&
				a.y2 === b.y2
			);
		}
	}
	else if (camDef(a.x)) // A is position
	{
		if (!camDef(b.x)) // B is not a position
		{
			return false;
		}
		else
		{
			return (
				a.x === b.x &&
				a.y === b.y
			);
		}
	}
	else // String?
	{
		return a === b; // Try comparing directly
	}
}

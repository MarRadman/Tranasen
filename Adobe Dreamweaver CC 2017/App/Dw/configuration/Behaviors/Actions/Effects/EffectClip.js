// Copyright 2012 Adobe Systems Incorporated. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behEffectClip;

var ID_LIST;              // list of available IDs in the current document
var STATE_LIST;           // holds the string/value-pairs for the two effects
var OLD_VALUE_POOL;           // saves the old values and the sync state of the text fields


//******************* BEHAVIOR FUNCTION **********************

// Adds an Clip-Effect to the element.
// Accepts the following arguments:
//  targetElement - ID or JavaScript DOM object of target element
//  method        - the method which is to be applied(hide,show,toggle)
//  effect        - the name of the effect i.e. clip
//  dir           - direction(horizontal or vertical)
//  speed         - duration of the effect   

function MM_DW_effectClip(obj,method,effect,dir,speed)
{
    obj[method](effect, { direction: dir}, speed);
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
	var retVal = "onClick,onMouseUp,onMouseDown,(onClick)";  // default is onClick
	return retVal;
}


//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
    return "MM_DW_effectClip";
}


//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior()
{
     dw.logEvent(UT_JQUERY_CLIP_EFFECT, UT_JQUERY_CLIP_EFFECT_APPLY);
	var theDOM = dw.getDocumentDOM();

	// first we check if the <head> tag is in a locked region -> effect can't be added
	if(!theDOM.isHeadEditable())
		return dwscripts.sprintf(dw.loadString('spry/alert/lockedHeadRegion'), theDOM.getAttachedTemplate());

	var selIdx   = document.theForm.pageEltObj.selectedIndex;
	var selValue = document.theForm.pageEltObj.options[selIdx].value;
	var includeLibrary = true;
	var retVal;

	if(selValue=="default") // no target element selected
	{
		includeLibrary = false;
		retVal = MSG_SelectTargetOrCancel;
	}
	else if(selValue=="this") // effect is assigned to the behavior element
	{
	    retVal = "MM_DW_effectClip($(this),'" + document.theForm.effectTypeObj.options[document.theForm.effectTypeObj.selectedIndex].value + "'" + ",'clip','" + document.theForm.directionTypeObj.options[document.theForm.directionTypeObj.selectedIndex].value + "'," + document.theForm.speedObj.value + ")";
	}
	else // behavior element triggers effect which is assigned to a target element
	{
		var refIdx = parseInt(selValue);
		retVal = "MM_DW_effectClip($('#" + ID_LIST[refIdx] + "'),'" + document.theForm.effectTypeObj.options[document.theForm.effectTypeObj.selectedIndex].value + "'" + ",'clip','" + document.theForm.directionTypeObj.options[document.theForm.directionTypeObj.selectedIndex].value + "'," + document.theForm.speedObj.value + ")";
	}

	if(includeLibrary)
		effectsUtils.addLibraryInclude(); // make sure jquery.min.js and jquery.min.ui-effects.js-lib is available

	return retVal;
}


//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
    dw.logEvent(UT_JQUERY_CLIP_EFFECT, UT_JQUERY_CLIP_EFFECT_INSPECT);
    var argArray = extractExprStr(fnStr);
  if (argArray.length == 5) { // we expect 5 args -> targetElement, method, effect, direction,speed(duration)
	var selIdx  = 0;
	var targetElement = effectsUtils.stripWhitespaces(unescExprStr(argArray[0], false).toLowerCase());

	if(targetElement == "$(this)") // effect is assigned to the behavior element
	{
		var optIdx = effectsUtils.getPopupIndex(document.theForm.pageEltObj, 'this');
		if(optIdx >= 0)
			selIdx = optIdx;
	}
	else // behavior element triggers effect which is assigned to a target element
	{
	    /* targetElement which we are expecting is of the form $('#pid2') and 
	    /* and we want pid2 out of that */
	    var idValueTemp = targetElement.match("#.*'")[0];
	    var idValue = idValueTemp.substr(1, idValueTemp.length - 2);
		var found   = false;
		var i       = ID_LIST.length-1;
		while (!found && i >= 0) {
		    if (ID_LIST[i].toLowerCase() == idValue) {
		        found = true;
		    }
		    else
		        i--;
		}
		if(found)
		{
			var idxString = String(i);
			var optIdx    = effectsUtils.getPopupIndex(document.theForm.pageEltObj, idxString);
			if(optIdx >= 0)
				selIdx = optIdx;
		}
	}

	document.theForm.pageEltObj.selectedIndex = selIdx;
	
	var effectIdx = (argArray[1] == "hide")?0:(argArray[1] == "show")?1:2;
	var directionIdx = (argArray[3] == "vertical")?0:1;
	var speedValue = effectsUtils.stripWhitespaces(unescExprStr(argArray[4],false));
	document.theForm.effectTypeObj.selectedIndex = effectIdx;
	document.theForm.directionTypeObj.selectedIndex = directionIdx;
	document.theForm.speedObj.value = parseFloat(speedValue);

	document.theForm.pageEltObj.focus();  // set focus on popup
  }
}


// Removes the reference to jquery.ui-effects.custom.min.js if it's no longer used.

function deleteBehavior(fnCallStr)
{
	initGlobals();
	effectsUtils.removeLibraryIncludeIfUnused();
}


//***************** LOCAL FUNCTIONS  ******************


// initializes the User Interface with default values

function initializeUI()
{
    dw.logEvent(UT_JQUERY_CLIP_EFFECT, UT_JQUERY_CLIP_EFFECT_INITIALIZE);
	initGlobals(); // initialize global vars

	//
	// we create the popup for all allowed elements in the document
	//
	var theDOM         = dw.getDocumentDOM(); // DOM of the current document
	var option_entries = new Array(); // to hold all the options-strings

	// if selected element can be target for the effect we will add them too
	var selObj = dw.getBehaviorElement();
	if(!selObj)
		selObj = theDOM.getSelectedNode();
	var tagname = selObj ? selObj.tagName : "";

	option_entries.push("<option value=\"this\">&lt;"+MSG_ThisElement+"&gt;</option>");

	var idElems = theDOM.body.getElementsByAttributeName("id");
	for (var i = 0; i < idElems.length; i++) {
	    currId = idElems[i].getAttribute("id");
		currEltName = idElems[i].tagName;
	    if (currId) {
	        ID_LIST.push(currId);
	        option_entries.push("<option value=\"" + i + "\">" + currEltName.toLowerCase() + " \"" + currId + "\"</option>");
	    }
	}

	// there are potential elements to which the Clip Effect can be applied to
	document.theForm.pageEltObj.innerHTML = option_entries.join("");

	document.theForm.pageEltObj.selectedIndex = 0;

	// set default values to the rest of the input fields

	document.theForm.speedObj.value = "1000"; // duration time of applying the effect (in milliseconds)

	var selIdx = 0; 

	document.theForm.effectTypeObj.selectedIndex = selIdx;
	document.theForm.directionTypeObj.selectedIndex = selIdx;

	document.theForm.pageEltObj.focus();  // set focus on popup
}


// initializes the global vars
//
function initGlobals()
{
	ID_LIST = new Array();
	OLD_VALUE_POOL           = new Array(["",true],["",true],["",true]); // saves the old values of the text fields
}


// Stores the value of the text field
//
function storeValue(idx, objectNode)
{
	if(objectNode && idx >= 0 && idx < OLD_VALUE_POOL.length && OLD_VALUE_POOL[idx][1])
		OLD_VALUE_POOL[idx][0] = objectNode.value;
}


// Checks if the duration-value is valid (digits only).
// If the value is not valid a info message appears.
function checkDuration(idx, objectNode)
{
	OLD_VALUE_POOL[idx][1] = false;

	if(objectNode && idx >= 0 && idx < OLD_VALUE_POOL.length)
	{
		var value = objectNode.value;

		if(!effectsUtils.onlyDigits(value))
		{
			var message = MSG_NotAValidValue;
			message = message.replace('%1',value);
			alert(message);

			objectNode.value = OLD_VALUE_POOL[idx][0];
		}
		else
		{
			OLD_VALUE_POOL[idx][1] = true;
		}
	}
}

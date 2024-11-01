// Copyright 2000-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behEffectShake;

var ID_LIST;              // list of available IDs in the current document
var OLD_VALUE_POOL;           // saves the old values and the sync state of the text fields


//******************* BEHAVIOR FUNCTION **********************

// Adds an Shake-Effect to the element.
// Accepts the following argument:
//  obj         - ID or JavaScript DOM object of target element
//  method      - effect
//  effect      - "shake"
//  direction   - "left"|"right"|"up"|"down"
//  distance    - distance to shake
//  times       - Number of times the effect is to be executed
//  speed       - speed or duration of the effect
function MM_DW_effectShake(obj,method,effect,direction,distance,times,speed)
{
    obj[method](effect, {direction:direction,distance:distance,times:times}, speed);
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
	var retVal = "onClick,onMouseUp,onMouseDown,(onClick)";  // default is onClick
	return retVal;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
    return "MM_DW_effectShake";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior()
{
    dw.logEvent(UT_JQUERY_SHAKE_EFFECT, UT_JQUERY_SHAKE_EFFECT_APPLY);
	var theDOM = dw.getDocumentDOM();

	// first we check if the <head> tag is in a locked region -> effect can't be added
	if(!theDOM.isHeadEditable())
		return dwscripts.sprintf(dw.loadString('spry/alert/lockedHeadRegion'), theDOM.getAttachedTemplate());

	var selIdx         = document.theForm.pageEltObj.selectedIndex;
	var selValue       = document.theForm.pageEltObj.options[selIdx].value;
	var includeLibrary = true;
	var retVal;

	if(selValue=="default") // no target element selected
	{
		includeLibrary = false;
		retVal = MSG_SelectTargetOrCancel;
	}
	else if(selValue=="this") // effect is assigned to the behavior element
	{
	    retVal = "MM_DW_effectShake($(this),'effect','shake','" + document.theForm.directionTypeObj.options[document.theForm.directionTypeObj.selectedIndex].value + "'," + document.theForm.distanceObj.value + "," + document.theForm.timesObj.value + "," + document.theForm.speedObj.value + ")";
	}
	else // behavior element triggers effect which is assigned to a target element
	{
		var refIdx = parseInt(selValue);
		retVal = "MM_DW_effectShake($('#" + ID_LIST[refIdx] + "')," + "'effect','shake','" + document.theForm.directionTypeObj.options[document.theForm.directionTypeObj.selectedIndex].value + "'," + document.theForm.distanceObj.value + "," + document.theForm.timesObj.value + "," + document.theForm.speedObj.value + ")";
	}

	if(includeLibrary)
		effectsUtils.addLibraryInclude(); // make sure SpryEffects.js-lib is available

	return retVal;
}


//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
    dw.logEvent(UT_JQUERY_SHAKE_EFFECT, UT_JQUERY_SHAKE_EFFECT_INSPECT);
    var argArray = extractExprStr(fnStr);
  if (argArray.length == 7) { // we expect argArray to contain 7 elements -> targetElement,effect(keyword),method,direction,distance,times,speed
	var selIdx  = 0;
	var targetElement = effectsUtils.stripWhitespaces(unescExprStr(argArray[0],false).toLowerCase());

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
		while(!found && i>=0)
		{
			if(ID_LIST[i].toLowerCase()==idValue)
				found = true;
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
	var directionIdx = (argArray[3] == "left") ? 0 : (argArray[3] == "right") ? 1 : (argArray[3] == "up") ? 2 : 3;
	var distanceValue = effectsUtils.stripWhitespaces(unescExprStr(argArray[4], false));
	var timesValue = effectsUtils.stripWhitespaces(unescExprStr(argArray[5], false));
	var speedValue = effectsUtils.stripWhitespaces(unescExprStr(argArray[6], false));


	document.theForm.directionTypeObj.selectedIndex = directionIdx;
	document.theForm.distanceObj.value = parseFloat(distanceValue);
	document.theForm.timesObj.value = parseFloat(timesValue);
	document.theForm.speedObj.value = parseFloat(speedValue);

	document.theForm.pageEltObj.focus();  // set focus on popup
  }
}


// Removes the reference to SpryEffects.js if it's no longer used.

function deleteBehavior(fnCallStr)
{
	initGlobals();
	effectsUtils.removeLibraryIncludeIfUnused();
}


//***************** LOCAL FUNCTIONS  ******************


//initializes the User Interface with default values

function initializeUI()
{
    dw.logEvent(UT_JQUERY_SHAKE_EFFECT, UT_JQUERY_SHAKE_EFFECT_INITIALIZE);
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


	// there are potential elements to which the Shake Effect can be applied to
	document.theForm.pageEltObj.innerHTML = option_entries.join("");

	document.theForm.pageEltObj.selectedIndex = 0;
	document.theForm.directionTypeObj.selectedIndex = 0;
	document.theForm.timesObj.value = "3";  // default value is 3 i.e. the object will shake for 3 times
	document.theForm.distanceObj.value = "20";  // default value is 20. i.e. the distance to shake
	document.theForm.speedObj.value = "1000"; // duration time of applying the effect (in milliseconds)

	document.theForm.pageEltObj.focus();  // set focus on popup
}


// initializes the global vars
//
function initGlobals()
{
	ID_LIST = new Array();
	OLD_VALUE_POOL = new Array(["", true], ["", true], ["", true]); // saves the old values of the text fields
}

// Stores the value of the text field
//
function storeValue(idx, objectNode) {
    if (objectNode && idx >= 0 && idx < OLD_VALUE_POOL.length && OLD_VALUE_POOL[idx][1])
        OLD_VALUE_POOL[idx][0] = objectNode.value;
}


// Checks if the duration-value is valid (digits only).
// If the value is not valid a info message appears.
function checkDuration(idx, objectNode) {
    OLD_VALUE_POOL[idx][1] = false;

    if (objectNode && idx >= 0 && idx < OLD_VALUE_POOL.length) {
        var value = objectNode.value;

        if (!effectsUtils.onlyDigits(value)) {
            var message = MSG_NotAValidValue;
            message = message.replace('%1', value);
            alert(message);

            objectNode.value = OLD_VALUE_POOL[idx][0];
        }
        else {
            OLD_VALUE_POOL[idx][1] = true;
        }
    }
}
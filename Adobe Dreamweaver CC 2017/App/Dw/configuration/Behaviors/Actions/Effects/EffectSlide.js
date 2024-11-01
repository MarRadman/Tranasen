// Copyright 2000-2007 Adobe Systems Incorporated.  All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behEffectSlide;

var ID_LIST;              // list of available IDs in the current document
var STATE_LIST;           // holds the string/value-pairs for the two effects
var OLD_VALUE_POOL;           // saves the old values and the sync state of the text fields


//******************* BEHAVIOR FUNCTION **********************

// Adds an Slide Up/Down-Effect to the element.
// Accepts the following arguments:
//  targetElement - ID or JavaScript DOM object of target element
//  method        - "show"|"hide"|"toggle"
//  direction     - "left"|"right"|"up"|"down"
//  distance      - distance to which the effect is applied
//  mode          - "show"|"hide"
//  speed         - speed or duration of the effect
//
function MM_DW_effectSlide(obj,method,effect,direction,distance,speed)
{
    obj[method](effect, { direction: direction, distance: distance}, speed);
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
	var retVal = "onClick,onMouseUp,onMouseDown,(onClick)";  // default is onClick
	return retVal;
}


//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_DW_effectSlide";
}


//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior()
{
    dw.logEvent(UT_JQUERY_SLIDE_EFFECT, UT_JQUERY_SLIDE_EFFECT_APPLY);
	var theDOM = dw.getDocumentDOM(); // DOM of the current document

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
		var selObj = dw.getBehaviorElement();
		if(!selObj)
			selObj = dw.getDocumentDOM().getSelectedNode();
        retVal = "MM_DW_effectSlide($(this),'" + document.theForm.effectTypeObj.options[document.theForm.effectTypeObj.selectedIndex].value + "','" + "slide" + "','" + document.theForm.directionTypeObj.options[document.theForm.directionTypeObj.selectedIndex].value + "'," + document.theForm.distanceObj.value + "," + document.theForm.durationObj.value + ")";
	}
	else // behavior element triggers effect which is assigned to a target element
	{
		var refIdx = parseInt(selValue);
		retVal = "MM_DW_effectSlide($('#" + ID_LIST[refIdx] + "'),'" + document.theForm.effectTypeObj.options[document.theForm.effectTypeObj.selectedIndex].value + "','" + "slide" + "','" + document.theForm.directionTypeObj.options[document.theForm.directionTypeObj.selectedIndex].value + "'," + document.theForm.distanceObj.value + "," + document.theForm.durationObj.value + ")";
	}

	if(includeLibrary)
		effectsUtils.addLibraryInclude(); // make sure SpryEffects.js-lib is available

	return retVal;
}


//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
    dw.logEvent(UT_JQUERY_SLIDE_EFFECT, UT_JQUERY_SLIDE_EFFECT_INSPECT);
    var argArray = extractExprStr(fnStr);
  if (argArray.length == 6) { // we expect 7 args -> targetElement, method, effect, direction, distance, duration/speed
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

	var effectIdx = (argArray[1] == "show") ? 0 : (argArray[1] == "hide") ? 1 : 2;
	var directionIdx = (argArray[3] == "left") ? 0 : (argArray[3] == "right") ? 1: (argArray[3] == "up") ? 2 : 3;
	var distanceValue = effectsUtils.stripWhitespaces(unescExprStr(argArray[4], false));
	var durationValue = effectsUtils.stripWhitespaces(unescExprStr(argArray[5], false));

	document.theForm.effectTypeObj.selectedIndex = effectIdx;
	document.theForm.directionTypeObj.selectedIndex = directionIdx;
	document.theForm.durationObj.value = parseFloat(durationValue);
	document.theForm.distanceObj.value = parseFloat(distanceValue);

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
    dw.logEvent(UT_JQUERY_SLIDE_EFFECT, UT_JQUERY_SLIDE_EFFECT_INITIALIZE);
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

	// there are potential elements to which the Slide Up/Down Effect can be applied to
	document.theForm.pageEltObj.innerHTML = option_entries.join("");

	document.theForm.pageEltObj.selectedIndex = 0;

	//
	// set default values to the rest of the input fields
	//
	document.theForm.durationObj.value = "1000"; // duration time of applying the effect (in milliseconds)

	var selIdx = 0; // Slide Up/Down

	document.theForm.effectTypeObj.selectedIndex = selIdx;
	document.theForm.distanceObj.value = "20";
	document.theForm.directionTypeObj.selectedIndex = 0;

	document.theForm.pageEltObj.focus();  // set focus on popup
}


// initializes the global vars
//
function initGlobals()
{
	ID_LIST = new Array();
	STATE_LIST               = new Array([MSG_SlideUpFrom  , MSG_SlideUpTo  , 100,   0, 0, 0],   // holds the string/value/type-infos for the two effects
										 [MSG_SlideDownFrom, MSG_SlideDownTo,   0, 100, 0, 0]);
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


// Checks if the value is valid (digits only)
// If the value is not valid a info message appears.
function checkFromToValue(idx, objectNode)
{
	OLD_VALUE_POOL[idx][1] = false;

	if(objectNode && idx >= 0 && idx < OLD_VALUE_POOL.length)
	{
		var value = objectNode.value;

		if(!effectsUtils.onlyDigits(value, false, true))
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


// returns the index of the optionRoot which fits to the checkString
//
function getOptionIndex(optionRoot, checkString)
{
	if(optionRoot && checkString)
	{
		var optionsCount = optionRoot.options.length;
		for(var i=0; i<optionsCount; i++)
			if(checkString.indexOf(optionRoot.options[i].value) >= 0)
				return i;
	}

	return -1;
}


// checks if the given element has a single content tag-child
//
function singleChildContentTagExists(element)
{
  // Define a list of alloed tags for the inner content tag. There should be one and only one of these tags as element child
  var allowedContentTags = ["blockquote", "dd", "div", "form", "center", "table", "span", "input", "textarea", "select", "img"];

	if(element == undefined || element == null)
		return false;

	if(element.hasChildNodes())
	{
		var childCnt = element.childNodes.length;
		var eltCount = 0;

		for(var i=0; i<childCnt; i++)
		{
			var potChildCurr = element.childNodes[i];
			var nodeType     = potChildCurr.nodeType;
			if(nodeType == 1) // element node
			{
				tagNameStr = potChildCurr.tagName.toLowerCase();
        if(dwscripts.findInArray(allowedContentTags, tagNameStr) == -1)
					return false;

				if(eltCount == 0)
					eltCount++
				else
					return false;
			}
			else if(nodeType == 3) // Node.TEXT_NODE
			{
				if(potChildCurr.data.search(/\S/) >= 0) // there is a non whitespace character available
					return false;
			}
		}

		if(eltCount==1)
			return true;
	}

	return false;
}

// changes the values of the to- and from-fields and chnages the according effect descriptions
//
function changeFromTo()
{
	var selIdx = document.theForm.effectTypeObj.selectedIndex;

	document.theForm.fromTxtObj.innerHTML = STATE_LIST[selIdx][0];
	document.theForm.toTxtObj.innerHTML   = STATE_LIST[selIdx][1];

	var buffer = document.theForm.fromObj.value;

	document.theForm.fromObj.value = document.theForm.toObj.value;
	document.theForm.toObj.value   = buffer;

	selIdx = document.theForm.fromTypeObj.selectedIndex;
	document.theForm.fromTypeObj.selectedIndex = document.theForm.toTypeObj.selectedIndex;
	document.theForm.toTypeObj.selectedIndex   = selIdx;
}

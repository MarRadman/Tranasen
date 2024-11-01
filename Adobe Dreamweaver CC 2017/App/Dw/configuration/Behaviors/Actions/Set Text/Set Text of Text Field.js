// Copyright 2000-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behSetTextOfTextField;

//******************* BEHAVIOR FUNCTION **********************

//Passed a textfield name and a string, replaces textfield text.

function MM_setTextOfTextfield(objId,x,newText) { //v9.0
  with (document){ if (getElementById){
    var obj = getElementById(objId);} if (obj) obj.value = newText;
  }
}

MM.VERSION_MM_setTextOfTextfield = 9.0; //define latest version number for behavior inspector

//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  var dom = dw.getDocumentDOM();
  var tags = dom.getElementsByTagName('TEXTAREA');
  if (tags.length > 0)
    return true;
  tags = dom.getElementsByTagName('INPUT');
  for (var i=0; i < tags.length; i++){
    var inputType = tags[i].getAttribute("type");
    if (inputType && (inputType.toLowerCase() == "text" || inputType.toLowerCase() == "password"))
      return true;
  }
  return false;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_setTextOfTextfield";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>
//Calls escQuotes to find embedded quotes and precede them with \

function applyBehavior() {
  // Initialize msgStr and reVal to empty string.  
  var msgStr = "",retVal="";
  with (document.theForm) {
    var menuIndex = menu.selectedIndex;
    var objId = document.MM_FIELD_IDS[menuIndex];
    msgStr = escExprStr(message.value,false);
  }
  
  // Handle error conditions (field with no id,
  // braces within message).
  if (objId.indexOf(MM.LABEL_Unidentified) == 0) retVal = MSG_UnnamedTextfield;
  else if (msgStr == null) retVal = MSG_BadBraces;
  else {
    objId = getNameFromRef(objId);
    updateBehaviorFns("MM_setTextOfTextfield");
    retVal = "MM_setTextOfTextfield('" + objId + "','','" + msgStr + "')";
  }
  return retVal
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
  // Extract the arguments from the function call.
  var argArray = extractExprStr(fnStr);

  if (argArray.length == 3) {
    // The id of the text field
    var objId = argArray[0];

    // The number of text fields in the document
    var numFields = document.MM_FIELD_IDS.length;

    // Now check whether the field is already in the list
    var found = false;
    for (var i=0; i < numFields; i++){ 
      if (objId == document.MM_FIELD_IDS[i]){
        document.theForm.menu.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) alert(errMsg(MSG_TextfieldNotFound,objId));

    // Populate message (New text) field, converting all string expressions 
    // to {expression} etc.
    document.theForm.message.value = unescExprStr(argArray[2],false);
  }
}



//Returns a dummy function call to inform Dreamweaver the type of certain behavior
//call arguments. This information is used by DW to fixup behavior args when the
//document is moved or changed.
//
//It is passed an actual function call string generated by applyBehavior(), which
//may have a variable list of arguments, and this should return a matching mask.
//
//The return values are:
//  objId:  argument is simple object name, such as "textfield1"
//  other...: argument is ignored

function identifyBehaviorArguments(fnCallStr) {
  var argArray, retVal="", fullObjRef;;

  argArray = extractArgs(fnCallStr);
  fullObjRef = (argArray[1].indexOf(".")!=-1);
  if (argArray.length == 4) {
    retVal = (fullObjRef)?"NS4.0ref,IE4.0ref,other" : "objId,other,other";
  }
  return retVal;
}

//***************** LOCAL FUNCTIONS  ******************


//Load up the textfields, set the insertion point

function initializeUI(){
  var dom = dw.getDocumentDOM();
  
  // Get all the text/textarea/password form elements in the document
  var elementArray = new Array();
  elementArray = elementArray.concat(dom.getElementsByTagName("INPUT"));
  elementArray = elementArray.concat(dom.getElementsByTagName("TEXTAREA"));
  var displayNames = new Array();
  document.MM_FIELD_IDS = new Array();

  // As we're pushing the relevant tags into the displayNames and
  // MM_FIELD_IDS arrays, make a note of which ones
  // have ids and which don't. 
  for (var i=0; i < elementArray.length; i++){
    var elem = elementArray[i];
    var elemType = elem.getAttribute("type");
    if (elem.tagName == "TEXTAREA" || (elemType && (elemType.toLowerCase() == "text" || elemType.toLowerCase() == "password"))){
      var elemId = elem.getAttribute("id");
      if (elemId){
        displayNames.push(elem.tagName.toLowerCase() + ' "' + elemId + '"');
        document.MM_FIELD_IDS.push(elemId);
		  }
      else {
        displayNames.push(elem.tagName.toLowerCase() + ' ' + MM.LABEL_Unidentified);
        document.MM_FIELD_IDS.push(MM.LABEL_Unidentified);
		  }
		}
	}
	with (document.theForm.menu) {
    for (var i=0; i < displayNames.length; i++){
      options[i] = new Option(displayNames[i]);
    }
		selectedIndex = 0;
	}
}

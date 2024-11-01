// Copyright 1998-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

//*************** GLOBAL VARS  *****************

var helpDoc = MM.HELP_behValidateForm;

//******************* BEHAVIOR FUNCTION **********************

//Validates a form by checking the values in multiple text fields.
//Accepts a variable number of args, in pairs as follows:
//  objName  - simple object name, or object ref for Netscape (ex: document.myForm.Email)
//  x        - ignored (for backward compatibility)
//  theCheck - what to check: [R|N][isEmail|isNum|inRange<fromNum>:<toNum>], where:
//                R       - some value is Required (non-empty)
//                N       - value is Not required
//                isEmail - value must have an @ with at least 1 char before & after (x@y)
//                isNum   - value must be a number
//                inRange - value is between the two numbers, inclusive
//             Examples:
//               user must enter *something*:     R
//               a required Email field:          RisEmail
//               an optional Age field:           NisNum
//               a required # of orders, max 100: RinRange1:100
//
//Finds the object.
//Gets the value from the text input or text area and runs the check as follows:
//  if the field is not empty
//    if theCheck is "isEmail", ensure we have at least x@y, else give error
//    else if theCheck isn't just "R", all that's left is isNum or inRange
//      if field is not a number give error
//      else if field not in range give error
//  else if theCheck is "R" give error
//Batches up all error values and returns them in a single alert() dialog.
//Also, sets the global return value to false. If this Action is paired with the onSubmit
//message, it can prevent the form from submitting if there are errors.

function MM_validateForm() { //v4.0
  if (document.getElementById){
    var i,p,q,nm,test,num,min,max,errors='',args=MM_validateForm.arguments;
    for (i=0; i<(args.length-2); i+=3) { test=args[i+2]; val=document.getElementById(args[i]);
      if (val) { nm=val.name; if ((val=val.value)!="") {
        if (test.indexOf('isEmail')!=-1) { p=val.indexOf('@');
          if (p<1 || p==(val.length-1)) errors+='- '+nm+' must contain an e-mail address.\n';
        } else if (test!='R') { num = parseFloat(val);
          if (isNaN(val)) errors+='- '+nm+' must contain a number.\n';
          if (test.indexOf('inRange') != -1) { p=test.indexOf(':');
            min=test.substring(8,p); max=test.substring(p+1);
            if (num<min || max<num) errors+='- '+nm+' must contain a number between '+min+' and '+max+'.\n';
      } } } else if (test.charAt(0) == 'R') errors += '- '+nm+' is required.\n'; }
    } if (errors) alert('The following error(s) occurred:\n'+errors);
    document.MM_returnValue = (errors == '');
} }

MM.VERSION_MM_validateForm = 4.0; //define latest version number for behavior inspector

//******************* API **********************


//Checks for the existence of text fields.
//If none exist, returns false so this Action is grayed out.

function canAcceptBehavior(tagStr,eventStr){
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
  return "MM_validateForm";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior() {
  var curFormNum,menuLength,chkStr,objId,retArgs = "";

  //scan fieldMenu for values
  menuLength = document.theForm.fieldMenu.options.length;
  for (var i=0; i<menuLength; i++) {
    chkStr = getMenuValue(eval(i));
    if (chkStr) {
      //found a value, package up the string
      objId = document.MM_FIELD_IDS[i];

      if (objId.indexOf(MM.LABEL_Unidentified) == 0)  //if unidentified reference
        return MSG_UnidentifiedField;
        
      else if (objId.indexOf('_NEEDS_ID') != -1)
      {
        objId = objId.substring(0,objId.indexOf('_NEEDS_ID'));
        document.MM_FORM_ELTS[i].setAttribute("id",objId);
        document.MM_FIELD_IDS[i] = objId;
      } 

      if (retArgs) retArgs += ","; //add comma if necessary
      retArgs += "'" + objId + "','','" + chkStr + "'";
    }
  }
  if (retArgs) {
    updateBehaviorFns("MM_validateForm");
    return "MM_validateForm(" + retArgs + ")";  //return fn call with args
  }
  else return MSG_NoFieldsSet;
}



//Returns a dummy function call to inform Dreamweaver the type of certain behavior
//call arguments. This information is used by DW to fixup behavior args when the
//document is moved or changed.
//
//It is passed an actual function call string generated by applyBehavior(), which
//may have a variable list of arguments, and this should return a matching mask.
//
//The return values are:
//  URL     : argument could be a file path, which DW will update during Save As...
//  NS4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  IE4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  other...: argument is ignored

function identifyBehaviorArguments(fnCallStr) {
  var argList, argArray, numArgGroups, i;

  argList = "";
  argArray = extractArgs(fnCallStr);
  numArgGroups = (argArray.length - 1) / 3; //args come in triplets
  for (i=0; i<numArgGroups; i++) {          //with each NSobj,IEobj,test triplet
    if (argList) argList += ",";
    argList += (argArray[3*i+1].indexOf(".")==-1)? "objName,other,other" : "NS4.0ref,IE4.0ref,other";
  }
  return argList;
}



//Given the original function call, this parses out the args and updates
//the UI.

function inspectBehavior(upStr){
  var argArray,numArgs,found,numTokens,theChk;
  var objId = "";

  argArray = extractArgs(upStr);  //get new list of Field,Chk pairs
  numArgs = argArray.length;
  for (var i=1; i<(numArgs-2); i+=3) { //with each objId, FieldIE, Chk triplet
    objId = argArray[i];
    theChk = argArray[i+2];

    //Now that form is there, look for field name
    found = false;
    numFields = document.MM_FIELD_IDS.length;
    for (var j=0; j<numFields; j++) { //check if Field is in menu
      if (objId == document.MM_FIELD_IDS[j]) { //if Field there
        addValueToMenuItem(document.theForm.fieldMenu,j,theChk);
        found = true;
        break;
    } }
    if (!found) alert(errMsg(MSG_FldNotFound,objId,theChk)); //if Field name not found
  }
  document.theForm.fieldMenu.selectedIndex = 0;
  displaySelection();
}



//***************** LOCAL FUNCTIONS  ******************


function initializeUI(){
  var dom = dw.getDocumentDOM();
  
  // Get all the text/textarea/password form elements in the document
  var elementArray = new Array();
  elementArray = elementArray.concat(dom.getElementsByTagName("INPUT"));
  elementArray = elementArray.concat(dom.getElementsByTagName("TEXTAREA"));
  var displayNames = new Array();
  document.MM_FIELD_IDS = new Array();
  document.MM_FORM_ELTS = new Array();

  // As we're pushing the relevant tags into the displayNames and
  // MM_FIELD_IDS arrays, make a note of which ones
  // have ids and which don't. 
  for (var i=0; i < elementArray.length; i++){
    var elem = elementArray[i];
    var elemType = elem.getAttribute("type");
    if (elem.tagName == "TEXTAREA" || (elemType && (elemType.toLowerCase() == "text" || elemType.toLowerCase() == "password"))){
      document.MM_FORM_ELTS.push(elem);
      var elemId = elem.getAttribute("id");
      if (elemId){
        displayNames.push(elem.tagName.toLowerCase() + ' "' + elemId + '"');
        document.MM_FIELD_IDS.push(elemId);
		  }
      else {
        var elemName = elem.getAttribute("name");
        if (elemName){
          displayNames.push(elem.tagName.toLowerCase() + ' "' + elemName + '"');
          document.MM_FIELD_IDS.push(elemName + "_NEEDS_ID");
        }
        else{
          displayNames.push(elem.tagName.toLowerCase() + ' ' + MM.LABEL_Unidentified);
          document.MM_FIELD_IDS.push(MM.LABEL_Unidentified);
        }
      }
    }
  }

	with (document.theForm.fieldMenu) {
    for (var i=0; i < displayNames.length; i++){
      options[i] = new Option(displayNames[i]);
    }
		selectedIndex = 0;
	}
}



// Given an index into select "fieldMenu", returns any value in parens

function getMenuValue(menuIndex){
  var checkStr,menuStr,startPos;

  checkStr = "";
  menuStr = document.theForm.fieldMenu.options[menuIndex].text;
  startPos = menuStr.indexOf("(");
  if (startPos != -1)    //get previous check string
    checkStr = menuStr.substring(startPos+1,menuStr.lastIndexOf(")"));
  return checkStr;
}



//Given a new text field has been selected in the menu,
//loads the correct validation check settings into the checkboxes.

function displaySelection() {
  var isReqd,theRadio,curFieldNum,menuStr,colonPos;

  isReqd = false;  //default settings
  theRadio = 0;
  curFieldNum = document.theForm.fieldMenu.selectedIndex; //get selected index
  menuStr = getMenuValue(curFieldNum);  //get selection's value (in parens)
  document.theForm.fromNum.value = "";
  document.theForm.toNum.value = "";
  if (menuStr) {
    isReqd = (menuStr.charAt(0)=="R");  //true if R, false if N
    if (menuStr.length > 1) {
      if (menuStr.indexOf("isNum")!= -1) {theRadio = 1}
      if (menuStr.indexOf("isEmail")!= -1) {theRadio = 2}
      if (menuStr.indexOf("inRange")!= -1) {
        theRadio = 3;
        colonPos = menuStr.indexOf(':');
        document.theForm.fromNum.value = menuStr.substring(8,colonPos);
        document.theForm.toNum.value = menuStr.substring(colonPos+1,menuStr.length);
      }
    }
  }
  document.theForm.isReqd.checked = isReqd;  //check Required box
  for (i=0; i<document.theForm.theCheck.length; i++)
    document.theForm.theCheck[i].checked = (theRadio == i);
}



//Given a selection change, gets the values from the checkboxes/radios etc.
//and stores the checks in the menu next to the previous selected text field.

function saveCheckToMenu(newChk) {
  var curFieldNum,isReqd,thingToAddToMenu;

  curFieldNum = document.theForm.fieldMenu.selectedIndex; //get index to swap
  if (curFieldNum != null)  //if something selected
    if (document.theForm.fieldMenu.options[curFieldNum].text) { //if there's a menu item
      isReqd = (document.theForm.isReqd.checked)? "R" : "N";  //first char, R for required fld
      if (newChk == "required") { //if they hit the "required" checkbox
        newChk = getMenuValue(curFieldNum);
        if (newChk) newChk = newChk.substring(1,newChk.length); //skip first char (R or N)
      }
      thingToAddToMenu = (isReqd == "N" && newChk == "")?"":isReqd+newChk; //concat R/N and check
      addValueToMenuItem(document.theForm.fieldMenu, curFieldNum, thingToAddToMenu);
      document.theForm.fieldMenu.selectedIndex = curFieldNum; //reset selection index
    } else alert(MSG_NoSelection);
}



//if the Range radio btn is not checked, do nothing
//else if either entry is not a number, do nothing
//else if a < b, construct range string
//else give error

function saveRangeToMenu(newChk,fromRadio){
  var fromNum,toNum,i,theRadio,rangeStr;

  if (document.theForm.theCheck[3].checked) { //if the radio is checked
    fromNum = parseFloat(document.theForm.fromNum.value); //get from number
    toNum = parseFloat(document.theForm.toNum.value); //get to number
    if (!isNaN(fromNum) && !isNaN(toNum)) { //if valid numbers
      if (fromNum <= toNum) {
        rangeStr = newChk + fromNum + ":" + toNum;
        saveCheckToMenu(rangeStr);
      } else {
        saveCheckToMenu('');
        if (fromRadio) alert(MSG_InvalidRange);
      }
    } else saveCheckToMenu('');
  }
}

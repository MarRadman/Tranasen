// Copyright 2000-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behSetTextOfStatusBar;

//******************* BEHAVIOR FUNCTION **********************

//Displays a message in the status bar at the bottom of the
//browser window. Passed the following arg:
//  msgStr - a string
//
//This simple function, passed a string, sets the status property.
//This is especially useful for having links display a help message when
//the mouse is over them. Normally, links display the HREF value, unless
//we return "true". Because we could have many actions to a single event,
//here we set a global return value, which gets returned after all
//Action function calls, with an inserted "return(document.MM_returnValue)".

function MM_displayStatusMsg(msgStr) { //v1.0
  window.status=msgStr;
  document.MM_returnValue = true;
}


//******************* API **********************


//Can be used with any tag and any event

function canAcceptBehavior(){
  var retVal = "onMouseOver,(onMouseOver),onClick,(onClick)"; //default events
  return retVal;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_displayStatusMsg";
}



//Returns fn call to insert in HTML tag <TAG... onEvent='thisFn(arg)'>

function applyBehavior() {
  var index,frameObj,presBg,msgStr="",retVal;
  with (document.theForm) {
    msgStr = escExprStr(message.value,false);
  }
  if (msgStr == null) retVal = MSG_BadBraces;
  else retVal = "MM_displayStatusMsg('"+msgStr+"')";
  return retVal
}



//Passed the function call above, takes prior arguments and reloads the UI.
//Removes any escape characters "\"

function inspectBehavior(fnStr){
  var argArray, msgStr;
 
  argArray = extractExprStr(fnStr);
  if (argArray.length == 1) { //expect 1 arg
    document.theForm.message.value = unescExprStr(argArray[0],false);
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Load up the frames, set the insertion point

function initializeUI(){
  document.theForm.message.focus(); //set focus on textbox
  document.theForm.message.select(); //set insertion point into textbox
}

//////////////////////////////////////////////////////////////////////////////////////////////
//
// ADOBE CONFIDENTIAL
// ___________________
//
//  Copyright 2014 Adobe Systems Incorporated
//  All Rights Reserved.
//
// NOTICE:  All information contained herein is, and remains
// the property of Adobe Systems Incorporated and its suppliers,
// if any.  The intellectual and technical concepts contained
// herein are proprietary to Adobe Systems Incorporated and its
// suppliers and are protected by trade secret or copyright law.
// Dissemination of this information or reproduction of this material
// is strictly forbidden unless prior written permission is obtained
// from Adobe Systems Incorporated.
//////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////
// Summary Comment
// Code to handle brackets.json preferences file
//////////////////////////////////////////////////////////////////////////////////////////////

/*jslint plusplus: true */
/*global alert: false, console: false, window: false, document: false, dw: false, dwscripts:false, site:false, DWfile: true */

var prefsFileName = "",
    JSONString = "";

//constants
var PRETTY_PRINT_SPACES = "    ";

/*
* Recursively merge properties of two objects 
*/
function MergeObjects(obj1, obj2) {
    "use strict";
    var prop;
    for (prop in obj2) {
        try {
            // Property in destination object set; update its value.
            if (obj2[prop].constructor === Object) {
                obj1[prop] = MergeObjects(obj1[prop], obj2[prop]);
            } else {
                obj1[prop] = obj2[prop];
            }
        } catch (e) {
            // Property in destination object not set; create it and set its value.
            obj1[prop] = obj2[prop];
        }
    }
    return obj1;
}

function readPreferencesFile() {
    "use strict";
    if (DWfile.exists(prefsFileName)) {
		return DWfile.read(prefsFileName);
    }
    return "{}";
}

function writePreferencesFile(preferenceJSON) {
    "use strict";
    DWfile.write(prefsFileName, preferenceJSON);
}

function setPreference() {
    "use strict";
    var existingPreference = JSON.parse(readPreferencesFile()),
        changedPreferencesArray = JSON.parse(JSONString),
        changedPreferences = {},
        i = 0;
    for (i = 0; i < changedPreferencesArray.length; i++) {
        changedPreferences = MergeObjects(changedPreferences, changedPreferencesArray[i]);
    }
    writePreferencesFile(JSON.stringify(MergeObjects(existingPreference, changedPreferences), null, PRETTY_PRINT_SPACES));
}
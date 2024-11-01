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

var packageJSONFile = "",
    JSONString = "",
    newThemeName = "",
    newThemeTitle = "";

//constants
var PRETTY_PRINT_SPACES = "    ";


function writeThemePackageJSONFile() {
    "use strict";
    var themePackageJSON,
        i = 0;
    themePackageJSON = {};
    try {
        themePackageJSON = JSON.parse(JSONString);
    } catch (e) {
        themePackageJSON.theme = {
            "file": "main.less"
        };
    }
    themePackageJSON.name = newThemeName;
    themePackageJSON.title = newThemeTitle;
    DWfile.write(packageJSONFile, JSON.stringify(themePackageJSON, null, PRETTY_PRINT_SPACES));
}
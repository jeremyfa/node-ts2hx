
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var glob = require('glob');
var ts2hx = require('./ts2hx');
var tsOrderer = require('ts-orderer');

exports.compileDirectories = function(tsPath, hxPath, excludePath, destPath, verbose) {

    var log;
    if (verbose) {
        log = function(str) {
            process.stdout.write(str + "\n");
        };
    } else {
        log = function(str) {
            // Log nothing
        };
    }

    // Compute path of all ts files
    var tsFiles = tsOrderer(tsPath);
    if (excludePath) {
        var newTsFiles = []
        for (var i = 0; i < tsFiles.length; i++) {
            var file = tsFiles[i];
            if (file.substring(0, excludePath.length) !== excludePath) {
                newTsFiles.push(file);
            }
        }
        tsFiles = newTsFiles;
    }

    // Remove prefix
    for (var i = 0; i < tsFiles.length; i++) {
        tsFiles[i] = tsFiles[i].substring(tsPath.length + 1);
    }

    // Compute path of all hx files
    var hxFiles = glob.sync(hxPath+'/**/*.hx');

    // Remove prefix of hx files
    for (var i = 0; i < hxFiles.length; i++) {
        hxFiles[i] = hxFiles[i].substring(hxPath.length + 1);
    }

    // Compute all relative paths without extension
    var allFileNames = [];
    for (var i = 0; i < hxFiles.length; i++) {
        var file = hxFiles[i].substring(0, hxFiles[i].length - 3);
        if (allFileNames.indexOf(file) == -1) {
            allFileNames.push(file);
        }
    }
    for (var i = 0; i < tsFiles.length; i++) {
        var file = tsFiles[i].substring(0, tsFiles[i].length - 3);
        if (allFileNames.indexOf(file) == -1) {
            allFileNames.push(file);
        }
    }

    // Create destination directory if needed
    fse.ensureDirSync(destPath);

    // Copy Ts2Hx
    log('copy Ts2Hx.hx');

    var bridgeFilePath = path.normalize(__dirname + '/../support/Ts2Hx.hx');
    var finalBridgePath = destPath + '/Ts2Hx.hx';
    if (fs.existsSync(finalBridgePath)) {
        fs.unlinkSync(finalBridgePath);
    }

    fse.copySync(bridgeFilePath, finalBridgePath);

    // Info object that gets filled at each parsing
    var info = {};

    // Iterate over each file and either copy the existing
    // haxe file or compile the typescript file
    for (var i = 0; i < allFileNames.length; i++) {
        var fileName = allFileNames[i];

        var haxeFilePath = hxPath+'/'+fileName+'.hx';
        var tsFilePath = tsPath+'/'+fileName+'.ts';

        if (fs.existsSync(haxeFilePath)) {
            // Copy existing haxe file
            log('copy '+fileName+'.hx');

            var finalFilePath = hxPath+'/'+fileName+'.hx';
            finalFilePath = destPath + finalFilePath.substring(finalFilePath.lastIndexOf('/'));

            if (fs.existsSync(finalFilePath)) {
                fs.unlinkSync(finalFilePath);
            }

            fse.copySync(haxeFilePath, finalFilePath);
        }
        else {
            var finalFilePath = tsPath+'/'+fileName+'.hx';
            var simpleFilePath = finalFilePath.substring(finalFilePath.lastIndexOf('/') + 1);
            finalFilePath = destPath + '/' + simpleFilePath;

            // Compile ts file
            log('compile '+fileName+'.ts -> '+simpleFilePath);

            var tsCode = String(fs.readFileSync(tsFilePath));
            var hxCode = ts2hx(tsCode, info);

            if (fs.existsSync(finalFilePath)) {
                fs.unlinkSync(finalFilePath);
            }

            fs.writeFileSync(finalFilePath, hxCode);
        }
    }
};

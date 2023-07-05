#! /usr/bin/env node

// test-runner.js
// A script to automate building and testing of your programs
// v2.1.0
// https://github.com/max8539/test-runner

// This script requires Node.js to be installed on your system.

// To run this script while in its directory:
// $ node test-runner.js
// or (Linux/macOS/UNIX-like systems only)
// $ ./test-runner.js

// Alternately, on Linux/macOS/UNIX-like systems, you can add the directory 
// containing test-runner.js to PATH, then simply run the script from any
// directory as follows, provided that you have created a valid testconfig.json
// file in that directory.
// $ test-runner.js

// test-runner.js Copyright (C) 2022-2023 Max Yuen & collaborators. 
// Licensed under the Apache License, Version 2.0 (the "License"); you may not 
// use this software except in compliance with the License. You may obtain a 
// copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT 
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the 
// License for the specific language governing permissions and limitations 
// under the License.

console.log("test-runner.js v2.1.0\n");

class userError extends Error{};
class failureExit extends Error{};

const fs = require("fs");
const { spawnSync } = require("child_process");

let config;

// These character sequences instruct the terminal
// to display coloured bold text
const RED = "\x1b[31m\x1b[1m";
const YELLOW = "\x1b[33m\x1b[1m";
const GREEN = "\x1b[32m\x1b[1m";
const RESET = "\x1b[0m";

// Functions for printing text based on 
// verbosity level in testconfig.json
function vb (text) {
    if (config.verbose != 0) {
        console.log(text)
    }
}
function vbError (text) {
    if (config.verbose != 0) {
        console.error(text)
    }
}
function vvb (text) {
    if (config.debug || config.verbose == 2) {
        console.log(text)
    }
}

// Check that a given array of commands appears to be valid
function checkCmdArr (arr, ref) {
    if (typeof(arr.length) != "number" || arr.length < 0) {
        throw new userError(`The valie of ${ref} is invalid. \nFix the value, or remove the attribute if you do not intend to use it.`);
    }
    for (cmd in arr) {
        if (typeof(cmd) != "string" || cmd == "") {
            throw new userError(`${ref}: One or more commands are invalid.`);
        }
    }
    return 0;
}

// Checks that a given filename is valid
function checkFileStr (str, ref) {
    if (typeof(str) != "string" || str == "") {
        throw new userError(`The value of ${ref} is invalid. \nFix the value, or remove the attribute if you do not intend to use it.`);
    }
    if (!(fs.existsSync(str) && fs.lstatSync(str).isFile())) {
        let fileStr = str[0] == "/" ? str : `${__dirname}/${str}`
        throw new userError(`${ref}: File "${fileStr}" does not exist.`);
    }
}

// Checks that all settings in config.json appear to be valid
// Exit if any are invalid
function checkConfig () {
    vvb("Checking build commands...");
    if (config.build) {
        checkCmdArr(config.build, "build");
    }
    if (config.tests == undefined) {
        throw new userError("\"tests\" attribute is missing.");
    }
    if (!config.tests || typeof(config.tests.length) != "number") {
        throw new userError("The value of \"tests\" is invalid.");
    }

    vvb("Checking tests...");
    if (config.tests.length <= 0) {
        throw new userError("No tests specified.");
    }

    for (let i = 0; i < config.tests.length; i++) {
        let test = config.tests[i];
        let name = test.name || `Test ${i+1}`;

        vvb(`Checking test: ${name}`);
        if (test.run_cmd == undefined) {
            throw new userError(`${name}: "run_cmd" attribute is missing.`);
        }
        if (typeof(test.run_cmd) != "string" || test.run_cmd == "") {
            throw new userError(`${name}: The value of "run_cmd" is invalid.`);
        }
        if (test.run_timeout != undefined && (typeof(test.run_timeout) != "number" || test.run_timeout <= 0)) {
            throw new userError(`${name}: The value of "run_timeout" is invalid. \nFix the value, or remove the attribute if you do not intend to use it.`);
        };
        if (test.before_cmds != undefined) {
            checkCmdArr(test.before_cmds, `${name}: "before_cmds"`);
        }
        if (test.after_cmds != undefined) {
            checkCmdArr(test.after_cmds, `${name}: "after_cmds"`);
        }
        if (test.stdin_file != undefined) {
            checkFileStr(test.stdin_file, `${name}: "stdin_file"`);
        }
        if (test.stdout_file != undefined) {
            checkFileStr(test.stdout_file, `${name}: "stdout_file"`);
        }
        if (test.stderr_file != undefined) {
            checkFileStr(test.stderr_file, `${name}: "stderr_file"`);
        }
        if (test.files != undefined && (typeof(test.files.length) != "number" || test.files.length < 0)) {
            throw new userError(`${name}: The valie of "files" is invalid. \nFix the value, or remove the attribute if you do not intend to use it.`);
        }
        if (test.files != undefined) {
            for (let f = 0; f < test.files.length; f++) {
                checkFileStr(test.files[f].check_file, `${name}: "files"[${f+1}]: "check_file"`);
            }
        }
    }
}

// Builds program using commands specified in config.build array, in order
// Prints error message and exits if any command produces an error
function build () {
    let result;
    for (let cmd of config.build) {
        vvb(cmd);
        result = spawnSync(cmd, {shell:true});
        if (result.status != 0 || result.signal) {
            vbError(result.stdout + result.stderr);
            throw new userError(`An error occured while building your program with ${cmd}.`);
        }
    }
    return;
}

// Runs commands specified in test.before_run array, in order.
// Prints error message and exits on first command that produces an error.
function beforeRun (cmds) {
    let result;
    for (let cmd of cmds) {
        vvb(cmd);
        result = spawnSync(cmd, {shell:true});
        if (result.status != 0 || result.signal) {
            vbError(result.stdout + result.stderr);
            throw new userError(`An error occured while running command "${cmd}".`);
        }
    }
    return;
}

// Runs commands specified in test.after_run array, in order.
// Prints error message and returns false on first command that fails.
function afterRun (cmds) {
    let result;
    for (let cmd of cmds) {
        vvb(cmd);
        result = spawnSync(cmd, {shell:true});
        if (result.status != 0 || result.signal) {
            vb(result.stdout + result.stderr);
            vb(`Command "${cmd}" failed.`);
            return false;
        }
    }
    return true;
}

// Check that the program's stdout matches the expected stdout for test
function checkStdout (test, testResult) {
    vvb("Checking stdout...");
    let out = fs.readFileSync(test.stdout_file);
    if (testResult.stdout.toString() != out.toString()) {
        vb("Your program's stdout did not match the expected stdout.");
        vb(`Your stdout:\n${testResult.stdout.toString()}`);
        vb(`Expected stdout:\n${out.toString()}`);
        return false;
    }
    return true;
}

// Check that the program's stderr matches the expected stderr for test
function checkStderr (test, testResult) {
    vvb("Checking stderr...");
    let err = fs.readFileSync(test.stderr_file);
    if (testResult.stderr.toString() != err.toString()) {
        vb("Your program's stderr did not match the expected stderr.");
        vb(`Your stderr:\n${testResult.stderr.toString()}`);
        vb(`Expected stderr:\n${err.toString()}\n`);
        return false;
    }
    return true;
}

// Checks that the contents of each pair of files specified in test.files
// have matching contents.
function checkFiles (test) {
    let out, exp;
    let success = true;

    for (let filePair of test.files) {
        if (!(fs.existsSync(filePair.program_file) && fs.lstatSync(filePair.program_file).isFile())) {
            vb(`The file "${filePair.program_file}" does not exist.`);
            success = false;
        } else {
            out = fs.readFileSync(filePair.program_file);
            exp = fs.readFileSync(filePair.check_file);
            if (out.toString() != exp.toString()) {
                vb(`The contents of file "${filePair.program_file}" and "${filePair.check_file}" do not match.`);
                success = false;
            } 
        }
    }

    return success;
}

// Function for running individual tests, returns true/false test success status
function testRunner (test) {
    let testResult;
    let success = true;

    if (test.expect_error) {
        vvb("Expecting an error from this test.");
    }

    if (test.before_cmds) {
        beforeRun(test.before_cmds);
    }

    let inp = test.stdin_file ? fs.readFileSync(test.stdin_file) : undefined;
    // Convert run_timeout to milliseconds, rounded to nearest integer.
    let to = test.run_timeout ? Math.round(test.run_timeout * 1000) : undefined;
    vvb(test.run_cmd);
    testResult = spawnSync(test.run_cmd, {input: inp, shell: true, timeout: to});
    if (testResult.signal) {
        vb(`Your program was killed with signal ${testResult.signal}.`);
        if (testResult == "SIGTERM" && test.run_timeout) {
            vb("A SIGTERM signal may indicate the program being killed for exceeding the specified timeout.");
        }
        return false;
    }
    if (testResult.status != 0 && !test.expect_error) {
        vb("Your program ran into an error:");
        vb(testResult.stdout.toString() + testResult.stderr.toString());
        return false;
    } else if (testResult.status == 0 && test.expect_error) {
        vb("This test was expecting an error, but your program finished normally:");
        vb(testResult.stdout.toString() + testResult.stderr.toString());
        return false;
    }
    
    if (test.stdout_file) {
        success = checkStdout(test, testResult) && success;
    }
    if (test.stderr_file) {
        success = checkStderr(test, testResult) && success;
    }
    if (test.files) {
        success = checkFiles(test) && success;
    }
    if (test.after_cmds) {
        success = afterRun(test.after_cmds) && success;
    }

    return success;
}

// Iterate through all tests, calculate and display final score
function runTests () {
    let i = 0;
    let numSuccess = 0;
    
    for (test of config.tests) {
        i += 1;
        vb(test.name ? test.name : `Test ${i}`);
        if (testRunner(test)) {
            numSuccess += 1;
        } else if (config.first_failure_exit) {
            throw new failureExit();
        }
    }
    
    // Calcualte statistics, display results message
    // Conditions for colours:
    // 100% (all passed) = GREEN
    // >=90% or only 1 test failed, >0 tests passed = YELLOW
    // Otherwise = RED
    let numTests = i;
    let testPrecent = Math.round(numSuccess / numTests * 100);
    let colour;
    if (numSuccess == numTests) {
        colour = GREEN;
    } else if (testPrecent >= 90 || (numTests - numSuccess == 1 && numSuccess > 0)) {
        colour = YELLOW;
    } else {
        colour = RED;
    }
    console.log(`${colour}${numSuccess} of ${numTests} tests passed (${testPrecent}%).${RESET}`);

    return testPrecent;
}



function main() {
    if (!fs.existsSync("testconfig.json")) {
        throw new userError("testconfig.json could not be found. \nEnsure that you created this file with the correct name, and it is in the current directory.");
    }
    try {
        config = JSON.parse(fs.readFileSync("testconfig.json"));
    } catch {
        throw new userError("testconfig.json could not be read due to a JSON syntax error. \nIf your code editor supports JSON files, one or more errors may be highlighted.");
    }
    
    vb("Checking configuration file,,,");
    checkConfig();
    vb("All good.");
    if (config.build != undefined) {
        vb("Building your program...");
        build();
        vb("Build complete.");
    }
    vb("Running tests...");
    let testPercent = runTests();
    
    if (config.scoreExitCode) {
        process.exitCode = 100 - testPercent;
    }
    else if (testPercent != 100) {
        process.exitCode = 1;
    } 
    
}

try {
    main();
} catch (e) {
    if (e instanceof userError) {
        console.error(`${RED}${e.message}${RESET}`);
        process.exitCode = 128;
    } else if (e instanceof failureExit) {
        console.log(`${RED}A test failed. Stopping testing.${RESET}`);
        process.exitCode = 1;
    } else {
        throw e;
    }
}

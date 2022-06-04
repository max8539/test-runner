// test-runner.js
// A script to automate building and testing of your programs
// v1.0.1 Documentation Fixes
// https://github.com/max8539/test-runner

// test-runner.js Copyright (C) 2022 Max Yuen. 
// Licensed under the Apache License, Version 2.0. 
// See https://www.apache.org/licenses/LICENSE-2.0

// Ensure that your test files and tests/testconfig.json
// are set up properly before running this script.
// Refer to README.md or README.pdf for more information.

// To run this script while in its directory:
// $ node test-runner.js

const config = require("./tests/testconfig.json");

console.log("test-runner.js v1.0.1");
if (config.showLicense) {
    console.log("Copyright (C) 2022 Max Yuen.");
    console.log("Licensed under the Apache License, Version 2.0.");
    console.log("See https://www.apache.org/licenses/LICENSE-2.0");
}
console.log("")

const fs = require("fs");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

let fileExt;

const testsDir = path.join(__dirname,"tests");

// Get file extention from config.checkFile
let fileNameGroups = config.checkFile.split(".");
if (fileNameGroups.length <= 1) {
    fileExt = "";
} else {
    fileExt = `.${fileNameGroups.splice(-1)[0]}`
}

// These character sequences instruct the terminal
// to display coloured bold text
const RED = "\x1b[31m\x1b[1m";
const YELLOW = "\x1b[33m\x1b[1m";
const GREEN = "\x1b[32m\x1b[1m";
const RESET = "\x1b[0m";

// Functions for printing verbose text based on 
// verbosity level in testconfig.json
function vb (text) {
    if (config.verbose >= 1) {console.log(text)}
}
function vbError (text) {
    if (config.verbose >= 1) {console.error(text)}
}
function vvb (text) {
    if (config.verbose >= 2) {console.log(text)}
}

// Function to handle exit codes in the event of an error
function errorExit () {
    if (config.scoreExitCode) {
        process.exit(101);
    } else {
        process.exit(1);
    }
}

// Checks that all settings in config.json appear to be valid
// Exit if any are invalid
function checkSettings () {
    // Check that settings are of the correct type
    let validSettings = true;
    if (typeof(config.build) != "object") (validSettings = false)
    if (typeof(config.setup) != "object") {validSettings = false}
    if (typeof(config.run) != "string") {validSettings = false}
    if (typeof(config.runTimeout) != "number") {validSettings = false}
    if (typeof(config.checkFile) != "string") {validSettings = false}
    if (typeof(config.scoreExitCode) != "boolean") {validSettings = false}
    if (!validSettings) {
        console.error(`${RED}Some of your settings are invalid. Cannot proceed.${RESET}`);
        errorExit();
    }

    // Check commands appear to be valid
    // (all are strings, no empty strings)
    for (let cmd of config.build) {
        if (typeof(cmd) != "string" || cmd == "") {
            console.error(`${RED}One or more of your build commands are invalid. Cannot proceed.${RESET}`);
            errorExit();
        }
    }
    for (let cmd of config.setup) {
        if (typeof(cmd) != "string" || cmd == "") {
            console.error(`${RED}One or more of your setup commands are invalid. Cannot proceed.${RESET}`);
            errorExit();
        }
    }
    if (typeof(config.run) != "string" || config.run == "") {
        console.error(`${RED}Your run command is invalid. Cannot proceed.${RESET}`);
            errorExit();
    }
}

// Check that at least one test exists, and 
// all .in.txt files have matching .out.txt or .err.txt files
function checkTests () {
    let i = 1;
    let valid = true;
    let outExists, errExists, fileExists;
    
    // Iterate through test file groups while they exist, starting with test1
    while (fs.existsSync(path.join(testsDir, `test${i}.in.txt`))) {
        outExists = fs.existsSync(path.join(testsDir,`test${i}.out.txt`));
        errExists = fs.existsSync(path.join(testsDir,`test${i}.err.txt`));
        fileExists = fs.existsSync(path.join(testsDir,`test${i}.file${fileExt}`));
        if (!(outExists || errExists || fileExists)) {
            vbError(`Test ${i} does not have an expected stdout, stderr or file output file.`);
            valid = false;
        }
        i += 1;
    }

    // Check for test checking failure conditions
    if (i == 1) {
        console.error(`${RED}No tests could be found. Cannot proceed.${RESET}`);
        errorExit();
    } else if (!valid) {
        console.error(`${RED}Some of your tests do not have an expected stdout, stderr or file output file. Cannot proceed.${RESET}`);
        errorExit();
    }
    return;
}

// Builds program using commands specified in config.build array, in order
// Prints error message and exits if any command produces an error
async function build () {
    for (let cmd of config.build) {
        vvb(cmd);
        try {await execPromise(cmd)}
        catch (err) {
            vbError(err.stdout + err.stderr);
            console.error(`${RED}An error occured while building your program with ${cmd}. Cannot proceed.${RESET}`);
            errorExit();
        }
    }

    return;
}

// Runs setup functions using commands specified in config.setup array, in order.
// Prints error message and exits if any command produces an error
async function setup () {
    for (let cmd of config.setup) {
        vvb(cmd);
        try {await execPromise(cmd)}
        catch (err) {
            vbError(err.stdout + err.stderr);
            console.error(`${RED}An error occured while running test setup with ${cmd}. Cannot proceed.${RESET}`);
            errorExit();
        }
    }
    return;
}

// Check that the program's stdout matches the expected stdout for test
function checkStdout (i, testResult) {
    if (!fs.existsSync(path.join(testsDir, `test${i}.out.txt`))) {return true}
    vvb("Checking stdout...");
    let out = fs.readFileSync(path.join(testsDir,`test${i}.out.txt`));
    if (testResult.stdout != out) {
        vb("Your program's stdout did not match the expected stdout.");
        vb(`Your stdout:\n${testResult.stdout}`);
        vb(`Expected stdout:\n${out}`);
        return false;
    }
    return true;
}

// Check that the program's stderr matches the expected stderr for test
function checkStderr (i, testResult) {
    if (!fs.existsSync(path.join(testsDir,`test${i}.err.txt`))) {return true}
    vvb("Checking stderr...");
    let err = fs.readFileSync(path.join(testsDir,`test${i}.err.txt`));
    if (testResult.stderr != err) {
        vb("Your program's stderr did not match the expected stderr.");
        vb(`Your stderr:\n${testResult.stderr}`);
        vb(`Expected stderr:\n${out}\n`);
        return false;
    }
    return true;
}

// Check that the program's file matches with the test file for test
function checkFile (i) {
    if (config.checkFile == "") {return true}
    if (!fs.existsSync(path.join(testsDir, `test${i}.file${fileExt}`))) {return true}
    vvb(`Checking file ${config.checkFile}...`);
    let file, testFile; let fileError = false;
    testFile = fs.readFileSync(path.join(testsDir, `test${i}.file${fileExt}`).toString());
    try {file = fs.readFileSync(path.join(__dirname,config.checkFile)).toString()}
    catch (err) {
        vb(`Your program was expected to create a file named ${config.checkFile}, but it either does not exist or could not be read.`)
        fileError = true; return false;
    }
    if (!fileError && file != testFile) {
        vb(`Your program's file output does not match the expected file.`);
        vb(`Your program's file output will be saved to tests/test${i}.badfile.${fileExt}.`);
        if (config.verbose >= 1) {
            fs.writeFileSync(path.join(testsDir,`test${i}.badfile.${fileExt}`),file);
        }
        return false;
    }
    return true;
}

// Function for running individual tests, returns true/false test success status
async function testRunner (i) {
    let testResult;
    let allowError = false;
    let success = true;
    const expectError = fs.existsSync(path.join(testsDir,`test${i}.error`));
    if (expectError) {vvb("Expecting an error from this test.")}
    
    // Run test, handle non-zero exit codes
    try {
        const cmd = `${config.run} < tests/test${i}.in.txt`
        vvb(cmd);
        testResult = await execPromise(cmd,{timeout:config.runTimeout*1000})
    }
    catch (err) {
        if (err.killed) {
            vb("Your program took too long to run, or was killed by the OS.");
            return false;
        } else if (!expectError) {
            vb("Your program ran into an error:");
            vb(err.stdout + err.stderr);
            return false;
        } else {
            testResult = err;
            allowError = true;
        }
    }

    // Check that an error wasn't expected if the program finishes normally
    if ((!allowError) && expectError) {
        vb("This test was expecting an error, but your program finished normally:");
        vb(testResult.stdout + testResult.stderr);
        return false;
    }
    
    // Check test stdout and stderr
    if (!checkStdout(i, testResult)) {success = false}
    if (!checkStderr(i, testResult)) {success = false}
    
    // Check file
    if (!checkFile(i)) {success = false}
    return success;
}

// Iterate through all tests, calculate and display final score
async function runTests () {
    let i = 1;
    let numSuccess = 0
    // Iterate through test files while they exist, starting with test1,
    // update score based on result from testRunner()
    while (fs.existsSync(path.join(testsDir,`test${i}.in.txt`))) {
        vb(`Test ${i}`)
        await setup();
        if (await testRunner(i)) {
            numSuccess += 1;
        }
        i += 1;
    }
    
    // Calcualte statistics, display results message
    // Conditions for colours:
    // 100% (all passed) => GREEN
    // >=90% or only 1 test failed, >0 tests passed => YELLOW
    // Otherwise => RED
    const numTests = i - 1;
    const testPrecent = Math.round(numSuccess / numTests * 100);
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

// async main function to allow await of asynchronous
// execPromise functions used throughout test-runner.js
async function main() {
    vb("Checking your settings...");
    checkSettings();
    vb("All good.");
    vb("Checking your test files...");
    checkTests();
    vb("All good.");
    vb("Building your program...");
    await build();
    vb("Build complete.");
    vb("Running tests...");
    const testPercent = await runTests();
    
    // Set exit code if required
    let exitCode = 0;
    if (config.scoreExitCode) {exitCode = 100 - testPercent} 
    process.exit(exitCode);
}

main();

// test-runner.js
// A script to automate building and testing of your programs
// v1.1.0 Check Commands and Debugging Update
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

const fs = require("fs");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

const testsDir = path.join(__dirname,"tests");

console.log("test-runner.js v1.1.0");
if (config.showLicense) {
    console.log("Copyright (C) 2022 Max Yuen.");
    console.log("Licensed under the Apache License, Version 2.0.");
    console.log("See https://www.apache.org/licenses/LICENSE-2.0");
}

if (config.verbose >= 3) {
    // Calculate and print a hash of test-runner.js
    const crypto = require("crypto");
    const hasher = crypto.createHash("sha256");
    const file = fs.readFileSync(path.join(__dirname,"test-runner.js"));
    hasher.update(file);
    const hash = hasher.digest("base64");
    console.log(`\n${hash}`);
    console.log("\ntests/testconfig.json:");
    console.log(fs.readFileSync(path.join(__dirname,"tests/testconfig.json")).toString());
}
console.log("");

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
function debug (text) {
    if (config.verbose >= 3) {console.log(text)}
}

let fileExt;

// Get file extention from config.checkFile
let fileNameGroups = config.checkFile.split(".");
if (fileNameGroups.length <= 1) {
    fileExt = "";
} else {
    fileExt = `.${fileNameGroups.splice(-1)[0]}`
}
debug(`fileExt = ${fileExt}`);


// Function to handle exit codes in the event of an error
function errorExit () {
    debug("errorExit()");
    if (config.scoreExitCode) {
        debug("Exit code 101");
        process.exit(101);
    } else {
        debug("Exit code 1");
        process.exit(1);
    }
}

// Checks that all settings in config.json appear to be valid
// Exit if any are invalid
function checkSettings () {
    debug("checkSettings()");
    // Check that settings are of the correct type
    debug("Check data types");
    let validSettings = true;
    if (typeof(config.build) != "object") (validSettings = false)
    if (typeof(config.setup) != "object") {validSettings = false}
    if (typeof(config.run) != "string") {validSettings = false}
    if (typeof(config.runTimeout) != "number") {validSettings = false}
    if (typeof(config.checkFile) != "string") {validSettings = false}
    if (typeof(config.checkCmds) != "object") {validSettings = false}
    if (typeof(config.scoreExitCode) != "boolean") {validSettings = false}
    debug(`validSettings = ${validSettings}`);
    if (!validSettings) {
        console.error(`${RED}Some of your settings are invalid. Cannot proceed.${RESET}`);
        errorExit();
    }

    // Check commands appear to be valid
    // (all are strings, no empty strings)
    debug("Check build commands");
    for (let cmd of config.build) {
        debug(cmd);
        if (typeof(cmd) != "string" || cmd == "") {
            console.error(`${RED}One or more of your build commands are invalid. Cannot proceed.${RESET}`);
            errorExit();
        }
    }
    debug("Check setup commands");
    for (let cmd of config.setup) {
        debug(`${cmd} ${typeof(cmd)}`);
        if (typeof(cmd) != "string" || cmd == "") {
            console.error(`${RED}One or more of your setup commands are invalid. Cannot proceed.${RESET}`);
            errorExit();
        }
    }
    debug(`Check run command\n${config.run} ${typeof(config.run)}`);
    if (typeof(config.run) != "string" || config.run == "") {
        console.error(`${RED}Your run command is invalid. Cannot proceed.${RESET}`);
            errorExit();
    }
    debug("Check test checking commands");
    for (let cmd of config.checkCmds) {
        debug(`${cmd} ${typeof(cmd)}`);
        if (typeof(cmd) != "string" || cmd == "") {
            console.error(`${RED}One or more of your test checking commands are invalid. Cannot proceed.${RESET}`);
            errorExit();
        }
    }
}

// Check that at least one test exists, and 
// all .in.txt files have matching .out.txt or .err.txt files
function checkTests () {
    debug("checkTests()");
    let i = 1;
    let valid = true;
    let outExists, errExists, fileExists;
    
    // Iterate through test file groups while they exist, starting with test1
    while (fs.existsSync(path.join(testsDir, `test${i}.in.txt`))) {
        outExists = fs.existsSync(path.join(testsDir,`test${i}.out.txt`));
        errExists = fs.existsSync(path.join(testsDir,`test${i}.err.txt`));
        fileExists = fs.existsSync(path.join(testsDir,`test${i}.file${fileExt}`));
        debug(`i = ${i}, outExists = ${outExists}, errExists = ${errExists}, fileExists = ${fileExists}`);
        if (!(outExists || errExists || fileExists)) {
            vbError(`Test ${i} does not have an expected stdout, stderr or file output file.`);
            valid = false;
        }
        i += 1;
    }

    // Check for test file checking failure conditions
    debug(`i = ${i}, valid = ${valid}`);
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
    debug("build()");
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

function deleteCheckFile () {
    debug("deleteCheckFile()");
    if (config.checkFile == "") {return}
    if (!fs.existsSync(path.join(__dirname,config.checkFile))) {return}
    debug("File exists.");
    vvb(`Deleting ${config.checkFile}...`);
    fs.unlinkSync(path.join(__dirname,config.checkFile));
}

// Runs setup functions using commands specified in config.setup array, in order.
// Prints error message and exits if any command produces an error
async function setup () {
    debug("setup()");
    if (config.deleteCheckFileOnSetup) {deleteCheckFile()}
    
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
function checkStdout (testNum, testResult) {
    debug(`checkStdout(${testNum},${testResult})`);
    if (!fs.existsSync(path.join(testsDir, `test${testNum}.out.txt`))) {return true}
    
    vvb("Checking stdout...");
    debug("Reading test file...")
    let out = fs.readFileSync(path.join(testsDir,`test${testNum}.out.txt`));
    debug("Compare files...")
    if (testResult.stdout != out) {
        vb("Your program's stdout did not match the expected stdout.");
        vb(`Your stdout:\n${testResult.stdout}`);
        vb(`Expected stdout:\n${out}`);
        return false;
    }
    debug("Files match.")
    return true;
}

// Check that the program's stderr matches the expected stderr for test
function checkStderr (testNum, testResult) {
    debug(`checkStderr(${testNum},${testResult})`);
    if (!fs.existsSync(path.join(testsDir,`test${testNum}.err.txt`))) {return true}
    
    vvb("Checking stderr...");
    debug("Reading test file...");
    let err = fs.readFileSync(path.join(testsDir,`test${testNum}.err.txt`));
    debug("Comparing files...")
    if (testResult.stderr != err) {
        vb("Your program's stderr did not match the expected stderr.");
        vb(`Your stderr:\n${testResult.stderr}`);
        vb(`Expected stderr:\n${out}\n`);
        return false;
    }
    debug("Files match.")
    return true;
}

// Check that the program's file matches with the test file for test
function checkFile (testNum) {
    debug(`checkFile(${testNum})`);
    if (config.checkFile == "") {return true}
    if (!fs.existsSync(path.join(testsDir, `test${testNum}.file${fileExt}`))) {return true}
    vvb(`Checking file ${config.checkFile}...`);
    
    let file, testFile; 
    debug("Reading test file...");
    testFile = fs.readFileSync(path.join(testsDir, `test${testNum}.file${fileExt}`).toString());
    debug("Reading checkFile...");
    try {file = fs.readFileSync(path.join(__dirname,config.checkFile)).toString()}
    catch (err) {
        vb(`Your program was expected to create a file named ${config.checkFile}, but it either does not exist or could not be read.`)
        return false;
    }
    debug("Comparing files...");
    if (file != testFile) {
        vb(`Your program's file output does not match the expected file.`);
        vb(`Your program's file output will be saved to tests/test${testNum}.badfile.${fileExt}.`);
        if (config.verbose >= 1) {
            fs.writeFileSync(path.join(testsDir,`test${testNum}.badfile.${fileExt}`),file);
        }
        return false;
    }
    debug("Files match.")
    return true;
}

// Runs test checking commands
async function checkCmds () {
    debug("checkCmds()");
    for (let cmd of config.checkCmds) {
        vvb(cmd);
        try {await execPromise(cmd)}
        catch (err) {
            vb(err.stdout + err.stderr);
            vb(`${cmd} indicated a failure.`);
            return false;
        }
    }
    return true;
}

// Function for running individual tests, returns true/false test success status
async function testRunner (testNum) {
    debug(`testRunner(${testNum})`);
    let testResult;
    let allowError = false;
    let success = true;
    const expectError = fs.existsSync(path.join(testsDir,`test${testNum}.error`));
    if (expectError) {vvb("Expecting an error from this test.")}
    
    // Run test, handle non-zero exit codes
    debug("Begin running test...");
    try {
        const cmd = `${config.run} < tests/test${testNum}.in.txt`
        vvb(cmd);
        testResult = await execPromise(cmd,{timeout:config.runTimeout*1000})
    }
    catch (err) {
        debug("Non-zero exit code received.");
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
    debug(`testResult = ${testResult}, allowError = ${allowError}, expectError = ${expectError}`);

    // Check that an error wasn't expected if the program finishes normally
    if ((!allowError) && expectError) {
        vb("This test was expecting an error, but your program finished normally:");
        vb(testResult.stdout + testResult.stderr);
        return false;
    }
    
    // Check test stdout and stderr
    if (!checkStdout(testNum, testResult)) {success = false}
    if (!checkStderr(testNum, testResult)) {success = false}
    
    // Check file
    if (!checkFile(testNum)) {success = false}

    // Run test checking commands
    if (!(await checkCmds())) {success = false}

    debug(`success = ${success}`);
    return success;
}

// Iterate through all tests, calculate and display final score
async function runTests () {
    debug("runTests()");
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
        debug(`i = ${i}, numSuccess = ${numSuccess}`);
        i += 1;
    }
    
    // Calcualte statistics, display results message
    // Conditions for colours:
    // 100% (all passed) => GREEN
    // >=90% or only 1 test failed, >0 tests passed => YELLOW
    // Otherwise => RED
    const numTests = i - 1;
    const testPrecent = Math.round(numSuccess / numTests * 100);
    debug(`numSuccess = ${numSuccess}, numTests = ${numTests}, testPercent = ${testPrecent}`);
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
    debug("main()");
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
    debug("Calculating exit code...");
    if (config.scoreExitCode) {exitCode = 100 - testPercent} 
    debug(`Exit code ${exitCode}`);
    process.exit(exitCode);
}

main();

// test-runner.js
// v0.9.0 code pre-release
// https://github.com/max8539/test-runner

// A script to build and test your programs.
// This is not a test generator - YOU need to write your own tests.

// Ensure that your test files and tests/testconfig.json
// are set up properly before running this script.
// Refer to README.md or README.pdf for more information.

// To run this script while in its directory:
// $ node test-runner.js


const fs = require("fs");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

const config = require("./tests/testconfig.json");
const testsDir = path.join(__dirname,"tests");
const fileExt = config.checkFile.split(".").slice(-1)[0];

// These character sequences instruct the terminal
// to display coloured bold text
const RED = "\x1b[31m\x1b[1m";
const YELLOW = "\x1b[33m\x1b[1m";
const GREEN = "\x1b[32m\x1b[1m";
const RESET = "\x1b[0m";

// Functions for printing verbose text based on 
// verbosity level in testconfig.json
function vb (text) {
    if (config.verbose >= 1) {
        console.log(text);
    }
}
function vbError (text) {
    if (config.verbose >= 1) {
        console.error(text);
    }
}
function vvb (text) {
    if (config.verbose >= 2) {
        console.log(text);
    }
}

function errorExit () {
    if (config.scoreExitCode) {
        process.exit(100);
    } else {
        process.exit(1);
    }
}

// Check that at least one test exists, and 
// all .in.txt files have matching .out.txt or .err.txt files
function checkTests () {
    let i = 1;
    let valid = true;
    let outExists, errExists, fileExists, errorExists;
    
    // Iterate through test file groups while they exist, starting with test1
    while (fs.existsSync(path.join(testsDir, `test${i}.in.txt`))) {
        outExists = fs.existsSync(path.join(testsDir,`test${i}.out.txt`));
        errExists = fs.existsSync(path.join(testsDir,`test${i}.err.txt`));
        errorExists = fs.existsSync(path.join(testsDir,`test${i}.error`));
        fileExists = fs.existsSync(path.join(testsDir,`test${i}.file.${fileExt}`));
        if (!(outExists || errExists || fileExists || errorExists)) {
            vbError(`Test ${i} does not have an expected stdout, stderr, file output or error file.`);
            valid = false;
        }
        i += 1;
    }

    if (i == 1) {
        // (while loop above never entered, so i never incremented)
        console.error(`${RED}No tests could be found. Cannot proceed.${RESET}`);
        errorExit();
    } else if (!valid) {
        // 
        console.error(`${RED}Some of your tests do not have an expected stdout, stderr, file output or error file. Cannot proceed.${RESET}`);
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

// Check that the program's stdout matches the expected stdout for test i
function checkStdout (i, testResult) {
    if (!fs.existsSync(path.join(testsDir, `test${i}.out.txt`))) {return true}
    let out = fs.readFileSync(path.join(testsDir,`test${i}.out.txt`));
    if (testResult.stdout != out) {
        vb("Your program's stdout did not match the expected stdout.");
        vb(`Your stdout:\n${testResult.stdout}`);
        vb(`Expected stdout:\n${out}`);
        return false;
    }
    return true;
}

// Check that the program's stderr matches the expected stderr for test i
function checkStderr (i, testResult) {
    if (!fs.existsSync(path.join(testsDir,`test${i}.err.txt`))) {return true}
    let err = fs.readFileSync(path.join(testsDir,`test${i}.err.txt`));
    if (testResult.stderr != err) {
        vb("Your program's stderr did not match the expected stderr.");
        vb(`Your stderr:\n${testResult.stderr}`);
        vb(`Expected stderr:\n${out}\n`);
        return false;
    }
    return true;
}

// Check that the program's file matches with the test file for test i
function checkFile (i) {
    if (!fs.existsSync(path.join(testsDir, `test${i}.file.${fileExt}`))) {return true}
    let file, testFile; let fileError = false;
    testFile = fs.readFileSync(path.join(testsDir, `test${i}.file.${fileExt}`).toString());
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



// Function for running individual tests, 
// returns true/false test success status
async function testRunner (i) {
    let testResult;
    let allowError = false;
    let success = true;
    let expectError = fs.existsSync(path.join(testsDir,`test${i}.error`));
    
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
        setup();
        if (await testRunner(i)) {
            numSuccess += 1;
        }
        i += 1;
    }
    
    // Calcualte statistics, display results message
    // Conditions for colours:
    // 100% (all passed) => GREEN
    // >=90% or only 1 test failed, >0 tests passed => YELLOW
    // <90% and more than 1 test failed => RED
    let numTests = i - 1;
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

async function main() {
    vb("Checking your test files...");
    checkTests();
    vb("All good.");
    vb("Building your program...");
    await build();
    vb("Build complete.");
    vb("Running tests...");
    let testPercent = await runTests();
    let exitCode = 0;
    if (config.scoreExitCode) {exitCode = 100 - testPercent} 
    process.exit(exitCode);
}

main();

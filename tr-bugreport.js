// tr-bugreport.js
// A script to generate bug reports for test-runner.js
// https://github.com/max8539/test-runner

// test-runner.js Copyright (C) 2022 Max Yuen & collaborators. 

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


const fs = require("fs");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(require("child_process").exec);

const RED = "\x1b[31m\x1b[1m";
const YELLOW = "\x1b[33m\x1b[1m";
const GREEN = "\x1b[32m\x1b[1m";
const RESET = "\x1b[0m";

async function main () {
    if (!fs.existsSync(path.join(__dirname,"test-runner.js"))) {
        console.error(`${RED}test-runner.js not found.${RESET}`) 
        console.error("Please move tr-bugreport.js to the same directory as test-runner.js, then run again.");
        process.exit(1);
    }
    let oldConfig = fs.readFileSync(path.join(__dirname,"tests/testconfig.json")).toString();
    let newConfig = JSON.parse(oldConfig);
    newConfig.showLicense = true;
    newConfig.verbose = 3;
    fs.writeFileSync(path.join(__dirname,"tests/testconfig.json"),JSON.stringify(newConfig));
    
    console.log("Running test-runner.js...");
    let output;
    try {output = await execPromise("node test-runner.js");}
    catch (err) {
        console.log(`${YELLOW}test-runner.js encountered an error.${RESET}`);
        output = err;
    }
    fs.writeFileSync(path.join(__dirname,"bugreport.log"),output.stdout + output.stderr);
    console.log(`${GREEN}test-runner.js output saved to bugreport.log.${RESET}`);
    console.log("Please create a bug report at https://github.com/max8539/test-runner/issues");console.log("and upload bugreport.log to include with your report.");

    fs.writeFileSync(path.join(__dirname,"tests/testconfig.json"),oldConfig);
    process.exit(0);
}

main();

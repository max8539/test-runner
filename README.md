[Quick Start Guide](#quick-start-guide)  
[Skip to documentation](#test-runnerjs-documentation)

# test-runner.js
**A script to automate building and testing of your programs**

**Development of v2 has started!** - featuring a revamped configuration file to allow better configuration options for your tests. 

A UI helper for creating new configuration files may be added in the future, but this will not be included in the initial v2 release.

## General information
test-runner.js is a script which can be used to automate testing of programs. It was originally made to help test small programs written in C, which lacks its own dedicated testing framework, however it can be used to test programs written in many languages, provided that they run in the terminal and make use of standard IO streams (`stdin`, `stdout` and `stderr`).

test-runner.js is primarily aimed at development in languages that don't have a native testing framework. If the language you use has a native/third party testing framework specific to that language, you may find that more useful.

One of the main goals of test-runner.js was to make it portable and as user-friendly to non-JavaScript developers as possible. As such, test-runner.js avoids the use of npm and external packages entirely, only using packages which are built in to Node.js.

It is recommended to download (or `git clone`) this repository and save it to a central location in your user's filesystem, then copy `test-runner.js`and the `tests` directory into the root directories of the projects where you wish to use it. 

**test-runner.js is run using Node.js.** If not already installed on your system, you may download it from the [officlal Node.js website](https://nodejs.org/), or consider using a version manager like [nvm](https://github.com/nvm-sh/nvm).

test-runner.js should work on most Linux and Unix-like systems. It will also likely work on macOS. test-runner.js does not currently work on Windows due to differences in command line syntax between Unix-like systems and Windows.

**NOTICE to Students of Academic Institutions:** You are responsible for following the academic honesty and integrity rules set by your institution. In particular:
- You should check that using this software is permissible under any rules set out by your institution, faculty or course authority, before using it for any academic work
- Actual test files are not distributed from this repository (except for two example files, which are for illustrative purposes only). You must not upload any tests you create to this repository. You should not redistribute this software with any test files included, unless sharing of tests used for academic work is permitted under any rules set out by your institution, faculty or course authority.

The owner and maintainers of this repository will not accept any responsibility for misuse of this software. 

**NOTICE to System Administrators:** test-runner.js uses a variant of `child_process.exec()` to run user-specified commands on your system. If the Node.js runtime is installed on your system as a set-uid or set-gid executable, users who run test-runner.js may be able to use it to run commands with a privileged level of access to your system.

**test-runner.js Copyright © 2022 Max Yuen & collaborators.**

**Licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License. You may obtain a copy of the License at**

**[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)**

**Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.**

## Your Download Should Come With the Following Files:
- `test-runner.js` - the main script to be run
- `tr-bugreport.js` - a script which should be run when creating a bug report
- a `.gitignore` file
- a `LICENSE` file
- a `tests` directory containing:
    - `testconfig.json` - a file containing settings used for building and testing.
    - `exampletest1.in.txt` and `exampletest1.out.txt` - a sample test input and test output file.
- `README.md` and `README.pdf`, both of which contain the same information.

If any files are missing, or have since been updated to a newer version, you can re-download them from [https://github.com/max8539/test-runner](https://github.com/max8539/test-runner), or run `git pull` if using Git to maintain the repository on your computer.

## Release History
**v1.1.3 Minor Fixes (latest)**  
v1.1.2 Fix stderr Checking Bug  
v1.1.1 Update to License Notices   
v1.1.0 Check Commands and Debugging Update   
v1.0.0 Full Release  
v0.9.2 License Change  
v0.9.1 Licensing and Incomplete Documentation  
v0.9.0 Code Pre-release  

## Improvements and Contributing
You are welcome to suggest improvements to test-runner.js. The best way to do so is through the Issues Board at [https://github.com/max8539/test-runner/issues](https://github.com/max8539/test-runner/issues).  
While suggestions are much appreciated, there is no guarantee every suggestion will be acted upon.

If you would like to take up an issue and implement the changes (especially ones given the thumbs-up label), you are welcome to fork the repository, implement the changes, and create a pull request.

**WARNING:** Be careful not to accidentally add files from other projects to the repository. While the `.gitignore` should prevent you from adding other files if it is there, you should double check the files you are commiting before you make the commit. It is extremely difficult, if not impossible, to remove references to a file in Git's history once a commit has been made, especially if you have since pushed that commit to an online repository.

## Reporting Bugs
If you believe you have found a bug, please report it by creating an issue at [https://github.com/max8539/test-runner/issues](https://github.com/max8539/test-runner/issues) with the label bug-report. Copy `tr-bugreport.js` from this repository to the same directory as `test-runner.js` where you encountered the bug, run the terminal command `node tr-bugreport.js` from that directory, and upload the file it creates as part of your bug report. Please also provide a description of what you did in the lead-up to encountereing the bug. If you are able to provide any other files used to allow maintainers to attempt to replicate the problem, that would be much appreciated, however not a requirement.

# Quick Start Guide
This quick start guide walks through testing a simple program written in the C programming language, compiled with gcc, and only makes use of terminal input and output (`stdin` and `stdout` only). If you are testing programs or scripts written in other languages, you may wish to use one of the `tests/testconfig.json` templates available [here](https://github.com/max8539/tr-tctemplates).

1. Copy `test-runner.js` and the `tests` directory, including its contents, in the root directory of your project.
2. Navigate to the `tests` directory in your project and open `testconfig.json` to modify the test settings.
3. Inside the array (square brackers) next to `"build":`, enter the command used to compile your code. The build setting should look something like `"build": ["gcc code.c -o program"]`.
4. Next to `"run":`, enter the command used to run the executable produced by the compiler. The run setting should look something like `"run": "./program"`.
5. Leave the other values in `testconfig.json` as-is, and close the file. For more advanced settings, see [2 - Configuring Test Settings](#2---configuring-test-settings) in the full documentation below.
6. Inside the `tests` directory, create a file named `test1.in.txt`. Inside this file, write out the input to be passed to your code, ensuring that any whitespace and newlines are consistent with what your program expects. If your program prompts for inputs multiple times, each input should be placed on a separate line.
7. Inside the `tests` directory, create a file named `test1.out.txt`. Inside this file, write out the exact output which you expect your program to produce when given the contents of `test1.in.txt` as its input, including any whitespace and newlines which your program is expected to print. If lines are printed to prompt for input, these should be included too.
8. Open a terminal, switch to the root directory of your project, and run the command `node test-runner.js`. If you have done everything correctly, and your code was compiled successfully, you should be given a score out of 1. Did your program pass your test?
9. Continue to write tests, naming your files `test2.in.txt`, `test2.out.txt`, `test3.in.txt`, `test3.out.txt` etc. to comprehensively test your program. Re-run test-runner.js to test your program with your new tests. For more advanced testing options, see [3 - Writing Your Tests](#3---writing-your-tests) in the full documentation below.

If you encounter any errors produced by test-runner.js, see [4.3 - Troubleshooting Error Messages](#43---troubleshooting-error-messages) for troubleshooting help.

# test-runner.js Documentation

### Contents

**[1 - Setting Up your Project for Testing](#1---setting-up-your-project-for-testing)**  
**[2 - Configuring Test Settings](#2---configuring-test-settings)**  
    *[2.1 - Show/Hide License Information](#21---showhide-license-information)*  
    *[2.2 - Verbosity Settings](#22---verbosity-settings)*  
    *[2.3 - Build Commands](#23---build-commands)*  
    *[2.4 - Test Setup Commands](#24---test-setup-commands)*  
    *[2.5 - Run Program Command](#25---run-program-command)*  
    *[2.6 - Run Timeout](#26-run-timeout)*  
    *[2.7 - Specify a File to be Checked](#27-specify-a-file-to-be-checked)*  
    *[2.8 - Delete Checked File Before Each Test](#28-delete-checked-file-before-each-test)*  
    *[2.9 - Specify Commands for Checking Tests](#29-specify-commands-for-checking-tests)*  
    *[2.10 - Returning the Final Score as the Exit Code](#210-returning-the-final-score-as-the-exit-code)*  
    *[2.11 - Example `testconfig.json` File](#211---example-testconfigjson-file)*  
**[3 - Writing Your Tests](#3---writing-your-tests)**  
    *[3.1 - Input Test File](#31---input-test-file)*  
    *[3.2 - Output Test File](#32---output-test-file)*  
    *[3.3 - Error Test File](#33---error-test-file)*  
    *[3.4 - File Output File](#34---file-output-file)*  
    *[3.5 - Expected Error File](#35---expected-error-file)*  
    *[3.6 - Run Commands to Check Test Result](#36---run-commands-to-check-test-result)*  
    *[3.7 - Example `tests` Directory](#37---example-tests-directory)*  
**[4 - Running and Troubleshooting](#4---running-and-troubleshooting)**  
    *[4.1 - Running test-runner.js](#41---running-test-runnerjs)*   
    *[4.2 - Troubleshooting Error Messages](#42---troubleshooting-error-messages)*  
    *[4.3 - Other Troubleshooting](#43---other-troubleshooting)*  

## 1 - Setting Up your Project for Testing
Copy `test-runner.js` and the `tests` directory, including its contents, in the root directory of your project. Other files in the repository need not be copied.

Install Node.js if it is not already installed on your system. 

## 2 - Configuring Test Settings
Test settings are configured by modifying values in the `tests/testconfig.json` file. The settings available are described below.

You may wish to enter the values in `tests/testconfig.json` from scratch, in which case, copy the testconfig.json provided in this repository. Alternately you may wish to build upon one of the templates availalbe [here](https://github.com/max8539/tr-tctemplates).

Note that updates to test-runner.js may add additional fields in `tests/testconfig.json`, or change the data types of existing fields. If you notice test-runner.js running into errors while reading your settings, you should check back here for any recent changes.

**WARNING:** Ensure that you enter settings correctly in `tests/testconfig.json` as the value in each of the key-value pairs, like `"key":value`, noting the semicolon between the key and the value. Also ensure that the the data type you enter for each value matches the data types specified below.

### 2.1 - Show/Hide License Information
Set `"showLicenseInfo"` to `true` to print license information every time test-runner.js is run.  
Set `"showLicenseInfo"` to `false` to skip printing license information when test-runner.js is run.

`"showLicenseInfo"` should always be set to a boolean value.

### 2.2 - Verbosity Settings
Set `"verbose"` to the level of verbosity (information printed) that you wish to see. There are three levels to choose from:
- `0` - Print only the final result after running all tests, or an error message if tests could not be run.
- `1` - Print everything in level 0. Print out the stages of test-runner.js as they are being executed. Print out the `stdout` and `stderr` of a build or setup command if it fails. Also print out the test numbers as they are run, and print out information about why your program did not pass certain tests, if this occurs.
- `2` - Print everything in levels 0 and 1. Print out the shell commands that are run by the scrript, as they are executed in different stages of test-runner.js, and print out the stages of test checking as they happen.
- `3` - Additional information is printed, intended for debugging purposes. **Level 3 is not recommended unless you are working to fix bugs in test-runner.js.**

`"verbose"` should always be set to a numeric value.

### 2.3 - Build Commands
Set `"build"` to an array of zero or more commands which should be run to build (or compile) your program. All commands should be written as non-empty strings, wrapped in double quotes (this is a requirement of JSON files). These commands will be run once, in the order they are written in the array, before running any tests.  
If your program does not have a build or compiling requirement, say for example, a JavaScript or Python script, set `"build"` to an empty array.

`"build"` should always be set to an array containing zero or more non-empty string elements.

### 2.4 - Test Setup Commands
Set `"setup"` to an array of zero or more commands which should be run to prepare the environment for each test. This could include creating files, removing files previously created by your program, or resetting the content of files. All commands should be written as non-empty strings, wrapped in double quotes (this is a requirement of JSON files). These commands will be run once, in the order they are written in the array, before each test.  
If your tests do not require any actions to be taken before each test, or between tests, set `"setup"` to an empty array.

`"setup"` should always be set to an array containing zero or more non-empty string elements.

### 2.5 - Run Program Command
Set `"run"` to the command which should be used to run your program. The command should be written as a non-empty string wrapped in double quotes (this is a requirement of JSON files). The command will be run once for each test.
When run by test-runner.js, the command will be affixed with a command to use the test's input file as your program's `stdin`. For example, the command `cmd` will be run by your program for test 1 as `cmd < test1.in.txt`.

`"run"` should always be set to a non-empty string.

### 2.6 Run Timeout
Set `"runTimeout"` to the maximum time in seconds which your program should take to run. If your program takes longer than this to run in a test, it will be killed and the test will be counted as a failure. The timeout will not be applied to any of the build commands, setup commands, or the time it takes for test-runner.js to check the output of your program.

`"runTimeout"` should always be set to a numeric value.

### 2.7 Specify a File to be Checked
Set `"checkFile"` to be the name or path of a file which will be checked as part of checking the result  of a test. The name or path should be written as a string wrapped in double quotes (this is a requirement of JSON files). After each test is run, this file will be loaded, and its data compared to a test file containing the expected data.  
If there is no file to check, set `"checkFile"` to an empty string.

`"checkFile"` should always be set to a string.

### 2.8 Delete Checked File Before Each Test
Set `"deleteCheckFileOnSetup"` to `true` if you would like the file specified under `"checkFile"` to be deleted before each test, if it exists. 
Set `"deleteCheckFileOnSetup"` to `false` if you do not want the file to be deleted.

`"deleteCheckFileOnSetup"` should always be set to a boolean value.

### 2.9 Specify Commands for Checking Tests
Set `"checkCmds"` to an array of zero or more commands which should be run as part of checking the result of a test. The commands should return an exit code of 0 to indicate success, or a non-zero exit code to indicate failure. All commands should be written as non-empty strings, wrapped in double quotes (this is a requirement of JSON files). These commands will be run once, in the order they are written in the array, after running your program in each test.  
If your tests do not require any commands to be run as part of checking the result of a test, set `"checkCmds"` to an empty array.

`"checkCmds"` should always be set to an array containing zero or more non-empty string elements.

### 2.10 Returning the Final Score as the Exit Code
To facilitate usage of this script in CI pipelines and other programs or scripts, you may choose for test-runner.js to return the percentage score as the exit code of the process. 

If `"scoreExitCode"` is set to `true`:
- An exit code of `101` will be returned if an error was encountered outside of running tests on your program, such as if a build or setup command encountered an error.
- If all tests were run and test-runner.js runs successfully, the exit code will be set as `100 - [percentage of tests passed]`. This is set so that an exit code of `0`, which conventionally indicates a program running successfully, corresponds to passing all tests. The actual percentage score can be found by calculating `100 - [exit code]`.

If `"scoreExitCode"` is set to `false`:
- An exit code of `1` will be returned if an error was encountered outside of running tests on your program, such as if a build or setup command encountered an error.
- An exit code of `0` will be returned if test-runner.js was able to run successfully and run all tests, regardless of the results from the tests. 

### 2.11 - Example `testconfig.json` file
Your `testconfig.json` file may look something like this:
```json
{
    "showLicense": true,
    "verbose": 1,
    "build": [],
    "setup": ["echo \"1\" > input1.file","echo \"2\" > input2.file"],
    "run": "deno run --allow-read --allow-write testProgram.js",
    "runTimeout": 5,
    "checkFile": "output.file",
    "deleteCheckFileOnSetup": true,
    "checkCmds": [],
    "scoreExitCode": false
}
```

## 3 - Writing Your Tests
Each test consists of a minimum of 2, up to a maximum of 5 files. All tests consist of a stdin file, and one or more of a stdout file, a stderr file, and a file that should be created by the program, You may also create a file to signal to the test-runner.js that a non-zero exit code is expected for this test. All test files should be placed inside the `tests` directory, and tests should be numbered sequentially, beginning at 1, with no gaps between test numbers.

**WARNING:** Ensure that your test files are placed in the `tests` directory, they are named exactly as specified, and tests are numbered sequentially, beginning at 1, with no gaps between test numbers, or test-runner.js will not be able to find them.

### 3.1 - Input Test File
The first file to create is the input file. The contents of this file should be exactly what is passed to the `stdin` of your program. It should be named `testX.in.txt`, where `X` is the number of your test, e.g. `test1.in.txt`. This file is required for every test you write.
If your program prompts for inputs multiple times, each input should be placed on a separate line, with exactly one newline character separating each input. If no input is needed, leave the file empty.

### 3.2 - Output Test File
One of the files you can create for your program to be checked against is an output file. This should contatin exactly what is expected in the `stdout` of your program for a given test's input, including any newlines and whitespace that is output. If nothing is expected on `stdout`, you may create this file and leave it empty. This file should be named `testX.out.txt`, where `X` is the number of your test, e.g. `test1.out.txt`. If this file is not included, your program's `stdout` will not be checked.

### 3.3 - Error Test File
One of the files you can create for your program to be checked against is an error file. This should contatin exactly what is expected in the `stderr` of your program for a given test's input, including any newlines and whitespace that is output. If nothing is expected on `stderr`, you may create this file and leave it empty. This file should be named `testX.err.txt`, where `X` is the number of your test, e.g. `test1.err.txt`. If this file is not included, your program's `stderr` will not be checked.


### 3.4 - File Output File
One of the files you can create for your program to be checked against is a file whose contents exactly match the expected contents of a file which your program will create for a given test's input. The name of the file should begin as `testX.file`, where `X` is the number of your test. A file extension of your choice may be affixed, however this must match the file extension of the filename specified at `"checkFile"` in `tests/testconfig.json`. An example for a `pdf` file may look like `test1.file.pdf`. Only include this file if your program is expected to output a file during that test.

### 3.5 - Expected Error File
One of the files you can create for your program to be checked against is a file signalling to test-runner.js that your program should run into an error while running, and return a non-zero exit code. If this file is included in your test, and your program finishes normally with an exit code of `0`, the test will fail. This file should be named `testX.error`, where `X` is the number of your test, e.g. `test1.error`.  
If this file is not included, test-runner.js will expect your program to finish normally with an exit code of `0`. Any non-zero exit code will cause the test to fail.

### 3.6 - Run Commands to Check Test Result
You may wish for commands to be run after each test to check if certain actions have been performed by your program. These can be specified in `tests/testconfig.json`. See [2.9  - Sepcify Commands for Checking Tests](#29-specify-commands-for-checking-tests).

### 3.7 - Example `tests` Directory
Your `tests` directory may look something like the following:
```
test1.in.txt
test1.out.txt
test2.err.txt
test2.error
test2.in.txt
test2.out.txt
test3.file.json
test3.in.txt
test3.out.txt
testconfig.json
```

## 4 - Running and Troubleshooting

### 4.1 - Running test-runner.js
Ensure that you have completed sections 1, 2 and 3 above before running test-runner.js.

To run test-runner.js from a terminal, switch to the root directory of your project, where `test-runner.js` and your `tests` directory should be located, and run the following command:
```
node test-runner.js
```

### 4.2 - Troubleshooting Error Messages
While error messages which causes test-runner.js to stop are always printed, useful error information is hidden when running at verbose level 0. Before troubleshooting the error, it may be useful to re-run test-runner.js at verbose level 1 or higher (see [2.2 - Verbosity settings](#22---verbosity-settings)).

One of the following error messages may be output by test-runner.js if it runs into an error which causes it to stop:
- **Some of your settings are invalid.**
    - Some fields and/or values in `tests/testconfig.json` may be missing.
    - The data types of some values in `tests/testconfig.json` may be incorrect.
    - If you recently updated test-runner.js, some of the requirements for `tests/testconfig.json` may have changed.
    - Double check the values in `tests/testconfig.json` and their requirements (see [2 - Configuring Test Settings](#2---configuring-test-settings))
- **One or more of your build commands are invalid.**
    - One or more of the commands specified in the `"build"` array of `tests/testconfig.json` is either an empty string or not a string. 
    - Double check that all the commands are valid commands and are stored as strings in the array (see [2.3 - Build Commands](#23---build-commands)).
- **One or more of your setup commands are invalid.**
    - One or more of the commands specified in the `"setup"` array of `tests/testconfig.json` is either an empty string or not a string. 
    - Double check that all the commands are valid commands and are stored as strings in the array (see [2.4 - Test Setup Commands](#24---test-setup-commands)).
- **Your run command is invalid.**
    - The command saved as the value for `"run"` in `tests/testconfig.json` is either an empty string or not a string
    - Double check that the specified run command is valid, and is stored as a string (see [2.5 - Run Program Command](#25---run-program-command)).
- **One or more of your test checking commands are invalid.**
    - One or more of the commands specified in the `"checkCmd"` array of `tests/testconfig.json` is either an empty string or not a string. 
    - Double check that all the commands are valid commands and are stored as strings in the array (see [2.9 Specify Commands for Checking Tests](#29-specify-commands-for-checking-tests)).
- **No tests could be found.**
    - test-runner.js could not find your test files.
    - You should write at least one test before running test-runner.js.
    - Ensure that your test files are named correctly, and are numbered sequentially beginning with 1. As part of this, there should be a file named `test1.in.txt` (see [3 - Writing Your Tests](#3---writing-your-tests)).
- **Some of your tests do not have an expected stdout, stderr, or file output file.**
    - test-runner.js found an input file for a test, but could not find an expected stdout, stderr, or file output file for that test. 
    - At verbose level 1 or higher, test-runner.js will print exactly which tests have missing files.
    - Ensure that your test files are named correctly, and are numbered sequentially beginning with 1 (see [3 - Writing Your Tests](#3---writing-your-tests)).
- **An error occured while building your program with \[cmd\].**
    - \[cmd\] encountered an error while building or compiling your program.
    - At verbose level 1 or higher, test-runner.js will print the `stdout` and `stderr` from the build command that failed, which will likely include warnings and/or errors from your code.
    - You most likely need to fix your code so that it will build or compile correctly.
    - Refer to troubleshooting for the specific command in question, if available.
- **An error occured while running test setup with \[cmd\].**
    - \[cmd\] encountered an error while running.
    - At verbose level 1 or higher, test-runner.js will print the `stdout` and `stderr` from the setup command that failed.
    - Refer to troubleshooting for the specific command in question, if available.

If you encounter a runtime error generated by Node.js (you will know you have one if you see a traceback listing of .js files), you may have encountered a bug. It would be appreciated if you [submit a bug report.](#reporting-bugs).

### 4.3 - Other Troubleshooting
- **I'm not sure why my tests are failing.**
    - Re-run test-runner.js at verbose level 1 or higher to get an explanation of why certain tests failed.
- **The output looks the same as what the test expects, but it's still failing.**
    - Ensure that spelling is correct, and the use of whitespace and newlines is consistent in both your program and your test files. They must match exactly. Even a difference of one bit or one character will cause the test to fail.
- **Commands to check the result of a test are causing the test to fail when they're not supposed to**
    - Re-run test-runner.js at verbose level 1 or higher to see the error messages of the commands that failed.
    - If the error is unrelated to your test, then there is likely another issue which is causing them to register a failure. Any command that runs into an error will cause test-runner.js to register a failure.
    - Refer to troubleshooting for the specific commands in question, if available.
- **The final score shows less tests than the number which I wrote**
    - Ensure that your test files are named correctly.
    - Ensure that your tests are numbered sequentially, beginning at 1, and there are no gaps between test numbers (see [3 - Writing your Tests](#3---writing-your-tests)).

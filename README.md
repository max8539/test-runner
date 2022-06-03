# test-runner.js
**A script to automate building and testing of your programs**

## General information
test-runner.js is a script which can be used to automate testing of programs. It was originally made to help test small programs written in C, which lacks its own dedicated testing framework, however it can be used to test programs written in many languages, provided that they run in the terminal and make use of standard IO streams (`stdin`, `stdout` and `stderr`).

test-runner.js is run using Node.js. If not already installed on your system, you may download it from the [officlal Node.js website](https://nodejs.org/), or consider using a version manager like [nvm](https://github.com/nvm-sh/nvm).

test-runner.js should work on most Linux and Unix-like systems. It will also likely work on macOS.test-runner.js does not currently work on Windows due to differences in command line syntax between Unix-like systems and Windows.

**test-runner.js Copyright © 2022 Max Yuen.  Licensed under the Apache License, Version 2.0. See [https://www.apache.org/licenses/LICENSE-2.0](https://www.apache.org/licenses/LICENSE-2.0)**

*It is kindly asked that if you include files from this repository in your projects and their repositories, that you do not remove ownership information, licensing information and references to this repository from the files.*

## Your Download Should Come With the Following Files:
- `test-runner.js` - the script to be run
- a `.gitignore` file
- a `LICENSE` FILE
- a `tests` directory containing:
    - `testconfig.json` - a file containing settings used for building and testing
    - `exampletest1.in.txt` and `exampletest1.out.txt` - a sample test input and test output file
- this `README.md` and an accompanying `README.pdf` containing the same information

If any files are missing, or have since been updated to a newer version, you can re-download them from https://github.com/max8539/test-runner

## Release History
**v0.9.2 License change (latest)**
v0.9.1 Licensing and incomplete documentation 
v0.9.0 Code pre-release

# How to Use

### Contents

**1 - Setting Up your Project for Testing**  
**2 - Configuring Test Settings**  
**3 - Writing your Tests**  
    *3.1 - Input Test File*  
    *3.2 - Output Test File*  
    *3.3 - Error Test File*  
    *3.4 - File Output File*  
    *3.5 - Expected Error File*  
    *3.6 - Example `tests` Directory*  
**4 - Running the Script**  

## 1 - Setting Up your Project for Testing
Copy test-runner.js and the `tests` directory, including its contents, in the root directory of your project. Other files included need not be copied.  

## 2 - Configuring Test Settings

## 3 - Writing your Tests
Each test consists of a minimum of 2, up to a maximum of 4 files. All tests consist of a stdin file, and one or more of a stdout file, a stderr file, and a file that should be created by the program, You may also create a file to signal to the testing script that a non-zero exit code is expected for this test. All test files should be placed inside the `tests` directory, and tests should be numbered sequentially, beginning with `1`.

**WARNING:** Ensure that your test files are placed in the `tests` directory, they are named exactly as specified, and tests are numbered sequentially beginning with 1, or test-runner.js will not be able to find them.

### 3.1 - Input Test File
The first file to create is the input file. The contents of this file should be exactly what is passed to the `stdin` of your program. It should be named `testX.in.txt`, where `X` is the number of your test, e.g. `test1.in.txt`. This file is required for every test you write.
If your program prompts for inputs multiple times, each input should be placed on a separate line, with exactly one newline character separating each input. If no input is needed, leave the file empty.

### 3.2 - Output Test File
One of the files you can create for your program to be checked against is an output file. This should contatin exactly what is expected in the `stdout` of your program for a given test's input, including any newlines and whitespace that is output. If nothing is expected on `stdout`, leave the file empty. This file should be named `testX.out.txt`, where `X` is the number of your test, e.g. `test1.out.txt`. If this file is not included, your program's `stdout` will not be checked.

### 3.3 - Error Test File
One of the files you can create for your program to be checked against is an error file. This should contatin exactly what is expected in the `stderr` of your program for a given test's input, including any newlines and whitespace that is output. This file should be named `testX.err.txt`, where `X` is the number of your test, e.g. `test1.err.txt`.

### 3.4 - File Output File
One of the files you can create for your program to be checked against is a file whose contents exactly match the expected contents of a file which your program will create for a given test's input. The name of the file should begin as `testX.file`, where `X` is the number of your test. A file extension of your choice may be affixed, however this must match the file extension of the filename specified at `checkFile` in `tests/testconfig.json`. An example for a `pdf` file may look like `test1.file.pdf`. Only include this file if your program is expected to output a file during that test.

### 3.5 - Expected Error File
One of the files you can create for your program to be checked against is a file signalling to test-runner.js that your program should run into an error while running, and return a non-zero exit code. If this file is included in your test, and your program finishes normally with an exit code of `0`, the test will fail. This file should be named `testX.error`, where `X` is the number of your test, e.g. `test1.error`.  
If this file is not included, test-runner.js will expect your program to finish normally with an exit code of `0`. Any non-zero exit code will cause the test to fail.

### 3.6 - Example `tests` Directory
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

## 4 - Running the Script





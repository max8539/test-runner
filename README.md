# test-runner.js
A script to automatically build your programs and run tests on them.

## Your download should come with the following files:
- `test-runner.js` - the script to be run
- a `tests` directory containing:
    - `testconfig.json` - a file containing settings used for building and testing
    - `exampletest1.in.txt` and `exampletest1.out.txt` - a sample test input and test output file
- this `README.md` and an accompanying `README.pdf` containig the same information
If any files are missing, you can re-download them from 

# How to use
## 1. Setting up your project for testing
Place the `test-runner.js` and the `tests` directory, including its contents, in the root directory of your project. 

## 2. Writing your tests
Each test consists of a minimum of 2, up to a maximum of 4 files. All tests consist of a stdin file, and one or more of a stdout file, a stderr file, a file that should be created by the program, and a file to signal to the testing script that a non-zero exit code is expected for this test.

The first file to create is the input file. The contents of this file should be exactly what is passed to the `stdin` of your program. If your program prompts for inputs multiple times 



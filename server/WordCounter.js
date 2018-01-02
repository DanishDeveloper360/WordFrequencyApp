const { createInterface } = require("readline");
const {
  createReadStream,
  writeFile,
  appendFile,
  readdir,
  readFile,
  unlink
} = require("fs");
const splitFile = require("split-file");
const path = require("path");

class WordCounter {
  /**
   * Constructor
   * @param filePath {String}
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.wordsMap = new Map();
    this.regExp = /[ \t\n\r]+/;
  }

  /**
   * Reads and processes file line by line
   */
  mapWords(cb) {
    try {
      // Clearing all files from Map Files folder

      let reader = createInterface({
        input: createReadStream(this.filePath)
      });

      let _wordsMap = this.wordsMap;
      let _filePath = this.filePath;
      reader.on("line", line => this._readLine(line));

      reader.on("close", function() {
        let textWords = "";
        _wordsMap.forEach((value, key) => {
          textWords += key + " " + value + "\r\n";
        });

        appendFile(
          "./Files/MappedFiles/" + Math.random() + "_mappedWords.txt",
          textWords,
          function(err) {
            if (err) {
              console.log(err);
              throw err;
            }
            cb();
          }
        );
      });
    } catch (e) {
      console.log(e);
    }
  }

  reduceWords(cb) {
    let filePath = this.filePath;
    let reduceLine = this._reduceLine.bind(this);
    let isPrime = this._isPrime.bind(this);
    let _wordsMap = this.wordsMap;
    readdir(filePath, function(err, filenames) {
      if (err) {
        console.log(err);
        return;
      }

      var noOfFiles = filenames.length;

      filenames.forEach(function(filename) {
        let reader = createInterface({
          input: createReadStream(filePath + filename)
        });

        reader.on("line", line => reduceLine(line, _wordsMap));

        reader.on("close", function() {
          noOfFiles--;

          if (noOfFiles === 0) {
            let textWords = "";
            _wordsMap.forEach((value, key) => {
              let isPrimeOrNot = isPrime(value)
                ? " A Prime Number"
                : " Not Prime";

              textWords += key + " " + value + isPrimeOrNot + "\r\n";
            });
            let reducedFilePath =
              "./Files/ReducedFiles/" + Math.random() + "_ReducedWords.txt";
            appendFile(reducedFilePath, textWords, function(err) {
              if (err) {
                console.log(err);
                cb(err);
              }

              cb(null, reducedFilePath);
            });
          }
        });
      });
    });
  }

  async splitFile() {
    try {
      let data = await splitFile.splitFileBySize(this.filePath, 150000);
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  clearMapDirectory() {
    let directory = "./Files/MappedFiles/";
    readdir(directory, function(err, files) {
      if (err) {
        throw err;
      }

      files.forEach(file => {
        unlink(path.join(directory, file), err => {
          if (err) throw err;
        });
      });
    });
  }

  /**
   * Updates tree with the words contained in line
   * @param line {String}
   * @private
   */
  _readLine(line = "") {
    let wordsArray = line
      .trim()
      .toLocaleLowerCase()
      .split(this.regExp);

    let wordMap = this.wordsMap;
    wordsArray.forEach(function(word) {
      word = word.replace(/[^\w\s]/gi, "");
      if (word) wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });
  }

  _reduceLine(line = "", wordMap) {
    let wordsArray = line.trim().split(" ");

    if (wordsArray.length == 2) {
      let word = wordsArray[0];
      let count = parseInt(wordsArray[1]);
      word = word.replace(/[^\w\s]/gi, "");
      if (word) this.wordsMap.set(word, (this.wordsMap.get(word) || 0) + count);
    }

    // let wordMap = this.wordsMap;
    // wordsArray.forEach(function(word) {
    //   if (word)
    // });
  }

  /**
   * Checks if a number is prime or not
   * @param num {Number}
   */
  _isPrime(num) {
    try {
      num = parseInt(num);
      for (let i = 2, s = Math.sqrt(num); i <= s; i++)
        if (num % i === 0) return false;
      return num !== 1;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = WordCounter;

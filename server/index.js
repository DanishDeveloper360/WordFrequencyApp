var jsonServer = require("json-server");
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const WordCounter = require("./WordCounter");
const axios = require("axios");
const fileUpload = require("express-fileupload");
const fs = require("fs");

var jwtSecret = "JWT_SECRET";

var user = {
  email: "user@example.com",
  password: "secret"
};

var app = jsonServer.create();

app.use(cors());
app.use(bodyParser.json());
// app.use(expressJwt({secret: jwtSecret}).unless({path: ['/login']}));

// default options
app.use(fileUpload());

const dir =__dirname + "\\Files";
const dirMap = __dirname + "\\Files\\MappedFiles";
const dirReduce = __dirname + "\\Files\\ReducedFiles";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

if (!fs.existsSync(dirReduce)) {
  fs.mkdirSync(dirReduce);
}

if (!fs.existsSync(dirMap)) {
  fs.mkdirSync(dirMap);
}

app.post("/processFileUpload", function(req, res) {
  if (!req.files) return res.status(400).send("No files were uploaded.");

  try {
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    let fileName = sampleFile.name + Math.random() + ".txt";

    let file = __dirname + "\\Files\\" + fileName;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(file, async function(err) {
      if (err) return res.status(500).send(err);

      const response = await getData(
        "http://localhost:8081/ProcessWordCount/" + fileName
      );

      if (response.data) {
        res.download(response.data);
      } else res.send("Error processing file... please try again !!");
    });
  } catch (error) {
    res.send("Error processing file... please try again !!");
  }
});

async function getData(url) {
  const res = await axios.get(url);
  return res;
}

async function postData(url, data) {
  const res = await axios.post(url, data);
  return res;
}

app.get("/download", function(req, res) {
  if (!req.params || !req.params.fileName) {
    res.send("Invalid File Name!!");
    return;
  }
  var file = __dirname + req.params.fileName;
  res.download(file); // Set disposition and send it.
});

app.get("/ProcessWordCount/:fileName", async function(req, res) {
  if (!req.params || !req.params.fileName) {
    res.send(null);
    return;
  }

  let _fileName = req.params.fileName;

  const wordCounterObj = new WordCounter("./Files/" + _fileName);

  wordCounterObj.clearMapDirectory();

  let names = await wordCounterObj.splitFile();

  let noOfFiles = names.length;

  if (noOfFiles) {
    names.forEach(async function(element) {
      let response = await postData("http://localhost:8081/MapTextFileApi", {
        filePath: element
      });

      if (response) noOfFiles--;

      if (noOfFiles == 0) {
        let reduxedRespose = await getData(
          "http://localhost:8081/TextFileReduceApi"
        );
        console.log("File Processing Complete");

        var file = __dirname + reduxedRespose.data.replace("./", "/");
        res.send(file);
      }
    });
  }
});

app.post("/MapTextFileApi", async function(req, res) {
  var fileName = req.body.filePath;

  let _wordCounter = new WordCounter(fileName);
  await _wordCounter.mapWords(function() {
    res.send(fileName + "_mappedWords.txt");
  });
});

app.get("/TextFileReduceApi", function(req, res) {
  // var fileName = req.body.filePath;

  let _wordCounter = new WordCounter("./Files/MappedFiles/");
  _wordCounter.reduceWords(function(err, reducedFilePath) {
    if (err) {
      res.send(err);
      return;
    }

    res.send(reducedFilePath);
  });
});

app.use(jsonServer.defaults());

app.listen(8081);

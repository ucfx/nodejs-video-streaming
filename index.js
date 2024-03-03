const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get("/video", function (req, res) {
  // Ensure that a range is provided for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 17MB)
  const videoPath = path.join(__dirname, "video/timer.mp4");
  const videoSize = fs.statSync(videoPath).size;

  // Parse Range
  // Example: "bytes=3407898-"
  const CHUNK_SIZE = 128 * 1024; // 128KB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video
  videoStream.pipe(res);
});

app.listen(5000, function () {
  console.log("Listening on port 5000!");
});

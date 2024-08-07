const express = require("express");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const multer = require("multer");
const { Readable } = require("stream");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3500;

app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/screenrecorder", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const conn = mongoose.connection;

let gfs;
conn.once("open", () => {
  gfs = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  console.log("GridFS initialized successfully");
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.send("Hello");
});

app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const readableVideoStream = new Readable();
  readableVideoStream.push(req.file.buffer);
  readableVideoStream.push(null);

  const filename =
    "recording-" + Date.now() + path.extname(req.file.originalname);
  const writeStream = gfs.openUploadStream(filename, {
    contentType: req.file.mimetype,
    metadata: req.file,
  });

  readableVideoStream.pipe(writeStream);

  writeStream.on("finish", (file) => {
    console.log("File uploaded successfully:", file);
    res.status(200).send("Video uploaded successfully");
  });

  writeStream.on("error", (err) => {
    console.error("Error uploading file:", err);
    res.status(500).send("Error uploading file");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

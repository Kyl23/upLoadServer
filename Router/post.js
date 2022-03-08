const express = require("express");
const router = express.Router();
const upload = require("express-fileupload");

let date = new Date();
let lastToken = (
  date.getMilliseconds().toString() + date.getHours().toString()
).substring(0, 4);
console.log("token updated " + lastToken);
setInterval(() => {
  lastToken = ((lastToken ^ Date.now() ^ date.getHours()) % 10000).toString();
  console.log("token updated " + lastToken);
}, 15000);

let table = {};
router.post("/verify", express.json(), (req, res) => {
  if (req.body.token !== lastToken) res.send("err");
  else {
    let cookies = (lastToken ^ Date.now()).toString();
    table[cookies] = 1;
    res.send(cookies);
  }
});
router.get("/", (req, res) => {
  if (
    req.socket.remoteAddress === "::1" ||
    req.socket.remoteAddress === "::ffff:127.0.0.1"
  ) {
    res.send(
      `<h1>${lastToken}</h1><script>setTimeout(()=>{document.location = document.location},5000)</script>`
    );
    return;
  }
  res.sendFile(__dirname + "/index.html");
});
router.post(
  "/",
  upload({ useTempFiles: true, tempFileDir: "../UPLOADS/temp/" }),
  express.urlencoded({ extended: false }),
  (req, res) => {
    if (table[req.body.token] && req.files) {
      let files = req.files.file;
      let respondMSG = "success";
      if (Array.isArray(files)) {
        files.map((file) => {
          file.mv("../UPLOADS/" + file.name, (err) => {
            if (err) {
              respondMSG = "err";
            }
          });
          console.log("success write a file: " + file.name);
        });
      } else {
        files.mv("../UPLOADS/" + files.name, (err) => {
          if (err) {
            respondMSG = "err";
          }
        });
        console.log("success write a file: " + files.name);
      }
      delete table[req.body.token];
      res.send(respondMSG);
    } else {
      delete table[req.body.token];
      res.send("4xx error");
    }
    console.log(table);
  }
);

module.exports = router;

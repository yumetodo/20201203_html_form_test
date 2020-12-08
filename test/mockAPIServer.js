/* =============================================================================
  Copyright (C) 2020 yumetodo <yume-wikijp@live.jp>
  Distributed under the Boost Software License, Version 1.0.
  (See https://www.boost.org/LICENSE_1_0.txt)
============================================================================= */
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
app.use(cors());
app.post("/image", (req, res) => {
	res.contentType("text/plain; charset=utf-8").send("69d4cba0888b13237a717c9edd80fff8");
});
app.post("/producers", (req, res) => {
	res.status(201).contentType("text/plain; charset=utf-8").send("hviuajsgdbafydualbhjvyahuvkbkxajbda");
});
app.listen(port, () => {
	console.log(`mock api server listening at http://localhost:${port}`);
});

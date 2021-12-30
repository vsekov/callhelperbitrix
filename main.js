var _ = require("underscore");
const utils = require("./utils");
var express = require("express");

const mongo = require("mongodb");
const client = new mongo.MongoClient(
  ""
);

var app = express();

const appLocals = require("./app.locals");

app.locals = appLocals;

app.set("view engine", "ejs");

app.use("/static", express.static(appLocals.static));

app.get("/", function (req, res) {
  res.render(appLocals.pages + "index.ejs");
});

app.get("/editor", async function (req, res) {
  var scripts = await getScriptsOfDomain("domainName");
  
  // console.log(scripts);
  pageName = "Редактор скриптов";
  var element_with_id = "";
  if (req.query["pageId"] && req.query["pageId"].length > 0) {
    element_with_id = utils.getObjects(scripts, "id", req.query["pageId"]);
    if (element_with_id) {
      pageName += ": " + element_with_id[0].name;
    }
  } else {
    var obj = {
      json: scripts,
      title: "Скрипты продаж",
      pageName: pageName,
    };
    return res.render(appLocals.pages + "editor.ejs", obj);
  }
  var obj = {
    json: scripts,
    title: "Скрипты продаж",
    pageName: pageName,
    pageData: element_with_id[0],
  };
  res.render(appLocals.pages + "editor.ejs", obj);
});

app.get("/view", async function (req, res) {
  var scripts = await getScriptsOfDomain("domainName");
  pageName = "Начало";
  var element_with_id = "";
  if (req.query["pageId"] && req.query["pageId"].length > 0) {
    element_with_id = utils.getObjects(scripts, "id", req.query["pageId"]);
    if (element_with_id) {
      pageName = element_with_id[0].name;
    }
  } else {
    var obj = {
      json: scripts,
      title: "Скрипты продаж",
      pageName: "Скрипты продаж",
    };
    return res.render(appLocals.pages + "initialViewScript.ejs", obj);
  }
  var obj = {
    json: scripts,
    title: "Скрипты продаж",
    pageName: pageName,
    pageData: element_with_id[0],
  };
  res.render(appLocals.pages + "viewScript.ejs", obj);
});

app.listen(3000);

const getScriptsOfDomain = async (domainName) => {
  try {
    await client.connect();
    console.log("Соединение установлено");
    var scripts = await client
      .db()
      .collection(`${domainName}_scripts`)
      .find()
      .toArray();
    return scripts;
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
};

const getListOfDomains = async () => {
  try {
    await client.connect();
    console.log("Соединение установлено");
    var domains = await client.db().collection(`domains`).find().toArray();
    return domains;
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
};
const addScriptToDomain = async (domainName, script) => {
  try {
    await client.connect();
    const collection = db.collection(`${domainName}_scripts`);
    const result = await collection.insertOne(script);
    console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}
const deleteScriptFromDomain = async (domainName, id) => {
  try {
    await client.connect();
    const collection = db.collection(`${domainName}_scripts`);
    const result = await collection.deleteOne({ id: id });
    console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}
const replaceScriptFromDomain = async (domainName, id, data) => {
  try {
    await client.connect();
    const collection = db.collection(`${domainName}_scripts`);
    const result = await collection.replaceOne({ id: id }, data);
    console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}
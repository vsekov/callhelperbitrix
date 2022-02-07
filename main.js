const io = require('@pm2/io');

var _ = require("underscore");
const utils = require("./utils");
var express = require("express");

const mongo = require("mongodb");
const client = new mongo.MongoClient(
  'mongodb+srv://root:z123456@cluster0.dt8nz.mongodb.net/test?authSource=admin&replicaSet=atlas-jvzjfm-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'
);

const registeredDomains = io.metric({
  name: 'Registered Domains'
})


setInterval(async () => {
  let domainsCount = await getListOfDomains();
  registeredDomains.set(domainsCount.length);
  // console.log(domainsCount.length);
}, 10000);

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var app = express();

const appLocals = require("./app.locals");

app.locals = appLocals;

app.set("view engine", "ejs");

app.use("/static", express.static(appLocals.static));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.post("/", function (req, res) {
  res.render(appLocals.pages + "index.ejs");
});
app.get("/", function (req, res) {
  res.render(appLocals.pages + "index.ejs");
});

app.all("/editor", urlencodedParser, async function (req, res) {
  console.log(req.body);

  //checking get and post methods request param
  if (req.query["request"] && req.query["request"].length > 0) {
    let request = req.query["request"];
    if (request == "addScript") {
      if (req.body["newScript"] && req.body["newScript"].length > 0) {
        await addScriptToDomain("domainName", req.body["newScript"]);
      }
    }


    if (request == "addAnswer") {
      if (req.body["newAnswer"] && req.body["newAnswer"].length > 0) {
        let allScripts = await getScriptsOfDomain("domainName");
        let script = getObjects(allScripts, "id", getObjects(allScripts, "id", req.query["parentId"])[0]["mainId"])[0];
        await addPageByPageId("domainName", script["mainId"], req.query["parentId"], req.body["newAnswer"]);
      }
    }

    else if (request == "changeText") {
      if (req.body["operatorText"] && req.body["operatorText"].length > 0) {
        //getting object of script by getting mainId of object with given id
        let allScripts = await getScriptsOfDomain("domainName");
        let script = getObjects(allScripts, "id", getObjects(allScripts, "id", req.query["pageId"])[0]["mainId"])[0];
        // console.log(script);
        let ssad = await changeBySearch(script, "id", req.query["pageId"], "text", req.body["operatorText"]);
        await replaceScriptFromDomain("domainName", script["id"], ssad);
      }
    }
    else if (request == "changeName") {
      if (req.body["pageName"] && req.body["pageName"].length > 0) {
        //getting object of script by getting mainId of object with given id
        let allScripts = await getScriptsOfDomain("domainName");
        let script = getObjects(allScripts, "id", getObjects(allScripts, "id", req.query["changeId"])[0]["mainId"])[0];
        // console.log(  getObjects(allScripts, "id", req.query["changeId"])[0]["mainId"]  );
        // console.log(  getObjects(allScripts, "id", "f34fsddasddsf" ) );
        // console.log( getObjects(script, "id", req.query["changeId"])[0]["name"] );
        let ssad = await changeBySearch(script, "id", req.query["changeId"], "name", req.body["pageName"]);
        // console.log( getObjects(ssad, "id", req.query["changeId"]) );
        await replaceScriptFromDomain("domainName", script["id"], ssad);
      }
    }
  }

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

app.all("/editor", async function (req, res) {

  //deleteScript request processing 
  if (req.query["deleteScript"] && req.query["deleteScript"].length > 0) {
    let deleteScriptId = req.query["deleteScript"];
    await deleteScriptFromDomain("domainName", deleteScriptId);
  }
  else if (req.query["delete"] && req.query["delete"].length > 0) {
    let deleteId = req.query["delete"];
    let allScripts = await getScriptsOfDomain("domainName");
    // console.log(  getObjects(allScripts, "id", getObjects(allScripts, "id", deleteId)[0]["mainId"])[0]  );
    let script = getObjects(allScripts, "id", getObjects(allScripts, "id", deleteId)[0]["mainId"])[0];
    script = await removeAnswerBySearch(script, deleteId);
    // console.log(JSON.stringify(script, null, 4));
    console.log(await replaceScriptFromDomain("domainName", script["mainId"], script));
  }

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

app.all("/view", async function (req, res) {
  var scripts = await getScriptsOfDomain("domainName");
  // console.log(scripts);
  pageName = "Начало";
  var element_with_id = "";
  if (req.query["pageId"] && req.query["pageId"].length > 0) {
    element_with_id = utils.getObjects(scripts, "id", req.query["pageId"]);
    if (element_with_id) {
      pageName = element_with_id[0].name;
    }
  } else {
    var obj = {
      data: JSON.stringify(req.body),
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

  await addScoreByPageId("domainName", element_with_id[0].mainId, element_with_id[0].id);

  res.render(appLocals.pages + "viewScript.ejs", obj);
});

app.listen(process.env.PORT || 3000);

const getScriptsOfDomain = async (domainName) => {
  try {
    await client.connect();
    const db = client.db("callhelper");
    console.log("Соединение установлено");
    var scripts = await db
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
    const db = client.db("callhelper");
    console.log("Соединение установлено");
    var domains = await db.collection(`domains`).find().toArray();
    return domains;
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
};
const addScriptToDomain = async (domainName, scriptName) => {
  try {
    await client.connect();
    const db = client.db("callhelper");
    const collection = db.collection(`${domainName}_scripts`);
    let newId = generateId();
    const result = await collection.insertOne({
      "mainId": newId,
      "id": newId,
      "name": scriptName,
      "text": "Неотредактированный текст оператора",
      "answers": [],
      "clicks": 0
    });
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
    const db = client.db("callhelper");
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
    const db = client.db("callhelper");
    const collection = db.collection(`${domainName}_scripts`);
    const result = await collection.replaceOne({ id: id }, data);
    console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

// * updating
var searchId = "id", // Your search key
  searchValue = "asdav123vnhfsd32das32",
  foundValue, // Populated with the searched object
  found = false; // Internal flag for iterate()

// Recursive function searching through array
function iterate(haystack) {
  if (typeof haystack !== 'object' || haystack === null) return; // type-safety
  if (typeof haystack[searchId] !== 'undefined' && haystack[searchId] == searchValue) {
    found = true;
    foundValue = haystack;
    return;
  } else {
    for (var i in haystack) {
      // avoid circular reference infinite loop & skip inherited properties
      if (haystack === haystack[i] || !haystack.hasOwnProperty(i)) continue;

      iterate(haystack[i]);
      if (found === true) return;
    }
  }
}

function changeBySearch(obj, sId, sValue, key, value) {
  searchId = sId;
  searchValue = sValue;
  found = false;
  foundValue = undefined;
  iterate(obj);
  if (value == "+1") {
    foundValue[key] += 1;
  }
  else {
    foundValue[key] = value;
  }
  return obj;
}



const addScoreByPageId = async (domainName, mainId, cid) => {
  try {
    await client.connect();
    console.log("Соединение установлено");
    const db = client.db("callhelper");
    const collection = db.collection(`${domainName}_scripts`);
    var scripts = await collection.find({ 'mainId': mainId }).toArray();
    scripts = scripts[0];
    scripts = changeBySearch(scripts, "id", cid, "clicks", "+1");
    console.log(scripts.answers[1].answers);

    var zhoz = await collection.replaceOne({ 'mainId': mainId }, scripts);
    console.log(zhoz);
    return zhoz;
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }

}


var crypto = require("crypto");
const { json } = require("express/lib/response");
function generateId() {
  return crypto.randomBytes(20).toString('hex');
}

function AddBySearch(obj, sId, sValue, value) {
  searchId = sId;
  searchValue = sValue;
  found = false;
  foundValue = undefined;
  iterate(obj);
  foundValue.answers.push(value)
  return obj;
}



const addPageByPageId = async (domainName, mainId, cid, pageName) => {
  try {
    await client.connect();
    console.log("Соединение установлено");
    const db = client.db("callhelper");
    const collection = db.collection(`${domainName}_scripts`);
    var scripts = await collection.find({ 'mainId': mainId }).toArray();
    scripts = scripts[0];
    scripts = AddBySearch(scripts, "id", cid, {
      "mainId": mainId,
      "parentId": cid,
      "id": generateId(),
      "name": pageName,
      "text": "Неотредактированный текст оператора",
      "answers": [],
      "clicks": 0
    });
    // console.log(scripts.answers[1].answers);

    var zhopa = await collection.replaceOne({ 'mainId': mainId }, scripts);
    console.log(zhopa);
    return zhopa;
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }

}

// * сначала ищет объект с выбранным айди, его parentId будет searchValue, а searchId будет "id"
// * находит этот объект и удаляе  
function removeAnswerBySearch(obj, deleteId) {
  searchId = 'id';
  searchValue = getObjects(obj, "id", deleteId)[0]["parentId"];
  found = false;
  foundValue = undefined;
  iterate(obj);
  console.log(`foundValue: ` + foundValue);
  foundValue.answers.splice(foundValue["answers"].findIndex(e => e.id === deleteId), 1);
  // foundValue[key] = value;

  return obj;
}
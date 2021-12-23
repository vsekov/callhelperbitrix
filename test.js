function getRandomColor() {
  var letters = "ABCDEF12345678".split("");
  var color = "";
  for (var i = 0; i < 6; i++) {
    var need = letters[Math.floor(Math.random() * letters.length)];
    if(i==0)while(!isNaN(parseInt(need, 10))){
      // console.log(need+' '+parseInt(need, 10)+'\n');
      need = letters[Math.floor(Math.random() * letters.length)];}
    color += need;
  }
  return color;
}

const mongo = require('mongodb')

const client = new mongo.MongoClient('mongodb+srv://root:z123456@cluster0.dt8nz.mongodb.net/callhelper?retryWrites=true&w=majority')

const getScriptsOfDomain = async (domainName) => {
  var scripts;
  try{
    await client.connect()
    console.log('Соединение установлено')
    scripts = JSON.stringify(await client.db().collection(`${domainName}_scripts`).find().toArray());
    return scripts;
  } catch(e){
    console.log(e)
  } finally{
    await client.close();
  }
}


const getListOfDomains = async () => {
  try{
    await client.connect()
    console.log('Соединение установлено')
    var domains = JSON.stringify(await client.db().collection(`domains`).find().toArray());
    console.log(domains);
    return domains;
  } catch(e){
    console.log(e)
  } finally{
    await client.close();
  }
}

getListOfDomains();
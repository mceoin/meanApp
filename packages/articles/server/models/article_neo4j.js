var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO_DB || 'http://localhost:7474'); // move this to config environment later
var ArticleSchema = require('./article');
var ArticlePaths = ArticleSchema.paths;
// console.log(db.query(
//   'MATCH n WHERE n._id="553c884332175288c054ce49" RETURN n LIMIT 1'
//   , function(err, node){
//     console.log(err)
//     console.log(node[0].n.data)
//   }), "findBy")
/**
 * Pre-save hook
 */

var createGraphNode = function(mongooseObject){
  var dataObject = new Object;
  for (var key in ArticlePaths) {
    if (ArticlePaths.hasOwnProperty(key) && key !== '__v') {
        dataObject[key] = mongooseObject[key]
        console.log(dataObject[key])
        // console.log(key + " -> " + ArticlePaths[key]);
    }
  }

  var node = db.createNode(dataObject);     // instantaneous, but...

  node.save(function (err, node) {    // ...this is what actually persists.
    if (err) {
        console.error('Error saving new node to database:', err);
    } else {
        console.log('Node saved to database with id:', node.id);
    }
  });

}


var updateGraphNode = function(mongooseObject){
  var dataObject = new Object;
  for (var key in ArticlePaths) {
    if (ArticlePaths.hasOwnProperty(key) && key !== '__v') {
        dataObject[key] = mongooseObject[key]
        console.log(dataObject[key])
        // console.log(key + " -> " + ArticlePaths[key]);
    }
  }

  var nodey = db.query(
  'MATCH n WHERE n._id="'+dataObject._id+'" RETURN n LIMIT 1'
  , function(err, node){
    console.log(err)
    console.log(node)
  })


  // node.save(function (err, node) {    // ...this is what actually persists.
  //   if (err) {
  //       console.error('Error saving new node to database:', err);
  //   } else {
  //       console.log('Node saved to database with id:', node.id);
  //   }
  // });

}



ArticleSchema.pre('save', function(next) {
  console.log("firing from ArticleSchema.pre(save...)");
  console.log(this);
  if (this.isNew === true){
    createGraphNode(this);
  } else{
    updateGraphNode(this);
  }

  next();
})
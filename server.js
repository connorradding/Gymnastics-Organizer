const express = require('express');
var exphbs = require("express-handlebars")
let fileUpload = require("express-fileupload")

const app = express();
const PORT = 3000;
let fs = require("fs")

let compData = require("./static/competitionList.json")
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(express.json()); // Middleware to parse JSON bodies

// Serve static files from the `public` directory
app.use(express.static('static'));

// The POST route to create a new competition

app.get("/", function(req, res){
  res.status(200).render("mainPage", {
    comp: compData
  })
})

app.post("/create-competition", function(req, res){
  let newCompData = {
    id: compData.length,
    name: req.body.name,
    code: req.body.code,
    events: []
  }

  compData.push(newCompData)

  fs.writeFile("./static/competitionList.json", JSON.stringify(compData, null, 2), function(err){
    if(err){
      res.status(500).send("Error writing competition data");
    }
    else{
      res.status(200).send("Successfully wrote competition data");
    }
  })
})

app.get("/competition-page/:id", function(req, res){
  let compID = req.params.id

  let specComp = compData[compID]

  if(specComp){
    res.status(200).render("competitionPage", {
      comp: specComp
    })
  }
  else{
    res.status(404).send("Competition not found")
  }
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
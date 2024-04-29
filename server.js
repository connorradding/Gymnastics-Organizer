const express = require('express');
var exphbs = require("express-handlebars")
let fileUpload = require("express-fileupload")

const axios = require('axios');

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

function sortScores(scores) {
  scores.sort((a, b) => b.score - a.score);
  return scores;
}

app.post("/updateScore", function(req, res) {
  console.log(req.body)
  const {name, score, eventName, levelName, id } = req.body;
  console.log("===  all variables: ", score, name, eventName, levelName, id)

  // Parse the competition ID as an integer.
  const compID = parseInt(id, 10);
  // Find the competition using the parsed ID.
  const competition = compData.find(comp => comp.id === compID);

  console.log("competiton: ", competition)
  if (!competition) {
      console.log("No comp")
      return res.status(404).send("Competition not found");
  }

  // Find the specific level within the competition.
  const level = competition.levels.find(lvl => lvl.levelName === levelName);
  console.log("level: ", level)
  if (!level) {
    console.log("No level")
      return res.status(404).send("Level not found");
  }

  // Find the specific gymnast within the level.
  const gymnast = level.gymnasts.find(gym => gym.gymnastName === name);
  console.log("gymnast: ", gymnast)
  if (!gymnast) {
      console.log("No gymnast")
      return res.status(404).send("Gymnast not found");
  }

  // Find the specific event for the gymnast.
  const event = gymnast.competingEvents.find(evt => evt.eventName === eventName);
  console.log("Event: ", event)
  if (!event) {
    console.log("No event")
      return res.status(404).send("Event not found");
  }

  // Update the score for the event.
  event.score = score;

  // Write the updated data back to your JSON file.
  fs.writeFile("./static/competitionList.json", JSON.stringify(compData, null, 2), function(err) {
      if (err) {
          console.error("Error writing to file:", err);
          return res.status(500).send("Error writing score data");
      }
      res.send("Score updated successfully");
  });
});

app.post("/create-competition", function(req, res){
  let compID = compData.length

  let newCompData = {
    id: compData.length,
    name: req.body.name,
    code: req.body.code,
    events: [],
    levels: []
  }

  compData.push(newCompData)

  fs.writeFile("./static/competitionList.json", JSON.stringify(compData, null, 2), function(err){
    if(err){
      res.status(500).send("Error writing competition data");
    }
    else{
      res.status(200).json({id: compID});
    }
  })
})

app.get("/competition-page/:id", function(req, res){
  let compID = req.params.id

  let specComp = compData[compID]

  if(specComp){
    res.status(200).render("competitionPage", {
      comp: specComp,
      compID: compID
    })
  }
  else{
    res.status(404).send("Competition not found")
  }
})

app.get("/events-page/:id/:eventName", function(req, res){
  const compIDInt = parseInt(req.params.id, 10);
  const compID = req.params.id
  const eventName = req.params.eventName;
  
  const competition = compData.find(comp => comp.id === compIDInt);

  if (!competition) {
    return res.status(404).send("Competition not found");
  }

  // Filter levels to include only gymnasts competing in the specified event
  const filteredLevels = competition.levels.map(level => ({
    ...level,
    gymnasts: level.gymnasts.filter(gymnast => 
      gymnast.competingEvents.some(event => event.eventName.toLowerCase() === eventName.toLowerCase())
    )
  })).filter(level => level.gymnasts.length > 0); // Remove levels with no competing gymnasts

  res.render('eventsPage', { 
    compName: competition.name, 
    eventName: eventName, 
    levels: filteredLevels,
    compID: compID
  });
})

app.post('/add-event/:compID', function(req, res) {
  const { compID } = req.params;
  const { eventName } = req.body;

  // Find the competition by ID
  const competition = compData.find(comp => comp.id == compID);
  if (!competition) {
      return res.status(404).json({ message: "Competition not found"});
  }

  // Add the new event
  competition.events.push(eventName);

  // Save the updated competitions data
  fs.writeFile("./static/competitionList.json", JSON.stringify(compData, null, 2), function(err) {
      if (err) {
          return res.status(500).json({ message: "Error updating competition with new event"});
      }
      res.status(200).json({ message: "Event added successfully" });
  });
});

// Additional Endpoint: Add a Level to a Specific Competition
app.post('/add-level/:compID', function(req, res) {
  const { compID } = req.params;
  const { levelName } = req.body;

  const competition = compData.find(comp => comp.id == compID);
  if (!competition) {
      return res.status(404).json({ message: "Competition not found"});
  }

  // Assuming levels are unique by their name
  if (competition.levels.some(level => level.levelName === levelName)) {
      return res.status(400).json({ message: "Level already exists"});
  }

  competition.levels.push({
      levelName: levelName,
      gymnasts: []
  });

  fs.writeFile("./static/competitionList.json", JSON.stringify(compData, null, 2), function(err) {
      if (err) {
          return res.status(500).json({ message: "Error updating competition with new level"});
      }
      res.status(200).json({ message: "Event added successfully" });
  });
});

// Additional Endpoint: Add a Gymnast to a Level in a Specific Competition
app.post('/add-gymnast/:compID', function(req, res) {
  console.log(req.body); // You've confirmed this logs correctly.
  const { compID } = req.params;
  const { levelName, gymnastName, eventName } = req.body;

  const competition = compData.find(comp => comp.id.toString() === compID);
  if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
  }

  const level = competition.levels.find(level => level.levelName === levelName);
  if (!level) {
      return res.status(404).json({ message: "Level not found" });
  }

  // Check if the gymnast already exists
  const gymnastExists = level.gymnasts.some(gymnast => gymnast.gymnastName === gymnastName);
  if (gymnastExists) {
    return res.status(400).json({ message: "Gymnast already exists" });
  }

  // Directly use eventName since you've confirmed it's received correctly
  const competingEvents = eventName.map(event => ({
      eventName: event,
      score: null // Assuming score is not set initially
  }));

  level.gymnasts.push({
      gymnastName: gymnastName,
      competingEvents: competingEvents
  });

  fs.writeFile("./static/competitionList.json", JSON.stringify(compData, null, 2), function(err) {
      if (err) {
          console.error("Error writing to file:", err);
          return res.status(500).json({ message: "Error adding gymnast to level" });
      }
      res.json({ message: "Gymnast added successfully" });
  });
});

app.get("/results-page/:compID", async function(req, res) {
  const compID = parseInt(req.params.compID, 10);
  const competition = compData.find(comp => comp.id === compID);

  if (!competition) {
      return res.status(404).send("Competition not found");
  }

  try {
      // Preparing data for each level and event
      const levelsWithSortedResults = await Promise.all(competition.levels.map(async (level) => {
          const sortedEvents = await Promise.all(competition.events.map(async (eventName) => {
              // Extract gymnasts for this event
              const gymnastsForEvent = level.gymnasts.map(gymnast => ({
                  ...gymnast,
                  score: (gymnast.competingEvents.find(event => event.eventName.toLowerCase() === eventName.toLowerCase()) || {}).score
              })).filter(gymnast => gymnast.score !== undefined && gymnast.score !== null);

                return {
                  eventName,
                  gymnasts: sortScores(gymnastsForEvent)
              };
          }));

          return {
              ...level,
              events: sortedEvents
          };
      }));

      res.render("resultsPage", {
          compName: competition.name,
          levels: levelsWithSortedResults,
          compID: compID
      });
  } catch (error) {
      console.error("Error calling sorting microservice:", error);
      res.status(500).send("Error sorting gymnasts");
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
let submitButton = document.getElementById("submit");
if(submitButton){
	submitButton.addEventListener("click", function(){
		createCompetition()
	});
}

function createCompetition() {
    const name = document.getElementById('competition-name').value;
    let code = Math.floor(Math.random() * (99999 - 0 + 1)) + 0; 

    if(!name.trim()){
        alert("You must fill in all the fields")
    }
    else{
        fetch("/create-competition", {
                method: "POST",
                body: JSON.stringify({
                        name: name,
                        code: code
                }),
                headers: {
                        "Content-Type": "application/json"
                }
        })
        .then(response => response.json()) // This expects the response to be JSON
        .then(data => {
            var newCompetition = Handlebars.templates.competitions({
                id: data.id, // Directly use data.id here
                name: name
            });

            var competitionList = document.getElementById("competitions");
            competitionList.insertAdjacentHTML("beforeend", newCompetition);

            alert("Your passcode is: " + code + "\nMake sure to write this down");
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

let submitScoreButtons = document.querySelectorAll('.submit-score');
var button

  // Iterate over each button and attach the event listener
if(submitScoreButtons){
    submitScoreButtons.forEach(button => {
        button.addEventListener('click', function(){
            updateScore(this)
        })
    })
}

let ident = document.getElementById("identify")

function updateScore(submitScoreButton){
    let input = submitScoreButton.previousElementSibling; // Assuming the input is immediately before the button
    let gymnastName = input.getAttribute("data-gymnast-name")
    let eventName = ident.getAttribute("data-event-name")
    let levelName = input.getAttribute("data-level-name")
    let id = ident.getAttribute("data-id")
    let score = input.value;

    console.log(" ==id: ", id)
    console.log(" ==event name: ", eventName)

    if(!score.trim()){
        alert("You must fill in all the fields")
    }
    else{
        fetch("/updateScore", {
            method: "POST",
            body: JSON.stringify({
                name: gymnastName,
                score: score,
                eventName: eventName,
                levelName: levelName,
                id: id
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(function(res){
            if(res.status === 200){
                input.value = ""
            }
        })
    }
}

// Function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

// Function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event listeners for opening modals
document.getElementById('eventBtn').addEventListener('click', function() { openModal('eventModal'); });
document.getElementById('levelBtn').addEventListener('click', function() { openModal('levelModal'); });
document.getElementById('gymnastBtn').addEventListener('click', function() { openModal('gymnastModal'); });

// Event listeners for closing modals
document.querySelectorAll('.close').forEach(function(element) {
    element.addEventListener('click', function() {
        closeModal(this.closest('.modal').id);
    });
});

// Close modals when clicking outside of them
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

//gymnast modal
document.getElementById('submitGymnast').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting through the browser

    const compID = this.getAttribute("data-compid");

    const gymnastName = document.getElementById('gymnastName').value;
    const levelName = document.getElementById('gymnastLevel').value;
    const eventName = Array.from(document.getElementById('gymnastEvent').selectedOptions).map(option => option.value);

    if (!gymnastName.trim() || !levelName || eventName.length === 0) {
        alert("You must fill in all the fields");
        return;
    }

    console.log(eventName)

    fetch(`/add-gymnast/${compID}`, {
        method: "POST",
        body: JSON.stringify({
            gymnastName: gymnastName,
            levelName: levelName,
            eventName: eventName // This could be an array if multiple selection is allowed
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if(response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log(data); // Handle the response data (e.g., showing a success message)
        closeModal('gymnastModal'); // Close the modal upon successful submission
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

//event modal
document.getElementById('submitEvent').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting through the browser

    const compID = this.getAttribute("data-compid");

    const eventName = document.getElementById('eventName').value;

    if (!eventName.trim()) {
        alert("You must fill in the event name.");
        return;
    }

    // Assuming you have an endpoint '/add-event' that expects POST requests
    fetch(`/add-event/${compID}`, {
        method: "POST",
        body: JSON.stringify({
            eventName: eventName
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if(response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log(data); // Handle the response data (e.g., showing a success message)
        closeModal('eventModal'); // Close the modal upon successful submission
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

//level modal
document.getElementById('submitLevel').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting through the browser

    const compID = this.getAttribute("data-compid");

    const levelName = document.getElementById('levelName').value;

    if (!levelName.trim()) {
        alert("You must fill in the level name.");
        return;
    }

    // Assuming you have an endpoint '/add-level' that expects POST requests
    fetch(`/add-level/${compID}`, {
        method: "POST",
        body: JSON.stringify({
            levelName: levelName
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if(response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log(data); // Handle the response data (e.g., showing a success message)
        closeModal('levelModal'); // Close the modal upon successful submission
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
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
        alert("Your passcode is: " + code + "\nMake sure to write this down")
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
    }
}


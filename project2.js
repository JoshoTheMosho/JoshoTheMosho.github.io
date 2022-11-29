let baseURL = "https://www.themealdb.com/api/json/v1/";
let apiKey = "1";
let categoryList = [];
let areaList = [];

let favCategory = null;
let favMeal = null;

let prevData = {}

// Display our food onto the webpage. Includes image, title, area, ingredients, instructions etc
function analyze(json) {

	data = json.meals[0];

	let theInstructions = data.strInstructions.replaceAll('.', '.<br>').replaceAll('<br>)', ')');

	$("#name").html(data.strMeal);
	$("#category").html(data.strArea + ' ' + data.strCategory)
	$("#instructions").html(theInstructions);
	$("#foodImage").attr('src', data.strMealThumb)

	displayIngredients(data);
}

// This ensures ingredients are added correctly to our table
function displayIngredients(json) {
	$("#ingredients").html("<tr\><th\>Ingredients</th\><th>Measurements</th\></tr\>")

	let i = 1;
	while (json['strIngredient' + i]) { // Loop through till we hit the null ingredient, ""
		var newIngredient = $('<tr/>'); 

		newIngredient.append($('<td/>').html(json['strIngredient' + i]));
		newIngredient.append($('<td/>').html(json['strMeasure' + i]));
	
		$("#ingredients").append(newIngredient);

		i++;
	}
}

// Initialize everything, but don't override global variables
// Grabs a random food for the user to rate.
function start() {
	// initialize our variables (for reset)
	categoryList = [];
	categoryMap = {};
	areaList = [];
	areaMap = {};
	favCategory = null;
	favMeal = null;

	// using baseURL + information entered, create full URL
	let random = "random.php";
	let fullURL = baseURL + apiKey + "/" + random;
	
	// Ensure the correct things are displayed on the webpage
	$("#start").hide();
	$("#matchFound").hide();
	$("#randomFood").show();
	$("#food").show();
	
	
	$.get(fullURL, function(data) {
		// The following line outputs the JSON response to the console:
		//console.log(data);
		
		// The following line outputs the JSON response to the webpage:
		// $("#rawJSON").html(JSON.stringify(data));
		
		// The following line gives the JSON response to the analyze
		// function. From there, you can pull information from the JSON
		// response and display things on your webpage.
		analyze(data);

		prevData = data; // Save our data to tally up
	});
}

// Get a new random food. Keep a tally of their favorite categories and areas(countries)
// Category takes priority, once we hit 3 of one or the other, we display random food from there as a match for the user
function getRandomLike() {	
	// using baseURL + information entered, create full URL
	let random = "random.php";
	let fullURL = baseURL + apiKey + "/" + random;

	// Here we have some logic to find what the end users ideal food is
	let category = prevData.meals[0].strCategory;
	let area = prevData.meals[0].strArea;
	let foundCategory = false;
	let foundArea = false;

	// Go through each element in both lists (area and category)
	// Increment by 1, or insert it if it doesn't exist
	// If we hit 3 in one area, we have found a match!
	for(var i = 0; i < categoryList.length; i++) {
		if (categoryList[i][0] == category) {
			
			categoryList[i][1]++;
			foundCategory = true;

			if (categoryList[i][1] >= 3) {
				favCategory = category;
				displayFavorite();
				return;
			}
		}
	}
	for(var j = 0; j < areaList.length; j++) {
		if (areaList[j][0] == area) {

			areaList[j][1]++;
			foundArea = true;

			if (areaList[j][1] >= 3) {
				favArea = area;
				displayFavorite();
				return;
			}
		}
	}

	// Add our new item to the list, and display our next meal
	// Don't add unknown or miscellaneous categories or areas.
	if (category != "Unknown" && category != "Miscellaneous" && foundCategory == false) {
		categoryList.push([category, 1]);
	}
	if (area != "Unknown" && category != "Miscellaneous" && foundArea == false) {
		areaList.push([area, 1]);
	}

	$.get(fullURL, function(data) {

		// The following line gives the JSON response to the analyze
		// function. From there, you can pull information from the JSON
		// response and display things on your webpage.
		analyze(data);

		prevData = data; // Save our data to tally up
	});
}

// Get a new random item to judge
function getRandomDislike() {
	// Grab a random food item
	let random = "random.php";
	let fullURL = baseURL + apiKey + "/" + random;

	$.get(fullURL, function(data) {		
		// The following line gives the JSON response to the analyze
		// function. From there, you can pull information from the JSON
		// response and display things on your webpage.
		analyze(data);

		prevData = data; // Save our data to tally up
	});
}

// Display a random food item in the users 'matched' area or category
function displayFavorite() {
	// using baseURL + information entered, create full URL
	let filter = "filter.php?";
	let lookup = "lookup.php?";

	let categoryUrl = baseURL + apiKey + "/" + filter;
	let foodUrl = baseURL + apiKey + "/" + lookup + "i=";

	if (favCategory != null) {
		categoryUrl = categoryUrl + "c=" + favCategory;
		$("#match").html(favCategory);
	} else {
		categoryUrl = categoryUrl + "a=" + favArea;
		$("#match").html(favArea);
	}	

	// Ensure the correct things on the webpage are displayed
	$("#randomFood").hide();
	$("#matchFound").show();
	
	$.get(categoryUrl, function(foodList) {	
		// Data is a list of items in the category. Lets grab and display a random one
		let randomIndex = Math.floor(Math.random() * foodList.meals.length); // If data has 10 elements, gives index from 0-9
		let foodId = foodList.meals[randomIndex].idMeal;

		foodUrl = foodUrl + foodId;
		$.get(foodUrl, function(data) {
			// The following line gives the JSON response to the analyze
			// function. From there, you can pull information from the JSON
			// response and display things on your webpage.
			analyze(data);
		});
	});
}
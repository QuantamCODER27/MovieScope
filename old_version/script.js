// Script to fetch movies and show them
// Note: Search button doesn't work yet because I'm still learning API

async function loadDefaultMovies() {
    // API stuff
    var apiKey = "b174c362";
    var url = "http://www.omdbapi.com/?s=Star+Wars&apikey=" + apiKey;

    var list = document.getElementById("movie-list");

    try {
        var response = await fetch(url);
        var data = await response.json();

        if (data.Response == "True") {
            list.innerHTML = ""; // clear loading text

            // Use a loop to show all movies
            for (var i = 0; i < data.Search.length; i++) {
                var movie = data.Search[i];
                
                // Create the card
                var html = `
                    <div class="movie-card">
                        <img src="${movie.Poster}" alt="poster">
                        <h3>${movie.Title}</h3>
                        <p>Year: ${movie.Year}</p>
                        <p>Type: ${movie.Type}</p>
                    </div>
                `;
                list.innerHTML = list.innerHTML + html;
            }
        } else {
            list.innerHTML = "Error: No movies found!";
        }
    } catch (e) {
        console.log("Error happened: " + e);
        list.innerHTML = "Something went wrong with the internet!";
    }
}

// Function for the search button
function handleSearch() {
    // I haven't finished this part yet
    alert("I am working on the search feature! Please wait for the next update.");
}

// Set up the button click
document.getElementById("search-button").onclick = handleSearch;

// Load movies when page opens
window.onload = loadDefaultMovies;

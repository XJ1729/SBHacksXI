mapboxgl.accessToken = 'pk.eyJ1IjoiYWRkcmFpbjEiLCJhIjoiY201c29qZGdkMGFjMDJpcG9iOGl0bnEzNCJ9.DZ9-xP5klHuPvECO3l2tEA';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true });

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
    setupMap([-118.2437, 34.0522]);  // Default to Los Angeles
}

function setupMap(center) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 15
    });

    map.addControl(new mapboxgl.NavigationControl());

    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: 'imperial',
        profile: 'driving'  // Travel mode (can be 'cycling', 'walking', 'driving')
    });

    map.addControl(directions, 'top-left');

    directions.on('route', (event) => {
        const routes = event.route;  // Array of routes
        let highestEcoScore = 0;
        let bestRouteIndex = -1;

        // Calculate eco score for all routes and find the highest score
        routes.forEach((route, index) => {
            const distance = route.distance / 1609.34;  // Convert meters to miles
            const duration = route.duration / 60;  // Convert seconds to minutes
            const ecoScore = calculateEcoScore(distance, duration);

            if (ecoScore > highestEcoScore) {
                highestEcoScore = ecoScore;
                bestRouteIndex = index;  // Track the index of the best route
            }

            // Update the eco score for the current route
            if (index === 0) updateEcoScore(ecoScore);
        });

        // Show the message only if the selected route is the most eco-friendly one
        if (bestRouteIndex === 0) {
            showEcoMessage();
        }
    });
}

// Function to calculate eco score
function calculateEcoScore(distance, duration) {
    const maxEcoScore = 100;
    const ecoFactor = 30;  // Adjust factor for influence
    const score = maxEcoScore - (ecoFactor * (distance / duration));
    return Math.max(10, score);  // Ensure a minimum score of 10%
}

// Function to update the eco score in the green box
function updateEcoScore(score) {
    const ecoScoreBox = document.getElementById('eco-score-box');
    const ecoScoreValue = document.getElementById('eco-score-value');
    ecoScoreValue.textContent = score.toFixed(1);  // Update the displayed score
    ecoScoreBox.style.display = 'block';  // Show the eco score box
}

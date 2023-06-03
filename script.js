mapboxgl.accessToken =
    "pk.eyJ1IjoicGpsZW9uYXJkMzciLCJhIjoiY2xoMmNjODFtMTh4NzNzc2FhZWVibGR6cSJ9.eFd7Y9jGlJUP-dm0MBMvpg";

const map = new mapboxgl.Map({
    container: "map",
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/pjleonard37/clh1yey3t015s01p8bwzy2e4b",
    center: [-77.0498, 38.9296],
    zoom: 12
});

// Define the bounding box coordinates for Washington, DC
const bounds = [

    [
        -77.1874096044419,
        38.794609719509026
    ],
    [
        -76.89956678821437,
        39.0246853523891
    ]
];
map.setMaxBounds(bounds);

// Fetch moving violation location data from Open Data DC Portal: https://opendata.dc.gov/
fetch(
    "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Violations_Moving_2023/MapServer/3/query?where=PLATE_STATE%20%3D%20%27MD%27%20OR%20PLATE_STATE%20%3D%20%27DC%27%20OR%20PLATE_STATE%20%3D%20%27VA%27&outFields=PLATE_STATE,LATITUDE,LONGITUDE,VIOLATION_PROCESS_DESC&outSR=4326&f=json"
)
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
        // Create empty counts for totalling violation counts
        var dc_count = 0;
        var va_count = 0;
        var md_count = 0;

        // Add a marker to the map for each violation
        for (const feature of data.features) {
            // Create a DOM element for each marker.
            const el = document.createElement("div");
            const plate_state = feature.attributes.PLATE_STATE;
            const latitude = feature.attributes.LATITUDE;
            const longitude = feature.attributes.LONGITUDE;
            const violation_desc = formatDesc(feature.attributes.VIOLATION_PROCESS_DESC);

            // Only map violations with coordinates (D.C.'s open data portal doesn't allow filtering for null in the request)
            if (latitude != null) {
                el.className = 'marker';

                switch (plate_state) {
                    case 'DC':
                        el.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_the_District_of_Columbia.svg)`;
                        el.style.height = `15px`; // 1:2 flag ratio
                        dc_count++;
                        break;
                    case 'VA':
                        el.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/4/47/Flag_of_Virginia.svg)`;
                        el.style.height = `20px`; // 2:3 flag ratio
                        va_count++;
                        break;
                    case 'MD':
                        el.style.backgroundImage = `url(https://upload.wikimedia.org/wikipedia/commons/a/a0/Flag_of_Maryland.svg)`;
                        el.style.height = `20px`; // 2:3 flag ratio
                        md_count++;
                        break;
                }
                el.style.width = `30px`;
                el.style.backgroundSize = '100%';

                // Add marker to the map.
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([longitude, latitude])
                    .addTo(map);

                // Create a popup
                const popup = new mapboxgl.Popup({
                    closeOnClick: true,
                    closeButton: false,
                    focusAfterOpen: false
                })
                    .setHTML("<h5>" + violation_desc + "</h5>");

                // Attach the popup to the marker
                marker.setPopup(popup);

                // Show the popup when the marker is clicked
                marker.on('click', () => {
                    popup.addTo(map);
                });
            }
        }
        addMenu([dc_count, va_count, md_count]);
    })
    .catch((error) => console.error(error)); // Handle any errors

// Uppercase first letter of each string 
function formatDesc(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function addMenu(state_counts) {
    var layers = document.getElementById("menu");

    let dc = document.createElement("div");
    dc.textContent = state_counts[0];
    dc.className = "dc"
    layers.appendChild(dc);

    let va = document.createElement("div");
    va.textContent = state_counts[1];
    va.className = "virginia"
    layers.appendChild(va);

    let md = document.createElement("div");
    md.textContent = state_counts[2];
    md.className = "maryland"
    layers.appendChild(md);
}
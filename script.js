document.addEventListener('DOMContentLoaded', () => {
    const csvFile = document.getElementById('csvFile');
    const loadCsvBtn = document.getElementById('loadCsv');
    const reportContainer = document.getElementById('report-container');
    const printReportBtn = document.getElementById('printReport');

    csvFile.addEventListener('change', () => {
        const file = csvFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                processCsvData(csvText, reportContainer, document.getElementById('summary-card'));
                csvFile.style.display = 'none';
                loadCsvBtn.style.display = 'none';
            };
            reader.readAsText(file);
        } else {
            reportContainer.innerHTML = '<p class="no-data">Please select a CSV file.</p>';
        }
    });

    loadCsvBtn.addEventListener('click', () => {
        // This button will now primarily serve as a fallback or for re-loading if needed
        // The main logic is now tied to the file input's 'change' event
        const file = csvFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                processCsvData(csvText, reportContainer, document.getElementById('summary-card'));
                csvFile.style.display = 'none';
                loadCsvBtn.style.display = 'none';
            };
            reader.readAsText(file);
        } else {
            reportContainer.innerHTML = '<p class="no-data">Please select a CSV file.</p>';
        }
    });
        const file = csvFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvText = e.target.result;
                processCsvData(csvText, reportContainer, document.getElementById('summary-card'));
                csvFile.style.display = 'none';
                loadCsvBtn.style.display = 'none';
            };
            reader.readAsText(file);
        } else {
            reportContainer.innerHTML = '<p class="no-data">Please select a CSV file.</p>';
        }
    });

    printReportBtn.addEventListener('click', () => {
        window.print();
    });

function processCsvData(csvText, reportContainer, summaryCard) {
    const lines = csvText.split('\n');
    // Manually define headers as the CSV does not have a header row
    const headers = ['Route Name', 'Driver Name', 'Zone', 'Ward', 'Vehicle No', 'Route Type', 'Delete', 'Download', 'View Route', 'Edit'];
    const data = [];
    for (let i = 0; i < lines.length; i++) { // Start from line 0 as there's no header
        const currentLine = lines[i].trim();
        if (currentLine) {
            // Split by comma, but ignore commas inside double quotes
            const values = currentLine.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);
            const row = {};
            for (let j = 0; j < headers.length; j++) {
                row[headers[j].trim()] = values[j] ? values[j].replace(/"/g, '').trim() : '';
            }
            data.push(row);
        }
    }

    const vehicleRoutes = {};
    data.forEach(row => {
        const fullRouteIdentifier = row['Route Name']; // e.g., "W63R1"
        const vehicleNo = row['Vehicle No'];
        // Extract a more descriptive Route Name (e.g., "Route 1" from "W63R1")
        const routeNumberMatch = fullRouteIdentifier.match(/R(\d+)/);
        const routeName = routeNumberMatch ? `Route ${routeNumberMatch[1]}` : fullRouteIdentifier;
        const wadName = row['Ward'];     // 'Ward' column is 'WAD NAME'

        if (fullRouteIdentifier && vehicleNo && wadName) {
            if (!vehicleRoutes[vehicleNo]) {
                vehicleRoutes[vehicleNo] = [];
            }
            vehicleRoutes[vehicleNo].push({ routeName, fullRouteIdentifier, wadName });
        }
    });

    const multipleRoutesVehicles = {};
    for (const vehicle in vehicleRoutes) {
        // Filter out duplicate routes for a vehicle based on a unique identifier (e.g., routeName + routeId)
        const uniqueRoutes = Array.from(new Map(vehicleRoutes[vehicle].map(route => [`${route.routeName}-${route.fullRouteIdentifier}`, route])).values());

        if (uniqueRoutes.length > 1) {
            multipleRoutesVehicles[vehicle] = uniqueRoutes.sort((a, b) => a.routeName.localeCompare(b.routeName));
        }
    }

    if (Object.keys(multipleRoutesVehicles).length === 0) {
        reportContainer.innerHTML = '<p class="no-data">No vehicles found in multiple routes.</p>';
        summaryCard.innerHTML = '<p>No vehicles found in multiple routes.</p>';
    } else {
        const totalVehicles = Object.keys(multipleRoutesVehicles).length;

        const uniqueWards = new Set();
        const uniqueZones = new Set();

        data.forEach(row => {
            if (row['Ward']) uniqueWards.add(row['Ward']);
            if (row['Zone']) uniqueZones.add(row['Zone']);
        });

        summaryCard.innerHTML = `
            <p>Total vehicles found in multiple routes: <strong>${totalVehicles}</strong></p>
        `;

        let cardsHtml = '<div class="vehicle-cards-container">';
        for (const vehicle in multipleRoutesVehicles) {
            cardsHtml += `<div class="vehicle-card">
                                <h2>Vehicle No: ${vehicle}</h2>
                                <h3>Routes:</h3>
                                <ul class="route-list">`;
            multipleRoutesVehicles[vehicle].forEach(route => {
                cardsHtml += `<li>
                                    <strong>Route Name:</strong> ${route.routeName}<br>
                                    <strong>Route ID:</strong> ${route.fullRouteIdentifier}<br>
                                    <strong>WAD NAME:</strong> ${route.wadName}
                                  </li>`;
            });
            cardsHtml += `</ul>
                              </div>`;
        }
        cardsHtml += '</div>';
        reportContainer.innerHTML = cardsHtml;
    }
}

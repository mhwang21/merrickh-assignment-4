document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    // Get the context of the canvas element
    const ctx = document.getElementById('similarity-chart').getContext('2d');

    // Destroy any existing chart to avoid overlap
    if (window.similarityChart) {
        window.similarityChart.destroy();
    }

    // Create a new bar chart
    window.similarityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.indices.map(i => `Doc ${i + 1}`),  // Labels for each bar
            datasets: [{
                label: 'Cosine Similarity',
                data: data.similarities,  // Data for each bar
                backgroundColor: 'rgba(75, 192, 192, 0.5)',  // Bar color
                borderColor: 'rgba(75, 192, 192, 1)',  // Border color
                borderWidth: 1  // Border width
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,  // Start the y-axis from 0
                    title: {
                        display: true,
                        text: 'Cosine Similarity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Documents'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false  // Hide the legend (optional)
                }
            }
        }
    });
}
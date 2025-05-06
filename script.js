import { db, collection, doc, setDoc, getDocs } from './firebase-config.js';

// Initialize data structure
let priceData = {
    pizza: [],
    fries: [],
    cookie: [],
    hamburger: [],
    chicken_fingers: [],
    cupcake: [],
    c4_cookie: []
};

// Chart instance
let priceChart = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Loading data from Firebase...');
        await loadData();
        setupEventListeners();
        updateCurrentPrices();
        initializeChart();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Error loading data. Please refresh the page and try again.');
    }
});

// Initialize Firestore collections
async function initializeCollections() {
    try {
        console.log('Initializing Firestore collections...');
        const pricesCollection = collection(db, 'prices');
        
        // Check if we need to initialize any products
        for (const product of Object.keys(priceData)) {
            const docRef = doc(db, 'prices', product);
            const doc = await getDocs(docRef);
            
            if (doc.empty) {
                console.log(`Initializing collection for ${product}...`);
                await setDoc(docRef, {
                    product: product,
                    prices: []
                });
                console.log(`Collection initialized for ${product}`);
            }
        }
        
        console.log('All collections initialized successfully');
    } catch (error) {
        console.error('Error initializing collections:', error);
        throw error;
    }
}

// Set up event listeners
function setupEventListeners() {
    const form = document.getElementById('priceForm');
    if (!form) {
        console.error('Price form not found!');
        return;
    }
    form.addEventListener('submit', handlePriceSubmit);
    
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) {
        console.error('Product select not found!');
        return;
    }
    productSelect.addEventListener('change', updateChart);
}

// Load data from Firebase
async function loadData() {
    try {
        console.log('Loading data from Firebase...');
        const pricesCollection = collection(db, 'prices');
        const snapshot = await getDocs(pricesCollection);
        
        if (snapshot.empty) {
            console.log('No data found in Firebase');
            // Initialize collections for each product
            for (const product of Object.keys(priceData)) {
                await setDoc(doc(db, 'prices', product), {
                    product: product,
                    prices: []
                });
            }
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('Document data:', data);
                if (data.product && Array.isArray(data.prices)) {
                    priceData[data.product] = data.prices;
                }
            });
        }
        
        updateCurrentPrices();
        initializeChart();
    } catch (error) {
        console.error("Error loading data:", error);
        alert('Error loading data: ' + error.message);
    }
}

// Handle form submission
async function handlePriceSubmit(event) {
    event.preventDefault();
    
    const product = document.getElementById('productSelect').value;
    const price = parseFloat(document.getElementById('priceInput').value);
    const timestamp = new Date().toISOString();

    if (!product || isNaN(price)) {
        alert('Please select a product and enter a valid price');
        return;
    }

    console.log('Submitting new price:', { product, price, timestamp });

    // Add new price data
    if (!priceData[product]) {
        priceData[product] = [];
    }
    priceData[product].push({
        price: price,
        timestamp: timestamp
    });

    try {
        // Save to Firebase
        console.log('Saving to Firebase...');
        await setDoc(doc(db, 'prices', product), {
            product: product,
            prices: priceData[product]
        });
        console.log('Successfully saved to Firebase');

        // Update UI
        updateCurrentPrices();
        updateChart();

        // Reset form
        event.target.reset();
    } catch (error) {
        console.error("Error saving data:", error);
        alert('Error saving data: ' + error.message);
    }
}

// Update current prices display
function updateCurrentPrices() {
    console.log('Updating current prices display...');
    const container = document.getElementById('currentPrices');
    if (!container) {
        console.error('Current prices container not found!');
        return;
    }
    container.innerHTML = '';

    Object.entries(priceData).forEach(([product, data]) => {
        if (data && data.length > 0) {
            const latestPrice = data[data.length - 1].price;
            const card = document.createElement('div');
            card.className = 'card product-card';
            card.innerHTML = `
                <div class="card-body">
                    <h6 class="card-title">${formatProductName(product)}</h6>
                    <p class="card-text">$${latestPrice.toFixed(2)}</p>
                    <small class="text-muted">Last updated: ${formatDate(data[data.length - 1].timestamp)}</small>
                </div>
            `;
            container.appendChild(card);
        }
    });
}

// Initialize or update the chart
function initializeChart() {
    console.log('Initializing chart...');
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    if (priceChart) {
        priceChart.destroy();
    }

    const selectedProduct = document.getElementById('productSelect').value || 'pizza';
    const productData = priceData[selectedProduct];

    const labels = productData.map(entry => formatDate(entry.timestamp));
    const prices = productData.map(entry => entry.price);

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: formatProductName(selectedProduct),
                data: prices,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// Update chart when product selection changes
function updateChart() {
    initializeChart();
}

// Helper function to format product names
function formatProductName(product) {
    return product.charAt(0).toUpperCase() + product.slice(1).replace('_', ' ');
}

// Helper function to format dates
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
} 
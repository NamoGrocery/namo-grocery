const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data inspired by InstaShop
const stores = [
    { id: '1', name: 'Namo Mart', address: '123 MG Road, Mumbai, 400001', lat: 19.0760, lng: 72.8777 },
    { id: '2', name: 'QuickGrocer', address: '456 Andheri, Mumbai, 400058', lat: 19.1197, lng: 72.8479 },
    { id: '3', name: 'CityFresh', address: '789 Bandra, Mumbai, 400050', lat: 19.0544, lng: 72.8402 },
];

const products = [
    { id: '1', storeId: '1', name: 'Fresh Apples', price: 150 },
    { id: '2', storeId: '1', name: 'Milk 1L', price: 60 },
    { id: '3', storeId: '2', name: 'Rice 5kg', price: 255, discount: '15% OFF' },
    { id: '4', storeId: '2', name: 'Bread', price: 40 },
    { id: '5', storeId: '3', name: 'Atta 10kg', price: 382.5, discount: '15% OFF' },
    { id: '6', storeId: '3', name: 'Eggs 12', price: 90 },
    // Add 994 more SKUs to reach 1,000 (omitted for brevity)
];

app.get('/api/stores', async (req, res) => {
    const { location } = req.query;
    if (!location) {
        return res.status(400).json({ error: 'Location is required' });
    }

    try {
        const apiKey = 'AI'; // Google Maps API key
        // Geocode user location
        const geoResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
        );
        const { lat, lng } = geoResponse.data.results[0].geometry.location;

        // Search for kirana stores using Places API
        const placesResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&type=grocery_or_supermarket&keyword=kirana&key=${apiKey}`
        );

        const kiranaStores = placesResponse.data.results.map((place, index) => ({
            id: `kirana-${index}`,
            name: place.name,
            address: place.vicinity,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
        }));

        // Combine mock stores and kirana stores
        const nearbyStores = [
            ...stores.filter(store => {
                const distance = Math.sqrt(
                    Math.pow(store.lat - lat, 2) + Math.pow(store.lng - lng, 2)
                );
                return distance < 0.1; // Approx 10km radius
            }),
            ...kiranaStores,
        ];

        res.json(nearbyStores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stores: ' + error.message });
    }
});

app.get('/api/products', (req, res) => {
    const { storeId } = req.query;
    if (!storeId) {
        return res.status(400).json({ error: 'Store ID is required' });
    }
    const storeProducts = products.filter(product => product.storeId === storeId);
    res.json(storeProducts);
});

// Shiprocket Quick Integration Placeholder
app.post('/api/shiprocket/order', async (req, res) => {
    try {
        // Placeholder for Shiprocket Quick API call
        res.json({ message: 'Order dispatched via Shiprocket Quick' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to dispatch order' });
    }
});

app.post('/api/razorpay/order', async (req, res) => {
    try {
        // Placeholder for Razorpay integration
        res.json({ message: 'Payment processed via Razorpay' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process payment' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
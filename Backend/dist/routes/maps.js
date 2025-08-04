"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const auth_2 = require("../middleware/auth");
const RANCH_DEFAULT_CENTER = {
    latitude: 17.9869,
    longitude: -92.9303,
    altitude: 10
};
const TABASCO_BOUNDS = {
    north: 18.5,
    south: 17.3,
    east: -91.0,
    west: -94.8
};
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
const validateCoordinates = (req, res, next) => {
    const { latitude, longitude } = req.body;
    if (latitude !== undefined) {
        const lat = parseFloat(latitude);
        if (isNaN(lat) || lat < -90 || lat > 90) {
            res.status(400).json({
                success: false,
                message: 'La latitud debe estar entre -90 y 90 grados'
            });
            return;
        }
    }
    if (longitude !== undefined) {
        const lng = parseFloat(longitude);
        if (isNaN(lng) || lng < -180 || lng > 180) {
            res.status(400).json({
                success: false,
                message: 'La longitud debe estar entre -180 y 180 grados'
            });
            return;
        }
    }
    next();
};
const validateMapBounds = (req, res, next) => {
    const { swLat, swLng, neLat, neLng } = req.query;
    if (swLat && swLng && neLat && neLng) {
        const bounds = {
            swLat: parseFloat(swLat),
            swLng: parseFloat(swLng),
            neLat: parseFloat(neLat),
            neLng: parseFloat(neLng)
        };
        if (isNaN(bounds.swLat) || isNaN(bounds.swLng) || isNaN(bounds.neLat) || isNaN(bounds.neLng)) {
            res.status(400).json({
                success: false,
                message: 'Coordenadas de bounds inválidas'
            });
            return;
        }
        req.mapBounds = bounds;
    }
    next();
};
router.get('/ranch-overview', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), validateMapBounds, (0, validation_1.validate)('search'), (req, res) => {
    const { includePotreros = 'true', includeGanado = 'true', includeInfraestructura = 'true' } = req.query;
    const ranchOverview = {
        center: RANCH_DEFAULT_CENTER,
        bounds: TABASCO_BOUNDS,
        potreros: includePotreros === 'true' ? [
            {
                id: 'potrero_1',
                name: 'Potrero Principal',
                area: 15.5,
                capacity: 50,
                currentAnimals: 32,
                grassType: 'Brachiaria',
                coordinates: [
                    { latitude: 17.9900, longitude: -92.9350 },
                    { latitude: 17.9900, longitude: -92.9250 },
                    { latitude: 17.9800, longitude: -92.9250 },
                    { latitude: 17.9800, longitude: -92.9350 }
                ]
            },
            {
                id: 'potrero_2',
                name: 'Potrero Norte',
                area: 12.0,
                capacity: 40,
                currentAnimals: 25,
                grassType: 'Guinea',
                coordinates: [
                    { latitude: 17.9950, longitude: -92.9350 },
                    { latitude: 17.9950, longitude: -92.9250 },
                    { latitude: 17.9900, longitude: -92.9250 },
                    { latitude: 17.9900, longitude: -92.9350 }
                ]
            }
        ] : [],
        ganado: includeGanado === 'true' ? [
            {
                id: 'cattle_1',
                earTag: 'TAB001',
                name: 'Esperanza',
                breed: 'Brahman',
                location: { latitude: 17.9880, longitude: -92.9320 },
                status: 'healthy',
                lastUpdate: new Date().toISOString()
            },
            {
                id: 'cattle_2',
                earTag: 'TAB002',
                name: 'Victoria',
                breed: 'Cebu',
                location: { latitude: 17.9860, longitude: -92.9310 },
                status: 'healthy',
                lastUpdate: new Date().toISOString()
            }
        ] : [],
        infraestructura: includeInfraestructura === 'true' ? [
            {
                id: 'barn_main',
                type: 'establo',
                name: 'Establo Principal',
                location: RANCH_DEFAULT_CENTER,
                capacity: 100,
                facilities: ['ordeño', 'alimentación', 'refugio']
            },
            {
                id: 'water_1',
                type: 'aguaje',
                name: 'Bebedero Central',
                location: { latitude: 17.9870, longitude: -92.9290 },
                capacity: 5000,
                status: 'active'
            }
        ] : []
    };
    res.json({
        success: true,
        data: ranchOverview,
        message: 'Vista general del rancho obtenida exitosamente'
    });
});
router.get('/ranch-boundaries', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    const boundaries = {
        type: 'Polygon',
        coordinates: [[
                [-92.9400, 17.9800],
                [-92.9200, 17.9800],
                [-92.9200, 17.9950],
                [-92.9400, 17.9950],
                [-92.9400, 17.9800]
            ]],
        properties: {
            name: 'Rancho San José',
            area: 125.5,
            owner: 'Universidad Juárez Autónoma de Tabasco',
            established: '2020-01-15'
        },
        center: RANCH_DEFAULT_CENTER
    };
    res.json({
        success: true,
        data: boundaries,
        message: 'Límites del rancho obtenidos exitosamente'
    });
});
router.get('/cattle-locations', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), validateMapBounds, (0, validation_1.validate)('search'), (req, res) => {
    const { lastUpdatedWithin = '24', includeInactive = 'false', earTags } = req.query;
    let cattleLocations = [
        {
            id: 'loc_1',
            bovine: {
                id: 'cattle_1',
                earTag: 'TAB001',
                name: 'Esperanza',
                breed: 'Brahman',
                status: 'healthy'
            },
            coordinates: {
                latitude: 17.9880,
                longitude: -92.9320,
                accuracy: 5
            },
            recorded_at: new Date().toISOString(),
            location_type: 'gps_tracking',
            potrero: 'Potrero Principal'
        },
        {
            id: 'loc_2',
            bovine: {
                id: 'cattle_2',
                earTag: 'TAB002',
                name: 'Victoria',
                breed: 'Cebu',
                status: 'healthy'
            },
            coordinates: {
                latitude: 17.9860,
                longitude: -92.9310,
                accuracy: 3
            },
            recorded_at: new Date().toISOString(),
            location_type: 'gps_tracking',
            potrero: 'Potrero Norte'
        },
        {
            id: 'loc_3',
            bovine: {
                id: 'cattle_3',
                earTag: 'TAB003',
                name: 'Fortuna',
                breed: 'Holstein',
                status: 'inactive'
            },
            coordinates: {
                latitude: 17.9840,
                longitude: -92.9300,
                accuracy: 4
            },
            recorded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            location_type: 'manual',
            potrero: 'Establo'
        }
    ];
    if (earTags) {
        const tagArray = earTags.split(',');
        cattleLocations = cattleLocations.filter(loc => tagArray.includes(loc.bovine.earTag));
    }
    if (includeInactive === 'false') {
        cattleLocations = cattleLocations.filter(loc => loc.bovine.status !== 'inactive');
    }
    const hoursLimit = parseInt(lastUpdatedWithin);
    const cutoffTime = new Date(Date.now() - hoursLimit * 60 * 60 * 1000);
    cattleLocations = cattleLocations.filter(loc => new Date(loc.recorded_at) > cutoffTime);
    res.json({
        success: true,
        data: {
            locations: cattleLocations,
            total: cattleLocations.length,
            center: RANCH_DEFAULT_CENTER,
            bounds: req.mapBounds || TABASCO_BOUNDS
        },
        message: 'Ubicaciones del ganado obtenidas exitosamente'
    });
});
router.post('/cattle-location', (0, role_1.requireMinimumRole)(auth_2.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), validateCoordinates, (0, validation_1.validate)('search'), (req, res) => {
    const { bovineId, latitude, longitude, altitude, accuracy, method = 'gps', notes, potrero, zone } = req.body;
    if (latitude < TABASCO_BOUNDS.south || latitude > TABASCO_BOUNDS.north ||
        longitude < TABASCO_BOUNDS.west || longitude > TABASCO_BOUNDS.east) {
        res.status(400).json({
            success: false,
            message: 'Coordenadas fuera del rango válido para Tabasco, México'
        });
        return;
    }
    const newLocation = {
        id: `loc_${Date.now()}`,
        bovineId,
        coordinates: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            altitude: altitude ? parseFloat(altitude) : null,
            accuracy: accuracy ? parseFloat(accuracy) : null
        },
        timestamp: new Date().toISOString(),
        method,
        notes,
        potrero,
        zone,
        recordedBy: req.userId
    };
    res.status(201).json({
        success: true,
        data: newLocation,
        message: 'Ubicación del ganado registrada exitosamente'
    });
});
router.get('/cattle/:bovineId/history', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    const { bovineId } = req.params;
    const { startDate, endDate, limit = '100' } = req.query;
    const history = {
        bovine: {
            id: bovineId,
            earTag: 'TAB001',
            name: 'Esperanza',
            breed: 'Brahman'
        },
        locations: [
            {
                id: 'hist_1',
                coordinates: { latitude: 17.9880, longitude: -92.9320 },
                recorded_at: new Date().toISOString(),
                location_type: 'gps_tracking',
                accuracy: 5
            },
            {
                id: 'hist_2',
                coordinates: { latitude: 17.9875, longitude: -92.9315 },
                recorded_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                location_type: 'gps_tracking',
                accuracy: 4
            },
            {
                id: 'hist_3',
                coordinates: { latitude: 17.9870, longitude: -92.9310 },
                recorded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                location_type: 'gps_tracking',
                accuracy: 6
            }
        ],
        statistics: {
            total_distance: 156.7,
            average_speed: 78.35,
            max_distance_from_center: 145.2,
            time_period: {
                start: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString(),
                duration_hours: 2
            }
        },
        total_points: 3
    };
    res.json({
        success: true,
        data: history,
        message: 'Historial de ubicaciones obtenido exitosamente'
    });
});
router.get('/geofences', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    const { type, active = 'true' } = req.query;
    const geofences = [
        {
            id: 'geo_1',
            name: 'Potrero Principal',
            type: 'potrero',
            active: true,
            coordinates: [
                { latitude: 17.9900, longitude: -92.9350 },
                { latitude: 17.9900, longitude: -92.9250 },
                { latitude: 17.9800, longitude: -92.9250 },
                { latitude: 17.9800, longitude: -92.9350 }
            ],
            alertOnEntry: false,
            alertOnExit: true,
            capacity: 50,
            grassType: 'Brachiaria'
        },
        {
            id: 'geo_2',
            name: 'Zona Segura Principal',
            type: 'safe_zone',
            active: true,
            center: RANCH_DEFAULT_CENTER,
            radius: 500,
            alertOnEntry: false,
            alertOnExit: true
        },
        {
            id: 'geo_3',
            name: 'Zona Restringida - Carretera',
            type: 'danger_zone',
            active: true,
            coordinates: [
                { latitude: 17.9950, longitude: -92.9400 },
                { latitude: 17.9950, longitude: -92.9200 },
                { latitude: 17.9970, longitude: -92.9200 },
                { latitude: 17.9970, longitude: -92.9400 }
            ],
            alertOnEntry: true,
            alertOnExit: false
        }
    ].filter(geo => {
        if (type && geo.type !== type)
            return false;
        if (active === 'false' && geo.active)
            return false;
        if (active === 'true' && !geo.active)
            return false;
        return true;
    });
    res.json({
        success: true,
        data: geofences,
        message: 'Geocercas obtenidas exitosamente'
    });
});
router.post('/geofences', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), validateCoordinates, (0, validation_1.validate)('search'), (req, res) => {
    const { name, type, coordinates, description, alertOnEntry = false, alertOnExit = false, capacity, grassType } = req.body;
    const newGeofence = {
        id: `geo_${Date.now()}`,
        name,
        type,
        coordinates,
        description,
        alertOnEntry,
        alertOnExit,
        capacity,
        grassType,
        active: true,
        createdAt: new Date().toISOString(),
        createdBy: req.userId
    };
    res.status(201).json({
        success: true,
        data: newGeofence,
        message: 'Geocerca creada exitosamente'
    });
});
router.get('/density-heatmap', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), validateMapBounds, (0, validation_1.validate)('search'), (req, res) => {
    const { resolution = '50', timeWindow = '24h' } = req.query;
    const heatmapData = {
        bounds: req.mapBounds || TABASCO_BOUNDS,
        resolution: parseInt(resolution),
        timeWindow,
        data: [
            { lat: 17.9880, lng: -92.9320, density: 8 },
            { lat: 17.9875, lng: -92.9315, density: 12 },
            { lat: 17.9870, lng: -92.9310, density: 6 },
            { lat: 17.9860, lng: -92.9305, density: 15 },
            { lat: 17.9850, lng: -92.9300, density: 4 }
        ],
        max_density: 15,
        total_points: 5,
        generated_at: new Date().toISOString()
    };
    res.json({
        success: true,
        data: heatmapData,
        message: 'Mapa de calor de densidad generado exitosamente'
    });
});
router.get('/movement-patterns', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, validation_1.validate)('search'), (req, res) => {
    const { startDate, endDate, bovineIds, analysisType = 'daily' } = req.query;
    const movementPatterns = {
        analysis_type: analysisType,
        period: {
            start: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end: endDate || new Date().toISOString()
        },
        patterns: [
            {
                bovine_id: 'cattle_1',
                ear_tag: 'TAB001',
                movement_stats: {
                    total_distance: 1250.5,
                    average_speed: 52.1,
                    max_distance_from_center: 180.3,
                    activity_level: 'moderate'
                },
                frequent_locations: [
                    { lat: 17.9880, lng: -92.9320, frequency: 0.4 },
                    { lat: 17.9875, lng: -92.9315, frequency: 0.3 },
                    { lat: 17.9870, lng: -92.9310, frequency: 0.3 }
                ],
                path: [
                    { lat: 17.9880, lng: -92.9320, timestamp: new Date().toISOString() },
                    { lat: 17.9875, lng: -92.9315, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
                ]
            }
        ],
        summary: {
            total_animals_analyzed: 1,
            average_activity_level: 'moderate',
            most_active_hours: ['06:00-08:00', '16:00-18:00']
        }
    };
    res.json({
        success: true,
        data: movementPatterns,
        message: 'Análisis de patrones de movimiento completado exitosamente'
    });
});
router.get('/export-data', (0, role_1.requireMinimumRole)(auth_2.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), (req, res) => {
    const { format = 'geojson', dataType = 'cattle_locations' } = req.query;
    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="cattle_locations.csv"');
        const csvData = `ID,Ear Tag,Latitude,Longitude,Timestamp,Status
cattle_1,TAB001,17.9880,-92.9320,${new Date().toISOString()},healthy
cattle_2,TAB002,17.9860,-92.9310,${new Date().toISOString()},healthy`;
        res.send(csvData);
    }
    else {
        const geoJsonData = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-92.9320, 17.9880]
                    },
                    properties: {
                        id: 'cattle_1',
                        earTag: 'TAB001',
                        name: 'Esperanza',
                        breed: 'Brahman',
                        status: 'healthy',
                        timestamp: new Date().toISOString()
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-92.9310, 17.9860]
                    },
                    properties: {
                        id: 'cattle_2',
                        earTag: 'TAB002',
                        name: 'Victoria',
                        breed: 'Cebu',
                        status: 'healthy',
                        timestamp: new Date().toISOString()
                    }
                }
            ]
        };
        res.setHeader('Content-Type', 'application/geo+json');
        res.setHeader('Content-Disposition', `attachment; filename="cattle_data.${format}"`);
        res.json(geoJsonData);
    }
});
router.post('/geocode', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.EXTERNAL_API), (0, validation_1.validate)('search'), (req, res) => {
    const { address, country = 'MX', region } = req.body;
    const geocodeResult = {
        query: address,
        results: [
            {
                formatted_address: `${address}, Villahermosa, Tabasco, México`,
                coordinates: {
                    latitude: 17.9869 + (Math.random() - 0.5) * 0.01,
                    longitude: -92.9303 + (Math.random() - 0.5) * 0.01
                },
                accuracy: 'APPROXIMATE',
                place_type: 'address',
                components: {
                    street: address,
                    city: 'Villahermosa',
                    state: 'Tabasco',
                    country: 'México',
                    postal_code: '86000'
                }
            }
        ],
        status: 'OK'
    };
    res.json({
        success: true,
        data: geocodeResult,
        message: 'Geocodificación completada exitosamente'
    });
});
router.post('/reverse-geocode', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.EXTERNAL_API), validateCoordinates, (0, validation_1.validate)('search'), (req, res) => {
    const { latitude, longitude } = req.body;
    const reverseResult = {
        coordinates: { latitude, longitude },
        results: [
            {
                formatted_address: 'Carretera Villahermosa-Frontera Km 15, Ranchería San José, Villahermosa, Tabasco, México',
                place_type: 'premise',
                components: {
                    name: 'Rancho San José',
                    street: 'Carretera Villahermosa-Frontera',
                    locality: 'Ranchería San José',
                    city: 'Villahermosa',
                    state: 'Tabasco',
                    country: 'México',
                    postal_code: '86280'
                },
                accuracy: 'ROOFTOP'
            }
        ],
        status: 'OK'
    };
    res.json({
        success: true,
        data: reverseResult,
        message: 'Geocodificación inversa completada exitosamente'
    });
});
router.use((error, req, res, next) => {
    console.error('Maps Route Error:', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación en datos geográficos',
            error: 'MAPS_VALIDATION_ERROR'
        });
    }
    if (error.name === 'GeofenceError') {
        return res.status(400).json({
            success: false,
            message: 'Error en configuración de geocerca',
            error: 'GEOFENCE_ERROR'
        });
    }
    if (error.name === 'LocationError') {
        return res.status(400).json({
            success: false,
            message: 'Error en datos de ubicación',
            error: 'LOCATION_ERROR'
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor de mapas',
        error: 'MAPS_INTERNAL_ERROR'
    });
});
exports.default = router;
//# sourceMappingURL=maps.js.map
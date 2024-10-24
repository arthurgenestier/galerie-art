import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  TextField, 
  Snackbar, 
  Alert, 
  Paper, 
  Box, 
  Slider, 
  Tabs, 
  Tab,
  Autocomplete, 
  CircularProgress, 
  CardMedia
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

// Leaflet icon correction
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Dashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [artworks, setArtworks] = useState([]);
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState(null);
  const [position, setPosition] = useState([48.8566, 2.3522]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [deliveryRadius, setDeliveryRadius] = useState(5);
  const [addressOptions, setAddressOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const radiusCircleRef = useRef(null);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleTabChange = (event, newValue) => {
    if (newValue !== 0 && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    setTabValue(newValue);
  };

  const initializeMap = useCallback(() => {
    try {
      if (mapRef.current) {
        mapRef.current.remove();
      }

      // Créer la carte
      const map = L.map(mapContainerRef.current, {
        center: position,
        zoom: 12,
        zoomControl: true
      });

      // Ajouter le fond de carte
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;

      // Attendre que la carte soit chargée avant d'ajouter le marker et le cercle
      map.whenReady(() => {
        // Ajouter le marker
        markerRef.current = L.marker(position).addTo(map);

        // Ajouter le cercle
        radiusCircleRef.current = L.circle(position, {
          color: '#2196F3',
          fillColor: '#2196F3',
          fillOpacity: 0.1,
          weight: 2,
          radius: deliveryRadius * 1000
        }).addTo(map);

        // Ajuster la vue une fois que tout est ajouté
        const bounds = radiusCircleRef.current.getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
      });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      showSnackbar('Erreur lors du chargement de la carte', 'error');
    }
  }, [position, deliveryRadius, showSnackbar]);

  // Modifier aussi l'effet qui met à jour la position
  useEffect(() => {
    if (mapRef.current && markerRef.current && radiusCircleRef.current) {
      try {
        // S'assurer que la carte est prête avant de mettre à jour
        mapRef.current.whenReady(() => {
          markerRef.current.setLatLng(position);
          radiusCircleRef.current.setLatLng(position);
          radiusCircleRef.current.setRadius(deliveryRadius * 1000);

          const bounds = radiusCircleRef.current.getBounds();
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50],
            duration: 0.5
          });
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la carte:', error);
      }
    }
  }, [position, deliveryRadius]);

  const searchAddress = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setAddressOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Paramètres de recherche optimisés
      const params = new URLSearchParams({
        q: query,
        format: 'jsonv2', // Version plus récente de l'API
        addressdetails: 1,
        limit: 5,
        countrycodes: 'fr',
        'accept-language': 'fr',
        namedetails: 1,
      }).toString();

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'User-Agent': 'GalerieArtEnLigne/1.0', // Identification pour l'API
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Formater les adresses de manière plus lisible
      const formattedAddresses = data.map(item => ({
        label: formatAddress(item),
        value: {
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          address: item.address
        }
      }));

      setAddressOptions(formattedAddresses);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
      setAddressOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Fonction pour formater l'adresse de manière plus lisible
  const formatAddress = (item) => {
    const addr = item.address;
    const parts = [];

    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);
    if (addr.suburb) parts.push(addr.suburb);
    if (addr.postcode) parts.push(addr.postcode);
    if (addr.city || addr.town || addr.village) {
      parts.push(addr.city || addr.town || addr.village);
    }

    return parts.join(', ');
  };

  // Augmenter le délai du debounce à 500ms
  const debouncedSearchAddress = useCallback(
    debounce((query) => searchAddress(query), 500),
    [searchAddress]
  );

  const handleAddressChange = (event, newValue) => {
    if (newValue) {
      if (typeof newValue === 'string') {
        setAddress(newValue);
      } else {
        setAddress(newValue.label);
        setPosition([newValue.value.lat, newValue.value.lon]);
        showSnackbar('Adresse sélectionnée', 'success');
      }
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    if (newInputValue) {
      debouncedSearchAddress(newInputValue);
    } else {
      setAddressOptions([]);
    }
  };

  useEffect(() => {
    if (tabValue === 0 && mapContainerRef.current) {
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        initializeMap();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [tabValue, initializeMap]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [initializeMap]);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      initializeMap();
    }
  }, [savedAddress, initializeMap]);

  useEffect(() => {
    if (mapRef.current && markerRef.current && radiusCircleRef.current) {
      try {
        markerRef.current.setLatLng(position);
        radiusCircleRef.current.setLatLng(position);
        radiusCircleRef.current.setRadius(deliveryRadius * 1000);
        const bounds = radiusCircleRef.current.getBounds();
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          duration: 0.5
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la carte:', error);
      }
    }
  }, [position, deliveryRadius]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const saveDeliveryRadius = async () => {
    try {
      await api.post('/user/delivery-radius', { radius: deliveryRadius });
      showSnackbar('Rayon de livraison enregistré avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du rayon de livraison:', error);
      showSnackbar('Erreur lors de l\'enregistrement du rayon de livraison', 'error');
    }
  };

  const saveAddress = useCallback(async () => {
    if (!address.trim()) {
      showSnackbar('Veuillez entrer une adresse', 'warning');
      return;
    }

    try {
      await api.post('/user/address', {
        address,
        coordinates: {
          lat: position[0],
          lng: position[1]
        }
      });

      setSavedAddress(address);
      showSnackbar('Adresse enregistrée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'adresse:', error);
      showSnackbar('Erreur lors de l\'enregistrement de l\'adresse', 'error');
    }
  }, [address, position, showSnackbar]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/artworks/${id}`);
      const response = await api.get('/artworks');
      setArtworks(response.data);
      showSnackbar('Œuvre supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'œuvre:', error);
      showSnackbar('Erreur lors de la suppression de l\'œuvre', 'error');
    }
  }, [showSnackbar]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [addressResponse, artworksResponse, radiusResponse] = await Promise.all([
          api.get('/user/address'),
          api.get('/artworks'),
          api.get('/user/delivery-radius')
        ]);

        if (addressResponse.data?.address) {
          setSavedAddress(addressResponse.data.address);
          setAddress(addressResponse.data.address);
          setInputValue(addressResponse.data.address);
          if (addressResponse.data.coordinates) {
            setPosition([
              addressResponse.data.coordinates.lat,
              addressResponse.data.coordinates.lng
            ]);
          }
        }

        if (radiusResponse.data?.radius) {
          setDeliveryRadius(radiusResponse.data.radius);
        }

        setArtworks(artworksResponse.data);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        showSnackbar('Erreur lors du chargement des données', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [showSnackbar]);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      <Button
        variant="contained"
        color="primary"
        component={Link}
        to="/add-artwork"
        sx={{ mb: 4 }}
      >
        Ajouter une nouvelle œuvre
      </Button>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
        >
          <Tab label="Localisation & Livraison" />
          <Tab label="Œuvres" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'background.default',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Adresse enregistrée :
          </Typography>
          <Typography variant="body1" color={savedAddress ? 'textPrimary' : 'text.secondary'}>
            {savedAddress || "Aucune adresse configurée"}
          </Typography>

          <Box sx={{ mt: 3, px: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Rayon de livraison : {deliveryRadius} km
            </Typography>
            <Slider
              value={deliveryRadius}
              onChange={(e, newValue) => setDeliveryRadius(newValue)}
              onChangeCommitted={(e, newValue) => {
                setDeliveryRadius(newValue);
              }}
              valueLabelDisplay="auto"
              step={1}
              marks={[
                { value: 1, label: '1 km' },
                { value: 25, label: '25 km' },
                { value: 50, label: '50 km' }
              ]}
              min={1}
              max={50}
              sx={{ mt: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Nous livrons vos œuvres dans un rayon de {deliveryRadius} kilomètres autour de l'adresse enregistrée
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={saveDeliveryRadius}
              sx={{ mt: 1 }}
            >
              Enregistrer le rayon de livraison
            </Button>
          </Box>
        </Paper>

        <Autocomplete
          fullWidth
          freeSolo
          value={address}
          inputValue={inputValue}
          onChange={handleAddressChange}
          onInputChange={handleInputChange}
          options={addressOptions}
          loading={searchLoading}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option;
            return option.label || '';
          }}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props;  // On extrait la clé
            return (
              <Box component="li" key={option.value.display_name} {...otherProps}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  py: 1
                }}>
                  <Typography variant="body1" noWrap>
                    {option.value.address?.road || ''}
                    {option.value.address?.house_number ? ` ${option.value.address.house_number}` : ''}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                  >
                    {[
                      option.value.address?.postcode,
                      option.value.address?.city || option.value.address?.town || option.value.address?.village,
                      'France'
                    ].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              </Box>
            );
          }}
          noOptionsText="Aucune adresse trouvée"
          loadingText="Recherche en cours..."
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label="Entrez votre adresse"
              margin="normal"
              helperText="Entrez une adresse pour la localiser sur la carte"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={saveAddress}
          >
            Enregistrer l'adresse
          </Button>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '400px',
            mb: 4,
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={4}>
          {artworks.map((artwork) => (
            <Grid item xs={12} sm={6} md={4} key={artwork._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={artwork.imageUrl || '/placeholder-image.png'}
                  alt={artwork.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {artwork.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {artwork.artist}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {artwork.description}
                    </Typography>
                  </Box>

                  <Box sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2
                  }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Prix
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {artwork.price.toLocaleString()} €
                      </Typography>
                    </Box>

                    {artwork.dimensions && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Dimensions
                        </Typography>
                        <Typography variant="body1">
                          {artwork.dimensions.width} × {artwork.dimensions.height} cm
                        </Typography>
                      </Box>
                    )}

                    {artwork.medium && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Technique
                        </Typography>
                        <Typography variant="body1">
                          {artwork.medium}
                        </Typography>
                      </Box>
                    )}

                    {artwork.year && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Année
                        </Typography>
                        <Typography variant="body1">
                          {artwork.year}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{
                  justifyContent: 'flex-end',
                  gap: 1,
                  p: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Button
                    size="small"
                    component={Link}
                    to={`/edit-artwork/${artwork._id}`}
                    startIcon={<EditIcon />}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(artwork._id)}
                  >
                    Supprimer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard;
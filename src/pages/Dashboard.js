import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Typography, Button, Card, CardContent, CardActions, TextField, Snackbar, Alert, Paper, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

// Correction des icônes Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function Dashboard() {
  const [artworks, setArtworks] = useState([]);
  const [address, setAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState(null);
  const [position, setPosition] = useState([48.8566, 2.3522]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const fetchArtworks = useCallback(async () => {
    try {
      const response = await api.get('/artworks');
      setArtworks(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des œuvres:', error);
      showSnackbar('Erreur lors de la récupération des œuvres', 'error');
    }
  }, [showSnackbar]);

  // Initialisation de la carte avec délai et vérification
  useEffect(() => {
    let isMounted = true;
    
    const initMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;
      
      try {
        mapRef.current = L.map(mapContainerRef.current).setView(position, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);
        
        markerRef.current = L.marker(position).addTo(mapRef.current);
        
        // Force le rafraîchissement de la carte
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 100);
      } catch (error) {
        console.error('Erreur initialisation carte:', error);
        showSnackbar('Erreur lors du chargement de la carte', 'error');
      }
    };

    // Délai pour s'assurer que le conteneur est monté
    const timer = setTimeout(() => {
      if (isMounted) {
        initMap();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [position, showSnackbar]);

  // Mise à jour de la carte quand la position change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView(position);
      markerRef.current.setLatLng(position);
      mapRef.current.invalidateSize();
    }
  }, [position]);

  // Chargement initial des données
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [addressResponse, artworksResponse] = await Promise.all([
        api.get('/user/address'),
        api.get('/artworks')
      ]);

      if (addressResponse.data?.address) {
        setSavedAddress(addressResponse.data.address);
        setAddress(addressResponse.data.address);
        if (addressResponse.data.coordinates) {
          setPosition([
            addressResponse.data.coordinates.lat,
            addressResponse.data.coordinates.lng
          ]);
        }
      } else {
        setSavedAddress(null);
      }

      setArtworks(artworksResponse.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showSnackbar('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const searchAddress = useCallback(async () => {
    if (!address.trim()) {
      showSnackbar('Veuillez entrer une adresse', 'warning');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
        showSnackbar('Adresse trouvée et mise à jour', 'success');
      } else {
        showSnackbar('Aucune adresse trouvée', 'warning');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      showSnackbar('Erreur lors de la recherche d\'adresse', 'error');
    }
  }, [address, showSnackbar]);

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
      await loadInitialData(); // Recharge les données après la sauvegarde
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'adresse:', error);
      showSnackbar('Erreur lors de l\'enregistrement de l\'adresse', 'error');
    }
  }, [address, position, showSnackbar, loadInitialData]);

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/artworks/${id}`);
      fetchArtworks();
      showSnackbar('Œuvre supprimée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'œuvre:', error);
      showSnackbar('Erreur lors de la suppression de l\'œuvre', 'error');
    }
  }, [fetchArtworks, showSnackbar]);

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

      {/* Section adresse avec message par défaut */}
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
      </Paper>
      
      <TextField
        fullWidth
        label="Entrez votre adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        margin="normal"
        helperText="Entrez une adresse pour la localiser sur la carte"
      />
      
      <Box sx={{ mt: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={searchAddress} 
          sx={{ mr: 2 }}
        >
          Rechercher
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={saveAddress}
        >
          Enregistrer l'adresse
        </Button>
      </Box>
      
      {/* Conteneur de carte avec style forcé et z-index */}
      <Box 
        sx={{
          position: 'relative',
          width: '100%',
          height: '400px',
          mb: 4,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 1,
          overflow: 'hidden',
          zIndex: 1
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
      
      <Grid container spacing={4}>
        {artworks.map((artwork) => (
          <Grid item xs={12} sm={6} md={4} key={artwork._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {artwork.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {artwork.artist}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  component={Link} 
                  to={`/edit-artwork/${artwork._id}`}
                >
                  Modifier
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => handleDelete(artwork._id)}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Typography, Button, Card, CardContent, CardActions, TextField, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';

function Dashboard() {
  const [artworks, setArtworks] = useState([]);
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState([48.8566, 2.3522]); // Paris par défaut
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  const fetchArtworks = useCallback(async () => {
    try {
      const response = await api.get('/artworks');
      setArtworks(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des œuvres:', error);
      setSnackbarMessage('Erreur lors de la récupération des œuvres');
      setSnackbarOpen(true);
    }
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(position, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      markerRef.current = L.marker(position).addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView(position);
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  const searchAddress = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(display_name);
        
        // Optionnel : Récupérer les détails XML
        const xmlResponse = await fetch(`https://www.openstreetmap.org/api/0.6/node/${data[0].osm_id}`);
        const xmlText = await xmlResponse.text();
        console.log('Détails XML:', xmlText);
        
        setSnackbarMessage('Adresse trouvée et mise à jour');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Aucune adresse trouvée');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresse:', error);
      setSnackbarMessage('Erreur lors de la recherche d\'adresse');
      setSnackbarOpen(true);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const saveAddress = async () => {
    try {
      await api.post('/user/address', { address });
      setSnackbarMessage('Adresse enregistrée avec succès');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'adresse:', error);
      setSnackbarMessage('Erreur lors de l\'enregistrement de l\'adresse');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/artworks/${id}`);
      fetchArtworks();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'œuvre:', error);
      setSnackbarMessage('Erreur lors de la suppression de l\'œuvre');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Button variant="contained" color="primary" component={Link} to="/add-artwork" sx={{ mb: 4 }}>
        Ajouter une nouvelle œuvre
      </Button>
      
      <TextField
        fullWidth
        label="Entrez votre adresse"
        value={address}
        onChange={handleAddressChange}
        margin="normal"
      />
      <Button variant="contained" onClick={searchAddress} sx={{ mt: 2, mr: 2 }}>
        Rechercher
      </Button>
      <Button variant="contained" color="secondary" onClick={saveAddress} sx={{ mt: 2 }}>
        Enregistrer l'adresse
      </Button>
      
      <div ref={mapContainerRef} style={{ height: '400px', width: '100%', marginTop: '20px', marginBottom: '20px' }}></div>
      
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
                <Button size="small" component={Link} to={`/edit-artwork/${artwork._id}`}>Modifier</Button>
                <Button size="small" color="error" onClick={() => handleDelete(artwork._id)}>Supprimer</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Alert,
  Button,
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userHasAddress, setUserHasAddress] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await api.get('/artworks/public');
        setArtworks(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des œuvres:', error);
        // Si l'erreur indique que l'utilisateur n'a pas d'adresse
        if (error.response?.status === 400) {
          setUserHasAddress(false);
        }
        setError(error.response?.data?.message || 'Erreur lors du chargement de la galerie');
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Chargement...</Typography>
      </Container>
    );
  }

  // Si l'utilisateur n'a pas configuré son adresse
  if (!userHasAddress) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="info" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/dashboard')}
            >
              Configurer
            </Button>
          }
        >
          Veuillez configurer votre adresse pour voir les œuvres disponibles dans votre zone.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (artworks.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Notre Galerie
        </Typography>
        <Alert severity="info">
          Aucune œuvre n'est actuellement disponible dans votre zone de livraison.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Notre Galerie
      </Typography>
      
      <Grid container spacing={4}>
        {artworks.map((artwork) => (
          <Grid item xs={12} sm={6} md={4} key={artwork._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={artwork.imageUrl}
                alt={artwork.title}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {artwork.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Par {artwork.artist}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {artwork.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary" component="span">
                    {artwork.price} €
                  </Typography>
                  {artwork.distance && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ ml: 2 }}
                      component="span"
                    >
                      Distance: {Math.round(artwork.distance * 10) / 10} km
                    </Typography>
                  )}
                </Box>
                {artwork.user?.deliveryRadius && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Zone de livraison : {artwork.user.deliveryRadius} km
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Gallery;
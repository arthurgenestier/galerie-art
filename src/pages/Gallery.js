import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material';
import api from '../api/axios';

function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await api.get('/artworks');
        setArtworks(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des œuvres:', error);
        setError('Impossible de charger les œuvres. Veuillez réessayer plus tard.');
      }
    };

    fetchArtworks();
  }, []);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Notre Galerie
      </Typography>
      <Grid container spacing={4}>
        {artworks.map((artwork) => (
          <Grid item key={artwork._id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={artwork.imageUrl}
                alt={artwork.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {artwork.title}
                </Typography>
                <Typography gutterBottom variant="h5" component="div">
                  {artwork.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {artwork.artist}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prix: {artwork.price} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Gallery;
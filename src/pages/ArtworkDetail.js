import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Card, CardMedia, CardContent, Grid } from '@mui/material';
import axios from 'axios';

function ArtworkDetail() {
  const [artwork, setArtwork] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(`/api/artworks/${id}`);
        setArtwork(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'œuvre:', error);
      }
    };

    fetchArtwork();
  }, [id]);

  if (!artwork) return <Typography>Chargement...</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={artwork.imageUrl}
              alt={artwork.title}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {artwork.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {artwork.artist}
          </Typography>
          <Typography variant="body1" paragraph>
            {artwork.description}
          </Typography>
          <Typography variant="h6" color="primary">
            Prix: {artwork.price} €
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ArtworkDetail;
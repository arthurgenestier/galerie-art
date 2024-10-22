import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

function Home() {
  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Bienvenue sur notre Galerie d'Art en Ligne
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Découvrez des œuvres uniques d'artistes du monde entier
      </Typography>
      <Button variant="contained" color="primary" component={RouterLink} to="/gallery">
        Visiter la Galerie
      </Button>
    </Container>
  );
}

export default Home;
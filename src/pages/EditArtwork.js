import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function EditArtwork() {
  const [artwork, setArtwork] = useState({ title: '', artist: '', description: '', imageUrl: '', price: '' });
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await api.get(`/artworks/${id}`);
        setArtwork(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'œuvre:', error);
        setError('Impossible de charger les détails de l\'œuvre.');
      }
    };

    fetchArtwork();
  }, [id]);

  const handleChange = (e) => {
    setArtwork({ ...artwork, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/artworks/${id}`, artwork);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la modification de l\'œuvre:', error);
      setError('Une erreur est survenue lors de la modification de l\'œuvre.');
    }
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Modifier l'œuvre
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Titre de l'œuvre"
            name="title"
            value={artwork.title}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="artist"
            label="Nom de l'artiste"
            name="artist"
            value={artwork.artist}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={artwork.description}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="imageUrl"
            label="URL de l'image"
            name="imageUrl"
            value={artwork.imageUrl}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="price"
            label="Prix"
            name="price"
            type="number"
            value={artwork.price}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Modifier l'œuvre
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default EditArtwork;
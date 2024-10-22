import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function AddArtwork() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/artworks', { title, artist, description, imageUrl, price: Number(price) });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'œuvre:', error);
      // Gérer l'erreur (ex: afficher un message à l'utilisateur)
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Ajouter une nouvelle œuvre
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Titre de l'œuvre"
            name="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="artist"
            label="Nom de l'artiste"
            name="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="imageUrl"
            label="URL de l'image"
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="price"
            label="Prix"
            name="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Ajouter l'œuvre
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AddArtwork;
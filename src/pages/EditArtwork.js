import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Typography, TextField, Button, Box, Paper,
  Snackbar, Alert, IconButton, Grid, Card, CardMedia
} from '@mui/material';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowBack, CloudUpload, Delete } from '@mui/icons-material';
import api from '../api/axios';

function EditArtwork() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    imageUrl: '',
    price: '',
    width: '',
    height: '',
    medium: '',
    year: '',
    style: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Charger les données de l'œuvre
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await api.get(`/artworks/${id}`);
        const artwork = response.data;
        setFormData({
          title: artwork.title || '',
          artist: artwork.artist || '',
          description: artwork.description || '',
          imageUrl: artwork.imageUrl || '',
          price: artwork.price || '',
          width: artwork.dimensions?.width || '',
          height: artwork.dimensions?.height || '',
          medium: artwork.medium || '',
          year: artwork.year || '',
          style: artwork.style || ''
        });
        setImagePreview(artwork.imageUrl);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'œuvre:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement de l\'œuvre',
          severity: 'error'
        });
      }
    };

    fetchArtwork();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Veuillez sélectionner une image valide',
        severity: 'error'
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      setIsSubmitting(true);
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.url
      }));
      setImagePreview(URL.createObjectURL(file));
      
      setSnackbar({
        open: true,
        message: 'Image téléchargée avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur détaillée:', error.response || error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors du téléchargement de l\'image',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.artist.trim()) newErrors.artist = 'Le nom de l\'artiste est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Veuillez entrer un prix valide';
    if (!formData.imageUrl) newErrors.imageUrl = 'Une image est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Veuillez corriger les erreurs du formulaire',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/artworks/${id}`, {
        ...formData,
        price: Number(formData.price),
        year: Number(formData.year) || null,
        dimensions: {
          width: Number(formData.width) || 0,
          height: Number(formData.height) || 0
        },
        width: undefined,
        height: undefined
      });
      
      setSnackbar({
        open: true,
        message: 'Œuvre modifiée avec succès',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'œuvre:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de la modification de l\'œuvre',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          component={Link}
          to="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mb: 3 }}
        >
          Retour au tableau de bord
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" gutterBottom align="center">
            Modifier l'œuvre
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  required
                  fullWidth
                  name="title"
                  label="Titre de l'œuvre"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  margin="normal"
                />

                <TextField
                  required
                  fullWidth
                  name="artist"
                  label="Nom de l'artiste"
                  value={formData.artist}
                  onChange={handleChange}
                  error={!!errors.artist}
                  helperText={errors.artist}
                  margin="normal"
                />

                <TextField
                  required
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={imagePreview || '/placeholder-image.png'}
                    alt="Aperçu de l'œuvre"
                    sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                  />
                </Card>
                
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUpload />}
                  disabled={isSubmitting}
                >
                  Modifier l'image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                
                {imagePreview && (
                  <Button
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Supprimer l'image
                  </Button>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  name="price"
                  label="Prix (€)"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  margin="normal"
                  InputProps={{
                    inputProps: { min: 0 }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    name="width"
                    label="Largeur"
                    type="number"
                    value={formData.width}
                    onChange={handleChange}
                    margin="normal"
                    InputProps={{
                      endAdornment: <Typography color="text.secondary">cm</Typography>,
                      inputProps: { min: 0 }
                    }}
                  />
                  <TextField
                    fullWidth
                    name="height"
                    label="Hauteur"
                    type="number"
                    value={formData.height}
                    onChange={handleChange}
                    margin="normal"
                    InputProps={{
                      endAdornment: <Typography color="text.secondary">cm</Typography>,
                      inputProps: { min: 0 }
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="medium"
                  label="Technique/Support"
                  placeholder="ex: Huile sur toile"
                  value={formData.medium}
                  onChange={handleChange}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  name="year"
                  label="Année de création"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  margin="normal"
                  InputProps={{
                    inputProps: { 
                      min: 1800,
                      max: new Date().getFullYear()
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Modifier l\'œuvre'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EditArtwork;
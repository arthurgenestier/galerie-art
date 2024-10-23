import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Box, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/user/register', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/login');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error.response?.data);
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Inscription
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nom d'utilisateur"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse e-mail"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            S'inscrire
          </Button>
        </form>

        <Box sx={{ 
          mt: 2,
          width: '100%',
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Déjà inscrit ?{' '}
            <Link 
              component={RouterLink} 
              to="/login" 
              sx={{ 
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Connectez-vous ici
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
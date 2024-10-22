import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Galerie d'Art en Ligne
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">Accueil</Button>
          <Button color="inherit" component={RouterLink} to="/gallery">Galerie</Button>
          {isLoggedIn ? (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard">Tableau de bord</Button>
              <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Connexion</Button>
              <Button color="inherit" component={RouterLink} to="/register">Inscription</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
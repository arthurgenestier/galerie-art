import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Header';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ArtworkDetail from './pages/ArtworkDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddArtwork from './pages/AddArtwork';
import EditArtwork from './pages/EditArtwork';

const theme = createTheme({
  // Vous pouvez personnaliser votre thème ici
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-artwork" element={<AddArtwork />} />
            <Route path="/edit-artwork/:id" element={<EditArtwork />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
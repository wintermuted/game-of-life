import { Box, AppBar, Toolbar, IconButton, Tooltip, Typography } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InfoIcon from '@mui/icons-material/Info';
import HomeIcon from '@mui/icons-material/Home';
import Home from "./components/Home";
import About from "./components/About";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useThemeMode } from './ThemeContext';
import { useTranslation } from 'react-i18next';

// Game of Life with MUI

function App() {
  const { mode, toggleTheme } = useThemeMode();
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('app.title')}
          </Typography>
          <Tooltip title={t('nav.home')}>
            <IconButton component={Link} to="/" color="inherit" aria-label="home">
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('nav.about')}>
            <IconButton component={Link} to="/about" color="inherit" aria-label="about">
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('nav.toggleDarkMode')}>
            <IconButton onClick={toggleTheme} color="inherit" aria-label="toggle dark mode">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <LanguageSwitcher />
          <Tooltip title={t('nav.viewSource')}>
            <IconButton
              color="inherit"
              aria-label="github"
              component="a"
              href="https://github.com/wintermuted/game-of-life"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Box>
  );
}

export default App;

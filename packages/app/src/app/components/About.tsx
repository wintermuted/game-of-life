import { Container, Typography, Box, Paper, Link, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function About() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Conway's Game of Life
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          What is Conway's Game of Life?
        </Typography>
        <Typography variant="body1" paragraph>
          Conway's Game of Life is a cellular automaton devised by mathematician John Horton Conway in 1970. 
          It's a zero-player game, meaning its evolution is determined by its initial state, requiring no further input.
        </Typography>
        <Typography variant="body1" paragraph>
          The game consists of a grid of cells that can be either alive or dead. Each cell interacts with its 
          eight neighbors according to four simple rules:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            Any live cell with 2-3 live neighbors survives
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Any dead cell with exactly 3 live neighbors becomes alive
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            All other live cells die in the next generation
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            All other dead cells stay dead
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          Despite these simple rules, the Game of Life can produce incredibly complex patterns and behaviors, 
          making it a fascinating example of emergent complexity.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          About This Project
        </Typography>
        <Typography variant="body1" paragraph>
          This is a TypeScript implementation of Conway's Game of Life featuring:
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            Pure functional core logic with comprehensive unit tests
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            React-based interactive UI with Material-UI components
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Dictionary-based data structure optimized for sparse grids
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Pre-loaded patterns including still lifes, oscillators, spaceships, and methuselahs
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            URL-based pattern sharing
          </Typography>
        </Box>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          Links
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <GitHubIcon />
            </ListItemIcon>
            <ListItemText>
              <Link 
                href="https://github.com/wintermuted/game-of-life" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                View Source Code on GitHub
                <OpenInNewIcon fontSize="small" />
              </Link>
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <OpenInNewIcon />
            </ListItemIcon>
            <ListItemText>
              <Link 
                href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                Conway's Game of Life on Wikipedia
                <OpenInNewIcon fontSize="small" />
              </Link>
            </ListItemText>
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}

export default About;

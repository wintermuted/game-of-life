import { Container, Typography, Box, Paper, Link, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';

function About() {
  const { t } = useTranslation();
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {t('about.title')}
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          {t('about.whatIsIt')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('about.description1')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('about.description2')}
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('about.rule1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.rule2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.rule3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.rule4')}
          </Typography>
        </Box>
        <Typography variant="body1" paragraph>
          {t('about.description3')}
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          {t('about.projectTitle')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('about.projectDescription')}
        </Typography>
        <Box component="ul" sx={{ pl: 4 }}>
          <Typography component="li" variant="body1" paragraph>
            {t('about.feature1')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.feature2')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.feature3')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.feature4')}
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            {t('about.feature5')}
          </Typography>
        </Box>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
          {t('about.linksTitle')}
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
                {t('about.viewSource')}
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
                {t('about.wikiLink')}
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

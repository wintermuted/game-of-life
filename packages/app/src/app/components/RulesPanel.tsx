import { Box, Typography, FormGroup, FormControlLabel, Switch, Paper } from '@mui/material';
import { GameRules } from '@game-of-life/core';

interface Props {
  rules: GameRules;
  onRulesChange: (rules: GameRules) => void;
  disabled?: boolean;
}

function RulesPanel({ rules, onRulesChange, disabled = false }: Props) {
  const handleToggle = (ruleId: keyof GameRules) => {
    const updatedRules = {
      ...rules,
      [ruleId]: {
        ...rules[ruleId],
        enabled: !rules[ruleId].enabled
      }
    };
    onRulesChange(updatedRules);
  };

  return (
    <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
      <Typography variant="h5" gutterBottom>Game Rules</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toggle rules to customize the simulation behavior
      </Typography>
      <FormGroup>
        {Object.entries(rules).map(([key, rule]) => (
          <Box key={rule.id} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={rule.enabled}
                  onChange={() => handleToggle(key as keyof GameRules)}
                  disabled={disabled}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" component="div">
                    {rule.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="div">
                    {rule.description}
                  </Typography>
                </Box>
              }
            />
          </Box>
        ))}
      </FormGroup>
    </Paper>
  );
}

export default RulesPanel;

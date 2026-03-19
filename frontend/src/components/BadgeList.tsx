import React from 'react';
import { Box, Stack } from '@mui/material';
import Badge from './Badge';

interface BadgeData {
  code: string;
  name: string;
  description?: string;
}

interface BadgeListProps {
  badges: BadgeData[];
  size?: number;
  spacing?: number;
  direction?: 'row' | 'column';
}

const BadgeList: React.FC<BadgeListProps> = ({
  badges,
  size = 48,
  spacing = 1,
  direction = 'row',
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <Stack
      direction={direction}
      spacing={spacing}
      sx={{
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {badges.map((badge, index) => (
        <Badge
          key={`${badge.code}-${index}`}
          code={badge.code}
          name={badge.name}
          description={badge.description}
          size={size}
        />
      ))}
    </Stack>
  );
};

export default BadgeList;


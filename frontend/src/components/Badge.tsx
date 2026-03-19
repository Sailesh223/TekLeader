import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

interface BadgeProps {
  code: string;
  name: string;
  description?: string;
  size?: number;
  showTooltip?: boolean;
}

const badgeConfig: Record<string, { frame: number; className: string }> = {
  'STREAK_STAR': { frame: 1, className: 'badge-champion' },
  'ONE_ON_ONE_CHAMPION': { frame: 2, className: 'badge-shield' },
  'MOST_IMPROVED': { frame: 3, className: 'badge-analytics' },
  'HEAVY_LIFTER': { frame: 4, className: 'badge-premium' },
  'PREMIUM_BADGE': { frame: 5, className: 'badge-mythril' },
};

const Badge: React.FC<BadgeProps> = ({
  code,
  name,
  description,
  size = 48,
  showTooltip = true,
}) => {
  const config = badgeConfig[code];

  if (!config) {
    return null;
  }

  const badgeImage = (
    <Box
      className={config.className}
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <img
        src={`/badges/Frame ${config.frame}.svg`}
        alt={name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      {/* Particles for mythril badge */}
      {code === 'PREMIUM_BADGE' && (
        <>
          <span className="particle" />
          <span className="particle" />
          <span className="particle" />
          <span className="particle" />
          <span className="particle" />
          <span className="particle" />
          <span className="particle" />
          <span className="particle" />
        </>
      )}
    </Box>
  );

  if (!showTooltip) {
    return badgeImage;
  }

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {name}
          </Typography>
          {description && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {description}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      {badgeImage}
    </Tooltip>
  );
};

export default Badge;


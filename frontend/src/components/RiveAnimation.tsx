import { useRive, UseRiveParameters } from '@rive-app/react-canvas';
import { Box } from '@mui/material';

interface RiveAnimationProps {
  src: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  stateMachines?: string;
  onLoad?: () => void;
}

export default function RiveAnimation({
  src,
  width = '100%',
  height = '100%',
  autoplay = true,
  stateMachines,
  onLoad,
}: RiveAnimationProps) {
  const riveParams: UseRiveParameters = {
    src,
    autoplay,
    stateMachines: stateMachines || 'State Machine 1', // Default state machine for interactivity
    ...(onLoad && { onLoad }),
  };

  const { RiveComponent } = useRive(riveParams);

  return (
    <Box
      sx={{
        width,
        height,
        '& canvas': {
          width: '100% !important',
          height: '100% !important',
        }
      }}
    >
      <RiveComponent />
    </Box>
  );
}

// Pre-configured animations for common use cases
export function LevelUpAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <RiveAnimation
      src="/22243-46463-level-up.riv"
      width={400}
      height={400}
      onLoad={onComplete}
    />
  );
}

export function StreakAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <RiveAnimation
      src="/15369-29013-streak-normal.riv"
      width={300}
      height={300}
      onLoad={onComplete}
    />
  );
}

export function MPLAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <RiveAnimation
      src="/22851-42713-mpl.riv"
      width={350}
      height={350}
      onLoad={onComplete}
    />
  );
}

export function CoquiAnimation({ onComplete }: { onComplete?: () => void }) {
  return (
    <RiveAnimation
      src="/22111-41439-the-sound-of-coqui.riv"
      width={300}
      height={300}
      onLoad={onComplete}
    />
  );
}


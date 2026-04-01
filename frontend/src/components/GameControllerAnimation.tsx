import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useEffect } from 'react';

interface GameControllerAnimationProps {
  level?: number;
}

export default function GameControllerAnimation({ level = 1 }: GameControllerAnimationProps) {
  const { rive, RiveComponent } = useRive({
    src: 'https://public.rive.app/community/runtime-files/10314-19684-doodle-video-game-controller-with-play-buttons.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const playInput = useStateMachineInput(rive, 'State Machine 1', 'play');

  useEffect(() => {
    if (playInput) {
      // Trigger play animation when component mounts or level changes
      playInput.fire();
    }
  }, [playInput, level]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <RiveComponent />
    </div>
  );
}


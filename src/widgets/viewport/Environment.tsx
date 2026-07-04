import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

export function Environment() {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = null;
  }, [scene]);

  return null;
}

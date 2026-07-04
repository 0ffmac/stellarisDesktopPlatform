import { useThemeStore } from '../../stores/useThemeStore';

export function Lighting() {
  const activeTheme = useThemeStore((s) => s.activeTheme);

  return (
    <>
      <ambientLight
        args={[activeTheme.ambientColor, 0.4]}
      />
      <directionalLight
        args={[activeTheme.keyLightColor, 2.0]}
        position={[5, 5, 5]}
      />
      <directionalLight
        args={[activeTheme.fillLightColor, 0.8]}
        position={[-3, 2, 3]}
      />
    </>
  );
}

import { useUIStore } from '../../stores/useUIStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useStarStore } from '../../stores/useStarStore';
import { FPS_LIMITS, ROUGHNESS_RANGE, METALNESS_RANGE, GLOW_RANGE, BLOOM_RANGE } from '../../shared/constants/defaults';

export function SettingsPanel() {
  const closePanel = useUIStore((s) => s.closePanel);
  const settings = useSettingsStore((s) => s.settings);
  const star = useStarStore((s) => s.star);
  const setFPSLimit = useSettingsStore((s) => s.setFPSLimit);
  const setQualityPreset = useSettingsStore((s) => s.setQualityPreset);
  const setRoughness = useStarStore((s) => s.setRoughness);
  const setMetalness = useStarStore((s) => s.setMetalness);
  const setGlowIntensity = useStarStore((s) => s.setGlowIntensity);
  const setGlowEnabled = useStarStore((s) => s.setGlowEnabled);
  const setWireframe = useStarStore((s) => s.setWireframe);
  const setAutoRotateSpeed = useStarStore((s) => s.setAutoRotateSpeed);
  const setBloom = useStarStore((s) => s.setBloom);
  const setBloomIntensity = useStarStore((s) => s.setBloomIntensity);

  return (
    <div className="absolute right-4 top-16 bottom-4 z-20 w-72">
      <div className="h-full p-4 rounded-2xl bg-[var(--color-surface-overlay)] backdrop-blur-xl border border-[var(--color-border)] shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Settings</h2>
          <button
            onClick={closePanel}
            className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <Section label="Material">
          <Slider
            label="Roughness"
            value={star.roughness}
            min={ROUGHNESS_RANGE[0]}
            max={ROUGHNESS_RANGE[1]}
            step={0.01}
            onChange={setRoughness}
          />
          <Slider
            label="Metalness"
            value={star.metalness}
            min={METALNESS_RANGE[0]}
            max={METALNESS_RANGE[1]}
            step={0.01}
            onChange={setMetalness}
          />
          <Toggle
            label="Wireframe"
            enabled={star.wireframe}
            onChange={setWireframe}
          />
        </Section>

        <Section label="Glow">
          <Toggle
            label="Inner Light"
            enabled={star.glowEnabled}
            onChange={setGlowEnabled}
          />
          {star.glowEnabled && (
            <Slider
              label="Intensity"
              value={star.glowIntensity}
              min={GLOW_RANGE[0]}
              max={GLOW_RANGE[1]}
              step={0.05}
              onChange={setGlowIntensity}
            />
          )}
        </Section>

        <Section label="Bloom">
          <Toggle
            label="Bloom Effect"
            enabled={star.bloom}
            onChange={setBloom}
          />
          {star.bloom && (
            <Slider
              label="Intensity"
              value={star.bloomIntensity}
              min={BLOOM_RANGE[0]}
              max={BLOOM_RANGE[1]}
              step={0.05}
              onChange={setBloomIntensity}
            />
          )}
          <Slider
            label="Auto-Rotate Speed"
            value={star.autoRotateSpeed}
            min={0.1}
            max={2}
            step={0.05}
            onChange={setAutoRotateSpeed}
          />
        </Section>

        <Section label="Performance">
          <Select
            label="FPS Limit"
            value={String(settings.displaySettings.fpsLimit)}
            options={FPS_LIMITS.map((l) => ({
              value: String(l),
              label: l === 0 ? 'Unlimited' : `${l} FPS`,
            }))}
            onChange={(v) => setFPSLimit(Number(v) as typeof FPS_LIMITS[number])}
          />
          <Select
            label="Quality"
            value={settings.displaySettings.qualityPreset}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'ultra', label: 'Ultra' },
            ]}
            onChange={(v) => setQualityPreset(v as typeof settings.displaySettings.qualityPreset)}
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
        {label}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
        <span className="text-xs text-[var(--color-text-primary)] tabular-nums">{pct}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full h-1 appearance-none cursor-pointer
          bg-white/10 rounded-full
          accent-[var(--color-accent)]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[var(--color-accent)]
          [&::-webkit-slider-thumb]:shadow-lg
        "
      />
    </div>
  );
}

function Toggle({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between w-full py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <div
        className={`
          w-8 h-4 rounded-full transition-colors duration-200 relative
          ${enabled ? 'bg-[var(--color-accent)]' : 'bg-white/10'}
        `}
      >
        <div
          className={`
            absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200
            ${enabled ? 'translate-x-4' : 'translate-x-0.5'}
          `}
        />
      </div>
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          text-xs bg-white/5 border border-[var(--color-border)] rounded-md px-2 py-1
          text-[var(--color-text-primary)]
          outline-none focus:ring-1 focus:ring-[var(--color-accent)]
          appearance-none cursor-pointer
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--color-surface)]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

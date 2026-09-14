/** Slider (step 1) + numeric input pair used for font sizes, widths, gaps, … */
export function SliderRow({
  label,
  value,
  dflt,
  min,
  max,
  unit,
  wide,
  onChange,
  disabled = false,
}: {
  label: string;
  value: number | null;
  dflt: number;
  min: number;
  max: number;
  unit?: string;
  wide?: boolean;
  onChange: (n: number | null) => void;
  disabled?: boolean;
}) {
  return (
    <div className={'font-slider-row' + (disabled ? ' slider-row-disabled' : '')}>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value ?? dflt}
        onChange={(e) => !disabled && onChange(Number(e.target.value))}
        aria-label={`${label}, steps of 1`}
        className={value == null ? 'is-unset' : ''}
        disabled={disabled}
      />
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={value ?? ''}
        placeholder="Auto"
        onChange={(e) => {
          if (disabled) return;
          if (e.target.value === '') {
            onChange(null);
            return;
          }
          const n = Math.round(Number(e.target.value));
          if (!Number.isFinite(n)) return;
          onChange(Math.max(min, Math.min(max, n)));
        }}
        aria-label={`${label}, numeric value`}
        className={'font-number' + (wide ? ' font-number-wide' : '')}
        disabled={disabled}
      />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}

export default SliderRow;

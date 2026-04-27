let prevValues = {};

export function smooth(key, value, alpha = 0.7) {
  if (prevValues[key] == null) {
    prevValues[key] = value;
    return value;
  }

  const smoothed = prevValues[key] * alpha + value * (1 - alpha);
  prevValues[key] = smoothed;

  return smoothed;
}

export function resetSmooth() {
  prevValues = {};
}
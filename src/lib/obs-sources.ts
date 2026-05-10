export const OBS_SOURCES = {
  overlay: {
    label: "Full Overlay",
    width: 1920,
    height: 1080,
  },
  sidebar: {
    label: "Sidebar",
    width: 470,
    height: 760,
  },
  "bottom-bar": {
    label: "Bottom Bar",
    width: 1856,
    height: 180,
  },
} as const;

export type ObsSource = keyof typeof OBS_SOURCES;

export function isObsSource(value: string): value is ObsSource {
  return value in OBS_SOURCES;
}

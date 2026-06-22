import type { ColorTokens } from "../../lib/theme";

export interface EditorialPalette {
  bg1: string;
  bg2: string;
  bg3: string;
  text: string;
  muted: string;
  subtle: string;
  accent: string;
  glassBorder: string;
}

export function editorialPalette(colors: ColorTokens): EditorialPalette {
  return {
    bg1: colors.bgDark,
    bg2: colors.bgPanel,
    bg3: colors.bgDark,
    text: colors.textColor,
    muted: colors.mutedText,
    subtle: colors.subtleText,
    accent: colors.pinkAccent,
    glassBorder: `${colors.borderColor}55`,
  };
}

export const EDITORIAL_PALETTE: EditorialPalette = {
  bg1: "#1a1a1a",
  bg2: "#221f1a",
  bg3: "#171615",
  text: "#fafafa",
  muted: "#b8b8b8",
  subtle: "#85827c",
  accent: "#e0815c",
  glassBorder: "#4a463d55",
};

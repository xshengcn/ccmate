import { useTheme } from "next-themes";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";

export function useCodeMirrorTheme() {
  const { theme } = useTheme();

  return theme === "dark" ? vscodeDark : vscodeLight;
}
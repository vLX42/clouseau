import { loadFont as loadSlab, fontFamily as slabFamily } from "@remotion/google-fonts/RobotoSlab";
import { loadFont as loadMono, fontFamily as monoFamily } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadHand, fontFamily as handFamily } from "@remotion/google-fonts/Caveat";

loadSlab("normal", { weights: ["400", "700", "900"] });
loadMono("normal", { weights: ["400", "500", "700"] });
loadHand("normal", { weights: ["400", "700"] });

export const FONT_HEADING = slabFamily;
export const FONT_MONO = monoFamily;
export const FONT_HAND = handFamily;

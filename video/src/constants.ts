// Frame budget for the Clouseau explainer at 30 fps.
// total frames = sum(scenes) - sum(transitions)
//
// Now with two extra harness-responsibility scenes (BOUNCER, FIREWALL)
// pulled in from the slide deck. Total: 16 scenes.
//
// scenes:       130 + 180 + 180 + 270 + 220 + 200 + 230 + 160 + 240 + 210
//             + 190 + 210 + 220 + 250 + 250 + 180
//             = 3320
// transitions:  15 × 13 = 195  (16 scenes → 15 gaps)
// output:       3320 - 195 = 3125 frames ≈ 104.2s
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TRANSITION_FRAMES = 13;
export const DURATION_FRAMES = 3125;

export const SCENE_FRAMES = {
  title: 130,
  illusion: 180,
  twist: 180,
  loop: 270,
  instructions: 220,
  request: 200,
  toolCall: 230,
  permission: 160,
  bouncer: 240,
  firewall: 210,
  iterate: 190,
  tokens: 210,
  compaction: 220,
  subagent: 250,
  wallReveal: 250,
  outro: 180,
} as const;

// Clouseau crazy-wall palette — pulled straight from the app's CSS so the
// video and the live demo look like the same universe.
export const COLORS = {
  paper: "#f4ede0",
  paperDim: "#ece4d3",
  ink: "#1a1a1a",
  inkSoft: "#5a4634",
  rule: "#a89578",
  accent: "#5a4634",
  string: "#a8201a",
  cardUser: "#ffffff",
  cardUserBar: "#2f4a6d",
  cardRequest: "#fbf7ec",
  cardRequestBar: "#b0a07a",
  cardResponse: "#f0f4e3",
  cardResponseBar: "#7a8f4a",
  cardAssistant: "#faf2dc",
  cardAssistantBar: "#9c7a3a",
  cardInstructions: "#efe4cc",
  cardInstructionsBar: "#7a5a2e",
  cardCompaction: "#fef7c2",
  envelope1: "#d9b97a",
  envelope2: "#c9a55f",
  envelope3: "#b18d4b",
  stickyYellow: "#fef7c2",
  stampToolCall: "#7a1d14",
  stampPermission: "#a35a14",
  stampStop: "#2a2018",
  stampSubagent: "#1f3d6e",
  polaroidPaper: "#f7f2e4",
  polaroidScreen: "#1a1a1a",
} as const;

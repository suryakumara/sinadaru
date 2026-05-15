/**
 * Unified icon component backed by @expo/vector-icons.
 * react-native-elements is installed for the broader UI ecosystem;
 * icons are rendered via the same underlying vector-icon sets that
 * react-native-elements uses (Ionicons, MaterialCommunityIcons).
 */
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IoniconName          = keyof typeof Ionicons.glyphMap;
type MCIName              = keyof typeof MaterialCommunityIcons.glyphMap;
type IconDef = { lib: "ion"; name: IoniconName } | { lib: "mci"; name: MCIName };

const MAP = {
  // ── Sensors & Navigation ────────────────────────────────────
  gps:           { lib: "ion", name: "location-outline"          } as IconDef,
  compass:       { lib: "ion", name: "compass-outline"           } as IconDef,
  steps:         { lib: "ion", name: "walk-outline"              } as IconDef,
  barometer:     { lib: "mci", name: "gauge"                     } as IconDef,
  distance:      { lib: "mci", name: "ruler"                     } as IconDef,
  altitude:      { lib: "ion", name: "arrow-up-outline"          } as IconDef,
  floor:         { lib: "mci", name: "office-building-outline"   } as IconDef,
  satellite:     { lib: "mci", name: "satellite-variant"         } as IconDef,
  sensor:        { lib: "ion", name: "pulse-outline"             } as IconDef,
  accuracy:      { lib: "ion", name: "radio-outline"             } as IconDef,

  // ── Actions ─────────────────────────────────────────────────
  search:        { lib: "ion", name: "search-outline"            } as IconDef,
  filter:        { lib: "ion", name: "options-outline"           } as IconDef,
  eye:           { lib: "ion", name: "eye-outline"               } as IconDef,
  layers:        { lib: "ion", name: "layers-outline"            } as IconDef,
  play:          { lib: "ion", name: "play"                      } as IconDef,
  stop:          { lib: "ion", name: "stop"                      } as IconDef,
  reset:         { lib: "ion", name: "refresh-outline"           } as IconDef,
  add:           { lib: "ion", name: "add-circle-outline"        } as IconDef,
  close:         { lib: "ion", name: "close-circle-outline"      } as IconDef,
  edit:          { lib: "ion", name: "create-outline"            } as IconDef,
  upload:        { lib: "ion", name: "cloud-upload-outline"      } as IconDef,
  chevron:       { lib: "ion", name: "chevron-forward"           } as IconDef,
  info:          { lib: "ion", name: "information-circle-outline"} as IconDef,

  // ── Places / UI ─────────────────────────────────────────────
  map:           { lib: "ion", name: "map-outline"               } as IconDef,
  scale:         { lib: "mci", name: "ruler"                     } as IconDef,
  building:      { lib: "mci", name: "office-building-outline"   } as IconDef,
  warning:       { lib: "ion", name: "warning-outline"           } as IconDef,
  store:         { lib: "ion", name: "storefront-outline"        } as IconDef,
  tip:           { lib: "ion", name: "bulb-outline"              } as IconDef,
  stepLength:    { lib: "ion", name: "footsteps-outline"         } as IconDef,

  // ── Kios categories ─────────────────────────────────────────
  "cat-sayur":   { lib: "mci", name: "leaf"                      } as IconDef,
  "cat-daging":  { lib: "mci", name: "food-steak"                } as IconDef,
  "cat-ikan":    { lib: "mci", name: "fish"                      } as IconDef,
  "cat-bumbu":   { lib: "mci", name: "fire"                      } as IconDef,
  "cat-lainnya": { lib: "mci", name: "cart-outline"              } as IconDef,
} as const;

export type AppIconName = keyof typeof MAP;

interface Props {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: object;
}

export function AppIcon({ name, size = 20, color, style }: Props) {
  const def = MAP[name];
  if (def.lib === "mci") {
    return <MaterialCommunityIcons name={def.name} size={size} color={color} style={style} />;
  }
  return <Ionicons name={def.name} size={size} color={color} style={style} />;
}

import { GyverlampCard } from "./custom-element/gyverlamp-card";
import { printVersion } from "./utils";

// Registering card
customElements.define("gyverlamp-card", GyverlampCard);

printVersion();
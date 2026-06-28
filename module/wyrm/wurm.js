import { WurmActorSheet } from "./actor/actor-sheet.js";
import { WurmItemSheet } from "./item/item-sheet.js";

Hooks.once('init', async function() {
  console.log('Würm | Initializing Würm System');

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wurm", WurmActorSheet, { makeDefault: true });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wurm", WurmItemSheet, { makeDefault: true });
});

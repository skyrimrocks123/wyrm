export class WurmActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wurm", "sheet", "actor"],
      template: "systems/wurm/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  getData() {
    const context = super.getData();
    context.systemData = context.data.system;
    
    // Categorize items
    context.strengths = [];
    context.weaknesses = [];
    context.talents = [];
    context.secretArts = [];
    context.weapons = [];
    context.gear = [];

    for (let i of context.items) {
      if (i.type === 'strength') context.strengths.push(i);
      else if (i.type === 'weakness') context.weaknesses.push(i);
      else if (i.type === 'talent') context.talents.push(i);
      else if (i.type === 'secretArt') context.secretArts.push(i);
      else if (i.type === 'weapon') context.weapons.push(i);
      else if (i.type === 'gear') context.gear.push(i);
    }

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    // Roll logic
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const data = {
      name: `New ${type.capitalize()}`,
      type: type,
      system: {}
    };
    return this.actor.createEmbeddedDocuments("Item", [data]);
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.rollType === 'wurm-roll') {
      let rollFormula = "2d6";
      let rollLabel = "Würm Roll";

      // If we clicked a weapon, add its modifier and damage
      if (dataset.itemId) {
         const item = this.actor.items.get(dataset.itemId);
         if (item) {
           rollLabel = `Attack with ${item.name}`;
           if (item.system.modifier) {
             rollFormula += ` + ${item.system.modifier}`;
           }
         }
      }

      let roll = new Roll(rollFormula, this.actor.getRollData());
      roll.evaluate({async: true}).then(r => {
          r.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: rollLabel
          });
      });
    }
  }
}

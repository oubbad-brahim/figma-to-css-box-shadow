import { rgbaToCssString } from "./utils";

figma.showUI(__html__, { themeColors: true, width: 400, height: 200 });

figma.loadAllPagesAsync();

if (figma.currentPage.selection.length != 0) {
  generateBoxShadow();
}

figma.on("selectionchange", () => {
  generateBoxShadow();
});

figma.on("documentchange", () => {
  generateBoxShadow();
});

figma.ui.onmessage = (msg: { type: string; message: string }) => {
  if (msg.type === "toast-message") {
    figma.notify(msg.message);
  }
};

function generateBoxShadow() {
  let boxShadow = "";

  if (figma.currentPage.selection.length == 1) {
    const node = figma.currentPage.selection[0];

    const minimalEffectMixin = node as BlendMixin;
    const effects = minimalEffectMixin.effects as Effect[];
    const effectsLastIndex = effects.length - 1;

    boxShadow = [...effects]
      .reverse()
      .filter((effect) => {
        const isInnerShadow = effect.type == "INNER_SHADOW";
        const isDropShadow = effect.type == "DROP_SHADOW";
        return effect.visible && (isInnerShadow || isDropShadow);
      })
      .map((effect) => {
        return effect as InnerShadowEffect | DropShadowEffect;
      })
      .reduce((result, effect, index) => {
        let value = "";

        if (index === 0) {
          value += "box-shadow: ";
        }

        const { offset, radius, spread, color } = effect;

        if (effect.type == "INNER_SHADOW") {
          value += "inset ";
        }

        value += `${offset.x}px ${offset.y}px `;
        value += `${radius}px ${spread}px `;
        value += `${rgbaToCssString(color)}`;

        if (index === effectsLastIndex) {
          value += ";";
        } else {
          value += ", ";
        }
        return result + value;
      }, "");
  }
  figma.ui.postMessage(boxShadow);
}

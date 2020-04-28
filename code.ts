const { children } = figma.root;

export interface ExportableBytes {
  name: string;
  id: string;
  nodeType: string;
  width?: number;
  height?: number;
  parent?: string;
  setting?: ExportSettingsImage | ExportSettingsPDF | ExportSettingsSVG;
  bytes?: Uint8Array;
}

async function main(nodes): Promise<string> {
  let exportableBytes: ExportableBytes[] = [];
  let manifest = {scenes: {}, planes: {}};

  for (let node of nodes) {
    let nodeType = "page";
    let { name, id } = node;

    exportableBytes.push({
      name,
      id,
      nodeType
    });

    manifest.scenes[name] = { background: null };

    for (let child of node.children) {
      let nodeType = "frame";
      let { name, id, width, height, parent, exportSettings } = child;

      manifest.planes[name] = {};

      if (exportSettings.length === 0) {
        exportSettings = [
          {
            format: "PNG",
            suffix: "",
            constraint: { type: "SCALE", value: 1 },
            contentsOnly: true
          }
        ];
      }

      for (let setting of exportSettings) {
        let defaultSetting = setting;
        const bytes = await child.exportAsync(defaultSetting);
        exportableBytes.push({
          name,
          id,
          nodeType,
          width,
          height,
          parent,
          setting,
          bytes
        });
      }
    }
  }

  figma.showUI(__html__, {
    visible: true,
    height: 238
  });
  figma.ui.postMessage({ exportableBytes, manifest  });

  return new Promise(res => {
    figma.ui.onmessage = () => res();
  });
}

main(children).then(res => figma.closePlugin(res));

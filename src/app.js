import zrender from 'zrender/src/zrender';
import Rect from 'zrender/src/graphic/shape/Rect';
import PathTool from 'zrender/src/tool/path';
import Group from 'zrender/src/container/Group';
import Text from 'zrender/src/graphic/Text';
import * as d3 from 'd3';
import * as d3_sankey from 'd3-sankey';

const width = 800, height = 500;
let zr = zrender.init(document.querySelector("#canvas"));

fetch('../data/energy.json')
   .then((d) => {
      d.json()
         .then((data) => {
            paint(data);
         });
   });

let sk = d3_sankey.sankey()
   .nodeWidth(15)
   .nodePadding(10)
   .extent([[1, 1], [width - 100, height - 6]]);

function paint(data) {
   let linkGroup = new Group();
   let nodeGroup = new Group();
   let textGroup = new Group();

   sk(data);
   let color = d3.scaleOrdinal(d3.schemeCategory10);

   for(let i = 0; i < data.links.length; i++) {
      let link = PathTool.createFromString(d3_sankey.sankeyLinkHorizontal()(data.links[i]), {
         style: {
            lineWidth: Math.max(1, data.links[i].width),
            stroke: 'rgba(100, 100, 100, 0.6)',
            fill: null
         }
      });

      link.on("mouseover", function() {
         this.setStyle("stroke", "rgba(100, 100, 100, 0.8)");
      });

      link.on("mouseout", function() {
         this.setStyle("stroke", "rgba(100, 100, 100, 0.6)");
      });

      linkGroup.add(link);
   }

   for(let i = 0; i < data.nodes.length; i++) {
      let node = new Rect({
         shape: {
            x: data.nodes[i]["x0"],
            y: data.nodes[i]["y0"],
            height: data.nodes[i]["y1"] - data.nodes[i]["y0"],
            width: data.nodes[i]["x1"] - data.nodes[i]["x0"]
         },
         style: {
            fill: color(data.nodes[i]["name"].replace(/ .*/, "")),
            stroke: "rgba(0, 0, 0, 1)",
            lineWidth: 1
         }
      });

      nodeGroup.add(node);

      let text = new Text({
         style: {
            x: data.nodes[i]["x0"] + 18,
            y: data.nodes[i]["y0"] + node.shape.height / 2 - 6,
            text: data.nodes[i]["name"],
         }
      });

      textGroup.add(text);
   }

   zr.add(linkGroup);
   zr.add(nodeGroup);
   zr.add(textGroup);
}
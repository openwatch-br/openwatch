/* ============================================================
   NEXO · dashedEdgeProgram.ts
   Programa de aresta tracejada para Sigma.js v3 (WebGL).
   A aresta societária ("ownership") é sempre tracejada em teal — o
   "fio revelador" da Especificação de Grafos. O Sigma v3 não traz um
   programa tracejado embutido, então estendemos o EdgeRectangleProgram
   (mesma espessura variável do programa "line" padrão) e injetamos uma
   distância ao-longo-da-aresta (v_dashDist) para descartar fragmentos e
   formar os traços. Os traços escalam com o zoom (dividido por
   u_sizeRatio → distância aproximadamente em pixels de tela).

   Registrar via:
     new Sigma(graph, container, {
       edgeProgramClasses: { dashed: DashedEdgeProgram },
     });
   e marcar a aresta com attribute `type: "dashed"`.
   ============================================================ */

import { EdgeRectangleProgram } from "sigma/rendering";

const DASH = 7.0; // comprimento do traço (px de tela)
const GAP = 5.0; // comprimento do vão (px de tela)
const PERIOD = DASH + GAP;
const DUTY = DASH / PERIOD;

export class DashedEdgeProgram extends EdgeRectangleProgram {
  getDefinition() {
    const base = super.getDefinition();

    const vertex = base.VERTEX_SHADER_SOURCE.replace(
      "varying vec4 v_color;",
      "varying vec4 v_color;\nvarying float v_dashDist;",
    ).replace(
      "v_normal = unitNormal;",
      "v_normal = unitNormal;\n" +
        "  v_dashDist = a_positionCoef * length(a_positionEnd - a_positionStart) / u_sizeRatio;",
    );

    const fragment = base.FRAGMENT_SHADER_SOURCE.replace(
      "varying vec4 v_color;",
      "varying vec4 v_color;\nvarying float v_dashDist;",
    ).replace(
      "void main(void) {",
      `void main(void) {\n  if (fract(v_dashDist / ${PERIOD.toFixed(1)}) > ${DUTY.toFixed(3)}) discard;`,
    );

    return {
      ...base,
      VERTEX_SHADER_SOURCE: vertex,
      FRAGMENT_SHADER_SOURCE: fragment,
    };
  }
}

export default DashedEdgeProgram;

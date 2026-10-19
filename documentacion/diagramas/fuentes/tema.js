// Tema visual común a todos los diagramas de FarmaciaLink.
// Tipografía: Arial. Paleta: azul #1a365d, verde azulado #319795 y grises neutros.
window.TEMA = {
  fuente: 'Arial, Helvetica, sans-serif',
  azul: '#1a365d',
  teal: '#319795',
  tealClaro: '#e6f4f4',
  gris: '#f1f5f9',
  borde: '#94a3b8',
  linea: '#334155',
  texto: '#1e293b',
};

// Clases reutilizables para diagramas de flujo (inicio, fin, proceso, decisión, sistema).
window.CLASES_FLUJO = `
classDef inicio fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d,font-weight:bold;
classDef fin fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d,font-weight:bold;
classDef proceso fill:#f1f5f9,stroke:#475569,stroke-width:1.5px,color:#1e293b;
classDef sistema fill:#e6f4f4,stroke:#319795,stroke-width:1.5px,color:#134e4a;
classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f;
classDef propuesta fill:#ffffff,stroke:#94a3b8,stroke-width:1.5px,stroke-dasharray:6 4,color:#334155;
`;

(function configurar() {
  const t = window.TEMA;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'loose',
    htmlLabels: false,
    fontFamily: t.fuente,
    // Mismo acabado que los diagramas HTML: esquinas redondeadas y títulos en negrita
    themeCSS: `
      .node rect, .actor, rect.actor, .labelBox { rx: 6px; ry: 6px; }
      .edgeLabel, .edgeLabel rect { font-size: 14px; }
      .cluster-label .nodeLabel, .cluster-label text { font-weight: bold; }
      text.actor > tspan { font-weight: bold; }
    `,
    themeVariables: {
      fontFamily: t.fuente,
      fontSize: '16px',
      primaryColor: t.tealClaro,
      primaryBorderColor: t.teal,
      primaryTextColor: t.texto,
      secondaryColor: t.gris,
      tertiaryColor: '#ffffff',
      lineColor: t.linea,
      textColor: t.texto,
      edgeLabelBackground: '#ffffff',
      clusterBkg: '#f8fafc',
      clusterBorder: t.borde,
      // Secuencia
      actorBkg: t.tealClaro,
      actorBorder: t.teal,
      actorTextColor: t.texto,
      actorLineColor: t.borde,
      signalColor: t.linea,
      signalTextColor: t.texto,
      labelBoxBkgColor: t.gris,
      labelBoxBorderColor: t.borde,
      labelTextColor: t.texto,
      loopTextColor: t.texto,
      noteBkgColor: '#fef3c7',
      noteBorderColor: '#d97706',
      noteTextColor: '#78350f',
      activationBkgColor: t.tealClaro,
      activationBorderColor: t.teal,
      sequenceNumberColor: '#ffffff',
      // Git
      git0: t.azul, git1: t.teal, git2: '#d97706', git3: '#7c3aed', git4: '#16a34a',
      gitBranchLabel0: '#ffffff', gitBranchLabel1: '#ffffff', gitBranchLabel2: '#ffffff',
      gitBranchLabel3: '#ffffff', gitBranchLabel4: '#ffffff',
      commitLabelColor: t.texto, commitLabelBackground: t.gris, commitLabelFontSize: '13px',
      // ER / clases
      attributeBackgroundColorOdd: '#ffffff',
      attributeBackgroundColorEven: t.gris,
    },
    flowchart: { curve: 'basis', nodeSpacing: 45, rankSpacing: 55, padding: 14, htmlLabels: false, wrappingWidth: 260, useMaxWidth: false },
    sequence: { showSequenceNumbers: true, actorMargin: 70, messageMargin: 34, boxMargin: 8, mirrorActors: false, useMaxWidth: false },
    er: { useMaxWidth: false, layoutDirection: 'TB', entityPadding: 12, minEntityWidth: 120 },
    class: { useMaxWidth: false },
    gitGraph: { showCommitLabel: true, mainBranchName: 'main', rotateCommitLabel: true },
  });
})();

window.iniciarMermaid = function () {
  // Inserta las clases comunes donde el diagrama escriba %%CLASES%%
  document.querySelectorAll('.mermaid').forEach((el) => {
    // innerHTML (no textContent) para conservar los <br/> de las etiquetas
    el.innerHTML = el.innerHTML.replace('%%CLASES%%', window.CLASES_FLUJO);
  });
  mermaid.run({ querySelector: '.mermaid' }).then(() => {
    // Tamaño natural del SVG (algunos tipos ignoran useMaxWidth y se encogen al ancho del contenedor)
    document.querySelectorAll('.mermaid svg').forEach((svg) => {
      const vb = svg.viewBox.baseVal;
      if (vb && vb.width) {
        svg.style.maxWidth = 'none';
        svg.setAttribute('width', vb.width);
        svg.setAttribute('height', vb.height);
      }
    });
    document.body.classList.add('listo');
    // Diagramas muy anchos pueden pedir menos zoom con <body data-zoom="1.4">
    if (document.body.dataset.zoom) document.body.style.zoom = document.body.dataset.zoom;
  });
};

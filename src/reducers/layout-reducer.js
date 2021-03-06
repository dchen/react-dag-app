var dagre = require('dagre');

const getLayout = (separation = 10, {nodes, connections}) => {
  var rankSeparation = separation;
  var graph = new dagre.graphlib.Graph();
  graph.setGraph({
    nodesep: 10,
    ranksep: 100,
    rankdir: 'LR',
    marginx: 0,
    marginy: 0
  });
  graph.setDefaultEdgeLabel(function() { return {}; });

  nodes.forEach(function (node) {
    var id = node.id || node.name;
    graph.setNode(id, { label: node.label, width: 105, height: 66 });
  });

  connections.forEach(function (connection) {
    graph.setEdge(connection.from, connection.to);
  });

  dagre.layout(graph);
  return graph;
};

export function graphLayout(state = [], action = {}) {
  switch(action.type) {
    case 'CLEANUP-GRAPH':
      let layout = getLayout(100, action.payload);
      return state.map( node => {
        node.style = {
          top: layout._nodes[node.id].y + 'px',
          left: layout._nodes[node.id].x + 'px'
        };
        return node;
      });
    default:
      return state;
  }
}

const getDimension = (selector) => {
    const parent = document.querySelector(selector);
    const parentDimension = {
      height: parent.getBoundingClientRect().height,
      width: parent.getBoundingClientRect().width
    };
    return parentDimension;
};

export function graph(state = { scale: 1, translate: {} }, action = {}) {
  let scale;
  switch(action.type) {
    case 'FIT-TO-SCREEN':
      let {nodes, connections, parentSelector} = action.payload;
      const parentDimension = getDimension(parentSelector);
      let layout = getLayout(100, {nodes, connections});
      let {width, height} = parentDimension;
      let widthScale = (width - 100) / layout.graph().width;
      let heightScale = (height - 100) / layout.graph().height;
      let scale = Math.min(widthScale, heightScale);
      scale = scale > 1 ? 1 : scale;
      let scaledDownGraphWidth = layout.graph().width * scale;
      let scaledDownGraphHeight = layout.graph().height * scale;

      let translateX = ((width - 100) > scaledDownGraphWidth ? ((width - 100) - scaledDownGraphWidth) / 2 : 0);
      let translateY = ((height - 100) > scaledDownGraphHeight ? ((height - 100) - scaledDownGraphHeight) / 2 : 0);
      return Object.assign({}, state, {
        scale: scale,
        translate: `${translateX}px , ${translateY.toString()}px`
      });
    case 'ZOOM-IN':
      scale = state.scale || 1;
      return Object.assign({}, state, {scale: (scale + 0.1)});
    case 'ZOOM-OUT':
      scale = state.scale || 1;
      return Object.assign({}, state, {scale: (scale - 0.1)});
    default:
      return state;
  }
};

import {combineReducers, createStore, applyMiddleware} from 'redux';
import uuid from 'node-uuid';
import {graph} from './reducers/layout-reducer';

let nodes = (state = [], action = {}) => {
  switch(action.type) {
    case 'ADD-NODE':
      return [
        ...state,
        {
          id: uuid.v4(),
          name: action.node.data.name,
          type: action.node.data.type
        }
      ];
    case 'UPDATE_NODE':
      return state.map(node => {
        if (node.id === action.payload.nodeId) {
          node.style = action.payload.style;
          return node;
        }
        return node;
      });
    default:
      return state;
  }
};
let connections = (state = [], action = {}) => {
  switch(action.type) {
    case 'ADD-CONNECTIONS':
      return [
        ...state,
        {
          from: action.connection.from,
          to: action.connection.to
        }
      ];
    case 'SET-CONNECTIONS':
      return [...action.payload.connections];
    default:
      return state;
  }
};

let combinedReducers = (reducersMap) => {
  let nodesReducers = [nodes].concat(reducersMap['nodes']);
  return combineReducers({
    nodes: (state, action) => {
      return nodesReducers
        .reduce((prev, curr) => curr.bind(null, prev(state, action), action))();
    },
    connections,
    graph
  });
};

export function configureStore(data, reducersMap, middlewares = []) {
  let store = createStore(
    combinedReducers(reducersMap),
    data,
    applyMiddleware.apply(null, middlewares)
  );
  return store;
};

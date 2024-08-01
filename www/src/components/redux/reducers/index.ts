import { combineReducers } from 'redux';

import gridReduser from './gridReducer';
import toasts from './toastsReducer';
import treeReduser from './treeReducer';
import treeViewReduser from './treeViewReducer';

export default combineReducers( {
  treeReduser,
  gridReduser,
  treeViewReduser,
  toasts,
} );

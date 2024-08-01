
import { TTreeView, IActionTreeView } from '../../TreeView/types';

import
{
    TREE_VIEW_LOADING_ON,
    TREE_VIEW_LOADING_OFF
} from '../consts/treeViewConstants';

export const initialState: TTreeView = {
    loading: false,
};

const treeViewReducer = ( state = initialState, action: IActionTreeView ) =>
{
    switch ( action.type )
    {
        case TREE_VIEW_LOADING_ON:
            return Object.assign( {}, state, { loading: true } );
        case TREE_VIEW_LOADING_OFF:
            return Object.assign( {}, state, { loading: false } );
        default:
            return state;
    }
};

export default treeViewReducer

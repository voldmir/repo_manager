import
{
    TREE_GET_ROWS_ALL,
    TREE_SELECT_ROW
} from '../consts/treeConstants';
import { TStateTree, IActionTree } from '../../tree/types'

export const initialState: TStateTree = {
    row: null,
    data: [],
};

const treeReducer = ( state: TStateTree = initialState, action: IActionTree ): TStateTree =>
{
    const { payload, type } = action;

    switch ( type )
    {
        case TREE_GET_ROWS_ALL:
            return Object.assign( {}, state, { data: payload, row: null } );
        case TREE_SELECT_ROW:
            return Object.assign( {}, state, { row: payload } );
        default:
            return state;
    }
};

export default treeReducer

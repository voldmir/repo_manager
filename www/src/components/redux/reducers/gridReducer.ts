import
{
    GRID_DATA_LOAD,
    GRID_INSERT_ROW,
    GRID_REFRESH_ROWS,
    GRID_SELECT_ROW,
    GRID_SELECT_ROW_CLEAN,
    GRID_FILTERED_ROWS

} from '../consts/gridConstants';

import
{
    TStateGridFiles,
    TGridRow,
    TGridRows,
    IActionGridFiles
} from '../../grid/types';
import { NormalModule } from 'webpack';

export const initialState: TStateGridFiles = {
    row: null,
    data: [],
    filter: null
};

const gridReducer = ( state = initialState, action: IActionGridFiles ) =>
{
    const { payload, type } = action;

    switch ( type )
    {
        case GRID_DATA_LOAD:
            if ( state.row ) delete state.row.selected;
            return { ...state, row: null, data: payload as TGridRows };

        case GRID_SELECT_ROW_CLEAN:
            if ( state.row ) delete state.row.selected;
            return { ...state, row: null };

        case GRID_SELECT_ROW:
            if ( state.row ) delete state.row.selected;
            if ( payload ) ( payload as TGridRow ).selected = true;
            return { ...state, row: payload as TGridRow };

        case GRID_INSERT_ROW:
            if ( state.row ) delete state.row.selected;
            state.data.push( payload as TGridRow )
            return { ...state };

        case GRID_REFRESH_ROWS:
            if ( state.row ) delete state.row.selected;
            return { ...state, row: NormalModule, data: [ ...state.data ] };

        case GRID_FILTERED_ROWS:
            return { ...state, filter: payload as string }

        default:
            return state;
    }
};

export default gridReducer

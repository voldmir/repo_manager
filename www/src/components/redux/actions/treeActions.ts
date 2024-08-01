import { webclient } from '../../webclient';
import
{
    TREE_GET_ROWS_ALL,
    TREE_SELECT_ROW
} from '../consts/treeConstants';


import { addToastError } from './toastsActions';
import { api } from '../../../api/folders';
import { actionLoadingOn, actionLoadingOff } from '../actions/TreeViewActions'

export const actionFoldersLoad = () => ( dispatch: any ) =>
{

    dispatch( actionLoadingOn() );
    return webclient.get( '/folders', {}, {}, { responseType: 'arraybuffer' } )
        .finally( () =>
        {
            dispatch( actionLoadingOff() );
            dispatch( { type: TREE_SELECT_ROW, payload: null } );
        } )
        .then( ( { data } ) =>
        {
            dispatch(
                {
                    type: TREE_GET_ROWS_ALL,
                    payload: api.Folders.deserializeBinary( data )
                }
            );
        }
        )
        .catch( ( error ) =>
        {
            dispatch(
                addToastError( error )
            );
        } );
}

export const actionSelectFolder = ( node: any ) => ( dispatch: any ) =>
{
    dispatch( {
        type: TREE_SELECT_ROW,
        payload: node
    } )
}

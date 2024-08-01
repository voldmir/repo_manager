import { webclient } from '../../webclient';
import { addToastError, addToast } from './toastsActions';

import
{
    TREE_VIEW_LOADING_ON,
    TREE_VIEW_LOADING_OFF
} from '../consts/treeViewConstants';

export const actionLoadingOn = () => ( dispatch: any ) =>
{
    dispatch( {
        type: TREE_VIEW_LOADING_ON,
    } )
}

export const actionLoadingOff = () => ( dispatch: any ) =>
{
    dispatch( {
        type: TREE_VIEW_LOADING_OFF,
    } )
}

export const actionRepoReindexes = () => ( dispatch: any ) =>
{
    dispatch( actionLoadingOn() );

    return webclient.post( '/files/reindex', {}, {}, { withCredentials: true } )
        .then( ( { data } ) =>
        {
            dispatch(
                addToast( {
                    message: data,
                } )
            );
        }
        )
        .finally( () =>
        {
            dispatch( actionLoadingOff() );
        } )
        .catch( ( error ) =>
        {
            dispatch(
                addToastError( error )
            );
        } );
}

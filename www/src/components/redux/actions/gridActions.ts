import { webclient } from '../../webclient';
import fileDownload from 'js-file-download'

import
{
    GRID_DATA_LOAD,
    GRID_INSERT_ROW,
    GRID_REFRESH_ROWS,
    GRID_SELECT_ROW,
    GRID_FILTERED_ROWS,
    GRID_SELECT_ROW_CLEAN
} from '../consts/gridConstants';

import { TGridRow } from '../../grid/types';
import { addToastError, addToast } from './toastsActions';
import { api } from '../../../api/files';
import { actionLoadingOn, actionLoadingOff } from '../actions/TreeViewActions'

export const actionDataLoad = (
    folder: string
) => ( dispatch: any ) =>
    {
        dispatch( actionLoadingOn() );
        return webclient
            .get( `/files/${ folder }`, {}, {}, { responseType: 'arraybuffer' } )
            .finally( () =>
            {
                dispatch( actionLoadingOff() );
            } )
            .then( ( { data } ) =>
            {
                var f = api.Files.deserializeBinary( data )
                dispatch( {
                    type: GRID_DATA_LOAD,
                    payload: f.files
                } );
            }
            )
            .catch( ( error ) =>
            {
                dispatch(
                    addToastError( error )
                );
            } );
    };

export const actionSelectRow = ( row: TGridRow ) => ( dispatch: any ) =>
{
    dispatch( {
        type: GRID_SELECT_ROW,
        payload: row
    } )
}

export const actionClearSelect = () => ( dispatch: any ) =>
{
    dispatch( {
        type: GRID_SELECT_ROW_CLEAN,
        payload: null
    } )
}

export const actionUploadingFile = ( folder: string, file: File ) => ( dispatch: any ) =>
{

    if ( !file ) return dispatch( { type: GRID_REFRESH_ROWS } );

    const rpm = new FormData();
    rpm.append( 'rpm', file );

    dispatch( actionLoadingOn() );

    return webclient.post( `/files/${ folder }`, rpm, {}, { responseType: 'arraybuffer', withCredentials: true } )
        .then( ( { data } ) =>
        {
            var f = api.Files.File.deserializeBinary( data )
            dispatch( {
                type: GRID_INSERT_ROW,
                payload: f
            } );

            dispatch( {
                type: GRID_REFRESH_ROWS
            } );
            dispatch(
                addToast( {
                    message: `Success file uploading: ${ file.name }`,
                } )
            );
        }
        )
        .finally( () =>
        {
            dispatch( actionLoadingOff() );
        }
        )
        .catch( ( error ) =>
        {
            dispatch(
                addToastError( error )
            );
        } );
}

export const actionFilteredRows = ( filter: string ) => ( dispatch: any ) =>
{
    return dispatch( {
        type: GRID_FILTERED_ROWS,
        payload: filter
    } )
}

export const actionDownloadingFile = ( folder: string, filename: string ) => ( dispatch: any ) =>
{

    if ( !( folder && filename ) ) return dispatch( { type: GRID_REFRESH_ROWS } );

    dispatch( actionLoadingOn() );

    return webclient.get( `/files/${ folder }/${ filename }`, {}, {}, { responseType: 'blob' } )
        .then( ( response ) =>
        {
            fileDownload( response.data, filename );
            dispatch(
                addToast( {
                    message: `Success file downloading: ${ filename }`,
                } )
            );
        }
        )
        .finally( () =>
        {
            dispatch( actionLoadingOff() );
        }
        )
        .catch( ( error ) =>
        {
            dispatch(
                addToastError( error )
            );
        } );

}
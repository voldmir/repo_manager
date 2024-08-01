import { useMemo, useState, useEffect } from 'react';
import { webclient } from '../webclient'
import './fileinfo.css';
import { api } from '../../api/files';

declare global
{
    interface String
    {
        capitalized (): string;
    }
}

// eslint-disable-next-line no-extend-native
String.prototype.capitalized = function ()
{
    return this.charAt( 0 ).toUpperCase() + this.slice( 1 )
}

interface PropsItem
{
    title: string;
    value: string | undefined | null;
}

const InfoItem = ( props: PropsItem ) =>
{
    return (
        <p className='fileinfo-element'><b>{ props.title.capitalized() }:</b> { props.value }</p>
    );
}

interface Props
{
    folderId: string | undefined | null;
    fileId: string | undefined | null;
}

const FileInfo = ( props: Props ) =>
{
    const [ data, setData ] = useState<any>( null );

    useEffect( () =>
    {
        const getFileInfo = () =>
        {
            webclient.get( `/files/${ props.folderId }/${ props.fileId }/info`, {}, {}, { responseType: 'arraybuffer' } )
                .then( ( { data } ) =>
                {
                    var f = api.RPM.deserializeBinary( data )
                    setData( f.toObject() );
                }
                ).catch( ( error ) =>
                {
                    setData( null );
                } );
        }

        if ( props.folderId === undefined || props.fileId === undefined )
        {
            setData( null );

        } else
        {
            getFileInfo();
        }

    }, [ props.folderId, props.fileId ] );


    const memoizedData = useMemo( () => data, [ data ] );

    return ( <div className='fileinfo-container'>
        <div>
            { memoizedData !== null && Object.keys( memoizedData ).map( function ( key )
            {
                return <InfoItem key={ key } title={ key } value={ memoizedData[ key ] } />
            }
            )
            }
        </div>
    </div> );
}

export default FileInfo;
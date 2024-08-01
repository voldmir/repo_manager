import axios from 'axios';

export function pathJoin ( parts: string[], sep: string = '/' )
{
    return parts
        .map( part =>
        {
            const part2 = part.endsWith( sep ) ? part.substring( 0, part.length - 1 ) : part;
            return part2.startsWith( sep ) ? part2.substring( 1 ) : part2;
        } )
        .join( sep );
}

export function appUrl ( path: string = '' )
{
    return  pathJoin( [ URL_PREFIX, path ] );
}

export function removeAuthCookie ()
{
    document.cookie = `${REPO_NAME}=;SameSite=None;Secure;Max-Age=0;path=${COOKIE_PATH}`;
}

export function isAuthCookie ()
{
    return !!document.cookie.split( ";" ).some( ( item ) => item.trim().startsWith( `${REPO_NAME}=` ) );
}

axios.interceptors.response.use( ( response ) =>
{
    return response
}, ( error ) =>
{
    if ( error.response )
    {
        const { data, status } = error.response

        if ( status === 401 )
        {
            removeAuthCookie();
        }

        if ( data instanceof ArrayBuffer )
        {
            error.response.data = new TextDecoder().decode( data )
        }
        else if ( typeof data == "object" )
        {
            error.response.data = JSON.stringify( data )
        }
    }

    return Promise.reject( error )
} )



const webclient = {
    get ( url: string, headers = {}, params = {}, configs = {} )
    {
        return axios.get( appUrl( url ), {
            headers,
            params,
            ...configs
        } );
    },
    put ( url: string, data = {}, headers = {}, configs = {} )
    {
        return axios.put( appUrl( url ), data, {
            headers,
            ...configs
        } );
    },
    post ( url: string, data = {}, headers = {}, configs = {} )
    {
        return axios.post( appUrl( url ), data, {
            headers,
            ...configs
        } );
    },
    delete ( url: string, headers = {}, configs = {} )
    {
        return axios.delete( appUrl( url ), {
            headers,
            ...configs
        } );
    },
    patch ( url: string, data = {}, headers = {}, configs = {} )
    {
        return axios.patch( appUrl( url ), data, {
            headers,
            ...configs
        } );
    },
};

export default webclient

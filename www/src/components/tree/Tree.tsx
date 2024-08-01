import { FolderClosed, FolderOpened, Minus, Plus, Clean } from './icons'
import { isFunction, castArray } from 'lodash';
import { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TNodeType } from './types'
import { tree as actions } from '../redux/actions'

const randomString = () => Math.random().toString( 36 ).substring( 7 );

interface ImageType
{
    source: string
    style?: {}
    onClick?: () => void
    onDoubleClick?: () => void
}

const Image = ( { onClick, onDoubleClick, source, style = {} }: ImageType ) =>
{

    let st = { ...style, background: `url(data:image/png;base64,${ source }) no-repeat` };

    return (
        <div
            onClick={ isFunction( onClick ) ? onClick : undefined }
            onDoubleClick={ isFunction( onDoubleClick ) ? onDoubleClick : undefined }
            style={ st }>
        </div>
    )
}

interface RowContainerType
{
    node: TNodeType
    onToggle: () => void
    onSelect: ( p: TNodeType ) => void
}

const RowContainer = ( { node, onToggle, onSelect }: RowContainerType ) =>
{
    const onExpand = () =>
    {
        if ( node.children && node.children.length > 0 )
        {
            node.toggled = !node.toggled;
            onToggle();
        }
    }

    const onFolderClick = () =>
    {
        onSelect( node );
    }

    const onFolderDoubleClick = () =>
    {
        onExpand();
        onFolderClick();
    }

    const select = node.selected ? { backgroundColor: '#3399ff' } : {};

    const styleContainer = {
        display: 'flex',
        alignItems: 'center',
        padding: '0rem',
        width: '100%'
    }

    return (
        <div style={ {
            ...styleContainer,
            cursor: 'pointer',
            margin: '0rem;height: 2rem',
            ...select
        } }>
            <Image
                style={ { marginRight: '4px', padding: '7px 5px 5px 4px' } }
                onClick={ onExpand }
                source={ ( node.children && node.children.length > 0 ) ? ( node.toggled ? Minus : Plus ) : Clean }
            />
            <div
                style={ { ...styleContainer, zIndex: 1 } }
                onClick={ onFolderClick }
                onDoubleClick={ onFolderDoubleClick }
            >
                <Image
                    style={ { padding: '7px 9px 9px 6px' } }
                    source={ node.toggled ? FolderOpened : FolderClosed } />
                <div
                    style={ { marginLeft: ' 0.5rem', marginBottom: '2px', userSelect: 'none' } }>
                    { node.name }
                </div>
            </div>
        </div>
    )
}


interface TreeNodeType
{
    node: TNodeType
    onToggle: () => void
    onSelect: ( p: TNodeType ) => void
}

const TreeNode = ( { node, onToggle, onSelect }: TreeNodeType ) =>
{
    return (
        <div style={ { padding: '0rem 1.5rem' } }>
            <RowContainer
                node={ node }
                onToggle={ onToggle }
                onSelect={ onSelect } />
            <div style={ { display: node.toggled ? 'block' : 'none' } }>
                { node.children?.map( item =>
                {
                    return <TreeNode
                        key={ node.id || randomString() }
                        node={ item }
                        onToggle={ onToggle }
                        onSelect={ onSelect } />
                } ) }
            </div>
        </div>
    );
}


interface Props
{
    actionFoldersLoad: () => void
    actionSelectFolder: ( row: TNodeType ) => void
    onSelect?: ( p: TNodeType ) => void
    data: TNodeType[]
    row: TNodeType
}

const Tree = ( props: Props ) =>
{
    const [ togled, setTogled ] = useState( false );
    const ref = useRef( true );

    useEffect( () =>
    {
        if ( ref.current )
        {
            props.actionFoldersLoad();
            ref.current = false;
        }
        return ( () =>
        {
            ref.current = false;
        } )
    }, [] ) // eslint-disable-line react-hooks/exhaustive-deps

    const onSelecRow = ( node: TNodeType ) =>
    {
        if ( !node.selected )
        {
            node.selected = true;

            if ( props.row )
            {
                props.row.selected = false;
            }

            if ( isFunction( props.onSelect ) )
            {
                props.onSelect( node );
            }
            props.actionSelectFolder( node );
        }
    }

    const onToggleRow = () =>
    {
        setTogled( !togled );
    }

    return (
        <div style={ {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            border: '1px solid #d7d7d7',
            margin: '1px',
            padding: '5px',
            overflowY: 'scroll'
        } }>
            { castArray( props.data ).map( node => (
                <TreeNode
                    node={ node }
                    onToggle={ onToggleRow }
                    onSelect={ onSelecRow }
                    key={ node.id || randomString() }
                />
            ) ) }
        </div>
    );
}

const mapStateToProps = ( state: any ) => ( {
    data: state.treeReduser.data,
    row: state.treeReduser.row,
    // isLoading: selectLoading( state ),
} )

const mapDispatchToProps = ( dispatch: any ) => bindActionCreators( actions, dispatch );

export default connect( mapStateToProps, mapDispatchToProps )( Tree )

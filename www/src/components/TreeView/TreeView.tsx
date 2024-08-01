import React, { useRef, useState, useId, useLayoutEffect, useTransition } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, SearchInput, Tooltip, ToolbarGroup } from '@patternfly/react-core';
import { Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
import { Spinner } from '@patternfly/react-core';

import Tree from '../tree'
import Grid from '../grid'
import { TGridRow } from '../grid/types';
import { TNodeType } from '../tree/types';
import './tree_view.css'
import Toaster from '../ToastsList'
import
{
    actionClearSelect as actionGridClearSelect,
    actionDataLoad as actionGridDataLoad,
    actionUploadingFile as actionGridUploadingFile,
    actionFilteredRows as actionGridFilteredRows,
    actionDownloadingFile as actionGridDownloadingFile
} from '../redux/actions/gridActions';

import
{
    actionRepoReindexes
} from '../redux/actions/TreeViewActions';

import { useNavigate, } from 'react-router-dom';

import { VscCloudDownload } from "react-icons/vsc";
import { VscCloudUpload } from "react-icons/vsc";
import { VscPackage } from "react-icons/vsc";
import { VscLayoutSidebarRight } from "react-icons/vsc";
import { VscLayoutSidebarRightOff } from "react-icons/vsc";
import { VscRefresh } from "react-icons/vsc";
import { VscSignIn } from "react-icons/vsc";
import { VscSignOut } from "react-icons/vsc";

import { removeAuthCookie, isAuthCookie } from '../webclient'
import FileInfo from '../fileinfo'

interface Props
{
    loading: boolean
    selectedRowGrid: TGridRow
    selectedNodeTree: TNodeType
    actionRepoReindexes: () => void
    actionGridClearSelect: () => void
    actionGridDataLoad: ( folder: string ) => void
    actionGridUploadingFile: ( folder: string, file: File ) => void
    actionGridFilteredRows: ( filter: string ) => void
    actionGridDownloadingFile: ( folder: string, filename: string ) => void
}

const TreeView = ( props: Props ) =>
{
    const [ inputValue, setInputValue ] = useState( '' );
    const fileInputRef = useRef<HTMLInputElement>( null );
    const TreeViewGridRef = useRef<HTMLInputElement>( null );
    const ToolbarGroupRef = useRef<HTMLInputElement>( null );
    const [ widthSearch, setWidthSearch ] = useState( 100 );
    // eslint-disable-next-line 
    const [ isPending, startTransition ] = useTransition();
    const navigate = useNavigate();
    const [ , setTick ] = useState( false );

    const [ fileInfo, setFileInfo ] = useState( false );

    const forceUpdate = () => setTick( tick => !tick );

    const logout = () =>
    {
        removeAuthCookie();
        forceUpdate();
    }

    useLayoutEffect( () =>
    {
        const handleBoxResize = ( e: Event ) =>
        {
            setWidthSearch( TreeViewGridRef.current!.offsetWidth - ToolbarGroupRef.current!.offsetWidth - 50 );
        }

        setWidthSearch( TreeViewGridRef.current!.offsetWidth - ToolbarGroupRef.current!.offsetWidth - 50 );

        window.addEventListener( 'resize', handleBoxResize );
        return () =>
        {
            window.removeEventListener( 'resize', handleBoxResize );
        }
    }, [] );

    const onSelectNodeTree = ( node: any ) =>
    {
        if ( node && node.children.length <= 0 ) props.actionGridDataLoad( node.name );
        props.actionGridClearSelect()
        onInputChange( '' )
    }

    const handleChange = ( event: React.ChangeEvent<HTMLInputElement> ) =>
    {
        props.actionGridUploadingFile( props.selectedNodeTree.name, event.target.files![ 0 ] );
    }

    const onInputChange = ( newValue: string ) =>
    {
        startTransition( () =>
        {
            props.actionGridFilteredRows( newValue );
            setInputValue( newValue );
        } );
    }

    const id = useId()

    const items = (
        <React.Fragment>


            <ToolbarItem variant="search-filter">
                <SearchInput
                    style={ { width: widthSearch } }
                    isDisabled={ !!props.selectedNodeTree?.root || !props.selectedNodeTree }
                    placeholder="Files search"
                    onChange={ ( _event, value ) => onInputChange( value ) }
                    value={ inputValue }
                    onClear={ () =>
                    {
                        onInputChange( '' );
                    } }
                />
            </ToolbarItem>
            <ToolbarGroup variant="filter-group" ref={ ToolbarGroupRef }>
                <ToolbarItem variant="separator" />
                <ToolbarItem>
                    <Tooltip
                        position="bottom"
                        content={
                            <div>
                                Upload
                            </div>
                        }>
                        <Button
                            isDisabled={ !!props.selectedNodeTree?.root || !props.selectedNodeTree || !isAuthCookie() }
                            variant="plain"
                            onClick={ () => fileInputRef.current!.click() }>
                            <VscCloudUpload size={ 24 } />
                        </Button>
                    </Tooltip>
                    <input
                        onChange={ handleChange }
                        multiple={ false }
                        ref={ fileInputRef }
                        id={ id }
                        type='file' hidden accept=".rpm" />
                </ToolbarItem>
                <ToolbarItem>
                    <Tooltip
                        position="bottom"
                        content={
                            <div>
                                Download
                            </div>
                        }>
                        <Button variant="plain"
                            isDisabled={ !props.selectedRowGrid }
                            onClick={ () => props.actionGridDownloadingFile( props.selectedNodeTree.name, props.selectedRowGrid.name ) }>
                            <VscCloudDownload size={ 24 } />
                        </Button>
                    </Tooltip>
                </ToolbarItem>
                <ToolbarItem>
                    <Tooltip
                        position="bottom"
                        content={
                            <div>
                                Refresh
                            </div>
                        }>
                        <Button variant="plain"
                            isDisabled={ !!props.selectedNodeTree?.root || !props.selectedNodeTree }
                            onClick={ () => props.selectedNodeTree && props.actionGridDataLoad( props.selectedNodeTree.name ) }>
                            <VscRefresh size={ 24 } />
                        </Button>
                    </Tooltip>
                </ToolbarItem>

                <ToolbarItem >
                    <Tooltip
                        position="bottom"
                        content={
                            <div>
                                Reindexes
                            </div>
                        }>
                        <Button variant="plain"
                            isDisabled={ !isAuthCookie() }
                            onClick={ () => props.actionRepoReindexes() }>
                            <VscPackage size={ 24 } />
                        </Button>
                    </Tooltip>
                </ToolbarItem>

                <ToolbarItem>
                    <Tooltip
                        position="bottom"
                        content={
                            <div>
                                { fileInfo ? "Details hide" : "Details show" }
                            </div>
                        }>
                        <Button variant="plain"
                            onClick={ () => fileInfo ? setFileInfo( false ) : setFileInfo( true ) }>
                            { fileInfo ? <VscLayoutSidebarRightOff size={ 24 } /> : <VscLayoutSidebarRight size={ 24 } /> }
                        </Button>
                    </Tooltip>
                </ToolbarItem>

                <ToolbarItem>
                    <Tooltip
                        position="bottom"
                        content={
                            <div>
                                { isAuthCookie() ? "LogOut" : "LogIn" }
                            </div>
                        }>
                        <Button variant="plain"
                            onClick={ () => isAuthCookie() ? logout() : navigate( "login" ) }>
                            { isAuthCookie() ? <VscSignOut size={ 24 } /> : <VscSignIn size={ 24 } /> }
                        </Button>
                    </Tooltip>
                </ToolbarItem>

            </ToolbarGroup>
        </React.Fragment>
    );

    return (
        <>
            <React.Fragment><Toaster /></React.Fragment>
            <div className='tree-view-container'>
                { props.loading && <span className="loading-spiner"><Spinner /></span> }
                <div className='tree-view-tree'>
                    <Tree onSelect={ onSelectNodeTree } />
                </div>
                <div className='tree-view-grid' ref={ TreeViewGridRef }>
                    <div className='btn-toolbar pull-right'>
                        <Toolbar id="toolbar-items-tree_view">
                            <ToolbarContent>{ items }</ToolbarContent>
                        </Toolbar>
                    </div>
                    <div className='grid-container-cmp'>
                        <div className={ fileInfo ? 'tree-view-grid-fileinfo' : undefined }>
                            <Grid />
                        </div>
                        { fileInfo && <div className='tree-view-fileinfo'>
                            <FileInfo folderId={ props.selectedNodeTree?.name } fileId={ props.selectedRowGrid?.name } />
                        </div> }
                    </div>

                </div>
            </div>
        </>
    );

}

const actions = {
    actionGridClearSelect,
    actionGridDataLoad,
    actionGridUploadingFile,
    actionGridFilteredRows,
    actionGridDownloadingFile,
    actionRepoReindexes
}

const mapDispatchToProps = ( dispatch: Dispatch ) => bindActionCreators( actions, dispatch );

const mapStateToProps = ( state: any ) => ( {
    loading: state.treeViewReduser.loading,
    selectedRowGrid: state.gridReduser.row,
    selectedNodeTree: state.treeReduser.row,
} )

export default connect( mapStateToProps, mapDispatchToProps )( TreeView );

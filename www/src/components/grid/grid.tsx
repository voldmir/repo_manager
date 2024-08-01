import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import './grid.css';
import { TGridRow } from './types'
import { actionSelectRow } from '../redux/actions/gridActions'

type TColumn =
    {
        id: string | number,
        colname: string,
        minWidth?: number
    }

interface IGridCell
{
    row: any
    index: number
    className?: string
    column: TColumn
}

function GridCell ( { row, index, column, className }: IGridCell )
{
    return (
        <td className='grid-cell'>
            <div className={ className }>
                { row[ column.id ] }
            </div>
        </td>
    );
}

interface IGridRow
{
    row: any
    columns: TColumn[]
    onRowClick: ( row: any ) => void
    rowHeight?: number
}

function GridRow ( { row, columns, onRowClick, rowHeight }: IGridRow )
{

    let style = {};
    if ( rowHeight )
    {
        style = { ...style, height: rowHeight };
    }

    return (
        <tr className={ `grid-row ${ row.selected ? "grid-row-selected" : "" }` }
            onClick={ onRowClick ? () => { onRowClick( row ) } : undefined }
            style={ style }
        >
            {
                columns.map( ( column: TColumn, index: number ) =>
                {
                    return <GridCell
                        key={ index }
                        row={ row }
                        column={ column }
                        index={ index } />
                } )
            }
        </tr>
    );
}

interface IGridHeader
{
    columns: TColumn[]
    headerHeight?: number
}

function GridHeader ( { headerHeight, columns }: IGridHeader )
{
    let style = {};
    if ( headerHeight )
    {
        style = Object.assign( {}, style, { height: headerHeight } );
    }

    return (
        <tr className='grid-header-row' style={ style }>
            {
                columns.map( ( column: TColumn, index: number ) =>
                {
                    let style = {};
                    if ( column.minWidth )
                    {
                        style = Object.assign( {}, style, { width: column.minWidth } );
                    }

                    return <th key={ index } className='grid-header-cell' style={ style }>
                        { column.colname }
                    </th>
                } )
            }
        </tr>
    );
}


interface Props
{
    row: TGridRow
    data: TGridRow[]
    filter: string
    buttons?: JSX.Element | JSX.Element[]
    actionSelectRow: ( row: TGridRow ) => void
    headerHeight?: number
    rowHeight?: number
}

function Grid ( props: Props )
{

    const getColumns = () =>
    {
        return [
            { id: 'name', colname: 'Name' }
        ];
    }

    const filteredItems = props.data.filter( ( item ) =>
        props.filter ? item.name.toLowerCase().includes( props.filter.toLowerCase() ) : item
    );

    const columns = getColumns()

    return (
        <div className='grid-container'>
            <div className='grid-rows-container'>
                <table className='grid-rows'>
                    <thead className='grid-header'>
                        <GridHeader columns={ columns }
                            headerHeight={ props.headerHeight } />
                    </thead>
                    <tbody className='grid-rows-body'>
                        {
                            filteredItems.map( ( row: any, index: number ) =>
                            {
                                return <GridRow
                                    key={ index }
                                    row={ row }
                                    onRowClick={ props.actionSelectRow }
                                    columns={ columns }
                                    rowHeight={ props.rowHeight } />
                            } )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const mapStateToProps = ( state: any ) => ( {
    filter: state.gridReduser.filter,
    data: state.gridReduser.data,
    row: state.gridReduser.row,
} )

const mapDispatchToProps = ( dispatch: Dispatch ) => bindActionCreators( { actionSelectRow }, dispatch );

export default connect( mapStateToProps, mapDispatchToProps )( Grid );

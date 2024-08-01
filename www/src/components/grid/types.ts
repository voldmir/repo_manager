import { Action } from 'redux';

export type TGridRow = {
    id?: string;
    name: string;
    selected?: boolean;
}

export type TGridRows = TGridRow[]

export type TStateGridFiles = {
    data: TGridRows,
    row?: TGridRow | null,
    filter?: string | null
}

export interface IActionGridFiles extends Action<string>
{
    type: string;
    payload?: TGridRow | TGridRows | string;
    error?: boolean;
}

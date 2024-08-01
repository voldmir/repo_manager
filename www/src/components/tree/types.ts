import { Action } from 'redux';

export interface IActionTree extends Action<string>
{
    type: string;
    payload?: any;
    error?: boolean;
}

export type TNodeType = {
    id?: string;
    name: string;
    root?: number;
    children?: TNodeType[];
    toggled?: boolean;
    selected?: boolean;
}

export type TStateTree = {
    toggled?: TNodeType,
    row?: TNodeType | null,
    data: TNodeType[],
}

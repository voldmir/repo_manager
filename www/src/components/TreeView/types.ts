import {Action} from 'redux';

export interface IActionTreeView extends Action<string> {
    type: string;
    payload?: any;
    error?: boolean;
}

export type TTreeView = {
}


import cloneDeep from 'lodash/cloneDeep';
import { Action } from 'redux';
import { TOASTS_ADD, TOASTS_DELETE, TOASTS_CLEAR } from '../consts/toastsConstants';
import { TMessages } from '../../ToastsList/types'



const initialState: TMessages = {
  messages: {},
};

interface IPayload
{
  key?: string;
  message?: string;
}

interface IToasts extends Action<string>
{
  payload?: IPayload;
  type: string;
}

const toastsReducer = ( state = initialState, action: IToasts ): TMessages =>
{
  const { payload, type } = action;
  let messages: any = {};

  switch ( type )
  {
    case TOASTS_ADD: {
      messages = cloneDeep( state.messages );
      messages[ payload!.key! ] = payload!.message;
      return {
        messages: { ...messages },
      };
    }

    case TOASTS_DELETE: {
      messages = cloneDeep( state.messages );
      delete messages[ payload!.key! ]
      return {
        messages: { ...messages },
      };
    }

    case TOASTS_CLEAR: {
      return Object.assign( {}, { messages: undefined } );
    }

    default: {
      return state;
    }
  }
};

export default toastsReducer

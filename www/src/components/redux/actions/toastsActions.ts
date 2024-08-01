import { v1 as uuidv1 } from 'uuid';

import { TOASTS_ADD, TOASTS_DELETE, TOASTS_CLEAR } from '../consts/toastsConstants';

export const addToast = ( toast: any ) =>
{
  const key = uuidv1();

  return {
    type: TOASTS_ADD,
    payload: {
      key,
      message: { ...toast, key },
    },
  };
};

export const deleteToast = ( key: string ) => ( {
  type: TOASTS_DELETE,
  payload: { key },
} );

export const addToastError = ( error: any ) =>
{
  let msg = error?.response ? error?.response.data : error.toString();

  const toast = {
    message: msg,
    type: 'danger',
  }

  return addToast( toast );
};

export const clearToasts = () => ( { type: TOASTS_CLEAR } );

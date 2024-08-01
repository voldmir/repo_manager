import { connect } from 'react-redux';
import { toasts as actions } from '../redux/actions';
import
{
  Alert,
  AlertGroup,
  AlertActionCloseButton,
  AlertVariant,
  AlertProps
} from '@patternfly/react-core';
import "@patternfly/react-core/dist/styles/base.css";
import '@patternfly/react-core/src/components/Alert/examples/./alert.css';

export interface IMessage
{
  key: string;
  link: string;
  message: string;
  sticky: boolean;
  type: AlertProps[ 'variant' ];
}

export interface IMessages
{
  key: string;
  message: IMessage;
  type: string;
}

interface IProps
{
  messages: IMessages;
  deleteToast: ( key: string ) => void;
}

const ToastsList = ( { messages, deleteToast }: IProps ) =>
{

  const tl = messages === undefined ? [] : Object.entries( messages )
    .map( ( [ key, message ] ) => ( { key, ...message } ) )
    .map( ( { key, message, type, sticky = false }: IMessage ) =>
    {
      const toastProps = sticky ? {} : { timeout: 16000 };
      return (
        <Alert
          isInline
          { ...toastProps }
          component={ 'h4' }
          variant={ AlertVariant[ type! ] }
          title={ message }
          key={ key }
          onTimeout={ () => deleteToast( key ) }
          actionClose={
            <AlertActionCloseButton
              onClose={ () => deleteToast( key ) }
            />
          }
        />
      );
    } );


  return tl.length > 0 ? (
    <AlertGroup isToast>
      { tl }
    </AlertGroup>
  ) : ( <></> );

};

const mapStateToProps = ( state: any ) => ( {
  messages: state.toasts.messages,
} );

export default connect( mapStateToProps, actions )( ToastsList );
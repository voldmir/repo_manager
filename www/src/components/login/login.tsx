import React from 'react';
import
{
    LoginPage,
    LoginForm,
    Button,
    LoginMainFooterBandItem,
} from '@patternfly/react-core';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import { useNavigate, } from 'react-router-dom';
import { webclient, isAuthCookie } from '../webclient'


const SignInForm: React.FunctionComponent = () =>
{
    const navigate = useNavigate();

    const [ showHelperText, setShowHelperText ] = React.useState( false );
    const [ username, setUsername ] = React.useState( '' );
    const [ isValidUsername, setIsValidUsername ] = React.useState( true );
    const [ password, setPassword ] = React.useState( '' );
    const [ isValidPassword, setIsValidPassword ] = React.useState( true );
    const [ helperText, setHelperText ] = React.useState( '' );

    if ( isAuthCookie() )
    {
        navigate( "/" );
    }

    const actionLogin = ( login: string, password: string ) =>
    {
        webclient.post( `/sign-in`, { login: login, password: password }, {}, { withCredentials: true } )
            .then( ( { data } ) =>
            {
                if ( isAuthCookie() )
                {
                    navigate( "/" );
                }
            }
            )
            .catch( ( error ) =>
            {
                if ( error.response )
                {
                    setIsValidUsername( false );
                    setIsValidPassword( false );
                    setHelperText( error.response.data );
                }
                else
                {
                    setHelperText( error.message );
                }
                setShowHelperText( true );
            } );
    }

    const handleUsernameChange = ( _event: React.FormEvent<HTMLInputElement>, value: string ) =>
    {
        setUsername( value );
    };

    const handlePasswordChange = ( _event: React.FormEvent<HTMLInputElement>, value: string ) =>
    {
        setPassword( value );
    };

    const onLoginButtonClick = ( event: React.MouseEvent<HTMLButtonElement, MouseEvent> ) =>
    {
        event.preventDefault();
        setIsValidUsername( !!username );
        setIsValidPassword( !!password );
        setHelperText( "Invalid login credentials." );
        setShowHelperText( !username || !password );
        actionLogin( username, password );
    };

    const loginForm = (

        <LoginForm
            showHelperText={ showHelperText }
            helperText={ helperText }
            helperTextIcon={ <ExclamationCircleIcon /> }
            usernameLabel="Username"
            usernameValue={ username }
            onChangeUsername={ handleUsernameChange }
            isValidUsername={ isValidUsername }
            passwordLabel="Password"
            passwordValue={ password }
            isShowPasswordEnabled
            onChangePassword={ handlePasswordChange }
            isValidPassword={ isValidPassword }
            onLoginButtonClick={ onLoginButtonClick }
            loginButtonLabel="Log in"
        />
    );

    const signUpForAccountMessage = (
        <LoginMainFooterBandItem>
            <Button variant="link" isInline onClick={ () => navigate( "/" ) }>
                Home
            </Button>
        </LoginMainFooterBandItem>
    );

    return (
        <LoginPage
            loginTitle="Log in to your account"
            loginSubtitle="Enter your single sign-on LDAP credentials."
            signUpForAccountMessage={ signUpForAccountMessage }
        >
            { loginForm }
        </LoginPage>
    );
};

export default SignInForm;

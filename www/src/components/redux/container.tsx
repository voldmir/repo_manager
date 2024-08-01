
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';
import { applyMiddleware, legacy_createStore as createStore, compose } from 'redux';
import rootReducer from './reducers'

// let middleware  = [ thunk ];
// const store = createStore( rootReducer, compose( applyMiddleware( ...middleware ) ) );

const middlewareEnhancer = applyMiddleware(thunk)
const composedEnhancers = compose(middlewareEnhancer)

const store = createStore(rootReducer, undefined, composedEnhancers)

type Props = {
    children: JSX.Element | JSX.Element[]
}

const ReduxContainer = ( { children }: Props ) =>
{
    return (
        <Provider store={ store }>
            { children }
        </Provider>
    );

}

export default ReduxContainer;

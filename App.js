/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React from 'react';
import {combineReducers, createStore} from 'redux';
import {Button, Text, View} from "react-native";
import {addNavigationHelpers, NavigationActions, StackNavigator} from "react-navigation";
import {connect, Provider} from 'react-redux';

// React component that displays a title and a name.
class A extends React.Component {

    componentWillMount() {
        console.log(this.props.name + " mounted");
    }

    componentWillUnmount() {
        console.log(this.props.name + " unmounted");
    }

    render() {
        console.log(this.props.name + " Rendered");
        return (
            <View style={{flexGrow: 1}}>
              <Button
                  onPress={this.props.onClickNavigate}
                  title={"Nativate to " + this.props.name}
              />
              <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
              }}>
                  {"Counter : " + this.props.counter}
              </Text>
              <Button
                  style={{marginTop: 12}}
                  onPress={this.props.onIncrement}
                  title="Dispatch"
              />
            </View>
        );
    }
}


// react-redux connect functions
const getState = (name) => (state) => ({counter: state.counter, name});
const mapDispatchToProps = (dispatch) => ({dispatch: dispatch});
const mergeProps = (nextScreen) => (stateProps, dispatchProps) => {
    const dispatch = dispatchProps.dispatch;
    return ({
        ...stateProps,
        onClickNavigate: () => dispatch(NavigationActions.navigate({routeName: nextScreen})),
        onIncrement: () => dispatch({type: 'INCREMENT'}),
    });
};

// stack navigator where each item is connected to a redux store via connect
export const ModalStack = StackNavigator({
    A: {
        screen: connect(getState('A'), mapDispatchToProps, mergeProps('B'))(A),
        navigationOptions: {title: "A"}
    },
    B: {
        screen: connect(getState('B'), mapDispatchToProps, mergeProps('C'))(A),
        navigationOptions: {title: "B"}
    },
    C: {
        screen: connect(getState('C'), mapDispatchToProps, mergeProps('D'))(A),
        navigationOptions: {title: "C"}
    },
    D: {
        screen: connect(getState('D'), mapDispatchToProps, mergeProps('A'))(A),
        navigationOptions: {title: "D"}
    },
});

// stack nav reducer see  https://reactnavigation.org/docs/guides/redux
const initialState = ModalStack.router.getStateForAction(ModalStack.router.getActionForPathAndParams('A'));

const navReducer = (state = initialState, action) => {
    const nextState = ModalStack.router.getStateForAction(action, state);
    return nextState || state;
};

// reducer that manages a counter
function counter(state = 0, action) {
    console.log("got action " + action.type);
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        default:
            return state
    }
}

const appReducer = combineReducers({
    nav: navReducer,
    counter: counter
});

let store = createStore(appReducer);

// redux integrated stack navigator https://reactnavigation.org/docs/guides/redux
class App extends React.Component {
    render() {
        return (
            <ModalStack navigation={addNavigationHelpers({
                dispatch: this.props.dispatch,
                state: this.props.nav,
            })}/>
        );
    }
}

const AppWithNavigationState = connect((state) => ({nav: state.nav}))(App);

export default rootComponent = () =>
    (<Provider store={store}>
      <AppWithNavigationState/>
    </Provider>);
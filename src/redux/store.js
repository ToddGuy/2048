import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';

const reHydrateStore = () => {
  if (window.localStorage.getItem("saveGame")) {
    const reduxState = window.localStorage.getItem("reduxState");
    return JSON.parse(reduxState);
  }
};
const store = createStore(
  rootReducer,
  reHydrateStore(),
  applyMiddleware(thunk)
);

store.subscribe(() => {
  const reduxState = store.getState();
  window.localStorage.setItem("reduxState", JSON.stringify(reduxState));
  window.localStorage.setItem("saveGame", reduxState.saveGame);
});

export default store;
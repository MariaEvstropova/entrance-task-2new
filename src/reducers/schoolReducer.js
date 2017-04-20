import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function schoolReducer(state = initialState.schools, action) {
  switch(action.type) {
    case types.LOAD_SCHOOLS_SUCCESS:
      return action.schools
    default:
      return state;
  }
}

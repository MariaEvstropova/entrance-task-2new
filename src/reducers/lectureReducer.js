import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function lectureReducer(state = initialState.lectures, action) {
  switch(action.type) {
    case types.LOAD_LECTURES_SUCCESS:
      return action.lectures
    default:
      return state;
  }
}

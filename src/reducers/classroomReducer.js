import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function classroomReducer(state = initialState.classrooms, action) {
  switch(action.type) {
    case types.LOAD_CLASSROOMS_SUCCESS:
      return action.classrooms
    default:
      return state;
  }
}

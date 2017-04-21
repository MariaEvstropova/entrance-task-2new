import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function classroomReducer(state = initialState.classrooms, action) {
  switch(action.type) {
    case types.LOAD_CLASSROOMS_SUCCESS:
      return action.classrooms;
    case types.LOAD_LECTURES_FOR_CLASSROOM_SUCCESS:
      let result = state.map((classroom) => {
        if (classroom['_id'] != action.data.classroomId) {
          return Object.assign({}, classroom);
        } else {
          return Object.assign({}, classroom, {lectures: action.data.lectures});
        }
      })
      return result;
    default:
      return state;
  }
}

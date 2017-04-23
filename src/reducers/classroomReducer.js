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
    case types.CREATE_CLASSROOM_SUCCESS:
      return [...state, Object.assign({}, action.classroom)];
    case types.UPDATE_CLASSROOM_SUCCESS:
      return [...state.filter((classroom) => {
        return classroom._id !== action.data.classroomId
      }), Object.assign({}, action.data.classroom)];
    case types.DELETE_CLASSROOM_SUCCESS:
      return [...state.filter((classroom) => {
        return classroom._id !== action.classroomId
      })];
    default:
      return state;
  }
}

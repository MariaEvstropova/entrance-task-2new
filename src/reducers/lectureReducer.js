import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function lectureReducer(state = initialState.lectures, action) {
  switch(action.type) {
    case types.LOAD_LECTURES_SUCCESS:
      return action.lectures;
    case types.CREATE_LECTURE_SUCCESS:
      return [...state, action.lecture];
    case types.UPDATE_LECTURE_SUCCESS:
      return [...state.filter((lecture) => {
        return lecture._id !== action.lectureId
      }), Object.assign({}, action.lecture)];
    default:
      return state;
  }
}

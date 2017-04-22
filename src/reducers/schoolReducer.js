import * as types from '../actions/actionTypes';
import initialState from './initialState';

export default function schoolReducer(state = initialState.schools, action) {
  switch(action.type) {
    case types.LOAD_SCHOOLS_SUCCESS:
      return action.schools;
    case types.LOAD_LECTURES_FOR_SCHOOL_SUCCESS:
      let result = state.map((school) => {
        if (school['_id'] != action.data.schoolId) {
          return Object.assign({}, school);
        } else {
          return Object.assign({}, school, {lectures: action.data.lectures});
        }
      })
      return result;
    default:
      return state;
  }
}

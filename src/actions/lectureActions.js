import request from 'superagent';
import * as types from './actionTypes';

export function loadLectures() {
  return function(dispatch) {
    return request
    .get('/v1/lectures')
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(loadLecturesSuccess(data.data));
      } else {
        throw new Error('Get lectures from db error');
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
  };
}

export function loadLecturesSuccess(lectures) {
  return {
    type: types.LOAD_LECTURES_SUCCESS,
    lectures: lectures
  };
}

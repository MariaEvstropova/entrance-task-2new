import request from 'superagent';
import * as types from './actionTypes';

export function loadSchools() {
  return function(dispatch) {
    return request
    .get('/v1/schools')
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(loadSchoolsSuccess(data.data));
      } else {
        throw new Error('Get schools from db error');
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
  };
}

export function loadSchoolsSuccess(schools) {
  return {
    type: types.LOAD_SCHOOLS_SUCCESS,
    schools: schools
  };
}

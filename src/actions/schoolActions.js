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

export function loadLecturesForSchool(schoolId, fromDate, toDate) {
  return function(dispatch) {
    return request
    .get(`/v1/lectures/school/${schoolId}`)
    .query({ from: fromDate, to: toDate })
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        let result = {
          schoolId: schoolId,
          lectures: data.message
        };
        dispatch(loadLecturesForSchoolSuccess(result));
      } else {
        throw new Error('Get lectures for school from db error');
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
  }
}

export function loadLecturesForSchoolSuccess(result) {
  return {
    type: types.LOAD_LECTURES_FOR_SCHOOL_SUCCESS,
    data: result
  };
}

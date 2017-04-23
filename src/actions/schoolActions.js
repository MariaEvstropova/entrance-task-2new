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
        throw new Error(`Get schools from db error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
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
        throw new Error(`Get lectures for school from db error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
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

export function updateSchool(update, schoolId) {
  return function(dispatch) {
    return request
    .put(`/v1/schools/${schoolId}`)
    .send(update)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        let result = {
          schoolId: schoolId,
          school: data.message
        };
        dispatch(updateSchoolSuccess(result));
      } else {
        throw new Error(`Update school error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function updateSchoolSuccess(result) {
  return {
    type: types.UPDATE_SCHOOL_SUCCESS,
    data: result
  };
}

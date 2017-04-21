import request from 'superagent';
import * as types from './actionTypes';

export function loadClassrooms() {
  return function(dispatch) {
    return request
    .get('/v1/classrooms')
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(loadClassroomsSuccess(data.data));
      } else {
        throw new Error('Get classrooms from db error');
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
  };
}

export function loadClassroomsSuccess(classrooms) {
  return {
    type: types.LOAD_CLASSROOMS_SUCCESS,
    classrooms: classrooms
  };
}

export function loadLecturesForClassroom(classroomId, fromDate, toDate) {
  return function(dispatch) {
    return request
    .get(`/v1/lectures/classroom/${classroomId}`)
    .query({ from: fromDate, to: toDate })
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        let result = {
          classroomId: classroomId,
          lectures: data.message
        };
        dispatch(loadLecturesForClassroomSuccess(result));
      } else {
        throw new Error('Get lectures for classroom from db error');
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
  }
}

export function loadLecturesForClassroomSuccess(result) {
  return {
    type: types.LOAD_LECTURES_FOR_CLASSROOM_SUCCESS,
    data: result
  };
}

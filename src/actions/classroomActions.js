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
        throw new Error(`Get classrooms from db error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
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
        throw new Error(`Get lectures for classroom from db error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
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

export function updateClassroom(update, classroomId) {
  return function(dispatch) {
    return request
    .put(`/v1/classrooms/${classroomId}`)
    .send(update)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        let result = {
          classroomId: classroomId,
          classroom: data.message
        };
        dispatch(updateClassroomSuccess(result));
      } else {
        throw new Error(`Update classroom error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function updateClassroomSuccess(result) {
  return {
    type: types.UPDATE_CLASSROOM_SUCCESS,
    data: result
  };
}

export function createClassroom(classroom) {
  return function(dispatch) {
    return request
    .post('/v1/classrooms/')
    .send(classroom)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(createClassroomSuccess(data.message));
      } else {
        throw new Error(`Create classroom error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function createClassroomSuccess(result) {
  return {
    type: types.CREATE_CLASSROOM_SUCCESS,
    classroom: result
  };
}

export function deleteClassroom(id) {
  return function(dispatch) {
    return request
    .delete(`/v1/classrooms/${id}`)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(deleteClassroomSuccess(id));
      } else {
        throw new Error(`Delete classroom error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function deleteClassroomSuccess(id) {
  return {
    type: types.DELETE_CLASSROOM_SUCCESS,
    classroomId: id
  };
}

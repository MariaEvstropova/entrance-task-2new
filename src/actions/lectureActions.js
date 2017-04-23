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
        throw new Error(`Get lectures from db error. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
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

export function createLecture(lecture) {
  return function(dispatch) {
    return request
    .post('/v1/lectures')
    .send(lecture)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(createLectureSuccess(data.message));
      } else {
        throw new Error(`Can not create new lecture. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function createLectureSuccess(lecture) {
  return {
    type: types.CREATE_LECTURE_SUCCESS,
    lecture: lecture
  };
}

export function updateLecture(update, id) {
  return function(dispatch) {
    return request
    .put(`/v1/lectures/${id}`)
    .send(update)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(updateLectureSuccess(data.message, id));
      } else {
        throw new Error(`Can not update lecture. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function updateLectureSuccess(lecture, lectureId) {
  return {
    type: types.UPDATE_LECTURE_SUCCESS,
    lecture: lecture,
    lectureId: lectureId
  };
}

export function deleteLecture(id) {
  return function(dispatch) {
    return request
    .delete(`/v1/lectures/${id}`)
    .then((response) => {
      return response.body;
    })
    .then((data) => {
      if (data.success) {
        dispatch(deleteLectureSuccess(id));
      } else {
        throw new Error(`Can not delete lecture. Reason: ${data.error.message}`);
      }
    })
    .catch((error) => {
      alert(error.message);
      throw new Error(error);
    });
  }
}

export function deleteLectureSuccess(id) {
  return {
    type: types.DELETE_LECTURE_SUCCESS,
    lectureId: id
  };
}

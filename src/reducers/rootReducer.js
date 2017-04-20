import {combineReducers} from 'redux';
import lectures from './lectureReducer';
import classrooms from './classroomReducer';
import schools from './schoolReducer';

const rootReducer = combineReducers({
  lectures: lectures,
  classrooms: classrooms,
  schools: schools
})

export default rootReducer;

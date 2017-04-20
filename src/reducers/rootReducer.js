import {combineReducers} from 'redux';
import lectures from './lectureReducer';

const rootReducer = combineReducers({
  lectures: lectures
})

export default rootReducer;

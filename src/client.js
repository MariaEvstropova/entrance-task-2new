import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import IndexPage from './components/IndexPage/IndexPage.jsx';
import LecturePage from './components/LecturePage/LecturePage.jsx';
import SchoolPage from './components/SchoolPage/SchoolPage.jsx';
import ClassroomPage from './components/ClassroomPage/ClassroomPage.jsx';
import { loadLectures } from './actions/lectureActions';
import { loadClassrooms } from './actions/classroomActions';
import { loadSchools } from './actions/schoolActions';

const store = configureStore();

store.dispatch(loadLectures());
store.dispatch(loadClassrooms());
store.dispatch(loadSchools());

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path="/" component={IndexPage}/>
        <Route path="/lecture/:id" component={LecturePage}/>
        <Route path="/school/:id" component={SchoolPage}/>
        <Route path="/classroom/:id" component={ClassroomPage}/>
      </div>
    </Router>
  </Provider>,
  document.getElementById('mount-point')
);

import React from 'react';
import { connect } from 'react-redux';
import LectureData from './LectureData.jsx';
import LectureForm from '../shared/LectureForm.jsx';

export class LecturePage extends React.Component {
  render() {
    return (
      <div className="main-content">
        <section className="info">
          <LectureData lecture={this.props.lecture} />
          <LectureForm
            classrooms={this.props.classrooms}
            schools={this.props.schools}
          />
        </section>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let lecture = {
    name: '',
    _id: null,
    classoom: null,
    school: [],
    teacher: '',
    date: null
  };
  const lectureId = ownProps.match.params.id;
  if (state.lectures.length > 0) {
    lecture = Object.assign({}, state.lectures.find((lecture) => { return lecture['_id'] == lectureId }));
  }
  return {
    lecture: lecture,
    classrooms: state.classrooms,
    schools: state.schools
  };
}

export default connect(mapStateToProps)(LecturePage);

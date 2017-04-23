import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as lectureActions from '../../actions/lectureActions';
import LectureData from './LectureData.jsx';
import LectureForm from '../shared/LectureForm.jsx';

export class LecturePage extends React.Component {
  constructor(props) {
    super(props);

    this.handleDelete=this.handleDelete.bind(this);
  }

  handleDelete(event) {
    event.preventDefault();
    this.props.actions.deleteLecture(this.props.match.params.id);
  }

  render() {
    if (Object.keys(this.props.lecture).length === 0) {
      return <p className="info-message">Извините, такой лекции нет</p>;
    }
    return (
      <div className="main-content">
        <section className="info">
          <LectureData
            lecture={this.props.lecture}
            onDelete={this.handleDelete}
          />
          <LectureForm
            id={this.props.match.params.id}
            lecture={this.props.lecture}
            classrooms={this.props.classrooms}
            schools={this.props.schools}
          />
        </section>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let lecture = {};
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(lectureActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LecturePage);

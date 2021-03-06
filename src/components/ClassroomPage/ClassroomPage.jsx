import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ClassroomData from './ClassroomData.jsx';
import ClassroomForm from '../shared/ClassroomForm.jsx';
import DateForm from '../shared/DateForm.jsx';
import LecturesTable from '../shared/LecturesTable/LecturesTable.jsx';
import * as classroomActions from '../../actions/classroomActions';

export class ClassroomPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dateFrom: '',
      dateTo: ''
    };

    this.showLectures = this.showLectures.bind(this);
    this.updateState = this.updateState.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.props.actions.loadLecturesForClassroom(this.props.match.params.id, this.state.dateFrom, this.state.dateTo);
  }

  showLectures(event) {
    event.preventDefault();
    this.props.actions.loadLecturesForClassroom(this.props.match.params.id, this.state.dateFrom, this.state.dateTo);
  }

  updateState(event) {
    let name = event.target.name;
    let value = event.target.value;

    this.setState({
      [name]: value
    });
  }

  handleDelete(event) {
    event.preventDefault();
    this.props.actions.deleteClassroom(this.props.match.params.id);
  }

  render() {
    if (Object.keys(this.props.classroom).length === 0) {
      return <p className="info-message">Извините, такой аудитории нет</p>;
    }
    return (
      <div className="main-content">
        <section className="info">
          <ClassroomData
            classroom={this.props.classroom}
            onClick={this.handleDelete}
          />
          <ClassroomForm
            id={this.props.match.params.id}
            name={this.props.classroom.name}
            volume={this.props.classroom.volume}
            location={this.props.classroom.location}
          />
          <div className="classroom-lectures">
            <h1 className="title">Лекции в аудитории</h1>
            <DateForm
              onChange={this.updateState}
              onShowLectures={this.showLectures}
            />
            <LecturesTable lectures={this.props.classroom.lectures} />
          </div>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let classroom = {};
  const classroomId = ownProps.match.params.id;
  if (state.classrooms.length > 0) {
    classroom = Object.assign({}, state.classrooms.find((classroom) => { return classroom['_id'] == classroomId }));
  }
  return {
    classroom: classroom
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classroomActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassroomPage);

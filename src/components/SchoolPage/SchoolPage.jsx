import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SchoolData from './SchoolData.jsx';
import SchoolForm from '../shared/SchoolForm.jsx';
import DateForm from '../shared/DateForm.jsx';
import LecturesTable from '../shared/LecturesTable/LecturesTable.jsx';
import * as schoolActions from '../../actions/schoolActions';

export class SchoolPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dateFrom: '',
      dateTo: ''
    };

    this.showLectures = this.showLectures.bind(this);
    this.updateState = this.updateState.bind(this);
    this.props.actions.loadLecturesForSchool(this.props.match.params.id, this.state.dateFrom, this.state.dateTo);
  }

  showLectures(event) {
    event.preventDefault();
    this.props.actions.loadLecturesForSchool(this.props.match.params.id, this.state.dateFrom, this.state.dateTo);
  }

  updateState(event) {
    let name = event.target.name;
    let value = event.target.value;

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div className="main-content">
        <section className="info">
          <SchoolData school={this.props.school} />
          <SchoolForm />
          <div className="school-lectures">
            <h1 className="title">Лекции для школы</h1>
            <DateForm
              onChange={this.updateState}
              onShowLectures={this.showLectures}
            />
            <LecturesTable lectures={this.props.school.lectures} />
          </div>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let school = {
    name: '',
    _id: null,
    number_of_students: null,
    lectures: []
  };
  const schoolId = ownProps.match.params.id;
  if (state.schools.length > 0) {
    school = Object.assign({}, state.schools.find((school) => { return school['_id'] == schoolId }));
  }
  return {
    school: school
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(schoolActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SchoolPage);

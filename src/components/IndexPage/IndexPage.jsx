import React from 'react';
import { connect } from 'react-redux';
import LecturesSection from './LecturesSection.jsx';
import ClassroomsSection from './ClassroomsSection.jsx';
import SchoolsSection from './SchoolsSection.jsx';

export class IndexPage extends React.Component {
  render() {
    return (
      <div className="main-content">
        <div className="content-sections">
          <LecturesSection
            lectures={this.props.lectures}
            classrooms={this.props.classrooms}
            schools={this.props.schools}
          />
          <ClassroomsSection classrooms={this.props.classrooms} />
          <SchoolsSection schools={this.props.schools} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    lectures: state.lectures,
    classrooms: state.classrooms,
    schools: state.schools
  }
}

export default connect(mapStateToProps)(IndexPage);

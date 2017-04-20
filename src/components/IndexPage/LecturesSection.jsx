import React from 'react';
import { Link } from 'react-router-dom';
import LectureForm from '../shared/LectureForm.jsx';

export default class LecturesSection extends React.Component {
  render() {
    return (
      <section className="lecture-section">
        <h1 className="title">Лекции</h1>
        <ul>
          {this.props.lectures.map((lecture, index) => {
            return (
              <li key={index}>
                <Link to={`/lecture/${lecture["_id"]}`}>{lecture.name}</Link>
              </li>
            )
          })}
        </ul>
        <LectureForm
          classrooms={this.props.classrooms}
          schools={this.props.schools}
          type="create"
        />
      </section>
    );
  }
}

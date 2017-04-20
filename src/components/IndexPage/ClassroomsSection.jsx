import React from 'react';
import { Link } from 'react-router-dom';
import ClassroomForm from '../shared/ClassroomForm.jsx';

export default class ClassroomsSection extends React.Component {
  render() {
    return (
      <section className="classroom-section">
        <h1 className="title">Аудитории</h1>
        <ul>
          {this.props.classrooms.map((classroom, index) => {
            return (
              <li key={index}>
                <Link to={`/classroom/${classroom["_id"]}`}>{classroom.name}</Link>
              </li>
            )
          })}
        </ul>
        <ClassroomForm type="create" />
      </section>
    );
  }
}

import React from 'react';
import { Link } from 'react-router-dom';
import SchoolForm from '../shared/SchoolForm.jsx';

export default class SchoolssSection extends React.Component {
  render() {
    return (
      <section className="school-section">
        <h1 className="title">Школы</h1>
        <ul>
          {this.props.schools.map((school, index) => {
            return (
              <li key={index}>
                <Link to={`/school/${school["_id"]}`}>{school.name}</Link>
              </li>
            )
          })}
        </ul>
        <SchoolForm
          type="create"
          onChange={this.props.onChange}
          onSubmit={this.props.onSubmit}
        />
      </section>
    );
  }
}

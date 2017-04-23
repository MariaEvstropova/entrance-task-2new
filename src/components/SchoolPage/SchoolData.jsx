import React from 'react';

export default class SchoolData extends React.Component {
  render() {
    return (
      <div className="school-info">
        <h1 className="title">Школа</h1>
        <table className="school-table">
          <tbody>
            <tr>
              <th>Название</th>
              <td>{this.props.school.name}</td>
            </tr>
            <tr>
              <th>Число студентов</th>
              <td>{this.props.school.number_of_students} чел.</td>
            </tr>
          </tbody>
        </table>
        <a href="" className="delete" onClick={this.props.onClick}>Удалить</a>
      </div>
    );
  }
}

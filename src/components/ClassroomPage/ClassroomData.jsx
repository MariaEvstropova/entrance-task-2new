import React from 'react';

export default class ClassroomData extends React.Component {
  render() {
    return (
      <div className="classroom-info">
        <h1 className="title">Аудитория</h1>
        <table className="classroom-table">
          <tbody>
            <tr>
              <th>Название</th>
              <td>{this.props.classroom.name}</td>
            </tr>
            <tr>
              <th>Вместимость</th>
              <td>{this.props.classroom.volume} чел.</td>
            </tr>
            <tr>
              <th>Местоположение</th>
              <td>{this.props.classroom.location}</td>
            </tr>
          </tbody>
        </table>
        <a href="" className="delete" onClick={this.props.onClick}>Удалить</a>
      </div>
    );
  }
}

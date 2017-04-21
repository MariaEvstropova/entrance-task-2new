import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import ClassroomForm from '../shared/ClassroomForm.jsx';

export default class LectureData extends React.Component {
  render() {
    if (
      !this.props.lecture.name
      || !this.props.lecture.classroom
      || !this.props.lecture.date
      || !this.props.lecture.teacher
      || this.props.lecture.school.length == 0
    ) {
      return (<div></div>);
    }

    return (
      <div className="lecture-info">
        <h1 className="title">Лекция</h1>
        <table>
          <tbody>
            <tr>
              <th>Название</th>
              <td>{ this.props.lecture.name }</td>
            </tr>
            <tr>
              <th>Школа(ы)</th>
              <td>
                {this.props.lecture.school.map((school, index) => {
                  return (
                    <Link to={`/school/${school['_id']}`} key={index}>{school.name}</Link>
                  )
                })}
              </td>
            </tr>
            <tr>
              <th>Аудитория</th>
              <td>
                <Link to={`/classroom/${this.props.lecture.classroom['_id']}`}>{this.props.lecture.classroom.name}</Link>
              </td>
            </tr>
            <tr>
              <th>Преподаватель</th>
              <td>{ this.props.lecture.teacher }</td>
            </tr>
            <tr>
              <th>Дата и время</th>
              <td>{ moment(this.props.lecture.date).format('YYYY-MM-DD HH:mm') }</td>
            </tr>
          </tbody>
        </table>
        <a href="" className="delete">Удалить</a>
      </div>
    );
  }
}

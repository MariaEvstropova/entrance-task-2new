import React from 'react';

export default class LecturesForm extends React.Component {
  render() {
    if (this.props.classrooms.length == 0 || this.props.schools.length == 0) {
      return <p className="info-message">Для добавления лекции создайте школу и аудиторию</p>
    }
    return (
      <form id="lecture-form" className="lecture-form">
        <h1>{this.props.type == "create" ? "Создать новую лекцию" : "Изменить лекцию"}</h1>
        <label htmlFor="lecture-name">Название</label>
        <input id="lecture-name" required/>
        <label htmlFor="lecture-classroom">Аудитория</label>
        <select id="lecture-classroom">
          {
            this.props.classrooms.map((classroom, index) => {
              return (
                <option value={classroom.name} key={index}>{classroom.name}</option>
              )
            })
          }
        </select>
        <label htmlFor="lecture-schools">Школа(ы)</label>
        <select id="lecture-schools" multiple size="3">
          {
            this.props.schools.map((school, index) => {
              return (
                <option value={school.name} key={index}>{school.name}</option>
              )
            })
          }
        </select>
        <label htmlFor="lecture-date">Дата и время</label>
        <input type="datetime-local" id="lecture-date" required/>
        <label htmlFor="lecture-teacher">Преподаватель</label>
        <input id="lecture-teacher" required/>
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"}/>
      </form>
    );
  }
}

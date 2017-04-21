import React from 'react';

export default class LecturesForm extends React.Component {
  render() {
    return (
      <form id="lecture-form" className="lecture-form">
        <h1>{this.props.type == "create" ? "Создать новую лекцию" : "Изменить лекцию"}</h1>
        <label htmlFor="lecture-name">Название</label>
        <input id="lecture-name" />
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
        <input type="datetime-local" id="lecture-date" />
        <label htmlFor="lecture-teacher">Преподаватель</label>
        <input id="lecture-teacher" />
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"}/>
      </form>
    );
  }
}

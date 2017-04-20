import React from 'react';

export default class ClassroomForm extends React.Component {
  render() {
    return (
      <form id="classroom-form" className="classroom-form">
        <h1>{this.props.type == "create" ? "Создать новую аудиторию" : "Изменить аудиторию"}</h1>
        <label htmlFor="classroom-name">Название</label>
        <input id="classroom-name" required/>
        <label htmlFor="classroom-volume">Вместимость</label>
        <input id="classroom-volume" required/>
        <label htmlFor="classroom-location">Местоположение</label>
        <input id="classroom-location" required/>
        <input type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"}/>
      </form>
    )
  }
}

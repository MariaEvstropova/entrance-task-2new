import React from 'react';

export default class SchoolForm extends React.Component {
  render() {
    return (
      <form id="school-form" className="school-form">
        <h1>{this.props.type == "create" ? "Создать новую школу" : "Изменить школу"}</h1>
        <label htmlFor="school-name">Название</label>
        <input id="school-name" required/>
        <label htmlFor="school-volume">Число учащихся</label>
        <input id="school-volume" required/>
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"}/>
      </form>
    )
  }
}

import React from 'react';

export default class SchoolForm extends React.Component {
  render() {
    return (
      <form id="school-form" className="school-form">
        <h1>{this.props.type == "create" ? "Создать новую школу" : "Изменить школу"}</h1>
        <label htmlFor="school-name">Название</label>
        <input id="school-name" required name='name' onChange={this.props.onChange} value={this.props.name}/>
        <label htmlFor="school-students">Число учащихся</label>
        <input id="school-students" required name='number_of_students' onChange={this.props.onChange} value={this.props.number_of_students}/>
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"} onClick={this.props.onSubmit}/>
      </form>
    )
  }
}

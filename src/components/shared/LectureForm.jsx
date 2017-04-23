import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as lectureActions from '../../actions/lectureActions';

export class LecturesForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      classroom: 'default',
      schools: ['default'],
      date: '',
      teacher: ''
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onChange(event) {
    let target = event.target;
    let name = target.name;
    let value = target.value;
    let multiple = target.multiple;

    if (name == 'date') {
      value = moment(value).format('YYYY-MM-DD HH:mm');
    }
    if (multiple) {
      let options = event.target.options;
      let array = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          array.push(options[i].value);
        }
      }

      value = array;
    }

    this.setState({
      [name]: value
    });
  }

  onSubmit(event) {
    event.preventDefault();
    let errors = this.validateForm(this.state);
    if (errors.length > 0) {
      let message = 'Can not create lecture. Reason:\n';
      errors.forEach((error) => {
        message += error;
      });
      alert(message);
      return;
    }
    if (this.props.type == "create") {
      this.props.actions.createLecture(this.state);
    } else {
      this.props.actions.updateLecture(this.state, this.props.id);
    }
    this.setState({
      name: '',
      classroom: 'default',
      schools: ['default'],
      teacher: ''
    });
  }

  validateForm(state) {
    let errors = [];
    if (!state.name) {
      errors.push('No name provided\n');
    }
    if (state.classroom == 'default') {
      errors.push('No classroom provided\n');
    }
    if (state.schools.length == 1 && state.schools[0] == 'default') {
      errors.push('No school provided\n');
    }
    if (!state.date) {
      errors.push('No date or time provided\n');
    }
    if (!state.teacher) {
      errors.push('No teacher provided\n');
    }

    return errors;
  }

  render() {
    if (this.props.classrooms.length == 0 || this.props.schools.length == 0) {
      return <p className="info-message">Для добавления лекции создайте школу и аудиторию</p>
    }
    return (
      <form id="lecture-form" className="lecture-form">
        <h1>{this.props.type == "create" ? "Создать новую лекцию" : "Изменить лекцию"}</h1>
        <label htmlFor="lecture-name">Название</label>
        <input name="name" id="lecture-name" required onChange={this.onChange} value={this.state.name}/>
        <label htmlFor="lecture-classroom">Аудитория</label>
        <select name="classroom" id="lecture-classroom" onChange={this.onChange} value={this.state.classroom}>
          <option disabled value='default'>Выберите аудиторию</option>
          {
            this.props.classrooms.map((classroom, index) => {
              return (
                <option value={classroom._id} key={index}>{classroom.name}</option>
              )
            })
          }
        </select>
        <label htmlFor="lecture-schools">Школа(ы)</label>
        <select name="schools" id="lecture-schools" multiple size="3" onChange={this.onChange} value={this.state.schools}>
          <option disabled value='default'>Выберите школу(ы)</option>
          {
            this.props.schools.map((school, index) => {
              return (
                <option value={school._id} key={index}>{school.name}</option>
              )
            })
          }
        </select>
        <label htmlFor="lecture-date">Дата и время</label>
        <input name="date" type="datetime-local" id="lecture-date" required onChange={this.onChange} />
        <label htmlFor="lecture-teacher">Преподаватель</label>
        <input name="teacher" id="lecture-teacher" required onChange={this.onChange} value={this.state.teacher}/>
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"} onClick={this.onSubmit}/>
      </form>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(lectureActions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(LecturesForm);

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
    this._formatLectureData = this._formatLectureData.bind(this);
    this._getUpdateData = this._getUpdateData.bind(this);
  }

  componentWillMount() {
    if (!!this.props.lecture && !!this.props.lecture.classroom) {
      let state = this._formatLectureData(this.props.lecture);
      this.setState(state);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lecture !== nextProps.lecture && !!nextProps.lecture.classroom) {
      let state = this._formatLectureData(nextProps.lecture);
      this.setState(state);
    }
  }

  _formatLectureData(lecture) {
    let classroom = lecture.classroom._id;
    let schools = [];
    lecture.school.forEach((school) => {
      schools.push(school._id);
    });
    let date = moment(lecture.date).format('YYYY-MM-DD HH:mm');
    return {
      name: lecture.name,
      classroom: classroom,
      schools: schools,
      date: date,
      teacher: lecture.teacher
    }
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
      let message = `Can not ${this.props.type == 'cteate' ? 'create' : 'update'} lecture. Reason:\n`;
      errors.forEach((error) => {
        message += error;
      });
      alert(message);
      return;
    }
    if (this.props.type == "create") {
      this.props.actions.createLecture(this.state);
    } else {
      let update = this._getUpdateData(this.state);
      this.props.actions.updateLecture(update, this.props.id);
    }
    this.setState({
      name: '',
      classroom: 'default',
      schools: ['default'],
      teacher: ''
    });
  }

  _getUpdateData(state) {
    let update = {};

    let initialState = this._formatLectureData(this.props.lecture);
    for (let key in initialState) {
      //Если массив, то нужно сверить все ли элементы остались прежними
      if (Array.isArray(initialState[key]) && Array.isArray(state[key])) {
        let array = state[key];
        let initialArray = initialState[key];
        //Если длина массива изменилась, то записываем его в update
        if (array.length !== initialArray.length) {
          update[key] = state[key];
        } else {
          //Если длина не изменилась, учитывая что все элементы в массиве уникальны (на это есть серверная проверка)
          for (let i = 0; i < array.length; i++) {
            if (initialState[key].indexOf(array[i]) == -1) {
              update[key] = state[key];
              break;
            }
          }
        }
      } else {
        if (initialState[key] != state[key]) {
          update[key] = state[key];
        }
      }
    }
    return update;
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

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as schoolActions from '../../actions/schoolActions';

export class SchoolForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      number_of_students: ''
    };

    this.onFormChange = this.onFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._validateForm = this._validateForm.bind(this);
    this._getUpdateData = this._getUpdateData.bind(this);
  }

  componentWillMount() {
    if (!!this.props.name && !!this.props.number_of_students && this.props.type !== 'create') {
      this.setState({
        name: this.props.name,
        number_of_students: this.props.number_of_students
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps && this.props.type !== 'create') {
      this.setState({
        name: nextProps.name,
        number_of_students: nextProps.number_of_students
      });
    }
  }

  onFormChange(event) {
    let name = event.target.name;
    let value = event.target.value;

    this.setState({
      [name]: value
    });
  }

  _validateForm(state) {
    let errors = [];
    if (!state.name) {
      errors.push('No name provided\n');
    }
    if (!state.number_of_students) {
      errors.push('No number of students provided\n');
    }

    return errors;
  }

  _getUpdateData(state) {
    let update = {};
    if (state.name !== this.props.name) {
      update.name = state.name;
    }
    if (state.number_of_students !== this.props.number_of_students) {
      update.students = state.number_of_students;
    }
    return update;
  }

  handleSubmit(event) {
    event.preventDefault();
    let errors = this._validateForm(this.state);
    if (errors.length > 0) {
      let message = `Can not ${this.props.type == 'cteate' ? 'create' : 'update'} school. Reason:\n`;
      errors.forEach((error) => {
        message += error;
      });
      alert(message);
      return;
    }
    if (this.props.type == 'create') {
      this.props.actions.createSchool({
        name: this.state.name,
        students: this.state.number_of_students
      });
    } else {
      let update = this._getUpdateData(this.state);
      this.props.actions.updateSchool(update, this.props.id);
    }
    this.setState({
      name: '',
      number_of_students: ''
    });
  }

  render() {
    return (
      <form id="school-form" className="school-form">
        <h1>{this.props.type == "create" ? "Создать новую школу" : "Изменить школу"}</h1>
        <label htmlFor="school-name">Название</label>
        <input id="school-name" required name='name' onChange={this.onFormChange} value={this.state.name}/>
        <label htmlFor="school-students">Число учащихся</label>
        <input id="school-students" required name='number_of_students' onChange={this.onFormChange} value={this.state.number_of_students}/>
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"} onClick={this.handleSubmit}/>
      </form>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(schoolActions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(SchoolForm);

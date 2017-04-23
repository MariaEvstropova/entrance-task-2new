import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as classroomActions from '../../actions/classroomActions';

export class ClassroomForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      volume: '',
      location: ''
    };

    this.onFormChange = this.onFormChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._validateForm = this._validateForm.bind(this);
    this._getUpdateData = this._getUpdateData.bind(this);
  }

  componentWillMount() {
    if (!!this.props.name && !!this.props.volume && !!this.props.location && this.props.type !== 'create') {
      this.setState({
        name: this.props.name,
        volume: this.props.volume,
        location: this.props.location
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps && this.props.type !== 'create') {
      this.setState({
        name: nextProps.name,
        volume: nextProps.volume,
        location: nextProps.location
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
    if (!state.volume) {
      errors.push('No volume provided\n');
    }
    if (!state.location) {
      errors.push('No location provided\n');
    }

    return errors;
  }

  _getUpdateData(state) {
    let update = {};
    for (let key in this.props) {
      if (this.props[key] != this.state[key]) {
        update[key] = this.state[key];
      }
    }
    return update;
  }

  handleSubmit(event) {
    event.preventDefault();
    let errors = this._validateForm(this.state);
    if (errors.length > 0) {
      let message = `Can not ${this.props.type == 'cteate' ? 'create' : 'update'} classroom. Reason:\n`;
      errors.forEach((error) => {
        message += error;
      });
      alert(message);
      return;
    }
    if (this.props.type == 'create') {
      this.props.actions.createClassroom(this.state);
    } else {
      let update = this._getUpdateData(this.state);
      this.props.actions.updateClassroom(update, this.props.id);
    }
    this.setState({
      name: '',
      volume: '',
      location: ''
    });
  }

  render() {
    return (
      <form id="classroom-form" className="classroom-form">
        <h1>{this.props.type == "create" ? "Создать новую аудиторию" : "Изменить аудиторию"}</h1>
        <label htmlFor="classroom-name">Название</label>
        <input id="classroom-name" required name='name' onChange={this.onFormChange} value={this.state.name}/>
        <label htmlFor="classroom-volume">Вместимость</label>
        <input id="classroom-volume" required name='volume' onChange={this.onFormChange} value={this.state.volume}/>
        <label htmlFor="classroom-location">Местоположение</label>
        <input id="classroom-location" required name='location' onChange={this.onFormChange} value={this.state.location}/>
        <input className="change" type="submit" value={this.props.type == "create" ? "Создать" : "Изменить"} onClick={this.handleSubmit}/>
      </form>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(classroomActions, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(ClassroomForm);

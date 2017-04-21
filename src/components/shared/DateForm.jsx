import React from 'react';

export default class DateForm extends React.Component {
  render() {
    return (
      <form>
        <label htmlFor="calendar-from">Показать начиная с даты</label>
        <input type="date" id="calendar-from" name="dateFrom" onChange={this.props.onChange} />
        <label htmlFor="calendar-to">Показать заканчивая датой</label>
        <input type="date" id="calendar-to" name="dateTo" onChange={this.props.onChange}/>
        <input type="submit" value="Показать" onClick={this.props.onShowLectures}/>
      </form>
    );
  }
}

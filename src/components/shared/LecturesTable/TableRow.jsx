import React from 'react';

export default class TableRow extends React.Component {
  render() {
    return (
      <tr>
        <td data-th="Школа">
          {
            Array.isArray(this.props.school) ? (
              this.props.school.map((school, index) => {
                return <div className="sub-row" key={index}>{school}</div>;
              })
            ) : this.props.school
          }
        </td>
        <td data-th="Лекция">{this.props.lecture}</td>
        <td data-th="Лектор">{this.props.teacher}</td>
        <td data-th="Дата">{this.props.date}</td>
        <td data-th="Место">{this.props.place}</td>
      </tr>
    );
  }
}

import React from 'react';
import moment from 'moment';
import TableRow from './TableRow.jsx';

export default class LecturesTable extends React.Component {
  constructor(props) {
    super(props);

    this.prepareLectureData = this.prepareLectureData.bind(this);
  }

  prepareLectureData(lectures) {
    let tableData = lectures.map((lecture) => {
      let data = {};

      data.lecture = lecture.name;
      data.teacher = lecture.teacher;
      data.date = moment(lecture.date).format('YYYY-MM-DD HH:mm');
      data.place = lecture.classroom.name;
      if (lecture.school.length < 2) {
        data.school = lecture.school[0].name;
      } else {
        data.school = [];
        lecture.school.forEach((school) => {
          data.school.push(school.name);
        });
      }

      return data;
    });

    return tableData;
  }

  render() {
    if (!this.props.lectures) {
      return <div></div>
    }
    if (this.props.lectures.length == 0) {
      return <p className="info-message">Извините, в заданный интервал дат лекций нет</p>
    }
    let tableData = this.prepareLectureData(this.props.lectures);
    let rows = tableData.map((data, index) => {
      return <TableRow {...data} key={index} />
    });
    return (
      <table className="lecture-table">
        <colgroup>
          <col width="20%"/>
          <col width="20%"/>
          <col width="20%"/>
          <col width="20%"/>
          <col width="20%"/>
        </colgroup>
        <thead>
          <tr>
            <th>Школа</th>
            <th>Лекция</th>
            <th>Лектор</th>
            <th>Дата</th>
            <th>Место</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

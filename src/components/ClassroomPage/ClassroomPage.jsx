import React from 'react';

export default class ClassroomPage extends React.Component {
  render() {
    return (
      <div>Classroom page {this.props.match.params.id}</div>
    );
  }
}

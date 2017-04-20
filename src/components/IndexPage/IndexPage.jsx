import React from 'react';
import LecturesSection from './LecturesSection.jsx';
import ClassroomsSection from './ClassroomsSection.jsx';
import SchoolsSection from './SchoolsSection.jsx';

export default class IndexPage extends React.Component {
  render() {
    let lectures = [
      {
        id: 1,
        name: "Параллельные вычисления"
      },
      {
        id: 2,
        name: "Параллельные вычисления"
      },
      {
        id: 3,
        name: "Параллельные вычисления"
      }
    ];
    let classrooms = [
      {
        id: 1,
        name: "Синий кит"
      },
      {
        id: 2,
        name: "Синий кит"
      },
      {
        id: 3,
        name: "Синий кит"
      }
    ];
    let schools = [
      {
        id: 1,
        name: "Школа мобильной разработки"
      },
      {
        id: 2,
        name: "Школа мобильной разработки"
      },
      {
        id: 3,
        name: "Школа мобильной разработки"
      }
    ];
    return (
      <div className="main-content">
        <div className="content-sections">
          <LecturesSection
            lectures={lectures}
            classrooms={classrooms}
            schools={schools}
          />
          <ClassroomsSection classrooms={classrooms} />
          <SchoolsSection schools={schools} />
        </div>
      </div>
    );
  }
}

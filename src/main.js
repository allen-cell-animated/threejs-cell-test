import React from 'react';
import ReactDom from 'react-dom';
import MapView from './components/MapView';
import EventsTable from './components/EventsTable';
import getData from './logics/getData';
import Point from './logics/features';

import './style/app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

  }


  render() {
    return (
      <div>
        <EventsTable
          events={this.state.events}
        />
        <MapView
          getEvents={this.getEvents}
          events={this.state.events}
          features={this.state.groups}
          featuresHome={this.state.featuresHome}
        />
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById('root'));

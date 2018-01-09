import React from 'react';
import ReactDom from 'react-dom';
import CellViewer from './components/CellViewer';
import './style/app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cell: '',
    };
  }

  render() {
    return (
      <div>
        <CellViewer
          cell={this.state.cell}
        />
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById('root'));

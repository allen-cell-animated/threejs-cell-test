import React from 'react';
import ReactDom from 'react-dom';
import CellViewer from './components/CellViewer';
import './style/app.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      membrane: 'cellstl/step_191_Memb.stl',
      nucleus: 'cellstl/step_191_DNA.stl',
      structure: 'cellstl/step_191_Alpha tubulin.stl',

    };
  }

  render() {
    return (
      <div>
        <CellViewer
          membrane={this.state.membrane}
          nucleus={this.state.nucleus}
          structure={this.state.structure}
        />
      </div>
    );
  }
}

ReactDom.render(<App />, document.getElementById('root'));

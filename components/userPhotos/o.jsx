import React from 'react';
import ReactDOM from 'react-dom';

//import Header from './components/header/Header';
import Example from './components/example/Example';
import States from './components/states/States';

/* eslint-disable react/prop-types */


class DynamicPage extends React.Component {
constructor(props) {
super(props);
this.handleStatesClick = this.handleStatesClick.bind(this);
this.handleExampleClick = this.handleExampleClick.bind(this);
this.state = {isExample: true};
}

handleStatesClick() {
this.setState({isExample: false});
}

handleExampleClick() {
this.setState({isExample: true});
}

render() {
const isExample = this.state.isExample;
let button;

if (isExample) {
button = <StatesButton onClick={this.handleStatesClick} />;
} else {
button = <ExampleButton onClick={this.handleExampleClick} />;
}

return (
<div>
<Page isExample={isExample} />
{button}
</div>
);
}
}



function Page(props) {
const isExample = props.isExample;
if (isExample) {
return <Example />;
}
return <States />;
}



function StatesButton(props) {
return (
<button onClick={props.onClick}>
Change to States
</button>
);
}



function ExampleButton(props) {
return (
<button onClick={props.onClick}>
Change to Example
</button>
);
}



ReactDOM.render(
<DynamicPage />,
document.getElementById('root')
);

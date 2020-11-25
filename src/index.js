import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import Loading from './app/Loading';

ReactDOM.render(
    <Loading />
  ,
  document.getElementById('root')
);

// serviceWorker.register()
serviceWorker.unregister();

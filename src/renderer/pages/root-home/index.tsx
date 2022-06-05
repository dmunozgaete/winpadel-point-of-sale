import React from 'react';
import './index.scss';
// import { useNavigate } from 'react-router-dom';
import ChariotConsole from '../../lib/ChariotConsole';

// import i18n from '../../lib/i18n';
// import locales from './locales';

const chariot = ChariotConsole({ label: 'root-home' });

// const localize = i18n(locales);
interface IState {
  mode: 'INITIAL_STATE';
  menu_is_open: boolean;
}

export default class RootPage extends React.Component<{}, IState> {
  componentDidMount() {
    chariot.debug('root-home');
  }

  render() {
    return <div />;
  }
}

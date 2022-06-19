import React from 'react';
import { Modal } from 'antd';
import styles from './index.module.css';
import i18n from '../../../../lib/i18n';
import locales from '../../locales';

const localize = i18n(locales);
interface IState {
  view_mode: 'LOADING' | 'ALIAS_LIST';
}

export default class PutTheNameModal extends React.Component<{}, IState> {
  state: IState = {
    view_mode: 'LOADING',
  };

  componentDidMount() {
    this.getAll();
  }

  getAll = async () => {};

  render() {
    const { view_mode } = this.state;

    return <Modal visible />;
  }
}

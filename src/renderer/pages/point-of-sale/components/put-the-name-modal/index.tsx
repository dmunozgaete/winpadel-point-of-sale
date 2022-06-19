import React from 'react';
import { Button, Modal } from 'antd';
import styles from './index.module.css';
import i18n from '../../../../lib/i18n';
import locales from '../../locales';

const localize = i18n(locales);

interface IProps {
  onCompleted: (alias: IAlias) => {};
}
interface IState {
  view_mode: 'LOADING' | 'ALIAS_LIST';
  alias: IAlias[];
}

export default class PutTheNameModal extends React.Component<IProps, IState> {
  state: IState = {
    view_mode: 'LOADING',
    alias: [],
  };

  componentDidMount() {
    this.getAll();
  }

  getAll = async () => {};

  onCompletedClickHandler = async () => {
    const { onCompleted } = this.props;
    if (!onCompleted) return;

    onCompleted({
      _id: 'asa',
      name: 'dummy_alias',
    });
  };

  render() {
    const { view_mode, alias } = this.state;

    return (
      <Modal visible title="Title" centered footer={null} closable={false}>
        {alias.map((alia) => {
          return <div>{alia.name}</div>;
        })}

        <Button onClick={() => this.onCompletedClickHandler()}>sadsad</Button>
      </Modal>
    );
  }
}

export interface IAlias {
  _id: string;
  name: string;
}

import React from 'react';
import { Button, Drawer, Divider, Tag, Row, Col } from 'antd';
import OrdersClient, { IOrder } from 'renderer/clients/OrdersClient';
import styles from './index.module.css';
import i18n from '../../lib/i18n';
import locales from './locales';

const localize = i18n(locales);

interface IProps {
  onClose: () => {};
  order: IOrder;
}
interface IState {}

export default class OrderDetailModal extends React.Component<IProps, IState> {
  state: IState = {};

  onCloseClickHandler = async () => {
    const { onClose } = this.props;
    if (!onClose) return;

    onClose();
  };

  onUpdateToPaidClickHandler = async () => {
    const { order } = this.props;
    await OrdersClient.updateToPaid(order._id);
    await this.onCloseClickHandler();
  };

  render() {
    const { order } = this.props;
    return (
      <Drawer
        className={styles.drawer}
        autoFocus
        closable
        maskClosable
        title="asd"
        visible
        onClose={this.onCloseClickHandler}
      >
        {JSON.stringify(order)}

        <Button onClick={() => this.onUpdateToPaidClickHandler()}>
          Actualizar
        </Button>
      </Drawer>
    );
  }
}

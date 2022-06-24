import React from 'react';
import {
  Button,
  Drawer,
  Tag,
  Row,
  Col,
  Layout,
  Avatar,
  Tooltip,
  List,
} from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import OrdersClient, { IOrder } from 'renderer/clients/OrdersClient';
import moment from 'moment';
import { IProductCart } from 'renderer/clients/ProductsClient';
import NumberFormatter from 'renderer/lib/formatters/NumberFormatter';
import styles from './index.module.css';
import i18n from '../../lib/i18n';
import locales from './locales';

const localize = i18n(locales);

interface IProps {
  onClose: () => {};
  order: IOrder;
}
interface IState {
  view_mode: 'LOADING' | 'ORDER_READY';
  show_drawer: boolean;
  cart: Record<string, IProductCart> | undefined;
}

export default class OrderDetailModal extends React.Component<IProps, IState> {
  state: IState = {
    view_mode: 'LOADING',
    show_drawer: false,
    cart: undefined,
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        show_drawer: true,
      });
    }, 50);

    this.getCartFromOrder();
  }

  getCartFromOrder = async () => {
    const { order } = this.props;
    const cart = await OrdersClient.getCart(order._id);

    this.setState({
      cart,
      view_mode: 'ORDER_READY',
    });
  };

  onCloseClickHandler = async () => {
    const { onClose } = this.props;
    if (!onClose) return;

    setTimeout(() => {
      onClose();
    }, 200);

    this.setState({
      show_drawer: false,
    });
  };

  onUpdateToPaidClickHandler = async () => {
    const { order } = this.props;
    await OrdersClient.updateToPaid(order._id);
    await this.onCloseClickHandler();
  };

  render_LOADING = () => {
    return <div>Loading...</div>;
  };

  render_ORDER_READY = () => {
    const { cart } = this.state;
    const { order } = this.props;

    return (
      <>
        <Layout.Header className={styles.drawer__header}>
          <Row className={styles.drawer__header__pageheader}>
            <Col span={20}>
              <Row>
                <Col
                  span={24}
                  className={styles.drawer__header__pageheader__title}
                >
                  {localize('title')}
                </Col>
              </Row>
              <Row>
                <Col
                  span={24}
                  className={styles.drawer__header__pageheader__subtitle}
                >
                  {moment(order.created_at).format(
                    localize('created_at_format')
                  )}
                </Col>
              </Row>
            </Col>
            <Col span={4} className={styles.drawer__header__pageheader__avatar}>
              <Tooltip title={order.user.unique_name} placement="bottomLeft">
                <Avatar
                  style={{ height: 'auto' }}
                  shape="square"
                  src={order.user.avatar}
                />
              </Tooltip>
            </Col>
          </Row>
        </Layout.Header>
        <Layout.Content className={styles.drawer__content}>
          <List itemLayout="horizontal">
            {Object.keys(cart!).map((sku: string) => {
              const productCart: IProductCart = cart![sku];
              return (
                <List.Item key={productCart.id} className={styles.cart_item}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: 'calc(100% - 24px)',
                    }}
                  >
                    <div style={{ width: '56px' }}>
                      <Avatar
                        className={styles.cart_item__avatar}
                        shape="square"
                        src={productCart.image}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        paddingLeft: '12px',
                        width: 'calc(100% - 44px)',
                      }}
                    >
                      <div className={styles.cart_item__name}>
                        {productCart.name}
                      </div>
                      <div className={styles.cart_item__price}>
                        {NumberFormatter.toCurrency(productCart.price)}
                      </div>
                    </div>
                    <div
                      className={styles.cart_item__actions__quantity}
                      style={{
                        width: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      x{productCart.quantity}
                    </div>
                  </div>
                </List.Item>
              );
            })}
          </List>
        </Layout.Content>
        <Layout.Footer className={styles.drawer__footer}>
          <div className={styles.drawer__footer__resume}>
            <Row className={styles.drawer__footer__resume__row}>
              <Col className={styles.drawer__footer__resume__col_names}>
                {localize('total_products')}:
              </Col>
              <Col className={styles.drawer__footer__resume__col_values}>
                {NumberFormatter.toCurrency(order.amount)}
              </Col>
            </Row>
            <Row className={styles.drawer__footer__resume__row}>
              <Col className={styles.drawer__footer__resume__col_names}>
                {localize('total_amount')}:
              </Col>
              <Col className={styles.drawer__footer__resume__col_values}>
                {NumberFormatter.toNumber(order.product_quantity)}
              </Col>
            </Row>
          </div>
          <div
            style={{ textAlign: 'center' }}
            className={styles.drawer__footer__actions}
          >
            <Button
              className={styles.drawer__footer__actions__button}
              size="large"
              icon={<ShoppingOutlined />}
              danger
              type="primary"
              shape="round"
              onClick={() => this.onUpdateToPaidClickHandler()}
            >
              {localize('mark_as_paid')}
            </Button>

            <Button
              type="link"
              danger
              onClick={() => this.onCloseClickHandler()}
            >
              {localize('close')}
            </Button>
          </div>
        </Layout.Footer>
      </>
    );
  };

  render() {
    const { view_mode, show_drawer } = this.state;
    return (
      <Drawer
        className={styles.drawer}
        autoFocus
        closable={false}
        bodyStyle={{ padding: 0 }}
        maskClosable
        visible={show_drawer}
        push
        width={500}
        onClose={this.onCloseClickHandler}
      >
        <Layout style={{ height: '100%' }}>
          {(() => {
            const customRender: Function = (this as any)[`render_${view_mode}`];
            if (!customRender) {
              return <div>{view_mode}</div>;
            }
            return customRender();
          })()}
        </Layout>
      </Drawer>
    );
  }
}

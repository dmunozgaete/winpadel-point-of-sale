import React from 'react';
import EmptyCart from 'img/empty-cart.png';
import {
  Layout,
  Card,
  Skeleton,
  Badge,
  List,
  Avatar,
  Button,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import AuthenticationClient from 'renderer/clients/AuthenticationClient';
import ProductsClient, {
  IProduct,
  IProductCart,
} from 'renderer/clients/ProductsClient';
import NumberFormatter from 'renderer/lib/formatters/NumberFormatter';
import styles from './index.module.css';
import i18n from '../../lib/i18n';
import locales from './locales';

// const chariot = ChariotConsole({ label: 'root-home' });

const localize = i18n(locales);
interface IState {
  view_mode: 'LOADING' | 'PRODUCTS_LIST';
  products?: IProduct[];
  cart: Record<string, IProductCart>;
}

export default class RootHomePage extends React.Component<{}, IState> {
  state: IState = {
    view_mode: 'LOADING',
    products: undefined,
    cart: {},
  };

  componentDidMount() {
    this.getProducts();
  }

  getProducts = async () => {
    const products: IProduct[] = await ProductsClient.getProducts();

    this.setState({
      view_mode: 'PRODUCTS_LIST',
      products,
    });
  };

  onAddProductToCartHandler = (productToAdd: IProduct) => {
    const { cart } = this.state;
    const existence = cart[productToAdd.id];
    cart[productToAdd.id] = {
      ...productToAdd,
      quantity: existence ? (existence.quantity += 1) : 1,
    };

    this.setState({
      cart,
    });
  };

  onSumToCartItemHandler = async (productItem: IProductCart) => {
    const { cart } = this.state;
    productItem.quantity += 1;
    this.setState({
      cart,
    });
  };

  onReduceToCartItemHandler = async (productItem: IProductCart) => {
    const { cart } = this.state;
    productItem.quantity -= 1;
    if (productItem.quantity <= 0) {
      delete cart[productItem.id];
    }
    this.setState({
      cart,
    });
  };

  onCleanCartHandler = async () => {
    this.setState({
      cart: {},
    });
  };

  render_LOADING = () => {
    return (
      <div className={styles.container}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((data) => {
          return (
            <div key={data} style={{ display: 'inline-block' }}>
              <Card
                hoverable
                style={{ width: 210, margin: 10, borderRadius: 8 }}
                cover={
                  <div
                    style={{
                      padding: 8,
                      textAlign: 'center',
                    }}
                  >
                    <Skeleton.Image
                      style={{ height: 110, width: 170, borderRadius: 8 }}
                    />
                  </div>
                }
              >
                <Card.Meta
                  title={<Skeleton paragraph={false} active loading />}
                  description={<Skeleton paragraph={false} active loading />}
                />
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  render_PRODUCTS_LIST = () => {
    const { products, cart } = this.state;

    return (
      <div className={styles.container} unselectable="off">
        {products!.map((product: IProduct) => {
          const cartItem = cart[product.id];

          return (
            <div key={product.id} style={{ display: 'inline-block' }}>
              <Card
                className={[
                  styles.product_card,
                  cartItem ? styles['product_card--selected'] : '',
                ].join(' ')}
                onClick={() => this.onAddProductToCartHandler(product)}
                hoverable
                style={{ width: 210, margin: 10, borderRadius: 8 }}
                cover={
                  <div
                    style={{
                      padding: '24px 24px 0px 24px',
                      textAlign: 'center',
                    }}
                  >
                    <Badge
                      size="default"
                      title="asd"
                      className={styles.product_card__meta___badge}
                      count={cartItem ? cartItem.quantity : 0}
                    />
                    <img
                      style={{ maxHeight: 110, borderRadius: 8 }}
                      alt="example"
                      src={product.image}
                    />
                  </div>
                }
              >
                <div>
                  <div className={styles.product_card__meta___name}>
                    {product.name}
                  </div>
                  <div className={styles.product_card__meta___price}>
                    {NumberFormatter.toCurrency(product.price)}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { view_mode, cart } = this.state;
    let totalProducts = 0;
    let totalPrice = 0;
    const user = AuthenticationClient.getInfo();
    return (
      <>
        <Layout className={styles.layout}>
          <Layout>
            <Layout.Header className={styles.layout__header}>
              <div style={{ lineHeight: 'normal', minHeight: 0 }}>
                <span className={styles.layout__content__welcome}>
                  {localize('welcome')}
                </span>
                <span className={styles.layout__content__user}>
                  {user.unique_name}
                </span>
              </div>
              <div
                style={{ lineHeight: 'normal', minHeight: 0, paddingTop: 4 }}
              >
                <span className={styles.layout__content__subtitle}>
                  {localize('subtitle')}
                </span>
              </div>
            </Layout.Header>
            <Layout.Content className={styles.layout__content}>
              {(() => {
                const customRender: Function = (this as any)[
                  `render_${view_mode}`
                ];
                if (!customRender) {
                  return <div>{view_mode}</div>;
                }
                return customRender();
              })()}
            </Layout.Content>
          </Layout>
          <Layout.Sider width="450px" className={styles.layout__sider}>
            <Layout.Header className={styles.layout__sider__header}>
              <div style={{ lineHeight: 'normal', minHeight: 0 }}>
                <span className={styles.layout__sider__title}>
                  {localize('cart_title')}
                </span>
              </div>
              <div
                style={{ lineHeight: 'normal', minHeight: 0, paddingTop: 4 }}
              >
                <span className={styles.layout__content__subtitle}>
                  {localize('cart_subtitle')}
                </span>
              </div>
            </Layout.Header>
            <Layout.Content className={styles.layout__sider__content}>
              <List itemLayout="horizontal">
                {Object.keys(cart).map((sku: string) => {
                  const productCart: IProductCart = cart[sku];
                  totalPrice += productCart.quantity * productCart.price;
                  totalProducts += productCart.quantity;
                  return (
                    <List.Item
                      key={productCart.id}
                      className={styles.cart_item}
                    >
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
                            width: 'calc(100% - 156px)',
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
                          style={{
                            width: '88px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <div className={styles.cart_item__actions}>
                            <Button
                              type="primary"
                              ghost
                              size="small"
                              onClick={() =>
                                this.onSumToCartItemHandler(productCart)
                              }
                              shape="circle"
                              icon={<PlusOutlined />}
                            />
                            <div
                              className={styles.cart_item__actions__quantity}
                            >
                              {productCart.quantity}
                            </div>
                            <Button
                              danger
                              size="small"
                              onClick={() =>
                                this.onReduceToCartItemHandler(productCart)
                              }
                              shape="circle"
                              icon={<MinusOutlined />}
                            />
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  );
                })}
              </List>

              {totalProducts === 0 ? (
                <div className={styles.layout__sider_empty_cart}>
                  <img src={EmptyCart} alt="" />
                </div>
              ) : null}
            </Layout.Content>
            <Layout.Footer className={styles.layout__sider__footer}>
              <div className={styles.layout__sider__footer__resume}>
                <Row className={styles.layout__sider__footer__resume__row}>
                  <Col
                    className={styles.layout__sider__footer__resume__col_names}
                  >
                    {localize('total_products')}:
                  </Col>
                  <Col
                    className={styles.layout__sider__footer__resume__col_values}
                  >
                    {totalProducts === 0
                      ? '-'
                      : NumberFormatter.toNumber(totalProducts)}
                  </Col>
                </Row>
                <Row className={styles.layout__sider__footer__resume__row}>
                  <Col
                    className={styles.layout__sider__footer__resume__col_names}
                  >
                    {localize('total_amount')}:
                  </Col>
                  <Col
                    className={styles.layout__sider__footer__resume__col_values}
                  >
                    {totalProducts === 0
                      ? '-'
                      : NumberFormatter.toCurrency(totalPrice)}
                  </Col>
                </Row>
              </div>
              <div
                style={{ textAlign: 'center' }}
                className={styles.layout__sider__footer__actions}
              >
                <Button
                  disabled={totalProducts === 0}
                  className={styles.layout__sider__footer__actions__button}
                  type="primary"
                  danger
                  shape="round"
                  icon={<ShoppingOutlined />}
                  size="large"
                >
                  {localize('finish_payment')}
                </Button>

                <Button
                  onClick={() => this.onCleanCartHandler()}
                  disabled={totalProducts === 0}
                  shape="round"
                  type="text"
                  size="large"
                >
                  Limpiar
                </Button>
              </div>
            </Layout.Footer>
          </Layout.Sider>
        </Layout>

        <Outlet />
      </>
    );
  }
}

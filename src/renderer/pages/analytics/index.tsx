import React from 'react';
import { Layout, Row, Col, Card, Statistic, List } from 'antd';
import { DollarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';

import NumberFormatter from 'renderer/lib/formatters/NumberFormatter';
import OrdersClient, { IOrder } from 'renderer/clients/OrdersClient';
import IPouchDbResponse from 'renderer/lib/IPouchDbResponse';
import styles from './index.module.css';
import i18n from '../../lib/i18n';
import locales from './locales';

const localize = i18n(locales);
interface IState {
  view_mode: 'LOADING' | 'GRAPH_READY';
  orders: IPouchDbResponse<IOrder> | undefined;
  total_orders: number;
  total_amount: number;
}

export default class AnalyticsPage extends React.Component<{}, IState> {
  state: IState = {
    view_mode: 'LOADING',
    orders: undefined,
    total_orders: 0,
    total_amount: 0,
  };

  componentDidMount() {
    this.getGraphData();
  }

  getGraphData = async () => {
    let { total_amount } = this.state;
    const orders = await OrdersClient.getAll(0, 100);
    orders.data.forEach((order: IOrder) => {
      total_amount += order.amount;
    });
    this.setState({
      view_mode: 'GRAPH_READY',
      orders,
      total_orders: orders.total,
      total_amount,
    });
  };

  render_GRAPH_READY = () => {
    const { total_amount, total_orders, orders } = this.state;

    return (
      <>
        <Layout>
          <Layout.Header className={styles.layout__header}>
            <div style={{ lineHeight: 'normal', minHeight: 0 }}>
              <span className={styles.layout__header__title}>
                {localize('title')}
              </span>
            </div>
            <div style={{ lineHeight: 'normal', minHeight: 0, paddingTop: 4 }}>
              <span className={styles.layout__header__subtitle}>
                {localize('subtitle')}
              </span>
            </div>
          </Layout.Header>
          <Layout.Content className={styles.layout__content}>
            <Row gutter={24}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={localize('statistics_day_sales')}
                    value={total_amount}
                    precision={0}
                    prefix={<DollarOutlined />}
                    suffix="CLP"
                    groupSeparator="."
                  />
                </Card>
              </Col>
              <Col span={7}>
                <Card>
                  <Statistic
                    title={localize('statistics_cart_sales')}
                    value={total_orders}
                    precision={0}
                    prefix={<ShoppingOutlined />}
                    groupSeparator="."
                    suffix=""
                  />
                </Card>
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={24}>
                <Card>
                  <Line
                    className={styles.layout__content__chart}
                    data={[
                      {
                        timePeriod: '00:00',
                        value: 0,
                      },
                      {
                        timePeriod: '01:00',
                        value: 0,
                      },
                      {
                        timePeriod: '02:00',
                        value: 0,
                      },
                      {
                        timePeriod: '03:00',
                        value: 0,
                      },
                      {
                        timePeriod: '04:00',
                        value: 0,
                      },
                      {
                        timePeriod: '05:00',
                        value: 0,
                      },
                      {
                        timePeriod: '06:00',
                        value: 0,
                      },
                      {
                        timePeriod: '07:00',
                        value: 1500,
                      },
                      {
                        timePeriod: '08:00',
                        value: 3000,
                      },
                      {
                        timePeriod: '09:00',
                        value: 7000,
                      },
                      {
                        timePeriod: '10:00',
                        value: 12000,
                      },
                      {
                        timePeriod: '11:00',
                        value: 12500,
                      },
                      {
                        timePeriod: '12:00',
                        value: 14000,
                      },
                      {
                        timePeriod: '13:00',
                        value: 14000,
                      },
                      {
                        timePeriod: '14:00',
                        value: 14000,
                      },
                      {
                        timePeriod: '15:00',
                        value: 15600,
                      },
                      {
                        timePeriod: '16:00',
                        value: 17000,
                      },
                      {
                        timePeriod: '17:00',
                        value: 21434,
                      },
                      {
                        timePeriod: '18:00',
                        value: 27000,
                      },
                      {
                        timePeriod: '19:00',
                        value: 27500,
                      },
                      {
                        timePeriod: '20:00',
                        value: 28000,
                      },
                      {
                        timePeriod: '21:00',
                        value: 29000,
                      },
                      {
                        timePeriod: '22:00',
                        value: 31000,
                      },
                      {
                        timePeriod: '23:00',
                        value: 34000,
                      },
                      {
                        timePeriod: '24:00',
                        value: 36000,
                      },
                    ]}
                    xField="timePeriod"
                    yField="value"
                    yAxis={{
                      label: {
                        formatter: (text: string) => {
                          return NumberFormatter.toNumber(parseInt(text));
                        },
                      },
                      grid: {
                        alignTick: true,
                      },
                    }}
                  />
                </Card>
              </Col>
            </Row>
          </Layout.Content>
        </Layout>
        <Layout.Sider width="450px" className={styles.layout__sider}>
          <Layout.Header className={styles.layout__sider__header}>
            <div style={{ lineHeight: 'normal', minHeight: 0 }}>
              <span className={styles.layout__sider__header__title}>
                {localize('sider_title')}
              </span>
            </div>
            <div style={{ lineHeight: 'normal', minHeight: 0, paddingTop: 4 }}>
              <span className={styles.layout__sider__header__subtitle}>
                {localize('sider_subtitle')}
              </span>
            </div>
          </Layout.Header>
          <Layout.Content>
            <List>
              {orders!.data.map((order: IOrder) => {
                return <List.Item>{order.amount}</List.Item>;
              })}
            </List>
          </Layout.Content>
        </Layout.Sider>
      </>
    );
  };

  render_LOADING = () => {
    return <div>Loading...</div>;
  };

  render() {
    const { view_mode } = this.state;
    return (
      <Layout className={styles.layout}>
        {(() => {
          const customRender: Function = (this as any)[`render_${view_mode}`];
          if (!customRender) {
            return <div>{view_mode}</div>;
          }
          return customRender();
        })()}
      </Layout>
    );
  }
}

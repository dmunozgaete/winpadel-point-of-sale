import React from 'react';
import {
  Layout,
  Row,
  Col,
  Card,
  Statistic,
  List,
  Segmented,
  Skeleton,
  Avatar,
} from 'antd';
import { DollarOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';

import NumberFormatter from 'renderer/lib/formatters/NumberFormatter';
import OrdersClient, { IOrder } from 'renderer/clients/OrdersClient';
import IPouchDbResponse from 'renderer/lib/IPouchDbResponse';
import { SegmentedValue } from 'antd/lib/segmented';
import moment from 'moment';
import OrderDetailModal from 'renderer/components/order-detail-modal';
import styles from './index.module.css';
import i18n from '../../lib/i18n';
import locales from './locales';

const localize = i18n(locales);
interface IState {
  view_mode: 'LOADING' | 'GRAPH_TODAY' | 'GRAPH_WEEK' | 'GRAPH_MONTH';
  orders: IPouchDbResponse<IOrder> | undefined;
  statistics: {
    amount: number;
    total: number;
    acumulated: number;
  };
  graph_data: IGraphData[] | undefined;
  show_order_detail: boolean;
  order_detail_data: IOrder | undefined;
}

interface IGraphData {
  xAxis: string;
  value: number;
  acumulated: number;
}

export default class AnalyticsPage extends React.Component<{}, IState> {
  state: IState = {
    view_mode: 'LOADING',
    orders: undefined,
    statistics: {
      amount: 0,
      total: 0,
      acumulated: 0,
    },
    graph_data: undefined,

    show_order_detail: false,
    order_detail_data: undefined,
  };

  componentDidMount() {
    setTimeout(() => {
      this.getGraphDataForToday();
    }, 250);
  }

  getGraphDataForToday = async () => {
    const { statistics } = this.state;
    const today = moment().add(-1, 'h').date();
    const orders = await OrdersClient.getAllByDay(today, 0, 100);

    const ordersByHour: Record<string, IGraphData> = {};
    for (let hour = 1; hour <= 24; hour += 1) {
      const formatterHour = `${hour.toString().padStart(2, '0')}:00`;
      ordersByHour[hour] = {
        xAxis: formatterHour,
        value: 0,
        acumulated: 0,
      };
    }

    orders.data.forEach((order: IOrder) => {
      // Order the list by hour
      let hour = moment(order.created_at).hour();
      if (hour === 0) hour = 24;
      if (!ordersByHour[hour]) {
        console.error(`hour ${hour} is not in the array`);
        return;
      }

      const item = ordersByHour[hour];
      item.value += order.amount;
    });

    const graph_data: IGraphData[] = [];
    Object.keys(ordersByHour).forEach((key) => {
      const item = ordersByHour[key];

      statistics.amount += item.value;
      item.acumulated = statistics.amount;

      graph_data.push(item);
    });

    // Get the last hour for accumulated
    let currentHour = moment().hour();
    if (currentHour === 0) currentHour = 24;

    statistics.acumulated = ordersByHour[currentHour].value;
    statistics.total = orders.total;

    this.setState({
      view_mode: 'GRAPH_TODAY',
      orders,
      graph_data,
      statistics,
    });
  };

  getGraphDataForWeek = async () => {
    await this.getGraphDataForToday();
  };

  getGraphDataForMonth = async () => {
    await this.getGraphDataForToday();
  };

  onRangeChangedHandler = async (value: SegmentedValue) => {
    console.log(value);
    this.setState({
      view_mode: 'LOADING',
      statistics: {
        acumulated: 0,
        amount: 0,
        total: 0,
      },
      orders: undefined,
      graph_data: undefined,
    });

    setTimeout(() => {
      if (localize('segmented_today') === value) {
        this.getGraphDataForToday();
      } else if (localize('segmented_week') === value) {
        this.getGraphDataForWeek();
      } else if (localize('segmented_month') === value) {
        this.getGraphDataForMonth();
      }
    }, 500);
  };

  onOrderClickHandler = async (order: IOrder) => {
    this.setState({
      show_order_detail: true,
      order_detail_data: order,
    });
  };

  onCloseDetailModalHandler = async () => {
    this.setState({
      show_order_detail: false,
      order_detail_data: undefined,
    });
  };

  render_ORDER_LIST = () => {
    const { orders, show_order_detail, order_detail_data } = this.state;
    return (
      <>
        <List
          itemLayout="horizontal"
          className={styles.layout__sider__content__list}
        >
          {orders!.data.map((order: IOrder) => {
            return (
              <List.Item onClick={() => this.onOrderClickHandler(order)}>
                <List.Item.Meta
                  className={styles.layout__sider__content__list__item}
                  avatar={
                    <Avatar
                      style={{
                        height: 'auto',
                        paddingTop: 6,
                      }}
                      shape="square"
                      src={order.user.avatar}
                    />
                  }
                  title={moment(order.created_at).format(
                    localize('date_template')
                  )}
                  description={
                    <span style={{ textTransform: 'none' }}>
                      <b>{order.product_quantity}</b>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: localize('product_item_text'),
                        }}
                      />
                      {NumberFormatter.toCurrency(order.amount)}
                    </span>
                  }
                />
              </List.Item>
            );
          })}
        </List>
        {show_order_detail ? (
          <OrderDetailModal
            readOnly
            order={order_detail_data!}
            onClose={this.onCloseDetailModalHandler}
          />
        ) : null}
      </>
    );
  };

  render_GRAPH_TODAY = () => {
    const { statistics, graph_data } = this.state;

    return (
      <>
        <Layout>
          <Layout.Header className={styles.layout__header}>
            <Row align="middle">
              <Col span={16}>
                <div style={{ lineHeight: 'normal', minHeight: 0 }}>
                  <span className={styles.layout__header__title}>
                    {localize('title')}
                  </span>
                </div>
                <div
                  style={{ lineHeight: 'normal', minHeight: 0, paddingTop: 4 }}
                >
                  <span className={styles.layout__header__subtitle}>
                    {localize('subtitle')}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <Segmented
                  className={styles.layout__content__segmented}
                  size="middle"
                  value={localize('segmented_today')}
                  options={[
                    localize('segmented_today'),
                    localize('segmented_week'),
                    localize('segmented_month'),
                  ]}
                  onChange={this.onRangeChangedHandler}
                  block
                />
              </Col>
            </Row>
          </Layout.Header>
          <Layout.Content className={styles.layout__content}>
            <Row gutter={24}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={localize('statistics_day_sales')}
                    value={statistics.amount}
                    precision={0}
                    prefix={<DollarOutlined />}
                    suffix="CLP"
                    groupSeparator="."
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={localize('statistics_cart_sales')}
                    value={statistics.total}
                    precision={0}
                    prefix={<ShoppingOutlined />}
                    groupSeparator="."
                    suffix=""
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title={localize('statistics_accumulated')}
                    value={statistics.acumulated}
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
                  <Column
                    className={styles.layout__content__chart}
                    data={graph_data!}
                    xField="xAxis"
                    label={false}
                    legend={false}
                    yField="value"
                    tooltip={{
                      title: (title: string) => {
                        return `${localize('chart_hour')}: ${title}`;
                      },
                      formatter: (datum) => {
                        return {
                          name: localize('chart_tooltip'),
                          value: NumberFormatter.toCurrency(datum.value),
                        };
                      },
                    }}
                    yAxis={{
                      alias: localize('chart_y_alias'),
                      tickCount: 8,
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
          <Layout.Content className={styles.layout__sider__content}>
            {this.render_ORDER_LIST()}
          </Layout.Content>
        </Layout.Sider>
      </>
    );
  };

  render_LOADING = () => {
    return (
      <>
        <Layout>
          <Layout.Header
            className={styles.layout__header}
            style={{ lineHeight: 'normal' }}
          >
            <Row align="middle">
              <Col span={13}>
                <Skeleton.Input
                  active
                  size="large"
                  block
                  style={{ borderRadius: 5 }}
                />
              </Col>
              <Col span={3} />
              <Col span={8} style={{ textAlign: 'right' }}>
                <Skeleton.Input
                  size="large"
                  block
                  active
                  style={{ borderRadius: 5 }}
                />
              </Col>
            </Row>
          </Layout.Header>
          <Layout.Content className={styles.layout__content}>
            <Row gutter={24}>
              <Col span={8}>
                <Skeleton.Input
                  block
                  active
                  style={{ height: 145, borderRadius: 5 }}
                />
              </Col>
              <Col span={8}>
                <Skeleton.Input
                  block
                  active
                  style={{ height: 145, borderRadius: 5 }}
                />
              </Col>
              <Col span={8}>
                <Skeleton.Input
                  block
                  active
                  style={{ height: 145, borderRadius: 5 }}
                />
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={24}>
                <Skeleton.Input
                  block
                  active
                  style={{ height: 450, borderRadius: 5 }}
                />
              </Col>
            </Row>
          </Layout.Content>
        </Layout>
        <Layout.Sider width="450px" className={styles.layout__sider}>
          <Layout.Header className={styles.layout__sider__header}>
            <Skeleton.Input size="large" active />

            <Skeleton.Input size="large" active />
          </Layout.Header>
          <Layout.Content>
            <List>
              <Skeleton.Input size="large" active />
            </List>
          </Layout.Content>
        </Layout.Sider>
      </>
    );
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

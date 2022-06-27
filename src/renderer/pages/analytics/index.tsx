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
import {
  DollarOutlined,
  ShoppingOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
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
    const orders = await OrdersClient.getAllByDays([today], 0, 100);

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
    const { statistics } = this.state;
    const daysToQuery: number[] = [];

    const currentDate = moment();
    const weekStart = currentDate.clone().startOf('isoWeek');

    const ordersByWeek: Record<string, IGraphData> = {};
    for (let i = 0; i <= 6; i += 1) {
      const dayOfWeek = moment(weekStart).add(i, 'days');
      const day = dayOfWeek.date();
      ordersByWeek[day] = {
        xAxis: dayOfWeek.format('ddd DD'),
        value: 0,
        acumulated: 0,
      };
      daysToQuery.push(day);
    }

    const orders = await OrdersClient.getAllByDays(daysToQuery, 0, 1000);

    orders.data.forEach((order: IOrder) => {
      // Order the list by day
      const day = moment(order.created_at).add(-1, 'h').date();
      if (!ordersByWeek[day]) {
        console.error(`day ${day} is not in the array`);
        return;
      }

      const item = ordersByWeek[day];
      item.value += order.amount;
    });

    const graph_data: IGraphData[] = [];
    Object.keys(ordersByWeek).forEach((key) => {
      const item = ordersByWeek[key];

      statistics.amount += item.value;
      item.acumulated = statistics.amount;

      graph_data.push(item);
    });

    // Get the last day for accumulated
    statistics.acumulated = ordersByWeek[currentDate.date()].value;
    statistics.total = orders.total;

    this.setState({
      view_mode: 'GRAPH_WEEK',
      orders,
      graph_data,
      statistics,
    });
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
            <List
              itemLayout="horizontal"
              className={styles.layout__sider__content__list}
            >
              {orders!.data.map((order: IOrder) => {
                return (
                  <List.Item
                    onClick={() => this.onOrderClickHandler(order)}
                    actions={[
                      <span
                        className={
                          styles.layout__sider__content__list__item__price
                        }
                      >
                        {NumberFormatter.toCurrency(order.amount)}
                      </span>,
                    ]}
                  >
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
                          &nbsp;
                          <span>
                            {order.product_quantity === 1
                              ? localize('product_item_text_singular')
                              : localize('product_item_text_plural')}
                          </span>
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
          </Layout.Content>
        </Layout.Sider>
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
                    // localize('segmented_month'),
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
                    prefix={<ArrowUpOutlined />}
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
                    color="#ff4d4f"
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
        {this.render_ORDER_LIST()}
      </>
    );
  };

  render_GRAPH_WEEK = () => {
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
                  value={localize('segmented_week')}
                  options={[
                    localize('segmented_today'),
                    localize('segmented_week'),
                    // localize('segmented_month'),
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
                    title={localize('statistics_week_sales')}
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
                    title={localize('statistics_week_accumulated')}
                    value={statistics.acumulated}
                    precision={0}
                    prefix={<ArrowUpOutlined />}
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
                    color="#ff4d4f"
                    tooltip={{
                      title: (title: string) => {
                        return `${title}`;
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
        {this.render_ORDER_LIST()}
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
            <Skeleton.Input block active />
          </Layout.Header>
          <Layout.Content style={{ padding: 24 }}>
            <Skeleton avatar active paragraph={{ rows: 1 }} />
            <Skeleton avatar active paragraph={{ rows: 1 }} />
            <Skeleton avatar active paragraph={{ rows: 1 }} />
            <Skeleton avatar active paragraph={{ rows: 1 }} />
            <Skeleton avatar active paragraph={{ rows: 1 }} />
            <Skeleton avatar active paragraph={{ rows: 1 }} />
            <Skeleton avatar active paragraph={{ rows: 1 }} />
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

import React from 'react';
import {
  Avatar,
  Button,
  Card,
  Layout,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  notification,
} from 'antd';
import {
  EditOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import IPouchDbResponse from 'renderer/lib/IPouchDbResponse';
import OrdersClient, { IOrder } from 'renderer/clients/OrdersClient';

import NumberFormatter from 'renderer/lib/formatters/NumberFormatter';
import IJwtEntity from 'renderer/models/IJwtEntity';
import OrderDetailModal from 'renderer/components/order-detail-modal';
import EventStreamer from 'renderer/lib/EventStreamer';
import styles from './index.module.css';
import i18n from '../../lib/i18n';
import locales from './locales';

const localize = i18n(locales);
interface IState {
  view_mode: 'LOADING' | 'PENDINGS_LOADED';
  datasource: IPouchDbResponse<IOrder> | undefined;
  total_amount: number;
  total_pendings: number;
  show_order_detail: boolean;
  order_detail_data: IOrder | undefined;
}

export default class PendingsPage extends React.Component<{}, IState> {
  state: IState = {
    view_mode: 'LOADING',
    datasource: undefined,
    total_amount: 0,
    total_pendings: 0,
    show_order_detail: false,
    order_detail_data: undefined,
  };

  componentDidMount() {
    this.getPendingsOrders();
    EventStreamer.on('PENDINGS:CHANGED', this.onPendingsChangedEventHandler);
  }

  componentWillUnmount() {
    EventStreamer.off('PENDINGS:CHANGED', this.onPendingsChangedEventHandler);
  }

  onPendingsChangedEventHandler = async (updatedOrder: IOrder) => {
    console.log(updatedOrder);
    notification.success({
      message: localize('update_notification_message'),
      description: localize('update_notification_description'),
      placement: 'bottomLeft',
    });

    this.getPendingsOrders();
  };

  onCloseDetailModalHandler = async () => {
    this.setState({
      show_order_detail: false,
      order_detail_data: undefined,
    });
  };

  onItemEditHandler = async (order: IOrder) => {
    this.setState({
      show_order_detail: true,
      order_detail_data: order,
    });
  };

  async getPendingsOrders() {
    let { total_amount, total_pendings } = this.state;
    const results = await OrdersClient.getPendings(0, 100);

    total_amount = 0;
    total_pendings = results.total;
    results.data.forEach((order: IOrder) => {
      total_amount += order.amount;
    });
    this.setState({
      view_mode: 'PENDINGS_LOADED',
      datasource: results,
      total_pendings,
      total_amount,
    });
  }

  render_LOADING = () => {
    return <div>Loading...</div>;
  };

  render_PENDINGS_LOADED = () => {
    const {
      datasource,
      total_amount,
      total_pendings,
      show_order_detail,
      order_detail_data,
    } = this.state;

    const columns = [
      {
        width: 80,
        title: localize('TABLE_USER'),
        dataIndex: 'user',
        key: 'name',
        align: 'center' as const,
        render: (user: IJwtEntity) => {
          return (
            <Tooltip title={user.unique_name} placement="right">
              <Avatar
                style={{ width: 'auto' }}
                shape="square"
                src={user.avatar}
              />
            </Tooltip>
          );
        },
      },
      {
        width: 90,
        title: localize('TABLE_PRODUCT_QUANTITY'),
        dataIndex: 'product_quantity',
        key: 'product_quantity',
        align: 'right' as const,
        render: (qty: number) => {
          return NumberFormatter.toNumber(qty);
        },
      },
      {
        width: 110,
        title: localize('TABLE_AMOUNT'),
        dataIndex: 'amount',
        key: 'amount',
        align: 'right' as const,
        render: (amount: number) => {
          return NumberFormatter.toCurrency(amount);
        },
      },

      {
        title: localize('TABLE_TAGS'),
        dataIndex: 'tags',
        key: 'tags',
        width: 400,
        render: (tagLine: string) => {
          const tags = tagLine.split(',');
          return (
            <>
              {tags.map((tag: string) => {
                return (
                  <Tag key={tag} style={{ marginBottom: 6 }} color="blue">
                    {tag}
                  </Tag>
                );
              })}
            </>
          );
        },
      },
      {
        width: 230,
        title: localize('TABLE_DATE'),
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date: Date) => {
          return (
            <Tooltip
              title={moment(date).format(localize('TABLE_DATE_TEMPLATE'))}
              placement="left"
            >
              <i>{moment(date).fromNow()}</i>
            </Tooltip>
          );
        },
        ellipsis: true,
      },

      {
        title: '',
        key: 'action',
        align: 'center' as const,
        render: (item: IOrder) => {
          return (
            <Space size="middle">
              <Button
                onClick={() => this.onItemEditHandler(item)}
                shape="circle"
                danger
                type="link"
                icon={<EditOutlined />}
              />
            </Space>
          );
        },
      },
    ];

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
            <Table
              loading={!datasource}
              sticky
              pagination={{
                defaultPageSize: 10,
              }}
              onRow={(record) => {
                return {
                  onClick: () => this.onItemEditHandler(record),
                };
              }}
              style={{ borderRadius: 8 }}
              rowClassName={styles.layout_table_row}
              rowKey="_id"
              size="middle"
              columns={columns}
              dataSource={datasource ? datasource.data : []}
            />
          </Layout.Content>
        </Layout>
        <Layout.Sider width="250px" className={styles.layout__sider}>
          <Layout.Content>
            <Card
              className={styles.layout__sider__card}
              style={{ marginTop: 0 }}
            >
              <Statistic
                title={localize('statistics_total_pendings')}
                value={total_pendings}
                precision={0}
                prefix={<ClockCircleOutlined />}
                groupSeparator="."
                suffix=""
              />
            </Card>

            <Card className={styles.layout__sider__card}>
              <Statistic
                title={localize('statistics_pendings_sales')}
                value={total_amount}
                precision={0}
                prefix={<DollarCircleOutlined />}
                groupSeparator="."
                suffix=""
              />
            </Card>
          </Layout.Content>
        </Layout.Sider>
        {show_order_detail ? (
          <OrderDetailModal
            readOnly={false}
            order={order_detail_data!}
            onClose={this.onCloseDetailModalHandler}
          />
        ) : null}
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

import React from 'react';
import { AutoComplete, Button, Modal, Divider, Tag, Row, Col } from 'antd';
import ReminderIcon from '../../../../../assets/tags-icon.png';
import styles from './index.module.css';
import i18n from '../../../../lib/i18n';
import locales from '../../locales';

const localize = i18n(locales);

interface IProps {
  onCompleted: (tags: string) => {};
  onCancel: () => {};
}
interface IState {
  tags: string[];
  search_result: IOption[];
  search_value: string;
}

export default class PutTheNameModal extends React.Component<IProps, IState> {
  state: IState = {
    tags: [],
    search_result: [],
    search_value: '',
  };

  onCompletedModalClickHandler = async () => {
    const { tags } = this.state;
    const { onCompleted } = this.props;
    if (!onCompleted) return;

    const tag = tags.join(',').replaceAll(';', ':').trim();
    onCompleted(tag);
  };

  onCancelModalClickHandler = async () => {
    const { onCancel } = this.props;
    if (!onCancel) return;

    onCancel();
  };

  onAutoCompleteChangeHandler = async (value: string) => {
    this.setState({
      search_value: value,
    });
  };

  onAutoCompleteSelectHandler = async (value: string) => {
    const { tags } = this.state;
    tags.push(value);

    this.setState({
      search_value: '',
      tags,
    });
  };

  onAutoCompleteSearch = async (value: string) => {
    this.setState({
      search_result: [
        { value, label: value },
        // { value: 'light', label: 'Light' },
        // { value: 'bamboo', label: 'Bamboo' },
      ],
    });
  };

  onRemoveTagHandler = async (value: string) => {
    const { tags } = this.state;
    const newTags = tags.filter((item) => {
      return item !== value;
    });

    this.setState({
      tags: newTags,
    });
  };

  render() {
    const { tags, search_result, search_value } = this.state;

    return (
      <Modal
        visible
        centered
        footer={null}
        closable={false}
        className={styles.modal}
      >
        <Row className={styles.modal__header} justify="start">
          <Col span={19}>
            <Row className={styles.modal__header__title}>
              {localize('reminder_modal_title')}
            </Row>
            <Row className={styles.modal__header__subtitle}>
              {localize('reminder_modal_subtitle')}:
            </Row>
          </Col>
          <Col className={styles.modal__header__image} span={5}>
            <img style={{ width: 80 }} src={ReminderIcon} alt="reminder" />
          </Col>
        </Row>
        <div>
          <span className={styles.modal_autocomplete_label}>
            {localize('reminder_modal_autocomplete_label')}
          </span>
          <AutoComplete
            autoFocus
            style={{ width: '100%' }}
            options={search_result}
            size="large"
            placeholder="..."
            allowClear
            value={search_value}
            onSearch={this.onAutoCompleteSearch}
            onSelect={this.onAutoCompleteSelectHandler}
            onChange={this.onAutoCompleteChangeHandler}
          />
        </div>
        <Divider orientation="left">
          {localize('reminder_modal_autocomplete_divider')}
        </Divider>
        <div className={styles.modal_tags_content}>
          {tags.map((tag, index) => {
            const id = `${new Date().getTime()}_${index}`;
            return (
              <Tag
                className={styles.modal_tag}
                key={id}
                closable
                onClose={() => this.onRemoveTagHandler(tag)}
              >
                {tag}
              </Tag>
            );
          })}
        </div>
        <br />
        <Row justify="end">
          <Button
            disabled={tags.length === 0}
            type="primary"
            shape="round"
            onClick={() => this.onCompletedModalClickHandler()}
          >
            {localize('reminder_modal_save')}
          </Button>
          &nbsp;
          <Button
            type="link"
            danger
            onClick={() => this.onCancelModalClickHandler()}
          >
            {localize('reminder_modal_cancel')}
          </Button>
        </Row>
      </Modal>
    );
  }
}

interface IOption {
  value: string;
  label: string;
}

export interface ITag {
  _id: string;
  name: string;
}

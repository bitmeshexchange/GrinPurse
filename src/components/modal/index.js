'use strict';
import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.less';
import style from './index.less';

export default class InformationModal extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { visible, title, handleOk, handleCancel } = this.props;
        return (
            <Modal
                title={title}
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>{this.props.cancel ? this.props.cancel : '取消'}</Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>{this.props.confirm ? this.props.confirm : '确认'}</Button>
                ]}
            >
                {this.props.render ? this.props.render() : ''}
            </Modal>
        );
    }
}

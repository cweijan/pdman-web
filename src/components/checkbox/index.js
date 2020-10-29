import React from 'react';

import { Checkbox as ACheckBox } from 'antd';

import './style/index.less';

export default class Checkbox extends React.Component{
  _onChange = (e) => {
    const { onChange } = this.props;
    onChange && onChange({
      ...e,
      target: {
        ...e.target,
        value: e.target.checked,
      },
    });
  };
  _onBlur = (e) => {
    const { onBlur } = this.props;
    onBlur && onBlur(e);
  };
  _onClick = (e) => {
    e.stopPropagation();
    const { onClick } = this.props;
    onClick && onClick(e);
  };
  _onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  render() {
    const { prefix = 'pdman', style, wrapperStyle, value = false, title, disabled = false } = this.props;
    return (
      <ACheckBox
        disabled={disabled}
        draggable
        onDragStart={this._onDragStart}
        type="checkbox"
        onBlur={this._onBlur}
        className={`${prefix}-checkbox`}
        onChange={this._onChange}
        onClick={this._onClick}
        value={value}
        checked={value}
        title={title}
      />
    );
  }
}

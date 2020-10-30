
import React from 'react';

// import './style/index.less';

import { Select } from 'antd';

const { Option } = Select;

class Index extends React.Component {

  convertToEvent = (value) => ({
    target:{
      value
    }
  })

  _onBlur = (value) => {
    const { onBlur } = this.props;
    onBlur && onBlur(this.convertToEvent(value));
  };
  _onChange = (value) => {
    const { onChange } = this.props;
    console.log(this.convertToEvent(value))
    onChange && onChange(this.convertToEvent(value));
  };
  _onDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  render() {
    const { defaultValue, prefix = 'pdman', style, children, value, onChange } = this.props;
    return (
      <Select
        draggable
        onDragStart={this._onDragStart}
        className={`${prefix}-select`}
        style={style}
        defaultValue={defaultValue}
        value={value}
        onChange={this._onChange}
        onBlur={this._onBlur}
      >
        {children.map(opt => (<Option key={opt.key} value={opt.props.value}>{opt.props.children}</Option>))}
      </Select>
    );
  }
}

export default Index;


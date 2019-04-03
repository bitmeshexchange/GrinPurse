'use strict';
import { Component } from 'react';
import PropTypes from 'prop-types';

export default class Bundle extends Component {

  state = {
    // short for "module" but that's a keyword in js, so "mod"
    mod: null
  }

  componentWillMount() {
    this.load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps);
    }
  }

  load(props) {
    this.setState({
      mod: null
    });
    this._load(props);
  }

  _load(props) {
    props.load((mod) => {
      const exports = mod.default ? mod.default : mod;
      this.setState({
        // handle both es imports and cjs
        mod: exports
      });
    });
  }

  render() {
    if (!this.state.mod)
      return false;
    return this.props.children(this.state.mod);
  }
}

Bundle.propTypes = {
  load: PropTypes.func,
  children: PropTypes.func,
};

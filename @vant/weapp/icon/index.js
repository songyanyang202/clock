'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var component_1 = require('../common/component');
component_1.VantComponent({
  props: {
    dot: Boolean,
    info: null,
    size: null,
    infoStyle: String,
    color: String,
    customStyle: String,
    classPrefix: {
      type: String,
      value: 'van-icon',
    },
    name: String,
  },
  methods: {
    onClick: function () {
      this.$emit('click');
    },
  },
});
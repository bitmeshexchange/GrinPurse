'use strict';
import qs from 'querystringify';

const location = window.location;
const { hostname, protocol, href, search } = location;
export const query = qs.parse(search);
export const version = '0.0.2';

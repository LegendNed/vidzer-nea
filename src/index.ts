require('dotenv').config();

import { connect } from './handlers/database';
connect();


import Express from './handlers/express';
new Express()
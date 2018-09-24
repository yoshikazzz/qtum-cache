import express = require('express');
import { App } from './application';
import Config from './config/config';

let config = new Config();
let app = new App(express(), config);

app.run();

console.info(`listening on ${config.port}`);

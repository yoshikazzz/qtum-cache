let path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

export default class Config {
  constructor(
    public root?: string,
    public port?: string,
    public host?: string,
    public databseSetting?: any,
    public database?: any
  ) {
    this.root = rootPath;
    this.port = process.env.PORT || '3001';
    this.databseSetting = {
      connectionString: ''
    };

    process.on('uncaughtException', (err: any) => {
      console.log(err);
    });
  }
}

'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://localhost/posts';
exports.PORT = process.env.PORT || 8000;

//FirstUser:FirstUser@ds049945.mlab.com:49945/blogpost2'
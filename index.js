const Hapi = require('hapi');
const server = new Hapi.Server({
    connections: {
        routes: {
            cors: true
        }
    }
});
const search = require('./search');
server.connection({ port: 4002 });
server.route(search);
server.start((err) => {
    if (err)
        throw err;
    console.log(`api running at ${server.info.uri}`);
});


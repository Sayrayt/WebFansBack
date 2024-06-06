const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
const bodyParser = require('body-parser');

const CONFIG = require('./config');
const { PORT, MEDIATOR, DB_CONFIG, SOCKETS } = CONFIG;

const Common = require('./application/modules/common/Common');
const Mediator = require('./application/modules/Mediator');
const DB = require('./application/modules/DB/DB');
const UserManager = require('./application/modules/UserManager/UserManager');
const ChatManager = require('./application/modules/ChatManager/ChatManager');
const FileManager = require('./application/modules/FileManager/FileManager');
const PublicationManager = require('./application/modules/PublicationManager/PublicationManager');

const mediator = new Mediator({ ...MEDIATOR });
const db = new DB({ ...DB_CONFIG, initCB });
const common = new Common;
new ChatManager({ mediator, io, db, common, SOCKETS });
new UserManager({ mediator, io, db, common, SOCKETS });
new FileManager({ mediator, io, db, common,  SOCKETS });
const publications = new PublicationManager({ mediator, io, db, common,  SOCKETS });


const Router = require('./application/routers/Router');
const Publication = require('./application/modules/PublicationManager/Publication');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(new Router({ mediator }));

//fsdfsdfsdf

function initCB() {
    mediator.call(MEDIATOR.EVENTS.ON_DATABASE_INIT, '');
}

server.listen(PORT, () => console.log('Server is up'));

exports.PublicationTestModule = publications;

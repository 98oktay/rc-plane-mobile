import net from "react-native-tcp";

class ConnectionManager {
    status = "";
    servers = [];
    events = {};

    _selectedServer = {};
    _socket = null;
    _lastDataTime = 0;
    _connectionLostTimer = null;
    _changeServerTimer = null;
    _timers = {};
    _timersEnd = {};

    setServers = servers => {
        this.servers = servers;
    }

    start = () => {
        this._connect();
    }

    eventTrigger = (event, value) => {
        if (this.events[event]) {
            this.events[event](value)
        }
    }

    on =(event, callback) => {
        this.events[event] = callback;
    }

    emit = (event, value) => {
        if (this._socket) {
            try {
                this._socket.write(JSON.stringify({
                  event,
                  value
                }) + "\n");
              } catch(e) {
              }
        }
    }

    emitTimer = (event, value) => {
        if (this._timers[event]) {
          clearInterval(this._timers[event])
        }
        if (this._timersEnd[event]) {
          clearTimeout(this._timersEnd[event])
        }
        this.emit(event, value);
        this._timers[event] = setInterval(() => {
          this.emit(event, value);
        }, 10);
        this._timersEnd[event] = setTimeout(() => {
          if (this._timers[event]) {
            clearInterval(this._timers[event])
          }
        }, 1500);
      }

    _setStatus(status) {
        this.status = status;
        this.eventTrigger("statusChange", status);
        console.log("STATUS CHANGED:", status);
    }

    _reconnect() {
        if (this._socket) {
            this._socket.destroy();
            this._socket = null;
        }
        this._connect();
    }

    _connect() {
        if (!this._selectedServer.host) {
            // todo select server
            this._selectedServer = this.servers[0];
        }
        this._setStatus("CONNECTING");
        try {
            this._socket = net.createConnection({ host: this._selectedServer.host, port: this._selectedServer.port, timeout: 1000 }, () => {
                if (this._reConnectTimer) {
                    clearTimeout(this._reConnectTimer);
                }
                if(this._changeServerTimer) {
                    clearTimeout(this._changeServerTimer);
                }
                this._setStatus("CONNECTED");
                this._attachSocketEvents();
            });
        } catch(e) {

        }

        this._socket.on("error", (err) => {
            console.log(err)
        });

        this._socket.on("timeout", () => {
            this._setStatus("TIMEOUT");
            if(this._changeServerTimer) {
                clearTimeout(this._changeServerTimer);
            }
            this._changeServerTimer = setTimeout(()=>{
                this._nextServer();
                this._reconnect();
            },4000);
        })
    }

    _nextServer() {
        var shiftedServer = this.servers.shift();
        this.servers.push(shiftedServer);
        this._selectedServer = this.servers[0];
        this._setStatus("SRVCHANGED");
    }

    _attachSocketEvents() {
        this._socket.on("data", () => {
            let lltime = this._lastDataTime;
            this._lastDataTime = (new Date()).valueOf();

            if (this._connectionLostTimer) {
                clearTimeout(this._connectionLostTimer);
            }
            this._connectionLostTimer = setTimeout(this._connectionLost.bind(this), 1000)
        })
    }

    _connectionLost() {
        this._setStatus("LOST");
        if (this._socket) {
            this._socket.destroy();
            this._socket = null;
        }
        this._reconnect();
    }

}
export default new ConnectionManager();

let requests = [];
function live(url) {
    self = this;
    this.liveID = null;
    this.connected = false;
    let handshake = null;
    let events = [];
    let callbacks = [];
    let last = null;
    
    let stopped = false;

    //Ajax
    function ajax(json) {
        var data = json;
        var url = data.url;
        var type = data.type;
        var params = data.params.toString();

        if (window.XMLHttpRequest) {
            // code for modern browsers
            xhr = new XMLHttpRequest();
        } else {
            // code for old IE browsers
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (type.toLowerCase() == "get") {
            xhr.open(type, url, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send();
        } else if (type.toLowerCase() == "post") {
            xhr.open(type, url, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(params);
        } else {
            throw ("Can only take GET and POST");
        }
        xhr.onload = function() {
            if (xhr.status == 200) {
                if (data.success != undefined) {
                    data.success(xhr.responseText);
                } else {
                    try {
                        let json = JSON.parse(xhr.responseText);
                        //console.log(json);
                        if (events.includes(json.event)) {
                            let index = events.indexOf(json.event);
                            callbacks[index](json.data);
                        }
                    } catch (e) {
                        if (events.includes("error")) {
                            let index = events.indexOf("error");
                            callbacks[index]("Error Parsing Response");
                        }
                    }
                    //restart polling
                    //start();
                }
            }
        }
        xhr.onerror = function() {
            if (data.error != undefined) {
                data.error(xhr.responseText);
            }
        }
    }
    function poll() {
        let listen = {
            liveID: self.liveID,
            command: "listen",
        }
        listen = JSON.stringify(listen);

        if (window.XMLHttpRequest) {
            // code for modern browsers
            xh = new XMLHttpRequest();
        } else {
            // code for old IE browsers
            xh = new ActiveXObject("Microsoft.XMLHTTP");
        }
        requests.push(xh);

        xh.timeout = 10000000;
        xh.open("GET", url + "?liveJS=" + listen);
        xh.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xh.send();

        xh.ontimeout = function() {
            if (!stopped) {
                poll();
            }
        }

        xh.onload = function() {
            if (xh.status == 502) {
                // Status 502 is a connection timeout error,
                // may happen when the connection was pending for too long,
                // and the remote server or a proxy closed it
                // let's reconnect
                poll();
            } else if (xh.status != 200) {
                // An error - let's show it
                // console.warn(response.statusText);
                // Reconnect in one second
                new Promise(resolve=>setTimeout(resolve, 1000));
                if (!stopped) {
                    poll();
                }
            } else {
                // Get and show the message
                let message = xh.responseText;
                //console.log(message);
                try {
                    let json = JSON.parse(message);
                    if (events.includes(json.event)) {
                        let index = events.indexOf(json.event);
                        callbacks[index](json.data);
                    }
                } catch (e) {}
                // Call poll() again to get the next message
                try {
                    if (!stopped) {
                        poll();
                    }
                } catch (e) {
                    if (events.includes("error")) {
                        let index = events.indexOf("error");
                        callbacks[index](e);
                    }
                }

            }
        }

    }
    this.connect = function() {
        let rand = Math.floor(Math.random() * 1000000000);
        self.liveID = rand;
        let hand = {
            liveID: self.liveID,
            command: "handshake",
        }
        //handshake
        ajax({
            url: url + "?liveJS=" + JSON.stringify(hand),
            type: "GET",
            params: "",
            success: function(res) {
                console.log(res);
                if (res == "200") {
                    self.connected = true;
                    stopped = false;
                    if (events.includes("connect")) {
                        let index = events.indexOf("connect");
                        callbacks[index]("success");
                    }
                    //start polling
                    poll();
                } else {
                    if (events.includes("error")) {
                        let index = events.indexOf("error");
                        callbacks[index]("Error while attempting handshake");
                    }
                }
            }
        })
    }
    this.on = function(event, callback) {
        events.push(event);
        callbacks.push(callback);
    }
    this.emit = function(event, data) {
        //Stop poll to allow this request go through
        stop();

        let obj = {
            liveID: self.liveID,
            command: "event",
            event: event,
            data: data,
        }
        obj = JSON.stringify(obj);
        ajax({
            url: url + "?liveJS=" + obj,
            type: "GET",
            params: "",
        });
    }
    function stop() {
        this.stopped = true;
        try {
            requests.forEach(function(request) {
                request.abort();
            })
        } catch (e) {
        }
    }
    function start() {
        this.stopped = false;
        this.connected = true;
        poll();
    }
    //connect
    self.connect();
}

//Export for use with NodifyJS
try {
    module.exports = live;
} catch (e) {}

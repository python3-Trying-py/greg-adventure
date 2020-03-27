const http = require("http")
const serveStatic = require("serve-static")
const finalhandler = require("finalhandler")
const WebSocket = require("ws")
const url = require('url');
const packet = require("./libs/packet.js")
const main = require("./main.js")

let egg = 100
let egg2 = -100

let level = main.level

setInterval(function() {
    egg = Math.floor(Math.random() * Math.floor(100))
    egg2 = Math.floor(Math.random() * Math.floor(100))
    level["entities"] = [{"name": "cheezethem.png", "x": egg, "y": egg2, "scale": 1, "dynamic": true}]
}, 100)
setInterval(function() {
    level["players"] = {}
}, 10000)

var serve = serveStatic(__dirname, {"index": ["index.html"]})

var server = http.createServer()

const wss = new WebSocket.Server({noServer: true})

wss.on("connection", function(ws) {
    ws.on("message", function (message) {
        let msg = JSON.parse(message)
        switch (msg["type"]) {
            case "sync":
                setInterval(function() {ws.send(packet.buildpacket({"shortcut": "sync", "gamestate": level}))}, 30)
                break
            case "move":
                level["players"][msg["id"]] = {"x": msg["x"], "y": msg["y"]}
                break
            case "getid":
                let id = Math.floor(Math.random() * Math.floor(999999))
                console.log(id)
                ws.send(packet.buildpacket({"shortcut": "setid", "id": id}))
                ws.close()
                break
            default:
                ws.close()
                break
        }
    })
})

server.on("request", function (req, res) {
    serve(req, res, finalhandler(req, res))
})

server.on("upgrade", function (request, socket, head) {
    const pathname = url.parse(request.url).pathname;

    wss.handleUpgrade(request, socket, head, function (ws) {
        wss.emit("connection", ws, request)
    })
})

server.listen(8080)
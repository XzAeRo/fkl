#!/usr/bin/env node
import WebSocket from 'ws';

// set api keys as global variables
const API_KEY_RITOQUE = "cHJva2FydGluZ3JpdG9xdWU6ODdkNmQ0OTgtZjY5NS00NzEyLWFmZjMtY2ZlYjJiNzU3YWQ1";
const API_KEY_LIMACHE = "eHRyZW1la2FydGNlbnRlcjoyZGYzNjA1My1kMzNjLTQ1ZjEtYmFlZS02ZDVjYWYzNWUyMjY%3d";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0";

/**
 * Class to handle the connection info to the API
 * @param {string} apiKey - The API key to use
 * @param {string} data - The
 */
class ConnectionInfo {
  constructor(apiKey) {
    this.apiKey         = apiKey;
  }

  /**
   * Fetch the connection info from the API
   * @returns {Promise} - The promise of the fetch
   * @throws {Error} - If the fetch fails
   */
  async fetch() {
    // setup the fetch
    let url = "https://backend.sms-timing.com/api/connectioninfo?type=modules";
    let headers = {
      'Authorization': 'Basic ' + this.apiKey,
      'User-Agent': USER_AGENT
    };

    let config = {
      method: 'GET',
      headers: headers,
      redirect: 'follow',
      cache: 'no-cache',
    };


    // fetch the connection info
    const response = await fetch(url, config).then(response => {
      if (!response.ok) {
        throw new Error("Error fetching connection info. Error code: " + response.status + " - " + response.statusText);
      }
      return response;
    });

    return response;
  }
}

class WebsocketInfo {
  constructor(connectionInfo) {
    this.connectionInfo = connectionInfo;
  }

  async fetch() {
    let url = "https://" + this.connectionInfo.ServiceAddress + "/api/livetiming/settings/" + this.connectionInfo.ClientKey + "?locale=en-US&styleId=&resourceId=&accessToken=" + this.connectionInfo.AccessToken
    let headers = {
      'User-Agent': USER_AGENT
    };

    let config = {
      method: 'GET',
      headers: headers,
      redirect: 'follow',
      cache: 'no-cache',
    };

    console.debug("Fetching websocket info from: " + url);

    const response = await fetch(url, config).then(response => {
      if (!response.ok) {
        throw new Error("Error fetching websocket info. Error code: " + response.status + " - " + response.statusText);
      }

      return response;
    });

    return response;
  }
}

class LiveTiming {
  constructor(websocketInfo) {
    this.websocketInfo = websocketInfo;
    this.ws = null;
    this.connectionRetries = 0;
    this.maxConnectionRetries = 5;
    this.connect = this.connect.bind(this);
    this.pingTimeout = null;
  }

  startCommand() {
    console.log("Sending start command");
    this.ws.send("START " + this.websocketInfo.liveServerKey);
  }

  heartbeat() {
    console.log("(Re)starting heartbeat");
    clearTimeout(this.pingTimeout);

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    this.pingTimeout = setTimeout(() => {
      console.log("Timeout reached");
      this.reconnectionHandler();
    }, 60000 + 5000);
  }

  reconnectionHandler() {
    if (this.connectionRetries < this.maxConnectionRetries) {
      this.connectionRetries++;
      console.log("Reconnecting to websocket. Retries: " + this.connectionRetries);
      this.connect();
    } else {
      console.error("Max connection retries reached. Exiting");
      this.ws.terminate();
      process.exit(1);
    }
  }

  async connect() {
    let url = "wss://" + this.websocketInfo.liveServerHost + ":" + this.websocketInfo.liveServerWssPort + "/";
    console.log("Connecting to websocket: " + url);
    this.ws = new WebSocket(url);

    // after opening the connection, send the start command
    this.ws.on('open', () => {
      console.log("Connection opened");
      this.startCommand();
      this.heartbeat();
    });
    this.ws.on('error', () => {
      console.error("Connection error");
      this.reconnectionHandler();
    });

    this.ws.on('ping', () => {
      console.log("Ping received");
      this.heartbeat();
    });

    this.ws.on('close', () => {
      console.log("Connection closed");
      // try to reconnect
      this.reconnectionHandler();
    });

    this.ws.on('message', (data) => {
      console.log("Message received: " + data);
      this.heartbeat();
    });
  }
}


// create main function to run the code and close it only on CTRL+C
async function main() {
  try {
    let connectionInfo = new ConnectionInfo(API_KEY_RITOQUE);
    let response = await connectionInfo.fetch();
    let connectionInfoData = await response.json();
    console.log("Connection info fetched: ", connectionInfoData);

    let websocketInfo = new WebsocketInfo(connectionInfoData);
    response = await websocketInfo.fetch();
    let websocketInfoData = await response.json();
    console.log("Websocket info fetched: ", websocketInfoData);

    let liveTiming = new LiveTiming(websocketInfoData);
    liveTiming.connect();
  } catch (error) {
    console.error(error);
  }
}

// run the main function
main();

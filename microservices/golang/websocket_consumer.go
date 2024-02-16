package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
)

const keyRitoque = "cHJva2FydGluZ3JpdG9xdWU6ODdkNmQ0OTgtZjY5NS00NzEyLWFmZjMtY2ZlYjJiNzU3YWQ1"

type ConnectionInfo struct {
	ClientKey      string `json:"ClientKey"`
	ServiceAddress string `json:"ServiceAddress"`
	AccessToken    string `json:"AccessToken"`
}

type WebsocketInfo struct {
	ServerKey      string `json:"liveServerKey"`
	ServerHost     string `json:"liveServerHost"`
	ServerWsPort   int    `json:"liveServerWsPort"`
	ServerWssPort  int    `json:"liveServerWssPort"`
	ServerHttpPort int    `json:"liveServerHttpPort"`
}

// getConnectionInfo fetches the connection info from BMI Services.
// It sends a GET request to the specified URL with basic authentication using the keyRitoque constant.
// It reads the response body, parses it into a ConnectionInfo struct, and returns it.
func getConnectionInfo() ConnectionInfo {
	url := "https://backend.sms-timing.com/api/connectioninfo?type=modules"

	// GET request to url with basic auth
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatal(err)
	}
	req.Header.Set("Authorization", "Basic "+keyRitoque)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	// read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	//fmt.Println(string(body))

	// parse the response body
	var connectionInfo ConnectionInfo
	err = json.Unmarshal(body, &connectionInfo)
	if err != nil {
		log.Fatal(err)
	}

	return connectionInfo
}

func getWebsocketInfo(connectionInfo ConnectionInfo) WebsocketInfo {
	// build the url using the connection info
	url := "https://" + connectionInfo.ServiceAddress + "/api/livetiming/settings/" + connectionInfo.ClientKey + "?locale=en-US&styleId=&resourceId=&accessToken=" + connectionInfo.AccessToken
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Fatal(err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	// read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	//fmt.Println(string(body))

	// parse the response body
	var websocketInfo WebsocketInfo
	err = json.Unmarshal(body, &websocketInfo)
	if err != nil {
		log.Fatal(err)
	}

	return websocketInfo
}

func readWebsocketData(websocketInfo WebsocketInfo) {
	// connect to the websocket

}

func main() {
	logger := log.New(os.Stdout, "INFO: ", log.LstdFlags|log.Lshortfile)

	logger.Println("Obtaining connection info...")
	var connectionInfo = getConnectionInfo()

	logger.Println("Obtaining websocket info...")
	var websocketInfo = getWebsocketInfo(connectionInfo)

	logger.Println("ServerKey: ", connectionInfo.ClientKey)
	logger.Println("ServerHost: ", websocketInfo.ServerHost)
}

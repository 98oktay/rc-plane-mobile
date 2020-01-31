/**
 * RC Plane Control APP
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {AppState, DeviceEventEmitter, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import globalStyle from './styles/globalStyle'
import AxisPad from '../react-native-axis-pad/';
import ConnectionManager from './ConnectionManager';
import DialogInput from 'react-native-dialog-input';
import Orientation from 'react-native-orientation';
import WifiManager from "react-native-wifi-reborn";

const WifiSSID = "RC-Plane";
const servers = [
    {
        host: "192.168.4.1",
        port: "8888",
        reConnect: true
    }
];
ConnectionManager.setServers(servers);


const pwmVal = (x) => {
    return Math.floor((1 + x) * 128) / 256;
};

export default class App extends Component {

    anglesData = {
        pitch: 0,
        roll: 0,
        yaw: 0,
        raw_pitch: 0,
        raw_roll: 0,
        raw_yaw: 0,
    };

    calibrate = {
        pitch: 0,
        roll: 0,
        yaw: 0,
    };

    state = {
        value: 0,
        chatter: ["CONNECTING..."],
        direction: 0,
        yaw_diff: 0,
        pitch: 0,
        roll: 0,
        yaw: 0,
        raw_pitch: 0,
        raw_roll: 0,
        raw_yaw: 0,
        yaw_rate: 1,
        pitch_rate: 1,
        roll_rate: 1,
        usePitch: true,
        status: "",
        gear: 1,
        appState: "",
        isHostInputVisible: false
    };

    timeOutTimer = null;
    lastStatusTimer = null;
    gears = [1, 2, 3, 4, 5];

    setGear(gear) {
        this.setState({
            gear
        })
    }

    updateChatter(msg) {
        this.setState({
            chatter: this.state.chatter.concat([msg])
        });
    }

    _openHostInput = () => {

        this.setState({
            isHostInputVisible: true
        })
    };

    _setNewHost = (input) => {
        this.setState({
            isHostInputVisible: false
        });
        if (input) {
            ConnectionManager.setServers([
                {
                    host: input,
                    port: "8080",
                    reConnect: true
                }
            ]);
            this.connectWifi();
        }

    };

    constructor(props) {
        super(props);
        this.updateChatter = this.updateChatter.bind(this);
        this._calibrate = this._calibrate.bind(this);
        this.setGear = this.setGear.bind(this);

        /*
        if (Platform.OS === 'ios') {
          DeviceAngles.setDeviceMotionUpdateInterval(0.05);
          DeviceAngles.startMotionUpdates();
        } else {
          SensorManager.startOrientation(1000 / 60);
        }
        */
    }

    num_0_360(num) {
        return (num + 360) % 360;
    }


    num_multipler(num, rate) {
        const d = num > 180 ? -(360 - num) : num;
        return this.num_0_360(d * rate);
    }

    _calibrate() {
        this.setState({
            usePitch: !this.state.usePitch
        });
        this.calibrate = {
            pitch: this.state.raw_pitch,
            roll: this.state.raw_roll,
            yaw: this.state.raw_yaw,
        };
    }

    _handleAppStateChange = (nextAppState) => {
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {

            console.log('App has come to the foreground!');
        } else if (this.state.appState === "background") {

        }
        this.setState({appState: nextAppState});
    };

    connectWifi = () => {
        WifiManager.getCurrentWifiSSID().then(ssid => {
                if (ssid !== WifiSSID) {
                    WifiManager.connectToSSID(WifiSSID).then(() => {
                        ConnectionManager.start();
                    }, (err) => {
                        alert(JSON.stringify(err))
                    });
                } else {
                    ConnectionManager.start();
                }
            },
            (err) => {
                alert("Wifi Access Error!")
            }
        );
    };

    _disconnectWifi = () => {
        WifiManager.getCurrentWifiSSID().then(ssid => {
            if (ssid === WifiSSID) {
                WifiManager.disconnectFromSSID(WifiSSID);
            }
        });
    };

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        this.connectWifi();

        ConnectionManager.on("statusChange", (status) => {
            this.updateChatter(status);
            if (this.lastStatusTimer) {
                clearTimeout(this.lastStatusTimer);
            }
            this.lastStatusTimer = setTimeout(() => {
                this.setState({
                    status
                });
            }, 1000)
        });

        DeviceEventEmitter.addListener('AnglesData', (data) => {

            const pitch = this.num_0_360(data.pitch);
            const roll = this.num_0_360(data.roll);
            const yaw = this.num_0_360(data.yaw);

            this.anglesData = {
                raw_pitch: pitch,
                raw_roll: roll,
                raw_yaw: yaw,
                pitch: this.num_multipler(this.num_0_360(pitch - this.calibrate.pitch), this.state.pitch_rate),
                roll: this.num_multipler(this.num_0_360(roll - this.calibrate.roll), this.state.roll_rate),
                yaw: this.num_multipler(this.num_0_360(yaw - this.calibrate.yaw), this.state.yaw_rate),
            };
        });

        this._calibrate();

        setInterval(() => {

            this.setState({
                ...this.anglesData
            });

            if (this.state.usePitch) {
                ConnectionManager.emitTimer("driveDirection", Math.min(1, Math.max(-1, Math.sin((this.anglesData.pitch / 180) * Math.PI) * 4)));
            }
        }, 1000 / 30);

    }

    render() {
        if (this.state.isHostInputVisible) {
            Orientation.lockToPortrait();
        } else {
            Orientation.lockToLandscape();
        }
        return (
            <View style={[globalStyle.container, {
                backgroundColor: this.state.status === "CONNECTED" ? "#448833" : "#222222"
            }]}>
                <View style={globalStyle.toolBar}>
                    <View>
                        {this.state.status === "CONNECTED" ? <TouchableOpacity
                            style={[globalStyle.gyroButton, this.state.usePitch ? globalStyle.activeButton : {}]}
                            onPress={this._disconnectWifi}><Text style={globalStyle.gyroButtonText}>DISCONNECT
                            WIFI</Text>
                        </TouchableOpacity> : <TouchableOpacity
                            style={[globalStyle.gyroButton, this.state.usePitch ? globalStyle.activeButton : {}]}
                            onPress={this._openHostInput}><Text style={globalStyle.gyroButtonText}>HOST
                            SET</Text></TouchableOpacity>}
                        <View style={globalStyle.gearButtons}>
                            {this.gears.map((item, key) => <TouchableOpacity key={key}
                                                                             style={[globalStyle.gearButton, this.state.gear === item ? globalStyle.activeButton : {}]}
                                                                             onPress={() => this.setGear(item)}>
                                <Text style={globalStyle.gearButtonText}>{item}</Text>
                            </TouchableOpacity>)}
                        </View>
                    </View>
                </View>
                <View style={globalStyle.controlContent}>
                    <AxisPad
                        size={260}
                        backgroundSource={require("./images/joystick-bg-v.png")}
                        resetOnRelease={false}
                        autoCenter={true}
                        handlerStyle={{backgroundColor: "#ffffffaa"}}
                        onValue={({y, x}) => {
                            ConnectionManager.emitTimer("throttle", pwmVal(y));
                            ConnectionManager.emitTimer("rudder", pwmVal(x));
                        }}/>
                    <AxisPad
                        size={220}
                        backgroundSource={require("./images/joystick-bg-h.png")}
                        resetOnRelease={true}
                        handlerStyle={{backgroundColor: "#ffffffaa"}}
                        autoCenter={true}
                        onValue={({x, y}) => {
                            ConnectionManager.emitTimer("elevator", pwmVal(y));
                            ConnectionManager.emitTimer("aileron", pwmVal(x));
                        }}/>
                </View>
                <View style={globalStyle.statusBar}>
                    <ScrollView style={globalStyle.logScroll}>
                        {this.state.chatter.slice(-3).map((msg, index) => {
                            return (
                                <Text style={globalStyle.logText} key={index}>{msg}</Text>
                            );
                        })}
                    </ScrollView>
                </View>
                <DialogInput isDialogVisible={this.state.isHostInputVisible}
                             title={"Server Config"}
                             message={"Set server ip/hostname"}
                             hintInput={"192.168...."}
                             initValueTextInput={servers[0].host}
                             submitInput={(inputText) => {
                                 this._setNewHost(inputText)
                             }}
                             closeDialog={() => {
                                 this.setState({
                                     isHostInputVisible: false
                                 })
                             }}>
                </DialogInput>
            </View>
        );
    }
}



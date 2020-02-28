import React from 'react';
import { NetInfo, StyleSheet, ToastAndroid, Text, Platform, ScrollView, View, RefreshControl, TouchableOpacity, Dimensions, AsyncStorage, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CommonView from "../components/CommonView";
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from "moment";
import { SITE_ALARMS } from '../constants/APIurl';
import { APP_ACTIVE_GREEN } from '../constants/ColorMaster';
console.disableYellowBox = true;
const screenWidth = (Dimensions.get('window').width);
const windowHeight = (Dimensions.get('window').height);
let connnection_Status = false;
/*................................... Class to show Active Alarm and Alarm History .................................................................*/
class AlarmScreen extends React.Component {
    constructor(props) {
        super(props);
        var today = new Date();

        this.state = {
            search: '', header: 'Site Listing', alarm_Date: '',
            AlarmStatus: 'Active Alarms',
            refreshing: false,
            isLoading: true,
            isDateTimePickerVisible: false,
            alarmStatus: 0,
            alarmTabData: [],
            defaultView: true,
            newDate: null,
            selectedDate: Moment(new Date(Date.now() - 12096e5)).format('DD-MMM-YYYY'),
            alarmViewState: '',
            AsyncSiteID: '',
            AsyncTokenID: '',
            todayDate: new Date(),
        }
        this.props.navigation.addListener(
            'didFocus',
            async () => {

                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    connnection_Status = connectionInfo.type == 'none' ? false : true;
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
                const { navigation } = this.props;
                let view = await navigation.getParam('view');
                if (view == 'history') {
                    await this.setState({ AlarmStatus: 'Alarm History', alarmViewState: 'history' })
                    this._alarmTabData();
                } else {
                    await this.setState({ AlarmStatus: 'Active Alarms', alarmViewState: 'current' })
                    this._alarmTabData();
                };
            }
        );
    }

/* ..................................Get SiteID.......................................................*/    async _storedSiteID() {
        try {
            await AsyncStorage.getItem('SiteID').then(
                SiteID => {
                    this.setState({ AsyncSiteID: SiteID })
                }
            );
        } catch (error) { }
    };
    /* ..................................Component UnMount.......................................................*/
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }
    async _storedTokenID() {
        try {
            await AsyncStorage.getItem('TokenID').then(
                TokenID => {
                    this.setState({ AsyncTokenID: TokenID })
                }
            );
        } catch (error) { }
    }

    /*................................................ API Call starting From Here...........................................*/
    _alarmTabData = async () => {
        const { navigation } = this.props;
        let view = await navigation.getParam('view');

        await this._storedTokenID();
        await this._storedSiteID();
        this.setState({ refreshing: true });

        let fromdate = this.state.selectedDate != null ? this.state.selectedDate : Moment(new Date(Date.now() - 12096e5)).format('DD-MMM-YYYY');

        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        {
            view === 'history'
                ?
                fetch(SITE_ALARMS, {
                    method: "POST",
                    "headers": {
                        tokenid: this.state.AsyncTokenID,
                        siteid: this.state.AsyncSiteID,
                        alarmselectioncategory: view,
                        "to": Moment(new Date()).format('DD-MMM-YYYY'),
                        "fromdate": Moment(new Date(fromdate)).format('DD-MMM-YYYY')
                    }

                }).then(response => response.json()).then(responseJson => {
                    if (responseJson['SiteAlarmsList'] && responseJson['SiteAlarmsList'].length) {
                        var alarmTabData = responseJson.SiteAlarmsList.filter((item) => item["AlarmCategory"] == (this.state.alarmStatus == 0 ? 'Error' : (this.state.alarmStatus == 1 ? 'Fault' : 'Warning'))).map(function ({ SiteID, ActiveTime, AlarmDesc, AlarmOn, AlarmCategory, DeactiveTime, Status }) {
                            return { SiteID, ActiveTime, AlarmDesc, AlarmOn, AlarmCategory, DeactiveTime, Status };
                        });
                        this.setState({ alarmTabData: alarmTabData, isLoading: false, refreshing: false });
                    } else {
                        this.setState({ alarmTabData: [], isLoading: false, refreshing: false });
                    }
                })
                :
                fetch(SITE_ALARMS, {
                    method: "POST",
                    "headers": {
                        tokenid: this.state.AsyncTokenID,
                        siteid: this.state.AsyncSiteID,
                        alarmselectioncategory: view
                    }

                }).then(response => response.json()).then(responseJson => {
                    if (responseJson['SiteAlarmsList'] && responseJson['SiteAlarmsList'].length) {
                        var alarmTabData = responseJson.SiteAlarmsList.filter((item) => item["AlarmCategory"] == (this.state.alarmStatus == 0 ? 'Error' : (this.state.alarmStatus == 1 ? 'Fault' : 'Warning'))).map(function ({ SiteID, ActiveTime, AlarmDesc, AlarmOn, AlarmCategory, DeactiveTime, Status }) {
                            return { SiteID, ActiveTime, AlarmDesc, AlarmOn, AlarmCategory, DeactiveTime, Status };
                        });
                        this.setState({ alarmTabData: alarmTabData, isLoading: false, refreshing: false });
                    } else {
                        this.setState({ alarmTabData: [], isLoading: false, refreshing: false });
                    }
                });
        }


    };


    /* .......................................AlarmCategory  clicked function .....................................*/
    _tabClicked = (tabIndex) => {

        if (tabIndex == undefined) tabIndex = 0;
        this.setState({ alarmStatus: parseInt(tabIndex), refreshing: true });
        this._alarmTabData();
    }

    /*..........................................Time Duration for Active Alarm........................................................................*/

    _timeDuration = (todate, fromdate) => {
        var milli = new Date(todate - fromdate);
        var datesDifference = (milli.getDate() - 1) + ' days ' + milli.getHours() + ' hours ' + milli.getMinutes() + ' minutes ' + milli.getSeconds() + ' seconds';
        return datesDifference;
    }


    /*............................Date Picker ..........................................................*/
    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true, });
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
    _handleDatePicked = async (date) => {
        this.setState({ selectedDate: await Moment(new Date(date)).format('DD-MMM-YYYY') });
        this._hideDateTimePicker();
        this._alarmTabData();
    };

    /*...................................................................................................*/
    closeDrawer = () => {
        this.setState({
            showMenu: false
        });
    }

    render() {
        /*................................... Getting Alarm  Data .................................................................*/
        let TabHTml = [];
        var tabData = this.state.alarmTabData;
        if (tabData.length) {
            for (var i = 0; i < tabData.length; i++) {
                TabHTml.push(
                    <View key={i} >
                        <View style={styles.AlarmCommomView}>
                            <View style={styles.InverterView}>
                                <Text style={styles.AlarmContainerBold}>{tabData[i].AlarmOn} - {tabData[i].AlarmDesc}</Text>
                            </View>
                            <View style={styles.View}>
                                <Text style={styles.AlarmContainer}>Active Time : {tabData[i].ActiveTime}</Text>
                            </View>
                            {this.state.alarmViewState === 'history' ?
                                <View>
                                    <View style={styles.View}>
                                        <Text style={styles.AlarmContainer}>Deactive Time : {tabData[i].DeactiveTime}</Text>
                                    </View>
                                    <View style={styles.View}>
                                        <Text style={styles.AlarmContainer}>Total Time Active : {this._timeDuration(new Date(tabData[i].DeactiveTime), new Date(tabData[i].ActiveTime))}</Text>
                                    </View>
                                </View>
                                :
                                null
                            }
                        </View>
                    </View>
                );
            }
        } else {
            TabHTmL = [];
            TabHTml.push(
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: Dimensions.get('window').height * 0.5 }}>
                    <Text style={{ fontSize: 18, color: 'gray', fontWeight: '400' }}>No Data</Text>
                </View>
            );
        }



        /*................................... Page View Alarm Screen .................................................................*/


        return (
            <CommonView menuText={'Alarm'}>


                <ScrollView horizontal={false} refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this._tabClicked}
                        style={{}}
                    />
                }>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cccccc', padding: 5, marginBottom: 10 }}>
                        <MaterialIcons name="access-alarm" size={20} style={{ color: 'gray', padding: 5 }} />
                        <Text style={{ color: "gray", fontWeight: "bold", alignItems: "center", fontSize: 16 }}>{this.state.AlarmStatus}</Text>
                    </View>
                    {this.state.alarmViewState === 'history'
                        ?
                        <View style={{ flexDirection: 'column', width: (Dimensions.get("window").width), paddingLeft: 50, paddingRight: 50 }}>
                            <View style={{ backgroundColor: APP_ACTIVE_GREEN, marginBottom: 10, color: 'white', justifyContent: 'center', height: 30, elevation: 5 }}>
                                <TouchableOpacity style={{ width: '100%' }} onPress={this._showDateTimePicker}>
                                    <Text style={{ color: '#ffffff', textAlign: 'center' }}>From : {this.state.selectedDate}</Text>
                                </TouchableOpacity>
                                <DateTimePicker
                                    isVisible={this.state.isDateTimePickerVisible}
                                    onConfirm={this._handleDatePicked}
                                    onCancel={this._hideDateTimePicker}
                                    maximumDate={this.state.todayDate}
                                />
                            </View>
                        </View>
                        :
                        null
                    }
                    <View style={{ flexDirection: 'row', marginTop: 5, borderTopWidth: 2, borderTopColor: '#D9DED8' }}>
                        <TouchableOpacity style={[{ flex: 1, paddingLeft: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: '#ffffff' }, this.state.alarmStatus === 0 ? { backgroundColor: '#ffffff' } : { backgroundColor: '#D9DED8' }]} onPress={this._tabClicked.bind(this, 0)} >
                            <View style={[styles.RectangleBox, this.state.alarmStatus === 0 ? styles.active : styles.inactive]}>
                                <View style={styles.RectangleShapeView}>
                                    <View style={styles.AlarmsStatus} />
                                    <Text style={styles.AlarmSt}>Error</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[{ flex: 1, paddingLeft: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: '#ffffff' }, this.state.alarmStatus === 1 ? { backgroundColor: '#ffffff' } : { backgroundColor: '#D9DED8' }]} onPress={this._tabClicked.bind(this, 1)} >
                            <View style={[styles.RectangleBox, this.state.alarmStatus === 1 ? styles.active : styles.inactive]}>
                                <View style={styles.RectangleShapeView}>
                                    <View style={styles.AlarmsStatus1} />
                                    <Text style={styles.AlarmSt}>Fault</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[{ flex: 1, paddingLeft: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: '#ffffff' }, this.state.alarmStatus === 2 ? { backgroundColor: '#ffffff' } : { backgroundColor: '#D9DED8' }]} onPress={this._tabClicked.bind(this, 2)} >
                            <View style={[styles.RectangleBox, this.state.alarmStatus === 2 ? styles.active : styles.inactive]}>
                                <View style={styles.RectangleShapeView}>
                                    <View style={styles.AlarmsStatus2} />
                                    <Text style={styles.AlarmSt}>Warning</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: 20, paddingLeft: 15, paddingRight: 15, marginBottom: 20 }} >
                        {TabHTml}
                    </View>
                </ScrollView>

            </CommonView>
        );


    }
}
/*................................... Styles .................................................................*/

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAEAEA',
        alignItems: 'center',
        height: windowHeight,
        justifyContent: 'center',
    },
    loginBannerImage: {
        width: "100%",
        height: "100%",
        paddingRight: 0,
        paddingLeft: 0,
        resizeMode: 'cover',
    },

    cusButtonLargeGreen: {
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        elevation: 5,
        marginBottom: 10,
        marginTop: 20
    },
    cusButtonLargeGreenIn: {

        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#44AC30',
        width: screenWidth - 100,
        padding: 10,
        color: 'white',
        textAlign: 'center',
    },
    activeTabLink: {
        backgroundColor: '#fff',
        borderBottomColor: 'red',
        borderBottomWidth: 2
    },
    View: {
        flexDirection: 'row',
        paddingTop: 5,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 2,
        flexWrap: 'wrap'
    },
    InverterDetail: {
        flexDirection: 'row',
        paddingLeft: 12,
        paddingRight: 10,
    },
    InverterView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10
    },
    innerCircle: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: 'red'
    },
    innerCircle1: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: 'yellow'
    },
    bellCircle: {
        borderRadius: 35,
        width: 18,
        height: 18,
        margin: 5,
        backgroundColor: 'red',
        position: 'absolute',
        top: -15
    },
    AlarmContainer: {
        color: 'gray',
        fontSize: 11,
        fontWeight: 'bold',
        paddingRight: 1
    },
    AlarmContainerBold: {
        flex: 0,
        color: 'black',
        fontSize: 13,
        fontWeight: 'bold',
        paddingBottom: 2
    },
    AlarmCommomView: {
        flexDirection: 'column',
        borderWidth: 0.5,
        justifyContent: "center",
        borderRadius: 20,
        backgroundColor: "#fff",
        borderColor: '#BEEFB5',
        elevation: 20,
        marginBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        shadowOpacity: 0.1,
        shadowColor: '#000000',
        shadowOffset: {
            height: 3,
            width: 0
        },
        shadowRadius: 5
    },
    RectangleShapeView: {
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    RectangleBox: {
    },
    active: {
        borderBottomWidth: 2,
        backgroundColor: 'white',
        borderBottomColor: '#41A52E',
        borderRightColor: '#ffffff'
    },
    AlarmsStatus: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: '#f27a46'
    },
    AlarmsStatus1: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: '#ED1C24'
    },
    AlarmsStatus2: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: '#FFF200'
    },
    AlarmSt: {
        fontSize: 15,
        paddingLeft: 5,
        fontWeight: 'bold',
        color: '#707979'
    }
});
export default AlarmScreen
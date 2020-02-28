import React from 'react';
import { ToastAndroid, NetInfo, StyleSheet, Text, Picker, Modal, RefreshControl, Platform, ScrollView, View, Dimensions, AsyncStorage, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome, SimpleLineIcons, AntDesign, Foundation } from '@expo/vector-icons';
import CommonView from "../components/CommonView";
import DatePicker from 'react-native-datepicker';
import { PWR_ND_IRR, SITE_KWH, INV_VC_INFO, COMMUNICATION_TREND, PR, SITE_INV_DETAILS } from '../constants/APIurl';
import { APP_BUTTON_GREEN } from '../constants/ColorMaster';
import ChartView from '../Screens/webview.js';

import aPIStatusInfo from "../components/ErrorHandler";

var xTimeLabel = [];
var yIrrLabel = [];
var yPowerLabel = [];
var powerData = [];
var irradianceData = [];
var powerFinalData = [];
var irradianceFinalData = [];
console.disableYellowBox = true;
const screenWidth = Dimensions.get("window").width;
const CTTimeInterval = 3600000;
let connnection_Status = 'false';
/*................................... Class to show Analytics Graphs .................................................................*/
class Analytics extends React.Component {
    constructor(props) {
        super(props);
        var today = new Date();
        const monthNames1 = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        let targetDate1 = today;
        let targetDay1 = targetDate1.getDate();
        let targetMonth1 = targetDate1.getMonth();
        let targetYear1 = targetDate1.getFullYear();
        let PrevtargetDate = new Date(targetDate1.setDate(targetDate1.getDate() - 1));
        let targetDayPrev = PrevtargetDate.getDate();
        let targetMonthPrev = PrevtargetDate.getMonth();
        let targetYearPrev = PrevtargetDate.getFullYear();
        this.state = {
            search: "",
            header: "Site Listing",
            inverter_d: "",
            analytics_month: "",
            xSiteLabel: [],
            xChartLabel: [],
            chartPointValue: [],
            isLoading: true,
            yRightLabelPrev: [],
            yLeftLabelPrev: [],
            dataDatePrev: "",
            xPRChartLabel: [],
            PRchartPointValue: [],
            PerformanceRatioDounutTitle: '',
            dataDate: "",
            xPowerChartLabelPrev: [],
            sitePointValue: [],
            sitePointValue2: [],
            TokenID: '',
            SiteID: null,
            currentDate: [],
            data1: [],
            dates: [],
            currentXOffset: 0,
            isDateTimePickerVisible: false,
            chosenDateAndroid: new Date().toLocaleDateString(),
            datepickerIOSModal: false,
            activeTabIndex: 1,
            activeTabIndexYield: 3,
            xACChartLabel: [],
            ACCurrentPhase2: [],
            ACCurrentPhase3: [],
            ACCurrentPhase1: [],
            ACVoltagePhase1: [],
            ACVoltagePhase2: [],
            ACVoltagePhase3: [],
            ACCurrentPhase2Data: [],
            ACCurrentPhase3Data: [],
            ACCurrentPhase1Data: [],
            ACVoltagePhase1Data: [],
            ACVoltagePhase2Data: [],
            ACVoltagePhase3Data: [],
            PRDailychartPointValue: [],
            xPRDailyChartLabel: [],
            PRDrilldownchartPointValue: [],
            YieldchartPointValue: [],
            xYieldChartLabel: [],
            start_date: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            todayDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            prDate: targetDayPrev + '-' + monthNames1[targetMonthPrev] + '-' + targetYearPrev,
            yieldDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            pigraphDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            ACDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            DCDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            CTDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
            yieldDateTitle: '',
            xDCChartLabel: [], DCCurrentPhase2: [], DCCurrentPhase3: [], DCCurrentPhase1: [], DCVoltagePhase1: [], DCVoltagePhase2: [], DCVoltagePhase3: [],
            DCCurrentPhase2Data: [], DCCurrentPhase3Data: [], DCCurrentPhase1Data: [], DCVoltagePhase1Data: [],
            DCVoltagePhase2Data: [], DCVoltagePhase3Data: [],
            pickerInverterAC: '', pickerInverterDC: '', pickerGateway: '', acModalVisible: false, dcModalVisible: false, ctModalVisible: false, dataSource: [],
            xCTChartDeviceLabel: "", xCTChartPortalLabel: "", CTChartDevicedata: [], CTChartDeviceZonedata: [],
            CTChartPortaldata: [], CTChartPortalZonedata: [], index: 0, ScrollOffset: 0, YieldDailyData: [],
            anMonth: [], xYieldYearChartLabel: [], xYieldMonthChartLabel: [], isTabLoading: false, refreshing: false, xYieldYearChartLabel: [],
            xYieldMonthChartLabel: [], powerTimeData: [], irradianceTimeData: [], PR_API_Status_Message: '', pickerAndroidModal: false,
            irLoaded: false,
            prLoaded: false,
            ctLoaded: false,
            acLoaded: false,
            dcLoaded: false,
            yLoaded: false,
            irrACPowerIrrGraphShow: true,
            gatewayList: [],
            inverterList: []
        };
        this.props.navigation.addListener(
            'didFocus',
            async () => {

                var token = "";
                var siteId = "";
                await AsyncStorage.getItem("TokenID").then(value => {
                    token = value;
                });
                await AsyncStorage.getItem("SiteID").then(value => {

                    siteId = value;
                });
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    connnection_Status = connectionInfo.type == 'none' ? false : true;
                });
                await NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });

                this.setState({
                    refreshing: true,
                    TokenID: token,
                    SiteID: siteId,
                    start_date: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    todayDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    ACDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    DCDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    CTDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    activeTabIndex: 1,
                    activeTabIndexYield: 1,
                    prDate: targetDayPrev + '-' + monthNames1[targetMonthPrev] + '-' + targetYearPrev,
                    yieldDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    pigraphDate: targetDay1 + '-' + monthNames1[targetMonth1] + '-' + targetYear1,
                    PR_API_Status_Message: ''
                }, function () {
                    this.PickerData();
                    this.powerIrradianceGraph();
                    this.yieldGraphAPI(1);
                    this.performanceRatioGraphAPI();

                })

            }
        );
    }
    /*................................... Component Unmount .................................................................*/

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }

    /*................................... Communication Trend create half hour graph .................................................................*/

    createHalfHourIntervals = (min, max) => {
        var intervalRange = 1800000;
        var intervals = [];
        let numberofInterval = Number((max - min) / (CTTimeInterval / 4))
        for (let i = 0; i < numberofInterval; i++) {
            intervals.push(min + (intervalRange * i));
        }
        return intervals;
    }


    /* ..................................Pulling Refresh.......................................................*/

    _onRefresh = async () => {

        this.setState({ refreshing: true });
        await this.PickerData();
        this.yieldGraphAPI(1);
        this.powerIrradianceGraph();
        this.performanceRatioGraphAPI();

    }


    /*.......................................Get Inverter/Gateway details................................................................................................................*/
    async PickerData() {
        var rsttoken = this.state.TokenID;
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(SITE_INV_DETAILS, {
            method: "POST",
            headers: {
                tokenid: rsttoken,
                siteid: this.state.SiteID,
            }
        }).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {

            if (typeof responseJson.SiteInvDetails !== 'undefined' && responseJson.SiteInvDetails.length > 0) {
                var dataSource = responseJson.SiteInvDetails
                var gatewayVal = dataSource.map((value) => value.GatewayID).filter((value, index, _arr) => _arr.indexOf(value) == index)
                var inverterVal = dataSource.map((value) => value.InvID).filter((value, index, _arr) => _arr.indexOf(value) == index)
                var invList = inverterVal.sort(function (a, b) { return a - b });
                this.setState({
                    gatewayList: gatewayVal,
                    inverterList: invList,
                    dataSource: responseJson.SiteInvDetails,
                    pickerInverterAC: responseJson.SiteInvDetails.length > 0 ? responseJson.SiteInvDetails[0].InvID : '',
                    pickerInverterDC: responseJson.SiteInvDetails.length > 0 ? responseJson.SiteInvDetails[0].InvID : '',
                    pickerGateway: responseJson.SiteInvDetails.length > 0 ? responseJson.SiteInvDetails[0].GatewayID : '',
                }, function () {
                    this.CommunicationTrendGraphAPI();

                    if (!connnection_Status) { return; }
                    fetch(
                        INV_VC_INFO,
                        {
                            method: "POST",
                            headers: {
                                tokenid: this.state.TokenID,
                                siteid: this.state.SiteID,
                                evtime: this.state.ACDate,
                                invid: this.state.pickerInverterAC
                            }
                        }
                    ).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {
                        var ACresponse = responseJson.SiteInvACVC;
                        var DCresponse = responseJson.SiteInvDCVC;
                        var ACDate = [];
                        var ACCurrentPhase1Data = [];
                        var ACCurrentPhase2Data = [];
                        var ACCurrentPhase3Data = [];
                        var ACVoltagePhase1Data = [];
                        var ACVoltagePhase2Data = [];
                        var ACVoltagePhase3Data = [];
                        for (let i = 0; i < ACresponse.length; i++) {
                            var dt = new Date(ACresponse[i].DateTime);
                            var ACCurrentPhase1Obj = [];
                            var ACCurrentPhase2Obj = [];
                            var ACCurrentPhase3Obj = [];
                            var ACVoltagePhase1Obj = [];
                            var ACVoltagePhase2Obj = [];
                            var ACVoltagePhase3Obj = [];
                            ACCurrentPhase1Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                            ACCurrentPhase1Obj.push(Number(ACresponse[i].CurrentPhase1));

                            ACCurrentPhase2Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                            ACCurrentPhase2Obj.push(Number(ACresponse[i].CurrentPhase2));

                            ACCurrentPhase3Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                            ACCurrentPhase3Obj.push(Number(ACresponse[i].CurrentPhase3));

                            ACVoltagePhase1Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                            ACVoltagePhase1Obj.push(Number(ACresponse[i].VoltagePhase1));

                            ACVoltagePhase2Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                            ACVoltagePhase2Obj.push(Number(ACresponse[i].VoltagePhase2));

                            ACVoltagePhase3Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                            ACVoltagePhase3Obj.push(Number(ACresponse[i].VoltagePhase3));
                            ACCurrentPhase1Data.push(ACCurrentPhase1Obj);
                            ACCurrentPhase2Data.push(ACCurrentPhase2Obj);
                            ACCurrentPhase3Data.push(ACCurrentPhase3Obj);
                            ACVoltagePhase1Data.push(ACVoltagePhase1Obj);
                            ACVoltagePhase2Data.push(ACVoltagePhase2Obj);
                            ACVoltagePhase3Data.push(ACVoltagePhase3Obj);
                            ACDate.push(dt.getHours() + ":" + dt.getMinutes());
                        }


                        var DCDate = [];
                        var DCCurrentPhase1Data = [];
                        var DCCurrentPhase2Data = [];
                        var DCCurrentPhase3Data = [];
                        var DCVoltagePhase1Data = [];
                        var DCVoltagePhase2Data = [];
                        var DCVoltagePhase3Data = [];
                        for (let i = 0; i < DCresponse.length; i++) {
                            var dt = new Date(DCresponse[i].DateTime);
                            var DCCurrentPhase1Obj = [];
                            var DCCurrentPhase2Obj = [];
                            var DCCurrentPhase3Obj = [];

                            var DCVoltagePhase1Obj = [];
                            var DCVoltagePhase2Obj = [];
                            var DCVoltagePhase3Obj = [];

                            DCCurrentPhase1Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                            DCCurrentPhase1Obj.push(Number(DCresponse[i].CurrentPhase1));

                            DCCurrentPhase2Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                            DCCurrentPhase2Obj.push(Number(DCresponse[i].CurrentPhase2));

                            DCCurrentPhase3Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                            DCCurrentPhase3Obj.push(Number(DCresponse[i].CurrentPhase3));

                            DCVoltagePhase1Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                            DCVoltagePhase1Obj.push(Number(DCresponse[i].VoltagePhase1));

                            DCVoltagePhase2Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                            DCVoltagePhase2Obj.push(Number(DCresponse[i].VoltagePhase2));

                            DCVoltagePhase3Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                            DCVoltagePhase3Obj.push(Number(DCresponse[i].VoltagePhase3));

                            DCCurrentPhase1Data.push(DCCurrentPhase1Obj);
                            DCCurrentPhase2Data.push(DCCurrentPhase2Obj);
                            DCCurrentPhase3Data.push(DCCurrentPhase3Obj);
                            DCVoltagePhase1Data.push(DCVoltagePhase1Obj);
                            DCVoltagePhase2Data.push(DCVoltagePhase2Obj);
                            DCVoltagePhase3Data.push(DCVoltagePhase3Obj);
                            DCDate.push(dt.getHours() + ":" + dt.getMinutes());
                        }

                        this.setState({
                            xDCChartLabel: DCDate,
                            DCCurrentPhase1Data: DCCurrentPhase1Data,
                            DCCurrentPhase2Data: DCCurrentPhase2Data,
                            DCCurrentPhase3Data: DCCurrentPhase3Data,
                            DCVoltagePhase1Data: DCVoltagePhase1Data,
                            DCVoltagePhase2Data: DCVoltagePhase2Data,
                            DCVoltagePhase3Data: DCVoltagePhase3Data,
                            dcLoaded: true,

                            xACChartLabel: ACDate.reverse(),
                            ACCurrentPhase1Data: ACCurrentPhase1Data,
                            ACCurrentPhase2Data: ACCurrentPhase2Data,
                            ACCurrentPhase3Data: ACCurrentPhase3Data,
                            ACVoltagePhase1Data: ACVoltagePhase1Data,
                            ACVoltagePhase2Data: ACVoltagePhase2Data,
                            ACVoltagePhase3Data: ACVoltagePhase3Data,
                            refreshing: false,
                            acLoaded: true,
                        });
                    })
                        .catch(err => {

                            let errMSg = aPIStatusInfo.logError(err);
                            if (errMSg.length > 0) {
                                if (Platform.OS !== 'ios') {
                                    ToastAndroid.showWithGravity(
                                        errMSg,
                                        ToastAndroid.SHORT,
                                        ToastAndroid.CENTER,
                                    );
                                } else {
                                    Alert.alert(errMSg);
                                }
                            }

                            this.setState({ acLoaded: true, dcLoaded: true });

                        });

                });

            }
            else {

                this.setState({
                    refreshing: false,
                    ctLoaded: true,
                    acLoaded: true,
                    dcLoaded: true
                });
            }
        })
            .catch(err => {

                let errMSg = aPIStatusInfo.logError(err);
                if (errMSg.length > 0) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            errMSg,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert(errMSg);
                    }
                }

                this.setState({
                    refreshing: false,
                    ctLoaded: true,
                    acLoaded: true,
                    dcLoaded: true
                });

            });
    };


    /*....................................................Data for irradiance graph...........................................................................................................................................................................*/
    createDataForPIGraph = (data, length) => {
        if (length < 0) {

            this.setState({
                xPowerChartLabel: xTimeLabel.reverse(),
                yLeftLabel: yIrrLabel.reverse(),
                yRightLabel: yPowerLabel.reverse(),
                isLoading: false,
                showGraph: false,
                showPIGraph: true,
                irradianceTimeData: irradianceFinalData,

                powerTimeData: powerFinalData,
                irLoaded: true
            });
        }
        if (length >= 0) {
            var dt = new Date(data[length].dateTime);
            powerData = [];
            irradianceData = [];
            powerData.push(this.timeInMsec(dt));
            powerData.push(parseFloat(data[length].Power));
            irradianceData.push(this.timeInMsec(dt));
            irradianceData.push(parseFloat(data[length].Irradiance));
            irradianceFinalData.push(irradianceData);
            powerFinalData.push(powerData);
            xTimeLabel.push(dt.getHours() + ":" + dt.getMinutes());
            yIrrLabel.push(parseFloat(data[length].Irradiance));
            yPowerLabel.push(parseFloat(data[length].Power));
            length--;
            this.createDataForPIGraph(data, length);
        }
    };


    /*..............................................Date/Gateway/Inverter Filteration for Performance Ratio/AC /DC /Yield.............................................................................................................*/

    setGateway = (itemValue) => {

        if (itemValue.toString() == "0") return false;


        this.setState({ pickerGateway: itemValue }, this.CommunicationTrendGraphAPI(itemValue))
    }
    setInverterAC = (itemValue) => {

        this.setState({ pickerInverterAC: itemValue }, function () {
            this.ACVoltageGraphAPI();
        })
    }
    setInverterDC = (itemValue) => {

        this.setState({ pickerInverterDC: itemValue }, function () {
            this.DCVoltageGraphAPI();
        })
    }
    setPiDate = (date) => {

        let targetDate = date == undefined ? this.state.start_date : new Date(date);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth();
        let targetYear = targetDate.getFullYear();

        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        this.setState({
            pigraphDate: targetDay + '-' + monthNames[targetMonth] + '-' + targetYear,
            start_date: targetDate
        }, function () {
            this.powerIrradianceGraph();
        });
    };

    setACDate = (date) => {
        let targetDate = date == undefined ? this.state.start_date : new Date(date);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth();
        let targetYear = targetDate.getFullYear();

        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        this.setState({
            ACDate: targetDay + '-' + monthNames[targetMonth] + '-' + targetYear,
            start_date: targetDate
        }, function () {
            this.ACVoltageGraphAPI();
        });
    };


    setDCDate = (date) => {
        let targetDate = date == undefined ? this.state.start_date : new Date(date);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth();
        let targetYear = targetDate.getFullYear();

        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        this.setState({
            DCDate: targetDay + '-' + monthNames[targetMonth] + '-' + targetYear,
            start_date: targetDate

        }, function () {
            this.DCVoltageGraphAPI();
        });
    };


    setCommTrendDate = (date) => {
        let targetDate = date == undefined ? this.state.start_date : new Date(date);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth();
        let targetYear = targetDate.getFullYear();

        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        this.setState({
            CTDate: targetDay + '-' + monthNames[targetMonth] + '-' + targetYear,
            start_date: targetDate

        }, function () {
            this.CommunicationTrendGraphAPI();
        });

    }
    setPrDate = (date) => {
        let targetDate = new Date(date);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth();
        let targetYear = targetDate.getFullYear();
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        targetDate = targetDay + '-' + monthNames[targetMonth] + '-' + targetYear;


        this.setState({

            prDate: targetDate
        }, function () {
            this.performanceRatioGraphAPI(targetDate);
        });
    };
    setYieldDate = (date) => {
        let targetDate = new Date(date);
        let targetDay = targetDate.getDate();
        let targetMonth = targetDate.getMonth();
        let targetYear = targetDate.getFullYear();
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        let currentDate = targetDay + '-' + monthNames[targetMonth] + '-' + targetYear;


        this.setState({
            yieldDate: currentDate

        }, function () {

            this.yieldGraphAPI(this.state.activeTabIndexYield, currentDate);
        });
    };

    /*................................... getting time in milliseconds .................................................................*/

    timeInMsec = (date) => {
        return new Date(date).setMinutes(new Date(date).getMinutes());
    };

    /*..................................................API Call For Power Irradiance ..................................................................................................*/
    powerIrradianceGraph = () => {
        var rsttoken = this.state.TokenID;
        if (!connnection_Status) { return; }
        fetch(PWR_ND_IRR, {
            method: "POST",
            headers: {
                tokenid: rsttoken,
                siteid: this.state.SiteID,

                evtime: this.state.pigraphDate,
            }
        }).then(response => response.json()).then(responseJson => {
            let responsePI = responseJson.PowerAndIrr;
            xTimeLabel = [];
            yIrrLabel = [];
            yPowerLabel = [];
            powerFinalData = [];
            irradianceFinalData = [];
            this.createDataForPIGraph(responsePI, responsePI.length - 1);

        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (errMSg.length > 0) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    Alert.alert(errMSg);
                }
            }

            this.setState({ ctLoaded: true, irLoaded: true });

        });
    };



    /*..............................................................API Call For Yield.........................................................................................................*/
    yieldGraphAPI = (tabIndex, date1) => {
        let startDate = date1 == undefined ? this.state.yieldDate : date1;
        var period = "daily";
        if (tabIndex == 1) {
            period = 'daily';
        } else if (tabIndex == 2) {
            period = 'month';
        } else if (tabIndex == 3) {
            period = 'year';
        }
        if (!connnection_Status) { return; }
        fetch(SITE_KWH, {
            method: "POST",
            headers: {
                tokenid: this.state.TokenID,
                siteid: this.state.SiteID,
                evtime: startDate,
                energysearchperiod: period
            }
        }).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {
            var anYear = [];
            var anMonth = [];
            var PRresponse = responseJson.siteEnergy;
            var PRDate = [];
            var PRResponse = [];
            var YieldDailyData = [];
            for (let i = 0; i < PRresponse.length; i++) {
                month = PRresponse[i].DateTime
                day = PRresponse[i].DateTime
                var yieldDailyObj = [];
                anYear.push(month.substring(3, 6));
                anMonth.push(month.substring(0, 2));
                yieldDailyObj.push(this.timeInMsec(PRresponse[i].DateTime));
                yieldDailyObj.push(Number(PRresponse[i].KWH));
                YieldDailyData.push(yieldDailyObj);
                PRDate.push(PRresponse[i].DateTime);
                PRResponse.push(parseInt(PRresponse[i].KWH));
            }

            this.setState({
                xYieldYearChartLabel: anYear,
                xYieldMonthChartLabel: anMonth,
                xYieldChartLabel: PRDate,
                YieldchartPointValue: PRResponse,
                activeTabIndexYield: tabIndex,
                yieldDate: startDate,
                YieldDailyData: YieldDailyData,
                yLoaded: true,
            });
        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (errMSg.length > 0) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    Alert.alert(errMSg);
                }
            }


            this.setState({ yLoaded: true });

        });
    };



    /*..........................................................API Call for AC Voltage And Current..........................................................................................................................................*/
    ACVoltageGraphAPI = () => {
        if (!connnection_Status) { return; }
        fetch(
            INV_VC_INFO,
            {
                method: "POST",
                headers: {
                    tokenid: this.state.TokenID,
                    siteid: this.state.SiteID,
                    evtime: this.state.ACDate,
                    invid: this.state.pickerInverterAC
                }
            }
        ).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {

            var ACresponse = responseJson.SiteInvACVC;
            var ACDate = [];
            var ACCurrentPhase1Data = [];
            var ACCurrentPhase2Data = [];
            var ACCurrentPhase3Data = [];
            var ACVoltagePhase1Data = [];
            var ACVoltagePhase2Data = [];
            var ACVoltagePhase3Data = [];
            for (let i = 0; i < ACresponse.length; i++) {
                var dt = new Date(ACresponse[i].DateTime);
                var ACCurrentPhase1Obj = [];
                var ACCurrentPhase2Obj = [];
                var ACCurrentPhase3Obj = [];
                var ACVoltagePhase1Obj = [];
                var ACVoltagePhase2Obj = [];
                var ACVoltagePhase3Obj = [];
                ACCurrentPhase1Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                ACCurrentPhase1Obj.push(Number(ACresponse[i].CurrentPhase1));

                ACCurrentPhase2Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                ACCurrentPhase2Obj.push(Number(ACresponse[i].CurrentPhase2));

                ACCurrentPhase3Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                ACCurrentPhase3Obj.push(Number(ACresponse[i].CurrentPhase3));

                ACVoltagePhase1Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                ACVoltagePhase1Obj.push(Number(ACresponse[i].VoltagePhase1));

                ACVoltagePhase2Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                ACVoltagePhase2Obj.push(Number(ACresponse[i].VoltagePhase2));

                ACVoltagePhase3Obj.push(this.timeInMsec(ACresponse[i].DateTime));
                ACVoltagePhase3Obj.push(Number(ACresponse[i].VoltagePhase3));

                ACCurrentPhase1Data.push(ACCurrentPhase1Obj);
                ACCurrentPhase2Data.push(ACCurrentPhase2Obj);
                ACCurrentPhase3Data.push(ACCurrentPhase3Obj);
                ACVoltagePhase1Data.push(ACVoltagePhase1Obj);
                ACVoltagePhase2Data.push(ACVoltagePhase2Obj);
                ACVoltagePhase3Data.push(ACVoltagePhase3Obj);

                ACDate.push(dt.getHours() + ":" + dt.getMinutes());

            }

            this.setState({
                xACChartLabel: ACDate.reverse(),
                ACCurrentPhase1Data,
                ACCurrentPhase2Data,
                ACCurrentPhase3Data,
                ACVoltagePhase1Data,
                ACVoltagePhase2Data,
                ACVoltagePhase3Data,

                acLoaded: true,
            });
        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (errMSg.length > 0) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    Alert.alert(errMSg);
                }
            }

            this.setState({ acLoaded: true });

        });

    };

    /* getMinMax = (arr) => {
        let min = arr[0].y, max = arr[0].y;
        for (let i = 1, len = arr.length; i < len; i++) {
            let v = arr[i].y;
            min = (v < min) ? v : min;
            max = (v > max) ? v : max;
        }
        return [min, max];
    } */
    /*...................................Setting Values for Communication Trend....................................*/

    CommunicationTrendGraphAPI(itemValue) {

        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        let interval = CTTimeInterval / 4;
        let startDate = this.state.CTDate;


        fetch(
            COMMUNICATION_TREND,
            {
                method: "POST",
                headers: {
                    tokenid: this.state.TokenID,
                    siteid: this.state.SiteID,
                    fromdate: this.state.CTDate,
                    to: this.state.CTDate
                }
            }
        ).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {
            var CTresponse = responseJson.CommunicationTrend;
            /*...........Filtering Data by default GatewayID if  no gateway selected in Picker............*/
            if (itemValue != undefined && itemValue.length > 0) {
                CTresponse = CTresponse.filter((item) => item.GatewayId == itemValue.toString());
            }
            /*...........Filtering Data by selected GatewayID   in Picker............*/
            else if (this.state.pickerGateway.length > 0) {
                CTresponse = CTresponse.filter((item) => item.GatewayId == this.state.pickerGateway.toString());
            }
            /*...........Calculating number of interval from midnight to midnight............*/
            let min = new Date(startDate).setHours(0, 0, 0, 0);
            let max = new Date(startDate).setHours(23, 59, 59, 999);
            let timeIntervalinMsec = [];
            timeIntervalinMsec = this.createHalfHourIntervals(min, max);
            let CTChartDeviceZonedata = [];
            let CTChartDevicedata = [];
            let CTChartPortalZonedata = [];
            let CTChartPortaldata = [];
            /*...........Looping through each interval............*/
            var leftSideGrayDeviceEnd = this.timeInMsec(CTresponse[0]["DelRemoTime"]);
            var rightSideGrayDeviceEnd = this.timeInMsec(CTresponse[CTresponse.length - 1]["DelRemoTime"]);
            var leftSideGrayPortalEnd = this.timeInMsec(CTresponse[0]["PortalTime"]);
            var rightSideGrayPortalEnd = this.timeInMsec(CTresponse[CTresponse.length - 1]["PortalTime"]);
            for (let i = 0; i < timeIntervalinMsec.length; i++) {
                let timePortal = CTresponse.filter((item) => (this.timeInMsec(item["PortalTime"]) >= timeIntervalinMsec[i] && this.timeInMsec((item["PortalTime"])) < timeIntervalinMsec[i] + interval));
                let timeDevice = CTresponse.filter((item) => (this.timeInMsec(item["DelRemoTime"]) >= timeIntervalinMsec[i] && this.timeInMsec((item["DelRemoTime"])) <= timeIntervalinMsec[i] + interval));
                /*...........For each interval building chart data for Device  ............*/
                if (timeDevice.length > 0) {
                    CTChartDeviceZonedata.push({ value: timeIntervalinMsec[i], color: "green" });
                    CTChartDeviceZonedata.push({ value: timeIntervalinMsec[i] + interval, color: "green" });
                    CTChartDevicedata.push({ x: timeIntervalinMsec[i], y: 4 });
                    CTChartDevicedata.push({ x: timeIntervalinMsec[i] + interval, y: 4 });
                }
                else if ((timeIntervalinMsec[i] >= leftSideGrayDeviceEnd && timeIntervalinMsec[i] <= rightSideGrayDeviceEnd)) {
                    CTChartDeviceZonedata.push({ value: timeIntervalinMsec[i], color: "red" });
                    CTChartDeviceZonedata.push({ value: timeIntervalinMsec[i] + interval, color: "red" });
                    CTChartDevicedata.push({ x: timeIntervalinMsec[i], y: 4 });
                    CTChartDevicedata.push({ x: timeIntervalinMsec[i] + interval, y: 4 });
                }
                else {
                    CTChartDevicedata.push({ x: timeIntervalinMsec[i], y: 4 });
                    CTChartDeviceZonedata.push({ value: timeIntervalinMsec[i], color: "gray" });
                    CTChartDevicedata.push({ x: timeIntervalinMsec[i] + interval, y: 4 });
                    CTChartDeviceZonedata.push({ value: timeIntervalinMsec[i] + interval, color: "gray" });
                }
                if (timePortal.length > 0) {
                    CTChartPortalZonedata.push({ value: timeIntervalinMsec[i], color: "green" });
                    CTChartPortalZonedata.push({ value: timeIntervalinMsec[i] + interval, color: "green" });
                    CTChartPortaldata.push({ x: timeIntervalinMsec[i], y: 4 });
                    CTChartPortaldata.push({ x: timeIntervalinMsec[i] + interval, y: 4 });
                }
                else if (timeIntervalinMsec[i] >= leftSideGrayPortalEnd && timeIntervalinMsec[i] <= rightSideGrayPortalEnd) {
                    CTChartPortalZonedata.push({ value: timeIntervalinMsec[i], color: "red" });
                    CTChartPortalZonedata.push({ value: timeIntervalinMsec[i] + interval, color: "red" });
                    CTChartPortaldata.push({ x: timeIntervalinMsec[i], y: 4 });
                    CTChartPortaldata.push({ x: timeIntervalinMsec[i] + interval, y: 4 });
                }
                else {
                    CTChartPortaldata.push({ x: timeIntervalinMsec[i], y: 4 });
                    CTChartPortalZonedata.push({ value: timeIntervalinMsec[i], color: "gray" });
                    CTChartPortaldata.push({ x: timeIntervalinMsec[i] + interval, y: 4 });
                    CTChartPortalZonedata.push({ value: timeIntervalinMsec[i] + interval, color: "gray" });
                }
            }

            this.setState({
                xCTChartDeviceLabel: "DelREMO Device Capture Time",
                xCTChartPortalLabel: "DelREMO App Portal Capture Time",
                CTChartPortalZonedata: CTChartPortalZonedata,
                CTChartPortaldata: CTChartPortaldata,
                CTChartDeviceZonedata: CTChartDeviceZonedata,
                CTChartDevicedata: CTChartDevicedata,

                ctLoaded: true,

            });
        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (errMSg.length > 0) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    Alert.alert(errMSg);
                }
            }

            this.setState({ ctLoaded: true });

        });
    };

    /*.............................................................API Call For DC Voltage and Current ...............................................................................................................*/
    DCVoltageGraphAPI = () => {
        if (!connnection_Status) { return; }
        fetch(
            INV_VC_INFO,
            {
                method: "POST",
                headers: {
                    tokenid: this.state.TokenID,
                    siteid: this.state.SiteID,
                    evtime: this.state.DCDate,
                    invid: this.state.pickerInverterDC
                }
            }
        ).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {
            var DCresponse = responseJson.SiteInvDCVC;
            var DCDate = [];
            var DCCurrentPhase1Data = [];
            var DCCurrentPhase2Data = [];
            var DCCurrentPhase3Data = [];
            var DCVoltagePhase1Data = [];
            var DCVoltagePhase2Data = [];
            var DCVoltagePhase3Data = [];
            for (let i = 0; i < DCresponse.length; i++) {
                var dt = new Date(DCresponse[i].DateTime);
                var DCCurrentPhase1Obj = [];
                var DCCurrentPhase2Obj = [];
                var DCCurrentPhase3Obj = [];

                var DCVoltagePhase1Obj = [];
                var DCVoltagePhase2Obj = [];
                var DCVoltagePhase3Obj = [];

                DCCurrentPhase1Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                DCCurrentPhase1Obj.push(Number(DCresponse[i].CurrentPhase1));

                DCCurrentPhase2Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                DCCurrentPhase2Obj.push(Number(DCresponse[i].CurrentPhase2));

                DCCurrentPhase3Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                DCCurrentPhase3Obj.push(Number(DCresponse[i].CurrentPhase3));

                DCVoltagePhase1Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                DCVoltagePhase1Obj.push(Number(DCresponse[i].VoltagePhase1));

                DCVoltagePhase2Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                DCVoltagePhase2Obj.push(Number(DCresponse[i].VoltagePhase2));

                DCVoltagePhase3Obj.push(this.timeInMsec(DCresponse[i].DateTime));
                DCVoltagePhase3Obj.push(Number(DCresponse[i].VoltagePhase3));

                DCCurrentPhase1Data.push(DCCurrentPhase1Obj);
                DCCurrentPhase2Data.push(DCCurrentPhase2Obj);
                DCCurrentPhase3Data.push(DCCurrentPhase3Obj);
                DCVoltagePhase1Data.push(DCVoltagePhase1Obj);
                DCVoltagePhase2Data.push(DCVoltagePhase2Obj);
                DCVoltagePhase3Data.push(DCVoltagePhase3Obj);
                DCDate.push(dt.getHours() + ":" + dt.getMinutes());

            }
            this.setState({
                xDCChartLabel: DCDate,
                DCCurrentPhase1Data: DCCurrentPhase1Data,
                DCCurrentPhase2Data: DCCurrentPhase2Data,
                DCCurrentPhase3Data: DCCurrentPhase3Data,
                DCVoltagePhase1Data: DCVoltagePhase1Data,
                DCVoltagePhase2Data: DCVoltagePhase2Data,
                DCVoltagePhase3Data: DCVoltagePhase3Data,

                dcLoaded: true
            });
        }).catch(err => {
            let errMSg = aPIStatusInfo.logError(err);
            if (errMSg.length > 0) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    Alert.alert(errMSg);
                }
            }

            this.setState({
                dcLoaded: true,

            });

        });
    };


    /*.....................................................API Call For Performance Ratio .....................................................................................................................*/

    performanceRatioGraphAPI = (date) => {
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }

        var selectedDate = date == undefined ? this.state.prDate : date;

        fetch(PR, {
            method: "POST",
            headers: {
                tokenid: this.state.TokenID,
                siteid: this.state.SiteID,
                evtime: selectedDate,
                prsearchtype: 'month'
            }
        }).then(response => response.json()).then(responseJson => {
            if (responseJson.hasOwnProperty("Message")) {

                if (responseJson.Message.indexOf("expired") > -1 || responseJson.Message.indexOf("Access Denied") > -1) {
                    return false;
                }
                else if (responseJson.Message.indexOf("Solar Site is not applicable for PR") > -1) {
                    this.setState({

                        PR_API_Status_Message: responseJson.Message,
                        PRchartPointValue: [],
                        xPRChartLabel: [],
                        PerformanceRatioDounutTitle: [],
                        prDate: selectedDate,
                        prLoaded: true
                    });

                }
                else {

                    this.setState({
                        PR_API_Status_Message: "No data available",
                        PRchartPointValue: [],
                        xPRChartLabel: [],
                        PerformanceRatioDounutTitle: [],
                        prDate: selectedDate,
                        prLoaded: true
                    });
                }
            } else {
                var PRresponse = responseJson.SitePRCalculated;
                var PRDate = [];
                var PRResponse = [];
                var PerformanceRatioDounutTitle = '';
                for (let i = 0; i < PRresponse.length; i++) {
                    PRDate.push(PRresponse[i].Date);
                    const a = [
                        {
                            token: this.state.TokenID,
                            site: this.state.SiteID,
                            date: PRresponse[i].Date
                        }
                    ]
                    PRResponse.push({ dnData: JSON.stringify(a), color: '#b97f22', name: PRresponse[i].Date, y: parseInt(PRresponse[i].PR), drilldown: true })
                }


                this.setState({
                    xPRChartLabel: PRDate,
                    PRchartPointValue: PRResponse,
                    prDate: selectedDate,

                    PerformanceRatioDounutTitle: PerformanceRatioDounutTitle,
                    prLoaded: true
                }, function () {
                });
            }
        }).catch(err => {
            let errMSg = aPIStatusInfo.logError(err);
            if (errMSg.length > 0) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        errMSg,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                } else {
                    Alert.alert(errMSg);
                }
            }

            this.setState({ prLoaded: true });

        });

    };


    /*.........................................................Render starting from here ............................................................................................................................*/

    render() {


        /*..........................................DC Voltage & Current Graph......................................................................................................................................*/
        var DCVoltageCurrent = {
            loading: { showDuration: 1000 },
            chart: {
                type: "spline",
                animation: 'false',
                pinchType: "x",
                resetZoomButton: {
                    position: {
                        align: 'right', // by default
                        verticalAlign: 'bottom', // by default
                        x: 8,
                        y: 20
                    }
                },

                svg: {
                    fill: "red"
                },

            },
            title: {
                text: this.state.dataDate,
                style: { fontSize: 13, textAlign: "right", alignItems: "right" }
            },
            credits: {
                enabled: false
            },
            xAxis: {
                events: {
                    setExtremes: function (event) {
                        this.min = event.min;
                        this.max = event.max;
                    }
                },


                labels: {
                    rotation: -45,

                    step: 1,
                    formatter: function () {
                        var str;
                        str = new Date(this.value).getHours().toString() + ":" + new Date(this.value).getMinutes().toString();
                        return str;
                    }
                },

                title: {
                    text: "Time",
                    style: {
                        fontSize: 9
                    }
                },
                tickInterval: 3600000,
                tickPositioner: function () {
                    var positions = [],
                        tick = new Date(Number(this.dataMin)).setMinutes(0),
                        increment = this.tickInterval;
                    if (this.dataMax !== null && this.dataMin !== null) {
                        for (tick; tick - increment <= this.dataMax; tick += increment) {
                            positions.push(tick);
                        }
                    }
                    return positions;
                },


            },
            legend: {
                symbolWidth: 10,
                symbolPadding: 15
            },
            yAxis: [
                {
                    lineWidth: 1,
                    title: {
                        text: "DC Voltage [V]"
                    }
                },
                {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        text: "DC Current [I]"
                    }
                }
            ],
            tooltip: {
                crosshairs: [true, false],
                followTouchMove: false,
                shared: true,
                formatter: function () {
                    var tip = "<span style=\"font-size:10px;padding-left:10px\">" + 'Time:' + new Date(this.x).toString().substring(0, 15) + "</span><br/><table>";
                    this.points.forEach(function (d) {
                        tip += '<tr><td style="color:' + d.color + ';padding:0"><span  style="color:' + d.color + '">' + d.series.name + ' </span>: </td><td style=\"padding:0\"><b>' + d.y + '';
                        if (d.series.name.substring(0, 1) == 'V') {
                            tip += ' V </b></td><br/>';
                        } else {
                            tip += ' A</b></td><br/>';
                        }
                        tip += '</tr>';
                    });
                    tip += '</table>';
                    return tip;
                }
            },
            series: [
                {
                    data: this.state.DCCurrentPhase1Data,
                    yAxis: 1,
                    svg: {
                        fill: "red"
                    },
                    color: "#0baee7",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Current DC1"
                },
                {
                    data: this.state.DCCurrentPhase2Data,
                    yAxis: 1,
                    svg: {
                        fill: "blue"
                    },
                    color: "#00FFFF",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Current DC2"
                },
                {
                    data: this.state.DCVoltagePhase1Data,
                    yAxis: 0,
                    svg: {
                        fill: "yellow"
                    },
                    color: "#000080",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Voltage DC1"
                },
                {
                    data: this.state.DCVoltagePhase2Data,
                    yAxis: 0,
                    svg: {
                        fill: "gray"
                    },
                    color: "#000000",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Voltage DC2"
                },
            ],

        };


        /*....................................................................................AC Voltage And Current ....................................................................................*/
        var ACVoltageCurrent = {
            loading: { showDuration: 1000 },
            chart: {
                type: "spline",
                animation: 'false',
                pinchType: "x",
                svg: {
                    fill: "red"
                },
                resetZoomButton: {
                    position: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        x: 8,
                        y: 20
                    }
                },
            },
            legend: {
                symbolWidth: 10,
                symbolPadding: 15
            },
            title: {
                text: this.state.dataDate,
                style: { fontSize: 13, textAlign: "right", alignItems: "right" }
            },
            credits: {
                enabled: false
            },
            xAxis: {
                events: {
                    setExtremes: function (event) {
                        this.min = event.min;
                        this.max = event.max;
                    }
                },


                labels: {
                    step: 1,
                    rotation: -45,
                    formatter: function () {
                        var str;
                        str = new Date(this.value).getHours().toString() + ":" + new Date(this.value).getMinutes().toString();
                        return str;
                    }
                },
                title: {
                    text: "Time",
                    style: {
                        fontSize: 9
                    }
                },

                showFirstLabel: true,
                showLastLabel: true,
                tickInterval: 3600000,
                tickPositioner: function () {
                    var positions = [],
                        tick = new Date(Number(this.dataMin)).setMinutes(0),
                        increment = this.tickInterval;
                    if (this.dataMax !== null && this.dataMin !== null) {
                        for (tick; tick - increment <= this.dataMax; tick += increment) {
                            positions.push(tick);
                        }
                    }
                    return positions;
                },



            },
            yAxis: [
                {
                    lineWidth: 1,
                    title: {
                        text: "AC Voltage [V]"
                    }
                },
                {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        text: "AC Current [I]"
                    }
                }
            ],
            tooltip: {
                crosshairs: [true, false],
                followTouchMove: false,
                shared: true,
                formatter: function () {
                    var tip = "<span style=\"font-size:10px;padding-left:10px\">" + 'Time:' + new Date(this.x).toString().substring(0, 15) + "</span><br/><table>";
                    this.points.forEach(function (d) {
                        tip += '<tr><td style="color:' + d.color + ';padding:0"><span  style="color:' + d.color + '">' + d.series.name + ' </span>: </td><td style=\"padding:0\"><b>' + d.y + '';
                        if (d.series.name.substring(0, 1) == 'V') {
                            tip += ' V </b></td><br/>';
                        } else {
                            tip += ' A</b></td><br/>';
                        }
                        tip += '</tr>';
                    });
                    tip += '</table>';
                    return tip;
                }
            },
            series: [
                {
                    data: this.state.ACCurrentPhase1Data,
                    yAxis: 1,
                    svg: {
                        fill: "red"
                    },
                    color: "#0baee7",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Current L1"
                },
                {
                    data: this.state.ACCurrentPhase2Data,
                    yAxis: 1,
                    svg: {
                        fill: "blue"
                    },
                    color: "#00FFFF",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Current L2"
                },
                {
                    data: this.state.ACCurrentPhase3Data,
                    yAxis: 1,
                    svg: {
                        fill: "green"
                    },
                    color: "#008080",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Current L3"
                },
                {
                    data: this.state.ACVoltagePhase1Data,
                    yAxis: 0,
                    svg: {
                        fill: "yellow"
                    },
                    color: "#000080",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Voltage L1"
                },
                {
                    data: this.state.ACVoltagePhase2Data,
                    yAxis: 0,
                    svg: {
                        fill: "gray"
                    },
                    color: "#000000",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Voltage L2"
                },
                {
                    data: this.state.ACVoltagePhase3Data,
                    yAxis: 0,
                    svg: {
                        fill: "pink"
                    },
                    color: "#808080",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Voltage L3"
                },

            ],
            lang: {
                noData: "No data available"
            },
        };

        /*..............................................Communication Trend Graph ..................................................................................................................................*/

        var commTrendDevice = {
            loading: { showDuration: 2000 },
            chart: {
                type: "spline",
                animation: 'false',
                plotBorderColor: 'gray',
                plotBorderWidth: 0.5,
                spacingBottom: 10,
                spacingtop: 10,

                scrollablePlotArea: {
                    scrollPositionX: 1
                },
                events: {
                    load() {
                        this.chartBackground.attr({
                            width: '100%',
                        })
                    },
                },
            },
            title: {
                text: ''
            },
            xAxis: {
                maxZoom: 3600000,
                min: new Date(this.state.CTDate).setHours(0, 0, 0, 0),
                max: new Date(this.state.CTDate).setHours(0, 0, 0, 0) + (CTTimeInterval * 24),
                type: 'datetime',
                gridLineColor: 'gray',
                gridLineWidth: 0.5,
                tickInterval: CTTimeInterval,
                minorTickInterval: CTTimeInterval / 4,
                minorGridLineWidth: 0.3,
                minorGridLineColor: 'gray',
                labels: {
                    step: 1,
                    rotation: -60,
                    formatter: function () {
                        var str;
                        str = new Date(this.value).getHours().toString() + ":" + new Date(this.value).getMinutes().toString();
                        return str;
                    }
                },
                title: {
                    text: 'Time'
                },
                tickPositioner: function () {
                    var positions = [],
                        tick = new Date(Number(this.dataMin)).setMinutes(0),
                        increment = this.tickInterval;
                    if (this.dataMax !== null && this.dataMin !== null) {
                        for (tick; tick - increment <= this.dataMax; tick += increment) {
                            positions.push(tick);
                        }
                    }
                    return positions;
                },
            },
            yAxis: {
                min: 0,
                max: 7,
                labels: {
                    enabled: false
                },
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 10,
                },
                spline: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {

                followTouchMove: false,
                formatter: function () {
                    return '<b>' + new Date(this.x).toLocaleString() + '</b>';
                }
            },
            series: [{
                type: 'spline',
                color: 'gray',
                data: this.state.CTChartDevicedata,
                pointStart: new Date(this.state.CTDate).setHours(0, 0, 0, 0),
                pointIntervalUnit: CTTimeInterval / 4,
                zoneAxis: 'x',
                zones: this.state.CTChartDeviceZonedata
            }],
            lang: {
                noData: "No data available"
            },

            credits: {
                enabled: false
            }
        };
        var commTrendPortal = {
            loading: { showDuration: 2000 },
            chart: {
                type: "spline",
                animation: 'false',
                plotBorderColor: 'gray',
                plotBorderWidth: 1,
                spacingBottom: 10,
                spacingtop: 10,

                scrollablePlotArea: {
                    scrollPositionX: 1
                },
                events: {
                    load() {
                        this.chartBackground.attr({
                            width: '100%',
                        })
                    },
                },
            },
            tooltip: {

                followTouchMove: false,
                formatter: function () {
                    return '<b>' + new Date(this.x).toLocaleString() + '</b>';
                }
            },
            title: {
                text: ''
            },
            xAxis: {
                maxZoom: 3600000,
                min: new Date(this.state.CTDate).setHours(0, 0, 0, 0),
                max: new Date(this.state.CTDate).setHours(0, 0, 0, 0) + (CTTimeInterval * 24),
                type: 'datetime',
                gridLineColor: 'gray',
                gridLineWidth: 0.5,
                tickInterval: CTTimeInterval,
                minorTickInterval: CTTimeInterval / 4,
                minorGridLineWidth: 0.3,
                minorGridLineColor: 'gray',
                labels: {
                    step: 1,
                    rotation: -60,
                    formatter: function () {
                        var str;
                        str = new Date(this.value).getHours().toString() + ":" + new Date(this.value).getMinutes().toString();
                        return str;
                    }
                },
                title: {
                    text: 'Time'
                },
                tickPositioner: function () {
                    var positions = [],
                        tick = new Date(Number(this.dataMin)).setMinutes(0),
                        increment = this.tickInterval;
                    if (this.dataMax !== null && this.dataMin !== null) {
                        for (tick; tick - increment <= this.dataMax; tick += increment) {
                            positions.push(tick);
                        }
                    }
                    return positions;
                },
            },
            yAxis: {
                min: 0,
                max: 7,
                labels: {
                    enabled: false
                },
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 10,
                }, line: {
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [{
                type: 'spline',
                color: 'gray',
                data: this.state.CTChartPortaldata,
                pointStart: new Date(this.state.CTDate).setHours(0, 0, 0, 0),
                pointIntervalUnit: CTTimeInterval / 4,
                zoneAxis: 'x',
                zones: this.state.CTChartPortalZonedata
            }],
            lang: {
                noData: "No data available"
            },
            credits: {
                enabled: false
            }
        };

        /*........................................................Power Irradiance Graph ....................................................................................................................................................*/
        var powerIrr = {


            loading: { showDuration: 1000 },
            chart: {
                type: "spline",
                animation: 'false',

                pinchType: 'x',
                panning: true,

                resetZoomButton: {
                    position: {
                        align: 'right', // by default
                        verticalAlign: 'bottom', // by default
                        x: 8,
                        y: 20
                    }
                },
                svg: {
                    fill: "red"
                },

            },
            title: {
                text: ''
            },
            credits: {
                enabled: false
            },
            xAxis: {

                tickInterval: 3600000,
                labels: {
                    step: 1, rotation: -45,
                    formatter: function () {
                        var str;
                        str = new Date(this.value).getHours().toString() + ":" + new Date(this.value).getMinutes().toString();
                        return str;
                    }
                },

                type: 'datetime',
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                title: {
                    text: 'Time'
                },

            },
            tooltip: {
                crosshairs: [true, false],
                followTouchMove: false,
                shared: true,
                formatter: function () {
                    var tip = "<span style=\"font-size:10px;padding-left:10px\">" + new Date(this.x).toString().substring(0, 15) + "</span><br/><table>";

                    this.points.forEach(function (d) {
                        tip += '<tr><td style="color:' + d.color + ';padding:0"><span  style="color:' + d.color + '">' + d.series.name + ' </span>: </td><td style=\"padding:0\"><b>' + d.y + '';
                        if (d.series.name.substring(0, 1) == 'P') {
                            tip += ' kW  </b></td><br/>';
                        } else {
                            tip += ' W/m2  </b></td><br/>';
                        }
                        tip += '</tr>';
                    });


                    tip += '</table>';
                    return tip;
                }
            },
            plotOptions: {
                spline: {
                    allowPointSelect: false,
                    cursor: 'pointer',
                    size: 275,
                    center: ["16%", "50%"],
                    dataLabels: {
                        enabled: false,
                    },
                    showInLegend: true,
                    minSize: 130,
                    colors: ['#7DA0B0', '#9264AA', '#4F2A72', '#9A3968', '#BF5269', '#E16553', '#E3985E', '#E4BF80', '#75C494', '#52584B']
                }
            },
            yAxis: [
                {
                    lineWidth: 1,
                    title: {
                        text: "Irradiance [W/m2]"
                    },
                },
                {
                    lineWidth: 1,
                    opposite: true,
                    title: {
                        text: "Power [kW]"
                    }

                },
            ],
            legend: {
                symbolWidth: 10,
                symbolPadding: 15
            },
            series: [
                {
                    data: this.state.irradianceTimeData,
                    yAxis: 0,
                    svg: {
                        fill: "red"
                    },
                    color: "#fc9c3d",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Irradiance-"
                },
                {
                    data: this.state.powerTimeData,
                    yAxis: 1,
                    svg: {
                        fill: "red"
                    },
                    color: "#f01f1f",
                    marker: { symbol: 'circle', radius: 10 },
                    name: "Power-"
                }
            ],
            lang: {
                noData: "No data available"
            },
        };
        const options = {
            global: {
                useUTC: false
            },
            lang: {
                decimalPoint: ".",
                thousandsSep: ","
            },
            exporting: { enabled: false }
        };

        /*.................................................Performance Ratio...........................................................................................................................................................................................*/
        var confmonth = {
            loading: { showDuration: 1500 },
            chart: {
                type: "column",
                pinchType: 'x',
                panning: 'true',
                resetZoomButton: {
                    position: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        x: 8,
                        y: 20
                    }
                },

                events: {
                    drilldown: function (e) {
                        if (!e.seriesOptions) {
                            this.yAxis[0].update({
                                labels: {
                                    format: '{value}'
                                }
                            }, false, false);
                            var chart = this;
                            chart.showLoading('Loading ' + e.point.name + ' graph...');
                            $.ajax({
                                type: 'post',
                                datatype: 'json',
                                contentType: 'application/json;charset=utf-8',
                                headers: { 'tokenid': JSON.parse(e.point.dnData)[0].token, 'siteid': JSON.parse(e.point.dnData)[0].site, 'evtime': JSON.parse(e.point.dnData)[0].date, 'prsearchtype': 'day' },
                                url: 'http://web103.64.202.new.ocpwebserver.com//dlrapiV1/api/Analytics/PR',
                                success: function (response) {
                                    const obj = {
                                        name: 'Drill',
                                        type: 'pie',
                                        data: [
                                            { name: response.SitePRCalculated[0].PR + '%', y: parseFloat(response.SitePRCalculated[0].PR), color: '#b97f22' },
                                            { name: (100 - parseFloat(response.SitePRCalculated[0].PR)).toFixed(2) + '%', y: 100 - parseFloat(response.SitePRCalculated[0].PR), color: '#808080' }
                                        ]
                                    }
                                    chart.hideLoading();
                                    chart.addSeriesAsDrilldown(e.point, obj);
                                },
                                error: function (error) {
                                    alert(error);
                                }
                            });
                        }
                    }
                }
            },
            title: {
                text: ""
            },
            credits: {
                enabled: false
            },
            legend: {

                symbolWidth: 10,
                symbolPadding: 15
            },
            xAxis: {

                type: "Time",
                categories: this.state.xPRChartLabel,

                gridLineColor: "#c3c3c3",
                lineWidth: 1,
                labels: {
                    step: 1,
                    rotation: -45,
                    formatter: function () {
                        return new Date(this.value).getDate().toString();
                    }
                },
                title: {
                    text: "Date"
                },

            },
            yAxis: {
                lineWidth: 1,
                min: 0,
                title: {
                    text: "PR%"
                },
                gridLineColor: "#c3c3c3"
            },

            plotOptions: {
                pie: {
                    innerSize: 65,
                    depth: 45
                }
            },
            series: [
                {
                    name: "Monthly PR %",
                    data: this.state.PRchartPointValue,
                    color: '#b97f22',
                    marker: { symbol: 'circle', radius: 10 },
                },
            ],
            lang: {
                noData: this.state.PR_API_Status_Message
            },
            drilldown: {
                series:
                    []
            },
            tooltip: {

                followTouchMove: false,
                formatter: function () {
                    return '<strong>Performance Ratio: </strong>' + this.y;
                }
            }
        };

        /*........................................Yield Config...........................................................................................................*/
        var yieldConfYearly = {
            loading: { showDuration: 1000 },
            chart: {
                type: "column",
                pinchType: 'x',
                resetZoomButton: {
                    position: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        x: 8,
                        y: 20
                    }
                },

            },
            title: {
                text: ""
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    cursor: 'pointer'
                }
            },
            xAxis: {
                categories: this.state.xYieldChartLabel,

                gridLineColor: "#c3c3c3",
                color: "#fc9c3d",
                labels: {
                    formatter: function () {
                        return this.value.split('-')[1];
                    }
                },
                title: {
                    text: "Time"
                },


            },
            yAxis: {
                lineWidth: 1,
                min: 0,
                title: {
                    text: "kWh"
                },
                gridLineColor: "#c3c3c3"
            },

            tooltip: {
                followTouchMove: false,
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' + this.y + ' kWh.';
                }
            },
            series: [
                {
                    name: "Yield",
                    data: this.state.YieldchartPointValue,
                    color: '#b97f22',
                }
            ],
            lang: {
                noData: "No data available"
            },
        };

        /*....................................................Yield Config Monthly...........................................................................................................*/
        var yieldConfMonthly = {
            chart: {
                loading: { showDuration: 1000 },
                type: "column",
                pinchType: 'x',
                resetZoomButton: {
                    position: {
                        align: 'right', // by default
                        verticalAlign: 'bottom', // by default
                        x: 8,
                        y: 20
                    }
                },

            },
            title: {
                text: ""
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    cursor: 'pointer'
                }
            },
            xAxis: {
                gridLineColor: "#c3c3c3",
                color: "#fc9c3d",
                tickInterval: 3600000 * 24,

                labels: {
                    rotation: -45,
                    step: 1,
                    formatter: function () {
                        return new Date(this.value).getDate().toString();
                    }
                },

                title: {
                    text: "Time"
                },

            },
            yAxis: {
                lineWidth: 1,

                min: 0,
                title: {
                    text: "kWh"
                },
                gridLineColor: "#c3c3c3"
            },
            tooltip: {

                followTouchMove: false,
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' + this.y + ' kWh.';
                }
            },
            series: [
                {
                    name: "Yield",
                    data: this.state.YieldDailyData,
                    color: '#b97f22',

                }
            ],
            lang: {
                noData: "No data available"
            },
        };

        /*................................................Yield Config Daily..............................................................................................*/
        var yieldConfDaily = {
            chart: {
                loading: { showDuration: 1000 },
                type: "spline",
                pinchType: 'x',
                resetZoomButton: {
                    position: {
                        align: 'right', // by default
                        verticalAlign: 'bottom', // by default
                        x: 8,
                        y: 20
                    }
                },

            },
            title: {
                text: ""
            },
            credits: {
                enabled: false
            },
            xAxis: {


                gridLineColor: "#c3c3c3",
                color: "#fc9c3d",
                title: {
                    text: 'Time'

                },

                tickInterval: 3600000,
                tickPositioner: function () {
                    var positions = [],
                        tick = new Date(Number(this.dataMin)).setMinutes(0),
                        increment = this.tickInterval;
                    if (this.dataMax !== null && this.dataMin !== null) {
                        for (tick; tick - increment <= this.dataMax; tick += increment) {
                            positions.push(tick);
                        }
                    }
                    return positions;
                },
                labels: {
                    step: 1,
                    rotation: -45,
                    formatter: function () {
                        var str;
                        str = new Date(this.value).getHours().toString() + ":" + new Date(this.value).getMinutes().toString();
                        return str;
                    }
                },


            },
            yAxis: {
                lineWidth: 1,
                min: 0,
                title: {
                    text: "kWh"
                },
                gridLineColor: "#c3c3c3"
            },
            tooltip: {
                crosshairs: [true, false],
                followTouchMove: false,
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' + this.y + ' kWh.';
                }
            },
            series: [
                {
                    name: "Yield",
                    data: this.state.YieldDailyData,
                    color: '#b97f22',

                }
            ],
            lang: {
                noData: "No data available"
            },
        };

        /*...................................................Analytics View.........................................................................................*/

        return (


            <CommonView menuText={'Analytics'} >


                <View style={{ flex: 1, }}>

                    <ScrollView horizontal={false} refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                            style={{}}
                        />
                    }



                        removeClippedSubviews={false}

                    >



                        {/*.................................................... Irradiance vs AC Start...................................................... */}

                        <View
                            scrollDirection={"horizontal"}
                            style={{ width: screenWidth, flex: 1, borderBottomColor: 'gray', borderBottomWidth: 1, overflow: "hidden" }}>
                            <View
                                style={{
                                    flexDirection: "row",

                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginTop: 10
                                }}>
                                <SimpleLineIcons
                                    name="energy"
                                    size={23}
                                    style={{ color: "gray" }} />
                                <Text
                                    style={{
                                        color: "gray",
                                        fontWeight: "bold",
                                        alignItems: "center",
                                        fontSize: 16
                                    }} > Irradiance Vs AC Power
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <DatePicker
                                    style={{ width: '80%', backgroundColor: 'transparent', marginTop: 10, marginBottom: 10 }}
                                    date={this.state.start_date}
                                    mode="date"
                                    placeholder="select date"
                                    format="DD-MMM-YYYY"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            right: 0,
                                            top: 0,
                                            marginLeft: 0,
                                            height: 0,
                                            opacity: 0,
                                            width: 0
                                        }, dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: '#8d9393',
                                            backgroundColor: APP_BUTTON_GREEN,
                                            width: '100%',
                                            padding: 1,
                                            height: 30,
                                            elevation: 3,
                                        },
                                        dateText: {
                                            color: 'white',
                                            justifyContent: 'center',
                                            textAlign: 'center'
                                        }
                                    }}
                                    onDateChange={(start_date) => { this.setPiDate(start_date) }} />
                            </View>

                            <View style={{ overflow: "hidden" }}>


                                <ChartView
                                    style={{
                                        height: Dimensions.get("window").height / 1.6,
                                        width: Dimensions.get("window").width
                                    }}
                                    config={powerIrr}
                                    options={options} originWhitelist={['']} />


                            </View>
                        </View>



                        {/*.................................................... Performance Ratio View...................................................... */}


                        <View scrollDirection={"horizontal"} style={{ width: screenWidth, borderBottomColor: 'gray', borderBottomWidth: 1, overflow: "hidden" }}>
                            <View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        marginTop: 10,
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                    <Foundation
                                        name="graph-pie"
                                        size={25}
                                        style={{ color: "gray", paddingHorizontal: 5 }} />
                                    <Text
                                        style={{
                                            color: "gray",
                                            fontWeight: "bold",
                                            alignItems: "center",
                                            fontSize: 16
                                        }}> Performance Ratio
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                    <DatePicker
                                        style={{ width: '80%', backgroundColor: 'transparent', marginTop: 10, marginBottom: 10 }}
                                        date={this.state.prDate}
                                        mode="date"
                                        placeholder="select date"
                                        format="DD-MMM-YYYY"
                                        maxDate={this.state.todayDate}
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateIcon: {
                                                right: 0,
                                                top: 0,
                                                marginLeft: 0,
                                                height: 0,
                                                opacity: 0,
                                                width: 0
                                            }, dateInput: {
                                                left: 0,
                                                borderWidth: 0,
                                                color: '#8d9393',
                                                backgroundColor: APP_BUTTON_GREEN,
                                                width: '100%',
                                                padding: 1,
                                                height: 30,
                                                elevation: 3,
                                            },
                                            dateText: {
                                                color: 'white',
                                                justifyContent: 'center',
                                                textAlign: 'center'
                                            }
                                        }}
                                        onDateChange={(prDate) => { this.setPrDate(prDate) }} />
                                </View>
                                <View style={styles.tabsContent}>
                                    <View style={[styles.tabContent]}>
                                        <View>

                                            <ChartView
                                                style={{
                                                    height: Dimensions.get("window").height / 1.6,
                                                    width: Dimensions.get("window").width * 0.95
                                                }}
                                                config={confmonth}
                                                options={options} originWhitelist={['']} />

                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>


                        {/*.................................................... Yield View...................................................... */}


                        <View
                            scrollDirection={"horizontal"}
                            style={{ width: screenWidth, flex: 1, borderBottomColor: 'gray', borderBottomWidth: 1, overflow: "hidden" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    marginTop: 10,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <FontAwesome name="signal" size={20} style={{ color: "gray", paddingHorizontal: 5 }} />
                                <Text
                                    style={{
                                        color: "gray",
                                        fontWeight: "bold",
                                        alignItems: "center",
                                        fontSize: 16
                                    }}>
                                    Yield
                                        </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <DatePicker
                                    style={{ alignItems: 'center', width: '80%', backgroundColor: 'transparent', marginTop: 10, marginBottom: 10 }}
                                    date={this.state.yieldDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="DD-MMM-YYYY"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            right: 0,
                                            top: 0,
                                            marginLeft: 0,
                                            height: 0,
                                            opacity: 0,
                                            width: 0
                                        }, dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: APP_BUTTON_GREEN,
                                            backgroundColor: APP_BUTTON_GREEN,
                                            width: '100%',
                                            padding: 1,
                                            height: 30,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            elevation: 3,
                                        },
                                        dateText: {
                                            color: 'white',
                                            justifyContent: 'center',
                                            textAlign: 'center'
                                        }
                                    }}
                                    onDateChange={(yieldDate) => { this.setYieldDate(yieldDate) }} />
                            </View>
                            <View style={styles.tabLinks}>

                                <TouchableOpacity
                                    style={[
                                        styles.tabLink,
                                        this.state.activeTabIndexYield === 1 ? styles.activeTabLink : ""
                                    ]}
                                    onPress={() => this.yieldGraphAPI(1)}>
                                    <View
                                        style={[
                                            styles.tab,
                                            this.state.activeTabIndexYield === 1 ? styles.activeTab : ""
                                        ]}>
                                        <Text
                                            style={styles.tabLinkText}>
                                            Daily
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.tabLink,
                                        this.state.activeTabIndexYield === 2 ? styles.activeTabLink : ""
                                    ]}
                                    onPress={() => this.yieldGraphAPI(2)}>
                                    <View
                                        style={[
                                            styles.tab,
                                            this.state.activeTabIndexYield === 2 ? styles.activeTab : ""
                                        ]}>
                                        <Text
                                            style={styles.tabLinkText}>
                                            Monthly
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.tabLink,
                                        this.state.activeTabIndexYield === 3 ? styles.activeTabLink : ""
                                    ]}
                                    onPress={() => this.yieldGraphAPI(3)}>
                                    <View
                                        style={[
                                            styles.tab,
                                            this.state.activeTabIndexYield === 3 ? styles.activeTab : ""
                                        ]}>
                                        <Text
                                            style={styles.tabLinkText}>
                                            Yearly
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingTop: 15, overflow: "hidden" }}>


                                <ChartView
                                    style={{
                                        height: (Dimensions.get("window").height / 1.6),
                                        width: Dimensions.get("window").width * 0.95
                                    }}
                                    config={this.state.activeTabIndexYield == 1 ? yieldConfDaily : this.state.activeTabIndexYield == 2 ? yieldConfMonthly : yieldConfYearly}
                                    options={options} originWhitelist={['']}
                                />


                            </View>

                        </View>


                        {/*.................................................... AC Voltage View...................................................... */}


                        <View
                            scrollDirection={"horizontal"}
                            style={{ width: screenWidth, flex: 1, borderBottomColor: 'gray', borderBottomWidth: 1, overflow: "hidden" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    padding: 13,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <MaterialCommunityIcons
                                    name="current-ac" size={25} style={{ color: "gray" }} />
                                <Text
                                    style={{
                                        color: "gray",
                                        fontWeight: "bold",
                                        alignItems: "center",
                                        fontSize: 16
                                    }}> AC Voltage &amp; Current
                                        </Text>
                            </View>
                            <View>
                                <View style={[styles.androidDevice, { alignItems: 'center' }]}>
                                    <View style={{
                                        width: '80%', textAlign: 'center', elevation: 3
                                    }}>
                                        <Picker
                                            selectedValue={this.state.pickerInverterAC}
                                            style={{ height: 30, width: '100%', backgroundColor: APP_BUTTON_GREEN, color: '#ffffff', elevation: 2 }}
                                            onValueChange={(itemValue) => {
                                                if (itemValue != this.state.pickerInverterAC) {
                                                    this.setInverterAC(itemValue)

                                                }
                                            }

                                            }>
                                            {this.state.inverterList.map((item, key) => (
                                                <Picker.Item label={"Inverter" + " " + item} value={item} key={key} />)
                                            )}
                                        </Picker>
                                        <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, top: 15, elevation: 6 }} />
                                    </View>
                                </View>
                                <View style={[styles.iosDevice, { alignItems: 'center' }]}>
                                    <TouchableOpacity onPress={() => this.setState({ acModalVisible: true })} style={{ height: 30, backgroundColor: APP_BUTTON_GREEN, width: '80%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.3 }}>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Inverter {this.state.pickerInverterAC}</Text>
                                        <Modal
                                            onRequestClose={() => { }}
                                            animationType="slide"
                                            transparent={true}
                                            visible={this.state.acModalVisible}>
                                            <TouchableOpacity onPress={() => this.setState({ acModalVisible: false })} style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 15 }}>
                                                <View style={{ backgroundColor: '#ffffff', borderRadius: 15 }}>
                                                    <Picker
                                                        selectedValue={this.state.pickerInverterAC}

                                                        style={{ width: '100%', elevation: 2 }}
                                                        onValueChange={(itemValue) =>
                                                            this.setState({ acModalVisible: false }, this.setInverterAC(itemValue))
                                                        }>
                                                        <Picker.Item label={"Select Inverter"} value={0} key={0} />
                                                        {this.state.inverterList.map((item, key) => (
                                                            <Picker.Item label={"Inverter" + " " + item} value={item} key={key} />)
                                                        )}
                                                    </Picker>
                                                </View>
                                            </TouchableOpacity>
                                        </Modal>
                                        <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, elevation: 6 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <DatePicker
                                    style={{
                                        width: '80%', backgroundColor: APP_BUTTON_GREEN, marginTop: 10, elevation: 3,
                                        height: 30, justifyContent: 'center', alignItems: 'center'
                                    }}
                                    date={this.state.ACDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="DD-MMM-YYYY"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            right: 0,
                                            top: 0,
                                            marginLeft: 0,
                                            height: 0,
                                            opacity: 0,
                                            width: 0
                                        }, dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: '#8d9393',
                                            backgroundColor: APP_BUTTON_GREEN,
                                            width: '100%',
                                            padding: 0,
                                            margin: 0,
                                            height: 25
                                        },
                                        dateText: {
                                            color: 'white',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            padding: 0,
                                            margin: 0
                                        }
                                    }}
                                    onDateChange={(ACDate) => { this.setACDate(ACDate) }}
                                />
                            </View>
                            <View style={{ paddingTop: 30, overflow: "hidden" }}>


                                <ChartView
                                    style={{
                                        height: (Dimensions.get("window").height / 1.6),
                                        width: Dimensions.get("window").width
                                    }}
                                    config={ACVoltageCurrent}
                                    options={options} originWhitelist={['']} />


                            </View>
                        </View>



                        {/*.................................................... DC Voltage View...................................................... */}


                        <View
                            scrollDirection={"horizontal"}
                            style={{ width: screenWidth, flex: 1, borderBottomColor: 'gray', borderBottomWidth: 1, overflow: "hidden" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    padding: 13,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <MaterialCommunityIcons
                                    name="current-dc"
                                    size={24}
                                    style={{ color: "gray" }} />
                                <Text
                                    style={{
                                        color: "gray",
                                        fontWeight: "bold",
                                        alignItems: "center",
                                        fontSize: 16
                                    }} > DC Voltage &amp; Current
                                            </Text>
                            </View>
                            <View>
                                <View style={[styles.androidDevice, { alignItems: 'center' }]}>
                                    <View style={{
                                        width: '80%', textAlign: 'center', elevation: 3
                                    }}>
                                        <Picker
                                            selectedValue={this.state.pickerInverterDC}
                                            style={{ height: 30, width: '100%', backgroundColor: APP_BUTTON_GREEN, color: '#ffffff', elevation: 2 }}
                                            onValueChange={(itemValue) => {
                                                if (itemValue != this.state.pickerInverterDC) {
                                                    this.setInverterDC(itemValue)

                                                }
                                            }

                                            }>
                                            {this.state.inverterList.map((item, key) => (
                                                <Picker.Item label={"Inverter" + " " + item} value={item} key={key} />)
                                            )}
                                        </Picker>
                                        <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, top: 15, elevation: 2 }} />
                                    </View>
                                </View>
                                <View style={styles.iosDevice}>
                                    <TouchableOpacity onPress={() => this.setState({ dcModalVisible: true })} style={{ height: 30, backgroundColor: APP_BUTTON_GREEN, width: '80%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.3 }}>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>Inverter {this.state.pickerInverterDC}</Text>
                                        <Modal
                                            onRequestClose={() => { }}
                                            animationType="slide"
                                            transparent={true}
                                            visible={this.state.dcModalVisible}>
                                            <TouchableOpacity onPress={() => { this.setState({ dcModalVisible: false }) }} style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 15 }}>
                                                <View style={{ backgroundColor: '#ffffff', borderRadius: 15 }}>
                                                    <Picker
                                                        selectedValue={this.state.pickerInverterDC}
                                                        style={{ width: '100%', elevation: 5 }}
                                                        onValueChange={(value) => {
                                                            if (value != this.state.pickerInverterDC) {
                                                                this.setState({
                                                                    dcModalVisible: false,
                                                                }, this.setInverterDC(value));

                                                            }
                                                        }

                                                        }>
                                                        <Picker.Item label={"Select Inverter"} value={0} key={0} />
                                                        {this.state.inverterList.map((item, key) => (
                                                            <Picker.Item label={"Inverter" + " " + item} value={item} key={key} />)
                                                        )}
                                                    </Picker>
                                                </View>
                                            </TouchableOpacity>
                                        </Modal>
                                        <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, elevation: 6 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <DatePicker
                                    style={{
                                        width: '80%', backgroundColor: APP_BUTTON_GREEN, marginTop: 10, elevation: 3,
                                        height: 30, justifyContent: 'center', alignItems: 'center'
                                    }}
                                    date={this.state.DCDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="DD-MMM-YYYY"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            right: 0,
                                            top: 0,
                                            marginLeft: 0,
                                            height: 0,
                                            opacity: 0,
                                            width: 0
                                        }, dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: '#8d9393',
                                            backgroundColor: APP_BUTTON_GREEN,
                                            width: '100%',
                                            margin: 0,
                                            padding: 0,
                                            height: 30
                                        },
                                        dateText: {
                                            color: 'white',
                                            justifyContent: 'center',
                                            textAlign: 'center'
                                        }
                                    }}
                                    onDateChange={(DCDate) => { this.setDCDate(DCDate) }}
                                />
                            </View>
                            <View style={{ paddingTop: 30, overflow: "hidden" }}>


                                <ChartView
                                    style={{
                                        height: (Dimensions.get("window").height / 1.6),
                                        width: Dimensions.get("window").width
                                    }}
                                    config={DCVoltageCurrent}
                                    options={options} originWhitelist={['']} />


                            </View>
                        </View>

                        {/*.................................................... Communication Trend View...................................................... */}

                        <View
                            scrollDirection={"horizontal"}
                            style={{ width: screenWidth, flex: 1, borderBottomColor: 'gray', borderBottomWidth: 1, overflow: "hidden" }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    padding: 13,
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <MaterialIcons
                                    name="settings-input-antenna"
                                    size={23}
                                    style={{ color: "gray" }} />
                                <Text
                                    style={{
                                        color: "gray",
                                        fontWeight: "bold",
                                        alignItems: "center",
                                        fontSize: 16
                                    }} > Communication Trend
                                    </Text>


                            </View>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                <DatePicker
                                    style={{
                                        width: '80%', backgroundColor: APP_BUTTON_GREEN, marginBottom: 10, elevation: 3,
                                        height: 30, justifyContent: 'center', alignItems: 'center'
                                    }}
                                    date={this.state.CTDate}
                                    mode="date"
                                    placeholder="select date"
                                    format="DD-MMM-YYYY"
                                    maxDate={this.state.todayDate}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateIcon: {
                                            right: 0,
                                            top: 0,
                                            marginLeft: 0,
                                            height: 0,
                                            opacity: 0,
                                            width: 0
                                        }, dateInput: {
                                            left: 0,
                                            borderWidth: 0,
                                            color: '#8d9393',
                                            backgroundColor: APP_BUTTON_GREEN,
                                            width: '100%',
                                            margin: 0,
                                            padding: 0,
                                            height: 30
                                        },
                                        dateText: {
                                            color: 'white',
                                            justifyContent: 'center',
                                            textAlign: 'center'
                                        }
                                    }}
                                    onDateChange={(comtDate) => { this.setCommTrendDate(comtDate) }} />
                            </View>
                            <View style={{ elevation: 2, paddingLeft: 15, paddingRight: 15 }}>
                                <View style={styles.androidDevice}>
                                    <View style={{
                                        width: '87%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center',
                                        textAlign: 'center', elevation: 2
                                    }}>
                                        <Picker
                                            selectedValue={this.state.pickerGateway}
                                            style={{ height: 30, width: '100%', backgroundColor: APP_BUTTON_GREEN, color: '#ffffff', elevation: 2 }}

                                            onValueChange={(itemValue) => {
                                                if (itemValue != this.state.pickerGateway) {
                                                    this.setState({
                                                        ctModalVisible: false,
                                                    }, this.setGateway(itemValue));

                                                }
                                            }
                                            }>
                                            {
                                                this.state.gatewayList.map(
                                                    (item, key) => (
                                                        <Picker.Item label={"MAC ID" + " " + item} value={item} key={key} />
                                                    )
                                                )}

                                        </Picker>
                                        <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, top: 15, elevation: 2 }} />
                                    </View>
                                </View>
                                <View style={styles.iosDevice}>
                                    <TouchableOpacity onPress={() => this.setState({ ctModalVisible: true })} style={{ height: 30, backgroundColor: APP_BUTTON_GREEN, width: '87%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.3 }}>
                                        <Text style={{ color: '#ffffff', textAlign: 'center' }}>{"MAC ID" + " " + this.state.pickerGateway}</Text>
                                        <Modal
                                            onRequestClose={() => { }}
                                            animationType="slide"
                                            transparent={true}
                                            visible={this.state.ctModalVisible}>
                                            <TouchableOpacity onPress={() => this.setState({ ctModalVisible: false })} style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 15 }}>
                                                <View style={{ backgroundColor: '#ffffff', borderRadius: 15 }}>
                                                    <Picker
                                                        selectedValue={this.state.pickerGateway}
                                                        style={{ width: '100%', elevation: 2 }}
                                                        onValueChange={(itemValue) =>
                                                            this.setState({ ctModalVisible: false }, this.setGateway(itemValue))
                                                        }>

                                                        {
                                                            this.state.gatewayList.map(
                                                                (item, key) => (
                                                                    <Picker.Item label={"MAC ID" + " " + item} value={item} key={key} />
                                                                )
                                                            )}
                                                    </Picker>
                                                </View>
                                            </TouchableOpacity>
                                        </Modal>
                                        <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, elevation: 2 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{
                                flexDirection: "row",
                                padding: 13,
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Text style={{
                                    color: "gray",
                                    fontWeight: "normal",
                                    alignItems: "center",

                                    fontSize: 14
                                }}>{this.state.xCTChartDeviceLabel}</Text></View>

                            <View style={{ paddingTop: 5, alignItems: "center", justifyContent: "center", flex: 1, overflow: "hidden" }}>



                                <ChartView style={{ height: Dimensions.get("window").height / 4.5, width: (Dimensions.get("window").width) - 10 }} config={commTrendDevice} options={options} originWhitelist={['']}></ChartView>

                            </View>

                            <View style={{
                                flexDirection: "row",
                                padding: 13,
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Text style={{
                                    color: "gray",
                                    fontWeight: "normal",
                                    alignItems: "center",

                                    fontSize: 14
                                }}>{this.state.xCTChartPortalLabel}</Text></View>
                            <View style={{ paddingTop: 5, alignItems: "center", justifyContent: "center", flex: 1, overflow: "hidden" }}>

                                <ChartView style={{ height: Dimensions.get("window").height / 4.5, width: (Dimensions.get("window").width - 10) }} config={commTrendPortal} options={options} originWhitelist={['']}></ChartView>


                                <View style={styles.CTIndicatorsDiv}>
                                    <View style={styles.CTComSleepIndicator}>
                                    </View><View ><Text style={styles.CTLegendFont}>Sleep mode</Text></View>
                                    <View style={styles.CTComIndicator}>
                                    </View><View><Text style={styles.CTLegendFont}>Communicating</Text></View>
                                    <View style={styles.CTComNonIndicator}>
                                    </View><View ><Text style={styles.CTLegendFont}>Not communicating</Text></View>
                                </View>

                            </View>


                        </View>

                    </ScrollView>

                </View>

            </CommonView >


        );
    }
}

/*.................................................... Styles...................................................... */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    androidDevice: {
        display: Platform.OS === 'ios' ? 'none' : 'flex'
    },
    iosDevice: {
        display: Platform.OS === 'ios' ? 'flex' : 'none'
    },
    loginBannerImage: {
        width: "100%",
        height: "100%",
        paddingRight: 0,
        paddingLeft: 0,
        resizeMode: "cover"
    },
    innerCircle: {
        borderRadius: 35,
        width: 20,
        height: 20,
        paddingTop: 10,
        backgroundColor: "gray",
        borderColor: "white",
        borderWidth: 1,
        marginLeft: 7,
        marginRight: 10
    },
    cusButtonLargeGreenPR: {
        marginBottom: 20,
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        height: 30,
        elevation: 2
    },
    cusButtonLargeGreen: {
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        height: 30,
        elevation: 2
    },
    cusButtonLargeGreenIn: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#44AC30",
        width: screenWidth - 100,
        padding: 15,
        color: "white",
        elevation: 2,
        textAlign: "center"
    },
    tabLinks: {
        flex: 1,
        flexDirection: "row",
        borderTopWidth: 2,
        borderTopColor: "#D9DED8",
        padding: 5


    },
    tabLink: {
        flex: 1,
        backgroundColor: "#D9DED8",
        borderRightWidth: 1,
        borderRightColor: "#fff",
        padding: 3,
        paddingBottom: 0
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingBottom: 10
    },
    activeTab: {
        borderBottomColor: "green",
        borderBottomWidth: 2
    },
    tabLinkText: {
        marginLeft: 5,
        fontSize: 14,
        color: 'gray'
    },
    activeTabLink: {
        backgroundColor: "#fff"
    },
    tabsContent: {
        backgroundColor: "#fff",
        paddingTop: 15,
        paddingBottom: 15
    },
    tabContent: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between"
    },
    /*  activeTabContent: {
         display: "flex"
     }, */
    singleTabContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 10
    },
    innerCircle1: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: "green"
    },
    innerCircle2: {
        borderRadius: 35,
        width: 10,
        height: 10,
        margin: 5,
        backgroundColor: "blue"
    },
    bellCircle: {
        borderRadius: 35,
        width: 18,
        height: 18,
        margin: 5,
        backgroundColor: "red",
        position: "absolute",
        top: -15
    },
    slide1: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#9DD6EB"
    },
    slide2: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#97CAE5"
    },
    slide3: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#92BBD9"
    },
    _text: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "bold"
    },
    get text() {
        return this._text;
    },
    set text(value) {
        this._text = value;
    },
    ImageCarouselIndicatorsDiv: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        justifyContent: 'center',
        marginTop: -38
    },
    ImageCarouselIndicator: {
        width: 10,
        height: 10,
        backgroundColor: '#efefef',
        margin: 5,
        borderRadius: 100
    },
    ImageCarouselActiveIndicator: {
        backgroundColor: 'green'
    },
    CTComIndicator: {
        width: 15,
        height: 15,
        backgroundColor: 'green',
        margin: 5,
        borderRadius: 100
    },
    CTLegendFont: {
        fontSize: 10,
        color: 'gray'
    },
    CTComNonIndicator: {
        width: 15,
        height: 15,
        backgroundColor: 'red',
        margin: 5,
        borderRadius: 100
    },
    CTComSleepIndicator: {
        width: 15,
        height: 15,
        backgroundColor: 'gray',
        margin: 5,
        borderRadius: 100
    },
    CTIndicatorsDiv: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        justifyContent: 'center',
        marginTop: 5
    }
});

export default Analytics;
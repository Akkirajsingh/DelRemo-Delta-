import React from 'react';
import {
    StyleSheet,
    RefreshControl,
    Text,
    NetInfo,
    ScrollView,
    View,
    KeyboardAvoidingView,
    TouchableOpacity,
    Dimensions, AsyncStorage, ToastAndroid, Platform, Alert
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons, SimpleLineIcons, Feather, Entypo } from '@expo/vector-icons';
import CommonView from "../components/CommonView";
import { HOME_INFO, SITE_KWH, PWR_ND_IRR, BASIC } from '../constants/APIurl';
import { PR } from '../constants/APIurl';
import { APP_BUTTON_GREEN, DASHBOARD_MNTHYIELD_GRAPH, DASHBOARD_IRR_GRAPH, DASHBOARD_PWR_GRAPH } from '../constants/ColorMaster';
import { INDIAN_CURR, SRILANKA_CURR, THAI_CURR, CO2_CONSTANT, REVENUE_CONSTANT } from '../constants/OtherConstants';
//import ChartView from 'react-native-highcharts';
import ChartView from '../Screens/webview.js';
import aPIStatusInfo from "../components/ErrorHandler";

console.disableYellowBox = true;
const data = [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4];
var xCategories = [];
var yCHartPoints = [];
var xCategoriesPrev = [];
var yCHartPointsPrev = [];
var xTimeLabel = [];
var yIrrLabel = [];
var yPowerLabel = [];
var xTimeLabelPrev = [];
var yIrrLabelPrev = [];
var yPowerLabelPrev = [];
var yIrrDataPrev = [];
var yPowerDataPrev = [];
var yIrrData = [];
var yPowerData = [];
let connnection_Status = 'true';

/*................................... Class to create Dashboard.................................................................*/

class DashboardScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            YieldDailyData: [],
            username: '',
            password: '',
            xChartLabel: [],
            xChartLabelPrev: [],
            isLoading: true,
            showGraph: false,
            login_text: 'Login',
            showMenu: false,
            backgroundColor: 'white',
            color: 'gray',
            header: 'Site Listing',
            chartPointValue: [],
            chartPointValuePrev: [],
            restToken: '',
            siteId: '',
            siteName: '',
            dataDate: '',
            dataDatePrev: '',
            showPIGraph: true,
            xPowerChartLabel: [],
            yLeftLabel: [],
            yRightLabel: [],
            xPowerChartLabelPrev: [],
            yLeftLabelPrev: [],
            yRightLabelPrev: [],
            comStatus: [],
            powerData: 0,
            todayMwh: 0,
            totalCo2: 0,
            totalKWH: 0,
            prr: 0,
            revenue: 0,
            dataMonthPrev: '',
            cMonthName: '',
            pMonthName: '',
            monthlyYeildConfGraphShow: false,
            monthlyYeildConfPrevGraphShow: false,
            irrACPowerIrrGraphShow: true,
            irrACPowerIrrPrevGraphShow: true,
            curr: '',
            prValue: '',
            yIrrDataPrev: [],
            yPowerDataPrev: [],
            yIrrData: [],
            yPowerData: [],
            refreshing: false

        };

        this.props.navigation.addListener(
            'didFocus',
            async () => {

                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    connnection_Status = connectionInfo.type == 'none' ? false : true;
                });

                await NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });

                const { params } = this.props.navigation.state;

                var value = await AsyncStorage.getItem('TokenID');

                let currentDate = new Date();

                let prevDate = currentDate.setDate(currentDate.getDate() - 1);

                let currDate = new Date();

                let targetDate = new Date(currDate);
                let targetDay = targetDate.getDate();
                let targetMonth = targetDate.getMonth();
                let targetYear = targetDate.getFullYear();

                /**
                * Prev data
                * */
                let targetDatePrev = new Date(prevDate);
                let targetDayPrev = targetDatePrev.getDate();
                let targetMonthPrev = targetDatePrev.getMonth();
                let targetYearPrev = targetDatePrev.getFullYear();

                const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
                ];
                await AsyncStorage.setItem('SiteID', params.SiteData.toString()).then(() => {
                });

                this.setState({
                    siteId: params.SiteData,
                    restToken: value,
                    comStatus: params.comStatus,
                    dataDate: targetDay + '-' + monthNames[targetMonth] + '-' + targetYear,
                    dataDatePrev: targetDayPrev + '-' + monthNames[targetMonthPrev] + '-' + targetYearPrev,
                    dataMonthPrev: '01' + '-' + monthNames[targetMonth - 1] + '-' + targetYear,
                    data1: data,

                    cMonthName: monthNames[targetMonth] + '-' + targetYear,
                    pMonthName: monthNames[targetMonth - 1] + '-' + targetYear,
                }, function () { this._dashboardData(); });
            }
        );
    }


    /*................................... Getting Dashboard data on load.................................................................*/

    _dashboardData = () => {

        this.setState({ refreshing: true });

        var responsePI = '';
        var responsePIPrev = '';
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(PWR_ND_IRR, {
            method: "POST",
            "headers": {
                tokenid: this.state.restToken,
                siteid: this.state.siteId,
                evtime: this.state.dataDate,
            }
        }).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {

            responsePI = responseJson.PowerAndIrr;


            xTimeLabel = [];
            yIrrLabel = [];
            yPowerLabel = [];
            xTimeLabelPrev = [];
            yIrrLabelPrev = [];
            yPowerLabelPrev = [];
            yIrrLabelPrev = [];


            yIrrDataPrev = [];
            yPowerDataPrev = [];
            yIrrData = [];
            yPowerData = [];
            if (!connnection_Status) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
                } else {
                    Alert.alert('No internet Connection');
                }
                return;
            }
            fetch(PWR_ND_IRR, {
                method: "POST",
                "headers": {
                    tokenid: this.state.restToken,
                    siteid: this.state.siteId,
                    evtime: this.state.dataDatePrev,
                }
            }).then(response => response.json())
                .then(responseJson => {

                    responsePIPrev = responseJson.PowerAndIrr;

                    this.createDataForPIGraph(responsePI, responsePI.length - 1);
                    this.createDataForPIGraphPrev(responsePIPrev, responsePIPrev.length - 1);
                });
        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : "An error occured",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert(errMSg.length > 0 ? errMSg : "An error occured");
            }

            this.setState({
                refreshing: false,
                isLoading: false
            });

        });

        const { params } = this.props.navigation.state;

        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        /*................................... PR Data.................................................................*/

        fetch(PR, {
            method: "POST",
            "headers": {
                tokenid: this.state.restToken,
                siteid: params.SiteData,
                evtime: this.state.dataDatePrev,
                prsearchtype: 'day'
            }
        }).then(response => response.json()).then(responseJSON => {
            const a = responseJSON['SitePRCalculated'];
            if (a) {
                if (a[0]) {
                    this.setState({ prValue: a[0].PR + '%' });
                } else {
                    this.setState({ prValue: 'No Data Available' });
                }
            } else {
                this.setState({ prValue: responseJSON.Message })
            }
        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : "An error occured",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert(errMSg.length > 0 ? errMSg : "An error occured");
            }

            this.setState({

                isLoading: false
            });

        });

        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }

        /*................................... Home Info.................................................................*/

        fetch(HOME_INFO, {
            method: "POST",
            "headers": {
                tokenid: this.state.restToken,
                siteid: this.state.siteId,
                evtime: this.state.dataDate
            },
        }).then(response => response.json()).then(responseJson => {

            var response = responseJson.siteHomeInfo[0];
            var todayMwh = response.TodayKWH;
            var total = response.TotalKWH;
            var pow = response.Power;
            todayMwh = parseFloat(parseFloat(todayMwh) / 1000);
            var co2 = parseFloat(response.TotalKWH);
            co2 = parseFloat(co2 * CO2_CONSTANT / 1000);
            co2 = co2.toFixed(2);
            var rev = todayMwh;
            rev = parseFloat(total * REVENUE_CONSTANT / 1000000);
            rev = rev.toFixed(2);
            this.setState({
                powerData: pow,
                todayMwh: todayMwh,
                totalCo2: co2,
                revenue: rev,
                totalKWH: total
            })
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

                isLoading: false
            });

        });


        /*................................... Currency Info.................................................................*/

        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(BASIC, {
            method: "POST",
            "headers": {
                tokenid: this.state.restToken,
                siteid: this.state.siteId,
            },
        }).then(response => response.json()).then(responseJson => {
            if (!responseJson.siteInfo) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.show('You are logged out due to security reasons. Please login again!', ToastAndroid.SHORT);
                } else {
                    Alert.alert('You are logged out due to security reasons. Please login again!');
                }
                this.props.navigation.navigate('LoginScreen');

                return false;
            }
            else {
                var response = responseJson.siteInfo[0];
                var curr = "";
                var country = response.Country;
                if (country == "Srilanka") {

                    curr = SRILANKA_CURR;

                }
                else if (country == "Thailand") {
                    curr = THAI_CURR;

                }
                else {
                    curr = INDIAN_CURR;

                }
                this.setState({

                    curr: curr
                });

            }
        }).catch(err => {

            this.setState({
                isLoading: false,
                refreshing: false
            })
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



        }
        );

    }

    /*................................... Pull refresh.................................................................*/


    refreshData = () => {
        this.setState({ refreshing: true });
        this._dashboardData();
    }

    /*................................... Component Unmount.................................................................*/

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }

    /*................................... Time in millisecond.................................................................*/

    timeInMsec = (date) => {
        return new Date(date).setMinutes(new Date(date).getMinutes())
    };

    /*................................... Monthly Yield.................................................................*/

    MonthlyYield = () => {

        var response = '';
        var responsePrev = '';
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(SITE_KWH, {
            method: "POST",
            "headers": {
                tokenid: this.state.restToken,
                siteid: this.state.siteId,
                evtime: this.state.dataDate,
                energysearchperiod: "month",
            }
        }).then(response => response.json())
            .then(responseJson => {
                response = responseJson.siteEnergy;

                if (!responseJson.siteEnergy) {
                    this.props.navigation.navigate('LoginScreen')
                }


                /***
                * self iterating method
                */
                xCategories = [];
                yCHartPoints = [];
                xCategoriesPrev = [];
                yCHartPointsPrev = [];
                if (!connnection_Status) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
                    } else {
                        Alert.alert('No internet Connection');
                    }
                    return;
                }
                fetch(SITE_KWH, {
                    method: "POST",
                    "headers": {
                        tokenid: this.state.restToken,
                        siteid: this.state.siteId,
                        evtime: this.state.dataMonthPrev,
                        energysearchperiod: "month",
                    }
                }).then(response => response.json())
                    .then(responseJson => {
                        responsePrev = responseJson.siteEnergy;
                        this.createDataForGraph(response, response.length - 1);
                        this.createDataForGraphPrev(responsePrev, responsePrev.length - 1);
                    });


            })
    };

    /*................................... Create Data for Yield Graph.................................................................*/

    createDataForGraph = (data, length) => {
        if (length < 0) {
            if (xCategories.length == 0) {
                this.state.monthlyYeildConfGraphShow = true;
                this.state.irrACPowerIrrGraphShow = false;
                this.state.irrACPowerIrrPrevGraphShow = false;
            }
            this.setState({
                chartPointValue: yCHartPoints.reverse(),
                xChartLabel: xCategories.reverse(),
                showGraph: true,
                showPIGraph: false,
                monthlyYeildConfGraphShow: yCHartPoints.length == 0 ? true : false
            }, function () {
            });
        }
        if (length >= 0) {
            xCategories.push(data[length].DateTime);
            yCHartPoints.push(parseFloat(data[length].KWH));
            length--;
            this.createDataForGraph(data, length);
        }

    };
    /*................................... getting time in milliseconds .................................................................*/

    timeInMsec = (date) => {
        return new Date(date).setMinutes(new Date(date).getMinutes());
    };

    /*................................... Create Data for Yield Graph.................................................................*/

    createDataForGraphPrev = (data, length) => {
        if (length < 0) {
            if (xCategoriesPrev.length == 0) {
                this.state.monthlyYeildConfPrevGraphShow = true;
                this.state.irrACPowerIrrGraphShow = false;
                this.state.irrACPowerIrrPrevGraphShow = false;
            }
            this.setState({
                //  YieldDailyData: YieldDailyData,
                chartPointValuePrev: yCHartPointsPrev.reverse(),
                xChartLabelPrev: xCategoriesPrev.reverse(),
                showGraph: true,
                showPIGraph: false,
                monthlyYeildConfPrevGraphShow: yCHartPointsPrev.length == 0 ? true : false
            }, function () {
            });
        }
        if (length >= 0) {
            xCategoriesPrev.push(data[length].DateTime);

            yCHartPointsPrev.push(parseFloat(data[length].KWH));
            length--;
            this.createDataForGraphPrev(data, length);
        }

    };

    /*................................... Irradiance Graph.................................................................*/
    IrradianceGraph = async () => {

        var responsePI = '';
        var responsePIPrev = '';
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        await fetch(PWR_ND_IRR, {
            method: "POST",
            "headers": {
                tokenid: this.state.restToken,
                siteid: this.state.siteId,
                evtime: this.state.dataDate,
            }
        }).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {

            responsePI = responseJson.PowerAndIrr;


            xTimeLabel = [];
            yIrrLabel = [];
            yPowerLabel = [];
            xTimeLabelPrev = [];
            yIrrLabelPrev = [];
            yPowerLabelPrev = [];
            yIrrLabelPrev = [];


            yIrrDataPrev = [];
            yPowerDataPrev = [];
            yIrrData = [];
            yPowerData = [];
            if (!connnection_Status) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
                } else {
                    Alert.alert('No internet Connection');
                }
                return;
            }
            fetch(PWR_ND_IRR, {
                method: "POST",
                "headers": {
                    tokenid: this.state.restToken,
                    siteid: this.state.siteId,
                    evtime: this.state.dataDatePrev,
                }
            }).then(response => response.json())
                .then(responseJson => {
                    responsePIPrev = responseJson.PowerAndIrr;

                    this.createDataForPIGraph(responsePI, responsePI.length - 1);
                    this.createDataForPIGraphPrev(responsePIPrev, responsePIPrev.length - 1);
                });
        }).catch(err => {

            let errMSg = aPIStatusInfo.logError(err);
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    errMSg.length > 0 ? errMSg : "An error occured",
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert(errMSg.length > 0 ? errMSg : "An error occured");
            }

            this.setState({
                refreshing: false,
                isLoading: false
            });

        });
    };

    /*................................... Create Data for Irradiance Graph.................................................................*/

    createDataForPIGraph = async (data, length) => {

        if (length < 0) {
            if (xTimeLabel.length == 0) {
                this.state.irrACPowerIrrGraphShow = true;
                this.state.monthlyYeildConfGraphShow = false;
                this.state.monthlyYeildConfPrevGraphShow = false;
            }

            this.setState({
                xPowerChartLabel: xTimeLabel.reverse(),
                yLeftLabel: yIrrLabel.reverse(),
                yRightLabel: yPowerLabel.reverse(),
                refreshing: false,
                showGraph: false,
                showPIGraph: true,
                yIrrData: yIrrData,
                yPowerData: yPowerData,
                irrACPowerIrrGraphShow: yIrrData.length == 0 ? true : false
            });


        }
        if (length >= 0) {
            var yIrrDataItem = [];
            var yPowerDataItem = [];
            var dt = new Date(data[length].dateTime);
            yIrrDataItem.push(this.timeInMsec(dt));
            yIrrDataItem.push(parseFloat(data[length].Irradiance));
            yPowerDataItem.push(this.timeInMsec(dt));
            yPowerDataItem.push(parseFloat(data[length].Power));
            yIrrData.push(yIrrDataItem);
            yPowerData.push(yPowerDataItem);
            xTimeLabel.push(dt.getHours() + ':' + dt.getMinutes());
            yIrrLabel.push(parseFloat(data[length].Irradiance));
            yPowerLabel.push(parseFloat(data[length].Power));
            length--;
            this.createDataForPIGraph(data, length);

        }
    };

    /*................................... Create Data for Irradiance Graph.................................................................*/

    createDataForPIGraphPrev = async (data, length) => {

        if (length < 0) {
            if (xTimeLabelPrev.length == 0) {
                this.state.irrACPowerIrrPrevGraphShow = true;
                this.state.monthlyYeildConfGraphShow = false;
                this.state.monthlyYeildConfPrevGraphShow = false;
            }
            this.setState({
                xPowerChartLabelPrev: xTimeLabelPrev.reverse(),
                yLeftLabelPrev: yIrrLabelPrev.reverse(),
                yRightLabelPrev: yPowerLabelPrev.reverse(),
                isLoading: false,
                showGraph: false,
                showPIGraph: true,
                yIrrDataPrev: yIrrDataPrev,
                yPowerDataPrev: yPowerDataPrev,
                irrACPowerIrrPrevGraphShow: yIrrDataPrev.length == 0 ? true : false
            }, function () {
            });

        }
        if (length >= 0) {
            var yIrrDataItemPrev = [];
            var yPowerDataItemPrev = [];
            var dt = new Date(data[length].dateTime);
            yIrrDataItemPrev.push(this.timeInMsec(dt));
            yIrrDataItemPrev.push(parseFloat(data[length].Irradiance));
            yPowerDataItemPrev.push(this.timeInMsec(dt));
            yPowerDataItemPrev.push(parseFloat(data[length].Power));
            yIrrDataPrev.push(yIrrDataItemPrev);
            yPowerDataPrev.push(yPowerDataItemPrev);
            xTimeLabelPrev.push(dt.getHours() + ':' + dt.getMinutes());
            yIrrLabelPrev.push(parseFloat(data[length].Irradiance));
            yPowerLabelPrev.push(parseFloat(data[length].Power));
            length--;
            this.createDataForPIGraphPrev(data, length);
        }
    };

    /*................................... render Starts.................................................................*/

    render() {
        /*................................... Monthly Yield Config.................................................................*/

        this.state.isLoading = false
        var Highcharts = 'Highcharts';
        var todayYield = this.state.todayMwh;
        var total = this.state.totalKWH;
        var conf = {
            chart: {
                type: 'column',
                animation: Highcharts.svg,
                marginRight: 10,

                backgroundColor: 'rgba(255, 255, 255, 0.0)',

                svg: {
                    fill: 'red',
                },
            },
            title: {
                text: this.state.cMonthName,
                style: { fontSize: 13, textAlign: 'right', alignItems: 'right' }
            },
            credits: {
                enabled: false
            },

            xAxis: {
                categories: this.state.xChartLabel,
                gridLineColor: '#808a8b',
                title: {
                    text: 'Date'
                },
                labels: {
                    rotation: -45,
                    formatter: function () {

                        return this.value.split('-')[0];
                    }
                },
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {

                            }
                        }
                    }
                }
            },
            yAxis: [{
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                title: {
                    text: 'kWh'
                }
            }, {
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                opposite: true,
                title: {
                    text: 'Secondary Axis'
                }
            }],

            series: [{
                data: this.state.chartPointValue,
                yAxis: 0,
                svg: {
                    fill: 'red',
                },
                color: DASHBOARD_MNTHYIELD_GRAPH,
                name: 'Energy'
            }


            ],
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        + this.y + ' kWh';
                }
            },
        };
        /*................................... Monthly Yield Config.................................................................*/

        var confPrev = {
            chart: {
                type: 'column',
                animation: Highcharts.svg,
                marginRight: 10,

                backgroundColor: 'rgba(255, 255, 255, 0.0)',

                svg: {
                    fill: 'red',
                },
            },
            title: {
                text: this.state.pMonthName,
                style: { fontSize: 13, textAlign: 'right', alignItems: 'right' }
            },
            credits: {
                enabled: false
            },
            xAxis: {
                categories: this.state.xChartLabelPrev,
                gridLineColor: '#808a8b',


                title: {
                    text: 'Date'
                },
                labels: {
                    rotation: -45,
                    formatter: function () {

                        return this.value.split('-')[0];
                    }
                },
            },

            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {

                            }
                        }
                    }
                }
            },
            yAxis: [{
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                title: {
                    text: 'kWh'
                }
            }, {
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                opposite: true,
                title: {
                    text: 'Secondary Axis'
                }
            }],

            series: [{
                data: this.state.chartPointValuePrev,
                yAxis: 0,
                svg: {
                    fill: 'red',
                },
                color: DASHBOARD_MNTHYIELD_GRAPH,
                name: 'Energy'
            }

            ],
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>'
                        + this.y + ' kWh';
                }
            },

        };
        /*...................................Irradiance Config.................................................................*/

        var powerIrr = {
            loading: { showDuration: 1500 },
            chart: {
                type: 'spline',
                animation: Highcharts.svg,
                backgroundColor: 'rgba(255, 255, 255, 0.0)',

                svg: {
                    fill: 'red',
                },
            },
            title: {
                text: this.state.dataDate,
                style: { fontSize: 13, textAlign: 'right', alignItems: 'right' }
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
                type: 'datetime',
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',

                title: {
                    text: 'Time'
                }
            },
            yAxis: [{
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                title: {
                    text: 'Irradiance [W/m2]'
                }
            }, {
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',

                opposite: true,
                title: {
                    text: 'Power [kW]'
                },

            }], tooltip: {
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
            series: [{
                data: this.state.yIrrData,
                yAxis: 0,
                svg: {
                    fill: 'red',
                },
                color: DASHBOARD_IRR_GRAPH,
                name: 'Irradiance-',
            }, {
                data: this.state.yPowerData,
                yAxis: 1,
                color: DASHBOARD_PWR_GRAPH,
                name: 'Power-'
            }
            ],
            lang: {
                noData: "No data available"
            },

        };

        /*...................................Irradiance Config.................................................................*/

        var powerIrrPrev = {
            loading: { showDuration: 1500 },
            chart: {
                type: 'spline',
                animation: Highcharts.svg,
                backgroundColor: 'rgba(255, 255, 255, 0.0)',

                svg: {
                    fill: 'red',
                },
            },
            title: {
                text: this.state.dataDatePrev,
                style: { fontSize: 13, textAlign: 'right', alignItems: 'right' }
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
                        str = new Date(this.value).getHours().toString() + ": 00";
                        return str;
                    }
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
                type: 'datetime',
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',

                title: {
                    text: 'Time'
                }
            },
            yAxis: [{
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',

                title: {
                    text: 'Irradiance [W/m2]'
                }
            }, {
                lineWidth: 1,
                lineColor: '#808a8b',
                gridLineColor: '#808a8b',
                opposite: true,
                title: {
                    text: 'Power [kW]'
                }
            }],
            tooltip: {
                shared: true,
                formatter: function () {
                    var tip = "<span style=\"font-size:10px;padding-left:10px\">" + new Date(this.x).toString().substring(0, 15) + "</span><br/><table>";

                    this.points.forEach(function (d) {
                        tip += '<tr><td style="color:' + d.color + ';padding:0"><span  style="color:' + d.color + '">' + d.series.name + ' </span>: </td><td style=\"padding:0\"><b>' + d.y + '';
                        if (d.series.name.substring(0, 1) === 'P') {
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

            series: [{
                data: this.state.yIrrDataPrev,
                yAxis: 0,
                svg: {
                    fill: 'red',
                },
                color: DASHBOARD_IRR_GRAPH,
                name: 'Irradiance-',
            }, {
                data: this.state.yPowerDataPrev,
                yAxis: 1,
                color: DASHBOARD_PWR_GRAPH,
                name: 'Power-'
            }
            ],
            lang: {
                noData: "No data available"
            },

        };
        const options = {
            global: {
                useUTC: true
            },
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            },
            exporting: { enabled: false }

        };
        return (


            <KeyboardAvoidingView style={styles.container} behavior="padding">


                <CommonView menuText={'Dashboard'}>

                    <ScrollView horizontal={false} refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.refreshData}
                            style={{}}
                        />
                    }>

                        <View style={{ flex: 1, flexDirection: 'column', padding: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: '1%' }}></View>
                                <View style={{
                                    flexGrow: 1, borderWidth: 1.2, height: 65, width: "48%",
                                    borderColor: APP_BUTTON_GREEN, backgroundColor: "#eef4ee", elevation: 5, opacity: 0.6
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 2, alignItems: 'center' }}>
                                            <FontAwesome name="superpowers" size={25} style={{ color: APP_BUTTON_GREEN, padding: 5 }} />
                                        </View>
                                        <View style={{ alignItems: 'center', padding: 5, flex: 4 }}>
                                            <Text style={{ color: '#000', textAlign: 'center' }}>Power</Text>
                                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}> {this.state.powerData} kW</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: '2%' }}></View>
                                <View style={{
                                    flexGrow: 1, borderWidth: 1.2, height: 65, width: "48%",
                                    borderColor: APP_BUTTON_GREEN, backgroundColor: "#eef4ee", elevation: 5, opacity: 0.6
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 2, alignItems: 'center' }}>
                                            <SimpleLineIcons name="energy" size={25} style={{ color: APP_BUTTON_GREEN, padding: 5 }} />
                                        </View>
                                        <View style={{ alignItems: 'center', padding: 5, flex: 4 }}>
                                            <Text style={{ color: '#000', textAlign: 'center' }}>Today Energy</Text>
                                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}> {Math.round(todayYield * 100000, 1) / 100} kWh</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: '1%' }}></View>

                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12 }}>
                                <View style={{ width: '1%' }}></View>
                                <View style={{
                                    flexGrow: 1, borderWidth: 1.2, height: 65, width: "48%",
                                    borderColor: APP_BUTTON_GREEN, backgroundColor: "#eef4ee", elevation: 5, opacity: 0.6
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 2, alignItems: 'center' }}>
                                            <Feather name="pie-chart" size={25} style={{ color: APP_BUTTON_GREEN, padding: 5 }} />
                                        </View>
                                        <View style={{ alignItems: 'center', padding: 5, flex: 4 }}>
                                            <Text style={{ color: '#000', textAlign: 'center' }}>PR</Text>
                                            <Text numberOfLines={2} style={{ color: '#000', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>{this.state.prValue}</Text>

                                        </View>
                                    </View>
                                </View>

                                <View style={{ width: '2%' }}></View>
                                <View style={{
                                    flexGrow: 1, borderWidth: 1.2, height: 65, width: "48%",
                                    borderColor: APP_BUTTON_GREEN, backgroundColor: "#eef4ee", elevation: 5, opacity: 0.6
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 2, alignItems: 'center' }}>
                                            <FontAwesome name="signal" size={25} style={{ color: APP_BUTTON_GREEN, padding: 5 }} />
                                        </View>
                                        <View style={{ alignItems: 'center', padding: 5, flex: 4 }}>
                                            <Text style={{ color: '#000', textAlign: 'center' }}>Yield Till Date </Text>
                                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}> {Math.round(total / 10, 2) / 100} MWh</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: '1%' }}></View>

                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12 }}>
                                <View style={{ width: '1%' }}></View>
                                <View style={{
                                    flexGrow: 1, borderWidth: 1.2, height: 65, width: "48%",
                                    borderColor: APP_BUTTON_GREEN, backgroundColor: "#eef4ee", elevation: 5, opacity: 0.6
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 2, alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="database" size={25} style={{ color: APP_BUTTON_GREEN, padding: 5 }} />
                                        </View>
                                        <View style={{ alignItems: 'center', padding: 5, flex: 4 }}>
                                            <Text style={{ color: '#000', textAlign: 'center' }}>Total Revenue</Text>
                                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}> {this.state.curr} {this.state.revenue} M</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: '2%' }}></View>
                                <View style={{
                                    flexGrow: 1, borderWidth: 1.2, height: 65, width: "48%",
                                    borderColor: APP_BUTTON_GREEN, backgroundColor: "#eef4ee", elevation: 5, opacity: 0.6
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 2, alignItems: 'center' }}>
                                            <Entypo name="leaf" size={25} style={{ color: APP_BUTTON_GREEN, padding: 5 }} />
                                        </View>
                                        <View style={{ alignItems: 'center', padding: 5, flex: 4, alignContent: 'center' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}><Text style={{ color: '#000', marginBottom: 5 }}>CO</Text><Text style={{ color: '#000', fontSize: 10, lineHeight: 10 }}>2</Text><Text style={{ color: '#000', marginBottom: 5 }}> Avoided</Text></View>
                                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>{this.state.totalCo2} Ton</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: '1%' }}></View>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {this.state.showPIGraph ?
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={styles.graphCss3}>
                                            <TouchableOpacity style={{ borderRadius: 10, paddingLeft: 30, paddingRight: 30 }} onPress={() => this.MonthlyYield()}>
                                                <Text style={{ color: 'gray', textAlign: 'center', fontSize: 12 }}
                                                > Monthly Yield </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.graphCss1}>
                                            <TouchableOpacity style={{ borderRadius: 10, paddingLeft: 30, paddingRight: 30 }} onPress={() => this.IrradianceGraph()}>
                                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}
                                                > Irradiance Vs AC </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                :
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                        <View style={styles.graphCss2}>
                                            <TouchableOpacity style={{ borderRadius: 10, paddingLeft: 30, paddingRight: 30 }} onPress={() => this.MonthlyYield()}>
                                                <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}
                                                > Monthly Yield </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.graphCss4}>
                                            <TouchableOpacity style={{ borderRadius: 10, paddingLeft: 30, paddingRight: 30 }} onPress={() => this.IrradianceGraph()}>
                                                <Text style={{ color: 'gray', textAlign: 'center', fontSize: 12 }}
                                                > Irradiance Vs AC </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                            }
                        </View>



                        {this.state.showGraph ?

                            <ScrollView
                                horizontal={true}
                                pagingEnabled={true}
                                ref={ref => this.scrollView = ref}
                                onContentSizeChange={() => {
                                    this.scrollView.scrollToEnd({ animated: true });
                                }}
                            >
                                <ChartView config={confPrev} options={options} originWhitelist={['']} style={{ backgroundColor: 'transparent', height: (Dimensions.get("window").height / 2) - 30, width: (Dimensions.get("window").width) }} ></ChartView>
                                <ChartView config={conf} options={options} originWhitelist={['']} style={{ backgroundColor: 'transparent', height: (Dimensions.get("window").height / 2) - 30, width: (Dimensions.get("window").width) }} ></ChartView>
                            </ScrollView>
                            :
                            null
                        }

                        {this.state.showPIGraph ?

                            <ScrollView
                                horizontal={true}
                                pagingEnabled={true}
                                ref={ref => this._scrollView = ref}
                                onContentSizeChange={() => {
                                    this._scrollView.scrollToEnd({ animated: true });
                                }}

                            >
                                <ChartView config={powerIrrPrev} options={options} originWhitelist={['']} style={{ backgroundColor: 'transparent', height: (Dimensions.get("window").height / 2) - 30, width: (Dimensions.get("window").width) }} ></ChartView>
                                <ChartView config={powerIrr} options={options} originWhitelist={['']} style={{ backgroundColor: 'transparent', height: (Dimensions.get("window").height / 2) - 30, width: (Dimensions.get("window").width) }} ></ChartView>
                            </ScrollView> : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}></View>
                        }

                    </ScrollView>

                </CommonView>


            </KeyboardAvoidingView >

        );
    }


}
{/*.................................................... Styles...................................................... */ }

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loginBannerImage: {
        width: "100%",
        height: "100%",
        paddingRight: 0,
        paddingLeft: 0,
        resizeMode: 'contain',

    },
    innerCircle: {
        borderRadius: 35,
        width: 20,
        height: 20,
        paddingTop: 10,
        backgroundColor: 'gray',
        borderColor: 'white',
        borderWidth: 1,
        marginLeft: 7,
        marginRight: 10
    },
    innerCircleGreen: {
        borderRadius: 35,
        width: 20,
        height: 20,
        paddingTop: 10,
        backgroundColor: 'green',
        borderColor: 'white',
        borderWidth: 1,
        marginLeft: 7,
        marginRight: 10
    },
    RectangleShapeView: {
        width: 9 * 2,
        height: 3,
        marginTop: 7,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#0baee7'
    },
    RectangleShapeView1: {
        width: 9 * 2,
        height: 3,
        marginTop: 7,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: '#32a023'
    },
    graphCss1: {
        backgroundColor: APP_BUTTON_GREEN,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 50,
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        borderColor: 'gray',
        borderWidth: 0.5,
        position: 'relative',
        left: -17,
        width: 165

    },
    graphCss3: {
        backgroundColor: '#fff',
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 10,
        textAlign: 'center',
        borderRadius: 50,
        color: 'gray',
        fontSize: 12,
        borderColor: 'gray',
        borderWidth: 0.5,
        width: 165,
        left: 17,
    },
    graphCss2: {
        backgroundColor: APP_BUTTON_GREEN,
        paddingTop: 8,
        paddingBottom: 12,
        borderRadius: 50,
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        borderColor: 'gray',
        borderWidth: 0.5,
        position: 'relative',
        right: -17,
        zIndex: 10,
        width: 165

    },
    graphCss4: {
        backgroundColor: '#fff',
        paddingTop: 8,
        paddingBottom: 12,
        borderRadius: 50,
        textAlign: 'center',
        color: 'gray',
        fontSize: 12,
        borderColor: 'gray',
        borderWidth: 0.5,
        width: 165,
        right: 17
    },

});

export default DashboardScreen

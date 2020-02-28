import React from 'react';
import { ToastAndroid, View, NetInfo, ImageBackground, Text, Dimensions, TouchableOpacity, ActivityIndicator, AsyncStorage, ScrollView, Animated, TextInput, Platform, Alert } from 'react-native';
import { FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { APP_GREEN, APP_ACTIVE_RED } from '../constants/ColorMaster';
import { USER_SITE_LIST } from '../constants/APIurl';
import aPIStatusInfo from "../components/ErrorHandler";

/*.................................................... Support NOC Dashboard...................................................... */

export default class SupportSiteListingScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allData: [],
            backupData: [],
            listData: [],
            isLoading: true,
            listType: 'SYNCEDSITES',
            alarmType: 'ALL ALARMS',
            start: 0,
            end: 10,
            scrollY: new Animated.Value(0),
            noData: false,
            connnection_Status: true
        }
        this.searchInput = React.createRef();
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.setState({
                    start: 0,
                    end: 10
                });
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    connnection_Status = connectionInfo.type == 'none' ? false : true;
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
                await AsyncStorage.removeItem('IrrData');
                await AsyncStorage.removeItem('YPowerData');
                this.setState({ isLoading: true, endOfData: true });
                const { params } = await this.props.navigation.state;
                await AsyncStorage.getItem('siteListData').then(siteListData => JSON.parse(siteListData)).then(async siteListDataJSON => {
                    if (siteListDataJSON != null) {
                        await this.setState({ allData: siteListDataJSON, backupData: siteListDataJSON });
                        if (this.state.backupData.length) {
                            this.searchInput.current.clear();
                        }
                        this.noData(false);
                        if (params.siteListType) {
                            this.setState({
                                listType: params.siteListType,
                                alarmType: params.alarmType
                            });
                        }
                    } else {
                        if (params.siteListType) {
                            this.noData(true);
                        }
                        else {

                        }
                    }
                });
                this.setState({
                    isLoading: false,
                    start: 0,
                    end: 10,
                    endOfData: false
                });
            }
        );
    }

    /*.................................................... Get Site listing data...................................................... */

    // getSiteListingData = async () => {
    //     var restToken = await AsyncStorage.getItem('TokenID');
    //     if (!connnection_Status) {
    //         if (Platform.OS !== 'ios') {
    //             ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
    //         } else {
    //             Alert.alert('No internet Connection');
    //         }
    //         return;
    //     }
    //     fetch(
    //         USER_SITE_LIST,
    //         {
    //             method: "POST",
    //             headers: {
    //                 tokenid: restToken
    //             }
    //         }
    //     ).then(aPIStatusInfo.handleResponse)
    //         .then(response => response.json())
    //         .then(responseJson => {
    //             if (responseJson.Message !== 'Token expired.') {
    //                 var SiteList = responseJson.SiteList;
    //                 this.setState({
    //                     isLoading: false,
    //                     allData: SiteList,
    //                     backupData: SiteList
    //                 });
    //             } else {
    //                 AsyncStorage.clear();
    //                 this.props.navigation.navigate('LoginScreen');
    //             }
    //         })
    //         .catch(err => {
    //             let errMSg = aPIStatusInfo.logError(err);
    //             if (Platform.OS !== 'ios') {
    //                 ToastAndroid.showWithGravity(
    //                     errMSg.length > 0 ? errMSg : "An error occured",
    //                     ToastAndroid.LONG,
    //                     ToastAndroid.CENTER
    //                 );
    //             } else {
    //                 Alert.alert(errMSg.length > 0 ? errMSg : "An error occured");
    //             }
    //             if (err.status == '401') {
    //                 AsyncStorage.clear();
    //                 this.props.navigation.navigate('LoginScreen');
    //                 return;
    //             }
    //             this.setState({ refreshing: false });
    //             return;
    //         });
    // };

    /*.................................................... methods for lazy loading...................................................... */

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height
    }
    loadMoreData() {
        if (this.state.end < this.state.allData.length) {
            this.setState({ start: this.state.start + 10, end: this.state.end + 10 });
        } else {
            this.setState({ isLoadMore: false, endOfData: true });
        }
    }
    isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
        return contentOffset.y <= 0
    }
    loadLessData() {
        if (this.state.start >= 10) {
            this.setState({ start: this.state.start - 10, end: this.state.end - 10 });
        } else {
            this.setState({ isLoadMore: false, endOfData: false });
        }
    }
    noData(opt) {
        this.setState({ noData: opt });
    }

    /*.................................................... Site Search...................................................... */

    searchSite(text) {
        this.setState({ start: 0, end: this.state.backupData.length });
        if (text.length > 0) {
            const a = this.state.backupData.filter(x => x.SiteName.toLowerCase().indexOf(text.toLowerCase()) > -1);
            if (a.length > 0) {
                this.setState({ allData: a });
                this.noData(false);
            } else {
                this.noData(true);
            }
        } else {
            this.setState({ start: 0, end: 10 });
            if (this.state.backupData.length > 0) {
                this.setState({ allData: this.state.backupData });
                this.noData(false);
            } else {
                this.noData(true);
            }
        }
    }

    /*.................................................... Render Begins...................................................... */

    render() {
        return (
            <CommonView menuText={'SupportSiteListing'}>
                <ImageBackground source={require("./images/overlay.png")} style={{ width: '100%', resizeMode: 'cover' }}>
                    <View style={{ padding: 15, paddingBottom: 5 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                            <Text style={{ color: "gray", fontWeight: "bold", fontSize: 14 }}>ALARM TYPE : </Text>
                            <Text style={{ color: "gray", fontSize: 14 }}>{this.state.alarmType.toUpperCase()}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ color: "gray", fontWeight: "bold", fontSize: 14 }}>COMM STATUS : </Text>
                            <Text style={{ color: "gray", fontSize: 14 }}>{this.state.listType.toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={{ paddingLeft: 15, paddingRight: 15 }}>
                        <TextInput
                            ref={this.searchInput}
                            style={{ height: 40, paddingLeft: 15, paddingRight: 15, backgroundColor: '#ffffff', borderRadius: 15, marginTop: 10 }}
                            onSubmitEditing={(event) => this.searchSite(event.nativeEvent.text)}
                            blurOnSubmit={true}
                            value={this.state.searchInput}
                            placeholder='Search'
                        />
                    </View>
                    <View style={{ paddingLeft: 15, paddingRight: 15, height: Dimensions.get('window').height - 225 }}>
                        {this.state.noData ?
                            <Text style={{ textAlign: 'center', fontSize: 16, color: APP_ACTIVE_RED, marginTop: 10 }}>No data available</Text>
                            :
                            <ScrollView
                                ref={ref => this.listView = ref}
                                showsVerticalScrollIndicator={false}
                                scrollEventThrottle={1}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                                    {
                                        listener: event => {
                                            this.setState({ isLoadMore: true });
                                            if (this.isCloseToBottom(event.nativeEvent)) {
                                                this.loadMoreData();
                                                this.listView.scrollTo({ y: 10 });
                                            } else if (this.isCloseToTop(event.nativeEvent)) {
                                                this.loadLessData();
                                                this.listView.scrollTo({ y: 10 });
                                            } else {
                                                this.setState({ isLoadMore: false });
                                            }
                                        }
                                    }
                                )}>
                                {this.state.allData.slice(this.state.start, this.state.end).map((listItem, key) => (
                                    <TouchableOpacity key={key} onPress={() => { AsyncStorage.setItem('SiteName', listItem.SiteName); AsyncStorage.setItem('comStatus', listItem.ComStatus); this.props.navigation.navigate('DashboardScreen', { SiteData: listItem.SiteId, commStatus: listItem.ComStatus, isViewingUser: false }) }} style={{ shadowColor: '#0000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.5)', padding: 10, marginTop: 10 }}>
                                        <View>
                                            <Text style={{ color: "#000", marginBottom: 10 }}>{listItem.SiteName}</Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome name="superpowers" size={14} style={{ color: "black", marginRight: 5 }} />
                                                    <Text style={{ fontSize: 14 }}>
                                                        {listItem.powerCapacity}kWp
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <SimpleLineIcons name="energy" size={14} style={{ color: "black", marginRight: 5 }} />
                                                    <Text style={{ fontSize: 14 }}>
                                                        {listItem.TodayYield}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}

                            </ScrollView>
                        }
                    </View>
                    {this.state.isLoading ?
                        <View style={{ position: 'absolute', left: 0, top: 0, backgroundColor: 'rgba(255,255,255,0.5)', flex: 1, width: Dimensions.get('window').width, minHeight: Dimensions.get('window').height - 60, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color={APP_GREEN} />
                        </View>
                        :
                        null
                    }
                </ImageBackground>
            </CommonView>
        );
    }
}
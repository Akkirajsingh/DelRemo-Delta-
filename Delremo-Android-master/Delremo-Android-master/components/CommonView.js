import React, { Component } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, AsyncStorage, View, Dimensions, TouchableOpacity, Share, Image, Platform } from 'react-native';
import { Entypo, FontAwesome, Foundation } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';
import SideBarMenu from "../components/SideBarMenu";
import Drawer from 'react-native-drawer';
import { captureScreen } from "react-native-view-shot";
import { APP_GREEN, APP_WHITE, APP_ACTIVE_RED } from '../constants/ColorMaster';
import { UPLOAD_LINK } from '../constants/APIurl';
import { Notifications } from "expo";

class CommonView extends Component {
    constructor(props) {
        super(props);
        this.state = { isAuth: false, header: 'Site Listing', isUserSupport: false, isViewingUser: true, siteName: '', comStatus: '', ExpDate: '', loginID: '', NotificationCount: 0 };
        Notifications.addListener(this._handleNotification);
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.switchCommonView();
                const { params } = this.props.navigation.state;
                if (params.isNotificationScreen != undefined && params.isNotificationScreen) {
                    await AsyncStorage.removeItem('newNotificationList');
                } else {
                    await AsyncStorage.getItem('newNotificationList').then(notif => {
                        if (notif) {
                            if (JSON.parse(notif).length) {
                                const NotCount = JSON.parse(notif).length;
                                this.setState({ 'NotificationCount': NotCount });
                            } else {
                                this.setState({ 'NotificationCount': 0 });
                            }
                        } else {
                            this.setState({ 'NotificationCount': 0 });
                        }
                    });
                }
            }
        );
    }
    _handleNotification = async (notification) => {
        var title = notification.data.title;
        var desc = notification.data.desc;
        if (notification.data.link) {
            var link = notification.data.link;
        } else {
            var link = '';
        }
        var noteList = { "title": title, "description": desc, "link": link };
        let newNotes = [];
        if (await AsyncStorage.getItem('newNotificationList')) {
            await AsyncStorage.getItem('newNotificationList').then(notifList => {
                newNotes = JSON.parse(notifList);
                const a = newNotes.filter(x => (x.title === noteList.title && x.description === noteList.description && x.link === noteList.link));
                if (newNotes.length) {
                    if (!a[0]) {
                        newNotes.push(noteList);
                    }
                } else {
                    newNotes.push(noteList);
                }
            });
        } else {
            newNotes = [];
            if (newNotes.indexOf(noteList) === -1) {
                newNotes.push(noteList);
            }
        }
        await AsyncStorage.setItem('newNotificationList', JSON.stringify(newNotes));
        if (newNotes.length) {
            const NotCount = newNotes.length;
            this.setState({ 'NotificationCount': NotCount });
        } else {
            this.setState({ 'NotificationCount': 0 });
        }
    };
    async switchCommonView() {
        const { params } = this.props.navigation.state;
        this.setState({ showMenu: false });
        var isUserSupport = "";
        var comStatus1 = "";
        var loginID = "";

        var siteName1 = "";
        var isViewingUser = true;

        await AsyncStorage.getItem('LoginID').then(LoginId => {
            if (LoginId === 'supportuser') {
                isUserSupport = true
            } else {
                isUserSupport = false
            }
            loginId = LoginId;
        });

        await AsyncStorage.getItem('comStatus').then(value => {
            comStatus1 = value;
        });




        AsyncStorage.getItem('ExpDate').then(ExpDate => {
            var CurrDate = new Date();
            var expDate = new Date(ExpDate);
            if (CurrDate > expDate) {
                AsyncStorage.clear();
                this.props.navigation.navigate('LoginScreen');
            }
        });
        await AsyncStorage.getItem('SiteName').then(value => {
            siteName1 = value;
        });


        if (params != undefined) {
            if (params.isViewingUser != undefined && !params.isViewingUser) {
                isViewingUser = false
            } else {
                isViewingUser = true
            }
        }

        this.setState({
            isViewingUser: isViewingUser,
            siteName: siteName1,
            isUserSupport: isUserSupport,
            comStatus: comStatus1,
            loginID: loginId


        })

    }
    onSharePress = () => {
        captureScreen({
            format: "jpg",
            quality: 0.8,
            result: 'data-uri'
        }).then(
            async uri => {
                if (Platform.OS === 'ios') {
                    const shareContent = {
                        title: 'DelREMO Screenshot',
                        url: uri
                    };
                    const shareOptions = {
                        subject: 'DelREMO Screenshot',
                        tintColor: 'red'
                    };
                    Share.share(shareContent, shareOptions);
                } else {
                    var fd = new FormData();
                    fd.append('file', uri);
                    fd.append('upload_preset', 'fhtnq1x3');
                    fetch(UPLOAD_LINK, {
                        method: "POST",
                        "body": fd
                    }).then(response => response.json())
                        .then(responseJson => {
                            try {
                                Share.share({
                                    url: responseJson.secure_url,
                                    message: 'Check my Graph screenshot here ' + responseJson.secure_url,
                                    title: 'Share Dashboard'
                                });
                            } catch (error) {
                                alert(error.message);
                            }
                        }).catch((error) => {
                            console.error(error);
                        });
                }
            });
    }
    async componentDidMount() {
        this.switchCommonView();
    }

    render() {

        return (
            <View style={{ flex: 1 }}>
                {this.state.isUserSupport ?
                    <Drawer
                        open={this.state.showMenu}
                        content={<SideBarMenu isSiteList={false} isUserSupport={true} isViewingUser={this.state.isViewingUser} loginID={this.state.loginID} />}
                        openDrawerOffset={0.3}
                        closedDrawerOffset={-3}
                        tapToClose={true}
                        type="overlay"
                        side={'right'}
                        onClose={() => this.closeDrawer()}
                        styles={drawerStyles}
                        tweenHandler={(ratio) => ({
                            main: { opacity: (2 - ratio) / 2 }
                        })}>
                        <StatusBar hidden />
                        <View style={styles.userSupportHeader}>
                            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                                {this.props.menuText === 'SiteListing' ?
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
                                        <Text numberOfLines={2} style={styles.userSupportTitle}>Site Listing</Text>
                                    </View>
                                    :
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
                                        {!this.state.isViewingUser ?
                                            <View>
                                                {this.state.comStatus == 'synced' || this.state.comStatus == 'syncing' ?
                                                    <Image source={require('../images/greenButton.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                                                    :
                                                    <Image source={require('../images/redButton.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                                                }
                                            </View>
                                            :
                                            null
                                        }
                                        <Text numberOfLines={2} style={styles.userSupportTitle}>{this.state.isViewingUser ? 'NOC Dashboard' : this.state.siteName}</Text>
                                    </View>
                                }
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('NotificationScreen', { isViewingUser: true, isNotificationScreen: true })} style={{ padding: 2.5, marginRight: 5 }}>
                                        <FontAwesome name="bell-o" size={20} style={{ color: 'white' }} />
                                        {this.state.NotificationCount > 0
                                            ?
                                            <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 20 }}>
                                                <Text style={{ fontSize: 10, color: '#ffffff' }}>{this.state.NotificationCount}</Text>
                                            </View>
                                            :
                                            null
                                        }
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.onSharePress()} style={{ padding: 2.5, marginRight: 5 }}>
                                        <Entypo name="share" size={25} style={{ color: 'white' }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.openDrawer()} style={{ padding: 2.5 }}>
                                        <Entypo name="menu" size={25} style={{ color: 'white' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {this.state.isViewingUser ?
                            <View style={{ shadowColor: 'gray', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5, backgroundColor: 'white', borderTopColor: '#ccc', borderTopWidth: 0.8, paddingLeft: 20, paddingRight: 20, flexDirection: 'row', bottom: 0, width: '100%', height: 50, justifyContent: 'space-between', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ClientListing', { isViewingUser: true })} style={{ color: 'gray', alignItems: 'center', textAlign: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <FontAwesome name="list" size={18} style={this.props.menuText === 'ClientListing' ? { color: APP_GREEN, paddingTop: 5 } : { color: 'gray', paddingTop: 5 }} />
                                    <Text style={this.props.menuText === 'ClientListing' ? { fontSize: 10, textAlign: 'center', color: APP_GREEN } : { fontSize: 10, textAlign: 'center', color: 'gray' }}>Client Listing</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('SupportDashboard', { isViewingUser: true })} style={{ color: 'gray', alignItems: 'center', textAlign: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <FontAwesome name="dashboard" size={18} style={this.props.menuText === 'SupportDashboard' ? { color: APP_GREEN, paddingTop: 5 } : { color: 'gray', paddingTop: 5 }} />
                                    <Text style={this.props.menuText === 'SupportDashboard' ? { fontSize: 10, textAlign: 'center', color: APP_GREEN } : { fontSize: 10, textAlign: 'center', color: 'gray' }}>NOC Dashboard</Text>
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={{ shadowColor: 'gray', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 5, backgroundColor: 'white', borderTopColor: '#ccc', borderTopWidth: 0.8, paddingLeft: 20, paddingRight: 20, flexDirection: 'row', bottom: 0, width: '100%', height: 50, justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SupportSiteListing', { isViewingUser: true })} style={{ color: 'gray', alignItems: 'center', textAlign: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <FontAwesome name="list" size={18} style={{ color: 'gray', paddingTop: 5 }} />
                                        <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Site List</Text>
                                    </TouchableOpacity>
                                    {this.props.menuText == 'Dashboard' ?
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('DashboardScreen', { isViewingUser: false })} style={{ color: 'green', paddingRight: 10, alignItems: 'center' }}>
                                            <FontAwesome name="dashboard" size={23} style={{ color: '#009432', }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: '#009432' }}>Dashboard</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('DashboardScreen', { isViewingUser: false })} style={{ color: 'gray', paddingRight: 10, alignItems: 'center' }}>
                                            <FontAwesome name="dashboard" size={23} style={{ color: 'gray', }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Dashboard</Text>
                                        </TouchableOpacity>
                                    }
                                    {this.props.menuText == 'Analytics' ?
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AnalyticsScreen', { isViewingUser: false })} style={{ color: 'green', paddingRight: 10, alignItems: 'center' }}>
                                            <Foundation name="graph-bar" size={23} style={{ color: '#009432', }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: '#009432' }}>Analytics</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AnalyticsScreen', { isViewingUser: false })} style={{ color: 'gray', paddingRight: 10, alignItems: 'center' }}>
                                            <Foundation name="graph-bar" size={23} style={{ color: 'gray', }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Analytics</Text>
                                        </TouchableOpacity>
                                    }
                                    {this.props.menuText == 'Alarm' ?
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AlarmScreen', { isViewingUser: false, view: 'current' })} style={{ color: 'gray', alignItems: 'center' }}>
                                            <FontAwesome name="bell" size={18} style={{ color: '#009432', paddingTop: 5 }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: '#009432' }}>Alarms</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('AlarmScreen', { isViewingUser: false, view: 'current' })} style={{ color: 'gray', alignItems: 'center' }}>
                                            <FontAwesome name="bell" size={18} style={{ color: 'gray', paddingTop: 5 }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Alarms</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                            </View>
                        }

                        {this.props.menuText === 'SupportSiteListing' ?
                            this.props.children
                            :

                            <View style={{ height: Dimensions.get('window').height - 110 }}>
                                {this.props.children}
                            </View>

                        }

                    </Drawer>
                    :
                    <View style={{ flex: 1 }}>
                        <Drawer
                            open={this.state.showMenu}
                            content={<SideBarMenu isSiteList={this.props.menuText === 'SiteListing' ? true : false} isUserSupport={false} loginID={this.state.loginID} />}
                            openDrawerOffset={0.3}
                            closedDrawerOffset={-3}
                            tapToClose={true}
                            type="overlay"
                            side={'right'}
                            onClose={() => this.closeDrawer()}
                            styles={drawerStyles}
                            tweenHandler={(ratio) => ({
                                main: { opacity: (2 - ratio) / 2 }
                            })}>
                            <StatusBar hidden />
                            <View style={styles.userSupportHeader}>
                                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                                    {this.props.menuText === 'SiteListing' ?
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text numberOfLines={2} style={styles.userSupportTitle}>Site Listing</Text>
                                        </View>
                                        :
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {this.state.comStatus == 'synced' || this.state.comStatus == 'syncing' ?
                                                <Image source={require('../images/greenButton.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                                                :
                                                <Image source={require('../images/redButton.png')} style={{ width: 20, height: 20, marginRight: 5 }} />
                                            }
                                            <Text numberOfLines={2} style={styles.userSupportTitle}>{this.props.menuText === 'Notifications' ? 'Notifications' : this.state.siteName}</Text>
                                        </View>
                                    }
                                    <View style={{ flexDirection: 'row', marginLeft: 'auto', alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('NotificationScreen', { isViewingUser: true, isNotificationScreen: true })} style={{ padding: 2.5, marginRight: 5 }}>
                                            <FontAwesome name="bell-o" size={20} style={{ color: 'white' }} />
                                            {this.state.NotificationCount > 0
                                                ?
                                                <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 20 }}>
                                                    <Text style={{ fontSize: 10, color: '#ffffff' }}>{this.state.NotificationCount}</Text>
                                                </View>
                                                :
                                                null
                                            }
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.onSharePress()} style={{ padding: 2.5 }}>
                                            <Entypo name="share" size={25} style={{ color: 'white' }} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.openDrawer()} style={{ padding: 2.5 }}>
                                            <Entypo name="menu" size={25} style={{ color: 'white' }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            {this.props.menuText !== 'SiteListing' && this.props.menuText !== 'Notifications' ?
                                <View style={{
                                    shadowColor: 'gray',
                                    shadowOffset: { width: 1, height: 1 },
                                    shadowOpacity: 0.8,
                                    shadowRadius: 2,
                                    elevation: 5, backgroundColor: 'white', borderTopColor: '#ccc', borderTopWidth: 0.8, paddingLeft: 20, paddingRight: 20, flexDirection: 'row', bottom: 0, height: 50, width: '100%', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('SiteListingScreen')} style={{ color: 'gray', alignItems: 'center', textAlign: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                            <FontAwesome name="list" size={18} style={{ color: 'gray', paddingTop: 5 }} />
                                            <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Site List</Text>
                                        </TouchableOpacity>
                                        {this.props.menuText == 'Dashboard' ?
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('DashboardScreen')} style={{ color: 'green', paddingRight: 10, alignItems: 'center' }}>
                                                <FontAwesome name="dashboard" size={23} style={{ color: '#009432', }} />
                                                <Text style={{ fontSize: 10, textAlign: 'center', color: '#009432' }}>Dashboard</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('DashboardScreen')} style={{ color: 'gray', paddingRight: 10, alignItems: 'center' }}>
                                                <FontAwesome name="dashboard" size={23} style={{ color: 'gray', }} />
                                                <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Dashboard</Text>
                                            </TouchableOpacity>
                                        }

                                        {this.props.menuText == 'Analytics' ?
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AnalyticsScreen')} style={{ color: 'gray', paddingRight: 10, alignItems: 'center' }}>
                                                <Foundation name="graph-bar" size={23} style={{ color: '#009432', }} />
                                                <Text style={{ fontSize: 10, textAlign: 'center', color: '#009432' }}>Analytics</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AnalyticsScreen')} style={{ color: 'gray', paddingRight: 10, alignItems: 'center' }}>
                                                <Foundation name="graph-bar" size={23} style={{ color: 'gray', }} />
                                                <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Analytics</Text>
                                            </TouchableOpacity>
                                        }
                                        {this.props.menuText == 'Alarm' ?
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AlarmScreen', { view: 'current' })} style={{ color: 'gray', alignItems: 'center' }}>
                                                <FontAwesome name="bell" size={18} style={{ color: '#009432', paddingTop: 5 }} />
                                                <Text style={{ fontSize: 10, textAlign: 'center', color: '#009432' }}>Alarms</Text>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AlarmScreen', { view: 'current' })} style={{ color: 'gray', alignItems: 'center' }}>
                                                <FontAwesome name="bell" size={18} style={{ color: 'gray', paddingTop: 5 }} />
                                                <Text style={{ fontSize: 10, textAlign: 'center', color: 'gray' }}>Alarms</Text>
                                            </TouchableOpacity>
                                        }

                                    </View>
                                </View> : null}
                            {this.props.menuText === 'SiteListing' ?
                                this.props.children
                                :
                                <View style={{ height: Dimensions.get('window').height - 110 }}>
                                    {this.props.children}
                                </View>
                            }

                        </Drawer>
                    </View>
                }
            </View>
        );
    }
    closeDrawer = () => {
        this.setState({
            showMenu: false
        });
    };
    openDrawer = () => {
        this.setState({
            showMenu: true
        });
    };
    toggleDrawer = () => {
        if (this.state.showMenu) {
            this.setState({
                showMenu: false
            });
        } else {
            this.setState({
                showMenu: true
            });
        }
    };
    takeScreenShot = async () => {

        captureScreen({
            format: "jpg",
            quality: 0.8,
            result: 'data-uri'
        })
            .then(
                uri => {

                    var fd = new FormData();
                    fd.append('file', uri);
                    fd.append('upload_preset', 'fhtnq1x3');
                    fetch(UPLOAD_LINK, {
                        method: "POST",
                        "body": fd
                    }).then(response => response.json())
                        .then(responseJson => {
                            try {
                                Share.share({
                                    url: responseJson.secure_url,
                                    message: 'Check my Graph screenshot here ' + responseJson.secure_url,
                                    title: 'Share Dashboard'
                                })


                            } catch (error) {
                                alert(error.message);
                            }
                        }).catch((error) => {
                            console.error(error);
                        });
                },
                error => console.error("Oops, snapshot failed", error),

            );
    }
}
const styles = StyleSheet.create({
    menuFont: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 20,
        paddingLeft: 20

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
        backgroundColor: '#48b833',
        borderColor: 'white',
        borderWidth: 1,
        marginLeft: 7,
        marginRight: 10
    },
    innerCircle1: {
        borderRadius: 50,
        width: 20,
        height: 20,
        margin: 5,
        paddingTop: 10,
        backgroundColor: APP_ACTIVE_RED,
        borderColor: 'white',
        borderWidth: 1,
        marginLeft: 1,
        marginRight: 10
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    },
    loginBannerImage: {
        width: "100%",
        height: "100%",
        paddingRight: 0,
        paddingLeft: 0,
        resizeMode: "cover"
    },
    userSupportHeader: {
        backgroundColor: APP_GREEN,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        height: 60
    },
    userSupportTitle: {
        color: APP_WHITE,
        fontSize: 16,
        maxWidth: Dimensions.get('window').width * 0.6
    }
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3 },

};
export default withNavigation(CommonView)
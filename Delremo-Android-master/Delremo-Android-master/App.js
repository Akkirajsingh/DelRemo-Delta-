import React from 'react';
import { View, ActivityIndicator, AsyncStorage, NetInfo, ToastAndroid, Platform, Alert } from 'react-native';
import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import LoginScreen from './Screens/LoginScreen';
import SiteListingScreen from './Screens/SiteListingScreen';
import SupportDashboard from './Screens/SupportDashboard';
import DashboardScreen from './Screens/DashboardScreen';
import AnalyticsScreen from './Screens/AnalyticsScreen';
import PlantReport from './Screens/PlantReport';
import ContactUs from './Screens/ContactUs';
import AlarmScreen from './Screens/AlarmScreen';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen';
import NeedHelpScreen from './Screens/NeedHelpScreen';
import ClientListingScreen from './Screens/ClientListingScreen';
import SupportSiteListingScreen from './Screens/SupportSiteListingScreen';
import { APP_GREEN } from './constants/ColorMaster';
import NotificationScreen from './Screens/NotificationScreen';
import * as Permissions from 'expo-permissions';
import { Notifications } from "expo";
import aPIStatusInfo from "./components/ErrorHandler";
import { MBL_DEVICE_INFO } from './constants/APIurl';
let connnection_Status = false;

const UserAppStack = createStackNavigator({
    SiteListingScreen: {
        screen: SiteListingScreen
    },
    DashboardScreen: {
        screen: DashboardScreen
    },
    AnalyticsScreen: {
        screen: AnalyticsScreen
    },
    AlarmScreen: {
        screen: AlarmScreen
    },
    AlarmScreenHistory: {
        screen: AlarmScreen
    },
    PlantReport: {
        screen: PlantReport
    },
    ContactUs: {
        screen: ContactUs
    },
    NotificationScreen: {
        screen: NotificationScreen
    }
},
    {
        headerMode: 'none',
        animationEnabled: true
    }
);
const SupportUserAppStack = createStackNavigator({
    SupportDashboard: {
        screen: SupportDashboard
    },
    SiteListingScreen: {
        screen: SiteListingScreen
    },
    DashboardScreen: {
        screen: DashboardScreen
    },
    AnalyticsScreen: {
        screen: AnalyticsScreen
    },
    AlarmScreen: {
        screen: AlarmScreen
    },
    AlarmScreenHistory: {
        screen: AlarmScreen
    },
    PlantReport: {
        screen: PlantReport
    },
    ClientListing: {
        screen: ClientListingScreen
    },
    SupportSiteListing: {
        screen: SupportSiteListingScreen
    },
    NotificationScreen: {
        screen: NotificationScreen
    }
},
    {
        headerMode: 'none',
        animationEnabled: true
    }
);
const AuthStack = createStackNavigator({
    LoginScreen: {
        screen: LoginScreen
    },
    NeedHelpScreen: {
        screen: NeedHelpScreen
    },
    ForgotPasswordScreen: {
        screen: ForgotPasswordScreen
    }
},
    {
        headerMode: 'none',
        animationEnabled: true
    }
);

class AuthLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
        this._bootstrapAsync();
        this.props.navigation.addListener(
            'willFocus',
            async () => {

                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    connnection_Status = connectionInfo.type == 'none' ? false : true;
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });

            }
        );
    }
    componentDidMount() {
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }
    _bootstrapAsync = async () => {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            connnection_Status = connectionInfo.type == 'none' ? false : true;
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No Internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No Internet Connection');
            }
            return;
        }
        await this.registerForPushNotificationsAsync();

        var Token = await AsyncStorage.getItem('TokenID');
        var accessType = await AsyncStorage.getItem('LoginID');
        var expDate = await AsyncStorage.getItem('ExpDate');
        var CurrDate = new Date();
        if (!Token || Token == '' || CurrDate > expDate) {
            this.props.navigation.navigate('Auth');
        } else if (accessType == 'supportuser') {
            this.props.navigation.navigate('SupportDashboard', { isViewingUser: true });
        } else {
            await AsyncStorage.setItem('modalState', 'set').then(() => {
                this.props.navigation.navigate('SiteListingScreen', { isViewingUser: true });
            });
        }
    };
    async registerForPushNotificationsAsync() {
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No Internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No Internet Connection');
            }
            return;
        }
        const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;

        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            Alert.alert('Allow Notifications to receive updates');
            return;
        }

        // Get the token that uniquely identifies this device
        let token = await Notifications.getExpoPushTokenAsync();
        console.log(token);

        this.setState({ notificationToken: token }, function () {

        });

        await this._sendNotification();

        this.notificationSubscription = Notifications.addListener(this._handleNotification);

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
        if (await AsyncStorage.getItem('notificationList')) {
            await AsyncStorage.getItem('notificationList').then(notifList => {
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
        await AsyncStorage.setItem('notificationList', JSON.stringify(newNotes));
    };

    _sendNotification = async () => {
        var Token = await AsyncStorage.getItem('TokenID');
        var accessType = await AsyncStorage.getItem('LoginID');
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(MBL_DEVICE_INFO, {
            method: "POST",
            "headers": {
                tokenid: Token,
                name: "Orbio solutions",
                deviceid: this.state.notificationToken,
                userid: accessType,
            },
        }).then(aPIStatusInfo.handleResponse)
            .then(response => response.json()).then(responseJson => {
                if (responseJson.Message !== 'Token expired.') {

                    this.notificationSubscription = Notifications.addListener(this._handleNotification);
                } else {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            'Token Expired',
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert('Token Expired');
                    }
                }
                AsyncStorage.setItem('notificationList', this.state.notificationList ? this.state.notificationList : '');
            });


    }
    render() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={APP_GREEN} />
            </View>
        );
    }
}
const App = createAppContainer(createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        UserApp: UserAppStack,
        SupportUser: SupportUserAppStack,
        Auth: AuthStack
    },
    {
        initialRouteName: 'AuthLoading'
    }
));
export default App;
import React from 'react';
import { StyleSheet, ToastAndroid, Platform, Alert, Text, ImageBackground, ScrollView, NetInfo, View, Image, Dimensions, KeyboardAvoidingView, TouchableOpacity, TextInput, AsyncStorage, StatusBar } from 'react-native';
import { EvilIcons, Entypo } from '@expo/vector-icons';
import Carousel from 'react-native-banner-carousel';
import SideBarMenu from "../components/SideBarMenu";
import Drawer from 'react-native-drawer';
import { GET_DR_DATA } from '../constants/APIurl';
import { LOGIN } from '../constants/APIurl';
import { DELTA_ELECTRONICS_INDIA_PVT_LTD } from '../constants/OtherConstants';
import { APP_GREY, APP_GREEN } from '../constants/ColorMaster';
import aPIStatusInfo from "../components/ErrorHandler";

const BannerWidth = Dimensions.get('window').width;
console.disableYellowBox = true;
let connnection_Status = false;

/*.................................................... Class to create Login...................................................... */

class LoginScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notification: {}, iconName: 'eye-with-line', username: '', loadingText: 'Loading...', password: '', login_text: 'Login', notificationToken: '', showMenu: false, hidePassword: true, isLoading: true, dynText: [
                { "title": "No of Plants Monitoring", "labe": "0" }, { "title": "Total Installed Capacity", "label": "0" }, { "title": "Total Units Generated", "label": "0" }
            ], notificationList: [
                { "title": "New Update", "desc": "A new update is avilable", "link": "" }]
        }

    }

    /*.................................................... Component mount...................................................... */

    async componentDidMount() {
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
        fetch(GET_DR_DATA, {
            method: "POST",
            "headers": {
                token_delta: "123",
            },
        }).then(aPIStatusInfo.handleResponse)
            .then(response => response.json())
            .then(responseJson => {
                var data = responseJson.DRDatainfo[0];
                var myObj = {};
                var carData = [];
                myObj["title"] = "No of Plants Monitoring";
                myObj["label"] = data.plantnumber;
                carData.push(myObj);
                myObj = {};
                myObj["title"] = "Total Installed Capacity";
                myObj["label"] = (parseFloat(data.capacity) / 1000).toFixed(2) + " MWp";
                carData.push(myObj);
                myObj = {};
                myObj["title"] = "Total Units Generated";
                myObj["label"] = (parseFloat(data.energy) / 1000000).toFixed(2) + " GWh";
                carData.push(myObj);
                this.setState({
                    dynText: carData,
                    isLoading: false
                })
            });


    }

    /*.................................................... Component Unmount...................................................... */

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }

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
    }

    closeDrawer = () => {
        this.setState({
            showMenu: false
        });
    } 


      /*.................................................... View Carousel...................................................... */
  
    renderPage(text, index) {
        return (
            <View key={index} style={{ alignItems: 'center', padding: 22 }}>
                <Text style={{ color: '#4b4b4b', fontSize: 18, padding: 10 }}>{text.title}</Text>
                <Text style={{ color: '#4b4b4b', fontWeight: 'bold', fontSize: 23 }}>{text.label}</Text>
            </View>
        );
    }
    /*.................................................... render begins...................................................... */

    render() {
        if (this.state.isLoading) {
            return (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={require('../images/loader.gif')} style={{ width: 80, height: 80 }} />
                <Text>{this.state.loadingText} </Text>
            </View>
            );
        } else {
            return (
                <Drawer
                    open={this.state.showMenu}
                    content={<SideBarMenu />}
                    openDrawerOffset={0.3}
                    closedDrawerOffset={-3}
                    tapToClose={true}
                    onClose={() => this.closeDrawer()}
                    styles={drawerStyles}
                    tweenHandler={(ratio) => ({
                        main: { opacity: (2 - ratio) / 2 }
                    })}>
                    <KeyboardAvoidingView style={styles.container} behavior="padding">
                        <StatusBar hidden />
                        <ImageBackground source={require('./images/overlay.png')} style={styles.loginBannerImage} >

                            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='always'>
                                <View style={{ height: (Dimensions.get("window").height) }}>
                                    <View style={styles.logoimg}>
                                        <Image style={{ width: 275, height: 100 }} source={require('./images/delta-logo.png')} title="Above all i am here" />
                                    </View>
                                    <View style={{ color: '#fff' }}>
                                        <Carousel
                                            autoplay
                                            autoplayTimeout={5000}
                                            loop

                                            index={0}
                                            pageSize={BannerWidth}
                                        >
                                            {this.state.dynText.map((text, index) => this.renderPage(text, index))}
                                        </Carousel>
                                    </View>

                                    <View style={{ paddingLeft: 15, paddingRight: 15, flexDirection: 'column', flex: 1 }}>
                                        <View style={{ flexDirection: 'row', color: 'white', alignItems: 'center', justifyContent: 'center' }}>
                                            <TextInput
                                                style={styles.inputFieldText}
                                                value={this.state.username}
                                                placeholder={'Username'}
                                                placeholderTextColor={APP_GREY}
                                                keyboardType={'email-address'}
                                                onChangeText={(username) => this.setState({ username })}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <TextInput
                                                style={styles.inputFieldText}
                                                value={this.state.password}
                                                placeholder={'Password'}
                                                placeholderTextColor={APP_GREY}
                                                secureTextEntry={this.state.hidePassword}
                                                onChangeText={password => this.setState({ password })}

                                            />
                                            <Entypo name={this.state.iconName} size={16} style={{ color: APP_GREY, top: 20, right: 25 }} onPress={() => this.togglePassword()} />
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View>
                                                    <EvilIcons name='question' size={24} style={{ color: APP_GREY, top: 8 }} />
                                                </View>
                                                <View>
                                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('NeedHelpScreen')}>
                                                        <Text style={{ textAlign: 'left', fontSize: 15, marginTop: 5, color: APP_GREY }}>Need Help </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPasswordScreen')}>
                                                    <Text style={{ textAlign: 'right', fontSize: 15, marginTop: 5, color: APP_GREY }}> Forgot Password?</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View>
                                            <View style={{ alignItems: "center" }}>
                                                <TouchableOpacity disabled={true}>
                                                    <Text style={styles.cusButtonLargeGreen}
                                                        onPress={this.loginUser}>
                                                        {this.state.login_text}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.copyright}>
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Copyright {'\u00A9'} {DELTA_ELECTRONICS_INDIA_PVT_LTD}</Text>
                                    <Text style={{ color: 'white', textAlign: 'center' }}>All rights reserved</Text>
                                </View>
                            </ScrollView>
                        </ImageBackground>

                    </KeyboardAvoidingView>

                </Drawer>
            );
        }

    }

    /***
     * toggle password
     * */
    togglePassword = () => {
        if (this.state.hidePassword) {
            this.setState({
                hidePassword: false,
                iconName: 'eye'
            });
        } else {
            this.setState({
                hidePassword: true,
                iconName: 'eye-with-line'
            });
        }
    };

    /* API Call For Login */
    loginUser = () => {
        const { username, password } = this.state;
        const { navigate } = this.props.navigation;

        let u_name = username;
        let pwrd = password;
        if (u_name == '' || pwrd == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Username & Password is required',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Username & Password is required');
            }
        } else {
            if (!connnection_Status) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity('No Internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
                } else {
                    Alert.alert('No Internet Connection');
                }
                return;
            }
            this.setState({
                isLoading: true,
                loadingText: 'Logging you in...'
            });

            fetch(LOGIN, {
                method: "POST",
                "headers": {
                    LoginID: u_name,
                    Password: pwrd,
                    MAC: null,

                }
            }).then(aPIStatusInfo.handleResponse)
                .then(response => response.json())
                .then(responseJson => {
                    if (responseJson) {
                        var token = responseJson.ActiveToken[0].TokenID;
                        var LoginID = responseJson.ActiveToken[0].LoginID;
                        var ExpDate = responseJson.ActiveToken[0].ExpDate;

                        AsyncStorage.setItem('TokenID', token);
                        AsyncStorage.setItem('ExpDate', ExpDate);
                        AsyncStorage.setItem('LoginID', LoginID);
                        this.setState({
                            login_text: 'Login',

                            username: '',
                            password: '',
                            isLoading: false
                        }, function () {

                            if (LoginID == "supportuser") {
                                this.props.navigation.navigate('SupportDashboard');
                            } else {
                                AsyncStorage.setItem('modalState', 'set').then(() => {
                                    this.props.navigation.navigate('SiteListingScreen', { isViewingUser: true });
                                });
                            }
                        });
                    } else {
                    }
                })
                .catch(err => {
                    this.setState({
                        isLoading: false,
                    })

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
                    return;


                });
        }


    }
}


    /*.................................................... styles...................................................... */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoimg: {
        alignItems: 'center',
        paddingTop: 10,
        marginTop: 25,
        marginLeft: 8,
        marginRight: 8,
        height: 150
    },

    inputFieldText: {
        height: 50, flexDirection: 'row', width: '100%', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#fff',
        color: APP_GREY, fontSize: 16
    },
    cusButtonLargeGreen: {
        backgroundColor: '#fff',
        marginTop: 25,
        padding: 12,
        width: 80,
        textAlign: 'center',
        borderRadius: 10,
        color: '#4b4b4b',
        fontSize: 16,
        elevation: 4,
    },
    loginBannerImage: {
        width: "100%",
        height: "100%",
        paddingRight: 0,
        paddingLeft: 0,
        resizeMode: 'cover',
    },
    copyright: {
        alignItems: 'center',
        color: 'white',
        position: 'absolute',
        bottom: 0,
        textAlign: 'center',
        justifyContent: 'center',
        flex: 1,
        width: (Dimensions.get("window").width)
    }
});
const drawerStyles = {
    drawer: { shadowColor: '#41b4afa6', shadowOpacity: 0.8, shadowRadius: 3 },
    main: { paddingLeft: 3 },
}
export default LoginScreen
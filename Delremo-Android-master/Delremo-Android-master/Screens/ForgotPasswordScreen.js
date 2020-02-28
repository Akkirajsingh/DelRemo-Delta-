import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    ToastAndroid,
    View,
    Dimensions,
    TextInput,
    AsyncStorage,
    NetInfo,
    Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native';
import { FORGOT_PASSWORD } from '../constants/APIurl';
import { DELTA_ELECTRONICS_INDIA_PVT_LTD } from '../constants/OtherConstants';
import { FORGOTPASS_EMAIL, FORGOTPASS_INVALID_USER, FORGOTPASS_INVALID_USER_MSG } from '../constants/OtherConstants';
let connnection_Status = false;

/*.................................................... Class to show forgot password screen...................................................... */

class ForgotPassword extends React.Component {

        constructor(props) {
        super(props)
        this.state = {
            email: ''
        }
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                await NetInfo.getConnectionInfo().then((connectionInfo) => {
                    connnection_Status = connectionInfo.type == 'none' ? false : true;
                });
                NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });

                this.setState({
                    email: '',
                }
                );
            }
        );
    }
    
/*.................................................... Component Unmount...................................................... */

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }

/*.................................................... Validations...................................................... */

    forgotPass = () => {
        const { email } = this.state;
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let myEmail = email;
        if (myEmail == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Email address is required',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Email address is required');
            }
        } else if (reg.test(myEmail) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Invalid Email',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Invalid Email');
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

            fetch(FORGOT_PASSWORD, {
                method: "POST",
                "headers": {
                    'token_delta': '123',
                    'LoginID': myEmail
                },

            }).then(response => response.json()).then(responseJson => {
                if (responseJson == 'Your report has been sent to your emailid.') {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            FORGOTPASS_EMAIL,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert(FORGOTPASS_EMAIL);
                    }
                }
                else if (responseJson == 'Login id is not exist.') {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            FORGOTPASS_INVALID_USER,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert(FORGOTPASS_INVALID_USER);
                    }
                }
                else {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            FORGOTPASS_INVALID_USER_MSG,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert(FORGOTPASS_INVALID_USER_MSG);
                    }
                }
            });
        }

    }

    /*.................................................... Forgot Password View...................................................... */

    render() {
        return (


            <View style={{ flex: 1 }}>
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                    <ScrollView contentContainerStyle={styles.ScrollContainer} keyboardShouldPersistTaps='always'>
                        <View style={styles.MainViewContainer}>
                            <View style={styles.MainViewContainerIn}>
                                <View>
                                    <MaterialIcons name="lock" size={60} style={{ color: '#009432' }} />
                                </View>
                                <View style={styles.forgotPasswordText}>
                                    <Text style={{ color: 'gray', fontSize: 22 }}>Forgot Password ?</Text>
                                </View>
                                <View style={styles.forgotPasswordSubHeader}>
                                    <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center' }}> We need your registered email address to send link for password reset</Text>

                                </View>
                            </View>
                            <View style={styles.emailIcon}>
                                <MaterialCommunityIcons name="email" size={30} style={styles.searchIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={this.state.email}
                                    placeholder="Email address"
                                    onChangeText={(email) => this.setState({ email })}
                                    underlineColorAndroid="transparent" />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <TouchableOpacity style={styles.resetButton} onPress={this.forgotPass}>
                                    <Text style={styles.resetButtonIn}>Reset Password</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
                <View style={styles.copyright}>
                    <Text style={{ color: 'gray' }}>Copyright {'\u00A9'} {DELTA_ELECTRONICS_INDIA_PVT_LTD}</Text>
                    <Text style={{ color: 'gray' }}>All rights reserved</Text>
                </View>
            </View>
        );
    }
}


/*.................................................... Styles...................................................... */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    ScrollContainer:
    {

    },
    MainViewContainer: {
        padding: 20,
        flex: 1,
        justifyContent: 'flex-start'
    },
    MainViewContainerIn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 30
    },
    forgotPasswordText: {
        paddingTop: 20
    },
    forgotPasswordSubHeader: {
        padding: 20,
        paddingTop: 15
    },
    emailIcon: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray'
    },
    input: {
        width: '100%'
    },
    searchIcon: {
        padding: 3,
        color: 'gray'
    },
    resetButton: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetButtonIn: {
        backgroundColor: '#009432',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        padding: 10,
        elevation: 5,
        textAlign: 'center',
        color: 'white'
    },

    copyright: {
        alignItems: 'center',
        color: 'gray',
        textAlign: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
        width: (Dimensions.get("window").width)
    }


});
export default ForgotPassword
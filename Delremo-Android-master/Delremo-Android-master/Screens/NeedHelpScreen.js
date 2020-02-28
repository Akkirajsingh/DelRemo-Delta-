import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, ToastAndroid, Platform, Alert, View, Dimensions, TextInput, KeyboardAvoidingView, StatusBar, NetInfo } from 'react-native';
import { Video } from 'expo-av'
import { CONTACT, SEND_CONTACT_MAIL } from '../constants/APIurl';
import { APP_BUTTON_GREEN, APP_GREEN, APP_GREY } from '../constants/ColorMaster';
import { NEED_HELP_MSG_FAILED, NEED_HELP_MAIL_MSG } from '../constants/OtherConstants';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import aPIStatusInfo from "../components/ErrorHandler";
let connnection_Status = false;

/*.................................................... Need Help Screen...................................................... */
class NeedHelp extends React.Component {
    static navigationOptions = {
        header: null,
    };
    constructor(props) {
        super(props)
        this.state = {
            name: '',
            email: '', message: '', mute: false,
            loadingMsg: 'Please Wait', isLoading: true, videoRefresh: true, shouldPlay: true
        }
        this.props.navigation.addListener(
            'willFocus',
            async () => {
                this.setState({
                    name: '',
                    email: '',
                    message: ''

                })


            }

        );

    }

    /*.................................................... Component mount...................................................... */


    async componentDidMount() {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            connnection_Status = connectionInfo.type == 'none' ? false : true;
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }
    /*.................................................... Component Unmount...................................................... */

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
        this.videoPlayer.source = { uri: 'https://res.cloudinary.com/dlzvvtl1f/video/upload/v1560839858/2019_06_18_11_26_56.mp4' }
        this.videoPlayer.setStatusAsync({ shouldPlay: false })

    }

    /*.................................................... handle Play Pause...................................................... */

    handlePlayAndPause = () => {
        this.setState((prevState) => ({
            shouldPlay: !prevState.shouldPlay
        }));
    }

    /*.................................................... Change to full screen...................................................... */

    onPress() {
        if (this.videoPlayer != null)
            this.videoPlayer.presentFullscreenPlayer();
    }


    /*.................................................... Reset on Load...................................................... */

    resetPlayer = () => {

        this.videoPlayer.source = { uri: 'https://res.cloudinary.com/dlzvvtl1f/video/upload/v1560839858/2019_06_18_11_26_56.mp4' }
        this.videoPlayer.setStatusAsync({ shouldPlay: true })


    }

    /*.................................................... View of Need Help...................................................... */

    render() {
        const { width } = (Dimensions.get('window')) - 10;
        return (
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#ffffff' }} behavior="padding" enabled>
                <StatusBar hidden />
                <ScrollView>
                    <View style={styles.container}>
                        <View>
                            <View style={{ marginTop: 20, marginBottom: 20, alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="email" color={APP_GREEN} size={20} style={{ marginRight: 5 }} />
                                    <Text style={{ color: 'gray', fontSize: 16 }}>Contact Us</Text>
                                </View>
                            </View>
                            <View style={{
                                borderRadius: 5,
                                padding: 15,
                                elevation: 2,
                                shadowColor: APP_GREY,
                                shadowOpacity: 0.3,
                                shadowRadius: 5,
                                shadowOffset: { width: 1, height: 1 }
                            }}>
                                <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                                    <View style={styles.emailIcon}>
                                        <MaterialCommunityIcons name="account" size={25} style={styles.searchIcon} />
                                        <TextInput
                                            style={{ padding: 5, width: '100%' }}
                                            placeholder="Name"
                                            value={this.state.name}
                                            onChangeText={(name) => this.setState({ name })}
                                        />
                                    </View>
                                    <View style={styles.emailIcon}>
                                        <MaterialCommunityIcons name="email" size={25} style={styles.searchIcon} />
                                        <TextInput
                                            style={{ padding: 5, width: '100%' }}
                                            keyboardType={'email-address'}
                                            placeholder="E-mail"
                                            value={this.state.email}
                                            onChangeText={(email) => this.setState({ email })}
                                        />
                                    </View>
                                    <View style={styles.emailIcon}>
                                        <MaterialCommunityIcons name="message" size={25} style={styles.searchIcon} />
                                        <TextInput
                                            style={{ padding: 5, width: '100%' }}
                                            placeholder="Message"
                                            value={this.state.message}
                                            onChangeText={(message) => this.setState({ message })}
                                        />
                                    </View>
                                    <View style={{ alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => { this.contactUser() }} style={{ marginTop: 5, minWidth: 100, elevation: 3, borderRadius: 30, padding: 10, backgroundColor: APP_BUTTON_GREEN }} >
                                            <Text style={{ textAlign: 'center', elevation: 3, color: '#fff' }}>Submit</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="video" color={APP_GREEN} size={20} style={{ marginRight: 5 }} />
                            <Text style={{ color: 'gray', fontSize: 16 }}>DelREMO App Demo</Text>
                        </View>
                    </View>
                    <View style={styles.MainViewContainer}>
                        <View style={styles.VideoContainer}>
                            <TouchableOpacity onPress={this.viewFullScreen} >
                                <Video
                                    source={{ uri: 'https://res.cloudinary.com/dlzvvtl1f/video/upload/v1565345899/delRemoVideo.mp4' }}
                                    ref={p => { this.videoPlayer = p; }}
                                    shouldPlay={this.state.shouldPlay}
                                    resizeMode="cover"
                                    style={{ width, height: (Dimensions.get('window').height) / 2.2 }}
                                    isMuted={this.state.mute}
                                />
                            </TouchableOpacity>
                            <View style={styles.controlBar}>

                                <MaterialIcons
                                    name={this.state.shouldPlay ? "pause" : "play-arrow"}
                                    size={25}
                                    color="white"
                                    onPress={this.handlePlayAndPause}
                                />
                                <MaterialIcons name="fullscreen" size={25} color='#fff' onPress={this.onPress.bind(this)} />
                            </View>
                        </View>
                    </View>



                </ScrollView >
            </KeyboardAvoidingView >
        );
    }

    /*.................................................... Contact User Validation...................................................... */

    contactUser = () => {
        const { name, email, message } = this.state;
        let u_name = name;
        let u_email = email;
        let u_message = message;
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (u_name == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Name is required',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Name is required');
            }
            return false;
        }
        else if (u_email == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Email is required',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Email is required');
            }
            return false;
        } else if (reg.test(u_email) === false) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Invalid Email',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Invalid Email');
            }
            return false;
        }
        else if (u_message == '') {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please Enter message',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
            } else {
                Alert.alert('Please Enter message');
            }
        }
        else {
            if (!connnection_Status) {
                if (Platform.OS !== 'ios') {
                    ToastAndroid.showWithGravity(
                        'No Internet Connection',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );
                } else {
                    Alert.alert('No Internet Connection');
                }
                return;
            }
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity(
                    'Please wait while we send your contact request to our support team.',
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Please wait while we send your contact request to our support team.');
            }
            fetch(SEND_CONTACT_MAIL, {
                method: "POST",
                "headers": {
                    token_delta: '123',
                    name: u_name,
                    message: u_message,
                    emailid: u_email
                }
            }).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(responseJson => {
                if (responseJson) {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            responseJson,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert(responseJson);
                    }
                }
                else {
                    if (Platform.OS !== 'ios') {
                        ToastAndroid.showWithGravity(
                            NEED_HELP_MSG_FAILED,
                            ToastAndroid.SHORT,
                            ToastAndroid.CENTER,
                        );
                    } else {
                        Alert.alert(NEED_HELP_MSG_FAILED);
                    }
                }
                this.props.navigation.navigate('LoginScreen');
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
                return;
            });
        }
    }
}

/*.................................................... Styles...................................................... */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10
    },
    MainViewContainer: {
        padding: 20,
        flex: 1,
        justifyContent: 'flex-start',
    },
    delconfig: {
        borderColor: APP_BUTTON_GREEN,
        borderWidth: 1.5,
        height: 30,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        backgroundColor: '#fff'
    },
    loginBannerImage: {
        width: "100%",
        height: "100%",
        paddingRight: 0,
        paddingLeft: 0,
        resizeMode: 'cover',
    },
    pageHeadingDiv: {
        width: '100%',
        paddingBottom: 14,
        paddingTop: 12
    },
    pageHeading: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        fontWeight: 'bold',
        width: '100%',
    },
    controlBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    needHelpText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff'
    },
    needHelpParent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 15
    },
    VideoContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        elevation: 5,
        backgroundColor: '#fff',
        padding: 12
    },
    emailIcon: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
        marginBottom: 10
    },
    searchIcon: {
        padding: 3,
        color: 'gray'
    }
});
export default NeedHelp
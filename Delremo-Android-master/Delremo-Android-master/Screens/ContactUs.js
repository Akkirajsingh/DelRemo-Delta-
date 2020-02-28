import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ToastAndroid,
  View,
  TextInput,
  Picker,
  NetInfo,
  Modal,
  Alert
} from 'react-native';

import { MaterialIcons, Entypo, FontAwesome, AntDesign } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native';
import { APP_BUTTON_GREEN, APP_WHITE } from '../constants/ColorMaster';
import CommonView from "../components/CommonView";
import { CONTACT, SEND_CONTACT_MAIL } from '../constants/APIurl';
import { CONTACT_MSG, CONTACT_MSG_FAILED, CONTACT_WAIT } from '../constants/OtherConstants';
import CountryCodeList from 'react-native-country-code-list';
let connnection_Status = false;

/*................................... Class to create contact us page.................................................................*/

class ContactUs extends React.Component {

  /* static navigationOptions = {
    header: null,
  }; */
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      phone: '',
      n: '',
      myArray: [],
      contactAdd: '',
      contactName: '',
      contactMob: '',
      contactTel: '',
      pickerIOSModal: false,
      picker1: '+91'
    }
    /* this.state.customStyle = {
      color: 'red',
      padding: 10
    } */

    /* setInterval(() => {
      if (this.state.customStyle.color == 'red') {
        this.setState({
          customStyle: {
            color: 'white'
          }
        })
      } else {
        this.setState({
          customStyle: {
            color: 'red',

          }
        })
      }
    }, 1000) */

    this.props.navigation.addListener(
      'didFocus',
      async () => {
        await NetInfo.getConnectionInfo().then((connectionInfo) => {

          connnection_Status = connectionInfo.type == 'none' ? false : true;
          if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
              ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
              Alert.alert('No internet Connection');
            }
            return;
          }
          fetch(CONTACT, {
            method: "POST",
            "headers": {
              'token_delta': '123'
            }
          }).then(response => response.json()).then(responseJson => {
            this.setState({
              contactName: responseJson.ContactArray[0].name,
              contactAdd: responseJson.ContactArray[0].address,
              contactMob: responseJson.ContactArray[0].mobile,
              contactTel: responseJson.ContactArray[0].phone
            });
          });
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
        this.setState({
          name: '',
          email: '',
          phone: '',
          message: '',
        }
        );
      }
    );
  }

  /*................................... Component Unmount.................................................................*/

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
  }

  closeDrawer = () => {
    this.setState({
      showMenu: false
    });
  }

  /*................................... Contact Us View.................................................................*/

  render() {
    return (

      <CommonView>
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>

          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.container}>
              <View style={styles.containerIn}>
                <View style={styles.topText}>
                  <View style={{ flexDirection: 'row', borderBottomColor: 'gray', marginTop: -10, borderBottomWidth: 0.5, justifyContent: 'center' }}>
                    <MaterialIcons name="mode-edit"
                      color="gray"
                      size={18}
                      style={{ paddingHorizontal: 2 }} />
                    <Text style={{ color: 'gray', fontSize: 16, fontWeight: 'bold', marginBottom: 15 }}>Contact Us</Text>
                  </View>
                  <View style={styles.addressArea}>
                    <View style={{ flexDirection: 'row', paddingTop: 10, marginRight: 18 }}>
                      <MaterialIcons
                        size={30}
                        name='location-on'
                        color='gray'
                        style={{ paddingHorizontal: 15 }}
                      />
                      <Text style={{ color: 'gray', marginRight: 2 }}>
                        {this.state.contactName ? this.state.contactName : '--'}{"\n"}

                        {this.state.contactAdd ? this.state.contactAdd : '--'}{"\n"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingTop: 20 }}>
                      <MaterialIcons
                        size={30}
                        name='phone-android'
                        color='gray'
                        style={{ paddingHorizontal: 15 }}
                      />
                      <Text style={{ color: 'gray', flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 5 }}>
                        {this.state.contactMob ? this.state.contactMob : '--'}{"\n"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', paddingTop: 20 }}>
                      <Entypo
                        size={30}
                        name='old-phone'
                        color='gray'
                        style={{ paddingHorizontal: 15 }}
                      />
                      <Text style={{ color: 'gray', paddingTop: 5 }}>
                        {this.state.contactTel ? this.state.contactTel : '--'}{"\n"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.contactUsFields}>
                    <View style={{}}>
                      <Text style={{ borderTopColor: 'gray', borderTopWidth: 0.5, color: "gray", padding: 10, paddingTop: 20, marginTop: 20, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                        Contact us and we will get back to you within 24 hours. </Text>
                      <View style={{ padding: 20, }}>
                        <TextInput
                          placeholder="Name"
                          value={this.state.name}
                          onChangeText={(name) => this.setState({ name })}
                          style={{ height: 40, fontSize: 17, borderBottomWidth: 1, borderBottomColor: 'lightgray' }}
                        />
                        <TextInput
                          keyboardType={'email-address'}
                          placeholder="E-mail"
                          value={this.state.email}
                          onChangeText={(email) => this.setState({ email })}
                          style={{ height: 60, fontSize: 17, borderBottomWidth: 1, borderBottomColor: 'lightgray' }}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifycontent: 'center', width: '100%' }}>
                          <TouchableOpacity onPress={() => { this.setState({ pickerIOSModal: true }) }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', padding: 10, width: '25%' }}>
                            <Text style={{ marginRight: 5, textAlign: 'right' }}>{this.state.picker1}</Text>
                            <FontAwesome name="caret-down" size={20} color='lightgray' />
                            <Modal onRequestClose={() => { }} animationType="slide" transparent={false} visible={this.state.pickerIOSModal}>
                              <View style={{ backgroundColor: APP_WHITE, flex: 1, flexDirection: 'column', justifyContent: 'flex-start', padding: 10, paddingBottom: 5 }}>
                                <CountryCodeList onClickCell={(cellObject) => { this.setState({ 'picker1': cellObject.code, 'pickerIOSModal': false }) }} />
                              </View>
                            </Modal>
                          </TouchableOpacity>
                          <TextInput
                            placeholder="Mobile"
                            keyboardType="phone-pad"
                            value={this.state.phone}
                            onChangeText={(phone) => this.setState({ phone })}
                            style={{ height: 60, width: '75%', fontSize: 17, borderBottomWidth: 1, borderBottomColor: 'lightgray' }}
                          />
                        </View>

                        <TextInput
                          placeholder="Message"
                          value={this.state.message}
                          onChangeText={(message) => this.setState({ message })}
                          style={{ height: 60, fontSize: 17, borderBottomWidth: 1, borderBottomColor: 'lightgray' }}
                        />
                        <TouchableOpacity disabled={true} style={styles.cusButtonLargeGreen} >
                          <Text style={styles.cusButtonLargeGreenIn}
                            onPress={this.contactUser}>Submit
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>


                </View>

              </View>


            </View>
          </ScrollView>


        </KeyboardAvoidingView>
      </CommonView>
    );

  }

  /*................................... Contact User validate.................................................................*/

  contactUser = () => {
    const { name, email, phone, message } = this.state;
    let u_name = name;
    let u_email = email;
    let u_phone = phone;
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
    else if (u_phone == '') {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Phone Number is required',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        Alert.alert('Phone Number is required');
      }
      return false;
    } else if (isNaN(u_phone)) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Invalid Phone Number',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        Alert.alert('Invalid Phone Number');
      }
      return false;
    }
    else if (u_phone.length != 10) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Please Enter 10 Digit Mobile Number',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      } else {
        Alert.alert('Please Enter 10 Digit Mobile Number');
      }
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
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          CONTACT_WAIT,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        Alert.alert(CONTACT_WAIT);
      }
      if (!connnection_Status) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
        } else {
          Alert.alert('No internet Connection');
        }
        return;
      }
      fetch(SEND_CONTACT_MAIL, {
        method: "POST",
        "headers": {
          token_delta: '123',
          name: u_name,
          phone: this.state.picker1 + u_phone,
          message: u_message,
          emailid: u_email

        },
      }).then(response => response.json())
        .then(responseJson => {
          if (responseJson.indexOf('Your request has been sent to support emailid.') > -1) {
            if (Platform.OS !== 'ios') {
              ToastAndroid.showWithGravity(
                responseJson,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            } else {
              Alert.alert(responseJson);
            }
            this.setState({ 'name': '', 'email': '', 'phone': '', 'message': '' });
          }

          else {
            if (Platform.OS !== 'ios') {
              ToastAndroid.showWithGravity(
                CONTACT_MSG_FAILED,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            } else {
              Alert.alert(CONTACT_MSG_FAILED);
            }
          }
        });
    }
  }
}


/*................................... Styles.................................................................*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  containerIn: {
    flex: 1
  },
  addressArea: {
    flex: 1,
    padding: 8,

    width: '90%'
  },
  topText: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  contactUsFields: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 0
  },
  cusButtonLargeGreen: {
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginBottom: 50
  },
  cusButtonLargeGreenIn: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: APP_BUTTON_GREEN,
    width: 160,
    padding: 15,
    color: 'white',
    elevation: 3,
    textAlign: 'center',
    borderRadius: 30,
    fontWeight: 'bold',
    marginTop: 25
  },



  ImageStyle: {
    flex: 1,
    width: null,
    height: '100%',
    resizeMode: 'cover',
  },
  welcome: {
    textAlign: 'center'
  },
  loginFields: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  needHelp: {
    fontSize: 15,
    color: 'white'
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  loginBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: "cover"
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
export default ContactUs
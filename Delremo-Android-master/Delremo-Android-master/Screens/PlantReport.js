import React from 'react';
import { ActivityIndicator, NetInfo, StyleSheet, Text, ScrollView, View, Dimensions, RefreshControl, ImageBackground, KeyboardAvoidingView, TextInput, AsyncStorage, TouchableOpacity, Image, StatusBar, Picker, DatePickerIOS, Platform, DatePickerAndroid, Modal, ToastAndroid, Alert } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import CommonView from "../components/CommonView";
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import Moment from 'moment';
import { SEND_REPORT_MAIL, BASIC } from '../constants/APIurl';
import { APP_GREEN, APP_BUTTON_GREEN } from '../constants/ColorMaster';
import { PLANT_REPORT_MSG_FAILED, PLANT_REPORT_MSG, PLANTREP_RECORD_NOT_AVAIL, PLANT_REPORT_DETAIL_MAIL } from '../constants/OtherConstants';
console.disableYellowBox = true;
let connnection_Status = false;
class PlantReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      login_text: 'Login',
      showMenu: false,
      backgroundColor: 'white',
      color: 'gray',
      header: 'Plant Info',
      picker1: 'Monthly',
      chosenDateIOS: Moment(new Date()).format('DD-MMM-YYYY'),
      LoginID: '',
      isLoading: true,
      tempDate: new Date(),
      chosenDateAndroid: Moment(new Date()).format('DD-MMM-YYYY'),
      pickerIOSModal: false,
      pickerAndroidModal: false,
      datepickerIOSModal: false,
      siteInfo: [],
      refreshing: false,
      TokenID: '', SiteID: -1, emailId: ''
    }
    this.setDate = this.setDate.bind(this);
    this.props.navigation.addListener(
      'didFocus',
      async () => {
        this.setState({ isLoading: true });
        await NetInfo.getConnectionInfo().then((connectionInfo) => {
          connnection_Status = connectionInfo.type == 'none' ? false : true;
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });

        await this._siteInfo();
      }
    );
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
  }

  /*..................................................................................................*/

  _onRefresh = () => {
    this.setState({ refreshing: true });

    this._siteInfo();
  }

  openIOSPickerModal = () => {
    this.setState({ pickerIOSModal: true })
  }
  openAndroidPickerModal = () => {
    this.setState({ pickerAndroidModal: true });
  }
  AndroidValueSelected = (value) => {
    this.setState({ picker1: value, pickerAndroidModal: false });
  }

  closePickerIOSModal = () => {
    this.setState({ pickerIOSModal: false })
  }
  setDate(newDate) {
    this.setState({ tempDate: newDate });
  }
  closeDatePickerModal = () => {
    this.setState({ datepickerIOSModal: false })
  }
  selectCloseDatePickerModal = () => {
    console.log(this.state.tempDate);
    this.setState({ chosenDateIOS: Moment(new Date(this.state.tempDate)).format('DD-MMM-YYYY') });
    this.setState({ datepickerIOSModal: false })
  }
  openAndroidDatePicker = async () => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: new Date(),
        maxDate: new Date()
      });
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
      if (action == DatePickerAndroid.dateSetAction) {
        console.log(year);
        this.setState({ chosenDateAndroid: day + '-' + months[month] + '-' + year });
      }
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  }
  openIOSDatePickerModal = () => {
    this.setState({ tempDate: new Date(this.state.chosenDateIOS)  });
    this.setState({ datepickerIOSModal: true })
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

  /* .................................session Data ...............................................*/

  async _loadTokenID() {
    try {
      var value = await AsyncStorage.getItem('TokenID');
      var site = await AsyncStorage.getItem('SiteID');
      var loginId = await AsyncStorage.getItem('LoginID');
      if (loginId != null) {
        this.setState({
          LoginID: loginId,
          SiteID: site,
          TokenID: value
        });
      }

    }
    catch (error) { }
  }
  /*...................................................................................................*/

  /*............................................ Sending Mail .............................................................*/
  _emailReport = () => {
    const dtt = Moment(new Date(this.state.chosenDateAndroid)).format('MM/DD/YYYY');
    var date = Platform.OS === 'ios' ? this.state.chosenDateIOS : dtt;
    const { emailId } = this.state;
    let type = '';
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (this.state.picker1 === 'Monthly') {
      type = 'month'
    } else {
      type = 'day'
    }
    if (type == '') {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Please Select a Value',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        Alert.alert('Please Select a Value');
      }
      return false;
    }
    else if (emailId == '') {
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
    }
    else if (reg.test(emailId) === false) {
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
    else {
      if (!connnection_Status) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
        } else {
          Alert.alert('No internet Connection');
        }
        return;
      }
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity(
          'Please wait while we generate report.',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      } else {
        Alert.alert('Please wait while we generate report.');
      }

      fetch(SEND_REPORT_MAIL, {
        method: "POST",
        "headers": {
          tokenid: this.state.TokenID,
          siteid: this.state.SiteID,
          "prsearchtype": type,
          "emailid": this.state.emailId,
          "evtime": Moment(new Date(date)).format('DD-MMM-YYYY')
        },
      }).then(response => response.json())
        .then(responseJson => {
          if (responseJson.indexOf('Your report has been sent to your emailid.') > -1) {
            if (Platform.OS !== 'ios') {
              ToastAndroid.showWithGravity(
                PLANT_REPORT_MSG,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            } else {
              Alert.alert(PLANT_REPORT_MSG);
            }
          }
          else {
            if (Platform.OS !== 'ios') {
              ToastAndroid.showWithGravity(
                PLANT_REPORT_MSG_FAILED,
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
              );
            } else {
              Alert.alert(PLANT_REPORT_MSG_FAILED);
            }
          }
        });
    }
  }


  /* ..............................................API call for Plant Report ............................................*/

  _siteInfo = async () => {
    await this._loadTokenID();
    this.setState({ refreshing: true });
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
        tokenid: this.state.TokenID,
        siteid: this.state.SiteID,
      },
    }).then(response => response.json())
      .then(responseJson => {

        if (responseJson.siteInfo.length > 0) {
          this.setState({ siteInfo: responseJson.siteInfo[0], isLoading: false, refreshing: false })
        }
        else {
          if (Platform.OS !== 'ios') {
            ToastAndroid.showWithGravity(
              PLANTREP_RECORD_NOT_AVAIL,
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
          } else {
            Alert.alert(PLANTREP_RECORD_NOT_AVAIL);
          }
        }

      });
  }
  /*...................................................................................................................................*/

  closeDrawer = () => {
    this.setState({
      showMenu: false
    });
  }

  render() {
    return (

      <CommonView>
        {this.state.isLoading ?
          <View style={{ flex: 1, minHeight: Dimensions.get('window').height - 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={APP_GREEN} />
          </View>
          :

          <KeyboardAvoidingView style={styles.container} behavior="padding">
            <StatusBar hidden />
            <ScrollView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }>

              <ImageBackground source={require('./images/bg.png')} style={styles.loginBannerImage} >


                <View style={{ flex: 1, flexDirection: 'column', }}>
                  <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 0.5, width: '100%' }}>
                      <View style={styles.pageHeadingDiv}>
                        <Text style={styles.pageHeading}>
                          <Entypo name="info-with-circle" size={18} style={{ paddingRight: 25 }} />
                          &nbsp;Plant Info
                        </Text>

                      </View>
                    </View>


                    <View style={styles.plantReportDiv}>
                      <View style={styles.plantReport}>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Installed Power</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.InstalledPowerDC} kWp</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Commissioned on</Text>
                          <Text style={styles.plantReportRight}>{Moment(new Date(this.state.siteInfo.DateOfCommissioning)).format('DD-MMM-YYYY')}</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Integrated on</Text>
                          <Text style={styles.plantReportRight}>{Moment(new Date(this.state.siteInfo.DateOfIntegration)).format('DD-MMM-YYYY')}</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Site Status</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.SiteStatus}</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>No. Of PV Panel</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.NoOfPvPanel}</Text>
                        </View>

                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>No. of Inverters </Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.NoOfInv}</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Plant Area</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.PlantArea} sq.m</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Panel Wattage</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.PanelWattage} W</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Module Efficiency</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.ModuleEffi} %</Text>
                        </View>
                        <View style={styles.plantReportRow}>
                          <Text style={styles.plantReportLeft}>Country</Text>
                          <Text style={styles.plantReportRight}>{this.state.siteInfo.Country}</Text>
                        </View>
                      </View>
                    </View>
                    {/*  <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 0.5, width: '100%' }}>
                      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10}}> */}
                    <View style={{ borderBottomColor: '#ccc', borderBottomWidth: 0.5, width: '100%' }}>
                      <View style={styles.pageHeadingDiv}>
                        <Text style={styles.pageHeading}>
                          <FontAwesome name="edit" size={18} style={{ padding: 30 }} />
                          &nbsp;{PLANT_REPORT_DETAIL_MAIL}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginLeft: 23, marginRight: 23, elevation: 3, shadowColor: '#000', backgroundColor: APP_GREEN, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, color: '#fff', marginTop: 20, }}>
                      <View style={Platform.OS === 'ios' ? { display: 'none' } : { flexDirection: 'row', }}>
                        <TouchableOpacity onPress={this.openAndroidPickerModal} style={Platform.OS !== 'ios' ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 } : { display: 'none' }}>
                          <Text style={{ color: '#fff', width: '100%' }}>{this.state.picker1}</Text>
                          <FontAwesome name="caret-down" size={16} color='#fff' style={{ position: 'absolute', right: 10 }} />
                          <Modal onRequestClose={() => { }} animationType="slide" transparent={true} visible={this.state.pickerAndroidModal}>
                            <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', height: '100%', width: '100%', flexDirection: 'column', justifyContent: 'center', padding: 20 }}>
                              <View style={{ backgroundColor: '#ffffff' }}>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => this.AndroidValueSelected('Monthly')}>
                                  <Text>Monthly</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => this.AndroidValueSelected('Daily')}>
                                  <Text>Daily</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </Modal>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity onPress={this.openIOSPickerModal} style={Platform.OS === 'ios' ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 5 } : { display: 'none' }}>
                        <Text style={{ color: '#fff', marginRight: 5, textTransform: 'capitalize' }}>{this.state.picker1}</Text>
                        <FontAwesome name="caret-down" size={16} color='#fff' />
                        <Modal onRequestClose={() => { }} animationType="slide" transparent={true} visible={this.state.pickerIOSModal}>
                          <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', flex: 1, flexDirection: 'column', justifyContent: 'flex-end', padding: 10, paddingBottom: 5 }}>
                            <View style={{ backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                              <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                                <Text style={{ textAlign: 'center', color: '#aaa', padding: 10 }}>Please select a value</Text>
                              </View>
                              <View>
                                <Picker
                                  selectedValue={this.state.picker1}
                                  onValueChange={(itemValue, itemIndex) =>
                                    this.setState({ picker1: itemValue, pickerIOSModal: false })
                                  }
                                  style={{ width: '100%', color: '#fff' }}>
                                  <Picker.Item label="Month" value="month" />
                                  <Picker.Item label="Day" value="day" />
                                </Picker>
                                <AntDesign name="caretdown" size={10} color="#fff" style={{ position: 'absolute', right: 15, top: 10, elevation: 6 }} />
                              </View>
                              <View style={{ borderTopWidth: 1, borderTopColor: '#eee', marginTop: 10 }}>
                                <Text style={{ textAlign: 'center', padding: 15, fontSize: 18, color: APP_BUTTON_GREEN, fontWeight: 'bold' }} onPress={this.selectCloseDatePickerModal}>Confirm</Text>
                              </View>
                            </View>
                            <View style={{ backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                              <Text style={{ textAlign: 'center', padding: 15, fontSize: 18, color: 'red', fontWeight: 'bold' }} onPress={this.closePickerIOSModal}>Cancel</Text>
                            </View>
                          </View>
                        </Modal>
                      </TouchableOpacity>
                    </View>



                    <View style={styles.datePicker}>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: APP_BUTTON_GREEN, padding: 5 }}>
                        <FontAwesome name="calendar" size={16} color='#fff' style={{ paddingRight: 10 }} />
                        <Text style={{ textAlign: 'center', color: '#fff' }}>From</Text>
                      </View>
                      <Modal onRequestClose={() => { }} animationType="slide" transparent={true} visible={this.state.datepickerIOSModal}>
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', flexDirection: 'column', justifyContent: 'flex-end', padding: 10, paddingBottom: 5 }}>
                          <View style={{ backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                            <View style={{ borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                              <Text style={{ textAlign: 'center', padding: 15, color: 'gray' }}>Select a Date</Text>
                            </View>
                            <DatePickerIOS
                              mode="date"
                              date={this.state.tempDate}
                              onDateChange={this.setDate}
                            />
                            <View style={{ borderTopWidth: 1, borderTopColor: '#eee' }}>
                              <Text style={{ textAlign: 'center', padding: 15, fontSize: 18, color: APP_BUTTON_GREEN, fontWeight: 'bold' }} onPress={this.selectCloseDatePickerModal}>Confirm</Text>
                            </View>
                          </View>
                          <View style={{ backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 }}>
                            <Text style={{ textAlign: 'center', padding: 15, fontSize: 18, color: 'red', fontWeight: 'bold' }} onPress={this.closeDatePickerModal}>Cancel</Text>
                          </View>
                        </View>
                      </Modal>
                      <View style={{ flex: 3, borderWidth: 1, borderColor: APP_BUTTON_GREEN, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
                        <Text style={Platform.OS === 'ios' ? { display: 'none' } : { textAlign: 'center', color: 'gray', elevation: 3 }} onPress={this.openAndroidDatePicker}>{this.state.chosenDateAndroid}</Text>
                        <Text style={Platform.OS === 'ios' ? { textAlign: 'center' } : { display: 'none' }} onPress={this.openIOSDatePickerModal}>{this.state.chosenDateIOS}</Text>
                      </View>
                    </View>
                    <View style={styles.emailcss}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: APP_BUTTON_GREEN, padding: 5 }}>
                        <MaterialIcons name="email" size={16} color='#fff' style={{ paddingRight: 10 }} />
                        <Text style={{ textAlign: 'center', color: '#fff', fontSize: 14 }}>Email</Text>
                      </View>
                      {/* <View style={{ flex: 3, borderWidth: 1, borderColor: APP_BUTTON_GREEN, alignItems: 'center', justifyContent: 'center', padding: 5 }}> */}
                      <TextInput
                        style={styles.inputFieldText}
                        value={this.state.emailId}
                        placeholder={'Enter Your EmailId'}
                        placeholderTextColor="gray"
                        keyboardType={'email-address'}
                        onChangeText={(emailId) => this.setState({ emailId })}
                      />
                      {/* </View> */}
                    </View>

                    <View style={{ width: '100%', paddingTop: 10, paddingRight: 20, flexDirection: 'column', alignItems: 'flex-end', shadowColor: '#000', marginBottom: 31, shadowRadius: 3, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 3 }, elevation: 5, margin: 2 }}>
                      <TouchableOpacity onPress={this._emailReport} style={{ width: 150, elevation: 3, borderRadius: 30, padding: 10, backgroundColor: APP_BUTTON_GREEN, overflow: 'hidden' }}>
                        <Text style={{ textAlign: 'center', elevation: 3, color: '#fff' }} >Email Report</Text>
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>

              </ImageBackground>

            </ScrollView>

          </KeyboardAvoidingView>
        }
      </CommonView>
    );
  }
}


/*.................................................... Styles...................................................... */

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
  inputFieldText: {
    flex: 3, borderWidth: 1, borderColor: APP_BUTTON_GREEN, padding: 5,
    height: 32,
    color: 'gray',
    fontSize: 14
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
    fontWeight: 'bold'
  },
  plantReportDiv: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    padding: 25,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5
  },
  plantReport: {
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10
  },
  plantReportRow: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8
  },
  plantReportLeft: {
    flex: 3,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9BA1A1'
  },
  plantReportRight: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#46A3BF'
  },
  emailcss: {
    flex: 1,
    flexDirection: 'row',
    elevation: 3,
    paddingLeft: 23,
    paddingRight: 23,
    width: "100%"
  },
  datePicker: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 23,
    paddingRight: 23,
    elevation: 3,
    paddingTop: 20,
    padding: 23
  }
});
export default PlantReport

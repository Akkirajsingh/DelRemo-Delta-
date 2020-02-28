import React from 'react';
import { View, Image, ImageBackground, Text, Dimensions, TouchableOpacity, ActivityIndicator, AsyncStorage, ScrollView, RefreshControl, Modal, TextInput, NetInfo, ToastAndroid, Platform, Alert } from 'react-native';
import { FontAwesome, SimpleLineIcons, Entypo, Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import CommonView from '../components/CommonView';
import { APP_GREEN, APP_ACTIVE_RED, APP_ACTIVE_GREEN, APP_WHITE } from '../constants/ColorMaster';
import { USER_SITE_LIST, ADV_INFO, BASIC } from '../constants/APIurl';
import aPIStatusInfo from "../components/ErrorHandler";
console.disableYellowBox = true;
let connnection_Status = false;

/*....................................................Class to show Site list...................................................... */

export default class SiteListingScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      allData: [],
      backupData: [],
      filteredSiteListComm: [],
      filteredSiteListDown: [],
      isLoading: true,
      activeFilter: 'all',

      InvList: [],
      adArray: {
        imagepath: '',
        link: '',
        name: ''
      },
      refreshing: false,
      adModal: 'set'
    }
    this.searchInput = React.createRef();
    this.props.navigation.addListener(
      'didFocus',
      () => {
        const a = this.state.backupData;
        this.setState({ allData: a, activeFilter: 'all' });
        if (this.state.backupData.length) {
          this.searchInput.current.clear();
        }
      }
    );

  }

  /*.................................................... Component mount...................................................... */

  async componentDidMount() {
    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      connnection_Status = connectionInfo.type == 'none' ? false : true;

    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    await this._storedTokenID();
    this.getSiteList();
  }

  /*.................................................... Getting the token ID...................................................... */

  async _storedTokenID() {
    try {
      await AsyncStorage.getItem('TokenID').then(
        TokenID => {
          this.setState({ AsyncTokenID: TokenID })
        }
      );
    } catch (error) { }
  }

  /*....................................................Get Site List...................................................... */

  async getSiteList() {
    this.setState({ refreshing: true });
    // await this.getAD();

    if (!connnection_Status) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
      } else {
        Alert.alert('No internet Connection');
      }
      return;
    }
    fetch(
      USER_SITE_LIST,
      {
        method: "POST",
        headers: {
          tokenid: this.state.AsyncTokenID
        }
      }
    ).then(aPIStatusInfo.handleResponse).then(response => response.json()).then(async responseJson => {
      if (responseJson['SiteList'] && responseJson['SiteList'].length > 0) {


        await this.setState({ allData: responseJson['SiteList'], backupData: responseJson['SiteList'] })


        await this.getInverterCount();
        var filteredSiteListComm = this.state.allData.filter(
          (item) =>
            (item["ComStatus"].toLowerCase().indexOf("synced") > -1 || item["ComStatus"].toLowerCase().indexOf("syncing") > -1)
        )
        var filteredSiteListdown = this.state.allData.filter((item) =>
          (item["ComStatus"].toLowerCase().indexOf("down") > -1)
        );
        await this.getAD();

        this.setState({ refreshing: false, isLoading: false, filteredSiteListComm: filteredSiteListComm, filteredSiteListDown: filteredSiteListdown });
      } else {
        Alert.alert(
          'Error while getting site list',
          'Click reload to try again',
          [
            { text: 'Reload', onPress: () => { this.getSiteList(); } },
            {
              text: 'Cancel',
              onPress: () => { this.setState({ refreshing: false, isLoading: false }) },
              style: 'cancel',
            }
          ],
          { cancelable: false },
        );
      }
    }).catch(err => {

      let errMSg = aPIStatusInfo.logError(err);
      if (errMSg.length > 0) {
        ToastAndroid.showWithGravity(
          errMSg,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        Alert.alert(
          'Error while getting site list',
          'Click reload to try again',
          [
            { text: 'Reload', onPress: () => { this.getSiteList(); } },
            {
              text: 'Cancel',
              onPress: () => { this.setState({ refreshing: false, isLoading: false }) },
              style: 'cancel',
            }
          ],
          { cancelable: false },
        );

      }

    });
  }

  /*.................................................... Show Advertisement...................................................... */

  async getAD() {

    if (this.state.adModal === 'set') {
      if (!connnection_Status) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
        } else {
          Alert.alert('No internet Connection');
        }
        return;
      }
      fetch(ADV_INFO, {
        method: "POST",
        headers: {
          token_delta: '123'
        }
      }).then(response => response.json()).then(adArray => {
        this.setState({ adArray: adArray['Advarray'][0], adModal: 'set' })

      });

    } else {
      this.setState({ adModal: 'unSet' });

    }

  }

  /*.................................................... Get Inverter Count...................................................... */

  getInverterCount() {

    for (let i = 0; i < this.state.backupData.length; i++) {
      if (!connnection_Status) {
        if (Platform.OS !== 'ios') {
          ToastAndroid.showWithGravity('No Internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
        } else {
          Alert.alert('No Internet Connection');
        }
        return;
      }
      fetch(
        BASIC,
        {
          method: "POST",
          headers: {
            tokenid: this.state.AsyncTokenID,
            siteid: this.state.backupData[i].SiteId
          }
        }
      ).then(aPIStatusInfo.handleResponse)
        .then(response => response.json()).then(responseJson => {

          this.state.allData[i].NoOfInv = responseJson['siteInfo'][0].NoOfInv


        }).catch(err => {
          let errMSg = aPIStatusInfo.logError(err);
          if (Platform.OS !== 'ios') {
            ToastAndroid.showWithGravity(
              errMSg.length > 0 ? errMSg : "An error occured",
              ToastAndroid.LONG,
              ToastAndroid.CENTER,
            );
          } else {
            Alert.alert(errMSg.length > 0 ? errMSg : "An error occured.");
          }
          if (err.status == '401') {
            AsyncStorage.clear();
            this.props.navigation.navigate('LoginScreen');
            return;
          }
          this.setState({ refreshing: false });
          return;


        });
    }
  }

  /*.................................................... Setting state for active filter...................................................... */

  getFilteredSiteList(type) {
    this.setState({ activeFilter: type });
    this.changeFilter(type);
  }




  /*.................................................... Getting comm/non comm/all sites...................................................... */

  changeFilter = (type) => {
    if (type === 'comm') {

      this.setState({
        allData: this.state.filteredSiteListComm,

      });


    } else if (type === 'ncomm') {

      this.setState({
        allData: this.state.filteredSiteListDown,

      });


    } else {
      if (this.state.backupData.length > 0) {
        this.setState({
          allData: this.state.backupData,

        });


      }
    };
  }


  /*.................................................... Component unmount...................................................... */

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
  }

  /*.................................................... Site Search...................................................... */

  searchSite(text) {

    const a = this.state.backupData.filter(x => x.SiteName.toLowerCase().indexOf(text.toLowerCase()) > -1);
    if (a.length > 0) {
      this.setState({ allData: a });

    } else {

    }

  }

  /*.................................................... render begins...................................................... */


  render() {
    /*.................................................... Sitelisting View...................................................... */

    return (
      <CommonView menuText={'SiteListing'}>
        {this.state.isLoading ?
          <View style={{ flex: 1, minHeight: Dimensions.get('window').height - 60, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={APP_GREEN} />
          </View>
          :
          <ImageBackground source={require("./images/overlay.png")} style={{ width: '100%', resizeMode: 'cover' }}>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 15, paddingRight: 15, marginTop: 10 }}>
              <TouchableOpacity onPress={() => this.getFilteredSiteList('all')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={this.state.activeFilter === 'all' ? 'ios-radio-button-on' : 'ios-radio-button-off'} size={20} color={this.state.activeFilter === 'all' ? 'green' : '#cccccc'} style={{ marginRight: 5 }} />
                <Text>All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.getFilteredSiteList('comm')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={this.state.activeFilter === 'comm' ? 'ios-radio-button-on' : 'ios-radio-button-off'} size={20} color={this.state.activeFilter === 'comm' ? 'green' : '#cccccc'} style={{ marginRight: 5 }} />
                <Text>Comm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.getFilteredSiteList('ncomm')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={this.state.activeFilter === 'ncomm' ? 'ios-radio-button-on' : 'ios-radio-button-off'} size={20} color={this.state.activeFilter === 'ncomm' ? 'green' : '#cccccc'} style={{ marginRight: 5 }} />
                <Text>Non-Comm</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingLeft: 15, paddingRight: 15, marginBottom: 5 }}>
              <TextInput
                ref={this.searchInput}
                style={{ height: 40, paddingLeft: 15, paddingRight: 15, backgroundColor: '#ffffff', borderRadius: 15, marginTop: 10 }}
                onSubmitEditing={(event) => this.searchSite(event.nativeEvent.text)}
                blurOnSubmit={true}
                value={this.state.searchInput}
                placeholder='Search'
              />
            </View>
            <View style={{ paddingLeft: 15, paddingRight: 15, height: Dimensions.get('window').height - 140 }}>
              <View>
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={() => { this.getSiteList() }}
                    />
                  }
                  showsVerticalScrollIndicator={false}
                >
                  {this.state.allData.map((listItem, key) => (
                    <TouchableOpacity key={key} onPress={() => { AsyncStorage.setItem('SiteName', listItem.SiteName); AsyncStorage.setItem('comStatus', listItem.ComStatus); this.props.navigation.navigate('DashboardScreen', { SiteData: listItem.SiteId, commStatus: listItem.ComStatus, isViewingUser: false }) }} style={{ shadowColor: '#0000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.5, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.5)', padding: 10, marginTop: 10 }}>
                      <View>
                        <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
                          <View style={[{ width: 10, height: 10, borderRadius: 10 }, (listItem.ComStatus === 'synced' || listItem.ComStatus === 'syncing') ? { backgroundColor: APP_ACTIVE_GREEN } : { backgroundColor: APP_ACTIVE_RED }]}></View>
                          <Text style={{ color: "#000", marginLeft: 10 }}>{listItem.SiteName}</Text>
                          <View style={[{ marginTop: 5, marginLeft: 'auto' }, listItem.Critical === 0 ? { opacity: 0.3 } : { opacity: 1 }]}>
                            <View style={{ borderRadius: 35, width: 18, height: 18, margin: 5, backgroundColor: APP_ACTIVE_RED, position: "absolute", top: -15, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: '#ffffff', fontSize: 12 }}>{listItem.Critical}</Text>
                            </View>
                            <Entypo name="bell" size={20} style={{ color: "black" }} />
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome name="superpowers" size={14} style={{ color: "black", marginRight: 5 }} />
                            <Text style={{ fontSize: 14 }}>
                              {listItem.powerCapacity} kWp
                          </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <SimpleLineIcons name="energy" size={14} style={{ color: "black", marginRight: 5 }} />
                            <Text style={{ fontSize: 14 }}>
                              {listItem.TodayYield} kWh
                          </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons name="car-battery" size={14} style={{ color: "black", marginRight: 5 }} />
                            <Text style={{ fontSize: 14 }}>
                              Inverter(s) : {listItem.NoOfInv}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {this.state.allData.length > 0 ?
                    null
                    :
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <TouchableOpacity onPress={() => { this.getSiteList() }}>
                        <Text style={{ backgroundColor: APP_GREEN, color: APP_WHITE, padding: 5, borderRadius: 3 }}>Reload</Text>
                      </TouchableOpacity>
                    </View>
                  }
                  <View style={{ height: 20 }}></View>
                </ScrollView>
              </View>
            </View>
            {this.state.adArray.imagepath !== '' ?
              <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.adModal === 'set'}
                onRequestClose={() => { }}>
                <View style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: Dimensions.get('window').height, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
                  <View style={{ padding: 15 }}>
                    <Text style={{ textAlign: 'center', color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>{this.state.adArray.name}</Text>
                    <TouchableOpacity onPress={async () => {
                      this.setState({ adModal: 'unSet' });
                      await WebBrowser.openBrowserAsync(this.state.adArray.link)
                    }
                    }>

                      <Image source={{ uri: this.state.adArray.imagepath }} style={{ width: '100%', minHeight: 150, resizeMode: 'contain' }} />

                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ position: 'absolute', top: 0, right: 0, padding: 10 }}
                      onPress={async () => {

                        this.setState({ adModal: 'unSet' });
                      }}>
                      <AntDesign name="closecircleo" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              :
              null
            }

          </ImageBackground>
        }
      </CommonView>
    );
  }
}
import React from 'react';
import { StyleSheet, Text, ScrollView, View, KeyboardAvoidingView, TouchableHighlight, StatusBar, AsyncStorage, Platform, TouchableOpacity, ActivityIndicator, Dimensions, NetInfo, ToastAndroid, Alert } from 'react-native';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import CommonView from "../components/CommonView";
import ChartView from '../Screens/webview.js';

import ProgressCircle from 'react-native-progress-circle';
import { APP_GREEN } from '../constants/ColorMaster';
import { USER_SITE_LIST } from '../constants/APIurl';
import aPIStatusInfo from "../components/ErrorHandler";
console.disableYellowBox = true;
javaScriptEnabled = true;
domStorageEnabled = true;
let connnection_Status = false;

   /*.................................................... Class to display Support Dashboard...................................................... */

class SupportDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      login_text: 'Login',
      showMenu: false,
      backgroundColor: 'white',
      color: 'gray',
      header: 'Support Dashboard',
      activeTabIndex: 1,

      siteListing: [],
      activeSiteListing: [],
      deactiveSiteListing: [],

      pieStatus: {
        total: null,
        synced: null,
        syncing: null,
        down: null,
        notReady: null,
        newlyAdded: null
      },
      tileStatus: {
        total: null,
        synced: null,
        syncing: null,
        down: null,
        notReady: null,
        newlyAdded: null
      },
      isLoading: true
    }
    
  }

     /*.................................................... Component did mount...................................................... */

  async componentDidMount() {

    await NetInfo.getConnectionInfo().then((connectionInfo) => {
      connnection_Status = connectionInfo.type == 'none' ? false : true;
    });
    NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });

    var value = await AsyncStorage.getItem('TokenID');
    this.getSiteListingData(value);
  }

     /*.................................................... Component Unmount...................................................... */

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
  }

     /*.................................................... Get Site Listing Data...................................................... */

  getSiteListingData = (restToken) => { 
    if (!connnection_Status) {
      if (Platform.OS !== 'ios') {
        ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
      } else {
        Alert.alert('No internet Connection', 'Please check your internet connection.');
      }
      return;
    }
    fetch(
      USER_SITE_LIST,
      {
        method: "POST",
        headers: {
          tokenid: restToken
        }
      }
    ).then(aPIStatusInfo.handleResponse)
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.Message !== 'Token expired.') {
          var SiteList = responseJson.SiteList;
          var tempActiveAlarmList = SiteList.filter(
            item =>
              item["Critical"] != 0
          )
          var tempDeactiveAlarmList = SiteList.filter(
            item =>
              item["Critical"] == 0
          )
          this.setState({
            isLoading: false,

          });
          var tempPieStatus = {
            total: SiteList.length,
            syncedSites: SiteList.filter(item => item.ComStatus == "synced"),
            syncingSites: SiteList.filter(item => item.ComStatus == "syncing"),
            downSites: SiteList.filter(item => item.ComStatus == "down"),
            notReadySites: SiteList.filter(item => item.ComStatus == "Not Ready"),
            newlyAddedSites: SiteList.filter(item => item.ComStatus == "New Added"),
            synced: SiteList.filter(item => item.ComStatus == "synced").length,
            syncing: SiteList.filter(item => item.ComStatus == "syncing").length,
            down: SiteList.filter(item => item.ComStatus == "down").length,
            notReady: SiteList.filter(item => item.ComStatus == "Not Ready").length,
            newlyAdded: SiteList.filter(item => item.ComStatus == "New Added").length
          }
          this.setState({
           
            siteListing: responseJson.SiteList,
            activeSiteListing: tempActiveAlarmList,
            deactiveSiteListing: tempDeactiveAlarmList,
            pieStatus: tempPieStatus,
            tileStatus: tempPieStatus
          });

        } else {
          if (Platform.OS !== 'ios') {
            ToastAndroid.showWithGravity(
              errMSg.length > 0 ? errMSg : "Token Expired. Please re-login.",
              ToastAndroid.LONG,
              ToastAndroid.CENTER);
          } else {
            Alert.alert(errMSg.length > 0 ? errMSg : "Token Expired. Please re-login.");
          }
          AsyncStorage.clear();
          this.props.navigation.navigate('LoginScreen');
        }
      })
      .catch(err => {
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
  };


     /*.................................................... Creating data for tile...................................................... */

  setTileStatus = (type, activeTabIndex) => {
    var siteListing = null;
    if (type == "active") {
      siteListing = this.state.activeSiteListing;
    } else if (type == "deactive") {
      siteListing = this.state.deactiveSiteListing;
    } else {
      siteListing = this.state.siteListing;
    }
    var tempTileStatus = {
      total: siteListing.length,
      syncedSites: siteListing.filter(item => item.ComStatus == "synced"),
      syncingSites: siteListing.filter(item => item.ComStatus == "syncing"),
      downSites: siteListing.filter(item => item.ComStatus == "down"),
      notReadySites: siteListing.filter(item => item.ComStatus == "Not Ready"),
      newlyAddedSites: siteListing.filter(item => item.ComStatus == "New Added"),
      synced: siteListing.filter(item => item.ComStatus == "synced").length,
      syncing: siteListing.filter(item => item.ComStatus == "syncing").length,
      down: siteListing.filter(item => item.ComStatus == "down").length,
      notReady: siteListing.filter(item => item.ComStatus == "Not Ready").length,
      newlyAdded: siteListing.filter(item => item.ComStatus == "New Added").length
    }

    this.setState({
      tileStatus: tempTileStatus,
      activeTabIndex: activeTabIndex
    })

  }

     /*.................................................... On click of tab Alarm type...................................................... */

  async sendActiveTabData(type) {
    if (this.state.activeTabIndex === 1) {
      await AsyncStorage.setItem('siteListData', JSON.stringify(this.state.tileStatus[type]));
      this.props.navigation.navigate('SupportSiteListing', { siteListType: type, alarmType: 'All Alarms' });
    } else if (this.state.activeTabIndex === 2) {
      await AsyncStorage.setItem('siteListData', JSON.stringify(this.state.tileStatus[type]));
      this.props.navigation.navigate('SupportSiteListing', { siteListType: type, alarmType: 'Active Alarms' });
    } else {
      await AsyncStorage.setItem('siteListData', JSON.stringify(this.state.tileStatus[type]));
      this.props.navigation.navigate('SupportSiteListing', { siteListType: type, alarmType: 'Deactive Alarms' });
    }
  }

   /*.................................................... Set state for active tab...................................................... */

  changeActiveTab(index) {
    this.setState({ activeTabIndex: index });
  }
  
     /*.................................................... Toggle Show Menu...................................................... */

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


     /*.................................................... Render Begins...................................................... */

  render() {
    
       /*.................................................... Pie chart config...................................................... */

    var pieStatus = this.state.pieStatus;
    var tileStatus = this.state.tileStatus;
    var tileStatusTot = tileStatus.total === null ? 1 : tileStatus.total
    var tileStatusSync = tileStatus.synced === null ? 0 : tileStatus.synced
    var tileStatusSyncing = tileStatus.syncing === null ? 0 : tileStatus.syncing
    var tileStatusNewlyAdded = tileStatus.newlyAdded === null ? 0 : tileStatus.newlyAdded
    var tileStatusNotReady = tileStatus.notReady === null ? 0 : tileStatus.notReady
    var tileStatusDown = tileStatus.down === null ? 0 : tileStatus.down
    var synced=(tileStatusSync / tileStatusTot)
   
    var conf = {
      credits: {
        enabled: false
      },
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Total Sites<br/>' + pieStatus.total,
        align: 'center',
        verticalAlign: 'middle',
        x: -60,
        y: 0
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'middle',
        x: 0,
        y: 0
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false
          },

          showInLegend: true,
          innerSize: 120,
          depth: 45,
          colors: [
            "#27ae60",
            "#2FE40B",
            "#f7b731",
            "#4b7bec",
            'rgba(250, 39, 22,0.7)',
            
          ]
        }
      },
      series: [{
        fillOpacity: 0.1,
        name: 'Site Status Count',
        data: [
          ['Synced', pieStatus.synced],
          ['Syncing', pieStatus.syncing],
          ['Not Ready', pieStatus.notReady],
          ['Newly Added', pieStatus.newlyAdded],
          ['Down', pieStatus.down]
        ]
      }]
    };

    const options = {
      global: {
        useUTC: false
      },
      lang: {
        decimalPoint: ',',
        thousandsSep: '.'
      },
      exporting: false
    };
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <StatusBar hidden />
        <CommonView menuText={'SupportDashboard'}>
          {this.state.isLoading ?
            <View>
              <View style={{ flex: 1, minHeight: Dimensions.get('window').height - 60, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={APP_GREEN} />
              </View>

            </View>
            :
            <View>
              <ScrollView>
                <View style={{ flex: 1, flexDirection: 'column' }}>
                  <View style={styles.pageHeadingDiv}>
                    <View style={styles.pageHeading}>
                      <MaterialCommunityIcons name="radio-tower" size={20} style={{ color: 'gray', padding: 5 }} />
                      <Text style={{ color: "gray", alignItems: "center", fontSize: 16 }}>Communication Status</Text>
                    </View>
                  </View>
                  <View>
                    <ChartView style={{ height: 250 }} config={conf} options={options} originWhitelist={['']}></ChartView>
                  </View>
                  <View style={styles.tabLinks}>
                    <TouchableHighlight style={[styles.tabLink, this.state.activeTabIndex === 1 ? styles.activeTabLink : '']} onPress={() => this.setTileStatus("All", 1)}>
                      <View style={[styles.tab, this.state.activeTabIndex === 1 ? styles.activeTab : '']}>
                        <Ionicons name="ios-alarm" size={20} color="grey" />
                        <Text style={styles.tabLinkText}>
                          All Alarms
                </Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={[styles.tabLink, this.state.activeTabIndex === 2 ? styles.activeTabLink : '']} onPress={() => this.setTileStatus("active", 2)}>
                      <View style={[styles.tab, this.state.activeTabIndex === 2 ? styles.activeTab : '']}>
                        <Ionicons name="ios-alarm" size={20} color="green" />
                        <Text style={styles.tabLinkText}>
                          Active Alarms
                </Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={[styles.tabLink, this.state.activeTabIndex === 3 ? styles.activeTabLink : '']} onPress={() => this.setTileStatus("deactive", 3)}>
                      <View style={[styles.tab, this.state.activeTabIndex === 3 ? styles.activeTab : '']}>
                        <Ionicons name="ios-alarm" size={20} color="red" />
                        <Text style={styles.tabLinkText}>
                          Deactive Alarms
                </Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                  <View style={styles.tabsContent}>
                    <View style={[styles.tabContent, styles.activeTabContent]}>
                      <TouchableOpacity onPress={() => this.sendActiveTabData('syncedSites')} style={styles.singleTabContent} elevation={3}>
                        <View style={[styles.colorIndicator, { backgroundColor: '#14A803' }]}></View>
                        <View style={styles.alarmsType}>
                          <Text style={[styles.alarmType, { color: '#14A803' }]}>Synced</Text>
                          <Text style={styles.alarmsTypeNumber}>{tileStatus.synced}</Text>
                        </View>
                         <View style={styles.alarmsPercent}>
                           <ProgressCircle percent={Math.round(synced * 1000) / 10} radius={15} borderWidth={5} color="#14A803" shadowColor="#DCE0DB" bgColor="#fff"></ProgressCircle> 
                          <Text style={styles.alarmsPercentage}>{Math.round(synced * 1000) / 10}%</Text>
                        </View> 
                        <View style={styles.alarmsClick}>
                          <FontAwesome style={styles.alarmsClickIcon} name="angle-right" size={25} />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.sendActiveTabData('syncingSites')} style={styles.singleTabContent} elevation={3}>
                        <View style={[styles.colorIndicator, { backgroundColor: '#2FE40B' }]}></View>
                        <View style={styles.alarmsType}>
                          <Text style={[styles.alarmType, { color: '#2FE40B' }]}>Syncing</Text>
                          <Text style={styles.alarmsTypeNumber}>{tileStatus.syncing}</Text>
                        </View>
                       { <View style={styles.alarmsPercent}>
                          <ProgressCircle percent={(tileStatusSyncing / tileStatusTot) * 100} radius={15} borderWidth={5} color="#2FE40B" shadowColor="#DCE0DB" bgColor="#fff"></ProgressCircle>
                          <Text style={styles.alarmsPercentage}>{Math.round((tileStatusSyncing / tileStatus.total) * 1000) / 10}%</Text>
                        </View>}
                        <View style={styles.alarmsClick}>
                          <FontAwesome style={styles.alarmsClickIcon} name="angle-right" size={25} />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.sendActiveTabData('newlyAddedSites')} style={styles.singleTabContent} elevation={3}>
                        <View style={[styles.colorIndicator, { backgroundColor: '#4169E1' }]}></View>
                        <View style={styles.alarmsType}>
                          <Text style={[styles.alarmType, { color: '#4169E1' }]}>Newly Added</Text>
                          <Text style={styles.alarmsTypeNumber}>{tileStatus.newlyAdded}</Text>
                        </View>
                        {<View style={styles.alarmsPercent}>
                          <ProgressCircle percent={(tileStatusNewlyAdded / tileStatusTot) * 100} radius={15} borderWidth={5} color="#4169E1" shadowColor="#DCE0DB" bgColor="#fff"></ProgressCircle>
                          <Text style={styles.alarmsPercentage}>{Math.round((tileStatusNewlyAdded / tileStatusTot) * 1000) / 10}%</Text>
                        </View>}
                        <View style={styles.alarmsClick}>
                          <FontAwesome style={styles.alarmsClickIcon} name="angle-right" size={25} />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.sendActiveTabData('notReadySites')} style={styles.singleTabContent} elevation={3}>
                        <View style={[styles.colorIndicator, { backgroundColor: '#FAB105' }]}></View>
                        <View style={styles.alarmsType}>
                          <Text style={[styles.alarmType, { color: '#FAB105' }]}>Not Ready</Text>
                          <Text style={styles.alarmsTypeNumber}>{tileStatus.notReady}</Text>
                        </View>
                       { <View style={styles.alarmsPercent}>
                          <ProgressCircle percent={(tileStatusNotReady / tileStatusTot) * 100} radius={15} borderWidth={5} color="#FAB105" shadowColor="#DCE0DB" bgColor="#fff"></ProgressCircle>
                          <Text style={styles.alarmsPercentage}>{Math.round((tileStatusNotReady / tileStatusTot) * 10000) / 100}%</Text>
                        </View>}
                        <View style={styles.alarmsClick}>
                          <FontAwesome style={styles.alarmsClickIcon} name="angle-right" size={25} />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => this.sendActiveTabData('downSites')} style={styles.singleTabContent} elevation={3}>
                        <View style={[styles.colorIndicator, { backgroundColor: '#BD1004' }]}></View>
                        <View style={styles.alarmsType}>
                          <Text style={[styles.alarmType, { color: '#BD1004' }]}>Comm. Down</Text>
                          <Text style={styles.alarmsTypeNumber}>{tileStatus.down}</Text>
                        </View>
                        {<View style={styles.alarmsPercent}>
                          <ProgressCircle percent={(tileStatusDown / tileStatusTot) * 100} radius={15} borderWidth={5} color="#BD1004" shadowColor="#DCE0DB" bgColor="#fff"></ProgressCircle>
                          <Text style={styles.alarmsPercentage}>{Math.round((tileStatusDown / tileStatusTot) * 1000) / 10}%</Text>
                        </View>}
                        <View style={styles.alarmsClick}>
                          <FontAwesome style={styles.alarmsClickIcon} name="angle-right" size={25} />
                        </View>
                      </TouchableOpacity>

                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          }
        </CommonView>
      </KeyboardAvoidingView>
    );
  }
}

   /*.................................................... Styles...................................................... */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageHeadingDiv: {
    width: '100%',
    padding: 5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  pageHeading: {
    textAlign: 'center',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pageHead: {
    fontSize: 22,
    color: '#888F8F',
    marginLeft: 5,
    fontWeight: 'bold'
  },
  tabLinks: {
    flex: 1,
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#D9DED8'
  },
  tabLink: {
    flex: 1,
    backgroundColor: '#D9DED8',
    borderRightWidth: 1,
    borderRightColor: '#fff',
    padding: 10,
    paddingBottom: 0
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingBottom: 10
  },
  activeTab: {
    borderBottomColor: 'green',
    borderBottomWidth: 2
  },
  tabLinkText: {
    marginLeft: 5,
    fontSize: 14
  },
  activeTabLink: {
    backgroundColor: '#fff'
  },
  tabsContent: {
    backgroundColor: '#fff',
    padding: 15
  },
  tabContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    display: 'none'
  },
  activeTabContent: {
    display: 'flex'
  },
  singleTabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10
  },
  colorIndicator: {
    width: 10,
    height: '100%'
  },
  alarmsType: {
    padding: 5,
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  alarmsTypeNumber: {
    fontSize: 18,
    color: '#4B5757'
  },
  alarmsPercent: {
    flex: 2,
    color: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  alarmsPercentage: {
    marginLeft: 5,
    marginRight: 5,
    width: 30,
    textAlign: 'right',
    color: '#B4B5B3'
  },
  alarmsClick: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 10
  },
  alarmsClickIcon: {
    color: '#ACAFAD'
  }
});
export default SupportDashboard
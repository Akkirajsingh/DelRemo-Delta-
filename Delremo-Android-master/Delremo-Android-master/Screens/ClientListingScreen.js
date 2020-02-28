import React from 'react';
import { NetInfo, View, Text, StyleSheet, Platform, Picker, Modal, Dimensions, AsyncStorage, TouchableOpacity, ToastAndroid, Alert } from 'react-native';
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import CommonView from "../components/CommonView";
import { GET_CLIENT_INFO, GET_CLIENT_SITE_INFO } from '../constants/APIurl';
import { APP_BUTTON_GREEN } from '../constants/ColorMaster';
import { ScrollView } from 'react-native-gesture-handler';
let connnection_Status = false;

/*................................... Class to show sites based on Client .................................................................*/

export default class ClientListingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedClient: 'Please Select',
            modalVisible: false,
            tokenid: '',
            loginname: '',
            plants: [],
            clientSiteInfo: [],
            plantsMonitored: '0',
            plantCapacity: '0'
        }
    }

/*................................... Component mount.................................................................*/

    async componentDidMount() {
        await AsyncStorage.getItem('TokenID').then(tokenid => {
            this.setState({ tokenid: tokenid });
        })
        await AsyncStorage.getItem('LoginID').then(loginname => {
            this.setState({ loginname: loginname });
        })

        await NetInfo.getConnectionInfo().then((connectionInfo) => {
            connnection_Status = connectionInfo.type == 'none' ? false : true;
        });
        NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(GET_CLIENT_INFO, {
            method: 'POST',
            "headers": {
                tokenid: this.state.tokenid,
                loginname: this.state.loginname
            }
        }).then(response => response.json()).then(
            responseJSON => {
                this.setState({ plants: responseJSON['Clientarray'] });
                this.getSiteDetails(0);
            }
        );
    }

/*................................... Component will unmount.................................................................*/

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', (isConnected) => { connnection_Status = isConnected });
    }

/*................................... Get Site Details.................................................................*/

    async getSiteDetails(index) {
        if (!connnection_Status) {
            if (Platform.OS !== 'ios') {
                ToastAndroid.showWithGravity('No internet Connection', ToastAndroid.SHORT, ToastAndroid.CENTER);
            } else {
                Alert.alert('No internet Connection');
            }
            return;
        }
        fetch(GET_CLIENT_SITE_INFO, {
            method: 'POST',
            "headers": {
                tokenid: this.state.tokenid,
                loginname: this.state.loginname,
                clientname: this.state.plants[index].clientname
            }
        }).then(response => response.json()).then(
            clientSiteInfo => {
                this.setState({ clientSiteInfo: clientSiteInfo['Clientsitearray'], selectedClient: this.state.plants[index].clientDisplyName, plantsMonitored: this.state.plants[index].plants, plantCapacity: this.state.plants[index].power });
            }
        );
    }
/*................................... Client List View.................................................................*/

    render() {
        const plantnames = this.state.plants.map((plant, key) => {
            return (
                <Picker.Item key={key} label={plant.clientDisplyName} value={plant.clientDisplyName} />
            );
        });
        const plantDetails = this.state.clientSiteInfo.map((plant, key) => {
            return (
                <TouchableOpacity onPress={() => { AsyncStorage.setItem('SiteName', plant.sitename); AsyncStorage.setItem('comStatus', plant.comstatus); this.props.navigation.navigate('DashboardScreen', { SiteData: plant.siteid, commStatus: plant.comstatus, isViewingUser: false }) }} key={key} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: 10, backgroundColor: key % 2 === 0 ? 'transparent' : '#DBDBDB' }}>
                    <Text style={{ flex: 1.5, textAlign: 'center' }}>{plant.sitename}</Text>
                    <Text style={{ flex: 1.5, textAlign: 'center' }}>{plant.invnum}</Text>
                    <Text style={{ flex: 1.5, textAlign: 'center' }}>{plant.power}</Text>
                </TouchableOpacity>
            )
        });
        return (
            <CommonView menuText={'ClientListing'}>
                <ScrollView>
                <View style={styles.container}>
                    <View style={{ padding: 15 }}>
                        <View style={styles.androidDevice}>
                            <View style={{ width: '90%', marginLeft: 'auto', marginRight: 'auto' }}>
                                <Picker
                                    selectedValue={this.state.selectedClient}
                                    style={{ height: 40, width: '100%', backgroundColor: APP_BUTTON_GREEN, color: '#ffffff', elevation: 5 }}
                                    onValueChange={(itemValue, itemIndex) => {
                                        this.getSiteDetails(itemIndex);
                                    }
                                    }>
                                    {plantnames}
                                </Picker>
                                <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, top: 15, elevation: 6 }} />
                            </View>
                        </View>
                        <View style={styles.iosDevice}>
                            <View style={{ height: 40, backgroundColor: APP_BUTTON_GREEN, width: '90%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center', shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowRadius: 5, shadowOpacity: 0.3 }}>
                                <Text onPress={() => this.setState({ modalVisible: true })} style={{ color: '#ffffff', textAlign: 'center' }}>{this.state.selectedClient}</Text>
                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={this.state.modalVisible}
                                    onRequestClose={() => { }}>
                                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 15 }}>
                                        <View style={{ backgroundColor: '#ffffff', borderRadius: 15, padding: 15 }}>
                                            <Picker
                                                selectedValue={this.state.selectedClient}
                                                style={{ width: '100%', elevation: 5 }}
                                                onValueChange={(itemValue, itemIndex) => {
                                                    this.setState({ selectedClient: itemValue, modalVisible: false })
                                                    this.getSiteDetails(itemIndex);
                                                }
                                                }>
                                                {plantnames}
                                            </Picker>
                                        </View>
                                    </View>
                                </Modal>
                                <AntDesign name="caretdown" size={10} color="#ffffff" style={{ position: 'absolute', right: 10, elevation: 6 }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={styles.clientListingStats}>
                                <Feather name="cpu" size={30} color="#32A024" />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={{ textAlign: 'center', color: '#495354' }}>No. of Plants{'\n'}Monitored</Text>
                                    <Text style={{ textAlign: 'center', fontSize: 20, color: '#495354', fontWeight: 'bold' }}>{this.state.plantsMonitored}</Text>
                                </View>
                            </View>
                            <View style={styles.clientListingStats}>
                                <Entypo name="flash" size={30} color="#32A024" />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={{ textAlign: 'center', color: '#495354' }}>Total Plant{'\n'}Capacity</Text>
                                    <Text style={{ textAlign: 'center', fontSize: 20, color: '#495354', fontWeight: 'bold' }}>{this.state.plantCapacity}kW</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ marginLeft: 15, marginRight: 15, height: 1, backgroundColor: '#DBDBDB' }}></View>
                    <View style={{ padding: 15 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10, backgroundColor: '#DBDBDB' }}>
                            <Text style={{ flex: 1.5, textAlign: 'center' }}>Plant  Name</Text>
                            <Text style={{ flex: 1.5, textAlign: 'center' }}>No. of Inverters</Text>
                            <Text style={{ flex: 1.5, textAlign: 'center' }}>Power Generated (kW)</Text>
                        </View>
                        {plantDetails}
                    </View>
                </View>
                </ScrollView>
            </CommonView>
        );
    }
}

/*................................... Styles.................................................................*/

const styles = StyleSheet.create({
    androidDevice: {
        display: Platform.OS === 'ios' ? 'none' : 'flex'
    },
    iosDevice: {
        display: Platform.OS === 'ios' ? 'flex' : 'none'
    },
    container: {
        paddingBottom: 20
    },
    clientListingStats: {
        width: (Dimensions.get('window').width * 0.5) - 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        borderWidth: 2,
        borderColor: APP_BUTTON_GREEN,
        backgroundColor: '#F1F5F1'
    }
});
import React, { Component } from 'react';
import { Image, StyleSheet, Text, AsyncStorage, View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { MaterialIcons, Entypo, FontAwesome, AntDesign } from '@expo/vector-icons';
import { APP_GREEN } from '../constants/ColorMaster';
import call from 'react-native-phone-call';
import { PHONE_NUMBER } from '../constants/OtherConstants';
import { TouchableOpacity } from 'react-native-gesture-handler';


/*.................................................... Class to display Side Bar Menu...................................................... */

class SideBarMenu extends Component {
    constructor(props) {
        super(props);
        this.state = { isAuth: false, header: 'Site Listing', hideMenu: true, CustomerName: '', isUserSupport: false };
        /* this.props.navigation.addListener(
            'didFocus',
            () => {
              //  this._loadLoginID();
            }
        ); */
    }

    /*.................................................... Handler to make a call...................................................... */

    call = () => {
        //handler to make a call
        const args = {
            number: PHONE_NUMBER,
            prompt: false,
        };
        call(args).catch(console.error);
    };

    /*.................................................... Load Login...................................................... */

    async _loadLoginID() {
        AsyncStorage.getItem('LoginID').then(LoginId => {
            this.setState({ CustomerName: LoginId });
        });
    }


    /*.................................................... Component Mount...................................................... */

    /*  async componentDidMount() {
        // this._loadLoginID();
     } */

    /*.................................................... Render Begins...................................................... */

    render() {
        return (

            <View
                style={{ flex: 1, flexDirection: 'column', backgroundColor: '#ffffffc9', elevation: 8 }}>
                <View style={{ padding: 12, alignItems: 'center', flexDirection: 'row', backgroundColor: APP_GREEN }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 50, height: 50, borderRadius: 50, padding: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                            <Image style={{ resizeMode: 'contain', width: 50, height: 50 }} source={require('../Screens/images/delta1.png')} title="Del Remo" />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingLeft: 15, paddingTop: 7 }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', maxWidth: 150 }}>Hi, <Text>{this.props.loginID}</Text></Text>
                        </View>
                    </View>
                </View>
                {this.props.isUserSupport ?
                    <View>
                        {!this.props.isViewingUser ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('PlantReport', { isViewingUser: false })} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                                <Entypo name='info-with-circle' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                                <Text style={styles.menuFont}> Plant Report/Site Info</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {!this.props.isViewingUser ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AlarmScreenHistory', { view: 'history', isViewingUser: false })} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                                {<MaterialIcons name='access-alarm' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />}
                                <Text style={styles.menuFont}>Alarm History </Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ClientListing', { isViewingUser: true })} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <FontAwesome name="list" size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}>Client Listing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('SupportDashboard', { isViewingUser: true })} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <FontAwesome name="dashboard" size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}>NOC Dashboard</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.call() }} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <AntDesign name='customerservice' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}>Call  Customer Support</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.logoutUser()} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <Entypo name='log-out' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}> Logout</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View>
                        {!this.props.isSiteList ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('PlantReport')} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                                <Entypo name='info-with-circle' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                                <Text style={styles.menuFont}> Plant Report/Site Info</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {!this.props.isSiteList ?
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('AlarmScreenHistory', { view: 'history' })} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                                {<MaterialIcons name='access-alarm' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />}
                                <Text style={styles.menuFont}>Alarm History </Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('ContactUs')} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <MaterialIcons name='edit' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}>Contact Us</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.call() }} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <AntDesign name='customerservice' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}>Call  Customer Support</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.logoutUser()} style={{ flexDirection: 'row', paddingTop: 6, paddingBottom: 6 }}>
                            <Entypo name='log-out' size={25} style={{ paddingTop: 9, paddingLeft: 16, color: 'gray' }} />
                            <Text style={styles.menuFont}> Logout</Text>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        );

    }

    async logoutUser() {
        await AsyncStorage.clear();
        this.props.navigation.navigate('LoginScreen', { isViewingUser: true });
    }
    closeDrawer = () => {
        this.setState({
            hideMenu: this.state.hideMenu
        });
    };
}
const styles = StyleSheet.create({
    menuFont: {
        fontSize: 15,
        color: 'gray',
        fontWeight: 'bold',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 12,
        justifyContent: 'space-between'

    },
});
export default withNavigation(SideBarMenu)
import React from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet, Dimensions, AsyncStorage } from 'react-native';
import CommonView from '../components/CommonView';
import { APP_GREEN, APP_ACTIVE_ORANGE, APP_GREY } from '../constants/ColorMaster';
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { MaterialIcons } from '@expo/vector-icons';


/*....................................................Class to View Notification Screen...................................................... */

export default class NotificationScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            notification: {},
            notifs: [],
            notsAvailable: false
        }
        this.props.navigation.addListener(
            'didFocus',
            async () => {
                this.setState({ isLoading: false });
                if (await AsyncStorage.getItem('notificationList')) {
                    this.setState({ notsAvailable: true });
                    const nots = JSON.parse(await AsyncStorage.getItem('notificationList'));
                    nots.reverse();
                    nots.splice(30, (nots.length - 1));
                    this.setState({ notifs: nots });
                } else {
                    this.setState({ notsAvailable: false, notifs: [] })
                }
            }
        );
    }

    /*.................................................... Delete Old Notifications...................................................... */

    async deleteNotification(key) {
        arr = this.state.notifs;
        arr.splice(key, 1);
        await AsyncStorage.setItem('notificationList', JSON.stringify(arr));
        this.setState({ notifs: arr });
    }

    async clearNotifications() {
        await AsyncStorage.setItem('notificationList', '');
        this.setState({ notsAvailable: false, notifs: [] })
    }

    /*....................................................Register for Notifications...................................................... */

    registerForPushNotificationsAsync = async () => {
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(
                Permissions.NOTIFICATIONS
            );
            await Permissions.getAsync(
                Permissions.NOTIFICATIONS
            );
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Permissions.askAsync(
                    Permissions.NOTIFICATIONS
                );
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Allow Notifications to receive updates.');
                return;
            }
            console.log(await Notifications.getExpoPushTokenAsync());
        } else {
            alert('Must use physical device for Push Notifications');
        }
    };

    /*.................................................... Component mount...................................................... */

    componentDidMount() {
        this.registerForPushNotificationsAsync();
    }

    /*.................................................... Notification Screen View...................................................... */

    render() {
        return (
            <CommonView menuText={'Notifications'}>
                {this.state.isLoading ?
                    <View style={{ flex: 1, minHeight: Dimensions.get('window').height - 60, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color={APP_GREEN} />
                    </View>
                    :
                    <ScrollView>
                        {this.state.notsAvailable ?
                            <View style={{ padding: 10 }}>
                                <View style={{alignItems: 'flex-end', marginBottom: 10}}>
                                    <TouchableOpacity onPress={() => { this.clearNotifications() }} style={{ width: 30, height: 30, padding: 5 }}>
                                        <MaterialIcons name="clear-all" size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>
                                {this.state.notifs.map((item, key) => (
                                    <View key={key} style={styles.notificationTab}>
                                        <View style={{ width: '90%' }}>
                                            <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={styles.notificationDescription} numberOfLines={2}>{item.description}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => { this.deleteNotification(key) }} style={{ width: 30, height: 30, padding: 5 }}>
                                            <MaterialIcons name="delete" size={20} color="gray" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            :
                            <View style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: APP_ACTIVE_ORANGE }}>No new notifications.</Text>
                            </View>

                        }
                    </ScrollView>
                }
            </CommonView>
        );
    }
}


/*.................................................... Styles...................................................... */

const styles = StyleSheet.create({
    notificationTab: {
        backgroundColor: '#f2f2f2',
        borderRadius: 5,
        marginBottom: 10,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    activeNotificationTab: {
        backgroundColor: '#14a02825'
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: APP_GREY
    },
    notificationDescription: {
        fontSize: 12,
        color: APP_GREY
    }
})
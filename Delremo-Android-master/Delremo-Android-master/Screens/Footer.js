import React from 'react';
import {View,StyleSheet} from 'react-native';
import { FontAwesome,Foundation } from '@expo/vector-icons';
console.disableYellowBox = true;

class Footer extends React.Component {
  constructor(props){
    super(props);
      this.state ={ 
          comStatus:[]
      };


  }
render(){
  return(
<View >
    <View>
        <FontAwesome name="home" size={20} style={{color:'#fff'}}/>
    </View>
    <View>
       <FontAwesome name="list" size={20} style={{color:'#fff'}}/>
    </View>
    <View>
        <FontAwesome name="dashboard" size={20} style={{color:'#fff'}}/>,
    </View>
     <View>
         <Foundation name="graph-bar" size={20} style={{color:'#fff'}}/>,
    </View>  
</View>
  );
}

}
export default Footer;


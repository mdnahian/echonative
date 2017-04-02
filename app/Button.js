import React, { Component } from 'react';

import {
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  TouchableNativeFeedback,
} from 'react-native';

import { create } from 'react-native-platform-stylesheet';

const IOS_BLUE = '#007AFF';
const MATERIAL_BLUE = '#2196F3';

const styles = create({
  button: {
    padding: 20,
    margin: 10,
    width: 200,
    // alignItems: 'center',
    justifyContent: 'center'
  },
  buttonRaised: {
    borderRadius: 2,
    ios: {
      backgroundColor: IOS_BLUE,
    },
    android: {
      backgroundColor: MATERIAL_BLUE,
      elevation: 3,
    },
  },
  buttonFlat: {
  },
  buttonLabel: {
    // position: 'absolute',
    textAlign: 'center',
    android: {
      fontWeight: 'bold',
    },
  },
  buttonLabelRaised: {
    color: '#FFFFFF',
  },
  buttonLabelFlat: {
    ios: {
      color: IOS_BLUE,
    },
    android: {
      color: MATERIAL_BLUE,
    },
  },
});

const ButtonWrapper = ({ raised, onPress, children, style}) => {
  return (
    <TouchableNativeFeedback
      onPress={onPress}
      background={TouchableNativeFeedback.Ripple('#FFF')}
    >
      <View style={[styles.button, styles.buttonRaised, style]}>
        {children}
      </View>
    </TouchableNativeFeedback>
  );

};

class Button extends Component {
  constructor(props) {
    super(props);
    
    this.renderLabel.bind(this);
  }
  renderLabel() {
    const labelStyles = [styles.buttonLabel];
    if (this.props.raised) {
      labelStyles.push(styles.buttonLabelRaised);
    } else {
      labelStyles.push(styles.buttonLabelFlat);
    }

    let labelText = this.props.label;
    if (Platform.OS === 'android') {
      labelText = labelText.toUpperCase();
    }

    return <Text style={labelStyles}>{labelText}</Text>;
  }

  render() {
    return (
      <ButtonWrapper {...this.props}>
        {this.renderLabel()}
      </ButtonWrapper>
    );
  }
}

export default Button;
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image, 
  View,
  TouchableHighlight,
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';

import Button from './Button';

import NavigationBar from 'react-native-navbar';

import update from 'immutability-helper';

import SocketIOClient from 'socket.io-client';

import validStyle from './validStyle';
//text, image, button, textInput

import Tooltip from './tooltip';

 let i = 0;

 const baseStyle = {
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  tooltip: {
    backgroundColor: 'black',
    zIndex: 100,
    borderRadius: 5,
    borderBottomLeftRadius: 0,
    position: 'absolute'
  },
  tooltipName: {
    color: 'white',
    fontSize: 10,
    fontWeight: "400",
    paddingLeft: 13,
    paddingRight: 13,
    paddingTop: 6, 
    paddingBottom: 6
  },
  triangle: {
    backgroundColor: 'white',
    height: 10,
    width: 60,
    borderTopLeftRadius: 30
  }
}


export default class alexanative extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltips: false,
      tooltipX: 0,
      tooltipY: 0,
      tooltipLabel: 'Tooltip',
      tree: [

      ],
      styles: {
        container: {
          flex: 1,
          alignItems: 'center',
          backgroundColor: '#F5FCFF',
        },
        tooltip: {
          backgroundColor: 'black',
          zIndex: 100,
          borderRadius: 5,
          borderBottomLeftRadius: 0,
          position: 'absolute'
        },
        tooltipName: {
          color: 'white',
          fontSize: 10,
          fontWeight: "400",
          paddingLeft: 13,
          paddingRight: 13,
          paddingTop: 6, 
          paddingBottom: 6
        },
        triangle: {
          backgroundColor: 'white',
          height: 10,
          width: 60,
          borderTopLeftRadius: 30
        },
        page: {}
      },

    }
    // this.socket = SocketIOClient('https://echonative.com/');
    this.socket = SocketIOClient('https://e7dd5d72.ngrok.io');
    // this.socket = SocketIOClient('http://8cd841fe.ngrok.io');
    this.socket.on('add', this.add.bind(this));
    // this.socket.on('put', this.put.bind(this));
    this.socket.on('set', this.set.bind(this));
    this.socket.on('destroy', this.destroy.bind(this));

    this.socket.on('')
    
    this._render.bind(this);
    this.tooltip.bind(this);
  }

  add(node) {
    console.log("ADD", node);
    // console.log(JSON.parse(node).type)
    const parsedNode = JSON.parse(node);
    this.setState({
      tree: [...this.state.tree, parsedNode], 
      styles: {...this.state.styles, [parsedNode.className]: {}}
    });

  }

  // expect (className, property, value
  set(changes) {
    const {className, property, value} = JSON.parse(changes);
    console.log("SET", changes);


    if (className === 'page') {

      const newState = update(this.state, {
        styles: {
          page: {
            [property]: {
              $set: value
            }
          }
        }
      })

      this.setState(newState);
      return;
    }

    const node = findNode(className, this.state.tree); 
    // console.log(node);
    if (node == null) {
      console.warn("Invalid Node", className);
      return;
    }

    const index = this.state.tree.indexOf(node); // TODO: ASSUMES NO NESTING
    // console.log(node.type)
    switch (node.type) {
      case 'text': {
        let newState = null;
        // Change "text" of text component
        if (property === 'text') {
          // console.log("TEXT");
          newState = update(this.state, {
            tree: {
              $splice: [[index, 1, {...node, value}]]
            }
          })
        }
        else if (!validStyle.includes(property)){
          console.warn("Invalid Style Property: ", property);
          return;
        }
        else {
          // Else assume to be Style changes
          newState = update(this.state, {
            styles: {
              [className]: {
                [property]: {
                  $set: value
                }
              }
            }
          })
        }

        this.setState(newState);
        break;
      }
      case 'image': {
        let newState  = null;
        // Change "source" of image component
        if (property === 'source') {
          newState = update(this.state, {
            tree: {
              $splice: [[index, 1, {...node, value}]]
            }
          })
        }
        else if (!validStyle.includes(property)){
          console.warn("Invalid Style Property: ", property);
          return;
        }
        else {
          // Else assume to be Style changes
          newState = update(this.state, {
            styles: {
              [className]: {
                [property]: {
                  $set: value
                }
              }
            }
          })
        }

        this.setState(newState);
        break;
      }
      case 'button': {
        let newState  = null;
        // Change "title" of button
        if (property === 'text') {
          newState = update(this.state, {
            tree: {
              $splice: [[index, 1, {...node, value}]]
            }
          })
        }
        else if (!validStyle.includes(property)){
          console.warn("Invalid Style Property: ", property);
          return;
        }
        // Else assume to be style changes
        else {
          
          newState = update(this.state, {
            styles: {
              [className]: {
                [property]: {
                  $set: value
                }
              }
            }
          })
        }
        this.setState(newState);
        break;
      }
      case 'input':
      case 'imput': {
        let newState = null;
        // Change value of input
        if (property === 'text') {

          newState = update(this.state, {
            tree: {
              $splice: [[index, 1, {...node, value}]]
            }
          })
        }
        else if (!validStyle.includes(property)){
          console.warn("Invalid Style Property: ", property);
          return;
        }

        // Else assume to be style changes
        else {
           newState = update(this.state, {
            styles: {
              [className]: {
                [property]: {
                  $set: value
                }
              }
            }
          })
        }
        this.setState(newState);
        break;
      }
    }
  }

  destroy(node) {

    console.log("DESTROY", node);
    const {className} = JSON.parse(node);

    if (className == 'all') {
      const newState = {
        tree: [],
        styles: {
          container: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: '#F5FCFF',
          },
          tooltip: {
            backgroundColor: 'black',
            zIndex: 100,
            borderRadius: 5,
            borderBottomLeftRadius: 0,
            position: 'absolute'
          },
          tooltipName: {
            color: 'white',
            fontSize: 10,
            fontWeight: "400",
            paddingLeft: 13,
            paddingRight: 13,
            paddingTop: 6, 
            paddingBottom: 6
          },
          triangle: {
            backgroundColor: 'white',
            height: 10,
            width: 60,
            borderTopLeftRadius: 30
          },
          page: {}
        }
      }
      this.setState(newState);
      return;
    }
    const index = findNode(className, this.state.tree);
    if (index == null) {
      console.warn("Invalid Node: ", className);
      return;
    }

    const newState = update(this.state, {
      tree: {
        $splice: [[index, 1]]
      }
    })
    this.setState(newState);
  }

  _render(node) {

    const styles = StyleSheet.create(this.state.styles);

    switch(node.type) {
      case 'text': {
        return (

            <Text style={styles[node.className]} key={i++}>
              {node.value || 'Text'}
            </Text>
        )
      }
      case 'image': {
        return (
          <Image source={{uri: node.value || 'http://shashgrewal.com/wp-content/uploads/2015/05/default-placeholder.png'}} 
           style={[{ width: 200, height: 200}, styles[node.className]] }
           key={i++}
          />
        )
      }
      case 'button': {

        const defaults = { 
          width: 150, 
          height: 45, 
          borderRadius: 5,
        };

        return (
          <Button raised label={node.value || "Button"} key={i++} style={[defaults, styles[node.className]]}/>
        )
      }
      case 'input':
      case 'imput': {
        let width = null;
        if (this.state.styles[node.className] && this.state.styles[node.className].width)
          width = this.state.styles[node.className].width;
        return (
          <TextInput key={i++}
            placeholder={node.value || 'Text Input'}
            editable={true}
          width={'80%'|| width}
          style={styles[node.className]}
          />

        )
      }
    }
  } 

  tooltip(evt, className) {
    this.setState({
      tooltipX: evt.nativeEvent.pageX,
      tooltipY: evt.nativeEvent.pageY,
      showTooltips: !this.state.showTooltips,
      tooltipLabel: className
    })
  }
  render() {
    const tree = this.state.tree.map(this._render.bind(this));

    const styles = StyleSheet.create(this.state.styles);

    // const pageStyle = StyleSheet.create(this.state.pageStyle);
  
    const { showTooltips, tooltipLabel} = this.state;

    return (
      <View style={[styles.container, styles.page]}>
        {tree}
        <View style={[styles.tooltip, 
          {opacity: showTooltips? 1 : 1, 
           left: this.state.tooltipX, 
           top: this.state.tooltipY - 25}]}>
          <Text style={styles.tooltipName}>{tooltipLabel}</Text>
        </View>
      </View>
    );
  }
}

function none(){
  return;
}

// recursive search for node with name
function findNode(name, tree) {
  if (tree === null || tree === undefined)
    return null;

  let res = null;

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if (node.className === name) {
      return node;
    }
    else if (res !== null) {
      break;
    }
    else {
      res = findNode(name, node.children);
    }
  }


  return res;

}


AppRegistry.registerComponent('alexanative', () => alexanative);

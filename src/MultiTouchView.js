import React, { Component } from 'react';
import {
    View,
    PanResponder,
} from 'react-native';

export default class MultiTouchView extends Component{
    constructor(props) {
        super(props);

        this.state = { active: false };

        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onTouchCancel = this.onTouchCancel.bind(this);
    }

    onTouchStart(event){
        this.setState({ active: true });
        this.props.onPressIn && this.props.onPressIn();
    }
    onTouchEnd(event){
        this.setState({ active: false });
        this.props.onPressOut && this.props.onPressOut();
    }
    onTouchCancel(event){
        this.setState({ active: false });
        this.props.onPressOut && this.props.onPressOut();
    }
    onTouchMove(event){

    }
    render(){
        return (
            <View
                onTouchStart={this.onTouchStart}
                onTouchEnd={this.onTouchEnd}
                onTouchCancel={this.onTouchCancel}
                onTouchMove={this.onTouchMove}
                {...this.props}>
                 {this.props.children}
            </View>
        );
    }
}
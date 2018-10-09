import React from 'react';
import { Tabs, Spin } from 'antd';
import {GEO_OPTIONS, POS_KEY, AUTH_PREFIX, TOKEN_KEY, API_ROOT} from '../constants';
import {Gallery} from "./Gallery"
import $ from 'jquery';
import { CreatePostButton } from "./CreatePostButton"

const TabPane = Tabs.TabPane;

export class Home extends React.Component {

    state = {
        posts: [],
        loadingPosts: false,
        error: '',
        loadingGeoLocation: false,
    }

    componentDidMount() {
        this.setState({loadingGeoLocation: true, error: ''});
        this.getGeoLocation();
    }

    getGeoLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS
            )
        } else {
            this.setState({error: 'Your browser does not support geolocation'});
        }
    }

    onSuccessLoadGeoLocation = (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({latitude, longitude}));
        this.setState({loadingGeoLocation: false, error: ''});
    }

    onFailedLoadGeoLocation = (error) => {
        console.log(error);
        this.setState({loadingGeoLocation: false, error: 'Failed to load geo location'});
    }

    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div> {this.state.error}</div>
        } else if (this.state.loadingGeoLocation) {
            return <Spin tip='Loading geolocation ...' />
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading posts..."/>;
        } else if (this.state.posts != null && this.state.posts.length > 0) {
            return <Gallery images={
                this.state.posts.map(({ user, message, url}) => ({
                    user: user,
                    src: url,
                    thumbnail: url,
                    caption: message,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300
                }))
            } />;
        } else {
            return null;
        }
    }

    loadNearbyPosts = () => {
        this.setState({ loadingPosts: true});
        const { latitude, longitude } = JSON.parse(localStorage.getItem(POS_KEY));

        $.ajax({
            url: `${API_ROOT}/search?lat=${latitude}&lon=${longitude}&range=20`,
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
            }
        }).then((response) => {
            this.setState({ posts: response, loadingPosts: false, error: '' });
            console.log(response);
        },
            (response) => {
                this.setState({error: response.responseText})

            }
            ).catch(
            (error) => console.log(error)
        );
    }
    render() {
        const createPostButton = <CreatePostButton />;
        return (
            <Tabs tabBarExtraContent={createPostButton} className="main-tabs">
                <TabPane tab="Posts" key="1">{this.getGalleryPanelContent()}</TabPane>
                <TabPane tab="Map" key="2">Content of tab 2</TabPane>

            </Tabs>
        );
    }
}

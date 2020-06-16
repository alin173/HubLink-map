/*global google*/
import React from "react";
import _ from "lodash";
import { compose, withProps, lifecycle, withStateHandlers } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  InfoWindow,
  Marker,
} from "react-google-maps";
import { SearchBox } from "react-google-maps/lib/components/places/SearchBox";
import "./Nearby.css";

const googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY;

const MapWithASearchBox = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `455px` }} />,
    mapElement: <div style={{ height: `90%`, width: `60%` }} />,
  }),

  withStateHandlers(
    () => ({
      isOpen: false,
      markerIndex: 0,
    }),
    {
      onToggleOpen: () => (index) => ({
        isOpen: true,
        markerIndex: index,
      }),
    }
  ),

  lifecycle({
    componentDidMount() {
      const refs = {};
      this.setState({
        bounds: null,
        selectOrgs: this.props.selectOrgs,

        markers: [],
        onMapMounted: (ref) => {
          refs.map = ref;
        },
        onBoundsChanged: () => {
          this.setState({
            bounds: refs.map.getBounds(),
            center: refs.map.getCenter(),
          });
        },

        onSearchBoxMounted: (ref) => {
          refs.searchBox = ref;
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces();

          const bounds = new google.maps.LatLngBounds();

          places.forEach((place) => {
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });

          const nextMarkers = places.map((place) => ({
            ...place,
            position: place.geometry.location,
          }));

          const nextCenter = _.get(
            nextMarkers,
            "0.position",
            this.state.center
          );

          this.setState({
            center: nextCenter,
            markers: nextMarkers,
          });
          refs.map.fitBounds(bounds);
        },

        handleSubmit: (value) => {
          this.setState(
            (prevState) => {
              return {
                ...prevState,
                queryString: value,
              };
            },
            () => {
              let element = document.getElementById("testing");
              element.dispatchEvent(new Event("focus"));
              element.dispatchEvent(new Event("keypress", { keyCode: "13" }));
            }
          );
        },
      });
    },
  }),
  withScriptjs,
  withGoogleMap
)((props) => (
  <React.Fragment>
    <div className="row">
      <GoogleMap
        ref={props.onMapMounted}
        defaultZoom={12}
        defaultCenter={props.currentLocation}
        onBoundsChanged={props.onBoundsChanged}
        selectOrgs={props.selectOrgs}
      >
        <Marker
          className="Current location marker"
          position={props.currentLocation}
          icon={
            new window.google.maps.MarkerImage(
              "https://www.pngjoy.com/pngl/101/2112015_marker-circle-map-marker-circle-png-png-download.png",
              null /* size is determined at runtime */,
              null /* origin is 0,0 */,
              null /* anchor is bottom center of the scaled image */,
              new window.google.maps.Size(50, 50),
              new window.google.maps.Point(200, 200)
            )
          }
        ></Marker>
        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={props.onPlacesChanged}
        >
          <>
            <input
              type="select"
              value={props.queryString || undefined}
              placeholder="Customized your placeholder"
              style={{
                boxSizing: `border-box`,
                border: `1px solid transparent`,
                width: `240px`,
                height: `32px`,
                marginTop: `27px`,
                padding: `0 12px`,
                borderRadius: `3px`,
                boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                fontSize: `14px`,
                outline: `none`,
                textOverflow: `ellipses`,
              }}
              id="testing"
            />
          </>
        </SearchBox>
        {props.markers.map((marker, index) => (
          <Marker
            key={index}
            icon={
              new window.google.maps.MarkerImage(
                marker.icon,
                null /* size is determined at runtime */,
                null /* origin is 0,0 */,
                null /* anchor is bottom center of the scaled image */,
                new window.google.maps.Size(20, 20)
              )
            }
            position={marker.position}
            onClick={() => props.onToggleOpen(index)}
          >
            {props.isOpen && props.markerIndex === index && (
              <InfoWindow
                onCloseClick={props.onToggleOpen}
                options={({ disableAutoPan: true }, { maxWidth: 220 })}
              >
                <div>
                  <div>
                    <b>{marker.name}</b>
                  </div>
                  <div>{marker.formatted_address}</div>
                  <div className="businessStatus">
                    status: {marker.business_status}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  </React.Fragment>
));

export default MapWithASearchBox;

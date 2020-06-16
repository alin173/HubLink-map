/*global google*/
import React from "react";
import * as orgService from "../../services/organizationServices";
import "./Nearby.css";
import Map from "./Map";
import Select from "react-select";

class MapContainer extends React.Component {
  state = {
    currentLocation: { lat: 0, lng: 0 },

    orgs: [],
    isFetchingCurrentLocation: true,
    distance: 0,
  };
  componentDidMount = () => {
    this.getOrgsforCurrentUser();
  };

  getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        this.setState(() => {
          var currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          return {
            currentLocation,
            isFetchingCurrentLocation: false,
          };
        });
      });
    } else {
    }
  };

  getOrgsforCurrentUser = () => {
    orgService
      .getOrgsforCurrUser()
      .then(this.onGetOrgSuccess)
      .catch(this.onGetOrgError);
  };

  onGetOrgSuccess = (response) => {
    const orgs = response.items;
    this.setState(
      (prevState) => {
        return {
          ...prevState,
          orgs,
          selectOrgs: orgs.map(this.selectOrgs),
        };
      },
      () => this.getCurrentLocation()
    );
  };

  onGetOrgError = () => {
    this.getCurrentLocation();
  };

  mapOrg = (currentOrg) => (
    <option value={currentOrg.name}>{currentOrg.name}</option>
  );

  selectOrgs = (org) => {
    return { value: org.name, label: org.name };
  };

  handleChange = (value) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        queryString: value,
      };
    });
  };

  render() {
    return (
      <div className="main">
        <div className="container-fluid">
          <div className="page-header row">
            <div className="col-md-9 offset-1">
              <h3>Nearby Organizations</h3>
            </div>
          </div>
        </div>
        <div className="rowContainer">
          <div className="row">
            <div className="col-md-9 offset-1" style={{ marginRight: "-25%" }}>
              {this.state.isFetchingCurrentLocation ? (
                "Loading map..."
              ) : (
                <Map
                  queryString={this.state.queryString}
                  currentLocation={this.state.currentLocation}
                  selectOrgs={this.state.selectOrgs}
                />
              )}
            </div>
            <div className="col-md-3">
              <Select
                style={{ width: "250px" }}
                className="basic-single"
                classNamePrefix="select"
                name="org"
                options={this.state.selectOrgs}
                placeholder="Please select a business"
                onChange={(option) => this.handleChange(option.value)}
              ></Select>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MapContainer;

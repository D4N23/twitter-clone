import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getProfileFollowers } from '../../actions/profileActions';
import { connect } from 'react-redux';
import Loading from '../Loading';

const Followers = ({
  profile: { profile, profiles, loading },
  getProfileFollowers
}) => {
  useEffect(() => {
    getProfileFollowers(profile.user._id);
  }, [getProfileFollowers, profile.user._id]);
  return <>{loading ? <Loading /> : <>{JSON.stringify(profiles)}</>}</>;
};

Followers.propTypes = {
  profile: PropTypes.object.isRequired,
  getProfileFollowers: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  profile: state.profile
});

export default connect(
  mapStateToProps,
  { getProfileFollowers }
)(Followers);

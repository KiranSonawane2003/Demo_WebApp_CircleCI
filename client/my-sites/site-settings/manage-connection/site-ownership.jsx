/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import AuthorSelector from 'blocks/author-selector';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import Gravatar from 'components/gravatar';
import SectionHeader from 'components/section-header';
import QueryJetpackConnection from 'components/data/query-jetpack-connection';
import QueryJetpackUserConnection from 'components/data/query-jetpack-user-connection';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isJetpackSiteConnected from 'state/selectors/is-jetpack-site-connected';
import isJetpackSiteInDevelopmentMode from 'state/selectors/is-jetpack-site-in-development-mode';
import isJetpackUserMaster from 'state/selectors/is-jetpack-user-master';

class SiteOwnership extends Component {
	renderPlaceholder() {
		return (
			<Card className="manage-connection__card site-settings__card is-placeholder">
				<div />
			</Card>
		);
	}

	isUserExcludedFromSelector = user => {
		const { currentUser } = this.props;
		return (
			user.linked_user_ID === false ||
			user.linked_user_ID === currentUser.ID ||
			! includes( user.roles, 'administrator' )
		);
	};

	transformUser( user ) {
		return user.linked_user_info;
	}

	renderCurrentUser() {
		const { currentUser, siteId } = this.props;
		if ( ! currentUser ) {
			return;
		}

		return (
			<AuthorSelector
				siteId={ siteId }
				exclude={ this.isUserExcludedFromSelector }
				transformAuthor={ this.transformUser }
				allowSingleUser
			>
				<div className="manage-connection__user">
					<Gravatar user={ currentUser } size={ 24 } />
					<span className="manage-connection__user-name">{ currentUser.display_name }</span>
				</div>
			</AuthorSelector>
		);
	}

	renderConnectionDetails() {
		const { siteIsConnected, siteIsInDevMode, translate, userIsMaster } = this.props;

		if ( siteIsConnected === false ) {
			return translate( 'The site is not connected.' );
		}

		if ( siteIsInDevMode ) {
			return (
				<FormSettingExplanation>
					{ translate(
						'Your site is in Development Mode, so it can not be connected to WordPress.com.'
					) }
				</FormSettingExplanation>
			);
		}

		return (
			<Fragment>
				{ userIsMaster !== null && (
					<FormSettingExplanation>
						{ userIsMaster
							? translate( "You are the owner of this site's connection to WordPress.com." )
							: translate( "Somebody else owns this site's connection to WordPress.com." ) }
					</FormSettingExplanation>
				) }
				{ userIsMaster && this.renderCurrentUser() }
			</Fragment>
		);
	}

	renderCardContent() {
		const { translate } = this.props;

		return (
			<Card>
				<FormFieldset>
					<FormLegend>{ translate( 'Site owner' ) }</FormLegend>
					{ this.renderConnectionDetails() }
				</FormFieldset>
			</Card>
		);
	}

	render() {
		const { siteId, siteIsConnected, siteIsJetpack, translate } = this.props;

		return (
			<Fragment>
				{ siteIsJetpack && <QueryJetpackConnection siteId={ siteId } /> }
				{ siteIsJetpack && <QueryJetpackUserConnection siteId={ siteId } /> }

				<SectionHeader label={ translate( 'Site ownership' ) } />

				{ siteIsConnected === null ? this.renderPlaceholder() : this.renderCardContent() }
			</Fragment>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		currentUser: getCurrentUser( state ),
		siteId,
		siteIsConnected: isJetpackSiteConnected( state, siteId ),
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteIsInDevMode: isJetpackSiteInDevelopmentMode( state, siteId ),
		userIsMaster: isJetpackUserMaster( state, siteId ),
	};
} )( localize( SiteOwnership ) );

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {InformationOutlineIcon} from '@mattermost/compass-icons/components';

import ExternalLink from 'components/external_link';
import type {Notice} from 'components/system_notice/types';

import {DocLinks} from 'utils/constants';
import * as ServerVersion from 'utils/server_version';
import * as UserAgent from 'utils/user_agent';

// Notices are objects with the following fields:
//  - name - string identifier
//  - adminOnly - set to true if only system admins should see this message
//  - icon - the image to display for the notice icon
//  - title - JSX node to display for the notice title
//  - body - JSX node to display for the notice body
//  - allowForget - boolean to allow forget the notice
//  - show - function that check if we need to show the notice
//
// Order is important! The notices at the top are shown first.

const notices: Notice[] = [   
    {
        name: 'advanced_permissions',
        adminOnly: true,
        title: (
            <FormattedMessage
                id='system_notice.title'
                defaultMessage='Notice from Mattermost'
            />
        ),
        body: (
            <FormattedMessage
                id='system_notice.body.permissions'
                defaultMessage='Some policy and permission System Console settings have moved with the release of <link>advanced permissions</link> into Mattermost Free and Professional.'
                values={{
                    link: (msg: React.ReactNode) => (
                        <ExternalLink
                            href={DocLinks.ONBOARD_ADVANCED_PERMISSIONS}
                            location='system_notices'
                        >
                            {msg}
                        </ExternalLink>
                    ),
                }}
            />
        ),
        allowForget: true,
        show: (serverVersion, config, license) => {
            if (license.IsLicensed === 'false') {
                return false;
            }
            if (config.InstallationDate > new Date(2018, 5, 16, 0, 0, 0, 0).getTime()) {
                return false;
            }
            if (license.IsLicensed === 'true' && license.IssuedAt > new Date(2018, 5, 16, 0, 0, 0, 0).getTime()) {
                return false;
            }
            return true;
        },
    },  
    {
        name: 'ie11_deprecation',
        title: (
            <FormattedMessage
                id='system_notice.title'
                defaultMessage='Notice from Mattermost'
            />
        ),
        allowForget: false,
        body: (
            <FormattedMessage
                id='system_notice.body.ie11_deprecation'
                defaultMessage='Your browser, IE11, will no longer be supported in an upcoming release. <link>Find out how to move to another browser in one simple step</link>.'
                values={{
                    link: (msg: React.ReactNode) => (
                        <ExternalLink
                            href='https://forum.mattermost.com/t/mattermost-is-dropping-support-for-internet-explorer-ie11-in-v5-16/7575'
                            location='system_notices'
                        >
                            {msg}
                        </ExternalLink>
                    ),
                }}
            />
        ),
        show: (serverVersion) => {
            // Don't show the notice after v5.16, show a different notice
            if (ServerVersion.isServerVersionGreaterThanOrEqualTo(serverVersion, '5.16.0')) {
                return false;
            }

            // Only show if they're using IE
            if (!UserAgent.isInternetExplorer()) {
                return false;
            }

            return true;
        },
    },
    {

        // This notice is marked as viewed by default for new users on the server.
        // Any change on this notice should be handled also in the server side.
        name: 'GMasDM',
        allowForget: true,
        title: (
            <FormattedMessage
                id='system_notice.title.gm_as_dm'
                defaultMessage='Updates to Group Messages'
            />
        ),
        icon: (<InformationOutlineIcon/>),
        body: (
            <FormattedMessage
                id='system_noticy.body.gm_as_dm'
                defaultMessage='You will now be notified for all activity in your group messages along with a notification badge for every new message.{br}{br}You can configure this in notification preferences for each group message.'
                values={{br: (<br/>)}}
            />
        ),
        show: (serverVersion, config, license, analytics, currentChannel) => {
            return currentChannel?.type === 'G';
        },
    },
];

export default notices;

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channels @channel_sidebar

import {
    beMuted,
    beRead,
    beUnmuted,
    beUnread,
} from '../../../support/assertions';
import {getAdminAccount} from '../../../support/env';
import {getRandomId, stubClipboard} from '../../../utils';

describe('Sidebar channel menu', () => {
    const sysadmin = getAdminAccount();
    const defaultChannel = 'Default Channel';

    let teamName;
    let userName;

    before(() => {
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            teamName = team.name;
            userName = user.username;

            cy.visit(`/${team.name}/channels/default-channel`);
        });
    });

    it('MM-T3349_1 should be able to mark a channel as read', () => {
        // # Start in Default Channel
        cy.uiGetLHS().within(() => {
            cy.findByText(defaultChannel).should('be.visible');
        });
        cy.get('#channelHeaderTitle').should('contain', defaultChannel);

        // # Save the ID of the Default Channel channel for later
        cy.getCurrentChannelId().as('defaultChannelId');

        // # Switch to the Off Topic channel
        cy.get('#sidebarItem_off-topic').click();
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Have another user send a message in the Default Channel
        cy.get('@defaultChannelId').then((defaultChannelId) => {
            cy.postMessageAs({
                sender: sysadmin,
                message: 'post1',
                channelId: `${defaultChannelId}`,
            });
        });

        // * Verify that the Default Channel channel is now unread
        cy.get('#sidebarItem_default-channel').should(beUnread);

        // # Open the channel menu and select the Mark as Read option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Mark as Read').click();
        });

        // * Verify that the Default Channel channel is now read
        cy.get('#sidebarItem_default-channel').should(beRead);
    });

    it('MM-T3349_2 should be able to favorite/unfavorite a channel', () => {
        // * Verify that the channel starts in the CHANNELS category
        cy.uiGetLhsSection('CHANNELS').findByText(defaultChannel).should('be.visible');

        // # Open the channel menu and select the Favorite option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Favorite').click();
        });

        // * Verify that the channel has moved to the FAVORITES category
        cy.uiGetLhsSection('FAVORITES').findByText(defaultChannel).should('be.visible');

        // # Open the channel menu and select the Unfavorite option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Unfavorite').click();
        });

        // * Verify that the channel has moved back to the CHANNELS category
        cy.uiGetLhsSection('CHANNELS').findByText(defaultChannel).should('be.visible');
    });

    it('MM-T3349_3 should be able to mute/unmute a channel', () => {
        // * Verify that the channel starts unmuted
        cy.get('#sidebarItem_default-channel').should(beUnmuted);

        // # Open the channel menu and select the Mute Channel option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Mute Channel').click();
        });

        // * Verify that the channel is now muted
        cy.get('#sidebarItem_default-channel').should(beMuted);

        // # Open the channel menu and select the Unmute Channel option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Unmute Channel').click();
        });

        // // * Verify that the channel is no longer muted
        cy.get('#sidebarItem_default-channel').should(beUnmuted);
    });

    it('MM-T3349_4 should be able to move channels between categories', () => {
        const categoryName = `new-${getRandomId()}`;

        // * Verify that the channel starts in the CHANNELS category
        cy.uiGetLhsSection('CHANNELS').findByText(defaultChannel).should('be.visible');

        // # Move the channel into a new category
        cy.uiMoveChannelToCategory(defaultChannel, categoryName, true);

        // * Verify that Default Channel has moved into the new category
        cy.uiGetLhsSection(categoryName).findByText(defaultChannel).should('be.visible');
        cy.uiGetLhsSection('CHANNELS').findByText(defaultChannel).should('not.exist');

        // # Move the channel back to Channels
        cy.uiMoveChannelToCategory(defaultChannel, 'Channels');

        // * Verify that Default Channel has moved back to Channels
        cy.uiGetLhsSection(categoryName).findByText(defaultChannel).should('not.exist');
        cy.uiGetLhsSection('CHANNELS').findByText(defaultChannel).should('be.visible');
    });

    it('MM-T3349_5 should be able to copy the channel link', () => {
        stubClipboard().as('clipboard');

        // # Open the channel menu and select the Copy Link option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Copy Link').click();
        });

        // Ensure that the clipboard contents are correct
        cy.get('@clipboard').its('wasCalled').should('eq', true);
        cy.location().then((location) => {
            cy.get('@clipboard').its('contents').should('eq', `${location.origin}/${teamName}/channels/default-channel`);
        });
    });

    it('MM-T3349_6 should be able to open the add other users to the channel', () => {
        // # Open the channel menu and select the Add Members option
        cy.uiGetChannelSidebarMenu(defaultChannel).within(() => {
            cy.findByText('Add Members').click();
        });

        // * Verify that the modal appears and then close it
        cy.get('#addUsersToChannelModal').should('be.visible').findByText('Add people to Default Channel');
        cy.uiClose();
    });

    it('MM-T3350 Mention badge should remain hidden as long as the channel/dm/gm menu is open', () => {
        // # Start in Default Channel
        cy.get('#sidebarItem_default-channel').click();
        cy.get('#channelHeaderTitle').should('contain', defaultChannel);

        // # Save the ID of the Default Channel channel for later
        cy.getCurrentChannelId().as('defaultChannelId');

        // # Switch to the Off Topic channel
        cy.get('#sidebarItem_off-topic').click();
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');

        // # Have another user send a message in the Default Channel
        cy.get('@defaultChannelId').then((defaultChannelId) => {
            cy.postMessageAs({
                sender: sysadmin,
                message: `@${userName} post1`,
                channelId: `${defaultChannelId}`,
            });
        });

        // * Verify that a mention badge appears
        cy.get('#sidebarItem_default-channel .badge').should('be.visible');

        // # Open the channel menu
        cy.get('#sidebarItem_default-channel').find('.SidebarMenu_menuButton').click({force: true});

        // * Verify that the mention badge disappears
        cy.get('#sidebarItem_default-channel .badge').should('not.be.visible');
    });
});

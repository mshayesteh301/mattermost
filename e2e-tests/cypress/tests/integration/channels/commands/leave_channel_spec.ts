// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @commands

import * as TIMEOUTS from '../../../fixtures/timeouts';

describe('Leave Channel Command', () => {
    let testChannel;

    before(() => {
        // # Login as test user and go to default-channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testChannel = channel;
            cy.visit(`/${team.name}/channels/default-channel`);
            cy.get('#channelHeaderTitle').should('be.visible').and('contain', 'Default Channel');
        });
    });

    it('Should be redirected to last channel when user leaves channel with /leave command', () => {
        // # Go to newly created channel
        cy.get('#sidebarItem_' + testChannel.name).click({force: true});

        cy.findAllByTestId('postView').last().scrollIntoView().should('be.visible');

        // # Post /leave command in center channel
        cy.postMessage('/leave ');
        cy.wait(TIMEOUTS.TWO_SEC);

        // * Assert that user is redirected to defaultchannel
        cy.url().should('include', '/channels/default-channel');
        cy.get('#channelHeaderTitle').should('be.visible').and('contain', 'Default Channel');
    });
});

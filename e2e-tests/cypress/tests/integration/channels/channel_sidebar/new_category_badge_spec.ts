// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @channel_sidebar

import {getRandomId} from '../../../utils';

describe('New category badge', () => {
    before(() => {
        // # Login as test user and visit default-channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/default-channel`);
        });
    });

    it('MM-T3312 should show the new badge until a channel is added to the category', () => {
        const categoryName = `new-${getRandomId()}`;

        // # Create a new category
        cy.uiCreateSidebarCategory(categoryName).as('newCategory');

        cy.contains('.SidebarChannelGroup', categoryName, {matchCase: false}).within(() => {
            // * Verify that the new category has been added to the sidebar and that it has the required badge and drop target
            cy.get('.SidebarCategory_newLabel').should('be.visible');
            cy.get('.SidebarCategory_newDropBox').should('be.visible');
        });

        // # Move Default Channel into the new category
        cy.uiMoveChannelToCategory('Default Channel', categoryName);

        cy.contains('.SidebarChannelGroup', categoryName, {matchCase: false}).within(() => {
            // * Verify that the new category badge and drop target have been removed
            cy.get('.SidebarCategory_newLabel').should('not.exist');
            cy.get('.SidebarCategory_newDropBox').should('not.exist');
        });

        // # Move Default Channel out of the new category
        cy.uiMoveChannelToCategory('Default Channel', 'Channels');

        cy.contains('.SidebarChannelGroup', categoryName, {matchCase: false}).within(() => {
            // * Verify that Default Channel has moved out of the new category
            cy.get('#sidebarItem_default-channel').should('not.exist');

            // * Verify that the new category badge and drop target did not reappear
            cy.get('.SidebarCategory_newLabel').should('not.exist');
            cy.get('.SidebarCategory_newDropBox').should('not.exist');
        });
    });
});

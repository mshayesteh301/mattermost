// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EmojiMap from 'utils/emoji_map';
import {TestHelper as TH} from 'utils/test_helper';
import * as TextFormatting from 'utils/text_formatting';
const emojiMap = new EmojiMap(new Map());

describe('TextFormatting.ChannelLinks', () => {
    test('Not channel links', () => {
        expect(
            TextFormatting.formatText('~123', {}, emojiMap).trim(),
        ).toBe(
            '<p>~123</p>',
        );

        expect(
            TextFormatting.formatText('~default-channel', {}, emojiMap).trim(),
        ).toBe(
            '<p>~default-channel</p>',
        );
    });

    describe('Channel links', () => {
        afterEach(() => {
            delete (window as any).basename;
        });

        test('should link ~default-channel', () => {
            expect(
                TextFormatting.formatText('~default-channel', {
                    channelNamesMap: {'default-channel': 'Default Channel'},
                    team: TH.getTeamMock({name: 'myteam'}),
                }, emojiMap).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/myteam/channels/default-channel" data-channel-mention="default-channel">~Default Channel</a></p>',
            );
        });

        test('should link ~default-channel followed by a period', () => {
            expect(
                TextFormatting.formatText('~default-channel.', {
                    channelNamesMap: {'default-channel': 'Default Channel'},
                    team: TH.getTeamMock({name: 'myteam'}),
                }, emojiMap).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/myteam/channels/default-channel" data-channel-mention="default-channel">~Default Channel</a>.</p>',
            );
        });

        test('should link ~default-channel, with display_name an HTML string', () => {
            expect(
                TextFormatting.formatText('~default-channel', {
                    channelNamesMap: {'default-channel': '<b>Reception</b>'},
                    team: TH.getTeamMock({name: 'myteam'}),
                }, emojiMap).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/myteam/channels/default-channel" data-channel-mention="default-channel">~&lt;b&gt;Reception&lt;/b&gt;</a></p>',
            );
        });

        test('should link ~default-channel, with a basename defined', () => {
            window.basename = '/subpath';
            expect(
                TextFormatting.formatText('~default-channel', {
                    channelNamesMap: {'default-channel': '<b>Reception</b>'},
                    team: TH.getTeamMock({name: 'myteam'}),
                }, emojiMap).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/subpath/myteam/channels/default-channel" data-channel-mention="default-channel">~&lt;b&gt;Reception&lt;/b&gt;</a></p>',
            );
        });

        test('should link in brackets', () => {
            expect(
                TextFormatting.formatText('(~default-channel)', {
                    channelNamesMap: {'default-channel': 'Default Channel'},
                    team: TH.getTeamMock({name: 'myteam'}),
                }, emojiMap).trim(),
            ).toBe(
                '<p>(<a class="mention-link" href="/myteam/channels/default-channel" data-channel-mention="default-channel">~Default Channel</a>)</p>',
            );
        });
    });

    describe('invalid channel links', () => {
        test('should not link when a ~ is in the middle of a word', () => {
            expect(
                TextFormatting.formatText('aa~default-channel', {
                    channelNamesMap: {'default-channel': 'Default Channel'},
                    team: TH.getTeamMock({name: 'myteam'}),
                }, emojiMap).trim(),
            ).toBe(
                '<p>aa~default-channel</p>',
            );
        });
    });
});

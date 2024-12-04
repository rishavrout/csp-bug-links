/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    DocumentLink,
    ExtensionContext,
    languages,
    Position,
    TextDocument,
    Uri,
} from 'vscode';

const REGEX_PATTERNS = [
    /TODO\(CSP-(?<id>\d+)\)/gi, // TODO(CSP-###)
    /go\/vjira\/CSP-(?<id>\d+)/gi, // go/vjira/CSP-###
    /TODO\(ONEVERILY-(?<id>\d+)\)/gi, // TODO(ONEVERILY-###)
    /go\/vjira\/ONEVERILY-(?<id>\d+)/gi, // go/vjira/ONEVERILY-###
    /TODO\(PHP-(?<id>\d+)\)/gi, // TODO(PHP-###)
    /go\/vjira\/PHP-(?<id>\d+)/gi, // go/vjira/PHP-###
];
export function activate(_: ExtensionContext) {
    languages.registerDocumentLinkProvider('*', {
        provideDocumentLinks(document: TextDocument): DocumentLink[] {
            return REGEX_PATTERNS.flatMap((regexPattern, idx) => {
                const matches = getMatchedRanges(regexPattern, document);
                return matches.map(match => {
                    if (idx >= 4) {
                        // For PHP, we need to use a different link
                        const documentLink = new DocumentLink(
                            match.range,
                            Uri.parse(
                                `https://verily.atlassian.net/browse/PHP-${match.issueId}`,
                                true
                            )
                        );
                        documentLink.tooltip = `Open PHP-${match.issueId} in Jira`;
                        return documentLink;
                    }
                    const documentLink = new DocumentLink(
                        match.range,
                        Uri.parse(
                            `https://verily.atlassian.net/browse/ONEVERILY-${match.issueId}`,
                            true
                        )
                    );
                    documentLink.tooltip = `Open ONEVERILY-${match.issueId} in Jira`;
                    return documentLink;
                });
            });
        },
    });
}

function getMatchedRanges(regexToMatch: RegExp, document: TextDocument) {
    const allMatches = [];
    const textToSearch = document.getText();
    let matches: RegExpExecArray | null;
    while ((matches = regexToMatch.exec(textToSearch)) !== null) {
        const issueId = Number(matches?.groups?.id);
        const line = document.lineAt(document.positionAt(matches.index).line);

        const indexOf = line.text.indexOf(matches[0]);
        const position = new Position(line.lineNumber, indexOf);
        const range = document.getWordRangeAtPosition(
            position,
            new RegExp(regexToMatch)
        );
        if (!range) {
            continue;
        }
        allMatches.push({range, issueId});
    }
    return allMatches;
}

export function deactivate() {}

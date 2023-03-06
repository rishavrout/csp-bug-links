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
];
export function activate(_: ExtensionContext) {
    languages.registerDocumentLinkProvider('*', {
        provideDocumentLinks(document: TextDocument): DocumentLink[] {
            return REGEX_PATTERNS.flatMap(regexPattern => {
                const matches = getMatchedRanges(regexPattern, document);
                return matches.map(match => {
                    const documentLink = new DocumentLink(
                        match.range,
                        Uri.parse(
                            `https://verily.atlassian.net/browse/CSP-${match.issueId}`,
                            true
                        )
                    );
                    documentLink.tooltip = `Open CSP-${match.issueId} in Jira`;
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

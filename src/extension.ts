// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

const JIRA_URL = 'https://verily.atlassian.net/browse';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerHoverProvider("*", {
			async provideHover(document, position, token) {
				const range = document.getWordRangeAtPosition(position, /TODO\(CSP-\d+\)/);
				if (range === undefined) {
					return null;
				}
				const issueId = document.getText(range).substring(5, range.end.character - range.start.character - 1);

				const viewLink = constructUrl(issueId)

				return new vscode.Hover(
						[
							viewLink,
						],
						range);
				}
			}
		)
	);

	context.subscriptions.push(
		vscode.languages.registerHoverProvider("*", {
			async provideHover(document, position, token) {
				const range = document.getWordRangeAtPosition(position, /go\/vjira\/CSP-\d+/);
				if (range === undefined) {
					return null;
				}
				const issueId = document.getText(range).substring(9);

				const viewLink = constructUrl(issueId)

				return new vscode.Hover(
						[
							viewLink,
						],
						range);
				}
			}
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function constructUrl(issueId: string): vscode.MarkdownString {
	const viewLink = new vscode.MarkdownString(
		`[Open ${issueId} in Jira](${JIRA_URL}/${issueId})`);
	viewLink.isTrusted = true;
	return viewLink;
}

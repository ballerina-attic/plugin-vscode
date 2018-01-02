const { workspace, ExtensionContext } = require('vscode');
const { LanguageClient, LanguageClientOptions, ServerOptions } = require('vscode-languageclient');
const path = require('path');

exports.activate = function(context) {
	// The server is implemented in java
	let serverModule = context.asAbsolutePath(path.join('server-build', 'langserver.jar'));
    
	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions = {
		run: { command: 'java', args: ['-jar', serverModule] },
		debug: {
			command: 'java', 
			args: [
				'-jar',
				'-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=5005,quiet=y',
				serverModule,
			],
		},
	}
	// Options to control the language client
	let clientOptions = {
		documentSelector: [{ scheme: 'file', language: 'ballerina' }],
	}

	const forceDebug = (process.env.LSDEBUG === "true");

	if (process.env.VERBOSE !== "true") {
		// If we're not in debug mode, drop all the output sent from the language server
		// At the moment the only output sent from the language server are errors printed to the standard error
		// These errors only distracts the user of the plugin as they are only useful for language-server developers
		// If you want to see the output run with,
		// `VERBOSE=true code --extensionDevelopmentPath=/home/aruna/projects/ballerina/plugin-vscode`
		clientOptions.outputChannel = dropOutputChannel;
	}

	let disposable = new LanguageClient('ballerina-vscode', 'Ballerina vscode lanugage client',
		serverOptions, clientOptions, forceDebug).start();

	// Push the disposable to the context's subscriptions so that the 
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}

// This channel ignores(drops) all requests it receives.
// So the user won't see any output sent through this channel
const dropOutputChannel = {
	name: 'dropOutputChannel',
	append: () => {},
	appendLine: () => {},
	clear: () => {},
	show: () => {},
	show: () => {},
	hide: () => {},
	dispose: () => {},
}

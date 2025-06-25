async invoke(
    options: vscode.LanguageModelToolInvocationOptions<ITabCountParameters>,
    _token: vscode.CancellationToken
) {
    const params = options.input;
    if (typeof params.tabGroup === 'number') {
        const group = vscode.window.tabGroups.all[Math.max(params.tabGroup - 1, 0)];
        const nth =
            params.tabGroup === 1
                ? '1st'
                : params.tabGroup === 2
                    ? '2nd'
                    : params.tabGroup === 3
                        ? '3rd'
                        : `${params.tabGroup}th`;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`There are ${group.tabs.length} tabs open in the ${nth} tab group.`)]);
    } else {
        const group = vscode.window.tabGroups.activeTabGroup;
        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(`There are ${group.tabs.length} tabs open.`)]);
    }
}

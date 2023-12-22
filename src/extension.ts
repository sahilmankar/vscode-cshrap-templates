
import * as vscode from 'vscode';
import { createFile, getFileContent, getFileName, getNamespace, getSelectedTemplate, getTemplateContent } from "./helpers";

export const extensionChannel = vscode.window.createOutputChannel("csharp-templates");

export function activate(context: vscode.ExtensionContext) {

	
	console.log('Congratulations, your extension "csharp-templates" is now active!');

	let disposable = vscode.commands.registerCommand(
		"csharp-templates.addFile",
		async (currentFolder:vscode.Uri) => {
	
		  try {
		  const fpath = currentFolder.fsPath;
		 
		  if (!fpath) {
			vscode.window.showErrorMessage("Error getting folder path.");
			throw new Error("Error getting folder path.");
		  }
		  const folderPath = currentFolder.fsPath;
		  // it is started early to not delay while finding namespace
		  const namespcenamePromise = getNamespace(currentFolder, folderPath);
		  const selectedTemplate = await getSelectedTemplate();
		  const fileName = await getFileName();
		  const namespcename= await namespcenamePromise;
		  const templateContent = await getTemplateContent(selectedTemplate);
		  const fileContent = getFileContent(namespcename, fileName, templateContent);
		  await createFile(folderPath, fileName, fileContent);
		
		}catch(error:any){
		  extensionChannel.appendLine(error);
		}
	  });
	

	context.subscriptions.push(disposable);
}

export function deactivate() {}

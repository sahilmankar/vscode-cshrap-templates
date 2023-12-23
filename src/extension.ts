import * as vscode from "vscode";
import {
  createFile,
  getFileContent,
  getFileName,
  getFolderPathFromActiveFile,
  getNamespace,
  getSelectedTemplate,
  getTemplateContent,
} from "./helpers";


export const extensionChannel =
  vscode.window.createOutputChannel("csharp-templates");

export function activate(context: vscode.ExtensionContext) {
 
  let disposable = vscode.commands.registerCommand(
    "csharp-templates.addFile",
    async (currentFolder: vscode.Uri) => {
      try {
        if (currentFolder == undefined) {
          currentFolder = await getFolderPathFromActiveFile();
        }
        const namespcenamePromise = getNamespace(currentFolder);
        const selectedTemplate = await getSelectedTemplate();
        let fileName = await getFileName();
        if(selectedTemplate=="Controller"){
          if(!fileName.endsWith("Controller" ))
          fileName=fileName.concat("Controller")
        }
        const namespcename = await namespcenamePromise;
        const templateContent = await getTemplateContent(selectedTemplate);
        const fileContent = getFileContent(namespcename,fileName,templateContent );
        await createFile(currentFolder, fileName, fileContent);
      } catch (error: any) {
        extensionChannel.appendLine(error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

import { Uri } from "vscode";
import * as vscode from "vscode";
import * as fs from "fs";
import path from "path";
import { templates } from "./templates";
import { extensionChannel } from "./extension";

export async function getFolderPathFromActiveFile(){
    const activeTextEditor = vscode.window.activeTextEditor;
			if (activeTextEditor) {
			  const activeFileUri = activeTextEditor.document.uri;
        const activeFileDirectoryUri = vscode.Uri.file(path.dirname(activeFileUri.fsPath));
        return activeFileDirectoryUri;
      }
    vscode.window.showErrorMessage("Unable to find folderpath")
    throw new Error("Unable to find folderpath")
}

export async function getSelectedTemplate(): Promise<string> {
  const selectedTemplate = await showPicker();
  extensionChannel.appendLine(`Selected Template ${selectedTemplate}`);
  return selectedTemplate;
}

export async function showPicker(): Promise<string> {
  const quickPickItems: vscode.QuickPickItem[] = [];
  templates.forEach((template) => {
    quickPickItems.push({
      label: template.templateName,
      description: template.description,
    });
  });

  const selectedOption = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: "Select an option",
    matchOnDescription: true,
    canPickMany: false,
  });

  if (!selectedOption) {
    throw new Error("No option selected.");
  }

  return selectedOption.label;
}

export async function getFileName(): Promise<string> {
  let fileName = await vscode.window.showInputBox({
    prompt: "Enter file name",
  });
  if (!fileName || fileName === "" || fileName == undefined) {
    vscode.window.showErrorMessage("Not a Valid Name.");
    throw new Error("Not a Valid Name.");
  }
  fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
  extensionChannel.appendLine(`File name : ${fileName}`);
  return fileName;
}

export async function getNamespace(folder: vscode.Uri): Promise<string | null> {
  const file = await getNeighborFilesWithExtension(folder, "cs");
  if (file != null) {
    const namespace = await getNamespaceFromfile(file);
    extensionChannel.appendLine(`namespace found in neighbour file -${namespace}`);
    return namespace;
  }
 return buildNamespaceFromPath(folder,folder.fsPath);

}

export function getExtensionUri(): Uri | null {
  return (
    vscode.extensions.getExtension("sahilmankar.csharp-templates")
      ?.extensionUri ?? null
  );
}

export async function getTemplateContent(
  selectedTemplate: string
): Promise<string> {
  let extensionPath = getExtensionUri();
  if (!extensionPath) {
    throw new Error("Extension path could not be found");
  }
  let template = Uri.joinPath(extensionPath, `templates/${selectedTemplate}`);

  const document = await vscode.workspace.openTextDocument(template);

  return document.getText();
}

export function getFileContent(
  namespcename: string | null,
  fileName: string,
  Templatecontent: string
): string {
  let fileContent: string = "";
  if (namespcename) {
    fileContent += Templatecontent.replace("namespaceName",namespcename).replaceAll("className", fileName);
  } else {
    fileContent += Templatecontent.replace("namespaceName", "").replaceAll("className",fileName);
  }
  return fileContent;
}

export async function createFile(
  folderPath: vscode.Uri,
  fileName: string,
  content: string
): Promise<void> {
  const filePath = path.join(folderPath.fsPath, `${fileName}.cs`);
  if (fs.existsSync(filePath)) {
    vscode.window.showErrorMessage(`File '${fileName}' already exists.`);
  } else {
    const snippetString = new vscode.SnippetString(content);
    fs.writeFileSync(filePath, "");
    const newDocument = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(newDocument);
    await editor.insertSnippet(snippetString);
    extensionChannel.appendLine(`File Created Sucessfully `);
  }
}

export async function getNamespaceFromfile(file: vscode.Uri) {
  const document = await vscode.workspace.openTextDocument(file);

  const fileContent = document.getText();
  const lines: string[] = fileContent.split("\n");

  const namespaceLine: string | undefined = lines.find(
    (line) => line.trim().startsWith("namespace") && line.trim().endsWith(";")
  );

  if (namespaceLine) {
    return namespaceLine.replace("namespace", "").replace(";", "").trim();
  }
  return null;
}
export async function getNeighborFilesWithExtension(
  directory: vscode.Uri,
  extension: string
) {
  const files = await vscode.workspace.fs.readDirectory(directory);


  const filesWithExtension = files.filter(
    ([filename, type]) =>
      type === vscode.FileType.File && filename.endsWith(extension)
  );

  if (!filesWithExtension || filesWithExtension.length < 1) {
    return null;
  }

  const [filename] = filesWithExtension[0];

  return vscode.Uri.joinPath(directory, filename);
}


 export async function buildNamespaceFromPath(folder: vscode.Uri,originalFilePath: string): Promise<string | null> {

  const relativePattern = new vscode.RelativePattern(folder, "*.csproj");

  const uris = await vscode.workspace.findFiles(relativePattern);

  if (uris.length > 0) {
    const filePath = uris[0];
    // from csproj file -> created file path
    const originalFilePathInParent = path.relative(
      filePath.fsPath,
      originalFilePath
    );
    const folderPathForNamespace = originalFilePathInParent
      .replaceAll("..", "")
      .replaceAll(".", "")
      .split(path.sep);

    const projectFileName = path.basename(filePath.fsPath, ".csproj");
    const namespaceName = projectFileName + folderPathForNamespace.join(".");
    extensionChannel.appendLine(`Found namespace ${namespaceName}`);
    return namespaceName;
  }

  // if not found, search in its parent directory
  const directory = path.dirname(folder.fsPath);

  // Check if the directory is the root directory
  const isRootDirectory = path.dirname(directory) === directory;

  if (!isRootDirectory) {
    return buildNamespaceFromPath(vscode.Uri.file(directory), originalFilePath);
  }
  extensionChannel.appendLine("Error Finding namespace .");

  return null; // Terminate the recursion when the root directory is reached
 }